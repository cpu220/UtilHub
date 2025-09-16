/**
 * 标准网格模板函数组件
 * 实现标准的多列网格布局，每行可显示多个汉字
 * 适用于练习册、作业本等需要密集排列的场景
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { TemplateComponentProps } from '../../index';
import { RowConfigWithStroke } from '@/pages/charsheet/interface';
import { useGridRenderer } from '../../hooks/useGridRenderer';
import { createPageContainer, createBasicCellElement } from '../../utils/componentUtils';
import { CharsheetColors, FONT_SCALE } from '../../../../../const';
import styles from './index.less';

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
  const { renderCharacterToCell, renderEmptyGrid, calculateRenderStats } = useGridRenderer();
  const startTimeRef = useRef(Date.now());

  // 计算布局参数 - 标准网格模板的核心布局逻辑
  const totalChars = charList.length;
  const finalRows = Math.ceil(totalChars / columns); // 总行数 = 字符数 / 每行列数
  const rowsPerPage = 15; // 每页显示15行，适合A4纸张
  const totalPages = Math.ceil(finalRows / rowsPerPage); // 总页数

  // 静态配置对象 - 页面布局配置
  const pageConfig = {
    rowsPerPage,
    pageBreakAfter: true, // 每页后分页
    marginBottom: '20px', // 页面间距
    padding: '20px', // 页面内边距
    debugBorder: false // 调试边框，生产环境关闭
  };

  // 需要useMemo的配置 - 依赖props变化的单元格配置
  const cellConfig = useMemo(() => ({
    width: config.width || 60 * FONT_SCALE,
    height: config.height || 60 * FONT_SCALE,
    marginLeft: '6px',
    fontSize: `${(config.fontSize || config.width || 60 * FONT_SCALE) * 0.6}px`,
    // border: `1px solid ${CharsheetColors.BORDER_COLOR}`
  }), [config.width, config.fontSize]);

  // 静态配置对象 - 行配置（标准网格不显示笔画顺序）
  const rowConfig: RowConfigWithStroke = {
    marginBottom: '5px',
    specialSpacing: {
      every5th: '20px', // 每5行增加间距
      every15th: '30px' // 每15行增加更大间距
    },
    strokeOrderVisible: false // 标准网格模板不显示笔画顺序
  };

  // 创建单行网格单元格的函数 - 处理一行内的所有单元格
  const createRowCells = (rowIndex: number, startCharIndex: number): React.ReactElement[] => {
    const rowCells: React.ReactElement[] = [];
    let currentCharIndex = startCharIndex;

    // 遍历当前行的每一列
    for (let j = 0; j < columns && currentCharIndex < totalChars; j++) {
      const char = charList[currentCharIndex];
      const cellId = `grid-item-${j}-${rowIndex}`;

      // 创建单元格元素
      const cellElement = createBasicCellElement(cellId, j, cellConfig);
      rowCells.push(cellElement);
      
      currentCharIndex++;
    }
    
    return rowCells;
  };

  // 创建标准网格行元素的函数 - 按照统一的层级结构
  const createStandardGridRowElement = (rowIndex: number, rowCells: React.ReactElement[]): React.ReactElement => {
    // 标准网格不需要笔画显示，所以strokeElement为null
    const strokeElement = null;

    // 按照统一的层级结构：grid-row-content > grid-item-content > grid-item
    return (
      <div
        key={`grid-row-content-${rowIndex}`}
        id={`grid-row-content-${rowIndex}`}
        className={styles['standard-grid-row-container']}
      >
        {strokeElement}
        <div 
          id={`grid-item-content-${rowIndex}`}
          className={styles['standard-grid-container']}
        >
          {rowCells}
        </div>
      </div>
    );
  };

  // 处理汉字渲染的函数 - 统一的渲染逻辑
  const handleCharacterRender = (cellId: string, character: string) => {
    if (character) {
      // 渲染汉字到指定单元格
      return renderCharacterToCell(cellId, character, renderOptions);
    } else {
      // 渲染空的田字格
      return renderEmptyGrid(cellId, renderOptions);
    }
  };

  // 页面生成函数 - 标准网格的页面拼装逻辑
  const generatePages = () => {
    const pages: React.ReactElement[] = [];
    const promises: Promise<void>[] = [];
    let currentCharIndex = 0; // 当前处理的字符索引

    // 遍历每一页
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageRows: React.ReactElement[] = [];
      const startRow = pageIndex * rowsPerPage; // 当前页的起始行
      const endRow = Math.min(startRow + rowsPerPage, finalRows); // 当前页的结束行

      // 遍历当前页的每一行
      for (let rowIndex = startRow; rowIndex < endRow && currentCharIndex < totalChars; rowIndex++) {
        const startCharIndexForRow = currentCharIndex; // 记录当前行的起始字符索引
        
        // 使用拆分的函数创建行单元格
        const rowCells = createRowCells(rowIndex, currentCharIndex);
        
        // 处理当前行的汉字渲染Promise
        for (let j = 0; j < columns && currentCharIndex < totalChars; j++) {
          const char = charList[currentCharIndex];
          const cellId = `grid-item-${j}-${rowIndex}`;
          
          // 添加渲染Promise - 每个字符都需要渲染
          const renderPromise = handleCharacterRender(cellId, char);
          promises.push(renderPromise);
          
          currentCharIndex++;
        }
        
        // 使用拆分的函数创建行元素
        const rowElement = createStandardGridRowElement(rowIndex, rowCells);
        pageRows.push(rowElement);
      }

      // 创建页面容器
      const pageElement = createPageContainer(pageIndex, pageConfig, pageRows);
      pages.push(pageElement);
    }
    
    return { pages, promises };
  };

  const { pages, promises } = generatePages();

  // 使用useEffect处理渲染完成回调
  useEffect(() => {
    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        const stats = calculateRenderStats(totalPages, totalChars, startTimeRef.current);
        onRenderComplete?.(stats);
      });
    }
  }, [promises.length, totalPages, totalChars]);

  return (
    <>
      {pages}
    </>
  );
};

export default StandardGridTemplate;