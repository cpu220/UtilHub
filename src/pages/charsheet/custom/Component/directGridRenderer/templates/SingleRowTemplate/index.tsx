/**
 * 单行网格模板
 * 每行第一个格子显示汉字，后面全是米字格
 */

import { BaseGridTemplate } from '../BaseGridTemplate';
import {
  TemplateType,
  TemplateRenderParams,
  TemplateRenderResult
} from '../types';
import { getGridColor } from '../../../../../const/colorManager';
import { GridConfig } from '../../../../../const/font';
import { createGridSVG, createEmptyGridInContainer, createStrokeOrderContainer } from '@/utils';
import styles from './index.less';

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
    const { charList, columns, renderOptions, config, containerRef } = params;
    
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
      // 单行模板：每行显示一个字符，所以行数等于字符数量
    const actualRows = totalChars;
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
   * 创建包含笔画顺序的行容器
   */
  private async createRowWithStrokeOrder(rowIndex: number, character: string, config: any): Promise<HTMLDivElement> {
    const rowContainer = document.createElement('div');
    rowContainer.className = styles['single-row-with-stroke-container'];
    
    // 使用统一的笔画顺序API
    const strokeSize = Math.floor(GridConfig.fontSize * this.STROKE_ORDER_FONT_RATIO);
    const strokeOrderElement = await createStrokeOrderContainer(character, {
      strokeSize,
      containerClassName: styles['stroke-order-container'],
      arrowClassName: styles['stroke-arrow'],
      strokeSvgClassName: styles['stroke-svg']
    });
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
            createEmptyGridInContainer(cellId, renderOptions.width, renderOptions.height, renderOptions.gridColor, {
              useDashedLines: false,
              showBorder: true
            });
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


}