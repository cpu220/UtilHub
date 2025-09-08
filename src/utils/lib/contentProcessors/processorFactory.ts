/**
 * 内容处理器工厂
 * 根据元素类型自动选择合适的处理器
 */

import { IContentProcessor, TemplateType } from '../../../pages/charsheet/interface/processor';
import { CharsheetProcessor } from './charsheetProcessor';

/**
 * 内容处理器工厂类
 */
export class ContentProcessorFactory {
  private static processors: Map<TemplateType, IContentProcessor> = new Map();
  
  static {
    // 注册默认处理器
    this.registerProcessor(TemplateType.CHARSHEET, new CharsheetProcessor());
  }

  /**
   * 注册处理器
   */
  static registerProcessor(type: TemplateType, processor: IContentProcessor): void {
    this.processors.set(type, processor);
    console.log(`已注册内容处理器: ${type} -> ${processor.name}`);
  }

  /**
   * 获取指定类型的处理器
   */
  static getProcessor(type: TemplateType): IContentProcessor | null {
    return this.processors.get(type) || null;
  }

  /**
   * 自动检测并获取合适的处理器
   */
  static getProcessorForElement(elementId: string): IContentProcessor | null {
    // 按优先级检测处理器
    for (const [type, processor] of this.processors) {
      if (processor.canProcess(elementId)) {
        console.log(`为元素 ${elementId} 选择处理器: ${processor.name}`);
        return processor;
      }
    }
    
    console.warn(`未找到适合元素 ${elementId} 的处理器`);
    return null;
  }

  /**
   * 获取所有已注册的处理器
   */
  static getAllProcessors(): Array<{ type: TemplateType; processor: IContentProcessor }> {
    return Array.from(this.processors.entries()).map(([type, processor]) => ({
      type,
      processor
    }));
  }

  /**
   * 检查是否支持指定元素
   */
  static canProcess(elementId: string): boolean {
    return this.getProcessorForElement(elementId) !== null;
  }
}

/**
 * 便捷函数：处理内容
 */
export async function processContent(options: {
  sourceElementId: string;
  templateType?: TemplateType;
  quality?: number;
  backgroundColor?: string;
  scale?: number;
}) {
  const { sourceElementId, templateType, ...processOptions } = options;
  
  let processor: IContentProcessor | null;
  
  if (templateType) {
    // 使用指定的处理器类型
    processor = ContentProcessorFactory.getProcessor(templateType);
    if (!processor) {
      throw new Error(`未找到类型为 ${templateType} 的处理器`);
    }
  } else {
    // 自动检测处理器
    processor = ContentProcessorFactory.getProcessorForElement(sourceElementId);
    if (!processor) {
      throw new Error(`未找到适合元素 ${sourceElementId} 的处理器`);
    }
  }
  
  return await processor.processContent({
    sourceElementId,
    ...processOptions
  });
}