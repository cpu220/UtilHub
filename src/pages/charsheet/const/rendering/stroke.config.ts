/**
 * 笔画配置相关常量
 * 统一管理笔画展示、颜色、样式等配置
 */

// 临时内联GridConfig以避免循环依赖
const GridConfig = {
  width: 60,
  height: 60,
  fontSize: 60,
  defaultCol: 10
};

/**
 * 笔画默认配置
 */
export const STROKE_DEFAULT_CONFIG = {
  /** 基础笔画大小 */
  BASE_STROKE_SIZE: GridConfig.fontSize * 0.3,
  /** 填充颜色 */
  FILL_COLOR: '#7c7b7b',
  /** 箭头字符 */
  ARROW_CHAR: '→',
  /** 箭头字体比例 */
  ARROW_FONT_RATIO: 0.5,
  /** 字体比例 */
  FONT_RATIO: 0.6,
  /** 最小高度偏移 */
  MIN_HEIGHT_OFFSET: 4
} as const;

/**
 * 笔画颜色数组
 * 用于多笔画时的颜色区分
 */
export const STROKE_COLORS = [
  '#3889f2',  // 蓝色
  '#f27c38',  // 橙色
  '#1ba44e',  // 绿色
] as const;

/**
 * 获取笔画大小
 */
export const getStrokeSize = (): number => {
  return STROKE_DEFAULT_CONFIG.BASE_STROKE_SIZE;
};

/**
 * 获取箭头字体大小
 */
export const getArrowFontSize = (strokeSize?: number): number => {
  const size = strokeSize || getStrokeSize();
  return size * STROKE_DEFAULT_CONFIG.ARROW_FONT_RATIO;
};

/**
 * 笔画相关CSS类名
 */
export const STROKE_CLASSES = {
  /** 笔画顺序容器 */
  STROKE_ORDER_CONTAINER: 'stroke-order-container',
  /** 笔画SVG */
  STROKE_SVG: 'stroke-svg',
  /** 笔画箭头 */
  STROKE_ARROW: 'stroke-arrow',
  /** 错误消息 */
  ERROR_MESSAGE: 'stroke-error-message',
  /** 无数据消息 */
  NO_DATA_MESSAGE: 'stroke-no-data-message'
} as const;

/**
 * 笔画错误消息
 */
export const STROKE_ERROR_MESSAGES = {
  /** 无笔画数据 */
  NO_STROKE_DATA: '暂无笔画数据',
  /** 加载失败 */
  LOAD_FAILED: '笔画加载失败',
  /** 空字符 */
  EMPTY_CHARACTER: '字符不能为空'
} as const;

/**
 * 笔画展示默认配置
 */
export const STROKE_DISPLAY_DEFAULT_CONFIG = {
  /** 默认笔画展示数量 */
  DEFAULT_STROKE_DISPLAY_COUNT: 3
} as const;