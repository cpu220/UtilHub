/**
 * 模板类型枚举定义
 */

/**
 * DirectGridRenderer 模板类型枚举
 */
export enum TemplateType {
  STANDARD = 'standard',
  LEFT_RIGHT = 'left_right',
  SINGLE_ROW = 'single_row'
}

/**
 * 内容处理器模板类型枚举
 */
export enum ProcessorTemplateType {
  /** 字帖模板 */
  CHARSHEET = 'charsheet',
  /** 表格模板 */
  TABLE = 'table',
  /** 自定义模板 */
  CUSTOM = 'custom'
}