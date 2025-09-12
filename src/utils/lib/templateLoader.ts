/*
 * 模板加载器
 * 提供加载和处理 HTML 模板的功能
 */

// 导入Handlebars模板引擎
import Handlebars from 'handlebars';

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
    console.log('Attempting to load printTemplate.html...');
    
    // 尝试不同的路径方案
    const basePath = window.location.origin;
    console.log('Base path:', basePath);
    
    // 定义多个可能的路径
    const templatePaths = [
      '/printTemplate.html',
      `${basePath}/printTemplate.html`,
      'printTemplate.html'
    ];
    
    let templateContent: string | null = null;
    let successPath: string | null = null;
    
    // 尝试所有可能的路径
    for (const path of templatePaths) {
      try {
        console.log(`Trying to load from path: ${path}`);
        const response = await fetch(path);
        
        if (response.ok) {
          templateContent = await response.text();
          successPath = path;
          console.log(`Successfully loaded printTemplate.html from ${path}`);
          break;
        } else {
          console.warn(`Failed to load from ${path}, status: ${response.status}`);
        }
      } catch (error) {
        console.warn(`Error loading from ${path}:`, error);
      }
    }
    
    // 如果没有找到有效模板，使用降级方案
    if (!templateContent) {
      console.warn('All template paths failed, using fallback template');
      // 使用内联硬编码模板作为降级方案
      const fallbackTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    {{{originalStyles}}}
    {{{userStyles}}}
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
      {{{content}}}
    </div>
  </body>
</html>`;
    
      // 使用Handlebars编译并渲染模板
      const template = Handlebars.compile(fallbackTemplate);
      const renderedContent = template(params);
    
      return renderedContent;
    }
    
    // 使用Handlebars编译并渲染模板
    const template = Handlebars.compile(templateContent);
    const renderedContent = template(params);
    
    console.log(`Successfully rendered template using ${successPath ? 'external file' : 'fallback template'}`);
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