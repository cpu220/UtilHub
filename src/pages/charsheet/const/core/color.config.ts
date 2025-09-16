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
    if (!this.colorCache.has('borderColor')) {
      const color = getCSSVariableValue('charsheet-border-color', '#ddd');
      this.colorCache.set('borderColor', color);
    }
    return this.colorCache.get('borderColor')!;
  }

  /**
   * 获取网格颜色
   */
  public getGridColor(): string {
    if (!this.colorCache.has('gridColor')) {
      const color = getCSSVariableValue('charsheet-grid-color', '#ddd');
      this.colorCache.set('gridColor', color);
    }
    return this.colorCache.get('gridColor')!;
  }

  /**
   * 获取字体缩放比例
   */
  public getFontScale(): number {
    if (!this.colorCache.has('fontScale')) {
      const scaleStr = getCSSVariableValue('charsheet-font-scale', '1');
      const scale = parseFloat(scaleStr) || 1;
      this.colorCache.set('fontScale', scale.toString());
    }
    return parseFloat(this.colorCache.get('fontScale')!);
  }

  /**
   * 清除缓存
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
 * 颜色管理器单例实例
 */
export const colorManager = ColorManager.getInstance();

/**
 * 获取边框颜色的便捷函数
 */
export const getBorderColor = (): string => colorManager.getBorderColor();

/**
 * 获取网格颜色的便捷函数
 */
export const getGridColor = (): string => colorManager.getGridColor();

/**
 * 获取字体缩放比例的便捷函数
 */
export const getFontScale = (): number => {
  return colorManager.getFontScale();
};

/**
 * 字帖颜色常量对象
 */
export const CharsheetColors = {
  get BORDER_COLOR() {
    return getBorderColor();
  },
  get GRID_COLOR() {
    return getGridColor();
  }
} as const;