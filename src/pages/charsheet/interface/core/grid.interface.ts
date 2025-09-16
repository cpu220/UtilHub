/**
 * 网格相关接口定义
 * 定义网格数据结构和字库相关接口
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
 * 字库接口
 */
export interface IFontLibrary {
  /** 字库名称 */
  name: string;
  /** 字符列表 */
  list: string;
  /** 是否选中 */
  select?: boolean;
}