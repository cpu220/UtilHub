import { IGridItem, IGridData, ICharsheetConfig, IRenderOptions, IPrintOptions } from '../interface';
import { CharsheetColors as DynamicCharsheetColors, getFontScale, colorManager } from './colorManager';

/**
 * 字体缩放比例，控制页面展示尺寸的
 * 从CSS变量中动态获取
 */
export const FONT_SCALE = getFontScale();

/**
 * 刷新字体缩放比例
 * 清除缓存并重新获取最新的FONT_SCALE值
 * 当CSS变量--charsheet-font-scale发生变化时调用此函数
 */
export const refreshFontScale = (): number => {
  // 清除ColorManager的缓存
  colorManager.clearCache();
  // 重新获取最新的字体缩放比例
  return getFontScale();
};

/**
 * 获取当前的字体缩放比例
 * 每次调用都会获取最新值（不使用缓存）
 */
export const getCurrentFontScale = (): number => {
  return getFontScale();
};

/**
 * 字帖颜色常量
 * 动态从colors.less中的CSS变量获取，确保颜色一致性
 */
export const CharsheetColors = DynamicCharsheetColors;

// 字帖单元格默认配置参数
export const GridConfig: ICharsheetConfig = {
  width: 60 * FONT_SCALE,
  height: 60 * FONT_SCALE,
  fontSize: 60 * FONT_SCALE,
  defaultCol: 10
};

export const FONT_RENDER_ENGINE = {
  CNCHAR_DRAW: 'cnchar-draw' as const,
  HANZI_WRITER: 'hanzi-writer' as const,
} as const;


/**
 * 公共渲染配置（两种模式共用）
 */
const BaseRenderOptions = {
  width: GridConfig.width, // 设置合适的宽度
  height: GridConfig.height, // 设置合适的高度
  fontSize: GridConfig.fontSize, // 统一字体大小，默认等于宽度
  strokeWidth: 3, // 设置笔画宽度
  strokeColor: '#b8b8b8', // 笔画颜色（字体模式下也用作文字颜色）
  radicalColor: '#3889f2', // 偏旁颜色
  useGridBackground: true, // 使用米字格背景
  gridColor: CharsheetColors.GRID_COLOR, // 设置米字格线条颜色
  padding: 5, // 内边距
  useLocalData: true, // 使用本地字库数据
};

/**
 * 笔画模式专用配置
 */
const StrokeRenderOptions = {
  ...BaseRenderOptions,
  renderMode: 'stroke' as const,

  // 渲染引擎配置 - 在此处控制使用哪个渲染引擎
  // renderEngine: FONT_RENDER_ENGINE.CNCHAR_DRAW, // 默认使用 cnchar-draw 渲染引擎
  renderEngine: FONT_RENDER_ENGINE.HANZI_WRITER, // 可切换为 hanzi-writer 渲染引擎

  showOutline: false, // 显示汉字轮廓
  radicalColor: '#3889f2', // 偏旁颜色
  fontSizeRatio: 1, // 默认字体大小比例
  showBorder:true
  // delayBetweenLoops: 2000, // 设置动画循环间隔
  // outlineColor: '#F0F0F0' // 设置轮廓颜色
};

/**
 * 字体模式专用配置
 */
const FontRenderOptions = {
  ...BaseRenderOptions,
  renderMode: 'font' as const,
  fontFamily: '"SimHei", "Heiti SC", "Microsoft YaHei", sans-serif', // 默认字体
  fontSize: GridConfig.width, // 默认字体大小
  fontWeight: 'normal' as const, // 默认字体粗细
  fontStyle: 'normal' as const, // 默认字体样式
  fontSizeRatio: 0.8, // 默认字体大小比例
  // 字体模式下文字颜色使用strokeColor，不需要单独的textColor字段
};





/**
 * 笔画展示通用默认配置
 * 汉字渲染相关的通用默认值统一在此维护
 */
export const STROKE_DEFAULT_CONFIG = {
  /** 基础笔画大小（会根据FONT_SCALE动态调整） */
  BASE_STROKE_SIZE: GridConfig.fontSize * 0.3,
  /** 默认填充颜色 */
  FILL_COLOR: '#7c7b7b', // BaseRenderOptions.strokeColor,
  /** 默认箭头字符 */
  ARROW_CHAR: '→',
  /** 箭头字体大小比例（相对于笔画大小） */
  ARROW_FONT_RATIO: 0.5,
  /** 字体比例 */
  FONT_RATIO: 0.6,
  /** 最小容器高度偏移 */
  MIN_HEIGHT_OFFSET: 4
} as const;

/**
 * 内置的笔画颜色组合（10种颜色）
 * 用于多彩笔画模式，为每个笔画分配不同的颜色
 */
export const STROKE_COLORS = [
  '#3889f2',  
  '#f27c38',  
  '#1ba44e', 
] as const;

/**
 * 获取基于字体缩放比例的笔画大小
 * 根据FONT_SCALE动态计算笔画展示尺寸
 */
export const getStrokeSize = (): number => {
  const fontScale = getCurrentFontScale();
  return Math.round(STROKE_DEFAULT_CONFIG.BASE_STROKE_SIZE * fontScale);
};

/**
 * 获取基于字体缩放比例的箭头字体大小
 * 根据FONT_SCALE动态计算箭头字体尺寸
 */
export const getArrowFontSize = (strokeSize?: number): number => {
  const actualStrokeSize = strokeSize || getStrokeSize();
  return Math.floor(actualStrokeSize * STROKE_DEFAULT_CONFIG.ARROW_FONT_RATIO);
};

/**
 * 笔画CSS类名常量
 * 统一管理笔画相关的CSS类名
 */
export const STROKE_CLASSES = {
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
 * 笔画错误消息常量
 * 统一管理笔画相关的错误提示信息
 */
export const STROKE_ERROR_MESSAGES = {
  /** 暂无笔画数据 */
  NO_STROKE_DATA: '暂无笔画数据',
  /** 笔画加载失败 */
  LOAD_FAILED: '笔画加载失败',
  /** 字符为空 */
  EMPTY_CHARACTER: '字符不能为空'
} as const;

/**
 * hanziWriterRenderer默认配置
 * 汉字渲染器的通用默认参数
 */
export const HANZI_WRITER_DEFAULT_OPTIONS = {
  width: 100,
  height: 100,
  fontSize: 100, // 统一字体大小参数
  padding: 5,
  strokeWidth: 5,
  strokeColor: '#555',
  radicalColor: '#ff0000',
  useGridBackground: false,
  gridColor: '#DDD',
  useLocalData: true, // 控制是否使用本地字库
  showOutline: true
} as const;

/**
 * 笔画展示默认配置
 * SingleRowTemplate笔画展示功能的默认参数
 */
export const STROKE_DISPLAY_DEFAULT_CONFIG = {
  /** 默认笔画展示数量 */
  DEFAULT_STROKE_DISPLAY_COUNT: 3
} as const;


/**
 * 字体选项接口定义
 */
export interface IFontOption {
  /** 字体显示名称，用于在UI中展示给用户 */
  label: string;
  /** CSS字体族值，实际应用到样式中的字体定义 */
  value: string;
  /** 字体分类：system-系统预装字体，custom-自定义字体 */
  category: 'system' | 'custom';
  /** 字体粗细，可选配置，用于特定字体的显示优化 */
  fontWeight?: number | string;
  /** 字体大小比例因子，可选配置，用于调整不同字体的显示大小 */
  fontSizeRatio?: number;
}

/**
 * 字体选项配置
 */
export const FONT_OPTIONS: IFontOption[] = [
  {
    label: '宋体',
    value: '"SimSun", "Songti SC", serif',
    category: 'system'
  },
  {
    label: '黑体',
    value: '"SimHei", "Heiti SC", "Microsoft YaHei", sans-serif',
    category: 'system'
  },
  {
    label: '仿宋',
    value: '"FangSong", "STFangsong", serif',
    category: 'system'
  },
  {
    label: '楷体',
    value: '"KaiTi", "Kaiti SC", cursive',
    category: 'system'
  },
  {
    label: '微软雅黑',
    value: '"Microsoft YaHei", "PingFang SC", sans-serif',
    category: 'system'
  },
  {
    label: '苹方',
    value: '"PingFangSC-Regular", "PingFang SC", sans-serif',
    category: 'system'
  },
  {
    label: '青鸟华光简行楷',
    value: '"青鸟华光简行楷", cursive',
    category: 'custom'
  },
  {
    label: '瘦金体',
    value: '"瘦金体", serif',
    category: 'custom',
    fontSizeRatio: 0.9,
    fontWeight: 400
  }
];

/**
 * 根据渲染模式获取对应的默认配置
 * @param renderMode 渲染模式
 * @returns 对应模式的默认配置
 */
export const getRenderOptionsByMode = (renderMode: 'stroke' | 'font' = 'stroke'): IRenderOptions => {
  switch (renderMode) {
    case 'font':
      console.log('FontRenderOptions', FontRenderOptions);
      return FontRenderOptions;
    case 'stroke':
    default:
      console.log('StrokeRenderOptions', StrokeRenderOptions);
      return StrokeRenderOptions;
  }
};

/**
 * 智能合并渲染配置
 * 根据当前renderMode自动选择正确的基础配置，然后合并用户自定义配置
 * @param currentOptions 当前配置
 * @param updates 更新的配置
 * @returns 合并后的配置
 */
export const mergeRenderOptions = (currentOptions: IRenderOptions, updates: Partial<IRenderOptions>): IRenderOptions => {
  // 如果renderMode发生变化，使用新模式的默认配置作为基础
  const targetMode = updates.renderMode || currentOptions.renderMode || 'stroke';
  const baseOptions = getRenderOptionsByMode(targetMode);

  // 合并配置：基础配置 -> 当前配置 -> 更新配置
  const mergedOptions = {
    ...baseOptions,
    ...currentOptions,
    ...updates
  };

  // 确保关键属性的一致性
  if (updates.renderMode && updates.renderMode !== currentOptions.renderMode) {
    // 模式切换时，重置模式特定的属性
    if (updates.renderMode === 'font') {
      // 切换到字体模式时，确保字体相关属性使用FontRenderOptions的默认值
      mergedOptions.fontSizeRatio = updates.fontSizeRatio ?? FontRenderOptions.fontSizeRatio;
      mergedOptions.fontFamily = updates.fontFamily ?? FontRenderOptions.fontFamily;
      mergedOptions.fontWeight = updates.fontWeight ?? FontRenderOptions.fontWeight;
      mergedOptions.fontStyle = updates.fontStyle ?? FontRenderOptions.fontStyle;
    } else if (updates.renderMode === 'stroke') {
      // 切换到笔画模式时，确保笔画相关属性使用StrokeRenderOptions的默认值
      mergedOptions.fontSizeRatio = updates.fontSizeRatio ?? StrokeRenderOptions.fontSizeRatio;
      mergedOptions.renderEngine = updates.renderEngine ?? StrokeRenderOptions.renderEngine;
    }
  }

  return mergedOptions;
};

/**
 * 导出各模式配置
 */
export { BaseRenderOptions, StrokeRenderOptions, FontRenderOptions };