/**
 * 模板样式配置管理
 * 根据TemplateType动态加载对应的CSS样式
 */

import { TemplateType } from '../types';

/**
 * 模板样式配置接口
 */
export interface TemplateStyleConfig {
  /** 模板类型 */
  type: TemplateType;
  /** 模板名称 */
  name: string;
  /** 屏幕显示样式 */
  screenStyles: string;
  /** 打印专用样式 */
  printStyles: string;
}

/**
 * 标准网格模板样式
 */
const STANDARD_TEMPLATE_STYLES: TemplateStyleConfig = {
  type: TemplateType.STANDARD,
  name: '标准网格',
  screenStyles: `
    .grid-item {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: calc(6px * var(--charsheet-font-scale, 1));
      box-sizing: border-box;
    }
    
    .grid-item:first-child {
      margin-left: 0;
    }
    
    .grid-item:nth-child(5n) {
      margin-right: calc(12px * var(--charsheet-font-scale, 1));
    }
    
    .grid-row {
      display: flex;
      margin-bottom: calc(10px * var(--charsheet-font-scale, 1));
    }
    
    .grid-row:nth-child(5n) {
      margin-bottom: calc(20px * var(--charsheet-font-scale, 1));
    }
  `,
  printStyles: `
    @media print {
      .grid-item {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        page-break-inside: avoid;
        margin: 2px;
        box-sizing: border-box !important;
      }
      
      .grid-row {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        width: 100% !important;
        page-break-inside: avoid;
      }
    }
  `
};

/**
 * 单行网格模板样式
 */
const SINGLE_ROW_TEMPLATE_STYLES: TemplateStyleConfig = {
  type: TemplateType.SINGLE_ROW,
  name: '单行网格',
  screenStyles: `
    .single-row-with-stroke-container {
      display: block;
      width: 100%;
      margin-bottom: calc(15px * var(--charsheet-font-scale, 1));
    }
    
    .single-row-with-stroke-container:nth-child(5n) {
      margin-bottom: calc(25px * var(--charsheet-font-scale, 1));
    }
    
    .stroke-order-container {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: #666;
      line-height: 1.2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .single-row-container {
      display: flex;
      width: 100%;
      margin-bottom: calc(5px * var(--charsheet-font-scale, 1));
    }
    
    .single-row-item {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: calc(6px * var(--charsheet-font-scale, 1));
      box-sizing: border-box;
    }
    
    .single-row-item:first-child {
      margin-left: 0;
    }
  `,
  printStyles: `
    @media print {
      .single-row-with-stroke-container {
        display: block !important;
        width: 100% !important;
        page-break-inside: avoid;
        margin-bottom: 15px !important;
      }
      
      .stroke-order-container {
        display: flex !important;
        align-items: center !important;
        margin-bottom: 6px !important;
        color: #666 !important;
        line-height: 1.2 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        page-break-inside: avoid;
      }
      
      .single-row-container {
        display: flex !important;
        width: 100% !important;
        page-break-inside: avoid;
        margin-bottom: 5px !important;
      }
      
      .single-row-item {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        box-sizing: border-box !important;
        page-break-inside: avoid;
        margin: 2px;
      }
    }
  `
};

/**
 * 左右分栏模板样式
 */
const LEFT_RIGHT_TEMPLATE_STYLES: TemplateStyleConfig = {
  type: TemplateType.LEFT_RIGHT,
  name: '左右分栏网格',
  screenStyles: `
    .lr-row-container {
      display: flex;
      width: 100%;
      margin-bottom: calc(10px * var(--charsheet-font-scale, 1));
    }
    
    .lr-row-container:nth-child(5n) {
      margin-bottom: calc(20px * var(--charsheet-font-scale, 1));
    }
    
    .left-column, .right-column {
      display: flex;
      width: 50%;
      justify-content: flex-start;
    }
    
    .right-column {
      margin-left: 20px;
    }
    
    .lr-cell {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
    }
    
    .lr-cell:not(:first-child) {
      margin-left: 6px;
    }
  `,
  printStyles: `
    @media print {
      .lr-row-container {
        display: flex !important;
        width: 100% !important;
        page-break-inside: avoid;
        margin-bottom: 10px !important;
        flex-wrap: nowrap !important;
      }
      
      .left-column, .right-column {
        display: flex !important;
        width: 50% !important;
        justify-content: flex-start !important;
        flex-wrap: nowrap !important;
        page-break-inside: avoid;
      }
      
      .right-column {
        margin-left: 20px !important;
      }
      
      .lr-cell {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        box-sizing: border-box !important;
        page-break-inside: avoid;
        flex-shrink: 0;
        margin: 2px;
      }
      
      .lr-cell:not(:first-child) {
        margin-left: 6px !important;
      }
    }
  `
};

/**
 * 通用样式（所有模板共享）
 */
const COMMON_STYLES: string = `
  .page-container {
    display: block;
    width: 100%;
    margin-bottom: 20px;
    page-break-after: always;
    overflow: visible;
  }
  
  .page-grid-container {
    border-radius: 10px;
    width: calc(720px * var(--charsheet-font-scale, 1));
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow: auto;
  }
  
  @media print {
    .page-container {
      page-break-after: always !important;
      width: 100% !important;
    }
    
    .page-grid-container {
      width: 100% !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      padding: 10px !important;
    }
    
    .no-print {
      display: none !important;
    }
  }
`;

/**
 * 模板样式配置映射
 */
const TEMPLATE_STYLES_MAP = new Map<TemplateType, TemplateStyleConfig>([
  [TemplateType.STANDARD, STANDARD_TEMPLATE_STYLES],
  [TemplateType.LEFT_RIGHT, LEFT_RIGHT_TEMPLATE_STYLES],
  [TemplateType.SINGLE_ROW, SINGLE_ROW_TEMPLATE_STYLES]
]);

/**
 * 动态样式管理器
 */
export class TemplateStyleManager {
  private static instance: TemplateStyleManager;
  private loadedStyles = new Set<TemplateType>();
  private styleElements = new Map<string, HTMLStyleElement>();

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): TemplateStyleManager {
    if (!TemplateStyleManager.instance) {
      TemplateStyleManager.instance = new TemplateStyleManager();
    }
    return TemplateStyleManager.instance;
  }

  /**
   * 加载模板样式
   * @param templateType 模板类型
   */
  public loadTemplateStyles(templateType: TemplateType): void {
    // 如果已经加载过，直接返回
    if (this.loadedStyles.has(templateType)) {
      return;
    }

    const styleConfig = TEMPLATE_STYLES_MAP.get(templateType);
    if (!styleConfig) {
      console.warn(`未找到模板类型 ${templateType} 的样式配置`);
      return;
    }

    // 加载通用样式（只加载一次）
    this.loadCommonStyles();

    // 加载模板特定样式
    this.injectStyles(`template-${templateType}`, styleConfig.screenStyles + styleConfig.printStyles);
    
    this.loadedStyles.add(templateType);
    console.log(`已加载模板样式: ${styleConfig.name}`);
  }

  /**
   * 获取模板的打印样式
   * @param templateType 模板类型
   * @returns 打印样式字符串
   */
  public getTemplatePrintStyles(templateType: TemplateType): string {
    const styleConfig = TEMPLATE_STYLES_MAP.get(templateType);
    if (!styleConfig) {
      return '';
    }
    return styleConfig.printStyles;
  }

  /**
   * 获取所有已注册模板的打印样式
   * @param templateTypes 模板类型数组
   * @returns 合并的打印样式字符串
   */
  public getCombinedPrintStyles(templateTypes: TemplateType[]): string {
    const styles = templateTypes
      .map(type => this.getTemplatePrintStyles(type))
      .filter(style => style.length > 0);
    
    return COMMON_STYLES + '\n' + styles.join('\n');
  }

  /**
   * 卸载模板样式
   * @param templateType 模板类型
   */
  public unloadTemplateStyles(templateType: TemplateType): void {
    const styleId = `template-${templateType}`;
    const styleElement = this.styleElements.get(styleId);
    
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
      this.styleElements.delete(styleId);
      this.loadedStyles.delete(templateType);
      console.log(`已卸载模板样式: ${templateType}`);
    }
  }

  /**
   * 注册新的模板样式
   * @param styleConfig 样式配置
   */
  public registerTemplateStyle(styleConfig: TemplateStyleConfig): void {
    TEMPLATE_STYLES_MAP.set(styleConfig.type, styleConfig);
    console.log(`已注册新模板样式: ${styleConfig.name}`);
  }

  /**
   * 加载通用样式
   */
  private loadCommonStyles(): void {
    if (!this.styleElements.has('common')) {
      this.injectStyles('common', COMMON_STYLES);
    }
  }

  /**
   * 注入样式到页面
   * @param id 样式元素ID
   * @param css CSS内容
   */
  private injectStyles(id: string, css: string): void {
    // 检查是否已存在
    if (this.styleElements.has(id)) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = `template-style-${id}`;
    styleElement.textContent = css;
    
    document.head.appendChild(styleElement);
    this.styleElements.set(id, styleElement);
  }
}

/**
 * 导出单例实例
 */
export const templateStyleManager = TemplateStyleManager.getInstance();

/**
 * 便捷函数：加载模板样式
 */
export const loadTemplateStyles = (templateType: TemplateType): void => {
  templateStyleManager.loadTemplateStyles(templateType);
};

/**
 * 便捷函数：获取模板打印样式
 */
export const getTemplatePrintStyles = (templateType: TemplateType): string => {
  return templateStyleManager.getTemplatePrintStyles(templateType);
};

/**
 * 便捷函数：获取合并的打印样式
 */
export const getCombinedPrintStyles = (templateTypes: TemplateType[]): string => {
  return templateStyleManager.getCombinedPrintStyles(templateTypes);
};