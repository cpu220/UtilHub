import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, message, App } from 'antd';
import { renderHanziInContainer, cleanupHanziWriter } from '@/utils';
import { IGridItem, IGridData, IRenderOptions } from '../../../interface';
import { GridConfig, CharsheetColors } from '../../../const';
import styles from './index.less';
 

interface GridRendererProps {
    fontList: string;
    renderOptions: IRenderOptions;
}

const GridRenderer: React.FC<GridRendererProps> = ({
    fontList, 
    renderOptions }) => {

    // const [characters, setCharacters] = useState('');
    const [gridData, setGridData] = useState<IGridData>([]);
    const gridContainerRef = useRef<HTMLDivElement>(null);
    
    // 使用useCallback缓存handleTranslate函数，避免不必要的重新创建
    const handleTranslate = useCallback(() => {
        try {
            // 使用ref获取网格容器，更可靠
            const gridContainer = gridContainerRef.current;
            if (!gridContainer) {
                message.error('未找到网格容器');
                return;
            }

            message.info('正在将文本转换为字帖样式...');

            // 先检查网格是否有足够的单元格
            const totalCells = gridData.reduce((acc, row) => acc + row.length, 0);
            const actualCells = document.querySelectorAll('[id^="grid-item-"]').length;
            
            if (actualCells < totalCells) {
                console.warn('DOM单元格数量不足，等待DOM更新...');
                setTimeout(handleTranslate, 200);
                return;
            }

            // 遍历每一行
            gridData.forEach((row, rowIndex) => {
                row.forEach((item, colIndex) => {
                    // 获取对应的DOM元素
                    const cellElement = document.getElementById(`grid-item-${colIndex}-${rowIndex}`);
                    if (cellElement) {
                        // 清空单元格内容
                        cellElement.innerHTML = '';

                        // 设置样式以确保米字格能正确显示
                        cellElement.style.display = 'flex';
                        cellElement.style.alignItems = 'center';
                        cellElement.style.justifyContent = 'center';

                        // 使用 renderHanziInContainer 方法渲染带米字格的汉字
                        renderHanziInContainer(cellElement.id, item.character, renderOptions);
                    }
                });
            });

            message.success('字帖样式转换完成');
        } catch (error) {
            console.error('转换为字帖样式时出错:', error);
            message.error('转换失败，请重试');
        }
    }, [gridData, renderOptions]);

    useEffect(() => {
        // 调用 renderGrid 方法来渲染网格
        const grid = createGrid(GridConfig.defaultCol, GridConfig.defaultRow);
        setGridData(grid);

        // 清理函数 - 移除过早的cleanupHanziWriter调用
        return () => {
            // cleanupHanziWriter('grid-container'); // 移除此行，避免过早清理
        };
    }, [fontList])

    // 当网格数据生成或更新后，自动进行字帖转换
    useEffect(() => {
        if (gridData.length > 0 && gridContainerRef.current) {
            // 增加延迟时间，确保DOM完全更新
            const timer = setTimeout(() => {
                // 在执行转换前先确保网格容器已渲染
                if (gridContainerRef.current && gridContainerRef.current.children.length > 0) {
                    handleTranslate();
                } else {
                    console.warn('网格容器尚未完全渲染，稍后重试');
                    // 再次尝试，确保转换成功
                    const retryTimer = setTimeout(() => {
                        handleTranslate();
                    }, 300);
                    return () => clearTimeout(retryTimer);
                }
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, [gridData, handleTranslate])

    const createFontList = (count: number): string => {
        // const chars = generateRandomChineseCharsString(count);
        // return chars
        // const chars = LEVEL4_LIST;
        // return chars;
        return fontList;
    }

    const createGrid = (x: number, y: number): IGridData => {
        const chars = createFontList(x * y);
        
        const grid: IGridData = [];
        let index = 0;
        for (let i = 0; i < y; i++) {
            const row: IGridItem[] = [];
            for (let j = 0; j < x; j++) {
                row.push({
                    y: i,
                    x: j,
                    character: chars[index++],
                });
            }
            grid.push(row);
        }
        // console.log(grid)
        return grid;
    }



    /**
     * 创建单个方格项
     * @param item 网格项
     * @returns React节点
     */
    const createBlockItem = (item: IGridItem) => {
        return (
            <div
                id={`grid-item-${item.x}-${item.y}`}
                key={item.x + item.y}
                className={styles['grid-item']}
                style={{
                    width: GridConfig.width + 'px',
                    height: GridConfig.height + 'px',
                    border: `1px solid ${CharsheetColors.BORDER_COLOR}`,
                    fontSize: `${GridConfig.width * 0.6}px`,
                }}
            >
                {item.character}
            </div>
        );
    };

    /**
     * 根据createGrid返回的二维数组在页面上创建方格
     * @param grid 二维数组网格数据
     */
    const renderGrid = (grid: IGridData) => {
        const result = [];
        for (let i = 0; i < grid.length; i++) {
            const row = [];
            for (let j = 0; j < grid[i].length; j++) {
                const item = grid[i][j];
                const blockItem = createBlockItem(item);
                row.push(blockItem);
            }
            const rowDOM = (
                <div id={`grid-row-${i}`} key={i} className={styles['grid-row']}> {row}</div>
            );
            result.push(rowDOM);
        }

        return result;
    };

    return (
        <div>
            <div id="translate-button-container">
                {/* <Button type="link" onClick={handleTranslate}>转化为字帖样式</Button> */}
            </div>
            <div id="page-grid-container" className={styles['page-grid-container']}>
                <div id="grid-container" ref={gridContainerRef}>
                    {renderGrid(gridData)}
                </div>
            </div>
        </div>
    );
};

export default GridRenderer;