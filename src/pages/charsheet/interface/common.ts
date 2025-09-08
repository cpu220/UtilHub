/**
 * 字帖通用接口定义
 */

/**
 * 页面内容信息
 */
export interface PageContent {
  /** 页面索引 */
  pageIndex: number;
  /** 容器ID */
  containerId: string;
  /** 图片数据URL */
  dataUrl: string;
  /** 页面尺寸信息 */
  dimensions: {
    width: number;
    height: number;
    startY: number;
    endY: number;
  };
  /** 是否为最后一页 */
  isLastPage: boolean;
}

/**
 * 内容处理选项
 */
export interface ContentProcessOptions {
  /** 源元素ID */
  sourceElementId: string;
  /** 图片质量 */
  quality?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** 用户缩放比例 */
  scale?: number;
}

/**
 * 内容处理结果
 */
export interface ContentProcessResult {
  /** 处理后的页面内容列表 */
  pages: PageContent[];
  /** 整页图片信息 */
  fullImage: {
    dataUrl: string;
    width: number;
    height: number;
  };
  /** 处理统计信息 */
  stats: {
    totalPages: number;
    totalContainers: number;
    processingTime: number;
  };
}