# 道渊状态栏 V1.3

> V1.2 基础上的增量更新，导出于 2026-07-07。

## V1.3 相对 V1.2 的变更

1. **时间栏位新增"最小化状态栏"按钮**：在 TopBar 时间格内（时间文字右侧）新增一个折叠/展开按钮
2. **独立折叠**：每个状态栏独立折叠，点击只折叠自己所在的楼层，不影响其他楼层
3. **折叠为细条**：折叠后隐藏主角面板、标签栏、标签内容，只保留 TopBar 单行（时间/地点/危机），`.daoyuan` 的 `aspect-ratio: 5/4` 切为 `auto` 收缩高度
4. **不持久化**：刷新后默认展开（每个楼层是独立 iframe，按 messageId 持久化会引入垃圾键管理复杂度）
5. **图标新增**：Icon 组件新增 `chevron-up` 图标（与 `chevron-down` 对称）

## 交互说明

- 展开态：按钮显示 `chevron-up`（向上箭头），点击折叠
- 折叠态：按钮显示 `chevron-down`（向下箭头），点击展开
- 折叠态隐藏 `.cell.cooldown`（遭遇冷却），细条更简洁
- 鼠标悬停按钮：背景微亮 + 文字色变亮

## 文件

- `MVU状态栏-V1.3.json` — SillyTavern 正则导入文件（约 170KB）

## 正则配置

| 字段 | 值 |
| --- | --- |
| scriptName | 道渊状态栏 |
| findRegex | `<StatusPlaceHolderImpl/>` |
| replaceString | 161,118 字符 |
| markdownOnly | true（仅显示） |
| promptOnly | false |
| placement | [2]（AI 输出） |
| runOnEdit | true |

## 导入方法

1. 酒馆角色卡《道渊》v5.2 → 正则脚本（局部正则）
2. 导入 `MVU状态栏-V1.3.json`（会替换同名旧项）
3. 启用正则

## 技术实现

- 状态管理：`App.vue` 持有 `collapsed: ref(false)`，通过 `v-model:collapsed` 传给 `TopBar.vue`
- `TopBar.vue` 用 `defineModel<boolean>('collapsed')` 切换
- 折叠时 `ProtagonistPanel`/`tabnav`/`tabbody` 用 `v-show="!collapsed"` 隐藏（v-show 而非 v-if，保留 Transition 和滚动状态）
- `.daoyuan.collapsed` 样式：`aspect-ratio: auto; min-height: 0; gap: 0;`

## 依赖

- `defineModel` 需 Vue 3.4+（酒馆助手注入的 Vue 运行时）
