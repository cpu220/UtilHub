/**
 * 字体管理工具类
 * 提供字体选择、上传、管理等功能
 */

export interface IFontOption {
  name: string;
  value: string;
  type: 'system' | 'custom';
  url?: string; // 自定义字体的URL
}

export interface IFontManagerConfig {
  enableUpload: boolean;
  maxFileSize: number; // MB
  supportedFormats: string[];
}

/**
 * 预设系统字体列表
 */
export const SYSTEM_FONTS: IFontOption[] = [
  {
    name: '默认字体',
    value: 'system-ui, -apple-system, sans-serif',
    type: 'system'
  },
  {
    name: '苹方-细体',
    value: 'PingFangSC-Light, "PingFang SC", "Helvetica Neue", Helvetica, Arial, sans-serif',
    type: 'system'
  },
  {
    name: '苹方-常规',
    value: 'PingFangSC-Regular, "PingFang SC", "Helvetica Neue", Helvetica, Arial, sans-serif',
    type: 'system'
  },
  {
    name: '苹方-中粗',
    value: 'PingFangSC-Medium, "PingFang SC", "Helvetica Neue", Helvetica, Arial, sans-serif',
    type: 'system'
  },
  {
    name: '黑体',
    value: '"Heiti SC", "Microsoft YaHei", SimHei, sans-serif',
    type: 'system'
  },
  {
    name: '宋体',
    value: 'SimSun, "Songti SC", serif',
    type: 'system'
  },
  {
    name: '楷体',
    value: 'KaiTi, "Kaiti SC", cursive',
    type: 'system'
  },
  {
    name: 'Helvetica',
    value: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
    type: 'system'
  },
  {
    name: 'Arial',
    value: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    type: 'system'
  },
  {
    name: 'Times New Roman',
    value: '"Times New Roman", Times, serif',
    type: 'system'
  }
];

/**
 * 字体管理器类
 */
export class FontManager {
  private static instance: FontManager;
  private customFonts: IFontOption[] = [];
  private config: IFontManagerConfig;
  private loadedFonts: Set<string> = new Set();

  private constructor(config?: Partial<IFontManagerConfig>) {
    this.config = {
      enableUpload: true,
      maxFileSize: 10, // 10MB
      supportedFormats: ['.ttf', '.otf', '.woff', '.woff2'],
      ...config
    };
    
    // 从localStorage恢复自定义字体
    this.loadCustomFontsFromStorage();
  }

  /**
   * 获取字体管理器实例（单例模式）
   */
  public static getInstance(config?: Partial<IFontManagerConfig>): FontManager {
    if (!FontManager.instance) {
      FontManager.instance = new FontManager(config);
    }
    return FontManager.instance;
  }

  /**
   * 获取所有可用字体
   */
  public getAllFonts(): IFontOption[] {
    return [...SYSTEM_FONTS, ...this.customFonts];
  }

  /**
   * 获取系统字体
   */
  public getSystemFonts(): IFontOption[] {
    return SYSTEM_FONTS;
  }

  /**
   * 获取自定义字体
   */
  public getCustomFonts(): IFontOption[] {
    return this.customFonts;
  }

  /**
   * 上传并添加自定义字体
   */
  public async uploadFont(file: File): Promise<IFontOption> {
    // 验证文件
    this.validateFontFile(file);

    try {
      // 创建字体URL
      const fontUrl = URL.createObjectURL(file);
      
      // 提取字体名称（去掉扩展名）
      const fontName = file.name.replace(/\.[^/.]+$/, '');
      
      // 创建字体选项
      const fontOption: IFontOption = {
        name: fontName,
        value: `"${fontName}"`,
        type: 'custom',
        url: fontUrl
      };

      // 加载字体到页面
      await this.loadFontToPage(fontOption, file);
      
      // 添加到自定义字体列表
      this.customFonts.push(fontOption);
      
      // 保存到localStorage
      this.saveCustomFontsToStorage();
      
      return fontOption;
    } catch (error) {
      console.error('字体上传失败:', error);
      throw new Error('字体上传失败，请检查文件格式');
    }
  }

  /**
   * 删除自定义字体
   */
  public removeCustomFont(fontName: string): boolean {
    const index = this.customFonts.findIndex(font => font.name === fontName);
    if (index > -1) {
      const font = this.customFonts[index];
      
      // 释放URL资源
      if (font.url) {
        URL.revokeObjectURL(font.url);
      }
      
      // 从列表中移除
      this.customFonts.splice(index, 1);
      
      // 更新localStorage
      this.saveCustomFontsToStorage();
      
      // 从页面中移除字体样式
      this.removeFontFromPage(font.name);
      
      return true;
    }
    return false;
  }

  /**
   * 根据名称查找字体
   */
  public findFontByName(name: string): IFontOption | undefined {
    return this.getAllFonts().find(font => font.name === name);
  }

  /**
   * 根据值查找字体
   */
  public findFontByValue(value: string): IFontOption | undefined {
    return this.getAllFonts().find(font => font.value === value);
  }

  /**
   * 验证字体文件
   */
  private validateFontFile(file: File): void {
    // 检查文件大小
    const maxSize = this.config.maxFileSize * 1024 * 1024; // 转换为字节
    if (file.size > maxSize) {
      throw new Error(`文件大小不能超过 ${this.config.maxFileSize}MB`);
    }

    // 检查文件格式
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.config.supportedFormats.includes(fileExtension)) {
      throw new Error(`不支持的文件格式，支持的格式：${this.config.supportedFormats.join(', ')}`);
    }
  }

  /**
   * 将字体加载到页面
   */
  private async loadFontToPage(fontOption: IFontOption, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 创建FontFace对象
        const fontFace = new FontFace(fontOption.name, `url(${fontOption.url})`);
        
        // 加载字体
        fontFace.load().then(() => {
          // 添加到document.fonts
          document.fonts.add(fontFace);
          this.loadedFonts.add(fontOption.name);
          resolve();
        }).catch((error) => {
          console.error('字体加载失败:', error);
          reject(new Error('字体文件格式不正确或已损坏'));
        });
      } catch (error) {
        console.error('创建FontFace失败:', error);
        reject(new Error('字体加载失败'));
      }
    });
  }

  /**
   * 从页面中移除字体
   */
  private removeFontFromPage(fontName: string): void {
    // 查找并删除对应的FontFace
    for (const fontFace of document.fonts) {
      if (fontFace.family === fontName) {
        document.fonts.delete(fontFace);
        break;
      }
    }
    this.loadedFonts.delete(fontName);
  }

  /**
   * 从localStorage加载自定义字体
   */
  private loadCustomFontsFromStorage(): void {
    try {
      const stored = localStorage.getItem('custom-fonts');
      if (stored) {
        const fonts = JSON.parse(stored) as IFontOption[];
        // 注意：由于URL.createObjectURL创建的URL在页面刷新后会失效，
        // 这里只恢复字体信息，实际使用时需要用户重新上传
        this.customFonts = fonts.map(font => ({ ...font, url: undefined }));
      }
    } catch (error) {
      console.error('加载自定义字体失败:', error);
    }
  }

  /**
   * 保存自定义字体到localStorage
   */
  private saveCustomFontsToStorage(): void {
    try {
      // 只保存字体信息，不保存URL（因为URL会失效）
      const fontsToSave = this.customFonts.map(font => ({
        name: font.name,
        value: font.value,
        type: font.type
      }));
      localStorage.setItem('custom-fonts', JSON.stringify(fontsToSave));
    } catch (error) {
      console.error('保存自定义字体失败:', error);
    }
  }

  /**
   * 检查字体是否已加载
   */
  public isFontLoaded(fontName: string): boolean {
    return this.loadedFonts.has(fontName);
  }

  /**
   * 获取配置
   */
  public getConfig(): IFontManagerConfig {
    return { ...this.config };
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    // 释放所有自定义字体的URL资源
    this.customFonts.forEach(font => {
      if (font.url) {
        URL.revokeObjectURL(font.url);
      }
    });
    this.customFonts = [];
    this.loadedFonts.clear();
  }
}

// 导出默认实例
export const fontManager = FontManager.getInstance();

// 导出工具函数
export const getFontOptions = () => fontManager.getAllFonts();
export const uploadCustomFont = (file: File) => fontManager.uploadFont(file);
export const removeCustomFont = (fontName: string) => fontManager.removeCustomFont(fontName);
export const findFont = (name: string) => fontManager.findFontByName(name);