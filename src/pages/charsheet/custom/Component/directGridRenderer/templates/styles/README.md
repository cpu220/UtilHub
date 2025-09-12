# 模板样式管理系统

## 概述

模板样式管理系统提供了一个可扩展的、动态加载的CSS样式管理方案，根据`TemplateType`自动加载对应的样式，降低后期维护成本。

## 核心特性

- 🎯 **动态加载**：根据模板类型按需加载样式
- 🔧 **统一管理**：所有模板样式集中配置
- 📦 **自动注入**：样式自动注入到页面头部
- 🚀 **性能优化**：避免重复加载，支持样式卸载
- 🔄 **易扩展**：新增模板只需添加样式配置

## 使用方法

### 1. 统一样式管理（推荐）

现在使用统一样式管理系统，以web样式为主，自动同步到打印和导出：

```typescript
import { getPrintStyles, applyUnifiedStyles } from './templates';

// 获取元素的打印样式（自动从web样式获取）
const printDocument = getPrintStyles('element-id');

// 应用统一样式到元素
const styledElement = applyUnifiedStyles(element);
```

### 2. 模板样式开发

开发新模板时，只需维护web样式：

```less
/* 只需编写web样式 */
.my-template-container {
  display: flex;
  gap: 10px;
  margin: 20px;
}

/* 打印优化 - 仅添加打印特有属性 */
@media print {
  .my-template-container {
    page-break-inside: avoid;
  }
}
```

### 3. 在组件中使用

```typescript
// 样式会自动从web获取，无需手动加载
// 打印时会自动应用web样式
```

## 添加新模板样式

### 1. 创建模板目录和样式文件

按照统一的目录结构创建新模板：

```
templates/
├── FourGridTemplate/           # 新模板目录
│   ├── index.tsx              # 模板组件
│   └── index.less             # 样式文件
```

### 2. 编写样式文件

在 `FourGridTemplate/index.less` 中只需编写web样式：

```less
/* 四宫格模板样式 */
.four-grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  width: 100%;
}

.four-grid-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
}

/* 打印优化 - 仅添加打印特有属性 */
@media print {
  .four-grid-container,
  .four-grid-cell {
    page-break-inside: avoid;
  }
}
```

### 3. 添加模板类型

在 `types.ts` 中添加新的模板类型：

```typescript
export enum TemplateType {
  STANDARD = 'standard',
  LEFT_RIGHT = 'left_right',
  SINGLE_ROW = 'single_row',
  FOUR_GRID = 'four_grid', // 新增
}
```

### 2. 创建模板实现类

```typescript
export class FourGridTemplate extends BaseGridTemplate {
  readonly type = TemplateType.FOUR_GRID;
  readonly name = '四宫格网格';
  readonly description = '2x2四宫格布局';

  public async render(params: TemplateRenderParams): Promise<TemplateRenderResult> {
    // 实现渲染逻辑
    // ...
  }
}
```

### 3. 注册到工厂

```typescript
// 在 TemplateFactory.ts 中注册
private registerDefaultTemplates(): void {
  this.templates.set(TemplateType.STANDARD, () => new StandardGridTemplate());
  this.templates.set(TemplateType.LEFT_RIGHT, () => new LeftRightGridTemplate());
  this.templates.set(TemplateType.FOUR_GRID, () => new FourGridTemplate()); // 新增
}
```

## 样式结构说明

### 1. 样式配置接口

```typescript
export interface TemplateStyleConfig {
  type: TemplateType;        // 模板类型
  name: string;              // 模板名称
  screenStyles: string;      // 屏幕显示样式
  printStyles: string;       // 打印专用样式
}
```

### 2. 样式分类

- **通用样式**：所有模板共享的基础样式
- **屏幕样式**：页面显示时使用的样式
- **打印样式**：打印时使用的样式（包含 `@media print`）

### 3. CSS 类名规范

- **标准模板**：`.grid-row`, `.grid-item`
- **左右分栏**：`.lr-row-container`, `.left-column`, `.right-column`, `.lr-cell`
- **通用容器**：`.page-container`, `.page-grid-container`

## API 参考

### StyleManager（统一样式管理）

```typescript
class StyleManager {
  // 获取元素的打印样式
  getPrintStyles(elementId: string): string
  
  // 应用统一样式到元素
  applyUnifiedStyles(element: HTMLElement): HTMLElement
}
```

### 便捷函数

```typescript
// 获取打印样式（自动从web样式获取）
getPrintStyles(elementId: string): string

// 应用统一样式
applyUnifiedStyles(element: HTMLElement): HTMLElement

// 获取计算样式
getComputedStyles(element: HTMLElement): CSSStyleDeclaration

// 克隆元素并应用计算样式
cloneElementWithComputedStyles(element: HTMLElement): HTMLElement

// 创建打印文档
createPrintDocument(element: HTMLElement, title?: string): string
```

## 最佳实践

### 1. 样式命名

- 使用模板特定的前缀（如 `lr-` 表示左右分栏）
- 避免与其他模板的类名冲突
- 保持命名的语义化和一致性

### 2. 响应式设计

```css
/* 屏幕样式 */
.template-container {
  width: 100%;
  padding: 20px;
}

/* 打印样式 */
@media print {
  .template-container {
    width: 100% !important;
    padding: 10px !important;
    page-break-inside: avoid;
  }
}
```

### 3. 性能优化

- 样式只在需要时加载
- 避免重复注入相同的样式
- 支持样式的动态卸载

### 4. 维护性

- 将样式配置集中管理
- 使用 TypeScript 确保类型安全
- 提供清晰的文档和示例

## 故障排除

### 1. 样式未生效

- 检查模板类型是否正确
- 确认样式是否已加载
- 检查 CSS 选择器优先级

### 2. 打印样式问题

- 确认使用了 `@media print`
- 检查是否使用了 `!important`
- 验证 `page-break-inside: avoid` 的使用

### 3. 性能问题

- 检查是否有重复加载
- 考虑卸载不需要的样式
- 优化 CSS 选择器性能

## 总结

通过这个动态样式管理系统，您可以：

- ✅ 根据模板类型自动加载对应样式
- ✅ 统一管理所有模板的样式配置
- ✅ 轻松添加新模板而不影响现有代码
- ✅ 优化性能，避免加载不必要的样式
- ✅ 降低后期维护成本

这个设计确保了系统的可扩展性和维护性，为后续添加更多模板提供了坚实的基础。