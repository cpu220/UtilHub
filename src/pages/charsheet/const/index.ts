/**
 * 字帖常量统一导出
 * 重构后的模块化结构
 */

// 核心配置
export * from './core';

// 渲染配置
export * from './rendering';

// 数据配置
export * from './data';

// 枚举定义
export * from './enums';

// 向后兼容的导出
export { CharsheetColors } from './core/color.config';
export { GridConfig } from './core/grid.config';
export { FONT_OPTIONS } from './rendering/font.config';
export { TemplateType } from './enums/template.enum';
