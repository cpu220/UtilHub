/**
 * 左右分栏网格模板函数组件
 * 实现左右两栏布局，每栏独立显示字符和米字格
 * 适用于对比练习、左右对照等场景
 * 左栏显示第1、3、5...个字符，右栏显示第2、4、6...个字符
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { TemplateComponentProps } from '@/pages/charsheet/interface';
import { RowConfigWithStroke } from '@/pages/charsheet/interface';
import { useGridRenderer } from '../../hooks/useGridRenderer';
import { createPageContainer, createBasicCellElement } from '../../utils/componentUtils';
import { renderStrokeProgressInContainer, getCharacterStrokeData } from '@/utils/lib/hanziWriterRenderer';
import { CharsheetColors, FONT_SCALE } from '../../../../../const';
import { STROKE_DISPLAY_DEFAULT_CONFIG } from '../../../../../const/font';
import styles from './index.less';

/**
 * 左右分栏网格模板组件
 */
export const LeftRightGridTemplate: React.FC<TemplateComponentProps> = ({
  charList,
  columns,
  renderOptions,
  config,
  onRenderComplete,
  strokeDisplayCount = STROKE_DISPLAY_DEFAULT_CONFIG.DEFAULT_STROKE_DISPLAY_COUNT // 使用统一的默认值
}) => {
  const { renderCharacterToCell, renderEmptyGrid, calculateRenderStats } = useGridRenderer();
  const startTimeRef = useRef(Date.now());
  const isMountedRef = useRef(true);
  
  // 汉字笔画数缓存
  const [characterStrokeCountMap, setCharacterStrokeCountMap] = useState<Map<string, number>>(new Map());
  
  // 组件卸载时设置标志
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // 预加载所有汉字的笔画数据，避免重复获取
  useEffect(() => {
    const preloadStrokeData = async () => {
      // 将charList转换为字符数组并去重
      const chars = Array.from(charList).filter((char: string) => char && char.trim());
      const uniqueChars = [...new Set(chars)];
      // 并发预加载，但不等待结果，让缓存在后台生效
      uniqueChars.forEach((char: string) => {
        getCharacterStrokeData(char).catch(() => {});
      });
    };
    
    if (charList && charList.length > 0) {
      preloadStrokeData();
    }
  }, [charList]);

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

  // 获取汉字的实际笔画数
  const getCharacterStrokeCount = async (character: string): Promise<number> => {
    if (!character) return 0;
    
    // 先从缓存中查找
    const cached = characterStrokeCountMap.get(character);
    if (cached !== undefined) {
      return cached;
    }
    
    try {
      // 获取笔画数据
      const strokes = await getCharacterStrokeData(character);
      const strokeCount = strokes.length;
      
      // 缓存结果 - 只有在组件仍然挂载时才更新状态
      if (isMountedRef.current) {
        setCharacterStrokeCountMap(prev => {
          const newMap = new Map(prev);
          newMap.set(character, strokeCount);
          return newMap;
        });
      }
      
      return strokeCount;
    } catch (error) {
      console.warn(`获取汉字 ${character} 的笔画数失败:`, error);
      return 0;
    }
  };

  // 需要useMemo的配置 - 依赖props变化的单元格配置
  const cellConfig = useMemo(() => ({
    width: config.width || 60 * FONT_SCALE,
    height: config.height || 60 * FONT_SCALE,
    marginLeft: '6px',
    fontSize: `${(config.fontSize || config.width || 60 * FONT_SCALE) * 0.6}px`,
    // border: `1px solid ${CharsheetColors.BORDER_COLOR}`
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

  // 处理汉字渲染的函数 - 异步函数，支持笔画展示
  const handleCharacterRender = async (cellId: string, character: string, cellIndex: number, currentRowChar: string) => {
    if (character) {
      // 第一个格子显示汉字
      return renderCharacterToCell(cellId, character, renderOptions);
    } else {
      // 判断是否需要显示笔画进度
      const shouldShowStroke = strokeDisplayCount > 0 && 
                              cellIndex > 0 && 
                              cellIndex <= strokeDisplayCount && 
                              currentRowChar;
      
      if (shouldShowStroke) {
        // 获取汉字的实际笔画数
        const actualStrokeCount = await getCharacterStrokeCount(currentRowChar);
        
        // 限制笔画展示数量：不能超过实际笔画数
        const effectiveStrokeCount = Math.min(cellIndex, actualStrokeCount);
        
        if (effectiveStrokeCount > 0) {
          // 显示笔画进度：cellIndex=1显示第1笔，cellIndex=2显示第1+2笔，以此类推
          return renderStrokeProgressInContainer(cellId, currentRowChar, effectiveStrokeCount, {
            width: renderOptions.width,
            height: renderOptions.height,
            useGridBackground: renderOptions.useGridBackground,
            gridColor: renderOptions.gridColor,
            strokeColor: renderOptions.strokeColor
          });
        } else {
          // 如果没有有效的笔画数，显示空的米字格
          return renderEmptyGrid(cellId, renderOptions);
        }
      } else {
        // 显示空的米字格
        return renderEmptyGrid(cellId, renderOptions);
      }
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
            const renderPromise = (async () => {
              await handleCharacterRender(cellId, leftChar, j, leftChar);
            })();
            promises.push(renderPromise);
          } else {
            // 左栏其他格子：根据位置决定显示笔画进度还是米字格
            const renderPromise = (async () => {
              // 等待笔画数量计算完成
              if (leftChar && strokeDisplayCount > 0) {
                const strokeCount = await getCharacterStrokeCount(leftChar);
                const maxStrokeSlots = adjustedColumns / 2 - 1; // 减去汉字占用的第1个格子
                const effectiveStrokeDisplayCount = Math.min(strokeDisplayCount, strokeCount, maxStrokeSlots);
                
                if (j <= effectiveStrokeDisplayCount) {
                  // 显示笔画进度：j=1显示第1笔，j=2显示第1+2笔
                  await handleCharacterRender(cellId, '', j, leftChar);
                } else {
                  // 显示空米字格
                  await handleCharacterRender(cellId, '', j, '');
                }
              } else {
                // 显示空米字格
                await handleCharacterRender(cellId, '', j, '');
              }
            })();
            promises.push(renderPromise);
          }
        }
        
        // 处理右栏的汉字渲染Promise
        for (let j = 0; j < adjustedColumns / 2; j++) {
          const cellId = `grid-item-${j + adjustedColumns / 2}-${rowIndex}`;
          
          if (j === 0 && rightChar) {
            // 右栏第一个格子渲染汉字
            const renderPromise = (async () => {
              await handleCharacterRender(cellId, rightChar, j, rightChar);
            })();
            promises.push(renderPromise);
          } else {
            // 右栏其他格子：根据位置决定显示笔画进度还是米字格
            const renderPromise = (async () => {
              // 等待笔画数量计算完成
              if (rightChar && strokeDisplayCount > 0) {
                const strokeCount = await getCharacterStrokeCount(rightChar);
                const maxStrokeSlots = adjustedColumns / 2 - 1; // 减去汉字占用的第1个格子
                const effectiveStrokeDisplayCount = Math.min(strokeDisplayCount, strokeCount, maxStrokeSlots);
                
                if (j <= effectiveStrokeDisplayCount) {
                  // 显示笔画进度：j=1显示第1笔，j=2显示第1+2笔
                  await handleCharacterRender(cellId, '', j, rightChar);
                } else {
                  // 显示空米字格
                  await handleCharacterRender(cellId, '', j, '');
                }
              } else {
                // 显示空米字格
                await handleCharacterRender(cellId, '', j, '');
              }
            })();
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