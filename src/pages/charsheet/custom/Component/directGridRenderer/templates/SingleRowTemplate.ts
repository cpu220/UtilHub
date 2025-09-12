/**
 * 单行网格模板
 * 每行第一个格子显示汉字，后面全是米字格
 */

import { BaseGridTemplate } from './BaseGridTemplate';
import {
  TemplateType,
  TemplateRenderParams,
  TemplateRenderResult
} from './types';
import { getGridColor } from '../../../../const/colorManager';
import { GridConfig } from '../../../../const/font';
// @ts-ignore
import HanziWriter from 'hanzi-writer';
import styles from '../index.less';

/**
 * 单行网格模板实现
 * 每行第一个格子显示汉字，后面的格子显示米字格
 * 每行顶部显示笔画顺序
 */
export class SingleRowTemplate extends BaseGridTemplate {
  readonly type = TemplateType.SINGLE_ROW;
  readonly name = '单行网格';
  readonly description = '每行第一个格子显示汉字，后面显示米字格';

  // 笔画顺序字体大小比例常量
  private readonly STROKE_ORDER_FONT_RATIO = 0.3;

  /**
   * 渲染网格
   */
  public async render(params: TemplateRenderParams): Promise<TemplateRenderResult> {
    const { charList, columns, rowsCount, renderOptions, config, containerRef } = params;
    
    if (!this.validateParams(params)) {
      return {
        success: false,
        totalPages: 0,
        totalCells: 0,
        renderPromises: [],
        error: '参数验证失败'
      };
    }

    try {
      const container = containerRef.current!;
      this.clearContainer(container);

      const totalChars = charList.length;
      const actualRows = this.calculateRows(totalChars, columns, rowsCount);
      const rowsPerPage = 8; // 单行模板每页12行
      const totalPages = Math.ceil(actualRows / rowsPerPage);
      const renderPromises: Promise<void>[] = [];
      
      let currentIndex = 0;
      let totalCells = 0;
      let currentPageContainer: HTMLDivElement | null = null;

      for (let i = 0; i < actualRows && currentIndex < totalChars; i++) {
        // 每12行创建新页面
        if (i % rowsPerPage === 0) {
          const pageConfig = this.getDefaultPageConfig({
            debugBorder: false,
            pageBreakAfter: true,
            marginBottom: '20px',
            padding: '20px'
          });
          currentPageContainer = this.createPageContainer(Math.floor(i / rowsPerPage), container, pageConfig);
        }

        // 获取当前字符用于笔画顺序显示
        const currentChar = currentIndex < totalChars ? charList[currentIndex] : '';
        
        // 创建行容器（包含笔画顺序和网格行）
        const rowContainerPromise = this.createRowWithStrokeOrder(i, currentChar, config);
        
        // 添加到渲染Promise列表中
        const rowRenderPromise = rowContainerPromise.then((rowContainer) => {
          if (currentPageContainer) {
            currentPageContainer.appendChild(rowContainer);
          } else {
            container.appendChild(rowContainer);
          }
          return rowContainer;
        });
        
        renderPromises.push(rowRenderPromise.then(() => {}));
        
        // 获取网格行元素（需要等待行容器创建完成）
        const rowElement = await rowContainerPromise.then(container => container.children[1] as HTMLDivElement);

        // 创建该行的所有单元格
        for (let j = 0; j < columns; j++) {
          const cellId = `single-row-item-${j}-${i}`;
          const cellElement = this.createCellElement(cellId, j, this.getDefaultCellConfig(config));
          rowElement.appendChild(cellElement);

          if (j === 0 && currentIndex < totalChars) {
            // 第一个格子显示汉字
            const char = charList[currentIndex];
            const renderPromise = this.renderCharacterToCell(cellId, char, renderOptions);
            renderPromises.push(renderPromise);
            currentIndex++;
          } else {
            // 后面的格子显示空的米字格
            const renderPromise = this.renderEmptyGrid(cellId, renderOptions);
            renderPromises.push(renderPromise);
          }
          
          totalCells++;
        }
      }

      return {
        success: true,
        totalPages,
        totalCells,
        renderPromises
      };

    } catch (error) {
      console.error('单行网格模板渲染失败:', error);
      return {
        success: false,
        totalPages: 0,
        totalCells: 0,
        renderPromises: [],
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 获取汉字的笔画数据
   */
  private async getStrokeData(character: string): Promise<any[]> {
    try {
      if (!character || character.length === 0) {
        return [];
      }
      
      // 使用HanziWriter获取笔画数据
      const charData = await HanziWriter.loadCharacterData(character);
      return charData?.strokes || [];
    } catch (error) {
      console.warn(`获取字符"${character}"的笔画数据失败:`, error);
      return [];
    }
  }

  /**
   * 渲染单个笔画SVG
   */
  private renderStrokeSVG(strokePaths: string[], strokeSize: number): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.width = `${strokeSize}px`;
    svg.style.height = `${strokeSize}px`;
    svg.style.border = '1px solid #EEE';
    svg.style.marginRight = '3px';
    svg.style.flexShrink = '0';
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // 设置变换属性，使字符在指定尺寸下渲染
    const transformData = HanziWriter.getScalingTransform(strokeSize, strokeSize);
    group.setAttributeNS(null, 'transform', transformData.transform);
    svg.appendChild(group);
    
    strokePaths.forEach((strokePath: string) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttributeNS(null, 'd', strokePath);
      path.style.fill = '#555';
      group.appendChild(path);
    });
    
    return svg;
  }

  /**
   * 创建笔画顺序显示元素
   */
  private async createStrokeOrderElement(character: string, config: any): Promise<HTMLDivElement> {
    const strokeOrderDiv = document.createElement('div');
    strokeOrderDiv.className = 'stroke-order-container';
    
    // 设置样式
    const strokeSize = Math.floor(GridConfig.fontSize * this.STROKE_ORDER_FONT_RATIO);
    strokeOrderDiv.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      min-height: ${strokeSize + 4}px;
      overflow-x: auto;
      overflow-y: hidden;
    `;
    
    if (!character) {
      return strokeOrderDiv;
    }
    
    try {
      const strokes = await this.getStrokeData(character);
      
      if (strokes.length === 0) {
        strokeOrderDiv.innerHTML = `<span style="color: #999; font-size: ${Math.floor(strokeSize * 0.6)}px;">暂无笔画数据</span>`;
        return strokeOrderDiv;
      }
      
      // 创建笔画顺序显示：逐步累积的笔画SVG
      for (let i = 0; i < strokes.length; i++) {
        const strokesPortion = strokes.slice(0, i + 1);
        const strokeSVG = this.renderStrokeSVG(strokesPortion, strokeSize);
        strokeOrderDiv.appendChild(strokeSVG);
        
        // 添加箭头分隔符（除了最后一个）
        if (i < strokes.length - 1) {
          const arrow = document.createElement('span');
          arrow.style.cssText = `
            margin: 0 4px;
            color: #999;
            font-size: ${Math.floor(strokeSize * 0.5)}px;
            flex-shrink: 0;
          `;
          arrow.textContent = '→';
          strokeOrderDiv.appendChild(arrow);
        }
      }
    } catch (error) {
      console.warn(`创建笔画顺序显示失败:`, error);
      strokeOrderDiv.innerHTML = `<span style="color: #999; font-size: ${Math.floor(strokeSize * 0.6)}px;">笔画加载失败</span>`;
    }
    
    return strokeOrderDiv;
  }

  /**
   * 创建包含笔画顺序的行容器
   */
  private async createRowWithStrokeOrder(rowIndex: number, character: string, config: any): Promise<HTMLDivElement> {
    const rowContainer = document.createElement('div');
    rowContainer.className = 'single-row-with-stroke-container';
    rowContainer.style.cssText = `
      display: block;
      width: 100%;
      margin-bottom: calc(15px * var(--charsheet-font-scale, 1));
    `;
    
    // 创建笔画顺序显示
    const strokeOrderElement = await this.createStrokeOrderElement(character, config);
    rowContainer.appendChild(strokeOrderElement);
    
    // 创建网格行
    const gridRow = this.createRowElement(rowIndex, this.getDefaultRowConfig());
    rowContainer.appendChild(gridRow);
    
    return rowContainer;
  }

  /**
   * 渲染空的米字格
   */
  private renderEmptyGrid(cellId: string, renderOptions: any): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          const gridOnlyOptions = {
            ...renderOptions,
            useGridBackground: true,
            showCharacter: false
          };
          
          if (renderOptions.renderMode === 'font' && renderOptions.fontFamily) {
            this.createEmptyGridSVG(cellId, renderOptions);
          } else {
            this.renderCharacterToCell(cellId, '田', gridOnlyOptions);
          }
          resolve();
        } catch (error) {
          console.error('渲染空米字格失败:', error);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * 创建只有米字格的SVG
   */
  private createEmptyGridSVG(cellId: string, options: any): void {
    const container = document.getElementById(cellId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', options.width.toString());
    svg.setAttribute('height', options.height.toString());
    svg.setAttribute('viewBox', `0 0 ${options.width} ${options.height}`);
    
    this.addGridBackgroundToSVG(svg, options);
    container.appendChild(svg);
  }

  /**
   * 添加米字格背景到SVG
   */
  private addGridBackgroundToSVG(svg: SVGElement, options: any): void {
    const { width, height, gridColor = getGridColor() } = options;
    const strokeWidth = Math.max(0.5, Math.min(1, width / 100));
    const halfWidth = Math.round(width / 2) + 0.5;
    const halfHeight = Math.round(height / 2) + 0.5;
    
    // 背景矩形
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '0.5');
    background.setAttribute('y', '0.5');
    background.setAttribute('width', (width - 1).toString());
    background.setAttribute('height', (height - 1).toString());
    background.setAttribute('fill', 'white');
    background.setAttribute('stroke', gridColor);
    background.setAttribute('stroke-width', strokeWidth.toString());
    svg.appendChild(background);
    
    // 水平中线
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', '0');
    horizontalLine.setAttribute('y1', halfHeight.toString());
    horizontalLine.setAttribute('x2', width.toString());
    horizontalLine.setAttribute('y2', halfHeight.toString());
    horizontalLine.setAttribute('stroke', gridColor);
    horizontalLine.setAttribute('stroke-width', strokeWidth.toString());
    svg.appendChild(horizontalLine);
    
    // 垂直中线
    const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    verticalLine.setAttribute('x1', halfWidth.toString());
    verticalLine.setAttribute('y1', '0');
    verticalLine.setAttribute('x2', halfWidth.toString());
    verticalLine.setAttribute('y2', height.toString());
    verticalLine.setAttribute('stroke', gridColor);
    verticalLine.setAttribute('stroke-width', strokeWidth.toString());
    svg.appendChild(verticalLine);
    
    // 对角线1（左上到右下）
    const diagonal1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    diagonal1.setAttribute('x1', '0');
    diagonal1.setAttribute('y1', '0');
    diagonal1.setAttribute('x2', width.toString());
    diagonal1.setAttribute('y2', height.toString());
    diagonal1.setAttribute('stroke', gridColor);
    diagonal1.setAttribute('stroke-width', strokeWidth.toString());
    svg.appendChild(diagonal1);
    
    // 对角线2（右上到左下）
    const diagonal2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    diagonal2.setAttribute('x1', width.toString());
    diagonal2.setAttribute('y1', '0');
    diagonal2.setAttribute('x2', '0');
    diagonal2.setAttribute('y2', height.toString());
    diagonal2.setAttribute('stroke', gridColor);
    diagonal2.setAttribute('stroke-width', strokeWidth.toString());
    svg.appendChild(diagonal2);
  }
}