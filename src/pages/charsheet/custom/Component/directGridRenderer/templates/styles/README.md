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

### 1. 基本使用

```typescript
import { loadTemplateStyles, TemplateType } from './templates';

// 加载模板样式
loadTemplateStyles(TemplateType.STANDARD);
loadTemplateStyles(TemplateType.LEFT_RIGHT);
```

### 2. 获取打印样式

```typescript
import { getCombinedPrintStyles, TemplateType } from './templates';

// 获取单个模板的打印样式
const printStyles = getCombinedPrintStyles([TemplateType.LEFT_RIGHT]);

// 获取多个模板的合并打印样式
const combinedStyles = getCombinedPrintStyles([
  TemplateType.STANDARD,
  TemplateType.LEFT_RIGHT
]);
```

### 3. 在组件中使用

```typescript
// DirectGridRenderer 中自动加载
useEffect(() => {
  loadTemplateStyles(templateType);
}, [templateType]);

// PrintButton 中动态获取样式
const printStyles = getCombinedPrintStyles([templateType]);
```

## 添加新模板样式

### 1. 定义样式配置

在 `templateStyles.ts` 中添加新的样式配置：

```typescript
// 1. 在 TemplateType 枚举中添加新类型
export enum TemplateType {
  STANDARD = 'standard',
  LEFT_RIGHT = 'left_right',
  FOUR_GRID = 'four_grid', // 新增
}

// 2. 定义样式配置
const FOUR_GRID_TEMPLATE_STYLES: TemplateStyleConfig = {
  type: TemplateType.FOUR_GRID,
  name: '四宫格模板',
  screenStyles: `
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
  `,
  printStyles: `
    @media print {
      .four-grid-container {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        grid-template-rows: 1fr 1fr !important;
        gap: 5px !important;
        page-break-inside: avoid;
      }
      
      .four-grid-cell {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        page-break-inside: avoid;
      }
    }
  `
};

// 3. 注册到样式映射中
const TEMPLATE_STYLES_MAP = new Map<TemplateType, TemplateStyleConfig>([
  [TemplateType.STANDARD, STANDARD_TEMPLATE_STYLES],
  [TemplateType.LEFT_RIGHT, LEFT_RIGHT_TEMPLATE_STYLES],
  [TemplateType.FOUR_GRID, FOUR_GRID_TEMPLATE_STYLES], // 新增
]);
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

### TemplateStyleManager

```typescript
class TemplateStyleManager {
  // 加载模板样式
  loadTemplateStyles(templateType: TemplateType): void
  
  // 获取打印样式
  getTemplatePrintStyles(templateType: TemplateType): string
  
  // 获取合并的打印样式
  getCombinedPrintStyles(templateTypes: TemplateType[]): string
  
  // 卸载模板样式
  unloadTemplateStyles(templateType: TemplateType): void
  
  // 注册新模板样式
  registerTemplateStyle(styleConfig: TemplateStyleConfig): void
}
```

### 便捷函数

```typescript
// 加载模板样式
loadTemplateStyles(templateType: TemplateType): void

// 获取模板打印样式
getTemplatePrintStyles(templateType: TemplateType): string

// 获取合并的打印样式
getCombinedPrintStyles(templateTypes: TemplateType[]): string
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