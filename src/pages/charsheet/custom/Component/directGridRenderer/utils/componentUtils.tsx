/**
 * 组件工具函数
 * 提供创建通用 JSX 元素的工具函数
 */

import React from 'react';
import { PageConfig, CellConfig, RowConfig } from '../adapters';
import { StrokeDisplayConfig, StrokeJSXElement, StrokeDisplayResult, RowConfigWithStroke, StrokeDataConfig } from '@/pages/charsheet/interface';
import { STROKE_CLASSES } from '@/pages/charsheet/const/font';
import { generateStrokeData } from '@/utils/lib/hanziWriterRenderer';
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
 * 创建笔画顺序容器JSX（解耦后的布局组件）
 */
export const createStrokeOrderContainerJSX = (
  strokeElements: StrokeJSXElement[],
  containerConfig: { className?: string; style?: React.CSSProperties } = {}
): React.ReactElement => {
  const {
    className = STROKE_CLASSES.STROKE_ORDER_CONTAINER,
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
    marginLeft: colIndex === 0 ? '0' : cellConfig.marginLeft,
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

/**
 * 创建笔画展示JSX元素（模板层）
 * 调用hanziWriterRenderer的generateStrokeData API获取数据，然后创建JSX
 * 实现了数据生成和UI创建的解耦
 * 支持多种颜色模式：单色、多彩笔画、偏旁颜色、自定义颜色
 */
export const createStrokeDisplayJSX = async (
  character: string,
  config: StrokeDisplayConfig = {}
): Promise<StrokeDisplayResult> => {
  const {
    strokeSize,
    colorMode = 'single',
    fillColor,
    radicalColor,
    customColors,
    svgClassName = STROKE_CLASSES.STROKE_SVG,
    showArrow = true,
    arrowClassName = STROKE_CLASSES.STROKE_ARROW,
    arrowChar
  } = config;

  // 调用hanziWriterRenderer的通用API获取笔画数据
  const strokeDataConfig: StrokeDataConfig = {
    strokeSize,
    colorMode,
    fillColor,
    radicalColor,
    customColors,
    includeArrows: showArrow,
    arrowChar
  };

  const strokeData = await generateStrokeData(character, strokeDataConfig);

  if (strokeData.hasError) {
    return {
      character: strokeData.character,
      strokeCount: strokeData.strokeCount,
      strokeElements: [],
      hasError: true,
      errorMessage: strokeData.errorMessage
    };
  }

  const strokeElements: StrokeJSXElement[] = [];

  // 根据数据创建JSX元素
  for (let i = 0; i < strokeData.strokeSVGs.length; i++) {
    const strokeElement = (
      <div
        key={`stroke-${i}`}
        className={svgClassName}
        dangerouslySetInnerHTML={{ __html: strokeData.strokeSVGs[i] }}
      />
    );

    // 创建箭头元素（除了最后一个）
    let arrowElement: React.ReactElement | undefined;
    if (strokeData.includeArrows && i < strokeData.strokeSVGs.length - 1) {
      arrowElement = (
        <span
          key={`arrow-${i}`}
          className={arrowClassName}
          style={{ fontSize: `${strokeData.arrowFontSize}px` }}
        >
          {strokeData.arrowChar}
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
    character: strokeData.character,
    strokeCount: strokeData.strokeCount,
    strokeElements,
    hasError: false
  };
};