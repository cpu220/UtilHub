/**
 * DirectGridRenderer 组件
 * 统一的网格渲染器，根据模板类型调用对应的模板组件
 */

import React, { useMemo, useRef, useState, useCallback } from 'react';
import { IRenderOptions, ICharsheetConfig } from '../../../interface';
import StandardGridTemplate from './templates/StandardGridTemplate';
import LeftRightGridTemplate from './templates/LeftRightGridTemplate';
import SingleRowTemplate from './templates/SingleRowTemplate';
import { STROKE_DISPLAY_DEFAULT_CONFIG } from '../../../const/font';

/**
 * 模板类型枚举
 */
export enum TemplateType {
  STANDARD = 'standard',
  LEFT_RIGHT = 'left_right',
  SINGLE_ROW = 'single_row'
}

/**
 * 渲染统计信息
 */
export interface RenderStats {
  totalPages: number;
  totalCells: number;
  renderTime: number;
}

/**
 * 模板组件 Props 接口
 */
export interface TemplateComponentProps {
  charList: string;
  columns: number;
  renderOptions: IRenderOptions;
  config: ICharsheetConfig;
  onRenderComplete?: (stats: RenderStats) => void;
  /** 笔画展示数量（仅SingleRowTemplate使用）
   * 0: 后面全都是米字格
   * 1: 第2个格子显示第1笔，其余是米字格
   * n: 第2到第n+1个格子显示笔画进度，其余是米字格
   * 最大值不能超过 columns-1
   */
  strokeDisplayCount?: number;
}

/**
 * DirectGridRenderer 组件属性
 */
interface DirectGridRendererProps {
  fontList: string;
  templateType: TemplateType;
  renderOptions: IRenderOptions;
  config: ICharsheetConfig;
  onRenderComplete?: (stats: RenderStats) => void;
  /** 笔画展示数量（仅SingleRowTemplate使用）
   * 0: 后面全都是米字格
   * 1: 第2个格子显示第1笔，其余是米字格
   * n: 第2到第n+1个格子显示笔画进度，其余是米字格
   * 最大值不能超过 columns-1
   */
  strokeDisplayCount?: number;
}

/**
 * DirectGridRenderer 组件
 */
const DirectGridRenderer: React.FC<DirectGridRendererProps> = ({
  fontList,
  templateType,
  renderOptions,
  config,
  onRenderComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderStats, setRenderStats] = useState<RenderStats | null>(null);  
  const [strokeDisplayCount, setStrokeDisplayCount] = useState<number>(STROKE_DISPLAY_DEFAULT_CONFIG.DEFAULT_STROKE_DISPLAY_COUNT);

  // 使用 useMemo 来优化依赖项，只有关键属性变化时才重新渲染
  const renderKey = useMemo(() => {
    return `${fontList}-${templateType}-${config.defaultCol}-${renderOptions.strokeColor}-${renderOptions.radicalColor}-${config.width}-${config.height}-${renderOptions.renderMode}-${renderOptions.fontFamily}-${renderOptions.fontSize}-${renderOptions.fontWeight}-${renderOptions.fontStyle}`;
  }, [
    fontList,
    templateType,
    config.defaultCol,
    renderOptions.strokeColor,
    renderOptions.radicalColor,
    config.width,
    config.height,
    renderOptions.renderMode,
    renderOptions.fontFamily,
    renderOptions.fontSize,
    renderOptions.fontWeight,
    renderOptions.fontStyle
  ]);

  // 处理渲染完成回调
  const handleRenderComplete = useCallback((stats: RenderStats) => {
    setRenderStats(stats);
    onRenderComplete?.(stats);
    console.log(`${templateType} 模板渲染完成:`, stats);
  }, [templateType, onRenderComplete]);

  // 直接准备模板属性，无需适配器
  const templateProps = useMemo(() => {
    return {
      charList: fontList,
      columns: config.defaultCol,
      renderOptions,
      config,
      onRenderComplete: handleRenderComplete,
      strokeDisplayCount
    };
  }, [fontList, config.defaultCol, renderOptions, config, strokeDisplayCount]);

  // 根据模板类型渲染对应的模板组件
  const renderTemplate = () => {
    console.log('renderTemplate', templateType);
    switch (templateType) {
      case TemplateType.STANDARD:
        return <StandardGridTemplate {...templateProps} />;
      case TemplateType.LEFT_RIGHT:
        return <LeftRightGridTemplate {...templateProps} />;
      case TemplateType.SINGLE_ROW:
        return <SingleRowTemplate {...templateProps} strokeDisplayCount={strokeDisplayCount} />;
      default:
        console.error('不支持的模板类型:', templateType);
        return <div>不支持的模板类型: {templateType}</div>;
    }
  };

  return (
    <div key={renderKey}>
      <div id="translate-button-container">
        {/* 可以在这里添加工具按钮 */}
      </div>
      <div id="page-grid-container" className="page-grid-container">
        <div id="grid-container" ref={containerRef}>
          {renderTemplate()}
        </div>
      </div>
      {renderStats && (
        <div className="render-stats" style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          渲染统计: {renderStats.totalPages} 页, {renderStats.totalCells} 个单元格, 耗时 {renderStats.renderTime}ms
        </div>
      )}
    </div>
  );
};

export default DirectGridRenderer;