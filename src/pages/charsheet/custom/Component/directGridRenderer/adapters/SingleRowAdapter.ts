/**
 * 单行模板数据适配器
 */

import { BaseAdapter } from './BaseAdapter';
import { TemplateType, TemplateInputParams, TemplateComponentProps } from './types';

/**
 * 单行模板适配器
 */
export class SingleRowAdapter extends BaseAdapter {
  readonly type = TemplateType.SINGLE_ROW;

  /**
   * 处理单行模板的数据
   */
  public processData(params: TemplateInputParams): TemplateComponentProps {
    const baseProps = super.processData(params);
    
    return {
      ...baseProps,
      onRenderComplete: (stats) => {
        console.log('单行模板渲染完成:', stats);
      }
    };
  }

  /**
   * 验证单行模板参数
   */
  public validateParams(params: TemplateInputParams): boolean {
    if (!super.validateParams(params)) {
      return false;
    }

    // 单行模板没有额外的验证要求
    return true;
  }

  /**
   * 计算单行模式下的行数
   * 每行显示一个字符，所以行数等于字符数量
   */
  protected calculateRows(charCount: number, columns: number): number {
    return charCount; // 单行模板：每行一个字符
  }

  /**
   * 获取单行模板的页面配置
   */
  protected getDefaultPageConfig() {
    return super.getDefaultPageConfig({
      rowsPerPage: 8, // 单行模板每页8行
      marginBottom: '20px',
      padding: '20px'
    });
  }
}