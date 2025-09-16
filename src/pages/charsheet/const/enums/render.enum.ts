/**
 * 渲染相关枚举定义
 */

/**
 * 字体渲染引擎枚举
 */
export const FONT_RENDER_ENGINE = {
  CNCHAR_DRAW: 'cnchar-draw' as const,
  HANZI_WRITER: 'hanzi-writer' as const,
} as const;

/**
 * 渲染模式枚举
 */
export const RENDER_MODE = {
  STROKE: 'stroke' as const,
  FONT: 'font' as const,
} as const;

/**
 * 字体样式枚举
 */
export const FONT_STYLE = {
  NORMAL: 'normal' as const,
  ITALIC: 'italic' as const,
  OBLIQUE: 'oblique' as const,
} as const;

/**
 * 字体粗细枚举
 */
export const FONT_WEIGHT = {
  NORMAL: 'normal' as const,
  BOLD: 'bold' as const,
  LIGHTER: 'lighter' as const,
  BOLDER: 'bolder' as const,
} as const;