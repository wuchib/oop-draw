# OOP Draw 架构设计文档

## 1. 架构目标

OOP Draw 采用“编辑器应用与 SEO 应用分层”的总体架构，确保首版既能支撑类 Excalidraw 的高交互白板体验，也能为后续官网、公开分享页和搜索引擎收录提供演进空间。

本架构重点解决以下问题：

- 编辑器主体验保持高性能客户端渲染，不因 SSR 增加复杂度。
- Web 端与 Electron 桌面端共用编辑器内核和大部分 UI 逻辑。
- SEO 相关页面通过独立的 SSR/SSG Web 应用承载。
- 文件模型、导出模型和分享模型在产品层保持统一。
- 为只读分享、协作、账号体系等后续能力预留清晰扩展点。

## 2. 总体架构

系统拆分为三个应用面：

1. `editor-web`
   - 面向浏览器的白板编辑器。
   - 使用 `Vue 3 + Vite`。
   - 采用 CSR，为高交互 Canvas 编辑场景服务。

2. `editor-desktop`
   - 面向桌面端的白板编辑器容器。
   - 使用 `Electron + electron-vite`。
   - 复用 `editor-web` 的渲染层与编辑器内核。

3. `marketing-share-web`
   - 面向 SEO 的官网、落地页、帮助页、公开只读分享页。
   - 推荐使用 `Nuxt`。
   - 采用 SSR/SSG 混合模式。

整体原则：

- 交互编辑和搜索引擎索引不是同一个应用目标，不强行放入同一运行时。
- 编辑器内核是系统中心，Web 和 Electron 都围绕它展开。
- 营销页与公开分享页围绕“展示”构建，不耦合编辑器运行时。

## 3. 分层设计

### 3.1 表现层

表现层分为两类：

- 编辑器表现层
  - 工具栏
  - 属性面板
  - 顶部菜单
  - 文件状态提示
  - 画布容器
- SEO 表现层
  - 首页
  - 功能介绍页
  - 帮助文档页
  - 模板展示页
  - 公开只读分享页

编辑器表现层使用 Vue 组件系统管理壳层 UI，不直接将每个画布元素映射为 Vue 组件。

### 3.2 编辑器内核层

编辑器内核是整个系统的核心，负责：

- 元素模型管理
- 视口与坐标变换
- 渲染调度
- 命中检测
- 选择逻辑
- 命令栈与撤销重做
- 导入导出
- 文件序列化与反序列化

该层不依赖 Electron，不直接依赖 DOM 路由逻辑，不感知 SEO 页面。

### 3.3 应用服务层

应用服务层负责把 UI 与编辑器内核连接起来，主要包括：

- 文件打开与保存服务
- 自动保存服务
- 草稿恢复服务
- 导出服务
- 剪贴板服务
- 快捷键服务
- 图片资源导入服务

这层需要按运行环境做适配：

- Web 使用浏览器存储和浏览器文件能力
- Electron 使用 preload 暴露的文件 API

### 3.4 平台适配层

平台适配层屏蔽运行环境差异。

主要适配对象：

- 文件读写
- 系统对话框
- 本地路径处理
- 系统菜单
- 剪贴板
- 应用生命周期

平台适配必须遵循接口优先原则，编辑器和应用服务层只依赖抽象接口，不依赖具体平台实现。

## 4. Web 与 Electron 界面复用策略

### 4.1 核心原则：共享同一个 Renderer

桌面端和 Web 端要做到最大限度共享界面和组件，关键不是把它们视为两个完全独立的前端，而是让它们共享同一个 Vue Renderer。

也就是说，以下内容默认只实现一套：

- 应用 Shell
- 工具栏
- 属性面板
- 画布容器
- 顶部操作区
- 导出弹窗
- 文件状态提示
- 设置面板
- 主题系统
- 快捷键提示文案

Web 端和 Electron 端只在入口和平台服务实现上分开，渲染层尽量不分叉。

### 4.2 共享边界

建议按“共享默认，分叉例外”的原则组织代码。

必须共享的部分：

- Vue 页面布局与编辑器壳层
- 通用 UI 组件
- 编辑器内核接入层
- Pinia store 中的中低频状态模型
- 主题 token 与视觉样式
- 导出、文件状态、错误提示等界面交互逻辑

允许按平台分开的部分：

- 文件打开与保存实现
- 原生菜单实现
- 系统文件关联
- 剪贴板和系统对话框细节
- 桌面窗口管理

### 4.3 组件设计原则

所有共享组件都必须避免直接依赖平台能力。

要求如下：

- 组件不直接调用 Node API
- 组件不直接访问 Electron `ipcRenderer`
- 组件不直接假设运行在浏览器或桌面环境中
- 组件通过注入服务或组合式接口访问文件、剪贴板、导出等能力

例如：

- `ToolbarSaveButton` 不直接保存文件，只调用 `documentService.save()`
- `ImportImageButton` 不直接弹系统文件框，只调用 `fileDialogService.pickImages()`
- `ShareButton` 不直接访问浏览器下载 API，只调用统一的 `exportService`

### 4.4 平台差异压缩策略

平台差异必须被压缩到平台适配层，而不是散落在 Vue 组件中。

推荐做法：

- 在 `packages/platform` 中定义抽象接口
- Web 提供 `web` 实现
- Electron 提供 `electron` 实现
- Vue Renderer 在应用启动时注入当前平台实现

示例接口：

- `DocumentStorage`
- `DraftStorage`
- `FileDialogService`
- `ClipboardService`
- `ShellService`
- `WindowService`

这样组件和页面逻辑只依赖接口，不需要写大量 `if (isElectron)` 分支。

### 4.5 桌面端只做增强，不做界面分叉

Electron 端的职责是增强能力，而不是重做一套桌面专属界面。

桌面端可以额外拥有：

- 原生菜单
- 双击文件打开
- 保存为系统文件
- 更符合桌面习惯的快捷键
- 原生窗口标题和生命周期控制

但以下内容仍应与 Web 保持同一套实现：

- 编辑器主布局
- 工具栏与面板结构
- 元素编辑交互
- 文件状态展示方式
- 主题与设计系统

结论是：桌面端只增强平台能力，不分叉产品界面主干。

### 4.6 推荐共享结构

为了最大限度复用界面和组件，建议把共享 UI 和应用壳拆到独立包中。

推荐职责如下：

- `packages/ui`
  - 基于 Tailwind CSS + Reka UI 的 Button、Popover、Dialog、Panel、Tabs、Icon 等基础组件
- `packages/editor-shell`
  - 顶部栏、左侧工具栏、右侧属性栏、状态栏、导出面板等编辑器壳层组件
- `packages/editor-core`
  - 编辑器引擎、命令系统、文档模型
- `packages/platform`
  - Web/Electron 平台能力接口与实现
- `apps/editor-web`
  - 组合共享 renderer，注入 Web 平台实现
- `apps/editor-desktop`
  - 组合共享 renderer，注入 Electron 平台实现，并提供 main/preload

如果当前阶段不想拆出 `editor-shell` 独立包，也至少要把“平台实现”和“共享界面”分目录管理，避免后续 Electron 能力渗入组件层。

### 4.7 状态共享策略

Web 与 Electron 的界面要保持一致，除了共享组件，还要共享状态模型。

推荐共享：

- 当前工具状态
- 当前文件信息
- 保存状态
- 导出弹窗状态
- 主题与偏好设置
- 选区摘要信息

不建议共享为 UI 响应式状态的内容：

- pointer move
- hover target
- dragging session
- snapping guides
- 高频渲染缓存

这些高频状态留在编辑器内核中，由 Renderer 主动消费，避免 Vue 响应式系统成为性能瓶颈。

### 4.8 复用收益

采用上述策略后，可以获得以下收益：

- Web 和桌面端的界面一致性更高
- 新功能只需在共享 renderer 中开发一次
- 测试可以更多覆盖共享层，而不是重复写两套 UI 测试
- Electron 专属能力被限制在边界内，降低后续维护成本
- 后续若增加 PWA 或其他运行时，也可以复用同一套界面骨架

## 5. SSR / CSR 架构边界

### 5.1 哪些页面使用 SSR / SSG

以下页面推荐采用 SSR 或 SSG：

- 官网首页
- 产品介绍页
- 模板展示页
- 帮助文档页
- 博客或更新日志页
- 公开只读分享页

原因：

- 这些页面以内容展示、收录、首屏性能和社交分享预览为主。
- 页面可通过预渲染或服务端渲染提前输出 HTML。

### 5.2 哪些页面保持 CSR

以下页面保持客户端渲染：

- 白板编辑器主页
- 新建画布页
- 本地文件编辑页
- Electron 中的全部编辑页面

原因：

- 这些页面依赖 Canvas、指针事件、命令栈、文件操作和大量客户端状态。
- SSR 对它们的收益很低，反而会增加 hydration 和同构复杂度。

### 5.3 公开分享页的特殊处理

公开分享页推荐做成 SSR/SSG 页面，但只读渲染逻辑应尽量复用编辑器内核中的文档解析和只读渲染能力。

这意味着：

- 分享页不复用完整编辑器 UI
- 分享页复用统一的文档模型
- 分享页只启用只读渲染与简单缩放浏览

## 6. 推荐目录结构

建议采用 monorepo 或至少“多应用 + 共享包”结构。

推荐结构如下：

```text
oop-draw/
  apps/
    editor-web/
    editor-desktop/
    marketing-share-web/
  packages/
    editor-core/
    editor-shell/
    ui/
    shared/
    platform/
  docs/
```

职责划分如下：

- `apps/editor-web`
  - 浏览器编辑器入口
- `apps/editor-desktop`
  - Electron 主进程、preload、桌面打包配置
- `apps/marketing-share-web`
  - Nuxt 应用，承载官网和分享页
- `packages/editor-core`
  - 画布引擎、元素模型、命令系统、序列化
- `packages/editor-shell`
  - 编辑器壳层组件与页面编排
- `packages/ui`
  - 基于 Tailwind CSS + Reka UI 的基础 UI 组件与设计 token
- `packages/shared`
  - 类型、常量、协议、文件 schema
- `packages/platform`
  - Web/Electron 的服务接口和适配实现

如果初期不想直接上 monorepo，也至少要把共享层按目录组织好，避免后续拆分时成本过高。

## 7. 核心运行链路

### 7.1 编辑器启动链路

1. 应用启动。
2. 加载基础配置、主题和最近草稿信息。
3. 创建编辑器控制器 `EditorController`。
4. 初始化画布视口、事件系统和渲染器。
5. 根据来源创建空白文档或恢复现有文档。
6. Vue 壳层订阅编辑器状态快照并驱动工具栏、属性面板和文件状态显示。

### 7.2 用户编辑链路

1. 用户触发工具切换或画布指针事件。
2. 事件进入编辑器控制器。
3. 控制器根据当前工具驱动元素创建、选择、拖动或修改。
4. 编辑器内核更新文档状态。
5. 渲染器局部或整帧重绘 Canvas。
6. 自动保存服务按节流策略持久化文档。

### 7.3 文件打开链路

1. 用户选择打开文件。
2. 平台适配层读取文件内容。
3. 序列化模块解析并校验 `CanvasDocument`。
4. 若文档版本旧于当前版本，进入迁移流程。
5. 迁移后的文档进入编辑器内核。
6. UI 更新文件名、状态和视图信息。

### 7.4 导出链路

1. 用户选择导出格式和范围。
2. 应用服务层读取当前文档和选区。
3. 导出模块根据格式生成 PNG、SVG 或 JSON。
4. Web 端触发下载，Electron 端调用保存对话框和写入能力。

## 8. 数据架构

### 8.1 领域对象

系统核心领域对象为 `CanvasDocument`，至少包含：

- `version`
- `elements`
- `assets`
- `camera`
- `metadata`
- `appState`

补充原则：

- 元素数据与渲染实现分离。
- 文件数据与运行时临时状态分离。
- 文档数据与平台文件路径分离。

### 8.2 运行时状态分层

运行时状态分为三层：

1. 持久状态
   - 文档内容
   - 视图状态
   - 用户偏好

2. 会话状态
   - 当前工具
   - 当前选区
   - 保存状态
   - 当前文件来源

3. 瞬时状态
   - hover
   - dragging
   - selection box
   - snapping guides
   - pointer session

其中瞬时状态留在编辑器内核，不进入 Pinia。

## 9. 平台架构

### 9.1 Web 架构

Web 编辑器负责：

- 画布编辑
- 本地草稿恢复
- 浏览器文件导入导出
- 浏览器剪贴板和快捷键

持久化方案：

- `IndexedDB` 保存草稿和较大文档
- `localStorage` 保存轻量偏好

### 9.2 Electron 架构

Electron 分三层：

- Main Process
  - 窗口管理
  - 菜单
  - 文件系统
  - 原生对话框
- Preload
  - 受控 API 暴露
  - 参数校验
- Renderer
  - 共享 Vue 应用壳层
  - 编辑器内核 UI 接入
  - Electron 平台服务注入

安全要求：

- 开启 `contextIsolation`
- 关闭 `nodeIntegration`
- 仅通过 `contextBridge` 暴露最小 API

### 9.3 SEO Web 架构

SEO 站点推荐用 Nuxt 承载。

职责包括：

- 官网内容页
- 文档与帮助页
- 功能介绍页
- 公开只读分享页

渲染策略：

- 稳定内容优先 SSG
- 公开分享页优先 SSR 或 ISR 风格缓存策略

## 10. 接口与边界约束

### 10.1 编辑器内核对外接口

编辑器内核只暴露高层接口，例如：

- `createDocument`
- `loadDocument`
- `exportDocument`
- `setTool`
- `dispatchPointerEvent`
- `undo`
- `redo`
- `getSnapshot`

不让 UI 直接读写底层元素数组。

### 10.2 平台服务接口

平台服务应抽象为统一接口，例如：

- `DocumentStorage`
- `DraftStorage`
- `FileDialogService`
- `ClipboardService`
- `ShellService`
- `WindowService`

Web 与 Electron 各自实现这些接口。

### 10.3 SEO 站点与编辑器的边界

SEO 站点不直接承载完整编辑器，不直接暴露 Electron 能力，不直接承担高频编辑状态。

SEO 站点和编辑器的共享点只保留在：

- 文档 schema
- 只读渲染能力
- 分享元数据
- 公共 UI 设计语言

## 11. 性能设计

### 11.1 编辑器性能策略

- 画布主渲染采用 Canvas 2D
- 局部重绘优先于全量重绘
- 选区、命中检测和渲染对象尽量使用可复用缓存
- 高 pointer 频率逻辑避免走 Vue 响应式系统
- 自动保存采用节流与空闲时机策略

### 11.2 分享页性能策略

- 公开分享页只加载只读运行时
- 首屏尽量直接输出文档基础元信息和预览
- 重型编辑器依赖不进入公开页首屏

## 12. 安全设计

### 12.1 Electron 安全

- 严格 IPC 白名单
- 输入参数校验
- 文件访问最小权限
- 外链打开受控

### 12.2 Web 安全

- 上传文件类型校验
- 导入 JSON schema 校验
- 分享页内容输出做 XSS 防护
- 公开链接读取权限在后续服务端方案中单独定义

## 13. 演进路线

### 13.1 当前阶段

当前阶段优先建设：

- `editor-web`
- `editor-desktop`
- `editor-core`
- `editor-shell`
- 统一文档模型

此阶段先不实现 Nuxt 应用，但架构上预留其位置。

### 13.2 SEO 阶段

当需要 SEO 时，新增 `marketing-share-web`：

- 官网和产品介绍页上线
- 帮助中心上线
- 公开只读分享页上线

该阶段不要求重构编辑器核心，仅新增展示侧应用。

### 13.3 协作阶段

后续若引入协作：

- 服务端新增文档存储与同步服务
- 编辑器内核在现有文档模型之上增加协同协议适配层
- 分享页与编辑器继续复用统一文档 schema

## 14. 最终建议

OOP Draw 的推荐架构不是“把 SSR 硬塞进编辑器”，而是：

- 用 `Vue 3 + Vite` 构建编辑器 Web 应用
- 用 `Electron` 承载桌面端
- 用独立 `editor-core` 统一核心逻辑
- 用独立 `editor-shell` 统一共享界面和组件编排
- 用未来的 `Nuxt` 应用承载 SEO 和公开分享页

这能同时满足高交互编辑、桌面文件能力和 SEO 友好三类诉求，并且不会让首版在架构上过度复杂化。

## 15. Monorepo 初始化建议

### 15.1 初始化目标

初始化阶段的目标不是一次性把所有能力铺满，而是尽快搭出一个可运行、可扩展、可测试的工程骨架。

首批工程骨架需要满足：

- Web 编辑器可以启动
- Electron 桌面容器可以启动
- 共享类型和共享 UI 可以被两个应用同时消费
- 编辑器核心包可以独立演进
- 后续接入 Nuxt 时不需要推翻现有目录结构

### 15.2 推荐工作区结构

建议从第一天就采用 workspace 结构，优先使用 `pnpm workspace`。

推荐根目录如下：

```text
oop-draw/
  apps/
    editor-web/
    editor-desktop/
    marketing-share-web/
  packages/
    editor-core/
    editor-shell/
    ui/
    shared/
    platform/
  docs/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  eslint.config.ts
  prettier.config.ts
  .gitignore
  .editorconfig
```

根目录职责：

- `package.json`
  - 管理 workspace 脚本、公共开发依赖、统一命令入口
- `pnpm-workspace.yaml`
  - 声明工作区包范围
- `tsconfig.base.json`
  - 统一 TypeScript 编译选项与路径别名基础配置
- `eslint.config.ts`
  - 统一 lint 规则
- `prettier.config.ts`
  - 统一格式化策略
- `.editorconfig`
  - 统一基础编辑规范

### 15.3 初始化顺序

推荐按以下顺序创建工程：

1. 根 workspace 与基础配置
2. `packages/shared`
3. `packages/editor-core`
4. `packages/ui`
5. `packages/editor-shell`
6. `packages/platform`
7. `apps/editor-web`
8. `apps/editor-desktop`
9. `apps/marketing-share-web` 目录占位

原因：

- 先建共享层，避免应用一开始就互相拷贝代码。
- 先建编辑器内核，再建壳层组件，能保证架构中心稳定。
- Electron 最后接入，避免桌面能力过早污染共享层。

## 16. 首批目录与文件清单

### 16.1 根目录首批文件

建议首批创建以下文件：

```text
package.json
pnpm-workspace.yaml
tsconfig.base.json
eslint.config.ts
prettier.config.ts
.gitignore
.editorconfig
README.md
```

职责说明：

- `package.json`
  - 提供 `dev:web`、`dev:desktop`、`build:web`、`build:desktop`、`test`、`lint` 等统一脚本
- `tsconfig.base.json`
  - 开启 `strict`，统一别名，例如 `@shared/*`、`@core/*`、`@shell/*`
- `README.md`
  - 说明工作区结构、启动方式和包职责

### 16.2 packages/shared

推荐首批结构：

```text
packages/shared/
  package.json
  tsconfig.json
  src/
    index.ts
    constants/
      app.ts
      shortcuts.ts
    types/
      document.ts
      element.ts
      tool.ts
      platform.ts
    schemas/
      document-schema.ts
```

首批职责：

- 定义 `CanvasDocument`、元素类型、工具类型、平台服务接口类型
- 提供共享常量
- 提供 JSON 文档 schema 校验入口

### 16.3 packages/editor-core

推荐首批结构：

```text
packages/editor-core/
  package.json
  tsconfig.json
  src/
    index.ts
    controller/
      EditorController.ts
    document/
      createDocument.ts
      migrateDocument.ts
    camera/
      camera.ts
      coordinates.ts
    scene/
      scene.ts
    renderer/
      CanvasRenderer.ts
    tools/
      tool-machine.ts
    commands/
      CommandStack.ts
    selection/
      selection.ts
    serialization/
      export-json.ts
      import-json.ts
```

首批职责：

- 提供编辑器生命周期入口
- 提供空白文档创建与文档加载
- 提供最小视口模型
- 提供命令栈和基础序列化能力

首批不要求：

- 一开始就支持所有图形类型
- 一开始就引入复杂空间索引
- 一开始就做协作协议

### 16.4 packages/ui

推荐首批结构：

```text
packages/ui/
  package.json
  tsconfig.json
  src/
    index.ts
    components/
      Button.vue
      IconButton.vue
      Panel.vue
      Dialog.vue
      ToolbarGroup.vue
    composables/
      useTheme.ts
    styles/
      tokens.css
      reset.css
```

首批职责：

- 提供基础通用组件
- 提供设计 token
- 提供通用样式 reset

要求：

- 不放编辑器业务逻辑
- 不依赖 Electron API

### 16.5 packages/editor-shell

推荐首批结构：

```text
packages/editor-shell/
  package.json
  tsconfig.json
  src/
    index.ts
    AppShell.vue
    components/
      TopBar.vue
      LeftToolbar.vue
      RightInspector.vue
      StatusBar.vue
      CanvasViewport.vue
    stores/
      ui.ts
      file.ts
      preferences.ts
    composables/
      useEditorApp.ts
      useShortcuts.ts
```

首批职责：

- 组织编辑器页面布局
- 把 `editor-core` 接入 Vue UI
- 管理中低频应用状态
- 提供编辑器级快捷键绑定

要求：

- 可被 `editor-web` 与 `editor-desktop` 共同引用
- 不直接调用 Electron IPC

### 16.6 packages/platform

推荐首批结构：

```text
packages/platform/
  package.json
  tsconfig.json
  src/
    index.ts
    contracts/
      document-storage.ts
      file-dialog.ts
      clipboard.ts
      shell.ts
      window.ts
    web/
      createWebPlatform.ts
      web-document-storage.ts
      web-file-dialog.ts
    electron/
      createElectronPlatform.ts
      electron-bridge.ts
```

首批职责：

- 定义平台能力抽象接口
- 提供 Web 实现
- 提供 Electron 接入适配层

要求：

- Electron 具体桥接依赖通过类型约束隔离
- 不把主进程逻辑塞入共享 renderer 代码

### 16.7 apps/editor-web

推荐首批结构：

```text
apps/editor-web/
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  src/
    main.ts
    App.vue
    bootstrap.ts
```

首批职责：

- 创建 Vue 应用实例
- 注入 Web 平台服务
- 挂载共享 `editor-shell`

这里应该保持很薄，只做入口装配。

### 16.8 apps/editor-desktop

推荐首批结构：

```text
apps/editor-desktop/
  package.json
  tsconfig.json
  electron.vite.config.ts
  src/
    main/
      index.ts
      window.ts
      menu.ts
      ipc/
        document.ts
        dialog.ts
    preload/
      index.ts
      api.ts
    renderer/
      main.ts
      App.vue
      bootstrap.ts
```

首批职责：

- `main/` 负责窗口、菜单、文件系统与 IPC 注册
- `preload/` 负责桥接安全 API
- `renderer/` 负责挂载与 Web 端共享的 `editor-shell`

要求：

- `renderer/` 入口尽量与 `apps/editor-web` 保持一致
- 桌面特有能力仅通过 preload 注入到平台服务层

### 16.9 apps/marketing-share-web

当前阶段可以只创建占位目录：

```text
apps/marketing-share-web/
  README.md
```

占位说明中写清：

- 未来采用 Nuxt
- 承载官网、文档和分享页
- 不承载高频编辑逻辑

### 16.10 首批测试目录建议

推荐在各包内就近放测试：

```text
packages/editor-core/src/**/__tests__/
packages/platform/src/**/__tests__/
packages/editor-shell/src/**/__tests__/
```

首批测试优先级：

1. `CanvasDocument` 创建与迁移
2. 坐标转换
3. 命令栈撤销重做
4. 平台服务接口的 Web 实现
5. `editor-shell` 的基本装配与工具栏交互

### 16.11 第一阶段完成标准

当以下条件满足时，说明骨架初始化完成：

- `pnpm install` 成功
- Web 编辑器可以启动到空白画布页面
- Electron 可以打开窗口并加载同一套编辑器壳层
- `editor-core`、`editor-shell`、`shared`、`platform` 可以互相正确解析类型
- lint 和基础测试命令可运行

### 16.12 开发约束

初始化完成后，建议立即遵守以下约束：

- 新增共享界面优先放入 `packages/ui` 或 `packages/editor-shell`
- 新增平台差异优先放入 `packages/platform`
- 新增文档结构和元素类型优先放入 `packages/shared`
- 不允许在共享 Vue 组件里直接写 Electron 专属调用
- 不允许在 `editor-core` 中直接依赖浏览器或 Electron API

