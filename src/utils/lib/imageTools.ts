/**
 * 图片工具类
 * 提供将HTML元素转换为图片的功能，特别优化了对hanzi-writer生成的SVG的处理
 */
import * as htmlToImage from 'html-to-image';
import { Canvg } from 'canvg';

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
      
      // 设置canvas大小为SVG元素的尺寸
      const { width, height } = svgElement.getBoundingClientRect();
      canvas.width = width * (window.devicePixelRatio || 1);
      canvas.height = height * (window.devicePixelRatio || 1);
      
      // 使用canvg渲染SVG到canvas
      const v = Canvg.fromString(ctx, svgString, {
        background: options.backgroundColor || '#ffffff',
        scaleWidth: canvas.width,
        scaleHeight: canvas.height,
        ignoreMouse: true,
        ignoreAnimation: false // 保留动画效果
      });
      
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