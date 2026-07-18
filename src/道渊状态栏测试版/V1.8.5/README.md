# 道渊状态栏 V1.8.2

> V1.8.1 基础上的增量更新：手机端立绘缩略图浮动布局，长文字环绕填进图下方空白，省行高。导出于 2026-07-16。

## 源码基础

基于 V1.8.1/src 副本（真·V1.8 + 点赞，无 V1.9 宗门），复制到 `V1.8.2/src/`。构建时临时移开主源码与 V1.8.1 副本的 `index.ts`/`index.html`，让 webpack 只编译 V1.8.2/src 副本入口，产物在 `dist/道渊状态栏测试版/V1.8.2/src/index.html`。

## V1.8.2 相对 V1.8.1 的变更

### 手机端立绘缩略图浮动布局

原布局：`xxx-item`（flex, `align-items: flex-start`）> `xxx-thumb`（立绘缩略图）+ `xxx-main`（文字），thumb 与 main 顶部对齐。main 文字多时撑高整条，thumb 底下留大片空白（实测绝色榜单条 thumb 下方空白 214px）。

新布局（窄屏 `max-width: 520px`）：thumb `float: left`，main `display:block; width:auto; overflow:visible`，长文字（仙姿/群芳谱/外观/心声等）自然环绕到缩略图右侧与下方，填满空白。

#### 效果（实测 745 楼，状态栏宽 328px）

| 面板 | 原 flex 单条高 | float 后 | 节省 | 主内容宽 |
| --- | --- | --- | --- | --- |
| 绝色榜 | 356px | 302px | -54px | 175 -> 251px |
| 道侣 | 428px | 374px | -54px | 190 -> 248px |

每条节省约 54px（13~15%），长段落行数减少。

#### 改动文件

四个面板统一加窄屏 float 块（`@media max-width:520px`）：

- `components/BeautyRankPanel.vue` - `.rank-item` / `.rank-thumb` / `.rank-main`（替换 V1.8.1 的 align-self:stretch 方案）
- `components/DaolvPanel.vue` - `.partner-item` / `.partner-thumb` / `.partner-main`
- `components/NpcPanel.vue` - `.npc-item` / `.npc-thumb` / `.npc-main`
- `components/PetPanel.vue` - `.pet-item` / `.pet-thumb` / `.pet-main`

桌面端（>520px）布局不变，仍是原 flex 顶部对齐。

## 不改动的部分

- 点赞功能（V1.8.1 既有）零改动
- 桌面端布局零改动
- 其它面板（功法/副业/机遇/动向/玉简/储物/器物/地图）零改动

## 文件

- `MVU状态栏-V1.8.2.json` - SillyTavern 正则导入文件（约 208KB，```html 围栏包裹）
- `daoyuan-applause.md` - 点赞组件接入文档（同 V1.8/V1.8.1）
- `src/` - 源码副本

## 正则配置

| 字段 | 值 |
| --- | --- |
| id | `e5c4b13e-ecbc-4ab8-be02-720bfd956115`（新 UUID） |
| scriptName | 道渊状态栏 |
| findRegex | `<StatusPlaceHolderImpl/>` |
| replaceString | 208,050 字符（```html 围栏包裹） |
| markdownOnly | true |
| runOnEdit | true |
| placement | [2] |

## 验证

1. 构建后 dist 产物含 4 个面板的 float CSS（`float:left` × 4）✅
2. 无宗门（zongmen count 0）✅
3. 点赞功能保留（daoyuan-applause count 3）✅
4. 真机手机端（375 视口）绝色榜/道侣单条高度下降约 54px，文字填进缩略图下方空白
