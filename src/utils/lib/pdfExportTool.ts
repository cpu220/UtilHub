import { jsPDF } from 'jspdf';
import { elementToImage } from '@/utils';

export interface PDFExportOptions {
  sourceElementId: string;
  fileName?: string;
  quality?: number;
  backgroundColor?: string;
}

export class PDFExportTool {
  /**
   * 导出PDF，按A4纸自动分页
   */
  static async exportToPDF(options: PDFExportOptions): Promise<void> {
    const {
      sourceElementId,
      fileName = `字帖_${Date.now()}.pdf`,
      quality = 1.0,
      backgroundColor = '#ffffff'
    } = options;

    try {
      // 获取要导出的元素
      const element = document.getElementById(sourceElementId);
      if (!element) {
        throw new Error('找不到要导出的元素');
      }

      // 生成高质量图片
      const imageOptions = {
        imageType: 'png' as 'png',
        quality,
        backgroundColor,
        useCanvg: true
      };

      const dataUrl = await elementToImage(sourceElementId, imageOptions);
      
      // 创建临时图片元素获取实际尺寸
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      const contentWidth = img.width;
      const contentHeight = img.height;

      // A4纸尺寸 (210 x 297 mm)
      const a4Width = 210;
      const a4Height = 297;
      const margin = 10; // 10mm边距
      const printableWidth = a4Width - (margin * 2);
      const printableHeight = a4Height - (margin * 2);

      // 创建PDF文档
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 像素到毫米的转换系数 (1px = 0.264583mm at 96dpi)
      const pxToMm = 0.264583;
      
      // 计算内容在毫米单位下的原始尺寸
      const contentWidthMm = contentWidth * pxToMm;
      const contentHeightMm = contentHeight * pxToMm;
      
      // 计算缩放比例，确保内容适合A4宽度
      const scale = Math.min(printableWidth / contentWidthMm, 1); // 不放大，只缩小
      const scaledWidthMm = contentWidthMm * scale;
      const scaledHeightMm = contentHeightMm * scale;

      // 计算需要多少页
      const pagesNeeded = Math.ceil(scaledHeightMm / printableHeight);

      // 创建canvas用于分页处理
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建canvas上下文');
      }

      // 设置canvas尺寸
      canvas.width = contentWidth;
      canvas.height = contentHeight;

      // 绘制原始图片到canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, contentWidth, contentHeight);
      ctx.drawImage(img, 0, 0);

      // 按页分割并添加到PDF
      for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        // 计算当前页的裁剪区域（像素单位）
        const pageHeightMm = printableHeight;
        const pageHeightInPx = pageHeightMm / (pxToMm * scale);
        const startY = pageIndex * pageHeightInPx;
        const endY = Math.min(startY + pageHeightInPx, contentHeight);
        const actualHeight = endY - startY;

        // 创建当前页的canvas
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) continue;

        pageCanvas.width = contentWidth;
        pageCanvas.height = actualHeight;

        // 填充背景色
        pageCtx.fillStyle = backgroundColor;
        pageCtx.fillRect(0, 0, contentWidth, actualHeight);

        // 绘制当前页内容
        pageCtx.drawImage(
          canvas,
          0, startY, contentWidth, actualHeight,
          0, 0, contentWidth, actualHeight
        );

        // 转换为dataURL
        const pageDataUrl = pageCanvas.toDataURL('image/png', quality);

        // 添加到PDF
        const imgWidth = scaledWidthMm;
        const imgHeight = actualHeight * pxToMm * scale;
        const x = margin;
        const y = margin;

        pdf.addImage(pageDataUrl, 'PNG', x, y, imgWidth, imgHeight);
      }

      // 保存PDF
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw error;
    }
  }
}