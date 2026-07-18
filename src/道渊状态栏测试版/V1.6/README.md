# 道渊状态栏 V1.6

> V1.5 基础上的增量更新，导出于 2026-07-08。

## V1.6 相对 V1.5 的变更

1. **人物/机遇/动向/储物 四个标签新增删除按钮**：每条条目右上角出现 close 图标按钮
2. **点击删除 → 简单确认 → 同步写入楼层变量**：删除后 stat_data 对应条目被移除，数据即时生效
3. **公共删除工具**：新建 `services/deleteEntry.ts`，统一处理 MVU 楼层变量删除

## 删除操作

- 人物：删除 `stat_data.人物.{name}`
- 机遇：删除 `stat_data.机遇.{name}`
- 动向：删除 `stat_data.世界.动向.{name}`
- 储物：删除 `stat_data.主角.储物袋.{name}`
- 确认提示："确定删除「名称」？此操作同步到楼层变量。"
- 取消 → 不删除

## 文件

- `MVU状态栏-V1.6.json` — SillyTavern 正则导入文件（约 189KB）

## 新增/改动文件

- 新建 `services/deleteEntry.ts` — 公共删除工具
- 改动 `components/NpcPanel.vue` / `OpportunityPanel.vue` / `TrendsPanel.vue` / `InventoryPanel.vue` — 各加删除按钮

## 正则配置

| 字段 | 值 |
| --- | --- |
| scriptName | 道渊状态栏 |
| findRegex | `<StatusPlaceHolderImpl/>` |
| replaceString | 179,126 字符（```html 围栏包裹） |
