# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

本项目用于编写酒馆助手 (Tavern Helper) 的前端界面和脚本，运行在酒馆 (SillyTavern) 中。代码在浏览器 iframe 环境中执行，不能使用 Node.js API。

## 构建命令

```bash
pnpm watch      # 开发模式：webpack --watch + tavern_sync 监听推送 + dev-server (localhost:9876)
pnpm build      # 生产构建：webpack --mode production
pnpm sync watch # 独立 tavern_sync 推送（pnpm watch 已包含）
pnpm lint       # ESLint 检查
pnpm lint:fix   # ESLint 自动修复
pnpm format     # Prettier 格式化
pnpm dump       # 导出 schema.json（MVU zod schema → json schema）
```

`pnpm watch` 一次启动同时提供：webpack 编译 → dist/、dev-server 静态资源服务、tavern_sync 推送源码变更到酒馆、酒馆助手热重载。**改源码 → 自动编译 → 自动推送 → 酒馆热重载**，通常无需手动操作。

## 项目结构

```text
src/               # 源代码，每个子文件夹是一个独立项目
  前端界面项目/      # 有 index.ts + index.html → 前端界面（在消息楼层中前台显示）
  脚本项目/          # 仅有 index.ts → 脚本（后台运行，jQuery 作用于整个酒馆页面）
示例/               # 示例代码（勿删除，AI 需要参考）
初始模板/            # 新项目的初始模板
@types/             # 酒馆助手接口类型定义（function/* 和 iframe/* 均可直接调用）
util/               # 工具函数
  common.ts         # 通用工具
  script.ts         # 脚本专用（teleportStyle, createScriptIdDiv, createScriptIdIframe 等）
  streaming.ts      # 流式楼层界面支持（mountStreamingMessage）
  mvu.ts            # MVU 角色卡专用（defineMvuDataStore）
dist/               # 编译输出
```

## 关键架构细节

### Webpack 入口发现

`webpack.config.ts` 自动 glob `{示例,src}/**/index.{ts,tsx,js,jsx}` 作为入口。若同目录存在 `index.html`，则作为 HTML 入口（前端界面），否则仅 JS 入口（脚本）。

### 全局变量注入（externals）

webpack 将以下库配置为 externals，运行时通过全局变量注入：

| 库 | 全局变量 |
| --- | --- |
| jquery | `$` |
| lodash | `_` |
| toastr | `toastr` |
| yaml | `YAML` |
| zod | `z` |
| gsap | `gsap` |
| vue | `Vue` |
| pinia | `Pinia` |

**关键陷阱**：`auto-imports.d.ts` 只提供类型声明让 IDE/tsc 不报错，不参与运行时注入。Vue 模板编译器只看 `<script setup>` 的词法作用域绑定，不感知全局变量。**在 Vue 模板中使用 `_`、`$` 等全局变量时，必须在 `<script setup>` 中显式 `import`**，否则模板中会拿到 `undefined` 导致渲染崩溃。

### 路径别名

- `@util/*` → `./util/*`
- `@/*` → `./src/*`

### 特殊导入

- `import str from './file?raw'` — 文件内容作为字符串导入
- `import html from './file.html'` — HTML 经 html-loader 最小化后作为字符串
- `import md from './file.md'` — Markdown 经 remark-loader 转为 HTML 字符串
- `import Component from './file.vue'` — Vue 单文件组件

## 酒馆助手接口

`@types/function/*` 和 `@types/iframe/*` 中的所有接口均可直接调用，无需 import。**优先使用 `@types/function` 中的高层接口**（如 `getChatMessages()`、`getVariables()`、`getWorldbook()`），而不是 `@types/iframe/exported.sillytavern.d.ts` 中的底层酒馆接口或 STScript `/` 命令。

## 核心编写规则摘要

详细规则见 `.cursor/rules/`（`.augment/rules/` 为符号链接）。以下为代码编写时必须遵守的关键规则：

### 生命周期

```ts
// 加载时执行（禁止用 DOMContentLoaded）
$(() => { /* 初始化 */ });

// 卸载时执行（禁止用 unload/beforeunload）
$(window).on('pagehide', () => { /* 清理 */ });
```

### 前端界面

- `index.html` 只写静态 `<body>` 内容，样式和脚本通过 TypeScript import 导入
- 优先使用 Vue 组件（含 pinia、vue-router）
- vue-router 必须用 `createMemoryHistory()`（iframe 环境）
- 样式优先 tailwindcss，其次 `<style scoped>`
- **禁止 `vh` 单位**，用 `aspect-ratio` 适配 iframe 高度
- 禁止 `position: absolute` 脱离文档流的样式作为主体布局

### 脚本

- jQuery 直接作用于酒馆页面（`$('body')` 选的是酒馆页面的 body）
- Vue 挂载到酒馆 DOM（非 iframe）时：使用 `teleportStyle()` 复制样式，**禁止 tailwindcss**
- Vue 挂载到独立 iframe 时：使用 `createScriptIdIframe()` + `teleportStyle(iframe.contentDocument.head)`，优先 tailwindcss
- 设置用 zod 定义 + 脚本变量存储
- 按钮用 `appendInexistentScriptButtons()` 添加

### MVU 变量框架

- 代码顶部必须 `await waitGlobalInitialized('Mvu')`
- 前端界面还需 `await waitUntil(() => _.has(getVariables(...), 'stat_data'))`
- 数据在 `_.get(variables, 'stat_data')` 中
- 自行生成 AI 回复时用 `Mvu.parseMessage()` 解析变量更新命令
- 使用 `klona()` 去除 Vue proxy 层再写入酒馆数据

### 通用

- 使用 TypeScript，不用 JavaScript
- 用 zod 4.x 做数据校验，`z.prefault` 优于 `z.default`，`z.coerce.number()` 优于 `z.number()`
- 用 klona 去除 Vue proxy 后再写入酒馆数据
- 日志用 `console.info`，可恢复错误用 `console.warn/error`，不可恢复错误用 `throw Error` + `errorCatched()`
- 需要完全重载时用 `window.location.reload()`

## MCP 调试

使用 chrome-devtools MCP 工具连接浏览器验证。排查"改了不生效"：确认源码已改 → 对比 dist 产物时间戳 → fetch dev-server 资源验证 → 用 `window.TavernHelper` API 检查酒馆运行时数据。
