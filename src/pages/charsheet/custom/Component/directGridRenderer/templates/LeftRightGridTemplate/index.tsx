/**
 * 左右分栏网格模板函数组件
 * 实现左右两栏布局，每栏独立显示字符和米字格
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { TemplateComponentProps } from '../../index';
import { useGridRenderer } from '../../hooks/useGridRenderer';
import { 
  createPageContainer, 
  createLeftRightRowContainer, 
  createColumnContainer, 
  createCellElement 
} from '../../utils/componentUtils';
import { CharsheetColors, FONT_SCALE } from '../../../../../const';
import styles from './index.less';

/**
 * 左右分栏网格模板组件
 */
export const LeftRightGridTemplate: React.FC<TemplateComponentProps> = ({
  charList,
  columns,
  renderOptions,
  config,
  onRenderComplete
}) => {
  const { renderCharacterToCell, renderEmptyGrid, calculateRenderStats } = useGridRenderer();
  const startTimeRef = useRef(Date.now());

  // 验证列数是否为偶数
  const adjustedColumns = columns % 2 === 0 ? columns : columns - 1;
  
  // 计算布局参数
  const totalChars = charList.length;
  const charsPerRow = 2; // 左右分栏，每行消耗2个字符
  const finalRows = Math.ceil(totalChars / charsPerRow);
  const rowsPerPage = 12;
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
        // 创建左右分栏的行
        const leftChar = currentIndex < totalChars ? charList[currentIndex] : '';
        const rightChar = currentIndex + 1 < totalChars ? charList[currentIndex + 1] : '';
        
        // 创建左栏单元格
        const leftCells: React.ReactElement[] = [];
        for (let j = 0; j < adjustedColumns / 2; j++) {
          const cellId = `left-cell-${j}-${i}`;
          const cellElement = createCellElement(cellId, j, cellConfig);
          leftCells.push(cellElement);
          
          if (j === 0 && leftChar) {
            // 第一个格子渲染汉字
            const renderPromise = renderCharacterToCell(cellId, leftChar, renderOptions);
            promises.push(renderPromise);
          } else {
            // 其他格子渲染空田字格
            const renderPromise = renderEmptyGrid(cellId, renderOptions);
            promises.push(renderPromise);
          }
        }
        
        // 创建右栏单元格
        const rightCells: React.ReactElement[] = [];
        for (let j = 0; j < adjustedColumns / 2; j++) {
          const cellId = `right-cell-${j}-${i}`;
          const cellElement = createCellElement(cellId, j, cellConfig);
          rightCells.push(cellElement);
          
          if (j === 0 && rightChar) {
            // 第一个格子渲染汉字
            const renderPromise = renderCharacterToCell(cellId, rightChar, renderOptions);
            promises.push(renderPromise);
          } else {
            // 其他格子渲染空田字格
            const renderPromise = renderEmptyGrid(cellId, renderOptions);
            promises.push(renderPromise);
          }
        }
        
        // 创建左右栏容器
        const leftColumn = createColumnContainer('left', i, leftCells);
        const rightColumn = createColumnContainer('right', i, rightCells);
        
        // 创建行容器
        const rowElement = createLeftRightRowContainer(i, [leftColumn, rightColumn]);
        pageRows.push(rowElement);
        
        currentIndex += 2; // 每行消耗2个字符
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
  }, [charList, adjustedColumns, totalPages, rowsPerPage, finalRows, totalChars, cellConfig, pageConfig, renderCharacterToCell, renderEmptyGrid, renderOptions, calculateRenderStats, onRenderComplete]);

  return (
    <>
      {pages}
    </>
  );
};

export default LeftRightGridTemplate;