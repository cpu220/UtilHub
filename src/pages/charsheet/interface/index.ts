/**
 * 字帖相关接口统一导出
 * 按功能模块分类导出，便于维护和使用
 */

// 基础接口
export * from './base';

// 通用接口
export * from './common';

// 内容处理器接口
export * from './processor';

// PDF导出接口
export * from './pdf';

// 笔画相关接口
export * from './stroke';

// 便捷类型别名
export type { PageContent, ContentProcessResult } from './common';
export type { IContentProcessor } from './processor';
export type { PDFExportOptions, PDFPageConfig } from './pdf';
export type { StrokeDisplayConfig, StrokeOrderContainerConfig, StrokeJSXElement, StrokeDisplayResult, RowConfigWithStroke } from './stroke';