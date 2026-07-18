# 道渊状态栏 V1.9.0

> V1.8.5 基础上的增量更新：绝色榜论坛回复提示词重写 + 调用参数对齐玉简，修复截断问题。导出于 2026-07-17。

## 源码基础

基于 V1.8.5/src 副本，复制到 `V1.9.0/src/`。构建时临时将修改后的 `forumService.ts` 和 `BeautyRankPanel.vue` 同步到主源码，webpack 编译后产物移至 `V1.9.0/`，再恢复主源码。

## V1.9.0 相对 V1.8.5 的变更

### 绝色榜论坛回复修复（截断问题）

**问题**：绝色榜论坛 AI 回帖频繁被截断。根因：
1. 提示词中含 `<!-- -->` 字面量，部分模型纠缠于"怎么不输出注释"
2. `max_tokens: 500` 过小，配合 0.85 高温，前缀挤占正文
3. 酒馆原生 `generate` 路径只传 `injectContent`，未拼接用户消息，与玉简不一致

**修改**：

#### 提示词重写（`services/forumService.ts` - `buildForumInjectContent`）

```
旧：(请你以另一位匿名道友的身份，针对上一条评论进行互喷/抬杠/吐槽，语气像修仙界坊市泼皮骂街。50字以内，禁止使用<!-- -->或任何思考标签。只输出纯评论内容，不要角色名、不要引号、不要任何格式标记。)

新：(你现在正在群芳谱论坛上，以匿名道友的身份参与讨论。群芳谱是修仙界坊间流传的绝色榜，众道友在此对各路上榜女修品头论足，言辞下流猥琐、毫无底线，尽是意淫挑衅之语。你可以互喷、抬杠、吐槽或附和上一条评论，灵活应变。请直接输出你的回帖内容，必须贴合坊间泼皮流氓的语气，粗俗直白，100字以内。
【绝对禁令】：除了你要说的回帖内容本身，禁止输出任何其他内容！禁止带角色署名，禁止加任何括号、标签或特殊符号，禁止分段换行！直接开口！)
```

变化要点：
- 去掉 `<!-- -->` 字面量（避免模型纠缠）
- 加入"下流猥琐、意淫挑衅"语气 + "互喷/抬杠/吐槽或附和"灵活互动
- "50字以内" → "100字以内"
- 仿玉简加入"【绝对禁令】"结构化分隔 + "直接开口！"

#### 调用参数对齐玉简（`services/forumService.ts` - `callForumGenerateReply`）

| 参数 | 旧 | 新 |
| --- | --- | --- |
| `max_tokens` | 500 | **2000**（与玉简一致） |
| `temperature` | 0.85 | **0.8** |
| 自定义 API `user` 消息 | 固定 `'请发表一段评论'` | 实际 `userMessage` |
| 酒馆原生 `generate` | `generate({ user_input: injectContent })` | `generate({ user_input: injectContent + '\n\n' + userMessage })`（与玉简一致） |
| 函数签名 | `(injectContent, settings)` | `(injectContent, userMessage, settings)` |

#### 调用方更新（`components/BeautyRankPanel.vue`）

`callForumGenerateReply(inject, settings)` → `callForumGenerateReply(inject, text, settings)`

## 不改动的部分

- 玉简传讯零改动
- 其它面板零改动
- 点赞功能零改动
- 手机端浮动布局零改动（V1.8.2 既有）

## 文件

- `MVU状态栏-V1.9.0.json` - SillyTavern 正则导入文件（约 207KB，```html 围栏包裹）
- `daoyuan-applause.md` - 点赞组件接入文档（同 V1.8.5）
- `src/` - 源码副本（含修改）

## 正则配置

| 字段 | 值 |
| --- | --- |
| id | 同 V1.8.5 |
| scriptName | 道渊状态栏 |
| findRegex | `<StatusPlaceHolderImpl/>` |
| replaceString | ~207,443 字符（```html 围栏包裹） |
| markdownOnly | true |
| runOnEdit | true |
| placement | [2] |