# Charsheet Const/Interface 目录重构方案

## 当前结构分析

### Const 目录现状
```
src/pages/charsheet/const/
├── colorManager.ts      # 颜色管理器
├── colors.less         # 颜色样式文件
├── font.ts            # 字体配置、渲染选项、笔画配置
├── fontLibrary.ts     # 字库数据
├── renderer.ts        # 渲染器枚举
└── index.ts          # 导出文件（不完整）
```

### Interface 目录现状
```
src/pages/charsheet/interface/
├── base.ts           # 基础接口（网格、配置、渲染选项）
├── common.ts         # 通用接口（页面内容、处理选项）
├── pdf.ts           # PDF导出接口
├── processor.ts     # 内容处理器接口
├── renderer.ts      # 渲染器接口
├── stroke.ts        # 笔画相关接口
└── index.ts        # 统一导出
```

## 问题分析

### Const 目录问题
1. **font.ts 文件过大** - 包含了字体、颜色、笔画、渲染等多种配置
2. **功能混杂** - 一个文件包含多个不相关的配置
3. **导出不完整** - index.ts 没有导出所有模块
4. **命名不一致** - colorManager.ts 和 colors.less 功能重复

### Interface 目录问题
1. **base.ts 职责过重** - 包含了多种不同类型的基础接口
2. **分类不够清晰** - 一些接口的归属不够明确
3. **依赖关系复杂** - 接口之间的依赖关系不够清晰

## 重构方案

### 新的 Const 目录结构
```
src/pages/charsheet/const/
├── core/                    # 核心配置
│   ├── grid.config.ts      # 网格配置
│   ├── color.config.ts     # 颜色配置
│   └── index.ts           # 核心配置导出
├── rendering/              # 渲染相关配置
│   ├── font.config.ts     # 字体配置
│   ├── stroke.config.ts   # 笔画配置
│   ├── render.config.ts   # 渲染选项配置
│   └── index.ts          # 渲染配置导出
├── data/                   # 数据配置
│   ├── font.library.ts    # 字库数据
│   └── index.ts          # 数据配置导出
├── enums/                  # 枚举定义
│   ├── template.enum.ts   # 模板类型枚举
│   ├── render.enum.ts     # 渲染相关枚举
│   └── index.ts          # 枚举导出
└── index.ts               # 统一导出
```

### 新的 Interface 目录结构
```
src/pages/charsheet/interface/
├── core/                   # 核心接口
│   ├── grid.interface.ts  # 网格相关接口
│   ├── config.interface.ts # 配置相关接口
│   └── index.ts          # 核心接口导出
├── rendering/             # 渲染相关接口
│   ├── render.interface.ts # 渲染器接口
│   ├── stroke.interface.ts # 笔画接口
│   └── index.ts          # 渲染接口导出
├── export/                # 导出相关接口
│   ├── pdf.interface.ts   # PDF导出接口
│   ├── print.interface.ts # 打印接口
│   └── index.ts          # 导出接口导出
├── processing/            # 处理相关接口
│   ├── processor.interface.ts # 处理器接口
│   ├── content.interface.ts   # 内容处理接口
│   └── index.ts          # 处理接口导出
└── index.ts              # 统一导出
```

## 文件内容重新分配

### Const 文件分配

**core/grid.config.ts**
- GridConfig
- FONT_SCALE 相关
- refreshFontScale
- getCurrentFontScale

**core/color.config.ts**
- ColorManager 类
- colorManager 实例
- getBorderColor, getGridColor 函数
- CharsheetColors 对象

**rendering/font.config.ts**
- FONT_OPTIONS
- IFontOption 接口
- 字体相关配置

**rendering/stroke.config.ts**
- STROKE_DEFAULT_CONFIG
- STROKE_COLORS
- STROKE_CLASSES
- STROKE_ERROR_MESSAGES
- getStrokeSize, getArrowFontSize 函数

**rendering/render.config.ts**
- BaseRenderOptions
- StrokeRenderOptions
- FontRenderOptions
- getRenderOptionsByMode
- mergeRenderOptions
- HANZI_WRITER_DEFAULT_OPTIONS

**enums/template.enum.ts**
- TemplateType 枚举

**enums/render.enum.ts**
- FONT_RENDER_ENGINE
- 其他渲染相关枚举

### Interface 文件分配

**core/grid.interface.ts**
- IGridItem
- IGridData
- IFontLibrary

**core/config.interface.ts**
- ICharsheetConfig
- IRenderOptions
- IPrintOptions
- IPreviewOptions

**rendering/render.interface.ts**
- RenderStats
- TemplateComponentProps
- DirectGridRendererProps
- PageConfig
- CellConfig
- RowConfig

**rendering/stroke.interface.ts**
- StrokeColorMode
- StrokeDisplayConfig
- StrokeOrderContainerConfig
- StrokeJSXElement
- StrokeDisplayResult
- StrokeDataConfig
- StrokeDataResult
- RowConfigWithStroke

**export/pdf.interface.ts**
- PDFExportOptions
- PDFPageConfig
- PDFGenerationStats

**processing/processor.interface.ts**
- IContentProcessor
- CharsheetProcessorOptions

**processing/content.interface.ts**
- PageContent
- ContentProcessOptions
- ContentProcessResult

## 命名规范

### 文件命名
- **配置文件**: `{功能}.config.ts`
- **接口文件**: `{功能}.interface.ts`
- **枚举文件**: `{功能}.enum.ts`
- **数据文件**: `{功能}.library.ts` 或 `{功能}.data.ts`

### 导出规范
- 每个子目录都有自己的 `index.ts`
- 使用命名导出，避免默认导出
- 根目录的 `index.ts` 重新导出所有子模块

## 重构步骤

1. **创建新目录结构**
2. **拆分 font.ts 文件**
3. **重新组织 interface 文件**
4. **更新导出文件**
5. **修复所有引用**
6. **测试功能完整性**

## 优势

1. **职责单一** - 每个文件只负责一个特定功能
2. **结构清晰** - 按功能模块组织，便于查找
3. **易于维护** - 相关配置集中管理
4. **扩展性好** - 新功能可以轻松添加到对应模块
5. **依赖明确** - 接口和配置的依赖关系更清晰