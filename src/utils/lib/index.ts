// 原有导出（排除有冲突的方法）
export * from './printTools'
export * from './mockUtils'
export * from './imageTools'
export * from './fontManager'
export * from './fontRenderer'

// 从 fontTools 导出非冲突的方法
export {
  preloadLocalCharacterData as preloadHanziWriterData,
  cleanupHanziWriter as cleanupHanziWriterOriginal
} from './fontTools';

// 新的 cnchar-draw 相关导出（使用别名避免冲突）
export {
  renderHanziWithCnchar,
  cleanupCncharDraw,
  preloadLocalCharacterData as preloadCncharData,
  cnchar
} from './cncharTools';

// 汉字渲染适配器导出（这个是主要的统一接口，替代原来的 fontTools）
export {
  renderHanziInContainer,  // 使用适配器版本替代原来的 fontTools 版本
  cleanupHanziWriter,
  preloadLocalCharacterData,
  renderWithHanziWriter,
  renderWithCnchar,
  batchRenderHanzi,
  setRendererConfig,
  getRendererConfig,
  type RenderEngine
} from './hanziRenderer';

// 为了向后兼容，也导出一个别名
export {
  renderHanziInContainer as renderHanzi
} from './hanziRenderer';