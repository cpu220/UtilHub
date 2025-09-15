/**
 * 标准网格模板函数组件
 * 实现标准的单列网格布局
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { TemplateComponentProps } from '../../index';
import { useGridRenderer } from '../../hooks/useGridRenderer';
import { createPageContainer, createRowElement, createCellElement } from '../../utils/componentUtils';
import { CharsheetColors, FONT_SCALE } from '../../../../../const';

/**
 * 标准网格模板组件
 */
export const StandardGridTemplate: React.FC<TemplateComponentProps> = ({
  charList,
  columns,
  renderOptions,
  config,
  onRenderComplete
}) => {
  const { renderCharacterToCell, calculateRenderStats } = useGridRenderer();
  const startTimeRef = useRef(Date.now());

  // 计算布局参数
  const totalChars = charList.length;
  const finalRows = Math.ceil(totalChars / columns);
  const rowsPerPage = 15;
  const totalPages = Math.ceil(finalRows / rowsPerPage);

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
      const endRow = Math.min(startRow + rowsPerPage, finalRows);

      for (let i = startRow; i < endRow && currentIndex < totalChars; i++) {
        const rowCells: React.ReactElement[] = [];

        // 创建该行的所有单元格
        for (let j = 0; j < columns && currentIndex < totalChars; j++) {
          const char = charList[currentIndex];
          const cellId = `standard-grid-item-${j}-${i}`;

          // 创建单元格
          const cellElement = createCellElement(cellId, j, cellConfig);
          rowCells.push(cellElement);

          // 添加渲染Promise
          const renderPromise = renderCharacterToCell(cellId, char, renderOptions);
          promises.push(renderPromise);
          
          currentIndex++;
        }

        // 创建行元素
        const rowElement = createRowElement(i, rowConfig, rowCells);
        pageRows.push(rowElement);
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
  }, [charList, columns, totalPages, rowsPerPage, finalRows, totalChars, cellConfig, rowConfig, pageConfig, renderCharacterToCell, renderOptions, calculateRenderStats, onRenderComplete]);

  return (
    <>
      {pages}
    </>
  );
};

export default StandardGridTemplate;