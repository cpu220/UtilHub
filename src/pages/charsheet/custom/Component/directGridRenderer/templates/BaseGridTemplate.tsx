/**
 * 基础网格模板抽象类
 * 提供通用的网格渲染功能和配置
 */

import React from 'react';
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
  protected getDefaultPageConfig(config?:{}): PageContainerConfig { 
    return {
      rowsPerPage: 12,
      pageBreakAfter: true,
      marginBottom: '20px',
      padding: '5px',
      debugBorder: false,
      ...config
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
   * 创建页面容器 React 组件
   */
  protected createPageContainer(
    pageIndex: number,
    config: PageContainerConfig = this.getDefaultPageConfig(),
    children?: React.ReactNode
  ): React.ReactElement {
    const containerStyle: React.CSSProperties = {
      marginBottom: config.marginBottom,
      padding: config.padding,
      ...(config.pageBreakAfter && { pageBreakAfter: 'always' }),
      ...(config.debugBorder && { border: 'solid 1px #f00' })
    };
    
    console.log(`创建页面容器: page-container-${pageIndex}`);
    
    return (
      <div
        key={`page-container-${pageIndex}`}
        id={`page-container-${pageIndex}`}
        className={`${styles['page-container']} page-container`}
        style={containerStyle}
        data-page-index={pageIndex.toString()}
      >
        {children}
      </div>
    );
  }

  /**
   * 创建行元素 React 组件
   */
  protected createRowElement(
    rowIndex: number,
    config: RowConfig = this.getDefaultRowConfig(),
    children?: React.ReactNode
  ): React.ReactElement {
    const rowStyle: React.CSSProperties = {};
    
    // 设置特殊间距
    if (config.specialSpacing) {
      if (config.specialSpacing.every5th && (rowIndex + 1) % 6 === 0) {
        rowStyle.marginBottom = config.specialSpacing.every5th;
      }
      if (config.specialSpacing.every15th && (rowIndex + 1) % 12 === 0) {
        rowStyle.marginBottom = config.specialSpacing.every15th;
      }
    }
    
    return (
      <div
        key={`direct-grid-row-${rowIndex}`}
        id={`direct-grid-row-${rowIndex}`}
        className={styles['grid-row']}
        style={rowStyle}
      >
        {children}
      </div>
    );
  }

  /**
   * 创建单元格元素 React 组件
   */
  protected createCellElement(
    cellId: string,
    colIndex: number,
    cellConfig: CellConfig,
    children?: React.ReactNode
  ): React.ReactElement {
    const cellStyle: React.CSSProperties = {
      width: `${cellConfig.width}px`,
      height: `${cellConfig.height}px`,
      fontSize: cellConfig.fontSize || `${cellConfig.width * 0.6}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
    
    // 第一个元素不设置左边距
    if (colIndex === 0) {
      cellStyle.marginLeft = '0';
    } else if (cellConfig.marginLeft) {
      cellStyle.marginLeft = cellConfig.marginLeft;
    }
    
    if (cellConfig.border) {
      cellStyle.border = cellConfig.border;
    }
    
    return (
      <div
        key={cellId}
        id={cellId}
        className={styles['grid-item']}
        style={cellStyle}
      >
        {children}
      </div>
    );
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