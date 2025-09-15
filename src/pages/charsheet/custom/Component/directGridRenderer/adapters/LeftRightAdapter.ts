/**
 * 左右分栏模板数据适配器
 */

import { BaseAdapter } from './BaseAdapter';
import { TemplateType, TemplateInputParams, TemplateComponentProps } from './types';

/**
 * 左右分栏模板适配器
 */
export class LeftRightAdapter extends BaseAdapter {
  readonly type = TemplateType.LEFT_RIGHT;

  /**
   * 处理左右分栏模板的数据
   */
  public processData(params: TemplateInputParams): TemplateComponentProps {
    const baseProps = super.processData(params);
    
    // 左右分栏模板需要确保列数为偶数
    const adjustedColumns = params.columns % 2 === 0 ? params.columns : params.columns - 1;
    
    return {
      ...baseProps,
      columns: adjustedColumns,
      onRenderComplete: (stats) => {
        console.log('左右分栏模板渲染完成:', stats);
      }
    };
  }

  /**
   * 验证左右分栏模板参数
   */
  public validateParams(params: TemplateInputParams): boolean {
    if (!super.validateParams(params)) {
      return false;
    }

    // 左右分栏模式要求列数必须为偶数
    if (params.columns % 2 !== 0) {
      console.warn('左右分栏模式建议列数为偶数，将自动调整为', params.columns - 1);
    }

    return true;
  }

  /**
   * 计算左右分栏模式下的行数
   * 每行消耗2个字符（左栏1个，右栏1个）
   */
  protected calculateRows(charCount: number, columns: number): number {
    const charsPerRow = 2; // 左右分栏，每行消耗2个字符
    return Math.ceil(charCount / charsPerRow);
  }
}