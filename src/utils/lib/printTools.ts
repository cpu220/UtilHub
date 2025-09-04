/**
 * 打印工具类
 * 提供通用的打印功能，支持选择性打印指定HTML元素
 */

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
   * 打印标题
   */
  title?: string;
}

/**
 * 打印指定ID的HTML元素
 * @param elementId 要打印的HTML元素ID
 * @param options 打印配置选项
 */
export const printElementById = (elementId: string, options: PrintOptions = {}): void => {
  const {
    showPreview = false,
    styles = [],
    onBeforePrint,
    onAfterPrint,
    title = document.title
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

    // 获取原始文档的样式
    const originalStyles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          // 尝试获取样式内容
          if (sheet.href) {
            return `<link rel="stylesheet" href="${sheet.href}">`;
          } else if (sheet.cssRules) {
            return `<style>${Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n')}</style>`;
          }
        } catch (e) {
          // 忽略跨域样式表的错误
          console.warn('Cannot access stylesheet:', e);
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');

    // 添加用户指定的额外样式
    const userStyles = styles.map(style => `<style>${style}</style>`).join('\n');

    // 设置打印窗口的内容
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          ${originalStyles}
          ${userStyles}
          <style>
            /* 打印专用样式 */
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
            #page-content {
              padding: 20px;
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div id="page-content">
          ${element.outerHTML}
          <div>
        </body>
      </html>
    `);

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

    // 触发打印对话框
    setTimeout(() => {
      try {
        if (showPreview) {
          // 预览模式，不自动触发打印
          printWindow.focus();
        } else {
          // 非预览模式，自动触发打印
          printWindow.print();
        }
      } catch (e) {
        console.error('Printing failed:', e);
        handleAfterPrint();
      }
    }, 300);

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
export const printHtmlContent = (htmlContent: string, options: PrintOptions = {}): void => {
  // 创建一个临时元素来存储HTML内容
  const tempId = `print-temp-${Date.now()}`;
  const tempElement = document.createElement('div');
  tempElement.id = tempId;
  tempElement.style.display = 'none';
  tempElement.innerHTML = htmlContent;
  document.body.appendChild(tempElement);

  // 打印这个临时元素
  printElementById(tempId, {
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