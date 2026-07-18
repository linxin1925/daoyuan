# 道渊状态栏 V1.5

> V1.4 基础上的增量更新，导出于 2026-07-08。

## V1.5 相对 V1.4 的变更

1. **新增设置面板**：TopBar 时间格内新增齿轮按钮，点击打开「状态栏设置」弹窗
2. **折叠默认态可配置**：可设置新楼层的初始状态——标签栏默认收起/展开、整体最小化默认折叠/展开
3. **标签显示可控**：可勾选标签栏显示哪些标签（功法/副业/人物/灵宠/道侣/机遇/绝色榜/动向/玉简/储物/器物/地图），支持全选/全不选
4. **纯展示控制**：设置只控制标签是否显示，**不修改 MVU 变量**，不影响世界书/正则的变量更新
5. **跨楼层共享**：设置存 localStorage（`daoyuan_statusbar_settings`），同源所有楼层 iframe 共享，一处设置处处生效

## 设置项

### 1. 折叠默认态
- **标签栏默认收起**：开启后新楼层只显示主角面板，需手动展开标签（沿用 V1.4 默认开启）
- **整体默认最小化**：开启后新楼层折叠成 TopBar 细条（默认关闭）

### 2. 标签显示
- 12 个标签可独立勾选，取消勾选的标签从标签栏消失（即使有数据也不显示）
- 全选 / 全不选 快捷按钮
- 显示计数：`已启用/12`

## 文件

- `MVU状态栏-V1.5.json` — SillyTavern 正则导入文件（约 182KB）

## 正则配置

| 字段 | 值 |
| --- | --- |
| scriptName | 道渊状态栏 |
| findRegex | `<StatusPlaceHolderImpl/>` |
| replaceString | 172,237 字符（```html 围栏包裹） |
| markdownOnly | true（仅显示） |
| promptOnly | false |
| placement | [2]（AI 输出） |
| runOnEdit | true |

## 导入方法

1. 酒馆角色卡《道渊》v5.2 → 正则脚本（局部正则）
2. 导入 `MVU状态栏-V1.5.json`（会替换同名旧项）
3. 启用正则

## 技术实现

- 新建 `settingsService.ts`：设置存储（localStorage `daoyuan_statusbar_settings`）+ `TAB_DEFS` 标签元数据 + `isTabEnabled` 判断
- 新建 `components/SettingsModal.vue`：设置弹窗（overlay+modal+section，复用 WxSettingsModal 风格），draft 副本编辑后 emit save
- `App.vue`：`settings` ref 从 localStorage 读取；`collapsed`/`tabsCollapsed` 初始值改为读设置；`tabs` computed 的 `show` 叠加 `isTabEnabled` 判断（`has(data) && on(key)`）
- `TopBar.vue`：时间格内 collapse-btn 后加齿轮按钮，emit `open-settings`
- 约定：`enabledTabs[key] !== false` 表示显示（未设置/true 都显示，只有明确 false 才隐藏）

## 存储

| key | 内容 |
| --- | --- |
| `daoyuan_statusbar_settings` | 折叠默认态 + 标签显示勾选 |

## 依赖

- `defineModel` 需 Vue 3.4+
