import { jsPDF } from 'jspdf';
import { elementToImage } from '@/utils';

export interface PDFExportOptions {
  sourceElementId: string;
  fileName?: string;
  quality?: number;
  backgroundColor?: string;
  /**
   * 额外的缩放比例，用于解决内容过大被裁剪的问题
   * 例如：0.5 表示缩放到50%
   * 默认值：1.0（不缩放）
   */
  scale?: number;
}

export class PDFExportTool {
  /**
   * 调试函数：在新标签页中展示图片内容
   */
  static debugShowPageImage(pageDataUrl: string, containerId: string, pageNumber: number): void {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PDF页面调试 - 第${pageNumber}页</title>
          <style>
            body { margin: 20px; font-family: Arial, sans-serif; }
            .info { background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
            .image-container { border: 2px solid #ccc; padding: 10px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="info">
            <h2>PDF页面调试信息</h2>
            <p><strong>页面编号：</strong>第${pageNumber}页</p>
            <p><strong>容器ID：</strong>${containerId}</p>
            <p><strong>图片尺寸：</strong>请查看下方图片</p>
          </div>
          <div class="image-container">
            <h3>页面内容预览：</h3>
            <img src="${pageDataUrl}" alt="第${pageNumber}页内容" />
          </div>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  }

  /**
   * 导出PDF
   */
  static async exportToPDF(options: PDFExportOptions): Promise<void> {
    const {
      sourceElementId,
      fileName = `字帖_${Date.now()}.pdf`,
      quality = 1.0,
      backgroundColor = '#ffffff',
      scale: userScale = 1.0
    } = options;

    try {
      // 获取要导出的元素
      const element = document.getElementById(sourceElementId);
      if (!element) {
        throw new Error('找不到要导出的元素');
      }

      // 生成整页高质量图片（恢复原来的方案）
      const imageOptions = {
        imageType: 'png' as 'png',
        quality,
        backgroundColor,
        useCanvg: true
      };

      const dataUrl = await elementToImage(sourceElementId, imageOptions);
      
      // 创建临时图片元素获取实际尺寸
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      const contentWidth = img.width;
      const contentHeight = img.height;
      
      // 基于规则遍历查找页面容器（避免选择器失效）
      const pageContainers: HTMLElement[] = [];
      let containerIndex = 0;
      
      // 遍历查找所有page-container-${i}
      while (true) {
        const containerId = `page-container-${containerIndex}`;
        const container = element.querySelector(`#${containerId}`) as HTMLElement;
        
        if (container) {
          pageContainers.push(container);
          console.log(`找到容器: ${containerId}, 子元素数量: ${container.children.length}`);
          containerIndex++;
        } else {
          break; // 没有找到更多容器，退出循环
        }
      }
      
      console.log(`通过规则遍历检测到${pageContainers.length}个页面容器，整页图片尺寸: ${contentWidth}x${contentHeight}`);

      // A4纸尺寸 (210 x 297 mm)
      const a4Width = 210;
      const a4Height = 297;
      const margin = 10; // 10mm边距
      const printableWidth = a4Width - (margin * 2);
      const printableHeight = a4Height - (margin * 2);

      // 创建PDF文档
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 像素到毫米的转换系数 (1px = 0.264583mm at 96dpi)
      const pxToMm = 0.264583;
      
      // 计算内容在毫米单位下的原始尺寸
      const contentWidthMm = contentWidth * pxToMm;
      const contentHeightMm = contentHeight * pxToMm;
      
      // 计算自动缩放比例，确保内容适合A4宽度
      const autoScale = Math.min(printableWidth / contentWidthMm, 1); // 不放大，只缩小
      // 应用用户指定的额外缩放比例
      const finalScale = autoScale * userScale;
      const scaledWidthMm = contentWidthMm * finalScale;
      const scaledHeightMm = contentHeightMm * finalScale;
      
      console.log(`PDF导出缩放信息: 自动缩放=${autoScale.toFixed(3)}, 用户缩放=${userScale}, 最终缩放=${finalScale.toFixed(3)}`);

      let pagesNeeded;
      
      if (pageContainers.length > 0) {
        console.log('前3个页面容器的信息:', pageContainers.slice(0, 3).map(container => ({
          id: container.id,
          className: container.className,
          dataPageIndex: container.getAttribute('data-page-index'),
          childrenCount: container.children.length
        })));
      }
      
      if (pageContainers.length > 0) {
          // 基于页面容器数量计算页数
          pagesNeeded = pageContainers.length;
          console.log(`检测到${pageContainers.length}个页面容器，共需${pagesNeeded}页`);
        } else {
          // 回退到基于高度的分页
          pagesNeeded = Math.ceil(scaledHeightMm / printableHeight);
          console.log(`未检测到页面容器，使用高度分页，共需${pagesNeeded}页`);
        }

      // 创建canvas用于分页处理（恢复原来的方案）
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建canvas上下文');
      }

      // 设置canvas尺寸
      canvas.width = contentWidth;
      canvas.height = contentHeight;

      // 绘制原始图片到canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, contentWidth, contentHeight);
      ctx.drawImage(img, 0, 0);
      
      console.log('开始基于容器的精确分页处理...');

      // 基于容器的精确分页：使用DOM位置进行裁剪
      for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        let startY, endY, actualHeight;
        
        if (pageContainers.length > 0 && pageIndex < pageContainers.length) {
          // 基于页面容器的精确分页
          const currentContainer = pageContainers[pageIndex] as HTMLElement;
          console.log(`正在处理第${pageIndex + 1}页: 容器${currentContainer.id}`);
          
          // 获取grid-container作为参考点
          const gridContainer = element.querySelector('#grid-container') as HTMLElement;
          if (!gridContainer) {
            throw new Error('找不到grid-container');
          }
          
          // 计算容器相对于grid-container的位置
          const gridContainerRect = gridContainer.getBoundingClientRect();
          const containerRect = currentContainer.getBoundingClientRect();
          
          // 获取elementToImage使用的实际像素比（至少2倍）
          const actualPixelRatio = Math.max(window.devicePixelRatio || 1, 2);
          
          // 获取容器的完整尺寸（包括padding、border等）
          const containerStyle = window.getComputedStyle(currentContainer);
          const paddingTop = parseFloat(containerStyle.paddingTop) || 0;
          const paddingBottom = parseFloat(containerStyle.paddingBottom) || 0;
          const borderTop = parseFloat(containerStyle.borderTopWidth) || 0;
          const borderBottom = parseFloat(containerStyle.borderBottomWidth) || 0;
          const marginBottom = parseFloat(containerStyle.marginBottom) || 0;
          
          // 相对于grid-container的位置（DOM坐标）
          const relativeTopDOM = containerRect.top - gridContainerRect.top;
          const containerHeightDOM = containerRect.height;
          
          // 添加额外的样式空间到高度计算中
          const extraHeight = paddingTop + paddingBottom + borderTop + borderBottom;
          const totalHeightDOM = containerHeightDOM + (pageIndex === pageContainers.length - 1 ? marginBottom : 0);
          
          console.log(`容器${currentContainer.id}样式信息: padding=${paddingTop}+${paddingBottom}, border=${borderTop}+${borderBottom}, margin-bottom=${marginBottom}, 额外高度=${extraHeight}`);
          
          // 转换为图片坐标系（乘以像素比）
          const relativeTop = relativeTopDOM * actualPixelRatio;
          const containerHeight = totalHeightDOM * actualPixelRatio;
          
          startY = relativeTop;
          endY = relativeTop + containerHeight;
          actualHeight = containerHeight;
          
          console.log(`像素比转换: DOM坐标(${relativeTopDOM.toFixed(1)}, ${containerHeightDOM.toFixed(1)}) -> 图片坐标(${relativeTop.toFixed(1)}, ${containerHeight.toFixed(1)})，像素比=${actualPixelRatio}`);
          
          // 确保不超出整页图片边界，但要考虑容器的padding等样式
          if (endY > contentHeight) {
            console.log(`警告：容器${currentContainer.id}底部超出图片边界，原始endY=${endY.toFixed(1)}, 图片高度=${contentHeight}`);
            // 对于最后一页，尝试包含容器的完整内容（包括padding）
            if (pageIndex === pageContainers.length - 1) {
              console.log(`最后一页特殊处理：保持容器完整高度`);
              // 保持容器的完整高度，不进行裁剪
            } else {
              endY = contentHeight;
              actualHeight = endY - startY;
              console.log(`中间页裁剪：调整endY=${endY.toFixed(1)}, actualHeight=${actualHeight.toFixed(1)}`);
            }
          }
          
          console.log(`容器${currentContainer.id}: 相对grid-container位置=${relativeTop.toFixed(1)}, 高度=${containerHeight.toFixed(1)}, 裁剪区域Y=${startY.toFixed(1)}-${endY.toFixed(1)}`);
        } else {
          // 回退到基于高度的分页
          const pageHeightMm = printableHeight;
          const pageHeightInPx = pageHeightMm / (pxToMm * finalScale);
          startY = pageIndex * pageHeightInPx;
          endY = Math.min(startY + pageHeightInPx, contentHeight);
          actualHeight = endY - startY;
          console.log(`回退分页第${pageIndex + 1}页: Y=${startY}-${endY}`);
        }

        // 创建当前页的canvas
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) continue;

        // 创建页面的宽高
        pageCanvas.width = contentWidth;
        pageCanvas.height = actualHeight;

        // 填充背景色
        pageCtx.fillStyle = backgroundColor;
        pageCtx.fillRect(0, 0, contentWidth, actualHeight);

        // 从整页canvas中裁剪当前页内容
        pageCtx.drawImage(
          canvas,
          0, startY, contentWidth, actualHeight,
          0, 0, contentWidth, actualHeight
        );

        // 转换为dataURL
        const pageDataUrl = pageCanvas.toDataURL('image/png', quality);

        // 计算容器在PDF中的尺寸
        const imgWidth = scaledWidthMm;
        const imgHeight = actualHeight * pxToMm * finalScale;
        
        // 检查是否需要调整PDF页面尺寸以适应容器高度
        const requiredPageHeight = imgHeight + (margin * 2);
        const x = margin;
        const y = margin;
        
        // 如果容器高度超过A4纸高度，动态调整PDF页面尺寸
        // if (requiredPageHeight > a4Height) {
        //   console.log(`容器高度${imgHeight.toFixed(1)}mm超过A4纸高度，动态调整页面尺寸为${requiredPageHeight.toFixed(1)}mm`);
        //   // 为当前页面设置自定义尺寸
        //   if (pageIndex === 0) {
        //     // 第一页，重新创建PDF文档
        //     const customPdf = new jsPDF({
        //       orientation: 'portrait',
        //       unit: 'mm',
        //       format: [a4Width, requiredPageHeight]
        //     });
        //     // 替换原PDF对象
        //     Object.setPrototypeOf(pdf, Object.getPrototypeOf(customPdf));
        //     Object.assign(pdf, customPdf);
        //   } else {
        //     // 后续页面，添加自定义尺寸页面
        //     pdf.addPage([a4Width, requiredPageHeight], 'portrait');
        //   }
        // }

        // 调试：在新标签页中展示图片内容
        // PDFExportTool.debugShowPageImage(pageDataUrl, pageContainers[pageIndex].id, pageIndex + 1);
        
        pdf.addImage(pageDataUrl, 'PNG', x, y, imgWidth, imgHeight);
        console.log(`第${pageIndex + 1}页已添加到PDF，尺寸: ${imgWidth.toFixed(1)}x${imgHeight.toFixed(1)}mm，页面高度: ${requiredPageHeight > a4Height ? requiredPageHeight.toFixed(1) : a4Height}mm`);
      }

      // 保存PDF
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw error;
    }
  }
}