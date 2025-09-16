/**
 * 汉字渲染适配器
 * 支持在 hanzi-writer 和 cnchar-draw 之间智能切换
 * 提供统一的接口和字体大小控制
 */

// 导入两种实现
import * as HanziWriterImpl from './hanzi-writer.renderer';
import * as CncharImpl from './cnchar.renderer';
import { IRenderOptions } from '@/pages/charsheet/interface';
import { getGridColor } from '@/pages/charsheet/const';

// 渲染引擎类型
export type RenderEngine = 'hanzi-writer' | 'cnchar-draw';

// 全局配置
interface RendererConfig {
  defaultEngine: RenderEngine;
  fallbackEngine?: RenderEngine;
  enableFallback: boolean;
  debugMode: boolean;
}

// 默认配置
let currentConfig: RendererConfig = {
  defaultEngine: 'cnchar-draw', // 默认使用 cnchar-draw
  fallbackEngine: 'hanzi-writer', // 降级到 hanzi-writer
  enableFallback: true,
  debugMode: false
};

/**
 * 设置渲染器配置
 * @param config 新的配置
 */
export const setRendererConfig = (config: Partial<RendererConfig>) => {
  currentConfig = { ...currentConfig, ...config };
  if (currentConfig.debugMode) {
    console.log('汉字渲染器配置已更新:', currentConfig);
  }
};

/**
 * 获取当前渲染器配置
 * @returns 当前配置
 */
export const getRendererConfig = (): RendererConfig => {
  return { ...currentConfig };
};

/**
 * 获取指定引擎的实现
 * @param engine 渲染引擎类型
 * @returns 对应的实现对象
 */
const getEngineImpl = (engine: RenderEngine) => {
  switch (engine) {
    case 'hanzi-writer':
      return HanziWriterImpl;
    case 'cnchar-draw':
      return CncharImpl;
    default:
      return HanziWriterImpl;
  }
};

/**
 * 标准化渲染选项，确保字体大小的一致性
 * @param options 原始选项
 * @returns 标准化后的选项
 */
const normalizeRenderOptions = (options: any = {}): any => {
  const normalized = { ...options };
  
  // 统一字体大小处理
  if (!normalized.fontSize) {
    normalized.fontSize = normalized.width || 100;
  }
  
  // 确保基本参数存在
  normalized.width = normalized.width || normalized.fontSize || 100;
  normalized.height = normalized.height || normalized.fontSize || 100;
  normalized.strokeWidth = normalized.strokeWidth || 3;
  normalized.strokeColor = normalized.strokeColor || '#333';
  normalized.radicalColor = normalized.radicalColor || '#ff0000';
  normalized.padding = normalized.padding || 5;
  
  // 默认使用米字格背景
  if (normalized.useGridBackground === undefined) {
    normalized.useGridBackground = true;
  }
  
  normalized.gridColor = normalized.gridColor || getGridColor();
  
  return normalized;
};

/**
 * 检查引擎是否可用
 * @param engine 渲染引擎类型
 * @returns 是否可用
 */
const isEngineAvailable = (engine: RenderEngine): boolean => {
  try {
    const impl = getEngineImpl(engine);
    return impl && typeof impl.renderHanziInContainer === 'function';
  } catch (error) {
    console.warn(`检查引擎 ${engine} 可用性时出错:`, error);
    return false;
  }
};

/**
 * 统一的汉字渲染方法
 * @param containerId 容器ID
 * @param character 要渲染的汉字
 * @param options 渲染选项
 * @param engine 指定使用的渲染引擎（可选）
 * @returns 渲染实例
 */
export const renderHanziInContainer = (
  containerId: string, 
  character: string, 
  options: Partial<IRenderOptions> = {},
  engine?: RenderEngine
) => {
  // 参数验证
  if (!containerId || !character) {
    console.error('容器ID和字符不能为空');
    return null;
  }
  
  // 优先级：显式传入的 engine > options.renderEngine > 全局配置
  const targetEngine = engine || options.renderEngine || currentConfig.defaultEngine;
  
  // 标准化选项
  const normalizedOptions = normalizeRenderOptions(options);
  
  if (currentConfig.debugMode) {
    console.log('渲染汉字:', {
      containerId,
      character,
      targetEngine,
      fontSize: normalizedOptions.fontSize,
      useGridBackground: normalizedOptions.useGridBackground
    });
  }
  
  // 在渲染前先清理容器，避免多个 SVG 冲突
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
    container.style.position = '';
  } else {
    console.error(`未找到ID为"${containerId}"的容器`);
    return null;
  }
  
  // 尝试使用指定引擎渲染
  try {
    if (!isEngineAvailable(targetEngine)) {
      throw new Error(`渲染引擎 ${targetEngine} 不可用`);
    }
    
    const impl = getEngineImpl(targetEngine);
    const result = impl.renderHanziInContainer(containerId, character, normalizedOptions);
    
    if (currentConfig.debugMode) {
      console.log(`使用 ${targetEngine} 渲染成功`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`${targetEngine} 渲染失败:`, error);
    
    // 如果启用了降级处理且有降级引擎
    if (currentConfig.enableFallback && currentConfig.fallbackEngine && currentConfig.fallbackEngine !== targetEngine) {
      console.log(`尝试使用降级引擎 ${currentConfig.fallbackEngine}`);
      
      try {
        if (isEngineAvailable(currentConfig.fallbackEngine)) {
          const fallbackImpl = getEngineImpl(currentConfig.fallbackEngine);
          const result = fallbackImpl.renderHanziInContainer(containerId, character, normalizedOptions);
          
          if (currentConfig.debugMode) {
            console.log(`使用降级引擎 ${currentConfig.fallbackEngine} 渲染成功`);
          }
          
          return result;
        }
      } catch (fallbackError) {
          console.error(`降级引擎 ${currentConfig.fallbackEngine} 也渲染失败:`, fallbackError);
        }
    }
    
    // 最终降级：显示纯文字
    console.log('所有渲染引擎都失败，使用纯文字降级');
    const fontSize = normalizedOptions.fontSize || 100;
    const actualSize = Math.floor(fontSize * 1);
    
    container.innerHTML = `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${normalizedOptions.width}px;
      height: ${normalizedOptions.height}px;
      font-size: ${actualSize}px;
      color: ${normalizedOptions.strokeColor};
      font-family: serif;
      border: ${normalizedOptions.useGridBackground ? '1px solid ' + normalizedOptions.gridColor : 'none'};
      background: ${normalizedOptions.useGridBackground ? 'linear-gradient(to right, transparent 49%, ' + normalizedOptions.gridColor + ' 49%, ' + normalizedOptions.gridColor + ' 51%, transparent 51%), linear-gradient(to bottom, transparent 49%, ' + normalizedOptions.gridColor + ' 49%, ' + normalizedOptions.gridColor + ' 51%, transparent 51%)' : 'none'};
    ">${character}</div>`;
    
    return null;
  }
};

/**
 * 清理汉字渲染资源
 * @param containerId 容器ID
 * @param engine 指定引擎（可选）
 */
export const cleanupHanziWriter = (containerId: string, engine?: RenderEngine) => {
  const targetEngine = engine || currentConfig.defaultEngine;
  
  try {
    const impl = getEngineImpl(targetEngine);
    if (impl && typeof impl.cleanupHanziWriter === 'function') {
      impl.cleanupHanziWriter(containerId);
    }
    
    // 同时清理另一个引擎的资源（防止引擎切换时的资源泄漏）
    const otherEngine = targetEngine === 'hanzi-writer' ? 'cnchar-draw' : 'hanzi-writer';
    const otherImpl = getEngineImpl(otherEngine);
    if (otherImpl && typeof otherImpl.cleanupHanziWriter === 'function') {
      otherImpl.cleanupHanziWriter(containerId);
    }
    
  } catch (error) {
    console.error('清理渲染资源时出错:', error);
  }
};

/**
 * 预加载本地汉字数据
 * @param characters 要预加载的汉字数组
 * @param engine 指定引擎（可选）
 */
export const preloadLocalCharacterData = (characters: string[], engine?: RenderEngine) => {
  const targetEngine = engine || currentConfig.defaultEngine;
  
  try {
    const impl = getEngineImpl(targetEngine);
    if (impl && typeof impl.preloadLocalCharacterData === 'function') {
      impl.preloadLocalCharacterData(characters);
    }
    
    // 同时预加载降级引擎的数据
    if (currentConfig.enableFallback && currentConfig.fallbackEngine && currentConfig.fallbackEngine !== targetEngine) {
      const fallbackImpl = getEngineImpl(currentConfig.fallbackEngine);
      if (fallbackImpl && typeof fallbackImpl.preloadLocalCharacterData === 'function') {
        fallbackImpl.preloadLocalCharacterData(characters);
      }
    }
    
  } catch (error) {
    console.error('预加载汉字数据时出错:', error);
  }
};

/**
 * 便捷方法：使用 hanzi-writer 渲染
 */
export const renderWithHanziWriter = (containerId: string, character: string, options: Partial<IRenderOptions> = {}) => {
  return renderHanziInContainer(containerId, character, options, 'hanzi-writer');
};

/**
 * 便捷方法：使用 cnchar-draw 渲染
 */
export const renderWithCnchar = (containerId: string, character: string, options: Partial<IRenderOptions> = {}) => {
  return renderHanziInContainer(containerId, character, options, 'cnchar-draw');
};

/**
 * 批量渲染汉字（支持不同引擎）
 * @param tasks 渲染任务数组
 */
export const batchRenderHanzi = async (tasks: Array<{
  containerId: string;
  character: string;
  options?: Partial<IRenderOptions>;
  engine?: RenderEngine;
}>) => {
  const results = [];
  
  for (const task of tasks) {
    try {
      const result = renderHanziInContainer(
        task.containerId,
        task.character,
        task.options || {},
        task.engine
      );
      results.push({ success: true, result, task });
    } catch (error) {
      results.push({ success: false, error, task });
    }
    
    // 添加小延迟避免阻塞UI
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  return results;
};

/**
 * 获取引擎状态信息
 */
export const getEngineStatus = () => {
  return {
    'hanzi-writer': {
      available: isEngineAvailable('hanzi-writer'),
      description: '基于 hanzi-writer 的笔画渲染引擎'
    },
    'cnchar-draw': {
      available: isEngineAvailable('cnchar-draw'),
      description: '基于 cnchar-draw 的笔画渲染引擎'
    },
    currentConfig: currentConfig
  };
};

// 导出引擎实现以供高级用法
export { HanziWriterImpl, CncharImpl };

// 默认导出
export default {
  renderHanziInContainer,
  cleanupHanziWriter,
  preloadLocalCharacterData,
  renderWithHanziWriter,
  renderWithCnchar,
  batchRenderHanzi,
  setRendererConfig,
  getRendererConfig,
  getEngineStatus
};