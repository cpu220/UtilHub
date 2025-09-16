/**
 * Utils/Lib 统一导出文件
 * 重构后的模块化结构
 */

// 核心功能模块
export * from './core';

// 导出功能模块
export * from './export';

// 样式管理模块
export * from './style';

// 向后兼容的别名导出
export {
  renderHanziInContainer as renderHanzi
} from './core';
// 旧的导出已移动到对应的模块中
// 通过上面的 export * from './style' 自动导出