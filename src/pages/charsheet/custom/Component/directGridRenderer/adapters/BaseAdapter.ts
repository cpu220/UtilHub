/**
 * 基础数据适配器
 * 提供通用的数据处理和配置功能
 */

import { CharsheetColors, FONT_SCALE } from '../../../../const';
import {
  IDataAdapter,
  TemplateType,
  TemplateInputParams,
  TemplateComponentProps,
  PageConfig,
  CellConfig,
  RowConfig
} from './types';

/**
 * 基础适配器抽象类
 */
export abstract class BaseAdapter implements IDataAdapter {
  abstract readonly type: TemplateType;

  /**
   * 处理输入数据，转换为模板所需格式
   */
  public processData(params: TemplateInputParams): TemplateComponentProps {
    if (!this.validateParams(params)) {
      throw new Error('参数验证失败');
    }

    return {
      charList: params.charList,
      columns: params.columns,
      renderOptions: params.renderOptions,
      config: params.config
    };
  }

  /**
   * 验证输入参数
   */
  public validateParams(params: TemplateInputParams): boolean {
    if (!params.charList || params.charList.length === 0) {
      console.error('字符列表不能为空');
      return false;
    }

    if (!params.columns || params.columns <= 0) {
      console.error('列数必须大于0');
      return false;
    }

    if (!params.renderOptions) {
      console.error('渲染选项不能为空');
      return false;
    }

    if (!params.config) {
      console.error('配置参数不能为空');
      return false;
    }

    return true;
  }

  /**
   * 获取默认页面配置
   */
  protected getDefaultPageConfig(overrides?: Partial<PageConfig>): PageConfig {
    return {
      rowsPerPage: 15,
      pageBreakAfter: true,
      marginBottom: '20px',
      padding: '20px',
      debugBorder: false,
      ...overrides
    };
  }

  /**
   * 获取默认单元格配置
   */
  protected getDefaultCellConfig(config: any): CellConfig {
    return {
      width: config.width || 60 * FONT_SCALE,
      height: config.height || 60 * FONT_SCALE,
      marginLeft: '6px',
      fontSize: `${(config.fontSize || config.width || 60 * FONT_SCALE) * 0.6}px`,
      border: `1px solid ${CharsheetColors.BORDER_COLOR}`
    };
  }

  /**
   * 获取默认行配置
   */
  protected getDefaultRowConfig(): RowConfig {
    return {
      marginBottom: '5px',
      specialSpacing: {
        every5th: '20px',
        every15th: '30px'
      }
    };
  }

  /**
   * 计算实际需要的行数
   */
  protected calculateRows(charCount: number, columns: number): number {
    return Math.ceil(charCount / columns);
  }

  /**
   * 计算总页数
   */
  protected calculatePages(rows: number, rowsPerPage: number): number {
    return Math.ceil(rows / rowsPerPage);
  }
}