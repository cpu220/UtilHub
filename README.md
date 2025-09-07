# UtilHub - 实用工具集合

基于 Ant Design Pro 构建的实用工具集合平台，提供多种实用功能，包括汉字字帖生成、表格处理等工具。

## 🚀 项目特色

### 汉字字帖生成系统

本项目的核心功能是汉字字帖生成，支持两种高质量的渲染引擎：

- **cnchar-draw**: 基于 cnchar 库的笔画渲染引擎，支持本地化数据
- **hanzi-writer**: 基于 hanzi-writer 的汉字渲染引擎，提供丰富的动画效果

### 智能渲染引擎

系统提供智能的渲染引擎选择和降级机制：
- 自动在两种引擎间切换
- 支持引擎不可用时的降级处理
- 统一的配置接口和字体大小控制

## 📁 项目架构

```
src/
├── pages/charsheet/           # 字帖生成页面
│   ├── basic/                  # 基础字帖
│   ├── custom/                 # 自定义字帖
│   ├── interface/              # 类型定义
│   └── const/                  # 配置常量
├── utils/lib/                  # 核心工具库
│   ├── hanziRenderer.tsx       # 渲染引擎适配器
│   ├── cncharTools.tsx         # cnchar-draw 渲染器
│   ├── fontTools.tsx           # hanzi-writer 渲染器
│   └── fontManager.ts          # 字体管理
├── components/                 # 通用组件
└── services/                   # API 服务
```

## 🛠️ 环境准备

### 安装依赖

```bash
npm install
```

或

```bash
yarn install
```

### cnchar-draw 本地化配置（可选）

如果需要使用 cnchar-draw 的本地化数据功能，需要启动 cnchar-data 服务：

```bash
# 启动 cnchar-data 本地服务（端口 3002）
npx cnchar-serve 3002
```

## 🚀 启动项目

### 开发环境

```bash
# 启动主应用（端口 8000）
npm run dev

# 如果使用 cnchar-draw 本地化，需要同时启动 cnchar-data 服务
npx cnchar-serve 3002
```

访问地址：
- 主应用：http://localhost:8000
- 字帖生成：http://localhost:8000/charsheet/custom
- cnchar-data 服务：http://localhost:3002（如果启动）

### 生产环境

```bash
npm run build
```

## 📖 渲染引擎使用指南

### 配置渲染引擎

渲染引擎的选择在 `src/pages/charsheet/const/font.ts` 中配置：

```typescript
// 默认渲染选项
export const BaseRenderOptions: Partial<IRenderOptions> = {
  width: 60,
  height: 60,
  fontSize: 60,
  strokeWidth: 2,
  strokeColor: '#555',
  radicalColor: '#ff0000',
  useGridBackground: true,
  gridColor: '#DDD',
  renderEngine: 'cnchar-draw', // 设置默认渲染引擎
  padding: 5,
  useLocalData: true
};
```

### cnchar-draw 引擎

**特点**：
- 支持本地化数据，可离线使用
- 基于 SVG 渲染，质量高
- 支持笔画动画和米字格

**使用方法**：
```typescript
import { renderHanziInContainer } from '@/utils';

// 使用 cnchar-draw 渲染
renderHanziInContainer('container-id', '汉', {
  fontSize: 100,
  renderEngine: 'cnchar-draw',
  useGridBackground: true
});
```

**本地化配置**：
1. 启动 cnchar-data 服务：`npx cnchar-serve 3002`
2. 系统会自动配置本地资源路径
3. 支持完全离线使用

### hanzi-writer 引擎

**特点**：
- 丰富的动画效果
- 成熟稳定的渲染质量
- 内置汉字数据

**使用方法**：
```typescript
import { renderHanziInContainer } from '@/utils';

// 使用 hanzi-writer 渲染
renderHanziInContainer('container-id', '字', {
  fontSize: 100,
  renderEngine: 'hanzi-writer',
  useGridBackground: true
});
```

### 智能引擎切换

系统支持自动引擎选择和降级：

```typescript
// 自动选择最佳引擎
renderHanziInContainer('container-id', '渲', {
  fontSize: 100
  // 系统会根据可用性自动选择引擎
});
```

降级顺序：cnchar-draw → hanzi-writer → 纯文字显示

## 🎨 功能特性

### 字帖生成
- 支持自定义汉字内容
- 可调节字体大小、颜色
- 米字格背景支持
- 批量生成和打印

### 渲染配置
- 统一的字体大小控制
- 笔画颜色自定义
- 部首颜色高亮
- 动画效果配置

### 导出功能
- 支持图片导出
- 打印优化
- 批量处理

## 🔧 开发指南

### 添加新的渲染引擎

1. 在 `src/utils/lib/` 下创建新的渲染器文件
2. 实现统一的渲染接口
3. 在 `hanziRenderer.tsx` 中注册新引擎
4. 更新类型定义

### 自定义配置

修改 `src/pages/charsheet/const/font.ts` 中的配置：

```typescript
export const BaseRenderOptions = {
  // 在这里修改默认配置
  renderEngine: 'your-engine', // 设置默认引擎
  fontSize: 80,                // 默认字体大小
  // ... 其他配置
};
```

## 📝 其他脚本

```bash
# 代码检查
npm run lint

# 自动修复代码风格
npm run lint:fix

# 运行测试
npm test

# 构建生产版本
npm run build
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🙏 致谢

- [Ant Design Pro](https://pro.ant.design/) - 基础框架
- [cnchar](https://github.com/cn-char/cnchar) - 汉字处理库
- [hanzi-writer](https://github.com/chanind/hanzi-writer) - 汉字书写库
- [cnchar-data](https://github.com/cn-char/cnchar-data) - 汉字数据本地化
