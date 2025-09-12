/**
 * 网格模板抽象基类
 * 提供所有模板的通用功能实现
 */

import { message } from 'antd';
import {
  renderHanziInContainer,
  FontRenderer
} from '@/utils';
import { CharsheetColors, FONT_SCALE } from '../../../../const';
import {
  IGridTemplate,
  TemplateType,
  TemplateRenderParams,
  TemplateRenderResult,
  PageContainerConfig,
  CellConfig,
  RowConfig
} from './types';
import styles from '../index.less';

/**
 * 抽象网格模板基类
 */
export abstract class BaseGridTemplate implements IGridTemplate {
  abstract readonly type: TemplateType;
  abstract readonly name: string;
  abstract readonly description: string;

  /**
   * 默认页面容器配置
   */
  protected getDefaultPageConfig(): PageContainerConfig {
    return {
      rowsPerPage: 15,
      pageBreakAfter: true,
      marginBottom: '20px',
      padding: '5px',
      debugBorder: false
    };
  }

  /**
   * 默认单元格配置
   */
  protected getDefaultCellConfig(config: any): CellConfig {
    return {
      width: config.width,
      height: config.height,
      fontSize: `${config.width * 0.6}px`
    };
  }

  /**
   * 默认行配置
   */
  protected getDefaultRowConfig(): RowConfig {
    return {
      specialSpacing: {
        every5th: `${20 * FONT_SCALE}px`
      }
    };
  }

  /**
   * 验证渲染参数
   */
  public validateParams(params: TemplateRenderParams): boolean {
    const { charList, columns, containerRef } = params;
    
    if (!charList || charList.length === 0) {
      message.error('字符列表为空');
      return false;
    }
    
    if (columns <= 0) {
      message.error('列数必须大于0');
      return false;
    }
    
    if (!containerRef.current) {
      message.error('容器引用无效');
      return false;
    }
    
    return true;
  }

  /**
   * 计算实际需要的行数
   */
  public calculateRows(charCount: number, columns: number, maxRows: number): number {
    const fullRows = Math.floor(charCount / columns);
    const remainder = charCount % columns;
    const actualRows = fullRows + (remainder > 0 ? 1 : 0);
    return Math.min(actualRows, maxRows);
  }

  /**
   * 创建页面容器
   */
  protected createPageContainer(
    pageIndex: number,
    parentContainer: HTMLDivElement,
    config: PageContainerConfig = this.getDefaultPageConfig()
  ): HTMLDivElement {
    const pageContainer = document.createElement('div');
    pageContainer.id = `page-container-${pageIndex}`;
    pageContainer.className = `${styles['page-container']} page-container`; // 添加CSS模块化类名和全局类名
    
    // 设置样式
    if (config.pageBreakAfter) {
      pageContainer.style.pageBreakAfter = 'always';
    }
    pageContainer.style.marginBottom = config.marginBottom;
    pageContainer.style.padding = config.padding;
    
    if (config.debugBorder) {
      pageContainer.style.border = 'solid 1px #f00';
    }
    
    pageContainer.setAttribute('data-page-index', pageIndex.toString());
    parentContainer.appendChild(pageContainer);
    
    console.log(`创建页面容器: page-container-${pageIndex}`);
    return pageContainer;
  }

  /**
   * 创建行元素
   */
  protected createRowElement(
    rowIndex: number,
    config: RowConfig = this.getDefaultRowConfig()
  ): HTMLDivElement {
    const rowElement = document.createElement('div');
    rowElement.id = `direct-grid-row-${rowIndex}`;
    rowElement.className = styles['grid-row'];
    
    // 设置特殊间距
    if (config.specialSpacing) {
      if (config.specialSpacing.every5th && (rowIndex + 1) % 5 === 0) {
        rowElement.style.marginBottom = config.specialSpacing.every5th;
      }
      if (config.specialSpacing.every15th && (rowIndex + 1) % 15 === 0) {
        rowElement.style.marginBottom = config.specialSpacing.every15th;
      }
    }
    
    return rowElement;
  }

  /**
   * 创建单元格元素
   */
  protected createCellElement(
    cellId: string,
    colIndex: number,
    cellConfig: CellConfig
  ): HTMLDivElement {
    const cellElement = document.createElement('div');
    cellElement.id = cellId;
    cellElement.className = styles['grid-item'];
    
    // 设置基础样式
    cellElement.style.width = `${cellConfig.width}px`;
    cellElement.style.height = `${cellConfig.height}px`;
    cellElement.style.fontSize = cellConfig.fontSize || `${cellConfig.width * 0.6}px`;
    cellElement.style.display = 'flex';
    cellElement.style.alignItems = 'center';
    cellElement.style.justifyContent = 'center';
    
    // 第一个元素不设置左边距
    if (colIndex === 0) {
      cellElement.style.marginLeft = '0';
    } else if (cellConfig.marginLeft) {
      cellElement.style.marginLeft = cellConfig.marginLeft;
    }
    
    if (cellConfig.border) {
      cellElement.style.border = cellConfig.border;
    }
    
    return cellElement;
  }

  /**
   * 渲染字符到单元格
   */
  protected renderCharacterToCell(
    cellId: string,
    character: string,
    renderOptions: any
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          // 根据渲染模式选择渲染方式
          if (renderOptions.renderMode === 'font' && renderOptions.fontFamily) {
            // 使用字体渲染模式
            FontRenderer.renderCharacterWithFont(cellId, character, {
              ...renderOptions,
              renderMode: 'font',
              fontFamily: renderOptions.fontFamily
            });
          } else {
            // 使用统一适配器，根据配置自动选择渲染引擎
            renderHanziInContainer(cellId, character, renderOptions);
          }
          resolve();
        } catch (error) {
          // 降级处理：显示纯文字
          const element = document.getElementById(cellId);
          if (element) {
            element.innerText = character;
          }
          resolve();
        }
      }, 50); // 小延迟确保DOM已经挂载
    });
  }

  /**
   * 清空容器
   */
  protected clearContainer(container: HTMLDivElement): void {
    container.innerHTML = '';
  }

  /**
   * 抽象方法：子类必须实现具体的渲染逻辑
   */
  public abstract render(params: TemplateRenderParams): Promise<TemplateRenderResult>;
}