/**
 * 单行网格模板函数组件
 * 每行第一个格子显示汉字，后面全是米字格
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { TemplateComponentProps } from '@/pages/charsheet/interface';
import { RowConfigWithStroke } from '@/pages/charsheet/interface';
import { useGridRenderer } from '@/pages/charsheet/custom/Component/directGridRenderer/hooks/useGridRenderer';
import { createPageContainer, createBasicCellElement, createStrokeOrderContainerJSX, createStrokeDisplayJSX } from '@/pages/charsheet/custom/Component/directGridRenderer/utils/componentUtils';
import { renderStrokeProgressInContainer, getCharacterStrokeData, getPinyinString } from '@/utils/lib';
import { CharsheetColors, FONT_SCALE, STROKE_DISPLAY_DEFAULT_CONFIG } from '@/pages/charsheet/const';
import styles from './index.less';

/**
 * 单行网格模板组件
 */
export const SingleRowTemplate: React.FC<TemplateComponentProps> = ({
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

  // 笔画数据状态管理
  const [strokeDataMap, setStrokeDataMap] = useState<Map<number, React.ReactElement>>(new Map());
  const [loadingStrokes, setLoadingStrokes] = useState<Set<number>>(new Set());
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
    debugBorder: false,
    // 笔画容器配置
    showPinyinAndStroke: true, // 是否显示拼音和笔画的左右分栏布局（false时只显示笔画）
    pinyinConfig: {
      withTone: true, // 是否显示声调
      toneType: 'symbol' as const, // 声调类型：symbol(ā) 或 number(a1)
      capitalize: false // 是否首字母大写
    }
  };

  // 需要useMemo的配置（依赖props变化，涉及计算）
  const cellConfig = useMemo(() => ({
    width: config.width || 60 * FONT_SCALE,
    height: config.height || 60 * FONT_SCALE,
    marginLeft: '6px',
    fontSize: `${(config.fontSize || config.width || 60 * FONT_SCALE) * 0.6}px`,
    // border: `1px solid ${CharsheetColors.BORDER_COLOR}`
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
        arrowClassName: styles['stroke-arrow'],
        showArrow: false,
        colorMode: 'stroke'
      });

      if (!strokeResult.hasError) {
        const strokeJSX = createStrokeOrderContainerJSX(strokeResult.strokeElements, {
          className: styles['stroke-order-container'],
          style: { maxWidth: calculateStrokeContainerMaxWidth() }
        });
        setStrokeDataMap(prev => {
          const newMap = new Map(prev);
          newMap.set(rowIndex, strokeJSX);
          return newMap;
        });
      } else {
        const errorJSX = (
          <div
            className={styles['stroke-error-message']}
            style={{ maxWidth: calculateStrokeContainerMaxWidth() }}
          >
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
        <div
          className={styles['stroke-error-message']}
          style={{ maxWidth: calculateStrokeContainerMaxWidth() }}
        >
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

  // 计算笔画容器的最大宽度 - 根据grid-item个数和宽度计算
  const calculateStrokeContainerMaxWidth = (): string => {
    // 单个grid-item的宽度 + 左边距
    const itemWidth = cellConfig.width;
    const itemMarginLeft = 6; // 来自CSS中的margin-left

    // 总宽度 = 列数 * (单元格宽度 + 左边距) - 第一个单元格的左边距
    const totalWidth = columns * (itemWidth + itemMarginLeft) - itemMarginLeft;

    return `${totalWidth}px`;
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

  // 创建笔画显示元素的函数 - 普通函数
  const createStrokeElement = (rowIndex: number, character: string): React.ReactElement | null => {
    if (!character) return null;

    const existingStrokeData = strokeDataMap.get(rowIndex);
    
    // 根据配置决定显示布局
    if (pageConfig.showPinyinAndStroke) {
      // 显示左右分栏布局
      const pinyinText = getPinyinString(character, pageConfig.pinyinConfig);
      
      if (existingStrokeData) {
        return (
          <div
            id={`stroke-content-${rowIndex}`}
            className={styles['stroke-top-container']}
            style={{ maxWidth: calculateStrokeContainerMaxWidth() }}
          >
            <div className={styles['stroke-top-container-left']}>
              {pinyinText}
            </div>
            <div className={styles['stroke-top-container-right']}>
              {existingStrokeData}
            </div>
          </div>
        );
      }
      
      // 触发异步加载
      loadStrokeData(rowIndex, character);
      
      return (
        <div
          id={`stroke-content-${rowIndex}`}
          className={styles['stroke-top-container']}
          style={{ maxWidth: calculateStrokeContainerMaxWidth() }}
        >
          <div className={styles['stroke-top-container-left']}>
            {pinyinText}
          </div>
          <div className={styles['stroke-top-container-right']}>
            <div style={{ color: '#999', fontSize: '12px' }}>加载中...</div>
          </div>
        </div>
      );
    } else {
      // 只显示笔画，不分栏
      if (existingStrokeData) {
        return (
          <div
            id={`stroke-content-${rowIndex}`}
            className={styles['stroke-top-container']}
            style={{ maxWidth: calculateStrokeContainerMaxWidth() }}
          >
            {existingStrokeData}
          </div>
        );
      }
      
      // 触发异步加载
      loadStrokeData(rowIndex, character);
      
      return (
        <div
          id={`stroke-content-${rowIndex}`}
          className={styles['stroke-top-container']}
          style={{ maxWidth: calculateStrokeContainerMaxWidth() }}
        >
          <div style={{ color: '#999', fontSize: '12px' }}>加载笔画中...</div>
        </div>
      );
     }
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

  // 处理汉字渲染的函数 - 异步函数
  const handleCharacterRender = async (cellId: string, character: string, rowIndex: number, cellIndex: number, currentRowChar: string) => {
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
        // 计算当前行的笔画展示数量：min(strokeDisplayCount, 汉字笔画数, columns-1)
        const maxStrokeSlots = columns - 1; // 减去汉字占用的第1个格子

        for (let j = 0; j < columns; j++) {
          const cellId = `grid-item-${j}-${i}`;

          if (j === 0) {
            // 第一个格子：显示汉字或空米字格
            const renderPromise = (async () => {
              if (currentChar) {
                await handleCharacterRender(cellId, currentChar, i, j, currentChar);
              } else {
                await handleCharacterRender(cellId, '', i, j, '');
              }
            })();
            promises.push(renderPromise);
          } else {
            // 后续格子：根据位置决定显示笔画进度还是米字格
            const renderPromise = (async () => {
              // 等待笔画数量计算完成
              if (currentChar && strokeDisplayCount > 0) {
                const strokeCount = await getCharacterStrokeCount(currentChar);
                const effectiveStrokeDisplayCount = Math.min(strokeDisplayCount, strokeCount, maxStrokeSlots);

                if (j <= effectiveStrokeDisplayCount) {
                  // 显示笔画进度：j=1显示第1笔，j=2显示第1+2笔
                  await handleCharacterRender(cellId, '', i, j, currentChar);
                } else {
                  // 显示空米字格
                  await handleCharacterRender(cellId, '', i, j, '');
                }
              } else {
                // 显示空米字格
                await handleCharacterRender(cellId, '', i, j, '');
              }
            })();
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