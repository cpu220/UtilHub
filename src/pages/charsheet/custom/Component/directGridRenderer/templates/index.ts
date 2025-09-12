/**
 * 字帖模板系统入口文件
 * 统一导出所有模板相关的类型、接口、实现和工厂
 */

// 导出类型定义
export * from './types';

// 导出基础类和接口
export { BaseGridTemplate } from './BaseGridTemplate';

// 导出具体模板实现
export { StandardGridTemplate } from './StandardGridTemplate';
export { LeftRightGridTemplate } from './LeftRightGridTemplate';

// 导出工厂类和便捷函数
export { GridTemplateFactory, templateFactory } from './TemplateFactory';
export { createTemplate, getAllTemplateInfo } from './TemplateFactory';

// 导出样式管理系统
export {
  TemplateStyleManager,
  templateStyleManager,
  loadTemplateStyles,
  getTemplatePrintStyles,
  getCombinedPrintStyles
} from './styles/templateStyles';
export type { TemplateStyleConfig } from './styles/templateStyles';