# DirectGridRenderer 模板系统

## 概述

DirectGridRenderer 组件已重构为支持多种模板的字帖渲染系统。通过模板系统，可以轻松扩展不同的网格布局样式。

## 模板类型

### 1. 标准网格模板 (StandardGridTemplate)
- **类型**: `TemplateType.STANDARD`
- **描述**: 标准的单列网格布局，每行显示指定数量的字符
- **特点**: 对应原有的 `renderGridDirectly` 方法逻辑

### 2. 左右分栏模板 (LeftRightGridTemplate)
- **类型**: `TemplateType.LEFT_RIGHT`
- **描述**: 左右分栏布局，每栏第一个格子显示汉字，后面显示米字格
- **特点**: 
  - 页面分为左右两个容器，宽度一致
  - 每栏一行的网格数为 `columns/2`
  - 第一个格子是汉字，后面的格子是米字格
  - 字符分配规律：left第一行第一个是string[0]，right第一行第一个是string[1]，以此类推

## 使用方法

### 基本用法

```tsx
import DirectGridRenderer from './directGridRenderer';
import { TemplateType } from './directGridRenderer/templates';

// 使用标准模板
<DirectGridRenderer
  fontList="你好世界"
  renderOptions={renderOptions}
  config={config}
  templateType={TemplateType.STANDARD}
/>

// 使用左右分栏模板
<DirectGridRenderer
  fontList="你好世界"
  renderOptions={renderOptions}
  config={config}
  templateType={TemplateType.LEFT_RIGHT}
/>
```

### 模板工厂使用

```tsx
import { createTemplate, TemplateType } from './directGridRenderer/templates';

// 创建模板实例
const template = createTemplate(TemplateType.LEFT_RIGHT);
if (template) {
  console.log(template.name); // "左右分栏网格"
  console.log(template.description); // 模板描述
}

// 获取所有可用模板
import { getAllTemplateInfo } from './directGridRenderer/templates';
const templates = getAllTemplateInfo();
console.log(templates);
```

## 扩展新模板

### 1. 创建模板类

```tsx
import { BaseGridTemplate } from './templates/BaseGridTemplate';
import { TemplateType, TemplateRenderParams, TemplateRenderResult } from './templates/types';

export class CustomGridTemplate extends BaseGridTemplate {
  readonly type = TemplateType.CUSTOM; // 需要在types.ts中添加新类型
  readonly name = '自定义网格';
  readonly description = '自定义的网格布局';

  public async render(params: TemplateRenderParams): Promise<TemplateRenderResult> {
    // 实现自定义渲染逻辑
    // ...
  }
}
```

### 2. 注册模板

```tsx
import { templateFactory } from './templates/TemplateFactory';
import { CustomGridTemplate } from './CustomGridTemplate';

// 注册新模板
templateFactory.registerTemplate(TemplateType.CUSTOM, new CustomGridTemplate());
```

## 模板系统架构

### 核心组件

1. **IGridTemplate**: 模板接口，定义了所有模板必须实现的方法
2. **BaseGridTemplate**: 抽象基类，提供通用功能实现
3. **GridTemplateFactory**: 模板工厂，负责创建和管理模板实例
4. **TemplateType**: 模板类型枚举

### 设计原则

- **开闭原则**: 对扩展开放，对修改封闭
- **单一职责**: 每个模板只负责一种布局逻辑
- **工厂模式**: 统一的模板创建和管理
- **模板方法**: 基类提供通用实现，子类实现特定逻辑

## 配置说明

### 页面容器配置
- `rowsPerPage`: 每页行数（默认15行）
- `pageBreakAfter`: 是否在页面后分页
- `marginBottom`: 底部边距
- `padding`: 内边距

### 单元格配置
- `width`: 宽度
- `height`: 高度
- `fontSize`: 字体大小
- `marginLeft`: 左边距

### 行配置
- `specialSpacing.every5th`: 每5行的特殊间距
- `specialSpacing.every15th`: 每15行的特殊间距

## 注意事项

1. **左右分栏模板要求**: 列数必须为偶数
2. **React生命周期**: 模板系统遵守React的生命周期和使用规范
3. **性能优化**: 使用useMemo优化渲染依赖项
4. **错误处理**: 包含完善的错误处理和降级机制
5. **CSS样式**: 每个模板都有对应的CSS类名，便于样式定制

## 样式类名

### 通用样式
- `.page-container`: 页面容器
- `.grid-item`: 网格单元格
- `.grid-row`: 网格行

### 左右分栏专用样式
- `.lr-row-container`: 左右分栏行容器
- `.left-column`: 左栏容器
- `.right-column`: 右栏容器
- `.lr-cell`: 左右分栏单元格