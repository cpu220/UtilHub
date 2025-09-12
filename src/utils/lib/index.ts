// 原有导出（排除有冲突的方法）
export * from './printTools'
export * from './mockUtils'
export * from './imageTools'
export * from './fontManager'
export * from './fontRenderer'

// 从 hanziWriterRenderer 导出非冲突的方法和米字格工具
export {
  preloadLocalCharacterData as preloadHanziWriterData,
  cleanupHanziWriter as cleanupHanziWriterOriginal,
  createGridSVG,
  addGridLinesToSVG,
  createEmptyGridInContainer,
  safelyClearContainer,
  getCharacterStrokeData,
  createStrokeSVG,
  createStrokeOrderContainer
} from './hanziWriterRenderer';

// 新的 cnchar-draw 相关导出（使用别名避免冲突）
export {
  renderHanziWithCnchar,
  cleanupCncharDraw,
  preloadLocalCharacterData as preloadCncharData,
  cnchar
} from './cncharTools';

// 内容处理器相关导出
export * from './contentProcessors';

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

// 统一样式管理工具
export {
  StyleManager,
  styleManager,
  getPrintStyles,
  applyUnifiedStyles,
  getComputedStyles,
  cloneElementWithComputedStyles,
  createPrintDocument,
  computedStyleToInline,
  optimizeForPrint
} from './styleManager';

// 模板加载工具
export {
  renderPrintTemplate,
  preloadTemplate
} from './templateLoader';