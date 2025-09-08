/**
 * 内容处理器模块
 * 负责不同模板的内容裁剪和处理逻辑
 * 与PDF导出工具解耦，支持扩展不同的模板样式
 */

// 导出字帖相关接口（从新位置）
export * from '../../../pages/charsheet/interface';

// 注意：由于模块解析问题，暂时注释掉处理器导出
// 可以直接从各自文件导入：
// import { CharsheetProcessor } from './charsheetProcessor';
// import { processContent } from './processorFactory';