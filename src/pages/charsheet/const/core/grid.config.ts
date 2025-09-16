/**
 * 网格配置相关常量
 * 统一管理网格布局、字体缩放等核心配置
 */

import { ICharsheetConfig } from '@/pages/charsheet/interface';

/**
 * 从CSS变量中获取字体缩放比例
 */
function getFontScaleFromCSS(): number {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const scaleStr = getComputedStyle(document.documentElement)
      .getPropertyValue('--charsheet-font-scale')
      .trim();
    return parseFloat(scaleStr) || 1;
  }
  return 1;
}

/**
 * 字体缩放比例，控制页面展示尺寸的
 * 从CSS变量中动态获取
 */
export const FONT_SCALE = getFontScaleFromCSS();

/**
 * 刷新字体缩放比例
 * 清除缓存并重新获取最新的FONT_SCALE值
 * 当CSS变量--charsheet-font-scale发生变化时调用此函数
 */
export const refreshFontScale = (): number => {
  // 重新获取最新的字体缩放比例
  return getFontScaleFromCSS();
};

/**
 * 获取当前的字体缩放比例
 * 每次调用都会获取最新值（不使用缓存）
 */
export const getCurrentFontScale = (): number => {
  return getFontScaleFromCSS();
};

/**
 * 获取网格字体缩放比例的便捷函数
 */
export const getGridFontScale = (): number => {
  return getFontScaleFromCSS();
};

/**
 * 网格配置
 * 定义单元格的基本尺寸和布局参数
 */
export const GridConfig: ICharsheetConfig = {
  width: 60 * FONT_SCALE,
  height: 60 * FONT_SCALE,
  fontSize: 60 * FONT_SCALE,
  defaultCol: 10
};