/**
 * PDF导出工具
 * 提供将HTML内容导出为PDF文件的功能
 * 支持多页面内容处理、质量控制、背景色设置和调试功能
 * 与内容处理器配合，支持不同模板类型的PDF导出
 */
import { jsPDF } from 'jspdf';
import { processContent } from '@/utils/lib';
import { PDFExportOptions } from '@/pages/charsheet/interface';

// 重新导出PDFExportOptions以保持向后兼容
export { PDFExportOptions } from '@/pages/charsheet/interface';

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
      // 使用内容处理器处理内容
      console.log('开始处理内容...');
      const contentResult = await processContent({
        sourceElementId,
        quality,
        backgroundColor,
        scale: userScale
      });
      
      console.log(`内容处理完成，共${contentResult.pages.length}页，处理时间: ${contentResult.stats.processingTime}ms`);
      
      // 使用处理结果生成PDF
      const pdf = await this.generatePDFFromContent(contentResult, {
        fileName,
        quality,
        backgroundColor,
        scale: userScale
      });
      
      // 保存PDF文件
      pdf.save(fileName);
      console.log(`PDF导出完成: ${fileName}`);
      
    } catch (error: any) {
      console.error('PDF导出失败:', error);
      throw error;
    }
  }

  /**
   * 从内容处理结果生成PDF
   */
  private static async generatePDFFromContent(
    contentResult: any,
    options: {
      fileName: string;
      quality: number;
      backgroundColor: string;
      scale: number;
    }
  ): Promise<jsPDF> {
    const { quality, backgroundColor, scale: userScale } = options;
    const { pages, fullImage } = contentResult;
    
    if (pages.length === 0) {
      throw new Error('没有页面内容可导出');
    }

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
    const contentWidthMm = fullImage.width * pxToMm;
    const contentHeightMm = fullImage.height * pxToMm;
    
    // 计算自动缩放比例，确保内容适合A4宽度
    const autoScale = Math.min(printableWidth / contentWidthMm, 1); // 不放大，只缩小
    // 应用用户指定的额外缩放比例
    const finalScale = autoScale * userScale;
    const scaledWidthMm = contentWidthMm * finalScale;
    const scaledHeightMm = contentHeightMm * finalScale;
    
    console.log(`PDF导出缩放信息: 自动缩放=${autoScale.toFixed(3)}, 用户缩放=${userScale}, 最终缩放=${finalScale.toFixed(3)}`);

    let isFirstPage = true;
    
    // 处理每一页
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      
      // 计算页面图片在PDF中的尺寸
      const imgWidth = scaledWidthMm;
      const imgHeight = page.dimensions.height * pxToMm * finalScale;
      
      // 检查FONT_SCALE缩放对PDF尺寸的影响
      const requiredPageHeight = imgHeight + (margin * 2);
      console.log(`PDF尺寸检查: 容器高度=${imgHeight.toFixed(1)}mm, A4高度=${a4Height}mm, 需要页面高度=${requiredPageHeight.toFixed(1)}mm`);
      
      // 由于FONT_SCALE=2导致内容放大，容器可能超出A4纸尺寸
      // 根据用户要求：不能破坏容器内容，不能截断容器内容
      if (requiredPageHeight > a4Height) {
        console.log(`容器高度${imgHeight.toFixed(1)}mm超过A4纸高度，动态调整PDF页面尺寸为${requiredPageHeight.toFixed(1)}mm`);
        
        // 计算最大合理宽度（保持宽高比）
        const aspectRatio = imgWidth / imgHeight;
        const maxReasonableWidth = Math.min(a4Width, requiredPageHeight * aspectRatio);
        
        console.log(`宽高比=${aspectRatio.toFixed(3)}, 最大合理宽度=${maxReasonableWidth.toFixed(1)}mm`);
        
        // 为当前页面设置自定义尺寸，确保容器内容完整显示
        if (isFirstPage) {
          // 第一页，重新创建PDF文档
          const customPdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [Math.max(a4Width, imgWidth + margin * 2), requiredPageHeight]
          });
          // 替换原PDF对象
          Object.setPrototypeOf(pdf, Object.getPrototypeOf(customPdf));
          Object.assign(pdf, customPdf);
        } else {
          // 后续页面，添加自定义尺寸页面
          pdf.addPage([Math.max(a4Width, imgWidth + margin * 2), requiredPageHeight], 'portrait');
        }
      } else if (!isFirstPage) {
        // 标准A4页面
        pdf.addPage('a4', 'portrait');
      }
      
      // 调试：在新标签页中展示图片内容
      // PDFExportTool.debugShowPageImage(page.dataUrl, page.containerId, pageIndex + 1);
      
      // 添加图片到PDF
      const x = margin;
      const y = margin;
      pdf.addImage(page.dataUrl, 'PNG', x, y, imgWidth, imgHeight);
      
      console.log(`第${pageIndex + 1}页已添加到PDF，尺寸: ${imgWidth.toFixed(1)}x${imgHeight.toFixed(1)}mm，页面高度: ${requiredPageHeight > a4Height ? requiredPageHeight.toFixed(1) : a4Height}mm`);
      
      isFirstPage = false;
    }
    
    return pdf;
  }
}