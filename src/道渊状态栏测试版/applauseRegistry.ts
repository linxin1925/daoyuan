/**
 * 道渊点赞登记表服务。
 *
 * 提供「角色名 -> 永久数字 ID」查询，供 <daoyuan-applause> 的 character-id 属性使用。
 *
 * 三层策略：
 * 1. BUILTIN 固化映射（离线兜底，从公开登记表快照）
 * 2. 运行时 fetch 公开登记表（主路径，登记表会扩充）
 * 3. localStorage 缓存 7 天，避免每楼层重复请求
 *
 * 角色名归一化：登记表 key 可能带间隔号（如「卡斯蒂利亚·哈布斯堡」），
 * 而 AI 生成的绝色榜角色名可能去间隔号（「卡斯蒂利亚哈布斯堡」），反之亦然。
 * 查询时双向都试：原名 + 去间隔号（·/・）名。
 */

const REGISTRY_URL = 'https://daoyuan.mayuworld.com/applause-character-registry.json';
const CACHE_KEY = 'daoyuan_applause_registry';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 天

// 公开登记表快照（2026-07-16），断网兜底用。运行时 fetch 成功会覆盖。
const BUILTIN: Record<string, number> = {
  '林若悠': 2,
  '宫银叶': 3,
  '慕欣心': 6,
  '青衣': 11,
  '幽悦': 37,
  '凌月': 38,
  '阴罗': 39,
  '晚絮': 40,
  '瑶汐': 41,
  '林雪': 42,
  '白薇': 43,
  '苏清雪': 44,
  '玄虚': 45,
  '陆雪琪': 46,
  '紫薇': 47,
  '曦和': 48,
  '绯月': 49,
  '天妤': 50,
  '叶清': 51,
  '龙傲飞': 52,
  '苏沐雪': 53,
  '叶冰': 54,
  '炎帝': 55,
  '秦心': 56,
  '红绡': 57,
  '苏琉璃': 58,
  '秦无夜': 59,
  '云舒窈': 60,
  '大衍': 61,
  '烈阳': 62,
  '构军': 63,
  '林欣': 64,
  '慧空': 65,
  '般若': 66,
  '韩月灵': 68,
  '林妙音': 69,
  '广慧': 70,
  '幽梦': 71,
  '噬魂': 72,
  '冰凤': 80,
  '姬紫月': 81,
  '苏媚': 82,
  '萧婉儿': 83,
  '姬昊天': 84,
  '李牧': 85,
  '萧衍': 86,
  '青练': 88,
  '敖凌霜': 94,
  '袁琪': 95,
  '孔灵月': 96,
  '蛛心儿': 97,
  '苏千媚': 106,
  '江楚楚': 113,
  '苏灿灿': 116,
  '苏辰': 117,
  '慕清弦': 118,
  '温月清': 119,
  '温小暖': 120,
  '玖柒': 135,
  '韩立': 139,
  '南宫婉': 140,
  '银月': 141,
  '石昊': 149,
  '白小纯': 150,
  '侯小妹': 151,
  '古月方源': 152,
  '宋文': 153,
  '商心慈': 154,
  '嫣雨烟': 166,
  '唐弎': 167,
  '银黎': 168,
  '红蝶': 169,
  '王林': 170,
  '楚星绾': 171,
  '灵玥': 173,
  '上官玥': 174,
  '秦浅月': 187,
  '许千寻': 190,
  '玄清': 191,
  '柳依依': 192,
  '顾长枫': 193,
  '萧玉寒': 194,
  '苏清禾': 195,
  '云糯糯': 196,
  '苏绾影': 197,
  '凌阮阮': 198,
  '叶倾心': 199,
  '汐怡': 200,
  '桃夭夭': 201,
  '顾幽梵': 202,
  '苏珞刹': 203,
  '霖仙怡': 204,
  '冥霜儿': 205,
  '楚玉璃': 206,
  '白玖璃': 207,
  '青木璇': 208,
  '璃杏': 209,
  '杜月菲': 210,
  '慕容无尘': 211,
  '慕容初袖': 212,
  '慕容落羽': 213,
  '萌梦': 214,
  '钰仙儿': 215,
  '青渝': 216,
  '齐天麟': 217,
  '风梧音': 218,
  '秦汐雅': 219,
  '凌天辰': 220,
  '凌紫嫣': 221,
  '叶婷': 222,
  '舞弦琴': 224,
  '星宿': 232,
  '红莲': 233,
  '南可熙': 235,
  '凤灵儿': 236,
  '公孙清': 237,
  '魏喑': 241,
  '乔梦玉': 251,
  '元容': 252,
  '玄璃': 253,
  '阳宇': 254,
  '林寒绾': 255,
  '朱离': 256,
  '侯景': 257,
  '长孙镜华': 258,
  '柳青螭': 259,
  '希夷': 260,
  '辟易川': 261,
  '欧阳灵': 262,
  '黑姬结灯': 263,
  '李未晞': 264,
  '阴丽华': 265,
  '九歌': 266,
  '晏青': 267,
  '小D': 268,
  '白祈昼': 269,
  '璃宫花火': 271,
  '紫澪': 272,
  '金玉满': 276,
  '小翠': 277,
  '万金柝': 278,
  '万璇玑': 279,
  '叶焚渊': 280,
  '小显示': 281,
  '海伊': 282,
  '柳舞蝶': 283,
  '白疏影': 284,
  '李溯': 287,
  '百铃': 288,
  '樊月汐': 289,
  '卡斯蒂利亚·哈布斯堡': 290,
  '君姝': 291,
  '代安池': 292,
  '桃幽': 293,
  '颜小落': 294,
  '桃夭诺': 295,
  '苏慕渊': 296,
  '姬觅弥': 297,
  '燕重微': 298,
  '林素铃': 299,
  '李铭': 300,
  '苏清漪': 301,
  '姜梦': 303,
  '云初未来': 304,
  '白倾颜': 305,
  '顾清清': 306,
};

interface CachedRegistry {
  fetchedAt: number;
  data: Record<string, number>;
}

let runtimeMap: Record<string, number> | null = null;
let loading: Promise<void> | null = null;

function normName(name: string): string {
  return name.replace(/[·・]/g, '');
}

function loadCached(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRegistry;
    if (!parsed?.data || typeof parsed.fetchedAt !== 'number') return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function isCacheFresh(): boolean {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as CachedRegistry;
    return typeof parsed.fetchedAt === 'number' && Date.now() - parsed.fetchedAt < CACHE_TTL;
  } catch {
    return false;
  }
}

function saveCached(data: Record<string, number>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), data }));
  } catch { /* 配额满或禁用，忽略 */ }
}

/** 同步查询角色 ID。先试原名，再试去间隔号归一化名。未命中返回 undefined。 */
export function lookupCharacterId(name: string): number | undefined {
  const map = runtimeMap ?? loadCached() ?? BUILTIN;
  if (name in map) return map[name];
  const normalized = normName(name);
  if (normalized !== name && normalized in map) return map[normalized];
  return undefined;
}

/** 异步加载登记表（fetch 主路径 + 缓存）。多次调用复用同一个 promise。 */
export function ensureRegistryLoaded(): Promise<void> {
  if (runtimeMap) return Promise.resolve();
  if (loading) return loading;
  loading = (async () => {
    // 缓存未过期直接用
    if (isCacheFresh()) {
      const cached = loadCached();
      if (cached) { runtimeMap = cached; return; }
    }
    try {
      const res = await fetch(REGISTRY_URL);
      if (!res.ok) throw new Error(`registry HTTP ${res.status}`);
      const json = (await res.json()) as { characters?: Record<string, number> };
      runtimeMap = json.characters ?? BUILTIN;
      saveCached(runtimeMap);
    } catch {
      // fetch 失败：用旧缓存，否则用固化映射
      runtimeMap = loadCached() ?? BUILTIN;
    }
  })();
  return loading;
}
