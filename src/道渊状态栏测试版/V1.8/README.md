# 道渊状态栏 V1.8

> V1.7 基础上的增量更新，导出于 2026-07-11。

## V1.8 相对 V1.7 的变更

### 灵宠标签新增立绘栏位

在灵宠（PetPanel）标签为每只灵宠增加立绘缩略图栏位，与绝色榜、人物面板的立绘机制完全一致。同时支持用户上传自定义立绘，以及把已有立绘的角色移入灵宠物后直接显示立绘。

#### 功能行为

- 灵宠列表每条左侧显示立绘缩略图；**无立绘时显示 `+` 占位按钮，点击即可上传自定义立绘**（与人物/道侣/绝色榜面板一致）
- 点击缩略图（或空占位按钮）弹出立绘弹窗（PortraitModal），可查看大图、上传本地图片、粘贴图片 URL、删除自定义立绘
- 即使该灵宠当前没有任何立绘，用户也能从缩略图位进入弹窗上传自定义立绘
- 缩略图、弹窗、上传/删除逻辑与人物/绝色榜面板共用同一套 `portraitService` 与 `PortraitModal`

#### 跨表跟随（关键）

立绘按**角色名**存储在 localStorage（`daoyuan_custom_portraits` 自定义立绘、`daoyuan_female_portraits` 女版偏好），与角色处于哪张表无关。

- 用户把有立绘的角色（人物/绝色榜/道侣中已上传过自定义立绘，或在内置立绘库中）移入灵宠物 —— 只要名字一致，灵宠面板的缩略图**直接显示该立绘**，无需重新上传
- 用户也可在灵宠面板的立绘弹窗里直接给宠物上传/更换自定义立绘，该立绘会同步出现在其它面板的同名角色上

#### 灵宠性别字段

新增读取灵宠数据的 `性别` / `gender` 字段，传给 `getPortraitUrl(name, gender)`，用于性别自动女版匹配（`性别` 以"女"开头时自动取女版立绘），与人物面板逻辑一致。

#### 立绘优先级（不变，复用 V1.7）

`getPortraitUrl(name, gender)` 取立绘的优先级：

1. **自定义立绘**（用户上传/贴 URL，最高）
2. **女版偏好**（用户在弹窗里切换过女版）
3. **性别自动女版**（角色 `性别` 字段以"女"开头时自动取女版）
4. **默认立绘库**

#### 名字归一化（兼容间隔号变体）

AI 偶尔会把"卡斯蒂利亚哈布斯堡"生成成"卡斯蒂利亚·哈布斯堡"（带间隔号 `·`），导致按名查表命中不到立绘。新增 `normName` 归一化：查表时先试原名，再试去掉间隔号（`·` / `・`）的名字。

- `getPortraitUrl` / `hasPortrait` / `hasFemalePortrait` / `getFemalePortraitUrl` / `getDefaultPortraitUrl` / `isCustomPortrait` 均兼容间隔号变体
- `setCustomPortrait` 删除时同时清掉原名与归一化名，避免变体残留
- 内置库 key 不变（仍是"卡斯蒂利亚哈布斯堡"无间隔号），归一化在查询侧兼容

## 存储

- 复用 V1.7 既有：`daoyuan_custom_portraits` - 自定义立绘
- 复用 V1.7 既有：`daoyuan_female_portraits` - 女版偏好
- 本次未新增存储 key

## 文件

- `MVU状态栏-V1.8.json` - SillyTavern 正则导入文件（约 189KB）

## 改动文件

- 改动 `components/PetPanel.vue`
  - 模板：每条灵宠项增加立绘缩略图按钮（`.pet-thumb`）+ 空占位上传按钮，原内容移入 `.pet-main`
  - 模板：挂载 `PortraitModal` 立绘弹窗
  - 脚本：引入 `PortraitModal` 与 `hasPortrait` / `getPortraitUrl`
  - 脚本：新增 `gender(p)` 辅助函数读取 `性别` / `gender` 字段
  - 脚本：新增立绘弹窗状态 `portraitName` / `portraitGender` 与 `openPortrait` / `closePortrait`
  - 样式：`.pet-item` 改为 flex 布局，新增 `.pet-thumb` / `.pet-thumb-empty` / `.pet-main`，沿用人物面板缩略图样式（金边、hover 放大），配色用灵宠主题色 `--c-mind`

- 改动 `components/NpcPanel.vue` / `DaolvPanel.vue` / `BeautyRankPanel.vue`
  - 把无立绘时的空占位 `<div>` 改为可点击 `<button>`（`+` 图标，title="上传立绘"），让**没有立绘的角色也能点击进入弹窗上传自定义立绘**
  - `.xxx-thumb-empty` 去掉 `cursor: default`，hover 时放大并高亮边框，与有立绘缩略图交互一致

- 改动 `portraitService.ts`
  - 新增 `normName`（去间隔号 `·` / `・`）与 `lookup`（先原名再归一化名查表）
  - `getPortraitUrl` / `hasFemalePortrait` / `getFemalePortraitUrl` / `getDefaultPortraitUrl` / `isCustomPortrait` 均走归一化兼容
  - `setCustomPortrait` 删除时同时清原名与归一化名

## 不改动的部分

- `portraitService.ts` 零改动 —— 立绘按角色名查找的机制天然支持跨表
- `PortraitModal.vue` 零改动 —— 灵宠面板直接复用
- 其它面板（人物/绝色榜/道侣）零改动

## 正则配置

| 字段 | 值 |
| --- | --- |
| id | `0a39c51f-5a87-47e2-b2f7-f089e3f06178` |
| scriptName | 道渊状态栏 |
| findRegex | `<StatusPlaceHolderImpl/>` |
| replaceString | 183,708 字符（```html 围栏包裹） |
| markdownOnly | true |
| runOnEdit | true |
| placement | [2] |
