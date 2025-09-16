/**
 * 字帖内容处理器
 * 专门处理字帖模板的容器裁剪和分页逻辑
 */

import { elementToImage } from '@/utils/lib';
import { IContentProcessor, ContentProcessOptions, ContentProcessResult, PageContent } from '@/pages/charsheet/interface';

export class CharsheetProcessor implements IContentProcessor {
  readonly name = 'CharsheetProcessor';

  /**
   * 检测是否支持该元素（包含page-container的字帖元素）
   */
  canProcess(elementId: string): boolean {
    const element = document.getElementById(elementId);
    if (!element) return false;

    // 检测是否包含page-container元素
    const pageContainers = element.querySelectorAll('[id^="page-container-"]');
    return pageContainers.length > 0;
  }

  /**
   * 处理字帖内容，返回分页结果
   */
  async processContent(options: ContentProcessOptions): Promise<ContentProcessResult> {
    const startTime = Date.now();
    const {
      sourceElementId,
      quality = 1.0,
      backgroundColor = '#ffffff',
      scale = 1.0
    } = options;

    try {
      // 获取要处理的元素
      const element = document.getElementById(sourceElementId);
      if (!element) {
        throw new Error(`找不到要处理的元素: ${sourceElementId}`);
      }

      // 生成整页高质量图片
      const imageOptions = {
        imageType: 'png' as 'png',
        quality,
        backgroundColor,
        useCanvg: true
      };

      const fullImageDataUrl = await elementToImage(sourceElementId, imageOptions);
      
      // 创建临时图片元素获取实际尺寸
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = fullImageDataUrl;
      });

      const contentWidth = img.width;
      const contentHeight = img.height;
      
      // 基于规则遍历查找页面容器
      const pageContainers = this.findPageContainers(element);
      console.log(`字帖处理器检测到${pageContainers.length}个页面容器，整页图片尺寸: ${contentWidth}x${contentHeight}`);

      if (pageContainers.length === 0) {
        throw new Error('未找到任何页面容器');
      }

      // 处理每个页面容器
      const pages: PageContent[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建canvas上下文');
      }

      // 设置canvas尺寸并绘制原始图片
      canvas.width = contentWidth;
      canvas.height = contentHeight;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, contentWidth, contentHeight);
      ctx.drawImage(img, 0, 0);

      for (let pageIndex = 0; pageIndex < pageContainers.length; pageIndex++) {
        const currentContainer = pageContainers[pageIndex] as HTMLElement;
        console.log(`正在处理第${pageIndex + 1}页: 容器${currentContainer.id}`);
        
        // 计算容器的精确位置和尺寸
        const dimensions = this.calculateContainerDimensions(
          currentContainer, 
          element, 
          pageIndex, 
          pageContainers.length,
          contentHeight
        );

        // 创建当前页的canvas并裁剪内容
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) continue;

        pageCanvas.width = contentWidth;
        pageCanvas.height = dimensions.height;

        // 填充背景色
        pageCtx.fillStyle = backgroundColor;
        pageCtx.fillRect(0, 0, contentWidth, dimensions.height);

        // 从整页canvas中裁剪当前页内容
        pageCtx.drawImage(
          canvas,
          0, dimensions.startY, contentWidth, dimensions.height,
          0, 0, contentWidth, dimensions.height
        );

        // 转换为dataURL
        const pageDataUrl = pageCanvas.toDataURL('image/png', quality);

        pages.push({
          pageIndex,
          containerId: currentContainer.id,
          dataUrl: pageDataUrl,
          dimensions: {
            width: contentWidth,
            height: dimensions.height,
            startY: dimensions.startY,
            endY: dimensions.endY
          },
          isLastPage: pageIndex === pageContainers.length - 1
        });

        console.log(`第${pageIndex + 1}页处理完成，尺寸: ${contentWidth}x${dimensions.height}`);
      }

      const processingTime = Date.now() - startTime;
      
      return {
        pages,
        fullImage: {
          dataUrl: fullImageDataUrl,
          width: contentWidth,
          height: contentHeight
        },
        stats: {
          totalPages: pages.length,
          totalContainers: pageContainers.length,
          processingTime
        }
      };

    } catch (error) {
      console.error('字帖内容处理失败:', error);
      throw error;
    }
  }

  /**
   * 基于规则遍历查找页面容器
   */
  private findPageContainers(element: HTMLElement): HTMLElement[] {
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
    
    return pageContainers;
  }

  /**
   * 计算容器的精确位置和尺寸
   */
  private calculateContainerDimensions(
    currentContainer: HTMLElement,
    gridElement: HTMLElement,
    pageIndex: number,
    totalPages: number,
    contentHeight: number
  ) {
    // 获取grid-container作为参考点
    const gridContainer = gridElement.querySelector('#grid-container') as HTMLElement;
    if (!gridContainer) {
      throw new Error('找不到grid-container');
    }

    // 获取elementToImage使用的实际像素比（至少2倍）
    const actualPixelRatio = Math.max(window.devicePixelRatio || 1, 2);
    
    // 获取容器的完整尺寸（包括padding、border等）
    const containerStyle = window.getComputedStyle(currentContainer);
    const paddingTop = parseFloat(containerStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(containerStyle.paddingBottom) || 0;
    const borderTop = parseFloat(containerStyle.borderTopWidth) || 0;
    const borderBottom = parseFloat(containerStyle.borderBottomWidth) || 0;
    const marginBottom = parseFloat(containerStyle.marginBottom) || 0;
    
    // 计算容器相对于grid-container的位置
    const gridContainerRect = gridContainer.getBoundingClientRect();
    const containerRect = currentContainer.getBoundingClientRect();
    
    // 相对于grid-container的位置（DOM坐标）
    const relativeTopDOM = containerRect.top - gridContainerRect.top;
    const containerHeightDOM = containerRect.height;
    
    // 添加额外的样式空间到高度计算中
    const extraHeight = paddingTop + paddingBottom + borderTop + borderBottom;
    const totalHeightDOM = containerHeightDOM + (pageIndex === totalPages - 1 ? marginBottom : 0);
    
    console.log(`容器${currentContainer.id}样式信息: padding=${paddingTop}+${paddingBottom}, border=${borderTop}+${borderBottom}, margin-bottom=${marginBottom}, 额外高度=${extraHeight}`);
    
    // 转换为图片坐标系（乘以像素比）
    const relativeTop = relativeTopDOM * actualPixelRatio;
    const containerHeight = totalHeightDOM * actualPixelRatio;
    
    let startY = relativeTop;
    let endY = relativeTop + containerHeight;
    let actualHeight = containerHeight;
    
    console.log(`像素比转换: DOM坐标(${relativeTopDOM.toFixed(1)}, ${totalHeightDOM.toFixed(1)}) -> 图片坐标(${relativeTop.toFixed(1)}, ${containerHeight.toFixed(1)})，像素比=${actualPixelRatio}`);
    
    // 确保不超出整页图片边界，但要考虑容器的padding等样式
    if (endY > contentHeight) {
      console.log(`警告：容器${currentContainer.id}底部超出图片边界，原始endY=${endY.toFixed(1)}, 图片高度=${contentHeight}`);
      // 对于最后一页，尝试包含容器的完整内容（包括padding）
      if (pageIndex === totalPages - 1) {
        console.log(`最后一页特殊处理：保持容器完整高度`);
        // 保持容器的完整高度，不进行裁剪
      } else {
        endY = contentHeight;
        actualHeight = endY - startY;
        console.log(`中间页裁剪：调整endY=${endY.toFixed(1)}, actualHeight=${actualHeight.toFixed(1)}`);
      }
    }
    
    console.log(`容器${currentContainer.id}: 相对grid-container位置=${relativeTop.toFixed(1)}, 高度=${containerHeight.toFixed(1)}, 裁剪区域Y=${startY.toFixed(1)}-${endY.toFixed(1)}`);
    
    return {
      startY,
      endY,
      height: actualHeight
    };
  }
}