/**
 * 字体渲染工具
 * 提供基于CSS字体的汉字渲染功能，作为hanzi-writer的替代方案
 */

import { IRenderOptions } from '@/pages/charsheet/interface';

export interface IFontRenderOptions extends IRenderOptions {
  renderMode: 'font';
  fontFamily: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontSizeRatio?: number;
  // textColor已移除，统一使用strokeColor作为文字颜色
}

/**
 * 字体渲染器类
 */
export class FontRenderer {
  /**
   * 在指定容器中渲染汉字（字体模式）
   * @param containerId 容器ID
   * @param character 要渲染的汉字
   * @param options 渲染选项
   */
  static renderCharacterWithFont(
    containerId: string,
    character: string,
    options: IFontRenderOptions
  ): void {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`未找到ID为"${containerId}"的容器`);
      return;
    }

    // 清空容器
    container.innerHTML = '';

    // 创建SVG容器
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', options.width.toString());
    svg.setAttribute('height', options.height.toString());
    svg.setAttribute('viewBox', `0 0 ${options.width} ${options.height}`);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style.display = 'block';
    svg.style.width = options.width + 'px';
    svg.style.height = options.height + 'px';
    svg.style.maxWidth = '100%';
    svg.style.maxHeight = '100%';

    // 如果需要米字格背景，先绘制背景
    if (options.useGridBackground) {
      this.addGridBackground(svg, options);
    }

    // 创建文字元素
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    
    // 设置文字位置（居中）
    textElement.setAttribute('x', (options.width / 2).toString());
    textElement.setAttribute('y', (options.height / 2).toString());
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('dominant-baseline', 'central');
    textElement.setAttribute('alignment-baseline', 'central');
    
    // 设置字体样式 - 使用配置的字体大小比例
    // const fontSize = options.fontSize || Math.min(options.width, options.height) * (options.fontSizeRatio || 0.8);
    // const fontSize = options.fontSize || Math.min(options.width, options.height) * 0.8;
    const fontSize =  Math.min(options.width, options.height) *  (options.fontSizeRatio || 0.8);

    textElement.setAttribute('font-size', fontSize.toString());
    textElement.setAttribute('font-family', options.fontFamily);
    
    if (options.fontWeight) {
      textElement.setAttribute('font-weight', options.fontWeight.toString());
    }
    
    if (options.fontStyle) {
      textElement.setAttribute('font-style', options.fontStyle);
    }
    
    // 设置文字颜色（使用strokeColor）
    const textColor = options.strokeColor || '#000000';
    textElement.setAttribute('fill', textColor);
    
    // 设置文字内容
    textElement.textContent = character;
    
    // 添加到SVG
    svg.appendChild(textElement);
    
    // 添加到容器
    container.appendChild(svg);
  }

  /**
   * 添加米字格背景
   */
  private static addGridBackground(
    svg: SVGElement,
    options: IFontRenderOptions
  ): void {
    const { width, height, gridColor = '#DDD' } = options;
    
    // 计算合适的线条宽度，确保在不同尺寸下都清晰可见
    const strokeWidth = Math.max(0.5, Math.min(1, width / 100));
    
    // 使用像素对齐的坐标，避免模糊
    const halfWidth = Math.round(width / 2) + 0.5;
    const halfHeight = Math.round(height / 2) + 0.5;
    
    // 创建背景矩形
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '0.5');
    background.setAttribute('y', '0.5');
    background.setAttribute('width', (width - 1).toString());
    background.setAttribute('height', (height - 1).toString());
    background.setAttribute('fill', 'white');
    background.setAttribute('stroke', gridColor);
    background.setAttribute('stroke-width', strokeWidth.toString());
    background.setAttribute('shape-rendering', 'crispEdges');
    svg.appendChild(background);
    
    // 水平中线
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', '0');
    horizontalLine.setAttribute('y1', halfHeight.toString());
    horizontalLine.setAttribute('x2', width.toString());
    horizontalLine.setAttribute('y2', halfHeight.toString());
    horizontalLine.setAttribute('stroke', gridColor);
    horizontalLine.setAttribute('stroke-width', strokeWidth.toString());
    horizontalLine.setAttribute('shape-rendering', 'crispEdges');
    svg.appendChild(horizontalLine);
    
    // 垂直中线
    const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    verticalLine.setAttribute('x1', halfWidth.toString());
    verticalLine.setAttribute('y1', '0');
    verticalLine.setAttribute('x2', halfWidth.toString());
    verticalLine.setAttribute('y2', height.toString());
    verticalLine.setAttribute('stroke', gridColor);
    verticalLine.setAttribute('stroke-width', strokeWidth.toString());
    verticalLine.setAttribute('shape-rendering', 'crispEdges');
    svg.appendChild(verticalLine);
    
    // 对角线1（左上到右下）
    const diagonal1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    diagonal1.setAttribute('x1', '0');
    diagonal1.setAttribute('y1', '0');
    diagonal1.setAttribute('x2', width.toString());
    diagonal1.setAttribute('y2', height.toString());
    diagonal1.setAttribute('stroke', gridColor);
    diagonal1.setAttribute('stroke-width', strokeWidth.toString());
    diagonal1.setAttribute('shape-rendering', 'crispEdges');
    svg.appendChild(diagonal1);
    
    // 对角线2（右上到左下）
    const diagonal2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    diagonal2.setAttribute('x1', width.toString());
    diagonal2.setAttribute('y1', '0');
    diagonal2.setAttribute('x2', '0');
    diagonal2.setAttribute('y2', height.toString());
    diagonal2.setAttribute('stroke', gridColor);
    diagonal2.setAttribute('stroke-width', strokeWidth.toString());
    diagonal2.setAttribute('shape-rendering', 'crispEdges');
    svg.appendChild(diagonal2);
  }

  /**
   * 创建字体样式字符串
   */
  static createFontStyleString(options: Partial<IFontRenderOptions>): string {
    const parts: string[] = [];
    
    if (options.fontStyle && options.fontStyle !== 'normal') {
      parts.push(options.fontStyle);
    }
    
    if (options.fontWeight && options.fontWeight !== 'normal') {
      parts.push(options.fontWeight.toString());
    }
    
    if (options.fontSize) {
      parts.push(`${options.fontSize}px`);
    }
    
    if (options.fontFamily) {
      parts.push(options.fontFamily);
    }
    
    return parts.join(' ');
  }

  /**
   * 检测字体是否可用
   */
  static async checkFontAvailability(fontFamily: string): Promise<boolean> {
    try {
      // 使用FontFace API检测字体
      if ('fonts' in document) {
        const result = await document.fonts.check(`12px "${fontFamily}"`);
        return result;
      }
      
      // 降级方案：创建临时元素测试
      return this.checkFontByMeasurement(fontFamily);
    } catch (error) {
      console.warn('字体检测失败:', error);
      return false;
    }
  }

  /**
   * 通过测量文字宽度检测字体是否可用
   */
  private static checkFontByMeasurement(fontFamily: string): boolean {
    const testString = '汉字测试';
    const fallbackFont = 'monospace';
    
    // 创建测试元素
    const testElement = document.createElement('span');
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.top = '-9999px';
    testElement.style.fontSize = '72px';
    testElement.style.fontFamily = fallbackFont;
    testElement.textContent = testString;
    
    document.body.appendChild(testElement);
    const fallbackWidth = testElement.offsetWidth;
    
    // 测试目标字体
    testElement.style.fontFamily = `"${fontFamily}", ${fallbackFont}`;
    const testWidth = testElement.offsetWidth;
    
    // 清理
    document.body.removeChild(testElement);
    
    // 如果宽度不同，说明字体可用
    return testWidth !== fallbackWidth;
  }

  /**
   * 获取字体信息
   */
  static getFontInfo(fontFamily: string): Promise<{ available: boolean; metrics?: any }> {
    return new Promise(async (resolve) => {
      try {
        const available = await this.checkFontAvailability(fontFamily);
        
        if (available && 'fonts' in document) {
          // 尝试获取字体度量信息
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.font = `16px "${fontFamily}"`;
            const metrics = ctx.measureText('汉');
            
            resolve({
              available: true,
              metrics: {
                width: metrics.width,
                actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
                actualBoundingBoxDescent: metrics.actualBoundingBoxDescent
              }
            });
            return;
          }
        }
        
        resolve({ available });
      } catch (error) {
        console.error('获取字体信息失败:', error);
        resolve({ available: false });
      }
    });
  }
}

// 导出便捷函数
export const renderCharacterWithFont = FontRenderer.renderCharacterWithFont.bind(FontRenderer);
export const checkFontAvailability = FontRenderer.checkFontAvailability.bind(FontRenderer);
export const getFontInfo = FontRenderer.getFontInfo.bind(FontRenderer);