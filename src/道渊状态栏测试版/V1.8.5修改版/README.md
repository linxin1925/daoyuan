# 道渊状态栏 V1.8.5 修改版

> V1.8.5 基础上的 UI 微调：标签页标题居中 + 取消数字角标。导出于 2026-07-16。

## 相对 V1.8.5 的变更

### 1. 顶部标签按钮取消数字角标

原 tab 按钮显示 `图标 + 文字 + 数字`（如「人物 5」「绝色榜 8」），数字为该面板条目数。

修改后：仅 `图标 + 文字`，文字已居中（`.tab` 的 `justify-content: center`），更简洁。

- `App.vue` 模板移除 `<span v-if="t.badge" class="badge">`
- `tabs` 数据移除所有 `badge` 字段及 `interface Tab.badge`
- 移除 `.badge` 样式
- 移除不再使用的 `import _ from 'lodash'`（`_.size` 不再用）

### 2. 面板内部标题栏（PanelCard）清理 count

PanelCard 的 `count` prop 此前由各面板传入但模板未渲染。修改后彻底移除：

- `PanelCard.vue` 移除 `count` prop 定义
- 10 个面板移除 `:count="count"` 传递（面板内部 `count` 变量保留，仍用于 `v-if="count"` 控制列表显隐）

PanelCard 标题栏原本已 `justify-content: center` 居中，本次仅清理无用 prop。

## 改动文件

- `App.vue` - tab badge 移除 + lodash import 清理
- `components/PanelCard.vue` - 移除 count prop
- 10 个 `*Panel.vue` - 移除 `:count="count"` 传递

## 验证

1. `pnpm build` 全部 `compiled successfully` ✅
2. ESLint 0 errors（3 个 vue/attributes-order warning 为既有，与本次无关）✅
3. 产物含 V1.8.5 立绘系统（YttriumCarbide CDN + specialPortraits）✅
4. 产物无 `class="badge"` 残留 ✅
5. 立绘库 334 个 URL **0 内联**，纯远程 CDN fetch + localStorage 缓存，fetch 失败保持空库（不内置兜底，符合 no-builtin-no-local-path 规则）✅
6. `panel-head` 标题居中、tab 居中、无 count prop 残留 ✅

## 文件

- `MVU状态栏-V1.8.5修改版.json` - SillyTavern 正则导入文件（```html 围栏包裹，production 构建产物）
