/**
 * 笔画相关常量配置
 * 统一管理笔画展示的默认值和配置
 */

/**
 * 默认笔画展示配置
 */
export const DEFAULT_STROKE_CONFIG = {
  /** 默认笔画大小 */
  STROKE_SIZE: 30,
  /** 默认填充颜色 */
  FILL_COLOR: '#555',
  /** 默认箭头字符 */
  ARROW_CHAR: '→',
  /** 字体比例 */
  FONT_RATIO: 0.6,
  /** 最小容器高度偏移 */
  MIN_HEIGHT_OFFSET: 4
} as const;

/**
 * 默认CSS类名
 */
export const DEFAULT_STROKE_CLASSES = {
  /** 笔画顺序容器类名 */
  STROKE_ORDER_CONTAINER: 'stroke-order-container',
  /** 笔画SVG类名 */
  STROKE_SVG: 'stroke-svg',
  /** 箭头类名 */
  STROKE_ARROW: 'stroke-arrow',
  /** 错误提示类名 */
  ERROR_MESSAGE: 'stroke-error-message',
  /** 无数据提示类名 */
  NO_DATA_MESSAGE: 'stroke-no-data-message'
} as const;

/**
 * 笔画展示状态
 */
export const STROKE_DISPLAY_STATUS = {
  /** 加载中 */
  LOADING: 'loading',
  /** 成功 */
  SUCCESS: 'success',
  /** 错误 */
  ERROR: 'error',
  /** 无数据 */
  NO_DATA: 'no-data'
} as const;

/**
 * 错误消息
 */
export const STROKE_ERROR_MESSAGES = {
  /** 暂无笔画数据 */
  NO_STROKE_DATA: '暂无笔画数据',
  /** 笔画加载失败 */
  LOAD_FAILED: '笔画加载失败',
  /** 字符为空 */
  EMPTY_CHARACTER: '字符不能为空'
} as const;