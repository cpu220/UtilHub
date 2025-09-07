import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { renderHanziInContainer } from '@/utils';
import { IGridItem, IGridData, IRenderOptions, ICharsheetConfig } from '../../../interface';
import { CharsheetColors } from '../../../const';
import styles from './index.less';

interface DirectGridRendererProps {
    fontList: string;
    renderOptions: IRenderOptions;
    config: ICharsheetConfig;
}

// 使用const.tsx中定义的网格配置

/**
 * 直接网格渲染器组件
 * 优化的网格渲染逻辑，采用生成一个网格就转换一个的方式
 * 当fontList变更时，完全重新生成网格内容
 */
const DirectGridRenderer: React.FC<DirectGridRendererProps> = ({
    fontList,
    renderOptions,
    config
}) => {
    const gridContainerRef = useRef<HTMLDivElement>(null);

    // 当fontList变化时，重新生成整个网格
    useEffect(() => {
        if (!fontList || fontList.length === 0) {
            message.error('字体列表为空');
            return;
        }
        console.log(fontList)
        message.info('正在生成新的字帖...');

        // 使用setTimeout确保DOM已准备好
        const timer = setTimeout(() => {
            if (gridContainerRef.current) {
                // 清空容器
                gridContainerRef.current.innerHTML = '';

                // 直接生成并渲染网格
                renderGridDirectly(fontList, config.defaultCol, config.defaultRow);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [fontList, config.defaultCol, config.defaultRow, renderOptions, renderOptions.radicalColor, config.width, config.height]);

    /**
     * 直接渲染网格，生成一个单元格就转换一个
     */
    const renderGridDirectly = (charList: string, columns: number, rowsCount: number) => {
        try {
            if (!gridContainerRef.current) {
                throw new Error('网格容器不存在');
            }

            // 根据用户要求的算法逻辑：先计算fontList长度，再根据行列参数计算行数
            const totalChars = charList.length;

            // 计算可以整除的完整行数和余数
            const fullRows = Math.floor(totalChars / columns);
            const remainder = totalChars % columns;

            // 总实际行数 = 完整行数 + (余数 > 0 ? 1 : 0)
            const actualRows = fullRows + (remainder > 0 ? 1 : 0);

            // 使用实际需要的行数，但不超过传入的rowsCount限制
            const finalRows = Math.min(actualRows, rowsCount);

            console.log(`字体列表长度: ${totalChars}, 列数: ${columns}, 完整行数: ${fullRows}, 余数: ${remainder}, 计算实际行数: ${actualRows}, 最终使用行数: ${finalRows}`);

            // 创建行和单元格
            let currentIndex = 0;
            const renderPromises: Promise<void>[] = [];

            for (let i = 0; i < finalRows && currentIndex < totalChars; i++) {
                const rowElement = document.createElement('div');
                rowElement.id = `direct-grid-row-${i}`;
                rowElement.className = styles['grid-row'];

                // 每5行增加更大的底部间距
                if ((i + 1) % 15 === 0) {
                    rowElement.style.marginBottom = '40px';
                } else if ((i + 1) % 5 === 0) {
                    rowElement.style.marginBottom = '20px';
                }


                gridContainerRef.current.appendChild(rowElement);

                // 优先满足列数
                for (let j = 0; j < columns && currentIndex < totalChars; j++) {
                    const char = charList[currentIndex];
                    const cellId = `direct-grid-item-${j}-${i}`;

                    // 创建单元格
                    const cellElement = document.createElement('div');
                    cellElement.id = cellId;
                    cellElement.className = styles['grid-item'];
                    cellElement.style.width = `${config.width}px`;
                    cellElement.style.height = `${config.height}px`;
                    cellElement.style.border = `1px solid ${CharsheetColors.BORDER_COLOR}`;
                    cellElement.style.fontSize = `${config.width * 0.6}px`;
                    cellElement.style.display = 'flex';
                    cellElement.style.alignItems = 'center';
                    cellElement.style.justifyContent = 'center';

                    // 第一个元素不设置左边距
                    if (j === 0) {
                        cellElement.style.marginLeft = '0';
                    }

                    rowElement.appendChild(cellElement);

                    // 直接渲染汉字到单元格
                    // 使用Promise确保渲染完成
                    const renderPromise = new Promise<void>((resolve) => {
                        setTimeout(() => {
                            try {
                                renderHanziInContainer(cellId, char, renderOptions);
                                resolve();
                            } catch (error) {
                                console.error(`渲染字符 ${char} 失败:`, error);
                                // 失败时显示原字符
                                if (document.getElementById(cellId)) {
                                    (document.getElementById(cellId) as HTMLElement).innerText = char;
                                }
                                resolve();
                            }
                        }, 50); // 小延迟确保DOM已经挂载
                    });

                    renderPromises.push(renderPromise);
                    currentIndex++;
                }
            }

            // 等待所有渲染完成
            Promise.all(renderPromises).then(() => {
                message.success('字帖生成完成');
            });

        } catch (error) {
            console.error('生成网格时出错:', error);
            message.error('字帖生成失败，请重试');
        }
    };

    return (
        <div>
            <div id="page-grid-container" className={styles['page-grid-container']}>
                <div id="grid-container" ref={gridContainerRef}>
                    {/* 网格内容将通过JS直接渲染 */}
                </div>
            </div>
        </div>
    );
};

export default DirectGridRenderer;