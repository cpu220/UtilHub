/**
 * 配置相关接口定义
 * 定义字帖配置、渲染选项、打印选项等接口
 */

/**
 * 字帖配置参数
 */
export interface ICharsheetConfig {
  /** 单元格宽度 */
  width: number;
  /** 单元格高度 */
  height: number;
  /** 默认列数 */
  defaultCol: number;
  /** 字体大小 */
  fontSize: number;
}

/**
 * 渲染选项接口
 */
export interface IRenderOptions {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 字体大小 */
  fontSize: number;
  /** 笔画宽度 */
  strokeWidth: number;
  /** 笔画颜色 */
  strokeColor: string;
  /** 偏旁颜色 */
  radicalColor?: string;
  /** 渲染模式 */
  renderMode?: 'stroke' | 'font';
  /** 渲染引擎 */
  renderEngine?: 'hanzi-writer' | 'cnchar-draw';
  /** 字体族 */
  fontFamily?: string;
  /** 字体粗细 */
  fontWeight?: string | number;
  /** 字体样式 */
  fontStyle?: 'normal' | 'italic' | 'oblique';
  /** 字体大小比例 */
  fontSizeRatio?: number;
  /** 内边距 */
  padding?: number;
  /** 使用本地数据 */
  useLocalData?: boolean;
  /** 显示轮廓 */
  showOutline?: boolean;
  /** 轮廓颜色 */
  outlineColor?: string;
  /** 循环间隔延迟 */
  delayBetweenLoops?: number;
  /** 循环动画 */
  loopAnimation?: boolean;
  /** 使用网格背景 */
  useGridBackground: boolean;
  /** 网格颜色 */
  gridColor: string;
}

/**
 * 打印选项接口
 */
export interface IPrintOptions {
  /** 标题 */
  title: string;
  /** 显示预览 */
  showPreview: boolean;
  /** 样式列表 */
  styles: string[];
  /** 打印前回调 */
  onBeforePrint?: () => void | boolean;
  /** 打印后回调 */
  onAfterPrint?: () => void;
  /** 左上角时间 */
  topLeftTime?: string;
  /** 左下角内容 */
  bottomLeftContent?: string;
}

/**
 * 预览选项接口
 */
export interface IPreviewOptions {
  /** 元素ID */
  elementId: string;
  /** 图片类型 */
  imageType?: 'png' | 'jpeg' | 'svg' | 'blob' | 'pixel';
  /** 质量 */
  quality?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** 生成前回调 */
  onBeforeGenerate?: () => void;
  /** 生成后回调 */
  onAfterGenerate?: (dataUrl: string) => void;
  /** 使用Canvg */
  useCanvg?: boolean;
}