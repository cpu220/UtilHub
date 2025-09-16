/**
 * 渲染配置相关常量
 * 统一管理渲染选项、渲染模式等配置
 */

import { IRenderOptions } from '@/pages/charsheet/interface';

// 临时内联配置以避免循环依赖
const GridConfig = {
  width: 60,
  height: 60,
  fontSize: 60,
  defaultCol: 10
};

const CharsheetColors = {
  get BORDER_COLOR() { return '#ddd'; },
  get GRID_COLOR() { return '#ddd'; }
} as const;
// 临时内联定义，避免循环依赖
const FONT_RENDER_ENGINE = {
  CNCHAR_DRAW: 'cnchar-draw' as const,
  HANZI_WRITER: 'hanzi-writer' as const,
} as const;

/**
 * 基础渲染选项
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
 * 笔画模式渲染选项
 */
const StrokeRenderOptions = {
  ...BaseRenderOptions,
  renderMode: 'stroke' as const,
  // 笔画模式特有配置
  renderEngine: FONT_RENDER_ENGINE.HANZI_WRITER, // 可切换为 hanzi-writer 渲染引擎
  // 其他笔画模式配置
  showOutline: false, // 显示汉字轮廓
  radicalColor: '#3889f2', // 偏旁颜色
  fontSizeRatio: 1, // 默认字体大小比例
  showBorder: true
  // 其他配置...
};

/**
 * 字体模式渲染选项
 */
const FontRenderOptions = {
  ...BaseRenderOptions,
  renderMode: 'font' as const,
  fontFamily: '"SimHei", "Heiti SC", "Microsoft YaHei", sans-serif', // 默认字体
  fontSize: GridConfig.width, // 默认字体大小
  fontWeight: 'normal' as const, // 默认字体粗细
  fontStyle: 'normal' as const, // 默认字体样式
  fontSizeRatio: 0.8, // 默认字体大小比例
  // 其他字体模式配置...
};

/**
 * HanziWriter 默认选项
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
 * 根据渲染模式获取渲染选项
 * @param renderMode 渲染模式
 * @returns 对应的渲染选项
 */
export const getRenderOptionsByMode = (renderMode: 'stroke' | 'font' = 'stroke'): IRenderOptions => {
  switch (renderMode) {
    case 'font':
      return { ...FontRenderOptions };
    case 'stroke':
    default:
      return { ...StrokeRenderOptions };
  }
};

/**
 * 智能合并渲染选项
 * @param currentOptions 当前选项
 * @param updates 更新选项
 * @returns 合并后的选项
 */
export const mergeRenderOptions = (currentOptions: IRenderOptions, updates: Partial<IRenderOptions>): IRenderOptions => {
  const merged = { ...currentOptions, ...updates };
  
  // 智能处理字体大小同步
  if (updates.fontSize !== undefined) {
    merged.width = updates.fontSize;
    merged.height = updates.fontSize;
  }
  
  // 智能处理渲染模式切换
  if (updates.renderMode && updates.renderMode !== currentOptions.renderMode) {
    const baseOptions = getRenderOptionsByMode(updates.renderMode);
    // 保留用户自定义的配置，但应用新模式的默认配置
    Object.keys(baseOptions).forEach(key => {
      if (!(key in updates)) {
        (merged as any)[key] = (baseOptions as any)[key];
      }
    });
  }
  
  return merged;
};

// 导出基础配置
export { BaseRenderOptions, StrokeRenderOptions, FontRenderOptions };