/**
 * DirectGridRenderer 相关接口定义
 */

import { IRenderOptions, ICharsheetConfig } from '@/pages/charsheet/interface';
import { TemplateType } from '@/pages/charsheet/const';

/**
 * 渲染统计信息
 */
export interface RenderStats {
  totalPages: number;
  totalCells: number;
  renderTime: number;
}

/**
 * 模板组件 Props 接口
 */
export interface TemplateComponentProps {
  charList: string;
  columns: number;
  renderOptions: IRenderOptions;
  config: ICharsheetConfig;
  onRenderComplete?: (stats: RenderStats) => void;
  /** 笔画展示数量（仅SingleRowTemplate使用）
   * 0: 后面全都是米字格
   * 1: 第2个格子显示第1笔，其余是米字格
   * n: 第2到第n+1个格子显示笔画进度，其余是米字格
   * 最大值不能超过 columns-1
   */
  strokeDisplayCount?: number;
}

/**
 * DirectGridRenderer 组件属性
 */
export interface DirectGridRendererProps {
  fontList: string;
  templateType: TemplateType;
  renderOptions: IRenderOptions;
  config: ICharsheetConfig;
  onRenderComplete?: (stats: RenderStats) => void;
  /** 笔画展示数量（仅SingleRowTemplate使用）
   * 0: 后面全都是米字格
   * 1: 第2个格子显示第1笔，其余是米字格
   * n: 第2到第n+1个格子显示笔画进度，其余是米字格
   * 最大值不能超过 columns-1
   */
  strokeDisplayCount?: number;
}

/**
 * 页面配置
 */
export interface PageConfig {
  rowsPerPage: number;           // 每页行数
  pageBreakAfter: boolean;       // 是否在页面后分页
  marginBottom: string;          // 底部边距
  padding: string;               // 内边距
  debugBorder?: boolean;         // 是否显示调试边框
}

/**
 * 单元格配置
 */
export interface CellConfig {
  width: number;                 // 宽度
  height: number;                // 高度
  marginLeft?: string;           // 左边距
  fontSize?: string;             // 字体大小
  border?: string;               // 边框
}

/**
 * 行配置
 */
export interface RowConfig {
  marginBottom?: string;         // 底部边距
  specialSpacing?: {             // 特殊间距配置
    every5th?: string;           // 每5行的间距
    every15th?: string;          // 每15行的间距
  };
}