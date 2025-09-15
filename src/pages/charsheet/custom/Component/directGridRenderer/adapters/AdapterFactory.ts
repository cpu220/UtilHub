/**
 * 适配器工厂
 * 负责根据模板类型创建对应的数据适配器
 */

import { TemplateType, IDataAdapter } from './types';
import { StandardAdapter } from './StandardAdapter';
import { LeftRightAdapter } from './LeftRightAdapter';
import { SingleRowAdapter } from './SingleRowAdapter';

/**
 * 适配器工厂类
 */
export class AdapterFactory {
  private static adapters: Map<TemplateType, IDataAdapter> = new Map();

  /**
   * 初始化所有适配器
   */
  static {
    AdapterFactory.adapters.set(TemplateType.STANDARD, new StandardAdapter());
    AdapterFactory.adapters.set(TemplateType.LEFT_RIGHT, new LeftRightAdapter());
    AdapterFactory.adapters.set(TemplateType.SINGLE_ROW, new SingleRowAdapter());
  }

  /**
   * 根据模板类型获取适配器
   */
  public static getAdapter(type: TemplateType): IDataAdapter {
    const adapter = AdapterFactory.adapters.get(type);
    if (!adapter) {
      throw new Error(`不支持的模板类型: ${type}`);
    }
    return adapter;
  }

  /**
   * 获取所有可用的模板类型
   */
  public static getAvailableTypes(): TemplateType[] {
    return Array.from(AdapterFactory.adapters.keys());
  }

  /**
   * 注册新的适配器
   */
  public static registerAdapter(type: TemplateType, adapter: IDataAdapter): void {
    AdapterFactory.adapters.set(type, adapter);
  }
}