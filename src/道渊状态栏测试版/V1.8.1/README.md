# 道渊状态栏 V1.8.1

> V1.8 基础上的增量更新：绝色榜接入 DaoYuan WIKI 点赞按钮。导出于 2026-07-16。

## 源码基础

本版本基于 **V1.8 原貌**（不含 V1.9 的宗门标签页），在 `V1.8.1/src/` 副本上开发。仓库主源码 `src/道渊状态栏测试版/` 已演进到 V1.9（含宗门标签 ZongmenPanel），为得到「真·V1.8 + 点赞」，本版本从 V1.8.1/src 副本剥离了宗门标签页相关代码：

- `settingsService.ts` TAB_DEFS 移除 zongmen
- `App.vue` 移除 ZongmenPanel import、zongmen tab、标签内容
- `store.ts` 移除 `宗门Info` 接口与 `StatData.宗门` 字段
- 删除 `components/ZongmenPanel.vue`
- 保留 `主角.宗门` / `主角.宗门贡献`（ProtagonistPanel 的小 tag 字段，V1.8 原有）

构建时临时移开主源码 `index.ts`/`index.html`，让 webpack 只编译 `V1.8.1/src/` 副本入口，产物在 `dist/道渊状态栏测试版/V1.8.1/src/index.html`。

## V1.8.1 相对 V1.8 的变更

### 绝色榜接入点赞按钮

在绝色榜（BeautyRankPanel）每个角色的「名字和头衔右边」加入 DaoYuan WIKI 提供的点赞 Web Component `<daoyuan-applause>`，支持多角色点赞。登录、额度、写入和反馈 UI 由 DaoYuan 共享 iframe 处理，宿主只负责按钮外观。

接入文档见 [`daoyuan-applause.md`](./daoyuan-applause.md)。

#### 功能行为

- 绝色榜每条角色的名字、头衔之后出现 👏点赞 按钮（金色描边胶囊，与「第N名」徽章同处 rank-head 右侧成组）
- 短按提交一次点赞，按住约 0.4s 进入连续点赞（Enter/Space 同样支持）
- 点击后透明 iframe 覆盖宿主完整可视区，提供登录（Discord OAuth）、额度、反馈 UI
- **未在点赞登记表收录的角色不显示按钮**（干净降级，不显示禁用态占位）
- 点赞失败时 toastr 提示「点赞失败，请重试」，用户再点一次即触发重试

#### character-id 来源

`<daoyuan-applause>` 需要「角色名 -> 永久数字 ID」映射，来自公开登记表：
`https://daoyuan.mayuworld.com/applause-character-registry.json`

三层策略（新建 `applauseRegistry.ts`）：

1. **固化映射 BUILTIN**：登记表快照（2026-07-16，166 个角色）固化进项目，断网兜底
2. **运行时 fetch**：首次进入绝色榜触发，成功覆盖内存映射并写 localStorage（key `daoyuan_applause_registry`，7 天过期）
3. **localStorage 缓存**：7 天内不重复请求

绝色榜角色每次 AI 回复轮换 2~3 个、动态变化，因此 character-id 必须按名运行时查询。

#### 角色名归一化（双向间隔号兼容）

登记表 key 部分带间隔号（如「卡斯蒂利亚·哈布斯堡」id=290），而 AI 生成的绝色榜角色名可能去间隔号（「卡斯蒂利亚哈布斯堡」），反之亦然。`lookupCharacterId` 查询时双向都试：原名 + 去间隔号（`·` / `・`）名。与 `portraitService.ts` 的 `normName` 同思路。

#### version 字段

登记表 JSON 不含 version（只有 `schemaVersion:1` + `characters` 映射）。组件**不传 version 属性**，用默认版本，避免硬编码示例值 `v52` 在未来版本报 `invalid-version`。

## 脚本加载

`index.html` 的 `<head>` 静态加载 CDN 脚本（带 `data-local-mode`）：

```html
<script
  type="module"
  src="https://cdn.daoyuan.mayuworld.com/scripts/prod/latest/daoyuan-applause.min.js"
  data-daoyuan-applause
  data-local-mode
></script>
```

- `data-local-mode` 适用于正则替换的嵌套文档（MVU 状态栏），让组件在当前文档注册
- 当前文档能访问 SillyTavern 宿主窗口（`parent.window.TavernHelper`）时，共享 surface runtime 提升到宿主窗口，覆盖完整可视区
- `type="module"` 默认 defer，customElement 异步注册，不阻塞 Vue 渲染
- `HtmlInlineScriptWebpackPlugin` 只内联 webpack 产物脚本，手写的外部 `https://` script 标签原样保留进构建产物（已验证）

## Vue 自定义元素识别

`index.ts` 拆开链式 `createApp`，mount 前配置 `isCustomElement`，避免 Vue 把 `<daoyuan-applause>` 当未解析组件发警告：

```ts
const app = createApp(App);
app.config.compilerOptions.isCustomElement = (tag: string) => tag.startsWith('daoyuan-');
app.use(createPinia());
app.mount('#app');
```

## 存储

- 新增：`daoyuan_applause_registry` - 点赞登记表缓存（7 天过期）
- 复用 V1.8 既有：`daoyuan_custom_portraits` / `daoyuan_female_portraits`

## 文件

- `MVU状态栏-V1.8.1.json` - SillyTavern 正则导入文件（约 213KB，```html 围栏包裹）
- `daoyuan-applause.md` - 点赞组件接入文档（同 V1.8）

## 改动文件（源码 `src/道渊状态栏测试版/`）

- 改动 `index.html`
  - `<head>` 加 daoyuan-applause CDN script（`data-daoyuan-applause data-local-mode`）

- 改动 `index.ts`
  - createApp 后、mount 前设 `app.config.compilerOptions.isCustomElement`，识别 `daoyuan-` 前缀

- 新建 `applauseRegistry.ts`
  - 固化映射 BUILTIN（166 角色）+ 运行时 fetch + localStorage 7 天缓存
  - 导出 `ensureRegistryLoaded()`（异步加载）和 `lookupCharacterId(name)`（同步查询，双向 normName）

- 改动 `components/BeautyRankPanel.vue`
  - 模板：`rank-head` 内头衔后、rank-no 前插入 `<daoyuan-applause v-if>`，slot 放 👏图标 + 点赞文字
  - 脚本：import registry、`onMounted` 调 `ensureRegistryLoaded` + `registryTick` 触发重算避免闪烁、`applauseId` 函数、`onApplauseError` toastr 提示
  - 样式：`.rank-applause` 宿主样式 + `::part(surface)` / `::part(visual)` 金色胶囊 + busy/disabled/blocked 状态 + 窄屏只显图标

## 不改动的部分

- 其它面板（人物/灵宠/道侣/机遇/动向/玉简/储物/器物/地图/宗门/功法/副业）零改动
- `portraitService.ts` 零改动
- V1.8 的所有功能保持不变

## 正则配置

| 字段 | 值 |
| --- | --- |
| id | `82448547-a9e3-4cb8-be29-2bfc41d46523`（新 UUID，避免与 V1.8 冲突） |
| scriptName | 道渊状态栏 |
| findRegex | `<StatusPlaceHolderImpl/>` |
| replaceString | 213,852 字符（```html 围栏包裹） |
| markdownOnly | true |
| runOnEdit | true |
| placement | [2] |

## 风险与验证

| 风险 | 等级 | 验证 |
| --- | --- | --- |
| CSP 拦截 CDN/embed iframe | 中 | 真机绝色榜看按钮是否出现 + 点赞是否成功；DevTools 看 CSP 报错 |
| 多楼层 surface 提升冲突 | 中 | 多楼层同时点按钮、切楼层点、滚动卸载后看 parent.window 残留 |
| 登记表 fetch 失败 | 低 | 断网点按钮，回退固化映射，未登记角色不显示 |
| 角色名 normName 不命中 | 低 | 测试间隔号变体 |
| Vue compilerOptions 未生效 | 低 | DevTools Console 看有无 "Failed to resolve component" 警告 |
| version 不传致 invalid-version | 低 | 真机点按钮看是否报 invalid-version |

### 验证步骤

1. 构建后 `dist/道渊状态栏测试版/index.html` 含两个 script（内联 Vue + CDN daoyuan-applause）✅ 已验证
2. SillyTavern 真机加载，绝色榜已登记角色名字右边出现 👏点赞 按钮
3. 点按钮 feedback iframe 弹出，登录后点赞成功
4. 未登记角色无按钮
5. 多楼层同时操作无冲突
6. 断网：按钮仍显示（固化映射），点赞报错 toast
7. DevTools 无 Vue 警告
