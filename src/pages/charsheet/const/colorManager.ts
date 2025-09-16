/**
 * 颜色配置管理器
 * 统一管理字帖相关的颜色配置，确保与colors.less保持一致
 */

/**
 * 从CSS变量中获取颜色值
 * @param cssVarName CSS变量名（不包含--前缀）
 * @param fallback 备用颜色值
 * @returns 颜色值
 */
function getCSSVariableValue(cssVarName: string, fallback: string): string {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${cssVarName}`)
      .trim();
    return value || fallback;
  }
  return fallback;
}

/**
 * 动态颜色配置类
 */
export class ColorManager {
  private static instance: ColorManager;
  private colorCache = new Map<string, string>();

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): ColorManager {
    if (!ColorManager.instance) {
      ColorManager.instance = new ColorManager();
    }
    return ColorManager.instance;
  }

  /**
   * 获取边框颜色
   */
  public getBorderColor(): string {
    if (!this.colorCache.has('border')) {
      const color = getCSSVariableValue('charsheet-border-color', '#ddd');
      this.colorCache.set('border', color);
    }
    return this.colorCache.get('border')!;
  }

  /**
   * 获取网格颜色（米字格颜色）
   */
  public getGridColor(): string {
    if (!this.colorCache.has('grid')) {
      const color = getCSSVariableValue('charsheet-grid-color', '#ddd');
      this.colorCache.set('grid', color);
    }
    return this.colorCache.get('grid')!;
  }

  /**
   * 获取字体缩放比例
   */
  public getFontScale(): number {
    if (!this.colorCache.has('fontScale')) {
      const scale = getCSSVariableValue('charsheet-font-scale', '1');
      const numScale = parseFloat(scale) || 1;
      this.colorCache.set('fontScale', numScale.toString());
    }
    return parseFloat(this.colorCache.get('fontScale')!) || 1;
  }

  /**
   * 清除缓存（当颜色配置更新时调用）
   */
  public clearCache(): void {
    this.colorCache.clear();
  }

  /**
   * 获取所有颜色配置
   */
  public getAllColors(): { borderColor: string; gridColor: string; fontScale: number } {
    return {
      borderColor: this.getBorderColor(),
      gridColor: this.getGridColor(),
      fontScale: this.getFontScale()
    };
  }
}

/**
 * 导出单例实例
 */
export const colorManager = ColorManager.getInstance();

/**
 * 便捷函数：获取边框颜色
 */
export const getBorderColor = (): string => colorManager.getBorderColor();

/**
 * 便捷函数：获取网格颜色
 */
export const getGridColor = (): string => colorManager.getGridColor();

/**
 * 便捷函数：获取字体缩放比例
 */
export const getFontScale = (): number => {
  const scal =  colorManager.getFontScale();
  console.log('getFontScale', scal);
  return scal;
}

/**
 * 更新后的字帖颜色常量（兼容现有代码）
 */
export const CharsheetColors = {
  get BORDER_COLOR() {
    return getBorderColor();
  },
  get GRID_COLOR() {
    return getGridColor();
  }
} as const;