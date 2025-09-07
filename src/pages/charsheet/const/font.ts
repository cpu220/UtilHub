import { IGridItem, IGridData, ICharsheetConfig, IRenderOptions, IPrintOptions } from '../interface';

/**
 * 字帖颜色常量
 */
export const CharsheetColors = {
  // 边框和米字格颜色
  BORDER_COLOR: '#ddd',
  GRID_COLOR: '#DDD'
} as const;

// 字帖单元格默认配置参数
export const GridConfig: ICharsheetConfig = {
  width: 60,
  height: 60,
  defaultRow: 250,
  defaultCol: 10
};



/**
 * 公共渲染配置（两种模式共用）
 */
const BaseRenderOptions = {
  width: GridConfig.width, // 设置合适的宽度
  height: GridConfig.height, // 设置合适的高度
  strokeWidth: 3, // 设置笔画宽度
  strokeColor: '#b8b8b8', // 笔画颜色（字体模式下也用作文字颜色）
  radicalColor: '#3889f2', // 偏旁颜色
  useGridBackground: true, // 使用米字格背景
  gridColor: CharsheetColors.GRID_COLOR, // 设置米字格线条颜色

};

/**
 * 笔画模式专用配置
 */
const StrokeRenderOptions = {
  ...BaseRenderOptions,
  renderMode: 'stroke' as const,
  showOutline: false, // 显示汉字轮廓
  radicalColor: '#3889f2', // 偏旁颜色
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
  // 字体模式下文字颜色使用strokeColor，不需要单独的textColor字段
};



/**
 * 字体选项配置
 */
export const FONT_OPTIONS = [
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
    category: 'custom'
  }
];

/**
 * 导出各模式配置
 */
export { BaseRenderOptions, StrokeRenderOptions, FontRenderOptions };