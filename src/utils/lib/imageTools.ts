/**
 * 图片工具类
 * 提供将HTML元素转换为图片的功能，特别优化了对hanzi-writer生成的SVG的处理
 */
import * as htmlToImage from 'html-to-image';
import { Canvg } from 'canvg';

/**
 * 处理网格容器，逐个转换子元素再合并为一个图片
 * @param containerElement 网格容器元素
 * @param options 转换选项
 * @returns 合并后的图片数据URL
 */
const handleGridContainer = async (containerElement: HTMLElement, options: ImageOptions): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    try {
      // 创建一个新的canvas来合并所有子元素
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // 获取容器的尺寸
      const containerRect = containerElement.getBoundingClientRect();
      const originalWidth = containerRect.width;
      const originalHeight = containerRect.height;
      
      // 提高清晰度：使用更高的设备像素比倍数，至少为2倍
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 2);
      
      // 设置canvas尺寸，应用设备像素比
      canvas.width = originalWidth * pixelRatio;
      canvas.height = originalHeight * pixelRatio;
      
      // 缩放上下文以匹配设备像素比
      context.scale(pixelRatio, pixelRatio);
      
      // 启用高质量图像渲染
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      // 设置默认字体以确保文字渲染清晰
      context.font = 'normal normal normal 16px sans-serif';
      
      // 设置背景色
      context.fillStyle = options.backgroundColor || '#ffffff';
      context.fillRect(0, 0, originalWidth, originalHeight);
      
      // 获取所有子SVG元素或网格项
      const gridItems = Array.from(containerElement.querySelectorAll('.grid-item'));
      const svgElements = Array.from(containerElement.querySelectorAll('svg'));
      
      // 如果有网格项，优先处理网格项
      const elementsToProcess = gridItems.length > 0 ? gridItems : svgElements;
      
      if (elementsToProcess.length === 0) {
        // 如果没有要处理的元素，返回空canvas
        resolve(canvas.toDataURL('image/png'));
        return;
      }
      
      console.log(`开始处理网格容器，包含 ${elementsToProcess.length} 个元素`);
      
      // 定义处理单个元素的函数
      const processElement = async (index: number): Promise<void> => {
        if (index >= elementsToProcess.length) {
          // 所有元素处理完毕，返回合并后的图片
          resolve(canvas.toDataURL('image/png'));
          return;
        }
        
        const element = elementsToProcess[index];
        
        try {
          let elementDataUrl = '';
          
          // 获取元素的位置和尺寸
          const elementRect = element.getBoundingClientRect();
          // 计算相对位置
          const x = (elementRect.left - containerRect.left);
          const y = (elementRect.top - containerRect.top);
          const width = elementRect.width;
          const height = elementRect.height;
          
          // 检查是否是SVG元素
          if (element.tagName.toLowerCase() === 'svg') {
            // 对SVG元素使用canvg处理
            elementDataUrl = await convertSvgWithCanvg(element as unknown as SVGElement, options);
          } else {
            // 对于非SVG元素，使用html-to-image处理
            // 创建一个临时克隆元素，用于修复边框渲染问题
            const tempClone = element.cloneNode(true) as HTMLElement;
            // 将克隆元素的右边框设置为0，避免边框叠加问题
            tempClone.style.borderRight = '0';
            
            // 隐藏克隆元素
            tempClone.style.position = 'absolute';
            tempClone.style.left = '-9999px';
            document.body.appendChild(tempClone);
            
            const elementOptions = {
              backgroundColor: 'transparent',
              quality: options.quality,
              canvasWidth: width,
              canvasHeight: height,
              pixelRatio: pixelRatio
            };
            
            try {
              elementDataUrl = await htmlToImage.toPng(tempClone, elementOptions);
            } catch (error) {
              // 如果克隆元素处理失败，回退到原始元素
              elementDataUrl = await htmlToImage.toPng(element as unknown as HTMLElement, elementOptions);
            } finally {
              // 移除克隆元素
              document.body.removeChild(tempClone);
            }
          }
          
          // 将元素图片绘制到主canvas上
          const img = new Image();
          img.onload = () => {
            // 绘制图片到对应的位置
            context.drawImage(img, x, y, width, height);
            // 处理下一个元素
            processElement(index + 1);
          };
          img.onerror = (error) => {
            console.error(`处理第 ${index + 1} 个元素时出错:`, error);
            // 即使出错，也继续处理下一个元素
            processElement(index + 1);
          };
          img.src = elementDataUrl;
        } catch (error) {
          console.error(`处理第 ${index + 1} 个元素时出错:`, error);
          // 即使出错，也继续处理下一个元素
          processElement(index + 1);
        }
      };
      
      // 开始处理第一个元素
      processElement(0);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 检查元素是否为网格容器
 * @param element 要检查的元素
 * @returns 是否为网格容器
 */
const isGridContainer = (element: HTMLElement): boolean => {
  // 检查元素是否有grid-container相关的标识
  return element.id === 'grid-container' || 
         element.id === 'page-grid-container' ||
         element.classList.contains('grid-container') ||
         element.classList.contains('page-grid-container') ||
         (element.querySelector('.grid-row') !== null && element.querySelector('.grid-item') !== null);
};

/**
 * 图片生成配置选项
 */
export interface ImageOptions {
  /**
   * 图片类型 (png, jpeg, svg等)
   */
  imageType?: 'png' | 'jpeg' | 'svg' | 'blob' | 'pixel';
  
  /**
   * 图片质量 (仅jpeg格式有效)
   */
  quality?: number;
  
  /**
   * 背景色
   */
  backgroundColor?: string;
  
  /**
   * 图片生成前的回调函数
   */
  onBeforeGenerate?: () => void;
  
  /**
   * 图片生成后的回调函数
   */
  onAfterGenerate?: (dataUrl: string) => void;
  
  /**
   * 是否强制使用canvg库处理SVG
   * 对于复杂SVG，特别是hanzi-writer生成的SVG，推荐设置为true
   */
  useCanvg?: boolean;
}

/**
 * 增强的SVG提取器，特别优化了hanzi-writer生成的SVG
 * 1. 确保保留所有defs和clipPath元素
 * 2. 保留path元素的所有属性和样式
 * 3. 解决SVG中的引用问题
 * @param svgElement SVG元素
 * @returns 优化后的SVG字符串
 */
const extractSvgString = (svgElement: SVGElement): string => {
  // 创建一个SVG元素的深拷贝以避免修改原始DOM
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // 确保SVG有xmlns属性
  if (!clonedSvg.getAttribute('xmlns')) {
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  
  // 检查是否是hanzi-writer生成的SVG
  const isHanziWriter = clonedSvg.querySelector('[data-hanzi-writer]') !== null ||
                       clonedSvg.classList.contains('hanzi-writer') ||
                       clonedSvg.querySelector('path[data-hanzi-writer-path]') !== null;
  
  console.log('检测到hanzi-writer SVG:', isHanziWriter);
  
  // 特别处理defs中的clipPath元素，这对hanzi-writer的SVG至关重要
  const defsElement = clonedSvg.querySelector('defs');
  if (defsElement) {
    console.log('发现defs元素，确保clipPath元素被完整保留');
    
    // 为所有clipPath元素添加唯一ID，确保引用正确
    const clipPaths = defsElement.querySelectorAll('clipPath');
    clipPaths.forEach((clipPath, index) => {
      if (!clipPath.id) {
        clipPath.id = `clip-path-${index}`;
      }
    });
  } else {
    // 如果没有defs元素，创建一个
    const newDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    clonedSvg.insertBefore(newDefs, clonedSvg.firstChild);
  }
  
  // 确保所有使用clip-path的元素正确引用了clipPath
  const elementsWithClipPath = clonedSvg.querySelectorAll('[clip-path]');
  elementsWithClipPath.forEach((element) => {
    const clipPathAttr = element.getAttribute('clip-path');
    if (clipPathAttr && clipPathAttr.startsWith('url(#')) {
      // 确保引用格式正确
      console.log('修复clip-path引用:', clipPathAttr);
    }
  });
  
  // 序列化SVG元素为字符串
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clonedSvg);
  
  // 修复可能的SVG字符串问题
  svgString = svgString.replace(/&nbsp;/g, ' ');
  
  return svgString;
};

/**
 * 使用canvg库将SVG转换为图片
 * @param svgElement SVG元素
 * @param options 转换选项
 * @returns 图片数据URL
 */
const convertSvgWithCanvg = async (svgElement: SVGElement, options: ImageOptions): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    try {
      // 提取优化后的SVG字符串
      const svgString = extractSvgString(svgElement);
      
      // 创建canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // 获取SVG元素的尺寸 - 这是包含margin、padding等盒模型属性的实际渲染尺寸
      const elementRect = svgElement.getBoundingClientRect();
      
      // 使用元素的实际尺寸
      const actualWidth = elementRect.width;
      const actualHeight = elementRect.height;
      
      // 获取SVG的viewBox属性
      let viewBoxX = 0;
      let viewBoxY = 0;
      let viewBoxWidth = actualWidth;
      let viewBoxHeight = actualHeight;
      
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const [x, y, width, height] = viewBox.split(' ').map(parseFloat);
        if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
          // 获取viewBox信息
          viewBoxX = x;
          viewBoxY = y;
          viewBoxWidth = width;
          viewBoxHeight = height;
        }
      }
      
      // 提高清晰度：使用更高的设备像素比倍数，至少为2倍
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 2);
      
      // 设置canvas的实际像素尺寸
      canvas.width = actualWidth * pixelRatio;
      canvas.height = actualHeight * pixelRatio;
      
      // 缩放上下文以匹配设备像素比
      ctx.scale(pixelRatio, pixelRatio);
      
      // 启用高质量图像渲染
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      // 设置默认字体以确保文字渲染清晰
      ctx.font = 'normal normal normal 16px sans-serif';
      
      // 设置背景色 - 在渲染SVG之前先填充背景
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, actualWidth, actualHeight);
      
      // 计算缩放比例，确保SVG内容完整显示
      const scaleX = actualWidth / viewBoxWidth;
      const scaleY = actualHeight / viewBoxHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // 使用canvg渲染SVG到canvas
      const v = Canvg.fromString(ctx, svgString, {
        scaleWidth: actualWidth,
        scaleHeight: actualHeight,
        ignoreMouse: true,
        ignoreAnimation: false, // 保留动画效果
        offsetX: 0,
        offsetY: 0
      });
      
      // 渲染并转换为图片数据URL
      v.render().then(() => {
        try {
          // 添加边框（可选）
          ctx.strokeStyle = '#ddd';
          ctx.lineWidth = 1;
          ctx.strokeRect(0, 0, actualWidth, actualHeight);
          
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
 * @param elementId 要转换的HTML元素ID
 * @param options 图片生成配置选项
 * @returns 图片数据URL
 */
export const elementToImage = async (elementId: string, options: ImageOptions = {}): Promise<string> => {
  const { 
    imageType = 'png', 
    quality = 1.0, 
    backgroundColor = '#ffffff', 
    onBeforeGenerate, 
    onAfterGenerate, 
    useCanvg = false 
  } = options;

  try {
    // 调用生成前的回调
    if (onBeforeGenerate && typeof onBeforeGenerate === 'function') {
      onBeforeGenerate();
    }

    // 获取要转换的元素
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`);
    }

    let dataUrl = '';
    
    // 获取元素的尺寸
    const elementRect = element.getBoundingClientRect();
    const actualWidth = elementRect.width;
    const actualHeight = elementRect.height;
    
    // 首先检查是否是网格容器
    if (isGridContainer(element)) {
      console.log('检测到网格容器，使用逐个转换再合并的方法');
      dataUrl = await handleGridContainer(element, options);
    } else {
      // 检查是否是SVG元素或包含SVG元素，并且是否需要使用canvg处理
      const svgElement = element.tagName.toLowerCase() === 'svg' 
        ? (element as unknown as SVGElement)
        : element.querySelector('svg');
      
      // 对于包含hanzi-writer生成的复杂SVG，优先使用canvg
      const containsHanziWriterSvg = svgElement && (
        svgElement.querySelector('[data-hanzi-writer]') !== null ||
        svgElement.classList.contains('hanzi-writer') ||
        svgElement.querySelector('path[data-hanzi-writer-path]') !== null
      );
      
      // 如果是SVG元素，并且useCanvg为true或者检测到是hanzi-writer的SVG，则使用canvg处理
      if (svgElement && (useCanvg || containsHanziWriterSvg)) {
        console.log('使用canvg处理SVG，优化hanzi-writer生成的复杂路径');
        dataUrl = await convertSvgWithCanvg(svgElement, options);
      } else {
      // 配置html-to-image选项，提高清晰度
      const htmlToImageOptions = {
        backgroundColor,
        quality: Math.max(quality, 0.95), // 确保最低质量为0.95
        canvasWidth: actualWidth,
        canvasHeight: actualHeight,
        pixelRatio: Math.max(window.devicePixelRatio || 1, 2), // 至少使用2倍像素比
        style: {
          imageRendering: 'optimizeQuality',
          textRendering: 'optimizeLegibility',
          fontSmooth: 'always'
        }
      };

      // 根据图片类型选择不同的转换方法
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
          // blob类型需要特殊处理
          const blob = await htmlToImage.toBlob(element, htmlToImageOptions);
          if (blob) {
            dataUrl = URL.createObjectURL(blob);
          }
          break;
        case 'pixel':
          // pixel类型也需要特殊处理
          const pixels = await htmlToImage.toPixelData(element, htmlToImageOptions);
          // 创建一个canvas来展示像素数据
          const canvas = document.createElement('canvas');
          canvas.width = actualWidth;
          canvas.height = actualHeight;
          const context = canvas.getContext('2d');
          if (context) {
            const imageData = context.createImageData(canvas.width, canvas.height);
            imageData.data.set(pixels);
            context.putImageData(imageData, 0, 0);
            // 对于pixel类型，我们总是使用png格式
            dataUrl = canvas.toDataURL('image/png');
          }
          break;
        default:
          dataUrl = await htmlToImage.toPng(element, htmlToImageOptions);
      }
      }
    }

    // 调用生成后的回调
    if (onAfterGenerate && typeof onAfterGenerate === 'function') {
      onAfterGenerate(dataUrl);
    }

    return dataUrl;
  } catch (error) {
    console.error('Error converting element to image:', error);
    throw error;
  }
};

/**
 * 图片工具类
 */
export const ImageTools = {
  elementToImage
};

export default ImageTools;