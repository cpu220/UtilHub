/**
 * 模板系统统一导出
 * 提供模板组件和类型定义的统一入口
 */

// 导出模板组件
export { default as StandardGridTemplate } from './StandardGridTemplate';
export { default as LeftRightGridTemplate } from './LeftRightGridTemplate';
export { default as SingleRowTemplate } from './SingleRowTemplate';

// 导出工具函数
export * from '../hooks/useGridRenderer';
export * from '../utils/componentUtils';