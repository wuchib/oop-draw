# OOP Draw 技术选型文档

## 1. 选型结论

面向当前 PRD 的 MVP 目标，OOP Draw 的推荐技术栈如下：

- 前端框架：Vue 3
- 语言：TypeScript
- Web 构建：Vite
- 桌面端：Electron
- Electron 构建工具：electron-vite
- 状态管理：Pinia + 编辑器内核自管理模块
- 画布渲染：自研 Canvas 2D 场景层，辅以 Rough.js 生成手绘风格图形
- 本地持久化：浏览器 IndexedDB + Electron 文件系统
- 进程通信：Electron `preload` + `contextBridge` + 类型化 IPC
- 单元/组件测试：Vitest
- 端到端测试：Playwright
- 代码规范：ESLint + Prettier
- 样式与基础组件：Tailwind CSS + Reka UI + 自建皮肤层

这套选型的核心思路是：

- 用 Vue 3 承担应用壳层、工具栏、属性面板、文件菜单等 UI。
- 用 TypeScript 和自研编辑器内核承担当下最核心的“白板状态机 + 画布渲染 + 命中检测 + 导入导出”。
- 用 Electron 提供桌面端文件能力与未来系统集成扩展。
- 用 Web 优先的架构保证浏览器版与桌面版共享绝大部分业务代码。

## 2. 选型目标

本次技术选型以以下目标为优先级排序：

1. 能稳定支撑类 Excalidraw 的单人白板编辑体验。
2. Web 与桌面端尽可能共用渲染层和业务层代码。
3. 首版实现复杂度可控，不因为过早引入协同或后端而拖慢交付。
4. 便于后续扩展只读分享、模板、实时协作和账号体系。
5. 在 Electron 场景下保持合理的安全边界。

## 3. 核心技术栈

### 3.1 Vue 3 作为前端框架

选择 Vue 3，原因如下：

- 与你的明确偏好一致。
- 官方推荐通过基于 Vite 的方式创建 Vue 3 应用，适合当前从 0 到 1 启动项目。
- Vue 3 的 Composition API 很适合拆分编辑器壳层、工具状态、文件状态和偏好设置等逻辑。
- 单文件组件适合快速搭建工具栏、属性面板、导出对话框和设置页。

使用建议：

- 采用 `script setup` 语法。
- 默认全量 TypeScript。
- 不在 MVP 首版引入 class-style Vue 写法。

### 3.2 TypeScript 作为默认语言

选择 TypeScript，原因如下：

- 白板应用的核心复杂度在于元素模型、选择状态、命令栈、导出结构、坐标系与 IPC 协议，强类型能明显降低重构风险。
- Electron 主进程、预加载脚本、渲染层共享部分类型定义时，TypeScript 会带来更稳定的边界。
- 后续如果引入协作、文件版本兼容和插件化能力，类型系统可以显著降低长期维护成本。

工程要求：

- 开启 `strict`。
- 画布元素、文件结构、命令对象、IPC contract 全部先定义类型再编码。

### 3.3 Vite 作为 Web 构建工具

选择 Vite，原因如下：

- Vue 官方创建流程直接基于 Vite。
- Vite 对 Vue 3 支持成熟，开发启动快，HMR 体验好。
- Vitest 可直接复用 Vite 配置，减少测试和应用配置分裂。

结论：

- Web 端直接使用 Vite。
- 所有 renderer 层代码按标准 Vite/Vue 工程组织。

### 3.4 Electron 作为桌面端容器

选择 Electron，原因如下：

- 你的明确偏好是桌面端使用 Electron。
- Electron 具备成熟的跨平台桌面能力，适合文件打开、保存、菜单、快捷键、剪贴板、系统对话框等场景。
- 当前 PRD 中桌面端的价值在于增强本地文件体验，而不是做原生 UI，因此 Electron 与 Web 共用代码的收益很高。

边界要求：

- 主进程仅负责窗口管理、文件系统访问、菜单、原生对话框和受控 IPC。
- 渲染进程不直接暴露 Node API。
- 一切桌面能力通过 preload 暴露的最小 API 面向 renderer。

### 3.5 electron-vite 作为 Electron 构建工具

推荐使用 `electron-vite`，不推荐首版直接使用 Electron Forge 的 Vite 插件。

原因如下：

- `electron-vite` 原生面向 “Electron + Vite” 双环境构建，主进程、预加载脚本和渲染进程都能统一配置。
- 它提供 renderer HMR 和主进程/预加载的快速重载，更适合高频迭代编辑器产品。
- Electron Forge 官方文档中，Vite 插件当前仍标记为 experimental，首版项目不适合在构建链上承担额外不稳定性。

结论：

- 开发与构建：`electron-vite`
- 后续打包分发：优先评估 `electron-builder`

说明：

- `electron-builder` 是这里的工程建议，不是本轮必须立即落地的实现项。
- 若后续团队更看重 Electron 官方生态统一性，也可在稳定阶段重新评估 Electron Forge。

## 4. 编辑器内核选型

### 4.1 不把 Vue 组件系统直接当作画布渲染层

虽然 Vue 很适合做应用 UI，但不适合直接把数百或上千个画布元素都作为响应式组件渲染。

原因如下：

- 白板元素变化频繁，拖拽、缩放、框选、吸附、命中检测都要求更低层的渲染控制。
- 若让 Vue 直接管理海量元素，响应式开销和 DOM/SVG 节点数量会快速膨胀。
- Excalidraw 类产品的关键优势来自独立编辑器内核，而不是通用 UI 框架本身。

结论：

- Vue 管理“壳层 UI”。
- 画布本身由独立编辑器内核管理。

### 4.2 画布渲染层选择：Canvas 2D 自研场景层

推荐方案：

- 基于 HTML5 Canvas 2D 自研场景层。
- 元素模型、选区逻辑、命中检测、渲染队列、导出转换由编辑器内核统一管理。
- 对手绘感图形使用 Rough.js 生成路径或绘制结果。

选择原因：

- 更贴近 Excalidraw 这类应用的实现方式。
- 对“无限画布 + 拖拽 + 框选 + 批量重绘 + 缩放平移”更可控。
- 更容易把“元素数据结构”与“渲染实现”分离，为后续 JSON 文件格式、SVG 导出和协作同步打基础。
- 在 Electron 与 Web 环境下都可以一致运行。

首版渲染分层建议：

- `camera`：缩放、平移、坐标转换
- `scene`：元素数组、索引、渲染顺序
- `renderer`：Canvas 绘制
- `hit-test`：命中检测
- `commands`：撤销重做命令栈
- `serialization`：JSON/SVG/PNG 导出与导入

### 4.3 Rough.js 用于手绘风格

选择 Rough.js，原因如下：

- 它支持 Canvas 和 SVG。
- 它擅长生成手绘风格的矩形、线条、椭圆、路径，风格上接近 Excalidraw 的产品感知。
- 它只承担“视觉风格生成”，不会绑架整个编辑器架构。

使用方式建议：

- 元素的业务数据采用标准几何信息保存。
- 渲染时按元素样式调用 Rough.js 生成实际绘制路径或结果。
- 导出 SVG 时复用相同的图形生成逻辑，保证视觉尽量一致。

### 4.4 为什么不把 Konva 作为主方案

Konva 是一个成熟方案，也有 Vue 3 集成，适合快速搭建交互式 2D 图形应用；但本项目首选不把它作为核心编辑器引擎。

不作为主方案的原因：

- 白板产品最终会更依赖自定义数据模型、命令栈、手绘风格、导出语义和跨端一致性，而不是画布对象框架自带的对象系统。
- 如果把 Konva 的对象模型作为主要状态源，后期会更难抽离成真正独立的编辑器内核。
- MVP 虽然能借助 Konva 更快起步，但中后期很可能出现“业务状态”和“渲染状态”双轨维护的问题。

结论：

- 主方案：自研 Canvas 2D 内核
- 备选方案：若首轮开发发现命中检测与变换控制实现成本明显超预期，可退回采用 Konva 做过渡实现

## 5. 应用层架构

### 5.1 总体分层

推荐目录与职责分层如下：

- `src/renderer`
  - Vue 应用壳层
  - 工具栏、属性面板、对话框、主题、快捷键绑定
- `src/editor`
  - 白板内核
  - 元素模型、命令系统、渲染器、选择逻辑、导入导出
- `src/shared`
  - Web 与 Electron 共用类型、常量、协议定义
- `src/main`
  - Electron 主进程
- `src/preload`
  - Electron 安全桥接层

### 5.2 路由策略

首版不默认引入复杂路由。

原因如下：

- MVP 主要是单窗口单编辑器应用。
- 核心工作集中在编辑器，不在多页面流转。

结论：

- 首版可以不引入 Vue Router，或仅保留极轻量单路由结构。
- 若后续增加欢迎页、模板页、设置页、只读分享页，再正式引入完整路由体系。

### 5.3 状态管理策略

推荐“双层状态”：

- App 层：Pinia
- Editor 层：自研 store / service 模块，不把所有高频画布状态塞进 Pinia

原因如下：

- Pinia 很适合管理主题、偏好设置、当前文件元信息、导出面板状态、窗口状态等中低频状态。
- 编辑器内部的 pointer move、dragging、selection box、hover target、临时吸附线等高频状态不适合走 Vue 响应式链路。

建议拆分：

- `useUiStore`：主题、侧栏、弹窗、设备偏好
- `useFileStore`：当前文件、草稿恢复、保存状态
- `usePreferenceStore`：快捷键偏好、画布偏好
- 编辑器 runtime：独立 `EditorController`

## 6. 数据与持久化

### 6.1 文件模型

首版定义统一的 `CanvasDocument` 领域对象，包含：

- `version`
- `elements`
- `assets`
- `camera`
- `metadata`
- `appState`

说明：

- `elements` 保存图形元素的几何与样式数据。
- `assets` 保存图片等资源引用。
- `camera` 保存缩放、平移等视图信息。
- `appState` 保存网格开关、主题偏好等可恢复状态。

### 6.2 Web 本地持久化

推荐使用：

- 草稿与自动保存：IndexedDB
- 轻量偏好：`localStorage`

原因如下：

- IndexedDB 更适合存放较大的 JSON 文档和图片资源引用。
- `localStorage` 只用于主题、最近打开记录这类小型偏好。

### 6.3 桌面端本地持久化

Electron 端通过 preload 暴露以下最小文件能力：

- `openDocument()`
- `saveDocument()`
- `saveDocumentAs()`
- `exportFile()`
- `selectImageFiles()`

要求：

- renderer 不直接调用 Node `fs`。
- 所有路径和文件写入都通过主进程完成。
- IPC 参数和返回值必须严格类型化。

### 6.4 文件系统增强策略

首版不依赖云端。

但要在架构上预留：

- 文档序列化层
- 资源引用层
- 文件版本迁移层

这样后续接入：

- 只读分享
- 云端同步
- 协作合并

时，不需要推翻现有文件模型。

## 7. Electron 安全策略

Electron 必须按照“默认不信任 renderer”的思路设计。

首版安全要求：

- 开启 `contextIsolation`
- 关闭 `nodeIntegration`
- 开启 sandbox
- 使用 `preload + contextBridge`
- 校验所有 IPC 消息来源和参数
- 定义明确的 CSP
- 不允许 renderer 直接访问本地文件系统或任意外链打开能力

主进程职责：

- 创建窗口
- 原生菜单与快捷键
- 本地文件读写
- 原生系统对话框
- 应用生命周期管理

preload 职责：

- 仅暴露最小白名单 API
- 输入输出做 schema 校验

renderer 职责：

- 只消费受控 API，不假设自己拥有 Node 环境

## 8. 测试与质量保障

### 8.1 单元测试

选择 Vitest。

原因如下：

- 它与 Vite 集成紧密，可复用同一套解析与构建配置。
- 适合覆盖工具函数、序列化逻辑、命令栈、坐标变换、文件迁移逻辑等。

重点覆盖对象：

- 坐标转换
- 选区计算
- 命中检测
- 命令栈
- JSON 导入导出
- 文件版本迁移

### 8.2 组件测试

继续使用 Vitest，配合 Vue 组件测试工具。

重点覆盖：

- 工具栏状态切换
- 属性面板交互
- 导出对话框
- 草稿恢复提示

### 8.3 端到端测试

选择 Playwright。

原因如下：

- 官方支持 Chromium、WebKit、Firefox，适合覆盖 Web 端主要流程。
- Playwright 对 Electron 提供实验性支持，可用于桌面端 smoke test。

策略建议：

- Web 端：完整 E2E
- Electron 端：优先做关键链路 smoke test，而不是一开始就铺满所有交互

首批 E2E 场景：

- 进入空白画布并创建矩形
- 输入文本并撤销/重做
- 导入图片并移动
- 自动保存后刷新恢复
- 导出 PNG
- Electron 打开本地文件并继续编辑

## 9. 代码规范与工程约束

### 9.1 包管理与运行环境

推荐：

- Node.js 22 LTS
- 包管理器优先 `pnpm`

原因如下：

- Vue 官方当前创建流程要求 Node `^20.19.0 || >=22.12.0`。
- Electron 官方生态已在 2025 年将其 npm 生态的最低支持版本推进到 Node 22。

说明：

- 如果团队更看重最低心智负担，`npm` 也可以接受。
- 若后续引入更多原生模块，再针对包管理器兼容性做一次评估。

### 9.2 代码风格

- ESLint 负责语义和最佳实践校验
- Prettier 负责格式化
- 统一使用路径别名
- 共享类型集中放在 `src/shared`

### 9.3 UI 组件策略

首版不建议引入重型桌面风格 UI 组件库。

原因如下：

- 白板应用的核心界面主要是自定义工具栏、浮层和面板。
- 引入大型组件库容易让界面风格偏后台系统，不利于形成产品辨识度。

推荐：

- 使用 `Tailwind CSS` 作为样式基础层
- 使用 `Reka UI` 提供 Vue 生态下的无头交互原语
- 在 `packages/ui` 中封装带品牌样式的 primitives，而不是直接把 Reka 原语散落在业务层
- 图标使用 `lucide` 或同类轻量方案
- 颜色、字号、阴影统一走 design token

## 10. 备选方案与淘汰理由

### 10.1 为什么不是 React

- 不是因为 React 不适合，而是你的明确偏好是 Vue 3。
- 对当前项目阶段来说，框架不是性能瓶颈，编辑器内核设计才是。

### 10.2 为什么不是 Tauri

- Tauri 在包体积和系统集成方面有优势。
- 但当前你已明确选择 Electron，且 Electron 的生态、案例和文件能力路线更成熟，首版更稳。

### 10.3 为什么不是直接用 SVG 作为主渲染层

- SVG 更适合中小规模矢量编辑，但在高频拖拽、框选、缩放与大量元素下，DOM 负担更高。
- Canvas 2D 更适合作为白板主渲染层。
- SVG 更适合作为导出格式，而不是编辑运行时主载体。

### 10.4 为什么不是只做 Web 不做 Electron

- PRD 已明确桌面端在 MVP 中有价值，尤其是本地文件体验。
- Electron 允许我们在不复制业务代码的前提下补强桌面能力。

## 11. 实施建议

建议分三步落地技术栈：

### 阶段一：项目骨架

- 初始化 `Vue 3 + TypeScript + Vite`
- 接入 `electron-vite`
- 建立 `main / preload / renderer / shared / editor` 目录
- 搭建 ESLint、Prettier、Vitest

### 阶段二：编辑器内核最小闭环

- 定义元素模型
- 完成 Canvas 视口、缩放平移
- 完成矩形、线条、文本最小绘制
- 完成选择与拖拽
- 完成 JSON 自动保存与本地恢复

### 阶段三：桌面能力接入

- 通过 preload 打通打开、保存、导出
- 接入系统菜单与快捷键
- 增加 Electron smoke test

## 12. 最终建议

基于当前目标，推荐你把 OOP Draw 的实现路线固定为：

- `Vue 3 + TypeScript + Vite` 负责应用壳层
- `Electron + electron-vite` 负责桌面容器
- `Canvas 2D + 自研编辑器内核 + Rough.js` 负责白板核心
- `Pinia` 负责中低频应用状态
- `IndexedDB + Electron 文件系统` 负责本地持久化
- `Vitest + Playwright` 负责质量保障

这条路线最适合当前的产品边界：它既保留了 Excalidraw 类产品所需的编辑器控制力，也不会在 MVP 阶段过早把项目拖进协同、后端和重型框架复杂度。

## 13. 参考资料

- Vue 快速上手：[https://cn.vuejs.org/guide/quick-start](https://cn.vuejs.org/guide/quick-start)
- Vite Guide：[https://vite.dev/guide/](https://vite.dev/guide/)
- Pinia 介绍：[https://pinia.vuejs.org/zh/introduction.html](https://pinia.vuejs.org/zh/introduction.html)
- Electron Process Model：[https://www.electronjs.org/docs/latest/tutorial/process-model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- Electron Security Checklist：[https://www.electronjs.org/docs/latest/tutorial/security](https://www.electronjs.org/docs/latest/tutorial/security)
- Electron Context Isolation：[https://www.electronjs.org/docs/latest/tutorial/context-isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- Electron 官方 Node 22 迁移说明：[https://www.electronjs.org/blog/ecosystem-node-22/](https://www.electronjs.org/blog/ecosystem-node-22/)
- Electron Forge Vite Plugin 文档：[https://www.electronforge.io/config/plugins/vite](https://www.electronforge.io/config/plugins/vite)
- electron-vite 指南：[https://electron-vite.org/guide/](https://electron-vite.org/guide/)
- electron-vite 功能说明：[https://electron-vite.org/guide/features](https://electron-vite.org/guide/features)
- Rough.js 官网：[https://roughjs.com/](https://roughjs.com/)
- Vitest 官网：[https://vitest.dev/](https://vitest.dev/)
- Playwright 介绍：[https://playwright.dev/docs/intro](https://playwright.dev/docs/intro)
- Playwright Electron API：[https://playwright.dev/docs/api/class-electron](https://playwright.dev/docs/api/class-electron)
