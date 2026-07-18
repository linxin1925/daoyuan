# 道渊状态栏测试版

> 基于《道渊》v5.2 角色卡的 MVU 状态栏，从原版 MVU 状态栏完整重写为 Vue 3 + TypeScript + Pinia 架构，并扩展了玉简传讯、立绘、地图等交互功能。

## 目录结构

```
src/道渊状态栏测试版/
├── App.vue                ← 根组件（标签栏 + 面板切换）
├── index.ts               ← 入口（waitGlobalInitialized('Mvu') + 挂载 Vue）
├── index.html             ← HTML 模板
├── global.css             ← 全局样式 + CSS 变量
├── store.ts               ← Pinia store（Mvu.getMvuData + VARIABLE_UPDATE_ENENDED 监听）
├── wxService.ts           ← 玉简传讯服务（发消息/API/世界书/预设）
├── portraitService.ts     ← 立绘服务（内置 167+33 立绘库 + 自定义存储）
├── mapService.ts          ← 地图服务（玄天界 14 节点 + 仙界 5 节点）
├── MVU变量结构.md         ← 变量字段参考
└── components/            ← Vue 组件
    ├── ProtagonistPanel.vue   ← 主角（姓名/境界/气运二级菜单/器灵头像）
    ├── TopBar.vue             ← 顶部世界信息
    ├── DaolvPanel.vue         ← 道侣（含立绘）
    ├── NpcPanel.vue           ← 人物（含立绘）
    ├── YujianPanel.vue        ← 玉简（微信式聊天 + 发消息 + 删除）
    ├── WxSettingsModal.vue    ← 玉简设定弹窗（API/世界书/预设）
    ├── PortraitModal.vue      ← 立绘查看/自定义弹窗
    ├── MapPanel.vue           ← 地图（节点/连线/势力详情/玄天界全图）
    ├── BeautyRankPanel.vue    ← 绝色榜（立绘缩略图 + 排名"第X名"）
    ├── InventoryPanel.vue     ← 储物袋（描述+数量）
    ├── ArtifactsPanel.vue     ← 器物
    ├── QiyunPanel.vue         ← 气运
    ├── GongfaPanel.vue        ← 功法
    ├── CraftPanel.vue         ← 副业（炼丹/炼器）
    ├── PetPanel.vue           ← 灵宠
    ├── OpportunityPanel.vue   ← 机遇
    ├── TrendsPanel.vue        ← 动向
    ├── PanelCard.vue          ← 通用面板容器
    ├── StatBar.vue            ← 属性条
    └── Icon.vue               ← 图标库（含 gear/send/search/mountain 等）
```

## 功能清单

### 数据展示（MVU stat_data 全字段覆盖）
- **主角**：姓名(大)/境界(右小字)/灵根/宗门/五维(生命/精血/灵力/修为/神识/道心)/神念/状态
  - 二级菜单①：外貌穿搭（性别置顶 + 容貌/身形/衣着）
  - 二级菜单②：气运（4 条，点击查看详情）
  - 器灵头像（最右，点击随机显示一句台词，2 张图轮播）
- **道侣**：性别/种族/状态/境界/亲密/性格/外观/身高/背景/神通/心声 + 立绘
- **人物**：头衔/境界/好感/关系阶段/性格/描述 + 立绘
- **玉简**：联系人列表 + 微信式聊天（对方左/我右气泡）
- **绝色榜**：立绘缩略图 + 排名"第X名" + 仙姿 + 群芳谱（颜色区分）
- **储物袋/器物**：描述 + 数量
- **动向**：阶段/类型/地点/描述
- **机遇**：难度/目标/机缘/引言
- **功法/副业**：类型/境界/熟练度/成功率

### 交互功能
1. **玉简传讯**（完整聊天）
   - 发消息 → 写入 MVU 变量 → 调用 AI 生成 NPC 回复 → 写回变量
   - 自定义 API 配置（OpenAI 兼容，留空用酒馆内建 generate）
   - 世界书知识注入（按联系人勾选，316 条）
   - 预设管理（保存/应用/删除）
   - 神识 ≥20 才能传讯
   - 删除单条消息（同步删变量）
2. **立绘系统**
   - 内置立绘库 200 条（玄天界 167 + 女性专用 33）
   - 自定义立绘（本地图片 base64 / URL，存 localStorage）
   - 道侣/人物/绝色榜均可查看立绘
3. **地图系统**
   - 玄天界（14 节点）+ 仙界（5 节点）切换
   - 节点连线、点击查看势力详情
   - 玄天界全图（点击放大）

## 使用方法

### 构建
```bash
pnpm install
pnpm watch      # 开发：webpack --watch + tavern_sync 推送
pnpm build      # 生产构建
```

webpack 自动 glob `src/**/index.ts` 作为入口，本目录有 `index.ts` 会被自动编译，产物输出到 `dist/道渊状态栏测试版/index.html`。

### 导入酒馆
编译后的 `dist/道渊状态栏测试版/index.html` 是内联单文件，可作为正则替换内容注入角色卡《道渊》v5.2 的局部正则（匹配 `<StatusPlaceHolderImpl/>`）。

## 依赖

### 运行时（酒馆助手注入的全局变量）
- `$` (jQuery)、`_` (lodash)、`Vue`、`z` (zod)、`toastr`、`YAML`、`gsap`
- `Mvu`、`getVariables`、`getChatMessages`、`getCurrentMessageId`、`generate`
- `getCharWorldbookNames`、`getWorldbook`

### CDN（运行时加载）
- `testingcf.jsdelivr.net` → pinia、async-wait-until
- `free-img.400040.xyz` / `i.postimg.cc` → 立绘图片

## 存储说明（localStorage，与原版同 key 兼容）
| key | 内容 |
| --- | --- |
| `daoyuan_wx_settings` | 玉简 API 配置 + 自定义提示词 |
| `daoyuan_wx_lore_selected` | 按联系人的世界书勾选 |
| `daoyuan_wx_presets` | 传讯预设 |
| `daoyuan_custom_portraits` | 自定义立绘（base64/URL） |

## 注意事项
1. **必须用《道渊》v5.2 角色卡** + MVU 变量框架，字段才匹配
2. **需安装酒馆助手扩展**（JS-Slash-Runner）
3. **需联网**（CDN 加载 pinia + 立绘图床）
4. 立绘图床失效会图裂，但其他功能不受影响；可用自定义立绘替换
5. 玉简传讯配置是浏览器本地存储，换设备需重新配置

## 与原版 MVU 状态栏的差异
- 架构：jQuery 全局函数 → Vue 3 + Pinia + TypeScript 组件化
- 玉简：只读 → 完整聊天（发消息/收回复/删除）
- 立绘：保留原立绘库 + 新增自定义立绘管理
- 地图：保留原数据 + Vue 重写交互
- 器灵：独立 tab → 器灵头像移到主角栏最右
- 气运：独立 tab → 主角姓名处二级菜单
- 储物：网格密集 → 单列描述完整
- 绝色榜：纯文本 → 立绘缩略图 + "第X名"格式 + 颜色区分
