# 道渊状态栏 V1.7

> V1.6 基础上的增量更新，导出于 2026-07-10。

## V1.7 相对 V1.6 的变更

### 女版立绘切换 + 持久化

在查看立绘界面（PortraitModal）新增"切换到女版立绘"按钮，用户可手动为单个角色切换女版立绘，且**选择持久化**，后续所有界面（人物列表、道侣列表、绝色榜缩略图、立绘弹窗）统一显示女版。

#### 功能行为

- 打开某角色的立绘弹窗 -> 若该角色存在女版立绘，显示"切换到女版立绘"按钮
- 点击切换 -> 大图变为女版，按钮文案变为"当前：女版立绘（点击切回）"
- **关闭弹窗后，人物/道侣/绝色榜列表里的该角色缩略图也同步显示女版**
- 刷新楼层 / 重新加载 -> 仍显示女版（localStorage 持久化）
- 再次点击切换按钮 -> 切回默认版，偏好清除，列表同步

#### 优先级

`getPortraitUrl(name, gender)` 取立绘的优先级：

1. **自定义立绘**（用户上传/贴 URL，最高）
2. **女版偏好**（用户在弹窗里切换过女版）
3. **性别自动女版**（角色 `性别` 字段以"女"开头时自动取女版）
4. **默认立绘库**

自定义立绘优先级高于女版偏好：上传自定义后显示自定义，删除自定义后自动回到女版偏好。

#### 跨表跟随

女版偏好按**角色名**持久化，与角色在哪张表无关。角色从"人物"移到"道侣"（名字不变），立绘仍是女版。仅当 AI 改了角色名时偏好才失效（属 AI 输出一致性问题，非状态栏问题）。

#### 切换按钮显示条件

仅当同时满足时显示切换按钮：
- 该角色未设自定义立绘
- 该角色存在女版立绘（在 `charPortraitsFemale` 库中）
- 女版立绘 URL 与默认版不同

## 存储

- `daoyuan_female_portraits` - localStorage，`Record<角色名, true>`，记录用户选了女版的角色
- 复用 V1.6 既有：`daoyuan_custom_portraits` - 自定义立绘

## 文件

- `MVU状态栏-V1.7.json` - SillyTavern 正则导入文件（约 1.9MB）

## 新增/改动文件

- 改动 `portraitService.ts`
  - 新增 `K_FEMALE_PREF` / `loadFemalePref` / `isFemalePreferred` / `setFemalePortrait`
  - 新增 `hasFemalePortrait` / `getFemalePortraitUrl` / `getDefaultPortraitUrl`
  - `getPortraitUrl` 优先级加入"女版偏好"层（自定义 > 女版偏好 > 性别自动 > 默认）
- 改动 `components/PortraitModal.vue`
  - 新增切换按钮 UI（lotus 莲花图标 + "女版"来源标签）
  - `showFemale` 由本地预览 ref 改为持久化驱动 computed
  - `toggleFemale` 调用 `setFemalePortrait` 写 localStorage

## 不改动的调用点

`NpcPanel.vue` / `DaolvPanel.vue` / `BeautyRankPanel.vue` 等零改动 -- 它们调用 `getPortraitUrl(name, gender)`，函数内部已识别女版偏好，缩略图自动跟进切换。

## 正则配置

| 字段 | 值 |
| --- | --- |
| scriptName | 道渊状态栏 |
| findRegex | `<StatusPlaceHolderImpl/>` |
| replaceString | 1,938,423 字符（```html 围栏包裹） |
| markdownOnly | true |
| runOnEdit | true |

## 内置立绘库

- `charPortraits` - 默认/通用立绘库（167 条，主图床 `free-img.400040.xyz`）
- `charPortraitsFemale` - 女版立绘库（33 条，图床 `i.postimg.cc`），其中 32 个与默认库同名（性别变体），1 个（姬昊天）仅女版有
