import { IGridItem, IGridData, ICharsheetConfig, IRenderOptions, IPrintOptions } from '../interface';
import { CharsheetColors as DynamicCharsheetColors, getFontScale } from './colorManager';

/**
 * 字体缩放比例，控制页面展示尺寸的
 * 从CSS变量中动态获取
 */
export const FONT_SCALE = getFontScale();

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