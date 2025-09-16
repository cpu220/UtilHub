/**
 * 图片导出工具
 * 提供将HTML元素导出为各种图片格式的功能
 * 支持PNG、JPG、JPEG、WebP等格式，并提供质量控制和背景色设置
 */
import { elementToImage } from '@/utils';

export type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'webp';

export interface ImageExportOptions {
  sourceElementId: string;
  format?: ImageFormat;
  fileName?: string;
  quality?: number;
  backgroundColor?: string;
}

export class ImageExportTool {
  /**
   * 导出为PNG格式
   */
  static async exportToPNG(options: ImageExportOptions): Promise<void> {
    const {
      sourceElementId,
      fileName = `字帖_${Date.now()}.png`,
      quality = 1.0,
      backgroundColor = '#ffffff'
    } = options;

    try {
      const imageOptions = {
        imageType: 'png' as 'png',
        quality,
        backgroundColor,
        useCanvg: true
      };

      const dataUrl = await elementToImage(sourceElementId, imageOptions);
      this.downloadImage(dataUrl, fileName);
    } catch (error) {
      console.error('PNG导出失败:', error);
      throw error;
    }
  }

  /**
   * 导出为JPG格式
   */
  static async exportToJPG(options: ImageExportOptions): Promise<void> {
    const {
      sourceElementId,
      fileName = `字帖_${Date.now()}.jpg`,
      quality = 0.98,
      backgroundColor = '#ffffff'
    } = options;

    try {
      const imageOptions = {
        imageType: 'jpeg' as 'jpeg',
        quality,
        backgroundColor,
        useCanvg: true,
        // 强制白色背景样式
        style: {
          backgroundColor: '#ffffff'
        }
      };

      const dataUrl = await elementToImage(sourceElementId, imageOptions);
      this.downloadImage(dataUrl, fileName);
    } catch (error) {
      console.error('JPG导出失败:', error);
      throw error;
    }
  }

  /**
   * 通用图片导出方法
   */
  static async exportToImage(options: ImageExportOptions): Promise<void> {
    const { format = 'png' } = options;

    switch (format.toLowerCase()) {
      case 'png':
        return this.exportToPNG(options);
      case 'jpg':
      case 'jpeg':
        return this.exportToJPG(options);
      default:
        throw new Error(`不支持的图片格式: ${format}`);
    }
  }

  /**
   * 下载图片文件
   */
  private static downloadImage(dataUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 获取支持的图片格式列表
   */
  static getSupportedFormats(): ImageFormat[] {
    return ['png', 'jpg'];
  }

  /**
   * 验证图片格式是否支持
   */
  static isFormatSupported(format: string): boolean {
    return this.getSupportedFormats().includes(format.toLowerCase() as ImageFormat);
  }
}