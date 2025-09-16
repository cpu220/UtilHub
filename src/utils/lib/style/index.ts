/**
 * 样式模块统一导出
 * 提供样式管理、模板加载、字体管理功能
 */

// 样式管理器
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
} from './style.manager';

// 模板加载器
export {
  renderPrintTemplate,
  preloadTemplate
} from './template.loader';

// 字体管理器
export * from './font.manager';