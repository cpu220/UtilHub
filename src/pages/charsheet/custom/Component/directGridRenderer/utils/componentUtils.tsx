/**
 * 组件工具函数
 * 提供创建通用 JSX 元素的工具函数
 */

import React from 'react';
import { PageConfig, CellConfig, RowConfig } from '../adapters';
import styles from '../templates/index.less';

/**
 * 创建页面容器组件
 */
export const createPageContainer = (
  pageIndex: number,
  config: PageConfig,
  children?: React.ReactNode
): React.ReactElement => {
  const containerStyle: React.CSSProperties = {
    marginBottom: config.marginBottom,
    padding: config.padding,
    ...(config.pageBreakAfter && { pageBreakAfter: 'always' }),
    ...(config.debugBorder && { border: 'solid 1px #f00' })
  };
  
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
};

/**
 * 创建行元素组件
 */
export const createRowElement = (
  rowIndex: number,
  config: RowConfig,
  children?: React.ReactNode
): React.ReactElement => {
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
      key={`grid-row-${rowIndex}`}
      id={`grid-row-${rowIndex}`}
      className={styles['grid-row']}
      style={rowStyle}
    >
      {children}
    </div>
  );
};

/**
 * 创建单元格元素组件
 */
export const createCellElement = (
  cellId: string,
  colIndex: number,
  cellConfig: CellConfig,
  children?: React.ReactNode
): React.ReactElement => {
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
};

/**
 * 创建左右分栏的行容器组件
 */
export const createLeftRightRowContainer = (
  rowIndex: number,
  children?: React.ReactNode
): React.ReactElement => {
  return (
    <div
      key={`lr-row-container-${rowIndex}`}
      id={`lr-row-container-${rowIndex}`}
      className={styles['lr-row-container']}
    >
      {children}
    </div>
  );
};

/**
 * 创建左栏或右栏容器组件
 */
export const createColumnContainer = (
  side: 'left' | 'right',
  rowIndex: number,
  children?: React.ReactNode
): React.ReactElement => {
  return (
    <div
      key={`${side}-column-${rowIndex}`}
      id={`${side}-column-${rowIndex}`}
      className={styles[`${side}-column`]}
    >
      {children}
    </div>
  );
};