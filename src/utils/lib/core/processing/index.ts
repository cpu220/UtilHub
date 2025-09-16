/**
 * 内容处理器模块
 * 负责不同模板的内容裁剪和处理逻辑
 * 与PDF导出工具解耦，支持扩展不同的模板样式
 */

// 导出字帖相关接口（从正确位置）
export * from '@/pages/charsheet/interface';

// 导出处理器相关功能
export { CharsheetProcessor } from './charsheetProcessor';
export { processContent } from './processorFactory';