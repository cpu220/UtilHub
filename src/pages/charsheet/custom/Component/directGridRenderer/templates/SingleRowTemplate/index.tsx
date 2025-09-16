/**
 * 单行网格模板函数组件
 * 每行第一个格子显示汉字，后面全是米字格
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { TemplateComponentProps } from '../../index';
import { RowConfigWithStroke } from '@/pages/charsheet/interface';
import { useGridRenderer } from '../../hooks/useGridRenderer';
import { createPageContainer, createBasicCellElement, createStrokeDisplayJSX, createStrokeOrderContainerJSX } from '../../utils/componentUtils';
import { CharsheetColors, FONT_SCALE } from '../../../../../const';
import styles from './index.less';  

/**
 * 单行网格模板组件
 */
export const SingleRowTemplate: React.FC<TemplateComponentProps> = ({
  charList,
  columns,
  renderOptions,
  config,
  onRenderComplete
}) => {
  const { renderCharacterToCell, renderEmptyGrid, calculateRenderStats } = useGridRenderer();
  const startTimeRef = useRef(Date.now());
  const [strokeDataMap, setStrokeDataMap] = useState<Map<number, React.ReactElement>>(new Map());
  const [loadingStrokes, setLoadingStrokes] = useState<Set<number>>(new Set());

  // 计算布局参数
  const totalChars = charList.length;
  // 单行模板：每行显示一个字符，所以行数等于字符数量
  const actualRows = totalChars;
  const rowsPerPage = 8; // 单行模板每页8行
  const totalPages = Math.ceil(actualRows / rowsPerPage);

  // 静态配置对象，不需要useMemo（没有复杂计算，且依赖项为常量）
  const pageConfig = {
    rowsPerPage,
    pageBreakAfter: true,
    marginBottom: '20px',
    padding: '20px',
    debugBorder: false
  };

  // 需要useMemo的配置（依赖props变化，涉及计算）
  const cellConfig = useMemo(() => ({
    width: config.width || 60 * FONT_SCALE,
    height: config.height || 60 * FONT_SCALE,
    marginLeft: '6px',
    fontSize: `${(config.fontSize || config.width || 60 * FONT_SCALE) * 0.6}px`,
    border: `1px solid ${CharsheetColors.BORDER_COLOR}`
  }), [config.width, config.fontSize]);

  // 静态配置对象，不需要useMemo（完全静态，无依赖）
  const rowConfig: RowConfigWithStroke = {
    marginBottom: '5px',
    specialSpacing: {
      every5th: '20px',
      every15th: '30px'
    },
    strokeOrderVisible: true // 可以根据需要配置
  };

  // 异步加载笔画数据的函数 - 普通函数，不使用useCallback
  const loadStrokeData = async (rowIndex: number, character: string) => {
    if (!character || strokeDataMap.has(rowIndex) || loadingStrokes.has(rowIndex)) {
      return;
    }

    setLoadingStrokes(prev => new Set(prev).add(rowIndex));

    try {
      const strokeResult = await createStrokeDisplayJSX(character, {
        svgClassName: styles['stroke-svg'],
        arrowClassName: styles['stroke-arrow']
      });

      if (!strokeResult.hasError) {
        const strokeJSX = createStrokeOrderContainerJSX(strokeResult.strokeElements, {
          className: styles['stroke-order-container']
        });
        setStrokeDataMap(prev => {
          const newMap = new Map(prev);
          newMap.set(rowIndex, strokeJSX);
          return newMap;
        });
      } else {
        const errorJSX = (
          <div className={styles['stroke-error-message']}>
            {strokeResult.errorMessage}
          </div>
        );
        setStrokeDataMap(prev => {
          const newMap = new Map(prev);
          newMap.set(rowIndex, errorJSX);
          return newMap;
        });
      }
    } catch (error) {
      console.error('加载笔画数据失败:', error);
      const errorJSX = (
        <div className={styles['stroke-error-message']}>
          加载失败，请重试
        </div>
      );
      setStrokeDataMap(prev => {
        const newMap = new Map(prev);
        newMap.set(rowIndex, errorJSX);
        return newMap;
      });
    } finally {
      setLoadingStrokes(prev => {
        const newSet = new Set(prev);
        newSet.delete(rowIndex);
        return newSet;
      });
    }
  };

  // 创建笔画显示元素的函数 - 普通函数
  const createStrokeElement = (rowIndex: number, character: string): React.ReactElement | null => {
    if (!character) return null;

    const existingStrokeData = strokeDataMap.get(rowIndex);
    if (existingStrokeData) {
      return existingStrokeData;
    }

    // 触发异步加载
    loadStrokeData(rowIndex, character);

    // 返回加载状态
    return (
      <div id={`stroke-content-${rowIndex}`} className={styles['stroke-order-container']}>
        <span style={{ color: '#999', fontSize: '12px' }}>加载笔画中...</span>
      </div>
    );
  };

  // 创建单行网格单元格的函数 - 普通函数
  const createRowCells = (rowIndex: number, character: string): React.ReactElement[] => {
    const rowCells: React.ReactElement[] = [];
    
    for (let j = 0; j < columns; j++) {
      const cellId = `grid-item-${j}-${rowIndex}`;
      const cellElement = createBasicCellElement(cellId, j, cellConfig);
      rowCells.push(cellElement);
    }
    
    return rowCells;
  };

  // 创建行元素的函数 - 普通函数
  const createSingleRowElement = (rowIndex: number, character: string): React.ReactElement => {
    const strokeElement = rowConfig.strokeOrderVisible ? createStrokeElement(rowIndex, character) : null;
    const rowCells = createRowCells(rowIndex, character);

    return (
      <div
        key={`grid-row-content-${rowIndex}`}
        id={`grid-row-content-${rowIndex}`}
        className={styles['single-row-with-stroke-container']}
      >
        {strokeElement}
        <div 
          id={`grid-item-content-${rowIndex}`}
          className={styles['single-row-container']}
        >
          {rowCells}
        </div>
      </div>
    );
  };

  // 处理汉字渲染的函数 - 普通函数
  const handleCharacterRender = (cellId: string, character: string, rowIndex: number) => {
    if (character) {
      return renderCharacterToCell(cellId, character, renderOptions);
    } else {
      return renderEmptyGrid(cellId, renderOptions);
    }
  };

  // 页面生成函数 - 不需要useMemo，因为它就是拼装逻辑
  const generatePages = () => {
    const pages: React.ReactElement[] = [];
    const promises: Promise<void>[] = [];
    let currentIndex = 0;

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageRows: React.ReactElement[] = [];
      const startRow = pageIndex * rowsPerPage;
      const endRow = Math.min(startRow + rowsPerPage, actualRows);

      for (let i = startRow; i < endRow && currentIndex < totalChars; i++) {
        // 获取当前字符
        const currentChar = currentIndex < totalChars ? charList[currentIndex] : '';
        
        // 使用拆分的函数创建行元素
        const rowElement = createSingleRowElement(i, currentChar);
        pageRows.push(rowElement);
        
        // 处理汉字渲染Promise
        for (let j = 0; j < columns; j++) {
          const cellId = `grid-item-${j}-${i}`;
          if (j === 0 && currentChar) {
            // 第一个格子显示汉字
            const renderPromise = handleCharacterRender(cellId, currentChar, i);
            promises.push(renderPromise);
          } else {
            // 后面的格子显示空的米字格
            const renderPromise = handleCharacterRender(cellId, '', i);
            promises.push(renderPromise);
          }
        }
        
        if (currentIndex < totalChars) {
          currentIndex++;
        }
      }

      // 创建页面容器
      const pageElement = createPageContainer(pageIndex, pageConfig, pageRows);
      pages.push(pageElement);
    }
    
    return { pages, promises };
  };

  const { pages, promises } = generatePages();

  // 使用useEffect处理渲染完成回调
  // 注意：onRenderComplete和calculateRenderStats是从props/hooks传入的函数引用
  // 理论上每次渲染可能都会变化，但这里我们需要在promises完成时执行回调
  // 更好的做法是使用useCallback包装或者移除函数依赖
  useEffect(() => {
    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        const stats = calculateRenderStats(totalPages, totalChars, startTimeRef.current);
        onRenderComplete?.(stats);
      });
    }
    // 移除函数依赖，因为：
    // 1. onRenderComplete 是props传入，父组件应该用useCallback包装
    // 2. calculateRenderStats 来自useGridRenderer hook，应该是稳定的
    // 3. 主要关心的是promises.length变化，表示有新的渲染任务
  }, [promises.length, totalPages, totalChars]);
  
  // 如果需要响应onRenderComplete变化，应该单独处理
  // 但通常onRenderComplete在组件生命周期内是稳定的

  return (
    <>
      {pages}
    </>
  );
};

export default SingleRowTemplate;