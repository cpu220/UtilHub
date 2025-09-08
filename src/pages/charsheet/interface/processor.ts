/**
 * 字帖内容处理器接口定义
 */

import { ContentProcessOptions, ContentProcessResult } from './common';

/**
 * 内容处理器基础接口
 */
export interface IContentProcessor {
  /** 处理器名称 */
  readonly name: string;
  
  /** 检测是否支持该元素 */
  canProcess(elementId: string): boolean;
  
  /** 处理内容，返回分页结果 */
  processContent(options: ContentProcessOptions): Promise<ContentProcessResult>;
}

/**
 * 模板类型枚举
 */
enum TemplateType {
  /** 字帖模板 */
  CHARSHEET = 'charsheet',
  /** 表格模板 */
  TABLE = 'table',
  /** 自定义模板 */
  CUSTOM = 'custom'
}

export { TemplateType };

/**
 * 字帖处理器配置选项
 */
export interface CharsheetProcessorOptions extends ContentProcessOptions {
  /** 字体缩放比例 */
  fontScale?: number;
  /** 每页行数 */
  rowsPerPage?: number;
  /** 是否包含边框调试 */
  debugBorder?: boolean;
}