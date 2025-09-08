/**
 * 字帖相关接口统一导出
 * 按功能模块分类导出，便于维护和使用
 */

// 通用接口
export * from './common';

// 内容处理器接口
export * from './processor';

// PDF导出接口
export * from './pdf';

// 便捷类型别名
export type { PageContent, ContentProcessResult } from './common';
export type { IContentProcessor } from './processor';
export type { PDFExportOptions, PDFPageConfig } from './pdf';