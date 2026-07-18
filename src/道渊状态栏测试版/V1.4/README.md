# 道渊状态栏 V1.4

> V1.3 基础上的增量更新，导出于 2026-07-08。

## V1.4 相对 V1.3 的变更

1. **主角面板底部新增"收起标签"通栏按钮**：点击后收起标签栏(tabnav)+标签内容区(tabbody)，只保留主角面板。比 V1.3 的整体最小化更轻量——只藏标签部分，保留主角信息
2. **收起后出现"展开标签"通栏**：主角面板下方显示通栏按钮，点击恢复标签栏，状态栏变矮
3. **状态栏高度改为内容驱动 + max-height 上限**：`.daoyuan` 从 `aspect-ratio:5/4`（固定比例）改为 `aspect-ratio:auto; max-height:640px`（宽屏）/ `max-height:38em`（窄屏）。内容少时随主角面板高度收缩，内容多时不超过上限、tabbody 内部滚动。tabbody 获得更多垂直空间显示内容
4. **两套折叠状态独立**：V1.3 的 `collapsed`（整体最小化成细条）和 V1.4 的 `tabsCollapsed`（只收起标签）互不干扰

## 交互说明

- **收起标签**：主角面板底部通栏按钮（`chevron-up` 图标），点击后 tabnav+tabbody 隐藏
- **展开标签**：收起后主角面板下方通栏按钮（`chevron-down` 图标），点击恢复
- **整体最小化**（V1.3 保留）：TopBar 时间格内按钮，折叠成细条
- 两个状态独立：可只收起标签留主角面板，也可整体最小化

## 文件

- `MVU状态栏-V1.4.json` — SillyTavern 正则导入文件（约 172KB）

## 正则配置

| 字段 | 值 |
| --- | --- |
| scriptName | 道渊状态栏 |
| findRegex | `<StatusPlaceHolderImpl/>` |
| replaceString | 162,914 字符（```html 围栏包裹） |
| markdownOnly | true（仅显示） |
| promptOnly | false |
| placement | [2]（AI 输出） |
| runOnEdit | true |

## 导入方法

1. 酒馆角色卡《道渊》v5.2 → 正则脚本（局部正则）
2. 导入 `MVU状态栏-V1.4.json`（会替换同名旧项）
3. 启用正则

## 技术实现

- `tabsCollapsed` 状态在 App.vue，通过 `v-model:tabs-collapsed` 传给 ProtagonistPanel
- ProtagonistPanel 底部"收起标签"通栏用 `defineModel<boolean>('tabs-collapsed')` 切换
- App.vue 的"展开标签"通栏在 ProtagonistPanel 之后，`v-show="!collapsed && tabsCollapsed"` 显示
- tabnav/tabbody 的 v-show 条件改为 `!collapsed && !tabsCollapsed`
- `.daoyuan` 高度从 `aspect-ratio:5/4` 改为 `aspect-ratio:auto; max-height:640px`（宽屏）/ `38em`（窄屏），内容驱动 + 上限，tabbody 用 `flex:1` 填满剩余空间

## 依赖

- `defineModel` 需 Vue 3.4+（酒馆助手注入的 Vue 运行时）
