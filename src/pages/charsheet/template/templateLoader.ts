/**
 * 模板加载器
 * 提供加载和处理 HTML 模板的功能
 */

/**
 * 渲染打印模板
 * @param params 模板参数
 * @returns 渲染后的 HTML 字符串
 */
export const renderPrintTemplate = async (params: {
  title: string;
  originalStyles: string;
  userStyles: string;
  content: string;
}): Promise<string> => {
  try {
    // 使用fetch API加载printTemplate.html文件
    // 在Umi项目中，构建后的文件会在根目录下
    const response = await fetch('/printTemplate.html');
    
    // 如果fetch失败，使用降级方案
    if (!response.ok) {
      console.warn('Failed to load printTemplate.html, using fallback template');
      // 使用内联硬编码模板作为降级方案
      const fallbackTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    {{originalStyles}}
    {{userStyles}}
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
      {{content}}
    </div>
  </body>
</html>`;
    
      // 替换模板中的变量
      let renderedContent = fallbackTemplate
        .replace(/{{title}}/g, params.title)
        .replace(/{{originalStyles}}/g, params.originalStyles)
        .replace(/{{userStyles}}/g, params.userStyles)
        .replace(/{{content}}/g, params.content);
    
      return renderedContent;
    }
    
    // 获取模板内容
    const templateContent = await response.text();
    
    // 替换模板中的变量
    let renderedContent = templateContent
      .replace(/{{title}}/g, params.title)
      .replace(/{{originalStyles}}/g, params.originalStyles)
      .replace(/{{userStyles}}/g, params.userStyles)
      .replace(/{{content}}/g, params.content);
    
    console.log('Rendered print template content:', renderedContent);
    return renderedContent;
  } catch (error) {
    console.error('Error rendering print template:', error);
    
    // 降级方案：如果模板加载失败，使用硬编码的模板
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${params.title}</title>
          ${params.originalStyles}
          ${params.userStyles}
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
            ${params.content}
          </div>
        </body>
      </html>
    `;
  }
};

/**
 * 预加载模板以提高性能
 * 可以在应用初始化时调用
 */
export const preloadTemplate = (): void => {
  // 在后台预加载模板，但不阻塞主线程
  setTimeout(() => {
    renderPrintTemplate({
      title: '',
      originalStyles: '',
      userStyles: '',
      content: ''
    }).catch(() => {
      // 忽略预加载错误
    });
  }, 1000);
};