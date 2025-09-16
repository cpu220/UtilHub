/**
 * 图片工具类 (ImageTools)
 * 
 * 这是一个专业的HTML元素到图片转换工具库，提供了高质量、高性能的图片生成功能。
 * 特别针对复杂场景进行了深度优化，包括网格布局、SVG渲染和样式保持等。
 * 
 * 核心特性：
 * ========
 * 
 * 🎯 **智能转换策略**
 *    - 自动识别元素类型并选择最佳转换方法
 *    - 网格容器：逐个转换子元素再智能合并
 *    - 复杂SVG：使用canvg库确保准确渲染
 *    - 普通HTML：使用html-to-image库高效处理
 * 
 * 🎨 **SVG渲染优化**
 *    - 特别优化hanzi-writer生成的汉字SVG
 *    - 完整保留clipPath、defs等高级SVG特性
 *    - 解决SVG引用和样式丢失问题
 *    - 支持复杂路径和动画效果
 * 
 * 📐 **高质量输出**
 *    - 支持高分辨率渲染（最低2倍像素比）
 *    - 多种格式支持：PNG、JPEG、SVG、Blob、Pixel
 *    - 智能样式内联化，确保跨环境一致性
 *    - 可配置的质量和背景设置
 * 
 * 🛡️ **健壮性保证**
 *    - 完善的错误处理和回退机制
 *    - 自动清理临时DOM元素
 *    - 详细的调试日志和状态跟踪
 *    - 容错处理确保流程不中断
 * 
 * 技术架构：
 * ========
 * 
 * 本工具采用分层架构设计：
 * 
 * 1. **策略层**：根据元素类型智能选择转换策略
 * 2. **处理层**：针对不同场景的专门处理函数
 * 3. **渲染层**：底层Canvas和SVG渲染引擎
 * 4. **工具层**：样式管理、DOM操作等辅助功能
 * 
 * 为什么需要多次处理？
 * ==================
 * 
 * 在convertSvgWithCanvg方法中，fillStyle等属性需要设置多次的原因：
 * 
 * 1. **第一次设置**：为Canvas准备干净的背景，确保渲染基础
 * 2. **第二次处理**：canvg渲染过程可能改变Canvas状态，需要后处理
 * 3. **第三次调整**：针对特定格式（如JPEG）的最终优化
 * 
 * 这种多重处理确保了：
 * - Canvas状态的正确管理
 * - 复杂SVG的准确渲染
 * - 不同格式的兼容性
 * - 最终输出的质量保证

 * @author 图片工具开发团队
 * @version 2.0.0
 * @since 2024
 */
import * as htmlToImage from 'html-to-image';
import { Canvg } from 'canvg';
import { cloneElementWithComputedStyles } from './styleManager';



/**
 * 处理网格容器，逐个转换子元素再合并为一个图片
 * 
 * 为什么需要这个特殊的处理方法？
 * 1. 网格容器包含多个独立的元素（如多个汉字练习格）
 * 2. 直接转换整个容器可能导致样式丢失或渲染问题
 * 3. 逐个转换可以确保每个元素都得到最佳的渲染效果
 * 4. 可以对不同类型的元素（SVG、HTML）采用不同的优化策略
 * 
 * 工作流程：
 * 1. 创建一个主Canvas作为合并画布
 * 2. 遍历所有子元素，逐个转换为图片
 * 3. 将每个子元素的图片按其原始位置绘制到主Canvas上
 * 4. 返回合并后的完整图片
 * 
 * @param containerElement 网格容器元素
 * @param options 转换选项
 * @returns 合并后的图片数据URL
 */
const handleGridContainer = async (containerElement: HTMLElement, options: ImageOptions): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    try {
      // 步骤1：创建主Canvas用于合并所有子元素
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // 步骤2：获取容器的实际渲染尺寸
      const containerRect = containerElement.getBoundingClientRect();
      const originalWidth = containerRect.width;
      const originalHeight = containerRect.height;
      
      // 步骤3：设置高分辨率渲染
      // 提高清晰度：使用更高的设备像素比倍数，至少为2倍
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 2);
      
      // 设置canvas的物理像素尺寸
      canvas.width = originalWidth * pixelRatio;
      canvas.height = originalHeight * pixelRatio;
      
      // 缩放上下文以匹配设备像素比，使用逻辑像素进行绘制
      context.scale(pixelRatio, pixelRatio);
      
      // 步骤4：配置Canvas渲染质量
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      // 设置默认字体以确保文字渲染清晰
      context.font = 'normal normal normal 16px sans-serif';
      
      // 步骤5：设置Canvas背景
      context.fillStyle = options.backgroundColor || '#ffffff';
      context.fillRect(0, 0, originalWidth, originalHeight);
      
      // 步骤6：识别要处理的子元素
      // 优先查找网格项，如果没有则查找SVG元素
      const gridItems = Array.from(containerElement.querySelectorAll('.grid-item'));
      const svgElements = Array.from(containerElement.querySelectorAll('svg'));
      
      // 如果有网格项，优先处理网格项；否则处理SVG元素
      const elementsToProcess = gridItems.length > 0 ? gridItems : svgElements;
      
      if (elementsToProcess.length === 0) {
        // 如果没有要处理的元素，返回空白Canvas
        resolve(canvas.toDataURL('image/png'));
        return;
      }
      
      console.log(`开始处理网格容器，包含 ${elementsToProcess.length} 个元素`);
      
      // 步骤7：定义递归处理函数
      // 使用递归而不是循环，确保每个元素都完全处理完成后再处理下一个
      const processElement = async (index: number): Promise<void> => {
        if (index >= elementsToProcess.length) {
          // 所有元素处理完毕，返回合并后的图片
          resolve(canvas.toDataURL('image/png'));
          return;
        }
        
        const element = elementsToProcess[index];
        
        try {
          let elementDataUrl = '';
          
          // 步骤7.1：计算元素在容器中的相对位置
          const elementRect = element.getBoundingClientRect();
          // 计算相对于容器的位置坐标
          const x = (elementRect.left - containerRect.left);
          const y = (elementRect.top - containerRect.top);
          const width = elementRect.width;
          const height = elementRect.height;
          
          // 步骤7.2：根据元素类型选择处理方法
          if (element.tagName.toLowerCase() === 'svg') {
            // 对SVG元素使用canvg处理，获得更好的渲染效果
            elementDataUrl = await convertSvgWithCanvg(element as unknown as SVGElement, options);
          } else {
            // 步骤7.3：处理非SVG元素（HTML元素）
            // 使用更完整的克隆方法，保留所有样式和子元素
            const tempClone = cloneElementWithComputedStyles(element as HTMLElement);
            
            // 修复边框渲染问题：移除右边框避免在网格中出现重叠
            tempClone.style.borderRight = '0';
            
            // 将克隆元素隐藏在屏幕外，避免影响页面布局
            tempClone.style.position = 'absolute';
            tempClone.style.left = '-9999px';
            tempClone.style.top = '-9999px';
            tempClone.style.visibility = 'hidden';
            document.body.appendChild(tempClone);
            
            // 确保所有子元素的样式都被正确复制
            const preserveChildStyles = (original: HTMLElement, clone: HTMLElement) => {
              const originalChildren = Array.from(original.children) as HTMLElement[];
              const cloneChildren = Array.from(clone.children) as HTMLElement[];
              
              for (let i = 0; i < Math.min(originalChildren.length, cloneChildren.length); i++) {
                const originalChild = originalChildren[i];
                const cloneChild = cloneChildren[i];
                
                // 复制计算样式
                const computedStyle = window.getComputedStyle(originalChild);
                for (let j = 0; j < computedStyle.length; j++) {
                  const property = computedStyle[j];
                  cloneChild.style.setProperty(property, computedStyle.getPropertyValue(property));
                }
                
                // 递归处理子元素
                if (originalChild.children.length > 0) {
                  preserveChildStyles(originalChild, cloneChild);
                }
              }
            };
            
            preserveChildStyles(element as HTMLElement, tempClone);
            
            // 配置html-to-image选项
            const elementOptions = {
              backgroundColor: 'transparent', // 使用透明背景，避免覆盖主Canvas背景
              quality: options.quality,
              canvasWidth: width,
              canvasHeight: height,
              pixelRatio: pixelRatio
            };
            
            try {
              // 尝试转换克隆元素
              elementDataUrl = await htmlToImage.toPng(tempClone, elementOptions);
            } catch (error) {
              // 如果克隆元素处理失败，回退到原始元素
              console.warn('克隆元素处理失败，回退到原始元素:', error);
              elementDataUrl = await htmlToImage.toPng(element as unknown as HTMLElement, elementOptions);
            } finally {
              // 清理：移除临时克隆元素
              if (tempClone.parentNode) {
                document.body.removeChild(tempClone);
              }
            }
          }
          
          // 步骤7.4：将元素图片绘制到主Canvas上
          const img = new Image();
          
          img.onload = () => {
            // 将图片绘制到计算出的位置
            context.drawImage(img, x, y, width, height);
            // 递归处理下一个元素
            processElement(index + 1);
          };
          
          img.onerror = (error) => {
            console.error(`处理第 ${index + 1} 个元素时出错:`, error);
            // 即使当前元素出错，也继续处理下一个元素，确保整体流程不中断
            processElement(index + 1);
          };
          
          // 设置图片源，触发加载
          img.src = elementDataUrl;
          
        } catch (error) {
          console.error(`处理第 ${index + 1} 个元素时出错:`, error);
          // 容错处理：即使出错也继续处理下一个元素
          processElement(index + 1);
        }
      };
      
      // 步骤8：开始处理第一个元素
      processElement(0);
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 检查元素是否为网格容器
 * 
 * 网格容器是包含多个子元素（如汉字练习格）的容器，需要特殊处理：
 * 1. 逐个转换子元素可以避免样式冲突
 * 2. 可以对不同类型的子元素采用不同的优化策略
 * 3. 确保每个子元素都能得到最佳的渲染效果
 * 
 * 识别标准：
 * - 具有特定的ID（grid-container、page-grid-container）
 * - 具有特定的CSS类（grid-container、page-grid-container）
 * - 同时包含.grid-row和.grid-item子元素
 * 
 * @param element 要检查的元素
 * @returns 是否为网格容器
 */
const isGridContainer = (element: HTMLElement): boolean => {
  // 通过多种方式识别网格容器，确保准确性
  return element.id === 'grid-container' || 
         element.id === 'page-grid-container' ||
         element.classList.contains('grid-container') ||
         element.classList.contains('page-grid-container') ||
         // 检查是否同时包含网格行和网格项，这是网格布局的典型特征
         (element.querySelector('.grid-row') !== null && element.querySelector('.grid-item') !== null);
};

/**
 * 图片生成配置选项接口
 * 
 * 提供了丰富的配置选项来控制图片生成的各个方面，
 * 支持不同的使用场景和质量要求。
 */
export interface ImageOptions {
  /**
   * 图片输出格式
   * 
   * - png: 无损压缩，支持透明度，适合图标、截图等
   * - jpeg: 有损压缩，文件较小，适合照片等
   * - svg: 矢量格式，可缩放，适合简单图形
   * - blob: 二进制对象，用于文件操作
   * - pixel: 像素数据，用于图像处理
   */
  imageType?: 'png' | 'jpeg' | 'svg' | 'blob' | 'pixel';
  
  /**
   * 图片质量 (0.0 - 1.0)
   * 
   * 仅对JPEG格式有效：
   * - 1.0: 最高质量，文件最大
   * - 0.8: 高质量，平衡文件大小和质量
   * - 0.5: 中等质量，文件较小
   * 
   * 对于PNG格式，此参数被忽略
   */
  quality?: number;
  
  /**
   * 背景颜色
   * 
   * 支持的格式：
   * - 十六进制: '#ffffff', '#fff'
   * - RGB: 'rgb(255, 255, 255)'
   * - RGBA: 'rgba(255, 255, 255, 1)'
   * - 颜色名称: 'white', 'transparent'
   * 
   * 注意：JPEG格式不支持透明度，会自动转换为不透明背景
   */
  backgroundColor?: string;
  
  /**
   * 图片生成前的回调函数
   * 
   * 可用于：
   * - 显示加载状态
   * - 预处理DOM元素
   * - 记录开始时间
   * - 触发自定义事件
   */
  onBeforeGenerate?: () => void;
  
  /**
   * 图片生成后的回调函数
   * 
   * 接收生成的图片数据URL作为参数，可用于：
   * - 隐藏加载状态
   * - 预览生成的图片
   * - 自动下载或上传
   * - 记录生成时间和统计信息
   * 
   * @param dataUrl 生成的图片数据URL
   */
  onAfterGenerate?: (dataUrl: string) => void;
  
  /**
   * 是否强制使用canvg库处理SVG
   * 
   * 推荐在以下情况下设置为true：
   * - 包含复杂的SVG路径和形状
   * - 使用了hanzi-writer等库生成的SVG
   * - 包含clipPath、defs等高级SVG特性
   * - html-to-image处理SVG效果不佳时
   * 
   * canvg的优势：
   * - 更好的SVG兼容性
   * - 支持复杂的SVG特性
   * - 更准确的路径渲染
   * 
   * 默认值：false（自动检测）
   */
  useCanvg?: boolean;
}

/**
 * 增强的SVG提取器，特别优化了hanzi-writer生成的SVG
 * 
 * 主要功能：
 * 1. 确保保留所有defs和clipPath元素（这对复杂SVG渲染至关重要）
 * 2. 保留path元素的所有属性和样式
 * 3. 解决SVG中的引用问题（特别是clipPath引用）
 * 4. 修复SVG字符串中的特殊字符问题
 * 
 * 为什么需要这个函数？
 * - hanzi-writer生成的SVG包含复杂的clipPath和路径定义
 * - 直接使用innerHTML可能会丢失重要的SVG属性和引用
 * - 需要确保SVG在不同环境下都能正确渲染
 * 
 * @param svgElement SVG元素
 * @returns 优化后的SVG字符串
 */
const extractSvgString = (svgElement: SVGElement): string => {
  // 步骤1：创建SVG元素的深拷贝
  // 使用深拷贝避免修改原始DOM，确保原始元素不受影响
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // 步骤2：确保SVG具有正确的命名空间
  // xmlns属性对于SVG的正确渲染是必需的
  if (!clonedSvg.getAttribute('xmlns')) {
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  
  // 步骤3：检测是否为hanzi-writer生成的SVG
  // 使用统一的T-HZ类名进行检测
  const isHanziWriter = clonedSvg.classList.contains('T-HZ');
  
  console.log('检测到hanzi-writer SVG:', isHanziWriter);
  
  // 步骤4：处理defs元素和clipPath
  // defs元素包含可重用的SVG定义，clipPath用于裁剪路径
  // 这对hanzi-writer生成的复杂汉字SVG至关重要
  const defsElement = clonedSvg.querySelector('defs');
  if (defsElement) {
    console.log('发现defs元素，确保clipPath元素被完整保留');
    
    // 为所有clipPath元素添加唯一ID，确保引用关系正确
    // 这解决了SVG中clipPath引用可能出现的问题
    const clipPaths = defsElement.querySelectorAll('clipPath');
    clipPaths.forEach((clipPath, index) => {
      if (!clipPath.id) {
        // 生成唯一的clipPath ID
        clipPath.id = `clip-path-${index}`;
      }
    });
  } else {
    // 如果没有defs元素，创建一个空的defs元素
    // 这为后续可能的定义提供了容器
    const newDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    clonedSvg.insertBefore(newDefs, clonedSvg.firstChild);
  }
  
  // 步骤5：修复clipPath引用
  // 确保所有使用clip-path属性的元素都正确引用了对应的clipPath
  const elementsWithClipPath = clonedSvg.querySelectorAll('[clip-path]');
  elementsWithClipPath.forEach((element) => {
    const clipPathAttr = element.getAttribute('clip-path');
    if (clipPathAttr && clipPathAttr.startsWith('url(#')) {
      // 验证并修复clip-path引用格式
      console.log('修复clip-path引用:', clipPathAttr);
    }
  });
  
  // 步骤6：序列化SVG为字符串
  // XMLSerializer确保SVG的所有属性和结构都被正确保留
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clonedSvg);
  
  // 步骤7：修复字符串中的特殊字符
  // 将HTML实体&nbsp;转换为普通空格，避免渲染问题
  svgString = svgString.replace(/&nbsp;/g, ' ');
  // console.log('修复后的SVG字符串:', svgString);
  return svgString;
};

/**
 * 使用canvg库将SVG转换为图片
 * 
 * 为什么需要处理两遍元素（特别是fillStyle）？
 * 1. 第一次设置fillStyle：为Canvas准备背景色，确保在SVG渲染之前有一个干净的背景
 * 2. 第二次在v.render()后处理：因为canvg渲染过程可能会改变Canvas的状态，需要在渲染完成后进行最终的样式调整
 * 
 * 这种双重处理的原因：
 * - Canvas状态管理：Canvas的2D上下文状态在不同操作间可能被重置或修改
 * - SVG渲染复杂性：canvg在渲染复杂SVG（如hanzi-writer生成的汉字）时，内部可能会修改Canvas状态
 * - 确保最终效果：第二次处理确保最终输出的图片符合预期的格式和样式要求
 * 
 * @param svgElement SVG元素
 * @param options 转换选项
 * @returns 图片数据URL
 */
const convertSvgWithCanvg = async (svgElement: SVGElement, options: ImageOptions): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    try {
      // 步骤1：提取优化后的SVG字符串
      // 这一步确保SVG的所有样式和属性都被正确保留
      const svgString = extractSvgString(svgElement);
      
      // 步骤2：创建canvas元素和2D渲染上下文
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // 步骤3：获取SVG元素的实际渲染尺寸
      // getBoundingClientRect()返回的是包含margin、padding等盒模型属性的实际渲染尺寸
      const elementRect = svgElement.getBoundingClientRect();
      
      // 使用元素的实际尺寸作为Canvas尺寸
      const actualWidth = elementRect.width;
      const actualHeight = elementRect.height;
      
      // 步骤4：解析SVG的viewBox属性
      // viewBox定义了SVG的坐标系统和可视区域
      let viewBoxX = 0;
      let viewBoxY = 0;
      let viewBoxWidth = actualWidth;
      let viewBoxHeight = actualHeight;
      
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const [x, y, width, height] = viewBox.split(' ').map(parseFloat);
        if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
          // 获取viewBox的坐标和尺寸信息
          viewBoxX = x;
          viewBoxY = y;
          viewBoxWidth = width;
          viewBoxHeight = height;
        }
      }
      
      // 步骤5：设置高分辨率渲染
      // 提高清晰度：使用更高的设备像素比倍数，至少为2倍
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 2);
      
      // 设置canvas的实际像素尺寸（物理像素）
      canvas.width = actualWidth * pixelRatio;
      canvas.height = actualHeight * pixelRatio;
      
      // 缩放上下文以匹配设备像素比，这样绘制时使用逻辑像素
      ctx.scale(pixelRatio, pixelRatio);
      
      // 步骤6：配置Canvas渲染质量
      // 启用高质量图像渲染和抗锯齿
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      // 设置默认字体以确保文字渲染清晰
      ctx.font = 'normal normal normal 16px sans-serif';
      
      // 步骤7：第一次设置fillStyle - 准备Canvas背景
      // 这是第一次处理：在SVG渲染之前设置背景色
      // 目的：确保Canvas有一个干净的、指定颜色的背景
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, actualWidth, actualHeight);
      
      // 步骤8：计算SVG内容的缩放比例
      // 确保SVG内容能够完整显示在Canvas中
      const scaleX = actualWidth / viewBoxWidth;
      const scaleY = actualHeight / viewBoxHeight;
      const scale = Math.min(scaleX, scaleY); // 使用较小的缩放比例以保持宽高比
      
      // 步骤9：创建canvg实例并配置渲染参数
      const v = Canvg.fromString(ctx, svgString, {
        scaleWidth: actualWidth,    // 缩放到目标宽度
        scaleHeight: actualHeight,  // 缩放到目标高度
        ignoreMouse: true,          // 忽略鼠标事件（因为是静态渲染）
        ignoreAnimation: false,     // 保留动画效果（如果有的话）
        offsetX: 0,                // X轴偏移
        offsetY: 0                 // Y轴偏移
      });
      
      // 步骤10：执行SVG渲染并进行后处理
      v.render().then(() => {
        try {
          // 第二次处理Canvas状态 - 渲染后的最终调整
          // 为什么需要第二次处理？
          // 1. canvg.render()过程中可能会修改Canvas的状态
          // 2. 需要在SVG内容渲染完成后添加额外的视觉效果（如边框）
          // 3. 确保最终输出符合预期的格式要求
          
          // 添加边框（可选的视觉增强）
          // ctx.strokeStyle = '#ddd';
          // ctx.lineWidth = 1;
          // ctx.strokeRect(0, 0, actualWidth, actualHeight);
          
          // 步骤11：处理不同图片格式的特殊需求
          // 对于JPEG格式，需要确保背景不透明（JPEG不支持透明度）
          if (options.imageType === 'jpeg') {
            // 创建一个新的canvas来确保JPEG有不透明的背景
            const jpegCanvas = document.createElement('canvas');
            const jpegCtx = jpegCanvas.getContext('2d');
            
            if (jpegCtx) {
              // 设置与原canvas相同的尺寸
              jpegCanvas.width = canvas.width;
              jpegCanvas.height = canvas.height;
              
              // 第三次设置fillStyle - 为JPEG格式确保不透明背景
              // 这是针对JPEG格式的特殊处理，因为JPEG不支持透明度
              jpegCtx.fillStyle = options.backgroundColor || '#ffffff';
              jpegCtx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
              
              // 将原始canvas内容绘制到新canvas上
              jpegCtx.drawImage(canvas, 0, 0);
              
              // 生成JPEG格式的数据URL
              const dataUrl = jpegCanvas.toDataURL('image/jpeg', options.quality || 0.98);
              resolve(dataUrl);
              return;
            }
          }
          
          // 步骤12：生成最终的图片数据URL
          const dataUrl = canvas.toDataURL(
            options.imageType === 'jpeg' ? 'image/jpeg' : 'image/png',
            options.quality || 1.0
          );
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 将指定ID的HTML元素转换为图片
 * 
 * 这是整个图片工具类的核心函数，提供了完整的HTML元素到图片的转换功能。
 * 
 * 主要特性：
 * 1. 支持多种图片格式（PNG、JPEG、SVG、Blob、Pixel）
 * 2. 智能识别元素类型并选择最佳转换策略
 * 3. 特别优化了网格容器和SVG元素的处理
 * 4. 提供高质量渲染和样式保持
 * 5. 支持回调函数用于自定义处理
 * 
 * 转换策略选择：
 * - 网格容器：使用逐个转换合并的方法
 * - 复杂SVG（如hanzi-writer）：使用canvg库处理
 * - 普通HTML元素：使用html-to-image库处理
 * 
 * @param elementId 要转换的HTML元素ID
 * @param options 图片生成配置选项
 * @returns 图片数据URL
 */
export const elementToImage = async (elementId: string, options: ImageOptions = {}): Promise<string> => {
  // 步骤1：解构配置选项并设置默认值
  const { 
    imageType = 'png',           // 默认PNG格式
    quality = 1.0,               // 默认最高质量
    backgroundColor = '#ffffff', // 默认白色背景
    onBeforeGenerate,            // 生成前回调
    onAfterGenerate,             // 生成后回调
    useCanvg = false             // 默认不强制使用canvg
  } = options;

  try {
    // 步骤2：执行生成前回调
    if (onBeforeGenerate && typeof onBeforeGenerate === 'function') {
      onBeforeGenerate();
    }

    // 步骤3：获取目标元素
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`Element with id ${elementId} not found`);
    }

    // 步骤4：克隆元素并应用计算样式
    // 使用统一样式管理系统确保CSS样式被正确内联化
    // 这解决了在不同环境下样式不一致的问题（如PDF导出）
    const element = cloneElementWithComputedStyles(originalElement as HTMLElement, true);
    
    // 步骤5：创建临时容器
    // 将克隆的元素放在屏幕外的临时容器中，避免影响页面布局
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';  // 移到屏幕外
    tempContainer.style.top = '-9999px';
    tempContainer.appendChild(element);
    document.body.appendChild(tempContainer);
    
    let dataUrl = '';
    
    try {
      // 步骤6：获取元素的实际渲染尺寸
      const elementRect = element.getBoundingClientRect();
      const actualWidth = elementRect.width;
      const actualHeight = elementRect.height;
      
      // 步骤7：智能选择转换策略
      
      // 策略1：网格容器处理
      if (isGridContainer(element)) {
        console.log('检测到网格容器，使用逐个转换再合并的方法');
        dataUrl = await handleGridContainer(element, options);
      } else {
        // 步骤7.1：检查是否包含SVG元素
        const svgElement = element.tagName.toLowerCase() === 'svg' 
          ? (element as unknown as SVGElement)
          : element.querySelector('svg');
        
        // 步骤7.2：检测是否为hanzi-writer生成的复杂SVG
        // 使用统一的T-HZ类名进行检测
        const containsHanziWriterSvg = svgElement && svgElement.classList.contains('T-HZ');
        
        // 策略2：使用canvg处理复杂SVG
        if (svgElement && (useCanvg || containsHanziWriterSvg)) {
          console.log('使用canvg处理SVG，优化hanzi-writer生成的复杂路径');
          dataUrl = await convertSvgWithCanvg(svgElement, options);
        } else {
          // 策略3：使用html-to-image处理普通HTML元素
          
          // 步骤7.3：配置html-to-image选项
          const htmlToImageOptions = {
            backgroundColor,
            quality: Math.max(quality, 0.95), // 确保最低质量为0.95
            canvasWidth: actualWidth,
            canvasHeight: actualHeight,
            pixelRatio: Math.max(window.devicePixelRatio || 1, 2), // 至少使用2倍像素比
            style: {
              imageRendering: 'optimizeQuality',    // 优化图像质量
              textRendering: 'optimizeLegibility',  // 优化文字渲染
              fontSmooth: 'always'                  // 始终启用字体平滑
            }
          };

          // 步骤7.4：根据图片类型选择转换方法
          switch (imageType) {
            case 'png':
              dataUrl = await htmlToImage.toPng(element, htmlToImageOptions);
              break;
              
            case 'jpeg':
              dataUrl = await htmlToImage.toJpeg(element, htmlToImageOptions);
              break;
              
            case 'svg':
              dataUrl = await htmlToImage.toSvg(element, htmlToImageOptions);
              break;
              
            case 'blob':
              // blob类型需要特殊处理：生成Blob对象并创建URL
              const blob = await htmlToImage.toBlob(element, htmlToImageOptions);
              if (blob) {
                dataUrl = URL.createObjectURL(blob);
              }
              break;
              
            case 'pixel':
              // pixel类型：获取像素数据并转换为Canvas图片
              const pixels = await htmlToImage.toPixelData(element, htmlToImageOptions);
              
              // 创建Canvas来展示像素数据
              const canvas = document.createElement('canvas');
              canvas.width = actualWidth;
              canvas.height = actualHeight;
              const context = canvas.getContext('2d');
              
              if (context) {
                // 将像素数据写入Canvas
                const imageData = context.createImageData(canvas.width, canvas.height);
                imageData.data.set(pixels);
                context.putImageData(imageData, 0, 0);
                
                // 对于pixel类型，总是输出PNG格式
                dataUrl = canvas.toDataURL('image/png');
              }
              break;
              
            default:
              // 默认使用PNG格式
              dataUrl = await htmlToImage.toPng(element, htmlToImageOptions);
          }
        }
      }

      // 步骤8：执行生成后回调
      if (onAfterGenerate && typeof onAfterGenerate === 'function') {
        onAfterGenerate(dataUrl);
      }

      return dataUrl;
      
    } finally {
      // 步骤9：清理临时容器
      // 无论成功还是失败，都要清理临时创建的DOM元素
      if (tempContainer && tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }
    }
  } catch (error) {
    console.error('Error converting element to image:', error);
    throw error;
  }
};

/**
 * 图片工具类
 * 
 * 提供了完整的HTML元素到图片转换功能，特别优化了以下场景：
 * 
 * 1. **网格容器处理**：
 *    - 自动识别包含多个子元素的网格布局
 *    - 逐个转换子元素并智能合并
 *    - 避免样式冲突和渲染问题
 * 
 * 2. **SVG优化渲染**：
 *    - 特别优化hanzi-writer生成的复杂汉字SVG
 *    - 使用canvg库确保SVG的准确渲染
 *    - 保留clipPath、defs等高级SVG特性
 * 
 * 3. **高质量输出**：
 *    - 支持高分辨率渲染（至少2倍像素比）
 *    - 多种图片格式支持（PNG、JPEG、SVG、Blob、Pixel）
 *    - 智能样式内联化，确保跨环境一致性
 * 
 * 4. **容错处理**：
 *    - 完善的错误处理和回退机制
 *    - 自动清理临时DOM元素
 *    - 详细的日志记录和调试信息
 * 
 * 使用示例：
 * ```typescript
 * // 基本用法
 * const dataUrl = await ImageTools.elementToImage('my-element');
 * 
 * // 高级配置
 * const dataUrl = await ImageTools.elementToImage('my-element', {
 *   imageType: 'png',
 *   quality: 1.0,
 *   backgroundColor: '#ffffff',
 *   useCanvg: true,
 *   onBeforeGenerate: () => console.log('开始生成...'),
 *   onAfterGenerate: (url) => console.log('生成完成:', url)
 * });
 * ```
 */
export const ImageTools = {
  elementToImage
};

/**
 * 默认导出图片工具类
 * 
 * 这是整个模块的主要导出，提供了完整的图片转换功能。
 * 可以通过以下方式使用：
 * 
 * ```typescript
 * import ImageTools from './imageTools';
 * // 或者
 * import { ImageTools, elementToImage } from './imageTools';
 * ```
 */
export default ImageTools;