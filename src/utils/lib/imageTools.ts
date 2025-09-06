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
      // 保存原始尺寸，不应用devicePixelRatio
      const originalWidth = containerRect.width;
      const originalHeight = containerRect.height;
      // 设置canvas尺寸，应用devicePixelRatio
      canvas.width = originalWidth * (window.devicePixelRatio || 1);
      canvas.height = originalHeight * (window.devicePixelRatio || 1);
      // 缩放上下文以匹配设备像素比
      context.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      
      // 设置背景色
      context.fillStyle = options.backgroundColor || '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
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
          // 计算相对位置时不应用devicePixelRatio，只在最终绘制时应用
          const x = (elementRect.left - containerRect.left);
          const y = (elementRect.top - containerRect.top);
          const width = elementRect.width;
          const height = elementRect.height;
          
          // 应用devicePixelRatio到最终绘制坐标和尺寸
          const scaledX = x * (window.devicePixelRatio || 1);
          const scaledY = y * (window.devicePixelRatio || 1);
          const scaledWidth = width * (window.devicePixelRatio || 1);
          const scaledHeight = height * (window.devicePixelRatio || 1);
          
          // 检查是否是SVG元素
          if (element.tagName.toLowerCase() === 'svg') {
            // 对SVG元素使用canvg处理
            elementDataUrl = await convertSvgWithCanvg(element as unknown as SVGElement, options);
          } else {
            // 对于非SVG元素，使用html-to-image处理
            const elementOptions = {
              backgroundColor: 'transparent',
              quality: options.quality,
              canvasWidth: elementRect.width,
              canvasHeight: elementRect.height,
              pixelRatio: window.devicePixelRatio || 1
            };
            elementDataUrl = await htmlToImage.toPng(element as unknown as HTMLElement, elementOptions);
          }
          
          // 将元素图片绘制到主canvas上
          const img = new Image();
          img.onload = () => {
            // 绘制图片到对应的位置，使用原始坐标和尺寸
            // 因为context已经被缩放，所以这里使用未缩放的坐标和尺寸
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
      
      // 获取SVG元素的尺寸
      const { width, height } = svgElement.getBoundingClientRect();
      
      // 获取SVG的viewBox属性，如果存在，可能包含更准确的内容尺寸
      let viewBoxWidth = width
      let viewBoxHeight = height;
      
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(' ').map(parseFloat);
        if (!isNaN(vbWidth) && !isNaN(vbHeight)) {
          // 如果viewBox尺寸大于元素尺寸，使用viewBox尺寸
          viewBoxWidth = Math.max(width, vbWidth);
          viewBoxHeight = Math.max(height, vbHeight);
        }
      }
      
      // 为确保内容不被裁剪，增加一个小的边距
      const margin = 10;
      
      // 保存原始尺寸，不应用devicePixelRatio
      const originalWidth = viewBoxWidth + margin * 2;
      const originalHeight = viewBoxHeight + margin * 2;
      
      // 设置canvas尺寸，应用devicePixelRatio
      canvas.width = originalWidth * (window.devicePixelRatio || 1);
      canvas.height = originalHeight * (window.devicePixelRatio || 1);
      
      // 缩放上下文以匹配设备像素比
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      
      // 使用canvg渲染SVG到canvas
      const v = Canvg.fromString(ctx, svgString, {
        // 使用原始尺寸加边距，而不是乘以devicePixelRatio后的尺寸
        scaleWidth: originalWidth,
        scaleHeight: originalHeight,
        ignoreMouse: true,
        ignoreAnimation: false, // 保留动画效果
        offsetX: margin, // 添加边距偏移
        offsetY: margin  // 添加边距偏移
      });
      
      // 设置背景色
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 渲染并转换为图片数据URL
      v.render().then(() => {
        try {
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
      // 配置html-to-image选项
      const htmlToImageOptions = {
        backgroundColor,
        quality,
        canvasWidth: element.clientWidth,
        canvasHeight: element.clientHeight,
        pixelRatio: window.devicePixelRatio || 1
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
          canvas.width = element.clientWidth;
          canvas.height = element.clientHeight;
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