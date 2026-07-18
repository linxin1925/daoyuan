# 《道渊》v5.1 — MVU 数据结构

> 通过 `TavernHelper.getVariables({type:'message', message_id:'latest'})` 现场抓取整理。
> 本卡 `schema` 字段值为占位字符串 `"没有用别管这个"`，没有 zod schema，结构由世界书 `[mvu_update]变量更新规则` 驱动 AI 自然演化。

---

## 一、变量分层

| 作用域 | 类型 | 内容 |
|---|---|---|
| `getVariables({type:'character'})` | 角色变量 | 仅有 `phone_data`（与本卡 MVU 无关，疑似别的脚本残留） |
| `getVariables({type:'chat'})` | 聊天变量 | 76 个开关（POV / format / zishu / wenfeng / nsfw / echo_reminder…），是预设/世界书的开关配置，**不是** MVU 数据 |
| `getVariables({type:'message', message_id:'latest'})` | **楼层变量** | `initialized_lorebooks`、`stat_data`（MVU 主数据）、`schema`（占位） |

> MVU 数据存储在**楼层变量**里，符合 mvu 框架标准（消息楼层级、随楼层迭代）。

---

## 二、`stat_data` 顶层 9 域

```text
stat_data
├── 世界           (object, 4)    全局世界状态
├── 主角           (object, 19)   玩家角色完整数据
├── 道侣           (object, 0)    占位空容器（动态键）
├── 灵宠           (object, 0)    占位空容器（动态键）
├── 人物           (object, n)    NPC 注册表（动态键）
├── 机遇           (object, n)    任务/事件注册表（动态键）
├── 绝色榜         (object, n)    女角色排行榜（动态键）
├── 玉简           (object, 0)    占位空容器（动态键）
└── $器灵台词       (array)        系统提示词数组（$ 前缀=系统字段）
```

---

## 三、各域结构详解

### 1. 世界 — 全局环境（固定字段 + 动态动向）

```text
世界
├── 当前时间       string         例: "元会历·3726年·12月23日·16点00分"
├── 当前地点       string         分层格式 [大区]·[方位]·[势力]·[地点]·[微观]·[环境]
├── 危机程度       string         enum: 低/中/高（推测）
└── 动向           object         z.record(string, 动向条目)
    └── [动向名]
        ├── 类型    string
        ├── 地点    string
        └── 描述    string
```

### 2. 主角 — 玩家面板（19 个字段）

```text
主角
├── 境界           string         "筑基初期（DC:25）"
├── 宗门           string
├── 宗门贡献       number
├── 所在界         string
├── 生命           number   ─┐
├── 精血           number    │
├── 灵力           number    │ 五维状态条（推测 0~100）
├── 修为           number    │
├── 神识           number   ─┘
├── 道心           number         意志/精神
├── 神念           string         自由文字描述（非数值）
├── 灵根           string
├── 状态           string
├── 气运           object         z.record(气运名, 气运详情)
│   └── [气运名] (例: 真·草字剑诀)
│       ├── 类型           string
│       ├── 效果           string
│       ├── 使用状态       string
│       ├── 剩余次数       string | number
│       └── 压制状态       string
├── 炼丹           object         技能子面板
│   ├── 阶级       string
│   ├── 熟练度     number
│   ├── 成功率     number
│   └── 次数       number
├── 炼器           object         同炼丹结构
│   └── 阶级 / 熟练度 / 成功率 / 次数
├── 储物袋         object         z.record(物品名, …) 当前空
├── 功法           object         z.record(功法名, 功法详情)
│   └── [功法名] (例: 九阳神功)
│       ├── 类型 / 境界 / 熟练度 / 描述
└── 器物           object         z.record(器物名, …) 当前空
```

### 3. 人物 — NPC 注册表（动态键，每个 NPC 共 10 字段）

```text
人物.[NPC名] (例: 晏青)
├── 头衔           string
├── 境界           string
├── 好感           number         核心关系数值（推测 0~100）
├── 关系阶段       string         enum: 试探期 / …（推测）
├── 生命           number   ─┐
├── 灵力           number    │ NPC 四维（无精血、神识）
├── 修为           number    │
├── 道心           number   ─┘
├── 性格           string
└── 描述           string
```

### 4. 机遇 — 任务/事件（动态键）

```text
机遇.[事件名] (例: 杏临谷初遇)
├── 难度           string
├── 目标           string
├── 机缘           string
└── 引言           string
```

### 5. 绝色榜 — 排行榜（动态键）

```text
绝色榜.[人物名]
├── 排名           string
├── 头衔           string
├── 仙姿           string
└── 群芳谱         string
```

### 6. 空占位容器

`道侣 / 灵宠 / 玉简 / 储物袋 / 器物` 当前均为空 object，遵循 mvu 推荐的 `z.object({}).prefault({})` 模式，等剧情触发时按 `z.record(string, …)` 添加。

### 7. `$器灵台词` — 系统字段

- `$` 前缀按 mvu 约定为系统/隐藏字段（不直接显示给玩家或不参与 AI 更新规则的常规约束）。
- 类型 `string[]`，存器灵（灵汐）提示玩家的台词。

---

## 四、可推断的设计约定

| 约定 | 体现 |
|---|---|
| **数值上限 100** | 生命/精血/灵力/神识/道心 当前皆 100 → 推测使用 `z.number().transform(v => _.clamp(v, 0, 100))` 风格 |
| **`z.record` 动态键** | 人物、机遇、动向、气运、功法、储物袋、绝色榜 均以"实体名"为键 |
| **空 object prefault** | 5 个空容器都用 `.prefault({})` 而非 `optional()` |
| **混合类型五维** | 主角有 5 项数值面板，NPC 有 4 项（减精血、神识） |
| **数值+字符串混搭** | 同一对象内常见 `阶级:string + 熟练度:number`（炼丹/炼器/气运/功法） |
| **嵌套对象大量动态键** | 整体偏 `z.record(z.string(), z.object({...}))`，非 `z.object` 固定字段 |
| **$ 前缀=系统字段** | `$器灵台词` 不参与一般变量更新规则 |

---

## 五、MVU 框架可用 API

```text
Mvu.events                       事件枚举（COMMAND_PARSED / VARIABLE_UPDATE_ENDED 等）
Mvu.getCurrentMvuData()          当前楼层 MVU 数据
Mvu.getMvuData(opts)             指定楼层 MVU 数据
Mvu.getMvuVariable(...)          单变量取值
Mvu.getRecordFromMvuData(...)    record 类型快捷取值
Mvu.isDuringExtraAnalysis()
Mvu.parseMessage(msg, oldData)   自行解析 AI 输出（generate 时用）
Mvu.reloadInitVar()              重载 initvar
Mvu.replaceCurrentMvuData(...)
Mvu.replaceMvuData(data, opts)
Mvu.setMvuVariable(...)          单变量赋值
```

---

## 六、状态栏现状

楼层 #1（AI 楼）的 `mes_text` 内含 1 个 iframe `id="TH-message--1--0"`（about:srcdoc 内联），尺寸 1166×713。

iframe 内部结构：
- 引入 Google Fonts `Noto Serif SC`
- 根容器 `.terminal-container`：顶部时间栏（⚜️ 元会历…）、主角面板（境界+生命/精血/灵力/修为 进度条）
- 三个 modal overlay：
  - `image-modal-overlay`
  - `faction-modal-overlay`（✨ 乾坤洞察）
  - `luck-modal-overlay`（✨ 气运加身）
- bodyHtmlLen ≈ 193K，bodyTextLen ≈ 412（文本被大量 HTML 包装，符合状态栏 SPA 形态）

> 这套状态栏是直接由 AI 输出的内联 HTML 渲染的，没有外部 iframe 资源加载。
> 我们要做的「道渊状态栏」项目，是用 Vue 重做一套**外置状态栏前端界面**，通过 `mountStreamingMessage` 或前端界面方式接管显示。

---

## 七、本仓库内对应工程

- 文档：`src/道渊状态栏/MVU变量结构.md`（本文件）
- 工程：`src/道渊状态栏/`（Vue 前端界面，直接读取 `getVariables({type:'message', message_id:'latest'}).stat_data`）

由于本卡 schema 是占位字符串，工程**不使用** `defineMvuDataStore`（它要求传入真实 zod Schema），改用 pinia store 直接订阅楼层变量。
