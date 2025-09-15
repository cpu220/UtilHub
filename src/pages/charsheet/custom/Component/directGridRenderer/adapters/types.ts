/**
 * 数据适配器类型定义
 * 负责不同模板间的数据转换和适配
 */

import React from 'react';
import { IRenderOptions, ICharsheetConfig } from '../../../../interface';

/**
 * 模板类型枚举
 */
export enum TemplateType {
  STANDARD = 'standard',        // 标准单列网格模板
  LEFT_RIGHT = 'left_right',    // 左右分栏模板
  SINGLE_ROW = 'single_row',    // 单行网格模板
}

/**
 * 通用模板输入参数
 */
export interface TemplateInputParams {
  charList: string;              // 字符列表
  columns: number;               // 列数
  renderOptions: IRenderOptions; // 渲染选项
  config: ICharsheetConfig;      // 字帖配置
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
}

/**
 * 渲染统计信息
 */
export interface RenderStats {
  totalPages: number;
  totalCells: number;
  renderTime: number;
}

/**
 * 模板函数组件类型
 */
export type TemplateComponent = React.FC<TemplateComponentProps>;

/**
 * 数据适配器接口
 */
export interface IDataAdapter {
  /**
   * 适配器类型
   */
  readonly type: TemplateType;
  
  /**
   * 处理输入数据，转换为模板所需格式
   */
  processData(params: TemplateInputParams): TemplateComponentProps;
  
  /**
   * 验证输入参数
   */
  validateParams(params: TemplateInputParams): boolean;
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