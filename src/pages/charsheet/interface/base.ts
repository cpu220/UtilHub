/**
 * 字帖相关基础接口定义
 * 统一管理字帖功能中用到的所有基础TypeScript类型
 */

/**
 * 网格中的单个单元格数据类型
 */
export interface IGridItem {
  /** 单元格的X坐标 */
  x: number;
  /** 单元格的Y坐标 */
  y: number;
  /** 单元格中显示的字符 */
  character: string;
}

/**
 * 二维网格数据类型
 */
export type IGridData = IGridItem[][];

/**
 * 字帖配置参数
 */
export interface ICharsheetConfig {
  /** 单元格宽度 */
  width: number;
  /** 单元格高度 */
  height: number;
  /** 默认行数 */
  defaultRow: number;
  /** 默认列数 */
  defaultCol: number;
  /** 字体大小 */
  fontSize: number;
}

/**
 * 渲染汉字时的配置选项
 */
export interface IRenderOptions {
  /** 渲染宽度 */
  width: number;
  /** 渲染高度 */
  height: number;
  /** 字体大小 - 统一控制两种渲染引擎的字符大小 */
  fontSize: number;
  /** 笔画宽度 */
  strokeWidth: number;
  /** 笔画颜色（字体模式下也用作文字颜色） */
  strokeColor: string;
  /** 部首颜色 */
  radicalColor?: string;
  /** 渲染模式：stroke使用笔画渲染引擎，font使用CSS字体模式 */
  renderMode?: 'stroke' | 'font';
  /** 渲染引擎：选择使用哪个笔画渲染引擎 */
  renderEngine?: 'hanzi-writer' | 'cnchar-draw';
  /** 字体族，当renderMode为font时使用 */
  fontFamily?: string;
  /** 字体粗细，当renderMode为font时使用 */
  fontWeight?: string | number;
  /** 字体样式，当renderMode为font时使用 */
  fontStyle?: 'normal' | 'italic' | 'oblique';
  /** 字体大小比例，当renderMode为font时使用 */
  fontSizeRatio?: number;
  /** 内边距 */
  padding?: number;
  /** 是否使用本地字库数据 */
  useLocalData?: boolean;
  /** 是否显示汉字轮廓 */
  showOutline?: boolean;
  /** 轮廓颜色 */
  outlineColor?: string;
  /** 动画循环间隔（毫秒） */
  delayBetweenLoops?: number;
  /** 是否启用动画循环 */
  loopAnimation?: boolean;
  /** 是否使用米字格背景 */
  useGridBackground: boolean;
  /** 米字格线条颜色 */
  gridColor: string;
}

/**
 * 打印配置选项
 */
export interface IPrintOptions {
  /** 打印标题 */
  title: string;
  /** 是否显示预览 */
  showPreview: boolean;
  /** 打印样式 */
  styles: string[];
  /** 打印前回调函数，返回false可阻止打印 */
  onBeforePrint?: () => void | boolean;
  /** 打印后回调函数 */
  onAfterPrint?: () => void;
  /** 左上角时间内容，不传则不显示 */
  topLeftTime?: string;
  /** 左下角内容，不传则不显示 */
  bottomLeftContent?: string;
}

/**
 * 预览图片配置选项
 */
export interface IPreviewOptions {
  /**
   * 图片类型 (png, jpeg, svg等)
   */
  imageType?: 'png' | 'jpeg' | 'svg' | 'blob' | 'pixel';
  
  /**
   * 图片质量 (仅jpeg格式有效)
   */
  quality?: number;
  
  /**
   * 背景色
   */
  backgroundColor?: string;
  
  /**
   * 图片生成前的回调函数
   */
  onBeforeGenerate?: () => void;
  
  /**
   * 图片生成后的回调函数
   */
  onAfterGenerate?: (dataUrl: string) => void;
  
  /**
   * 是否强制使用canvg库处理SVG
   * 对于复杂SVG，特别是hanzi-writer生成的SVG，推荐设置为true
   */
  useCanvg?: boolean;
}

/**
 * 字体库接口
 */
export interface IFontLibrary {
    name: string;
    list: string;
    select?: boolean;
}

/**
 * 字帖工具相关接口
 */
export namespace ICharsheetInterface {
  /** 网格项类型 */
  export type Item = IGridItem;
  /** 网格数据类型 */
  export type Data = IGridData;
  /** 配置参数类型 */
  export type Config = ICharsheetConfig;
  /** 渲染选项类型 */
  export type HanziRenderOptions = IRenderOptions;
  /** 打印选项类型 */
  export type PrintConfig = IPrintOptions;
  /** 预览图片选项类型 */
  export type PreviewConfig = IPreviewOptions;
}