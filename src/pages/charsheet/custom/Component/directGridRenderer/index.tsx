import React, { useState, useEffect, useRef, useMemo } from 'react';
import { message } from 'antd';
import {
    renderHanziInContainer,
    FontRenderer
} from '@/utils';
import { IGridItem, IGridData, IRenderOptions, ICharsheetConfig } from '../../../interface';
import { CharsheetColors, FONT_SCALE } from '../../../const';
import {
    TemplateType,
    createTemplate,
    TemplateRenderParams,
    loadTemplateStyles
} from './templates';
import styles from './index.less';

interface DirectGridRendererProps {
    fontList: string;
    renderOptions: IRenderOptions;
    config: ICharsheetConfig;
    templateType?: TemplateType; // 新增：模板类型选择
    onRenderComplete?: (result: { totalPages: number; totalCells: number }) => void; // 新增：渲染完成回调
}

// 使用const.tsx中定义的网格配置

/**
 * 直接网格渲染器组件
 * 支持多种模板的网格渲染逻辑，采用模板系统实现不同布局
 * 当fontList或templateType变更时，完全重新生成网格内容
 */
const DirectGridRenderer: React.FC<DirectGridRendererProps> = ({
    fontList,
    renderOptions,
    config,
    templateType = TemplateType.SINGLE_ROW, // 默认使用标准模板
    onRenderComplete
}) => {
    const gridContainerRef = useRef<HTMLDivElement>(null);
    // 使用 useMemo 来优化依赖项，只有关键属性变化时才重新渲染
    const renderKey = useMemo(() => {
        return `${fontList}-${templateType}-${config.defaultCol}-${config.defaultRow}-${renderOptions.strokeColor}-${renderOptions.radicalColor}-${config.width}-${config.height}-${renderOptions.renderMode}-${renderOptions.fontFamily}-${renderOptions.fontSize}-${renderOptions.fontWeight}-${renderOptions.fontStyle}`;
    }, [fontList,
        templateType,
        config.defaultCol,
        config.defaultRow,
        renderOptions.strokeColor,
        renderOptions.radicalColor,
        config.width, config.height,
        renderOptions.renderMode,
        renderOptions.fontFamily,
        renderOptions.fontSize,
        renderOptions.fontWeight,
        renderOptions.fontStyle
    ]);

    // 当关键渲染参数变化时，重新生成整个网格
    useEffect(() => {
        if (!fontList || fontList.length === 0) {
            message.error('字体列表为空');
            return;
        }
        
        // 动态加载模板样式
        loadTemplateStyles(templateType);
        
        message.info(`正在生成新的字帖 (${templateType})...`);

        // 使用setTimeout确保DOM已准备好
        const timer = setTimeout(() => {
            renderWithTemplate();
        }, 100);

        return () => clearTimeout(timer);
    }, [renderKey]); // 只依赖于 renderKey

    /**
     * 使用模板系统渲染网格
     */
    const renderWithTemplate = async () => {
        if (!gridContainerRef.current) {
            message.error('网格容器不存在');
            return;
        }

        try {
            // 创建模板实例
            const template = createTemplate(templateType);
            if (!template) {
                message.error(`不支持的模板类型: ${templateType}`);
                return;
            }

            // 准备渲染参数
            const renderParams: TemplateRenderParams = {
                charList: fontList,
                columns: config.defaultCol,
                rowsCount: config.defaultRow,
                renderOptions,
                config,
                containerRef: gridContainerRef
            };

            // 执行渲染
            const result = await template.render(renderParams);
            
            if (result.success) {
                // 等待所有渲染完成
                try {
                    await Promise.all(result.renderPromises);
                    message.success(`字帖生成完成 (${template.name})`);
                    console.log(`渲染完成: ${result.totalPages}页, ${result.totalCells}个单元格`);
                    
                    // 触发渲染完成回调
                    if (onRenderComplete) {
                        onRenderComplete({
                            totalPages: result.totalPages,
                            totalCells: result.totalCells
                        });
                    }
                } catch (renderError) {
                    console.error('渲染过程中出现错误:', renderError);
                    message.warning('部分内容渲染可能不完整');
                    
                    // 即使有错误，也触发回调（但标记为可能不完整）
                    if (onRenderComplete) {
                        onRenderComplete({
                            totalPages: result.totalPages,
                            totalCells: result.totalCells
                        });
                    }
                }
            } else {
                message.error(`字帖生成失败: ${result.error}`);
            }
        } catch (error) {
            console.error('模板渲染失败:', error);
            message.error('字帖生成失败，请重试');
        }
    };

    // 原有的renderGridDirectly方法已被模板系统替代
    // 如需兼容性支持，可以通过StandardGridTemplate实现

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