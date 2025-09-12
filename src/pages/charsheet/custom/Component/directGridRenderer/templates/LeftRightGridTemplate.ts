/**
 * 左右分栏网格模板
 * 实现左右两栏布局，每栏独立显示字符和米字格
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
 * 左右分栏网格模板实现
 * 页面分为左右两个容器，每个容器一行显示 columns/2 个格子
 * 第一个格子是汉字，后面的格子是米字格
 */
export class LeftRightGridTemplate extends BaseGridTemplate {
  readonly type = TemplateType.LEFT_RIGHT;
  readonly name = '左右分栏网格';
  readonly description = '左右分栏布局，每栏第一个格子显示汉字，后面显示米字格';

  /**
   * 计算左右分栏模式下的行数
   * 由于是左右分栏，实际字符消耗速度是标准模式的2倍
   */
  public calculateRows(charCount: number, columns: number, maxRows: number): number {
    // 每行消耗2个字符（左栏1个，右栏1个）
    const charsPerRow = 2;
    const fullRows = Math.floor(charCount / charsPerRow);
    const remainder = charCount % charsPerRow;
    const actualRows = fullRows + (remainder > 0 ? 1 : 0);
    return Math.min(actualRows, maxRows);
  }

  /**
   * 创建左右分栏的行容器
   */
  private createLeftRightRowContainer(rowIndex: number): HTMLDivElement {
    const rowContainer = document.createElement('div');
    rowContainer.id = `lr-row-container-${rowIndex}`;
    rowContainer.className = styles['lr-row-container'];
    
    return rowContainer;
  }

  /**
   * 创建左栏或右栏容器
   */
  private createColumnContainer(
    side: 'left' | 'right',
    rowIndex: number,
    columns: number
  ): HTMLDivElement {
    const columnContainer = document.createElement('div');
    columnContainer.id = `${side}-column-${rowIndex}`;
    columnContainer.className = styles[`${side}-column`];
    
    return columnContainer;
  }

  /**
   * 渲染空的田字格
   */
  private renderEmptyGrid(
    cellId: string,
    renderOptions: any
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          // 使用空字符和特殊配置来只显示田字格
          const gridOnlyOptions = {
            ...renderOptions,
            useGridBackground: true,
            // 对于cnchar-draw，设置showCharacter为false
            showCharacter: false
          };
          
          // 使用空字符渲染，只显示田字格背景
          if (renderOptions.renderMode === 'font' && renderOptions.fontFamily) {
            // 字体模式：创建只有田字格的SVG
            this.createEmptyGridSVG(cellId, renderOptions);
          } else {
            // 笔画模式：使用cnchar-draw的showCharacter: false选项
            this.renderCharacterToCell(cellId, '田', gridOnlyOptions);
          }
          resolve();
        } catch (error) {
          console.error('渲染空田字格失败:', error);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * 创建只有田字格的SVG（用于字体模式）
   */
  private createEmptyGridSVG(cellId: string, options: any): void {
    const container = document.getElementById(cellId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // 创建SVG容器
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', options.width.toString());
    svg.setAttribute('height', options.height.toString());
    svg.setAttribute('viewBox', `0 0 ${options.width} ${options.height}`);
    
    // 添加田字格背景
    this.addGridBackgroundToSVG(svg, options);
    
    container.appendChild(svg);
  }

  /**
   * 添加田字格背景到SVG
   */
  private addGridBackgroundToSVG(svg: SVGElement, options: any): void {
    const { width, height, gridColor = getGridColor() } = options;
    const strokeWidth = Math.max(0.5, Math.min(1, width / 100));
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

  /**
   * 创建单栏内的格子（第一个是汉字，后面是田字格）
   */
  private createColumnCells(
    columnContainer: HTMLDivElement,
    character: string,
    rowIndex: number,
    side: 'left' | 'right',
    columns: number,
    config: any,
    renderOptions: any
  ): Promise<void>[] {
    const cellsPerColumn = Math.floor(columns / 2);
    const renderPromises: Promise<void>[] = [];
    const cellConfig = this.getDefaultCellConfig(config);

    for (let i = 0; i < cellsPerColumn; i++) {
      const cellId = `${side}-cell-${i}-${rowIndex}`;
      const cellElement = this.createCellElement(cellId, i, cellConfig);
      cellElement.className += ` ${styles['lr-cell']}`; // 添加左右分栏专用样式
      
      columnContainer.appendChild(cellElement);

      if (i === 0) {
        // 第一个格子显示汉字
        const renderPromise = this.renderCharacterToCell(
          cellId,
          character,
          renderOptions
        );
        renderPromises.push(renderPromise);
      } else {
        // 后面的格子显示空的田字格
        const renderPromise = this.renderEmptyGrid(
          cellId,
          renderOptions
        );
        renderPromises.push(renderPromise);
      }
    }

    return renderPromises;
  }

  /**
   * 渲染左右分栏网格
   */
  public async render(params: TemplateRenderParams): Promise<TemplateRenderResult> {
    const { charList, columns, rowsCount, renderOptions, config, containerRef } = params;
    
    // 验证参数
    if (!this.validateParams(params)) {
      return {
        success: false,
        totalPages: 0,
        totalCells: 0,
        renderPromises: [],
        error: '参数验证失败'
      };
    }

    // 验证列数是否为偶数
    if (columns % 2 !== 0) {
      return {
        success: false,
        totalPages: 0,
        totalCells: 0,
        renderPromises: [],
        error: '左右分栏模式要求列数必须为偶数'
      };
    }

    try {
      const container = containerRef.current!;
      this.clearContainer(container);

      const totalChars = charList.length;
      const finalRows = this.calculateRows(totalChars, columns, rowsCount);
      
      const renderPromises: Promise<void>[] = [];
      const pageConfig = this.getDefaultPageConfig({
        rowsPerPage:12,
      });
      
      let currentIndex = 0;
      let currentPageContainer: HTMLDivElement | null = null;
      let currentPageIndex = 0;
      let totalPages = 0;
      let totalCells = 0;

      for (let i = 0; i < finalRows && currentIndex < totalChars; i++) {
        // 每15行创建一个新的页面容器
        if (i % pageConfig.rowsPerPage === 0) {
          currentPageContainer = this.createPageContainer(
            currentPageIndex,
            container,
            pageConfig
          );
          currentPageIndex++;
          totalPages++;
        }

        // 创建左右分栏的行容器
        const rowContainer = this.createLeftRightRowContainer(i);
        
        // 将行容器添加到页面容器中
        if (currentPageContainer) {
          currentPageContainer.appendChild(rowContainer);
        } else {
          container.appendChild(rowContainer);
        }

        // 创建左栏容器
        const leftColumn = this.createColumnContainer('left', i, columns);
        rowContainer.appendChild(leftColumn);

        // 创建右栏容器
        const rightColumn = this.createColumnContainer('right', i, columns);
        rowContainer.appendChild(rightColumn);

        // 处理左栏：使用当前字符
        if (currentIndex < totalChars) {
          const leftChar = charList[currentIndex];
          const leftPromises = this.createColumnCells(
            leftColumn,
            leftChar,
            i,
            'left',
            columns,
            config,
            renderOptions
          );
          renderPromises.push(...leftPromises);
          totalCells += Math.floor(columns / 2);
          currentIndex++;
        }

        // 处理右栏：使用下一个字符
        if (currentIndex < totalChars) {
          const rightChar = charList[currentIndex];
          const rightPromises = this.createColumnCells(
            rightColumn,
            rightChar,
            i,
            'right',
            columns,
            config,
            renderOptions
          );
          renderPromises.push(...rightPromises);
          totalCells += Math.floor(columns / 2);
          currentIndex++;
        } else {
          // 如果没有更多字符，右栏显示空的米字格
          const rightPromises = this.createColumnCells(
            rightColumn,
            '',
            i,
            'right',
            columns,
            config,
            {
              ...renderOptions,
              showCharacter: false,
              useGridBackground: true
            }
          );
          renderPromises.push(...rightPromises);
          totalCells += Math.floor(columns / 2);
        }
      }

      return {
        success: true,
        totalPages,
        totalCells,
        renderPromises
      };

    } catch (error) {
      console.error('左右分栏网格模板渲染失败:', error);
      return {
        success: false,
        totalPages: 0,
        totalCells: 0,
        renderPromises: [],
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
}