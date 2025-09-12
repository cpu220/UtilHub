/**
 * 模板工厂
 * 负责创建和管理不同类型的网格模板
 */

import {
  ITemplateFactory,
  IGridTemplate,
  TemplateType
} from './types';
import { StandardGridTemplate } from './StandardGridTemplate';
import { LeftRightGridTemplate } from './LeftRightGridTemplate';

/**
 * 网格模板工厂实现
 */
export class GridTemplateFactory implements ITemplateFactory {
  private static instance: GridTemplateFactory;
  private templates: Map<TemplateType, () => IGridTemplate> = new Map();

  private constructor() {
    this.registerDefaultTemplates();
  }

  /**
   * 获取工厂单例实例
   */
  public static getInstance(): GridTemplateFactory {
    if (!GridTemplateFactory.instance) {
      GridTemplateFactory.instance = new GridTemplateFactory();
    }
    return GridTemplateFactory.instance;
  }

  /**
   * 注册默认模板
   */
  private registerDefaultTemplates(): void {
    // 注册标准网格模板
    this.templates.set(TemplateType.STANDARD, () => new StandardGridTemplate());
    
    // 注册左右分栏模板
    this.templates.set(TemplateType.LEFT_RIGHT, () => new LeftRightGridTemplate());
    
    console.log('已注册默认模板:', Array.from(this.templates.keys()));
  }

  /**
   * 创建模板实例
   */
  public createTemplate(type: TemplateType): IGridTemplate | null {
    const templateFactory = this.templates.get(type);
    if (!templateFactory) {
      console.error(`未找到模板类型: ${type}`);
      return null;
    }
    
    try {
      const template = templateFactory();
      console.log(`创建模板实例: ${template.name} (${type})`);
      return template;
    } catch (error) {
      console.error(`创建模板实例失败: ${type}`, error);
      return null;
    }
  }

  /**
   * 注册新模板
   */
  public registerTemplate(type: TemplateType, template: IGridTemplate): void {
    if (this.templates.has(type)) {
      console.warn(`模板类型 ${type} 已存在，将被覆盖`);
    }
    
    this.templates.set(type, () => template);
    console.log(`注册模板: ${template.name} (${type})`);
  }

  /**
   * 注册模板工厂函数
   */
  public registerTemplateFactory(
    type: TemplateType, 
    factory: () => IGridTemplate
  ): void {
    if (this.templates.has(type)) {
      console.warn(`模板类型 ${type} 已存在，将被覆盖`);
    }
    
    this.templates.set(type, factory);
    console.log(`注册模板工厂: ${type}`);
  }

  /**
   * 获取所有可用的模板类型
   */
  public getAvailableTemplates(): TemplateType[] {
    return Array.from(this.templates.keys());
  }

  /**
   * 获取模板信息
   */
  public getTemplateInfo(type: TemplateType): { name: string; description: string } | null {
    const template = this.createTemplate(type);
    if (!template) {
      return null;
    }
    
    return {
      name: template.name,
      description: template.description
    };
  }

  /**
   * 获取所有模板信息
   */
  public getAllTemplateInfo(): Array<{
    type: TemplateType;
    name: string;
    description: string;
  }> {
    return this.getAvailableTemplates().map(type => {
      const info = this.getTemplateInfo(type);
      return {
        type,
        name: info?.name || type,
        description: info?.description || ''
      };
    });
  }

  /**
   * 检查模板是否存在
   */
  public hasTemplate(type: TemplateType): boolean {
    return this.templates.has(type);
  }

  /**
   * 移除模板
   */
  public removeTemplate(type: TemplateType): boolean {
    const existed = this.templates.has(type);
    this.templates.delete(type);
    
    if (existed) {
      console.log(`移除模板: ${type}`);
    }
    
    return existed;
  }

  /**
   * 清空所有模板
   */
  public clearAllTemplates(): void {
    this.templates.clear();
    console.log('已清空所有模板');
  }

  /**
   * 重置为默认模板
   */
  public resetToDefaults(): void {
    this.clearAllTemplates();
    this.registerDefaultTemplates();
    console.log('已重置为默认模板');
  }
}

/**
 * 导出工厂单例实例
 */
export const templateFactory = GridTemplateFactory.getInstance();

/**
 * 便捷函数：创建模板
 */
export const createTemplate = (type: TemplateType): IGridTemplate | null => {
  return templateFactory.createTemplate(type);
};

/**
 * 便捷函数：获取可用模板
 */
export const getAvailableTemplates = (): TemplateType[] => {
  return templateFactory.getAvailableTemplates();
};

/**
 * 便捷函数：获取所有模板信息
 */
export const getAllTemplateInfo = () => {
  return templateFactory.getAllTemplateInfo();
};