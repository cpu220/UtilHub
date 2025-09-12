/**
 * 打印工具类
 * 提供通用的打印功能，支持选择性打印指定HTML元素
 */

import { renderPrintTemplate } from '@/pages/charsheet/template/templateLoader';

/**
 * 打印配置选项
 */
export interface PrintOptions {
  /**
   * 是否在打印前显示打印预览
   */
  showPreview?: boolean;

  /**
   * 打印样式
   */
  styles?: string[];

  /**
   * 打印前的回调函数
   */
  onBeforePrint?: () => void;

  /**
   * 打印后的回调函数
   */
  onAfterPrint?: () => void;
  
  /**
   * 左上角时间内容，不传则不显示
   */
  topLeftTime?: string;
  
  /**
   * 左下角内容，不传则不显示
   */
  bottomLeftContent?: string;

  /**
   * 打印标题
   */
  title?: string;
}

/**
 * 获取元素的所有计算样式并应用为内联样式
 * @param element 要处理的DOM元素
 * @returns 处理后的元素克隆
 */
const cloneElementWithInlineStyles = (element: HTMLElement): HTMLElement => {
  // 克隆元素
  const clone = element.cloneNode(true) as HTMLElement;
  
  // 获取元素的计算样式
  const computedStyle = window.getComputedStyle(element);
  
  // 将计算样式应用为内联样式
  let styleText = '';
  for (let i = 0; i < computedStyle.length; i++) {
    const prop = computedStyle[i];
    const value = computedStyle.getPropertyValue(prop);
    styleText += `${prop}: ${value}; `;
  }
  clone.style.cssText = styleText;
  
  // 递归处理所有子元素
  Array.from(clone.children).forEach(child => {
    if (child instanceof HTMLElement) {
      // 递归克隆子元素，保留其样式
      const styledChild = cloneElementWithInlineStyles(child);
      clone.replaceChild(styledChild, child);
    }
  });
  
  return clone;
};

/**
 * 创建一个包含元素和其所有样式的完整HTML片段
 * @param elementId 元素ID
 * @returns 包含完整样式的HTML字符串
 */
const createStyledHtmlForElement = (elementId: string): string => {
  // 获取要打印的元素
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }
  
  // 克隆元素并应用内联样式
  const styledElement = cloneElementWithInlineStyles(element);
  
  // 获取元素的类名和ID，确保样式选择器匹配
  const classNames = element.className;
  const elementIdName = element.id;
  
  // 创建一个临时容器，用于收集所有应用的样式
  const tempContainer = document.createElement('div');
  tempContainer.appendChild(styledElement);
  
  // 为了确保样式在打印窗口中正确应用，我们添加额外的内联样式块
  let extraStyles = '';
  
  // 查找与该元素相关的所有CSS规则
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      if (sheet.cssRules) {
        Array.from(sheet.cssRules).forEach(rule => {
          // 查找可能影响该元素的规则
          if (rule instanceof CSSStyleRule) {
            // 检查元素是否匹配这个规则
            if (element.matches(rule.selectorText)) {
              extraStyles += `${rule.selectorText} { ${rule.style.cssText} }\n`;
            }
            // 特殊处理网格相关样式（grid-row, grid-item, 左右分栏样式）
            if (rule.selectorText.includes('.grid-row') || rule.selectorText.includes('.grid-item') || 
                rule.selectorText.includes('#grid-container') || rule.selectorText.includes('#' + elementIdName) ||
                rule.selectorText.includes('.lr-row-container') || rule.selectorText.includes('.left-column') ||
                rule.selectorText.includes('.right-column') || rule.selectorText.includes('.lr-cell') ||
                rule.selectorText.includes('.page-container') || rule.selectorText.includes('.page-grid-container')) {
              extraStyles += `${rule.selectorText} { ${rule.style.cssText} }\n`;
            }
          }
        });
      }
    } catch (e) {
      // 忽略跨域样式表错误
      console.warn('Cannot access stylesheet:', e);
    }
  });
  
  // 获取原始元素的计算样式，特别是布局相关的样式
  const elementStyle = window.getComputedStyle(element);
  const displayStyle = elementStyle.display;
  const flexDirection = elementStyle.flexDirection;
  const justifyContent = elementStyle.justifyContent;
  const flexWrap = elementStyle.flexWrap;
  
  // 直接返回带有内联样式的元素HTML，避免重复的ID和不必要的嵌套
  const htmlWithStyles = `
    ${tempContainer.innerHTML}
    <style>
      /* 复制的元素特定样式 */
      ${extraStyles}
      /* 网格项打印专用样式 */
      .grid-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
      }
      .grid-item {
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        page-break-inside: avoid;
        margin: 2px;
      }
      /* 左右分栏打印专用样式 */
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
      /* 打印专用重置样式 */
      body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
      @media print {
        .no-print { display: none !important; }
      }
      /* 确保内容可见性 */
      #${elementIdName} {
        display: ${displayStyle} !important;
        width: 100% !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    </style>
  `;
  
  return htmlWithStyles;
};

/**
 * 打印指定ID的HTML元素
 * @param elementId 要打印的HTML元素ID
 * @param options 打印配置选项
 */
export const printElementById = async (elementId: string, options: PrintOptions = {}): Promise<void> => {
  const {
    showPreview = false,
    styles = [],
    onBeforePrint,
    onAfterPrint,
    title = document.title,
    topLeftTime,
    bottomLeftContent
  } = options;

  try {
    // 调用打印前的回调
    if (onBeforePrint && typeof onBeforePrint === 'function') {
      onBeforePrint();
    }

    // 获取要打印的元素
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      return;
    }

    // 创建一个新的窗口用于打印
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    // 使用函数创建包含完整样式的HTML内容
    const styledHtml = createStyledHtmlForElement(elementId);
    
    // 准备附加内容和专用样式
    let additionalContent = '';
    let additionalStyles = '';
    
    // 只有在有内容时才添加元素和样式
    if (topLeftTime || bottomLeftContent) {
      // 添加打印专用样式
      additionalStyles = `
        <style>
          /* 打印媒体查询特定样式 */
          @media print {
            .print-header, .print-footer {
              position: fixed !important;
              z-index: 1000 !important;
              font-size: 12px !important;
            }
            .print-content {
              margin-top: 20px !important;
              margin-bottom: 20px !important;
            }
          }
          /* 屏幕预览样式 */
          // .print-header, .print-footer {
          //   position: absolute;
          //   font-size: 12px;
          //   background: white;
          //   padding: 2px 5px;
          // }
          .print-container {
            position: relative;
            min-height: calc(100vh - 40px);
          }
        </style>
      `;
      
      // 如果有左上角时间，添加到附加内容
      // if (topLeftTime) {
      //   additionalContent += `<div class="print-header" style="top: 0; left: 0;">${topLeftTime}</div>`;
      // }
      
      // // 如果有左下角内容，添加到附加内容
      // if (bottomLeftContent) {
      //   additionalContent += `<div class="print-footer" style="bottom: 0; left: 0;">${bottomLeftContent}</div>`;
      // }
    }
    
    // 创建包含所有必要样式和附加内容的最终HTML
    const finalContent = `
      ${additionalStyles}
      <div class="print-container">
        ${additionalContent}
        <div class="print-content">
          ${styledHtml}
        </div>
      </div>
    `;
    
    // 准备模板参数
    const templateParams = {
      title: title,
      originalStyles: '', // 不收集整个页面样式，避免冲突
      userStyles: styles.map(style => `<style>${style}</style>`).join('\n'),
      content: finalContent
    };
    
    // 使用模板方法生成HTML内容
    const htmlContent = await renderPrintTemplate(templateParams);

    // 设置打印窗口的内容
    printWindow.document.write(htmlContent);

    // 等待文档加载完成
    printWindow.document.close();

    // 监听打印事件
    const handleAfterPrint = () => {
      if (onAfterPrint && typeof onAfterPrint === 'function') {
        onAfterPrint();
      }
      // 清理事件监听器
      printWindow.removeEventListener('afterprint', handleAfterPrint);
      // 如果不是预览模式，关闭打印窗口
      if (!showPreview) {
        setTimeout(() => printWindow.close(), 100);
      }
    };

    printWindow.addEventListener('afterprint', handleAfterPrint);

    // 标记打印是否已触发
    let printTriggered = false;
    
    // 主要打印触发函数
    const triggerPrint = () => {
      
      if (printTriggered) return;
      printTriggered = true;
      
      try {
        if (showPreview) {
          // 预览模式，不自动触发打印
          printWindow.focus();
        } else {
          // 非预览模式，自动触发打印
          printWindow.focus(); // 确保窗口获得焦点
          printWindow.print();
        }
      } catch (e) {
        console.error('Printing failed:', e);
        handleAfterPrint();
      }
    };
    
    // 优先使用DOMContentLoaded事件作为主要的打印触发点
    printWindow.addEventListener('DOMContentLoaded', () => {
      // DOM加载完成后，稍微延迟确保内容完全渲染
      setTimeout(() => {
        triggerPrint();
      }, 200); // 较小的延迟，因为DOM已经加载完成
    });
    
    // 使用setTimeout作为后备方案，防止DOMContentLoaded事件没有触发
    setTimeout(() => {
      if (!printTriggered) {
        console.warn('DOMContentLoaded event did not trigger, using fallback timeout');
        triggerPrint();
      }
    }, 1000); // 较长的超时时间，确保有足够时间让DOMContentLoaded事件触发

  } catch (error) {
    console.error('Error during printing:', error);
    // 即使发生错误，也调用打印后的回调
    if (onAfterPrint && typeof onAfterPrint === 'function') {
      onAfterPrint();
    }
  }
};

/**
 * 打印指定的HTML内容
 * @param htmlContent 要打印的HTML内容
 * @param options 打印配置选项
 */
export const printHtmlContent = async (htmlContent: string, options: PrintOptions = {}): Promise<void> => {
  // 创建一个临时元素来存储HTML内容
  const tempId = `print-temp-${Date.now()}`;
  const tempElement = document.createElement('div');
  tempElement.id = tempId;
  tempElement.style.display = 'none';
  tempElement.innerHTML = htmlContent;
  document.body.appendChild(tempElement);

  // 打印这个临时元素
  await printElementById(tempId, {
    ...options,
    onAfterPrint: () => {
      // 打印完成后删除临时元素
      document.body.removeChild(tempElement);
      // 调用用户的回调
      if (options.onAfterPrint && typeof options.onAfterPrint === 'function') {
        options.onAfterPrint();
      }
    }
  });
};

/**
 * 页面打印工具类
 */
export const PrintTools = {
  printElementById,
  printHtmlContent
};

export default PrintTools;