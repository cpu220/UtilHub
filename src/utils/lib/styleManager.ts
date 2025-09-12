/**
 * 统一样式管理工具
 * 以web渲染样式为主，自动同步到打印和导出场景
 */

/**
 * 获取元素的所有计算样式
 * @param element DOM元素
 * @returns 样式对象
 */
export const getComputedStyles = (element: HTMLElement): CSSStyleDeclaration => {
  return window.getComputedStyle(element);
};

/**
 * 将计算样式转换为内联样式字符串
 * @param computedStyle 计算样式对象
 * @param excludeProps 要排除的属性列表
 * @returns 内联样式字符串
 */
export const computedStyleToInline = (
  computedStyle: CSSStyleDeclaration,
  excludeProps: string[] = []
): string => {
  let styleText = '';
  
  // 需要保留的重要样式属性
  const importantProps = [
    'display', 'position', 'width', 'height', 'margin', 'padding',
    'border', 'background', 'color', 'font-family', 'font-size', 'font-weight',
    'line-height', 'text-align', 'vertical-align', 'flex', 'flex-direction',
    'flex-wrap', 'justify-content', 'align-items', 'gap', 'box-sizing'
  ];
  
  for (const prop of importantProps) {
    if (!excludeProps.includes(prop)) {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'initial' && value !== 'inherit') {
        styleText += `${prop}: ${value}; `;
      }
    }
  }
  
  return styleText;
};

/**
 * 递归克隆元素并应用计算样式
 * @param element 要克隆的元素
 * @param preserveClasses 是否保留CSS类名
 * @returns 克隆的元素
 */
export const cloneElementWithComputedStyles = (
  element: HTMLElement,
  preserveClasses: boolean = true
): HTMLElement => {
  const clone = element.cloneNode(true) as HTMLElement;
  
  // 获取并应用计算样式
  const computedStyle = getComputedStyles(element);
  const inlineStyle = computedStyleToInline(computedStyle);
  
  // 应用内联样式
  clone.style.cssText = inlineStyle;
  
  // 可选择是否保留类名（用于调试）
  if (!preserveClasses) {
    clone.className = '';
  }
  
  // 递归处理子元素
  const originalChildren = Array.from(element.children) as HTMLElement[];
  const clonedChildren = Array.from(clone.children) as HTMLElement[];
  
  originalChildren.forEach((originalChild, index) => {
    if (originalChild instanceof HTMLElement && clonedChildren[index]) {
      const styledChild = cloneElementWithComputedStyles(originalChild, preserveClasses);
      clone.replaceChild(styledChild, clonedChildren[index]);
    }
  });
  
  return clone;
};

/**
 * 为打印优化元素样式
 * @param element 要优化的元素
 * @returns 优化后的元素
 */
export const optimizeForPrint = (element: HTMLElement): HTMLElement => {
  const optimized = cloneElementWithComputedStyles(element);
  
  // 添加打印特有的样式
  const addPrintStyles = (el: HTMLElement) => {
    // 防止分页截断
    el.style.pageBreakInside = 'avoid';
    
    // 确保颜色在打印时显示
    el.style.setProperty('-webkit-print-color-adjust', 'exact');
    el.style.setProperty('color-adjust', 'exact');
    
    // 递归处理子元素
    Array.from(el.children).forEach(child => {
      if (child instanceof HTMLElement) {
        addPrintStyles(child);
      }
    });
  };
  
  addPrintStyles(optimized);
  return optimized;
};

/**
 * 创建用于打印的完整HTML文档
 * @param element 要打印的元素
 * @param title 文档标题
 * @param additionalStyles 额外的样式
 * @returns 完整的HTML文档字符串
 */
export const createPrintDocument = (
  element: HTMLElement,
  title: string = '字帖打印',
  additionalStyles: string = ''
): string => {
  const optimizedElement = optimizeForPrint(element);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        /* 基础打印样式 */
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 10px;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        
        ${additionalStyles}
      </style>
    </head>
    <body>
      ${optimizedElement.outerHTML}
    </body>
    </html>
  `;
};

/**
 * 样式管理器类
 */
export class StyleManager {
  private static instance: StyleManager;
  
  public static getInstance(): StyleManager {
    if (!StyleManager.instance) {
      StyleManager.instance = new StyleManager();
    }
    return StyleManager.instance;
  }
  
  /**
   * 获取元素的打印样式
   */
  public getPrintStyles(elementId: string): string {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with id ${elementId} not found`);
      return '';
    }
    
    const printDocument = createPrintDocument(element as HTMLElement);
    return printDocument;
  }
  
  /**
   * 应用统一样式到元素
   */
  public applyUnifiedStyles(element: HTMLElement): HTMLElement {
    return optimizeForPrint(element);
  }
}

// 导出单例实例
export const styleManager = StyleManager.getInstance();

// 导出便捷函数
export const getPrintStyles = (elementId: string): string => {
  return styleManager.getPrintStyles(elementId);
};

export const applyUnifiedStyles = (element: HTMLElement): HTMLElement => {
  return styleManager.applyUnifiedStyles(element);
};