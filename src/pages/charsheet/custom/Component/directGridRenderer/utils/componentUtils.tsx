/**
 * 组件工具函数
 * 提供创建通用 JSX 元素的工具函数
 */

import React from 'react';
import { PageConfig, CellConfig, RowConfig } from '../adapters';
import { StrokeDisplayConfig, StrokeJSXElement, StrokeDisplayResult, RowConfigWithStroke } from '@/pages/charsheet/interface';
import { DEFAULT_STROKE_CONFIG, DEFAULT_STROKE_CLASSES, STROKE_ERROR_MESSAGES } from '@/pages/charsheet/const';
import { getCharacterStrokeData, createStrokeSVG } from '@/utils/lib/hanziWriterRenderer';
import styles from '../templates/index.less';
import './stroke.less';

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
 * 创建笔画展示JSX元素
 * 输入汉字字符串，返回每个笔画的JSX展示
 */
export const createStrokeDisplayJSX = async (
  character: string,
  config: StrokeDisplayConfig = {}
): Promise<StrokeDisplayResult> => {
  const {
    strokeSize = DEFAULT_STROKE_CONFIG.STROKE_SIZE,
    fillColor = DEFAULT_STROKE_CONFIG.FILL_COLOR,
    svgClassName = DEFAULT_STROKE_CLASSES.STROKE_SVG,
    showArrow = true,
    arrowClassName = DEFAULT_STROKE_CLASSES.STROKE_ARROW,
    arrowChar = DEFAULT_STROKE_CONFIG.ARROW_CHAR
  } = config;

  if (!character) {
    return {
      character: '',
      strokeCount: 0,
      strokeElements: [],
      hasError: true,
      errorMessage: STROKE_ERROR_MESSAGES.EMPTY_CHARACTER
    };
  }

  try {
    const strokes = await getCharacterStrokeData(character);
    
    if (strokes.length === 0) {
      return {
        character,
        strokeCount: 0,
        strokeElements: [],
        hasError: true,
        errorMessage: STROKE_ERROR_MESSAGES.NO_STROKE_DATA
      };
    }

    const strokeElements: StrokeJSXElement[] = [];
    
    // 创建每个笔画的JSX元素
    for (let i = 0; i < strokes.length; i++) {
      const strokesPortion = strokes.slice(0, i + 1);
      
      // 创建笔画SVG的JSX元素
      const strokeSVG = createStrokeSVG(strokesPortion, strokeSize, { 
        fillColor,
        className: svgClassName 
      });
      
      const strokeElement = (
        <div 
          key={`stroke-${i}`}
          className={svgClassName}
          dangerouslySetInnerHTML={{ __html: strokeSVG.outerHTML }}
        />
      );
      
      // 创建箭头元素（除了最后一个）
      let arrowElement: React.ReactElement | undefined;
      if (showArrow && i < strokes.length - 1) {
        arrowElement = (
          <span 
            key={`arrow-${i}`}
            className={arrowClassName}
            style={{ fontSize: `${Math.floor(strokeSize * 0.5)}px` }}
          >
            {arrowChar}
          </span>
        );
      }
      
      strokeElements.push({
        index: i,
        strokeElement,
        arrowElement
      });
    }
    
    return {
      character,
      strokeCount: strokes.length,
      strokeElements,
      hasError: false
    };
  } catch (error) {
    console.warn(`创建笔画JSX失败:`, error);
    return {
      character,
      strokeCount: 0,
      strokeElements: [],
      hasError: true,
      errorMessage: STROKE_ERROR_MESSAGES.LOAD_FAILED
    };
  }
};

/**
 * 创建笔画顺序容器JSX（解耦后的布局组件）
 */
export const createStrokeOrderContainerJSX = (
  strokeElements: StrokeJSXElement[],
  containerConfig: { className?: string; style?: React.CSSProperties } = {}
): React.ReactElement => {
  const {
    className = DEFAULT_STROKE_CLASSES.STROKE_ORDER_CONTAINER,
    style = {}
  } = containerConfig;

  return (
    <div className={className} style={style}>
      {strokeElements.map((element) => (
        <React.Fragment key={element.index}>
          {element.strokeElement}
          {element.arrowElement}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * 创建基础单元格元素
 * 只负责创建单个网格单元格，不涉及行级别的逻辑
 */
export const createBasicCellElement = (
  cellId: string,
  colIndex: number,
  cellConfig: CellConfig,
  children?: React.ReactNode
): React.ReactElement => {
  const cellStyle: React.CSSProperties = {
    width: cellConfig.width,
    height: cellConfig.height,
    marginLeft: cellConfig.marginLeft,
    fontSize: cellConfig.fontSize,
    border: cellConfig.border
  };

  return (
    <div
      key={cellId}
      id={cellId}
      className={styles['grid-cell']}
      style={cellStyle}
      data-col-index={colIndex.toString()}
    >
      {children}
    </div>
  );
};

/**
 * @deprecated 请在各模板组件内部自行实现行创建逻辑
 */
export const createRowElement = createBasicCellElement;


 
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