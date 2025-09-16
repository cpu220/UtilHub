/**
 * 字帖相关接口统一导出
 * 重构后的模块化结构
 */

// 核心接口
export * from './core';

// 渲染接口
export * from './rendering';

// 导出接口
export * from './export';

// 处理接口
export * from './processing';

// 基础接口（向后兼容）
export * from './base';

// 向后兼容的具体导出
export type { IGridItem, IGridData, IFontLibrary } from './core/grid.interface';
export type { ICharsheetConfig, IRenderOptions, IPrintOptions, IPreviewOptions } from './core/config.interface';
export type { RenderStats, TemplateComponentProps, DirectGridRendererProps } from './rendering/render.interface';
export type { PDFExportOptions } from './export/pdf.interface';
export type { IContentProcessor } from './processing/processor.interface';
export type { PageContent, ContentProcessResult } from './processing/content.interface';