/**
 * 渲染模块统一导出
 * 提供汉字、字体、拼音等渲染功能
 */

// 汉字渲染器（主要接口）- 使用统一的适配器接口
export {
  renderHanziInContainer,
  cleanupHanziWriter,
  preloadLocalCharacterData,
  renderWithHanziWriter,
  renderWithCnchar,
  batchRenderHanzi,
  setRendererConfig,
  getRendererConfig,
  getEngineStatus,
  type RenderEngine
} from './hanzi.renderer';

// HanziWriter引擎特有功能
 export {
   getCharacterStrokeData,
   createStrokeSVG,
   generateStrokeData,
   renderStrokeProgressInContainer,
   clearStrokeDataCache,
   getStrokeDataCacheStats
 } from './hanzi-writer.renderer';

// Cnchar引擎特有功能
export {
  cnchar
} from './cnchar.renderer';

// 字体渲染
export * from './font.renderer';

// 拼音渲染
export {
  getCharacterPinyin,
  getMultipleCharactersPinyin,
  getPinyinString,
  type PinyinConfig,
  type PinyinResult
} from './pinyin.renderer';