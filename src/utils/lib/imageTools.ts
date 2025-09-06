/**
 * 图片工具类
 * 提供将HTML元素转换为图片的功能
 */
import * as htmlToImage from 'html-to-image';

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
}

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
    onAfterGenerate
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

    // 配置选项
    const htmlToImageOptions = {
      backgroundColor,
      quality,
      // 其他可能的选项
      canvasWidth: element.clientWidth,
      canvasHeight: element.clientHeight,
      pixelRatio: window.devicePixelRatio || 1
    };

    // 根据图片类型选择不同的转换方法
    let dataUrl = '';
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