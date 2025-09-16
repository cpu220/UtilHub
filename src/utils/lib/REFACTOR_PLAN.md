# Utils/Lib 目录重构方案

## 当前文件分析

### 现有文件功能分类：

**1. 文件导出类 (Export/Output)**
- `imageExportTool.ts` - 图片导出工具
- `pdfExportTool.ts` - PDF导出工具
- `imageTools.ts` - 图片处理工具
- `printTools.ts` - 打印工具

**2. 汉字渲染类 (Rendering)**
- `hanziRenderer.tsx` - 汉字渲染适配器（统一接口）
- `hanziWriterRenderer.tsx` - HanziWriter渲染器
- `cncharTools.tsx` - Cnchar渲染器
- `fontRenderer.ts` - 字体渲染器
- `pinyinRenderer.ts` - 拼音渲染器

**3. 数据生成类 (Data/Mock)**
- `mockUtils.ts` - Mock数据生成工具
- `fontLibrary.tsx` - 字库数据

**4. 样式管理类 (Style/Template)**
- `styleManager.ts` - 样式管理器
- `templateLoader.ts` - 模板加载器
- `fontManager.ts` - 字体管理器

**5. 内容处理类 (Processing)**
- `contentProcessors/` - 内容处理器目录
  - `charsheetProcessor.ts` - 字帖处理器
  - `processorFactory.ts` - 处理器工厂
  - `index.ts` - 导出文件

## 新的目录结构设计

```
src/utils/lib/
├── core/                    # 核心功能模块
│   ├── rendering/          # 渲染相关
│   │   ├── hanzi.renderer.ts
│   │   ├── hanzi-writer.renderer.ts
│   │   ├── cnchar.renderer.ts
│   │   ├── font.renderer.ts
│   │   └── pinyin.renderer.ts
│   ├── data/               # 数据相关
│   │   ├── mock.generator.ts
│   │   └── font.library.ts
│   └── processing/         # 内容处理
│       ├── charsheet.processor.ts
│       ├── processor.factory.ts
│       └── index.ts
├── export/                 # 导出功能模块
│   ├── image.exporter.ts
│   ├── pdf.exporter.ts
│   ├── print.manager.ts
│   └── image.tools.ts
├── style/                  # 样式管理模块
│   ├── style.manager.ts
│   ├── template.loader.ts
│   └── font.manager.ts
└── index.ts               # 统一导出
```

## 命名规范

### 1. 文件命名规范
- **格式**: `{功能}.{类型}.ts/tsx`
- **功能**: 具体功能名称，使用小写+连字符
- **类型**: 文件类型标识

### 2. 类型标识说明
- `.renderer` - 渲染器类文件
- `.exporter` - 导出器类文件
- `.manager` - 管理器类文件
- `.generator` - 生成器类文件
- `.processor` - 处理器类文件
- `.factory` - 工厂类文件
- `.loader` - 加载器类文件
- `.library` - 数据库/库文件
- `.tools` - 工具集合文件

### 3. 类和函数命名规范
- **类名**: PascalCase + 类型后缀
  - `HanziRenderer`, `ImageExporter`, `StyleManager`
- **函数名**: camelCase + 动词开头
  - `renderHanzi()`, `exportImage()`, `loadTemplate()`
- **常量**: UPPER_SNAKE_CASE
  - `DEFAULT_CONFIG`, `SUPPORTED_FORMATS`

### 4. 导出规范
- 每个模块提供统一的 `index.ts` 导出
- 使用命名导出，避免默认导出
- 提供类型定义导出

## 重构步骤

1. **创建新目录结构**
2. **按分类移动和重命名文件**
3. **更新文件内容和导入路径**
4. **更新统一导出文件**
5. **更新所有引用这些文件的代码**
6. **测试功能完整性**

## 优势

1. **清晰的功能分类** - 按用途组织，便于查找和维护
2. **统一的命名规范** - 提高代码可读性和一致性
3. **模块化设计** - 便于扩展和重构
4. **类型安全** - 明确的类型定义和导出
5. **向后兼容** - 通过统一导出保持API兼容性