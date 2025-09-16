/**
 * 左右分栏网格模板函数组件
 * 实现左右两栏布局，每栏独立显示字符和米字格
 * 适用于对比练习、左右对照等场景
 * 左栏显示第1、3、5...个字符，右栏显示第2、4、6...个字符
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { TemplateComponentProps } from '../../index';
import { RowConfigWithStroke } from '@/pages/charsheet/interface';
import { useGridRenderer } from '../../hooks/useGridRenderer';
import { createPageContainer, createBasicCellElement } from '../../utils/componentUtils';
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

  // 验证列数是否为偶数 - 左右分栏需要偶数列
  const adjustedColumns = columns % 2 === 0 ? columns : columns - 1;
  
  // 计算布局参数 - 左右分栏模板的核心布局逻辑
  const totalChars = charList.length;
  const charsPerRow = 2; // 左右分栏，每行消耗2个字符（左栏1个，右栏1个）
  const finalRows = Math.ceil(totalChars / charsPerRow); // 总行数
  const rowsPerPage = 12; // 每页12行，适合左右分栏的密度
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
    border: `1px solid ${CharsheetColors.BORDER_COLOR}`
  }), [config.width, config.fontSize]);

  // 静态配置对象 - 行配置（左右分栏不显示笔画顺序）
  const rowConfig: RowConfigWithStroke = {
    marginBottom: '5px',
    specialSpacing: {
      every5th: '20px', // 每5行增加间距
      every15th: '30px' // 每15行增加更大间距
    },
    strokeOrderVisible: false // 左右分栏模板不显示笔画顺序
  };

  // 创建左栏单元格的函数 - 处理左栏的所有单元格
  const createLeftColumnCells = (rowIndex: number, character: string): React.ReactElement[] => {
    const leftCells: React.ReactElement[] = [];
    
    // 左栏有 adjustedColumns/2 个单元格
    for (let j = 0; j < adjustedColumns / 2; j++) {
      const cellId = `grid-item-${j}-${rowIndex}`;
      const cellElement = createBasicCellElement(cellId, j, cellConfig);
      leftCells.push(cellElement);
    }
    
    return leftCells;
  };

  // 创建右栏单元格的函数 - 处理右栏的所有单元格
  const createRightColumnCells = (rowIndex: number, character: string): React.ReactElement[] => {
    const rightCells: React.ReactElement[] = [];
    
    // 右栏有 adjustedColumns/2 个单元格，ID需要加上偏移量避免冲突
    for (let j = 0; j < adjustedColumns / 2; j++) {
      const cellId = `grid-item-${j + adjustedColumns / 2}-${rowIndex}`;
      const cellElement = createBasicCellElement(cellId, j, cellConfig);
      rightCells.push(cellElement);
    }
    
    return rightCells;
  };

  // 创建左右分栏行元素的函数 - 按照统一的层级结构
  const createLeftRightRowElement = (rowIndex: number, leftChar: string, rightChar: string): React.ReactElement => {
    // 左右分栏不需要笔画显示，所以strokeElement为null
    const strokeElement = null;
    
    // 创建左栏和右栏的单元格
    const leftCells = createLeftColumnCells(rowIndex, leftChar);
    const rightCells = createRightColumnCells(rowIndex, rightChar);

    // 按照统一的层级结构：grid-row-content > grid-item-content > 左栏容器 + 右栏容器
    return (
      <div
        key={`grid-row-content-${rowIndex}`}
        id={`grid-row-content-${rowIndex}`}
        className={styles['left-right-row-container']}
      >
        {strokeElement}
        <div 
          id={`grid-item-content-${rowIndex}`}
          className={styles['left-right-container']}
        >
          {/* 左栏容器 */}
          <div className={styles['left-column-container']}>
            {leftCells}
          </div>
          {/* 右栏容器 */}
          <div className={styles['right-column-container']}>
            {rightCells}
          </div>
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

  // 页面生成函数 - 左右分栏的页面拼装逻辑
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
        // 获取左右分栏的字符 - 左栏显示奇数位字符，右栏显示偶数位字符
        const leftChar = currentCharIndex < totalChars ? charList[currentCharIndex] : '';
        const rightChar = currentCharIndex + 1 < totalChars ? charList[currentCharIndex + 1] : '';
        
        // 处理左栏的汉字渲染Promise
        for (let j = 0; j < adjustedColumns / 2; j++) {
          const cellId = `grid-item-${j}-${rowIndex}`;
          
          if (j === 0 && leftChar) {
            // 左栏第一个格子渲染汉字
            const renderPromise = handleCharacterRender(cellId, leftChar);
            promises.push(renderPromise);
          } else {
            // 左栏其他格子渲染空田字格
            const renderPromise = handleCharacterRender(cellId, '');
            promises.push(renderPromise);
          }
        }
        
        // 处理右栏的汉字渲染Promise
        for (let j = 0; j < adjustedColumns / 2; j++) {
          const cellId = `grid-item-${j + adjustedColumns / 2}-${rowIndex}`;
          
          if (j === 0 && rightChar) {
            // 右栏第一个格子渲染汉字
            const renderPromise = handleCharacterRender(cellId, rightChar);
            promises.push(renderPromise);
          } else {
            // 右栏其他格子渲染空田字格
            const renderPromise = handleCharacterRender(cellId, '');
            promises.push(renderPromise);
          }
        }
        
        // 使用拆分的函数创建左右分栏行元素
        const rowElement = createLeftRightRowElement(rowIndex, leftChar, rightChar);
        pageRows.push(rowElement);
        
        currentCharIndex += 2; // 每行消耗2个字符（左栏1个，右栏1个）
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

export default LeftRightGridTemplate;