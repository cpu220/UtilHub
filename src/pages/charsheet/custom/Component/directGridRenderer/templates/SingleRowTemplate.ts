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
import styles from '../index.less';

/**
 * 单行网格模板实现
 * 每行第一个格子显示汉字，后面的格子显示米字格
 */
export class SingleRowTemplate extends BaseGridTemplate {
  readonly type = TemplateType.SINGLE_ROW;
  readonly name = '单行网格';
  readonly description = '每行第一个格子显示汉字，后面显示米字格';

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
      const totalPages = Math.ceil(actualRows / 15); // 每页15行
      const renderPromises: Promise<void>[] = [];
      
      let currentIndex = 0;
      let totalCells = 0;
      let currentPageContainer: HTMLDivElement | null = null;

      for (let i = 0; i < actualRows && currentIndex < totalChars; i++) {
        // 每15行创建新页面
        if (i % 15 === 0) {
          currentPageContainer = this.createPageContainer(Math.floor(i / 15), container);
        }

        // 创建行容器
        const rowElement = this.createRowElement(i, this.getDefaultRowConfig());
        
        if (currentPageContainer) {
          currentPageContainer.appendChild(rowElement);
        } else {
          container.appendChild(rowElement);
        }

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