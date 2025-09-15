/**
 * 标准网格模板数据适配器
 */

import { BaseAdapter } from './BaseAdapter';
import { TemplateType, TemplateInputParams, TemplateComponentProps } from './types';

/**
 * 标准网格模板适配器
 */
export class StandardAdapter extends BaseAdapter {
  readonly type = TemplateType.STANDARD;

  /**
   * 处理标准网格模板的数据
   */
  public processData(params: TemplateInputParams): TemplateComponentProps {
    const baseProps = super.processData(params);
    
    // 标准模板不需要特殊的数据处理，直接返回基础属性
    return {
      ...baseProps,
      onRenderComplete: (stats) => {
        console.log('标准网格模板渲染完成:', stats);
      }
    };
  }

  /**
   * 验证标准网格模板参数
   */
  public validateParams(params: TemplateInputParams): boolean {
    if (!super.validateParams(params)) {
      return false;
    }

    // 标准模板没有额外的验证要求
    return true;
  }
}