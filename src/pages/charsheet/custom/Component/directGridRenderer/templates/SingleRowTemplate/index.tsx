/**
 * 单行网格模板函数组件
 * 每行第一个格子显示汉字，后面全是米字格
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { TemplateComponentProps } from '../../index';
import { useGridRenderer } from '../../hooks/useGridRenderer';
import { createPageContainer, createRowElement, createCellElement } from '../../utils/componentUtils';
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

  // 计算布局参数
  const totalChars = charList.length;
  // 单行模板：每行显示一个字符，所以行数等于字符数量
  const actualRows = totalChars;
  const rowsPerPage = 8; // 单行模板每页8行
  const totalPages = Math.ceil(actualRows / rowsPerPage);

  // 使用useMemo缓存配置对象，避免每次渲染都重新创建
  const pageConfig = useMemo(() => ({
    rowsPerPage,
    pageBreakAfter: true,
    marginBottom: '20px',
    padding: '20px',
    debugBorder: false
  }), [rowsPerPage]);

  const cellConfig = useMemo(() => ({
    width: config.width || 60 * FONT_SCALE,
    height: config.height || 60 * FONT_SCALE,
    marginLeft: '6px',
    fontSize: `${(config.fontSize || config.width || 60 * FONT_SCALE) * 0.6}px`,
    border: `1px solid ${CharsheetColors.BORDER_COLOR}`
  }), [config.width, config.fontSize]);

  const rowConfig = useMemo(() => ({
    marginBottom: '5px',
    specialSpacing: {
      every5th: '20px',
      every15th: '30px'
    }
  }), []);

  // 使用useMemo优化页面生成，避免无限重渲染
  const pages = useMemo(() => {
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
        
        // 创建该行的所有单元格
        const rowCells: React.ReactElement[] = [];
        for (let j = 0; j < columns; j++) {
          const cellId = `single-row-item-${j}-${i}`;
          const cellElement = createCellElement(cellId, j, cellConfig);
          rowCells.push(cellElement);

          if (j === 0 && currentChar) {
            // 第一个格子显示汉字
            const renderPromise = renderCharacterToCell(cellId, currentChar, renderOptions);
            promises.push(renderPromise);
          } else {
            // 后面的格子显示空的米字格
            const renderPromise = renderEmptyGrid(cellId, renderOptions);
            promises.push(renderPromise);
          }
        }
        
        // 创建行元素
        const rowElement = createRowElement(i, rowConfig, rowCells);
        pageRows.push(rowElement);
        
        if (currentIndex < totalChars) {
          currentIndex++;
        }
      }

      // 创建页面容器
      const pageElement = createPageContainer(pageIndex, pageConfig, pageRows);
      pages.push(pageElement);
    }
    
    // 直接处理渲染完成回调，避免复杂的状态管理
    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        const stats = calculateRenderStats(totalPages, totalChars, startTimeRef.current);
        onRenderComplete?.(stats);
      });
    }
    
    return pages;
  }, [charList, columns, totalPages, rowsPerPage, actualRows, totalChars, cellConfig, rowConfig, pageConfig, renderCharacterToCell, renderEmptyGrid, renderOptions, calculateRenderStats, onRenderComplete]);

  return (
    <>
      {pages}
    </>
  );
};

export default SingleRowTemplate;