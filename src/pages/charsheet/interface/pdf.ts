/**
 * 字帖PDF导出相关接口定义
 */

/**
 * PDF导出选项
 */
export interface PDFExportOptions {
  /** 源元素ID */
  sourceElementId: string;
  /** 文件名 */
  fileName?: string;
  /** 图片质量 */
  quality?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** 额外的缩放比例，用于解决内容过大被裁剪的问题 */
  scale?: number;
}

/**
 * PDF页面配置
 */
export interface PDFPageConfig {
  /** 页面宽度（毫米） */
  width: number;
  /** 页面高度（毫米） */
  height: number;
  /** 边距（毫米） */
  margin: number;
  /** 方向 */
  orientation: 'portrait' | 'landscape';
}

/**
 * PDF生成统计信息
 */
export interface PDFGenerationStats {
  /** 总页数 */
  totalPages: number;
  /** 生成时间（毫秒） */
  generationTime: number;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 平均页面处理时间（毫秒） */
  averagePageTime: number;
}