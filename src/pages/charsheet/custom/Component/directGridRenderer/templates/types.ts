/**
 * 字帖模板系统类型定义
 * 定义了模板系统的核心接口和类型
 */

import { IRenderOptions, ICharsheetConfig } from '../../../../interface';

/**
 * 模板类型枚举
 */
export enum TemplateType {
  STANDARD = 'standard',        // 标准单列网格模板
  LEFT_RIGHT = 'left_right',    // 左右分栏模板
  SINGLE_ROW = 'single_row',    // 单行网格模板（第一个汉字，后面米字格）
  // 后续可扩展更多模板类型
  // FOUR_GRID = 'four_grid',   // 四宫格模板
  // CUSTOM = 'custom'          // 自定义模板
}

/**
 * 模板渲染参数
 */
export interface TemplateRenderParams {
  charList: string;              // 字符列表
  columns: number;               // 列数
  rowsCount: number;             // 行数限制
  renderOptions: IRenderOptions; // 渲染选项
  config: ICharsheetConfig;      // 字帖配置
  containerRef: React.RefObject<HTMLDivElement | null>; // 容器引用
}

/**
 * 模板渲染结果
 */
export interface TemplateRenderResult {
  success: boolean;              // 是否成功
  totalPages: number;            // 总页数
  totalCells: number;            // 总单元格数
  renderPromises: Promise<void>[]; // 渲染Promise数组
  error?: string;                // 错误信息
}

/**
 * 模板基础接口
 */
export interface IGridTemplate {
  readonly type: TemplateType;   // 模板类型
  readonly name: string;         // 模板名称
  readonly description: string;  // 模板描述
  
  /**
   * 渲染网格
   * @param params 渲染参数
   * @returns 渲染结果
   */
  render(params: TemplateRenderParams): Promise<TemplateRenderResult>;
  
  /**
   * 验证参数是否有效
   * @param params 渲染参数
   * @returns 是否有效
   */
  validateParams(params: TemplateRenderParams): boolean;
  
  /**
   * 计算实际需要的行数
   * @param charCount 字符总数
   * @param columns 列数
   * @param maxRows 最大行数限制
   * @returns 实际行数
   */
  calculateRows(charCount: number, columns: number, maxRows: number): number;
}

/**
 * 模板工厂接口
 */
export interface ITemplateFactory {
  /**
   * 创建模板实例
   * @param type 模板类型
   * @returns 模板实例
   */
  createTemplate(type: TemplateType): IGridTemplate | null;
  
  /**
   * 注册模板
   * @param type 模板类型
   * @param template 模板实例
   */
  registerTemplate(type: TemplateType, template: IGridTemplate): void;
  
  /**
   * 获取所有可用的模板类型
   * @returns 模板类型数组
   */
  getAvailableTemplates(): TemplateType[];
}

/**
 * 页面容器配置
 */
export interface PageContainerConfig {
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