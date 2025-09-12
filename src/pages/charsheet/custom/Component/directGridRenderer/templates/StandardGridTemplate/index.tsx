/**
 * 标准网格模板
 * 实现原有的单列网格布局逻辑
 */

import { BaseGridTemplate } from '../BaseGridTemplate';
import {
  TemplateType,
  TemplateRenderParams,
  TemplateRenderResult
} from '../types';

/**
 * 标准网格模板实现
 * 对应原有的renderGridDirectly方法逻辑
 */
export class StandardGridTemplate extends BaseGridTemplate {
  readonly type = TemplateType.STANDARD;
  readonly name = '标准网格';
  readonly description = '标准的单列网格布局，每行显示指定数量的字符';

  /**
   * 渲染标准网格
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

    try {
      const container = containerRef.current!;
      this.clearContainer(container);

      const totalChars = charList.length;
      const finalRows = this.calculateRows(totalChars, columns, rowsCount);
      
      const renderPromises: Promise<void>[] = [];
      const pageConfig = this.getDefaultPageConfig();
      const cellConfig = this.getDefaultCellConfig(config);
      const rowConfig = this.getDefaultRowConfig();
      
      let currentIndex = 0;
      let currentPageContainer: HTMLDivElement | null = null;
      let currentPageIndex = 0;
      let totalPages = 0;

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

        // 创建行元素
        const rowElement = this.createRowElement(i, rowConfig);
        
        // 将行添加到当前页面容器中
        if (currentPageContainer) {
          currentPageContainer.appendChild(rowElement);
        } else {
          // 兜底：如果没有页面容器，直接添加到网格容器
          container.appendChild(rowElement);
        }

        // 创建该行的所有单元格
        for (let j = 0; j < columns && currentIndex < totalChars; j++) {
          const char = charList[currentIndex];
          const cellId = `direct-grid-item-${j}-${i}`;

          // 创建单元格
          const cellElement = this.createCellElement(cellId, j, cellConfig);
          rowElement.appendChild(cellElement);

          // 渲染字符到单元格
          const renderPromise = this.renderCharacterToCell(
            cellId,
            char,
            renderOptions
          );
          
          renderPromises.push(renderPromise);
          currentIndex++;
        }
      }

      return {
        success: true,
        totalPages,
        totalCells: currentIndex,
        renderPromises
      };

    } catch (error) {
      console.error('标准网格模板渲染失败:', error);
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