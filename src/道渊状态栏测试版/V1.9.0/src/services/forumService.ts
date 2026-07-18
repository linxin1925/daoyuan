/**
 * 群芳谱论坛服务 — 配置存储、提示词构造、AI 回复生成。
 *
 * 数据不写入 MVU 变量，纯内存（组件 reactive）。
 * API 配置存 localStorage，与玉简独立。
 */
import _ from 'lodash';

export interface ForumSettings {
  customPrompt: string;
  apiBaseUrl: string;
  apiKey: string;
  apiModel: string;
}

const K = 'daoyuan_forum_settings';
const K_PRESETS = 'daoyuan_forum_presets';

const EMPTY: ForumSettings = { customPrompt: '', apiBaseUrl: '', apiKey: '', apiModel: '' };

/* ---------- 配置存储 ---------- */

export function loadForumSettings(): ForumSettings {
  try {
    const s = JSON.parse(localStorage.getItem(K) || '{}');
    return {
      customPrompt: s.customPrompt || '',
      apiBaseUrl: s.apiBaseUrl || '',
      apiKey: s.apiKey || '',
      apiModel: s.apiModel || '',
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveForumSettings(s: ForumSettings): void {
  localStorage.setItem(K, JSON.stringify(s));
}

/* ---------- 预设管理 ---------- */

export function loadForumPresets(): Record<string, ForumSettings> {
  try {
    return JSON.parse(localStorage.getItem(K_PRESETS) || '{}');
  } catch {
    return {};
  }
}

export function saveForumAsPreset(name: string, s: ForumSettings): void {
  const all = loadForumPresets();
  all[name] = s;
  localStorage.setItem(K_PRESETS, JSON.stringify(all));
}

export function applyForumPreset(name: string): ForumSettings | null {
  return loadForumPresets()[name] || null;
}

export function deleteForumPreset(name: string): void {
  const all = loadForumPresets();
  delete all[name];
  localStorage.setItem(K_PRESETS, JSON.stringify(all));
}

/* ---------- 获取模型列表 ---------- */

export async function fetchForumModels(settings: ForumSettings): Promise<string[]> {
  if (!settings.apiBaseUrl) throw new Error('请先填写基础 URL');
  let endpoint = settings.apiBaseUrl.replace(/\/+$/, '');
  endpoint = endpoint.replace(/\/chat\/completions$/, '');
  if (!endpoint.endsWith('/models')) endpoint += '/models';

  const headers: Record<string, string> = {};
  if (settings.apiKey) headers['Authorization'] = `Bearer ${settings.apiKey}`;

  const response = await fetch(endpoint, { method: 'GET', headers });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`获取模型列表失败: ${response.status} - ${errText.slice(0, 200)}`);
  }
  const data = await response.json();
  const list: string[] = (Array.isArray(data?.data) ? data.data : [])
    .map((m: unknown) => (typeof m === 'string' ? m : (m as any)?.id))
    .filter((x: unknown): x is string => typeof x === 'string' && !!x);
  return list.sort((a, b) => a.localeCompare(b));
}

/* ---------- 构造注入提示词 ---------- */

export function buildForumInjectContent(
  charName: string,
  xianzi: string,
  qunfangpu: string,
  history: Array<{ content: string; floor: number }>,
  lastUserMsg: string,
  settings: ForumSettings,
): string {
  let inject = `[绝色榜人物]\n角色: ${charName}\n仙姿: ${xianzi}\n\n[群芳谱原作]\n${qunfangpu}\n\n`;

  if (history.length) {
    inject += `[历史回帖记录]\n${history.map(h => `#${h.floor}楼 匿名道友: ${h.content}`).join('\n')}\n\n`;
  }

  inject += `[上一条评论]\n匿名道友说: ${lastUserMsg}\n\n`;

  if (settings.customPrompt) {
    inject += `[回复指引]\n${settings.customPrompt}\n\n`;
  }

  inject += `(你现在正在群芳谱论坛上，以匿名道友的身份参与讨论。群芳谱是修仙界坊间流传的绝色榜，众道友在此对各路上榜女修品头论足，言辞下流猥琐、毫无底线，尽是意淫挑衅之语。你必须互喷、抬杠或吐槽上一条评论，言辞下流猥琐，绝不可附和赞同。请直接输出你的回帖内容，必须贴合坊间泼皮流氓的语气，粗俗直白，100字以内。
【绝对禁令】：除了你要说的回帖内容本身，禁止输出任何其他内容！禁止带角色署名，禁止加任何括号、标签或特殊符号，禁止分段换行！直接开口！)`;

  return inject;
}

/* ---------- 调用生成 ---------- */

export async function callForumGenerateReply(
  injectContent: string,
  userMessage: string,
  settings: ForumSettings,
): Promise<string> {
  if (settings.apiBaseUrl && settings.apiModel) {
    let endpoint = settings.apiBaseUrl;
    if (!endpoint.endsWith('/chat/completions') && !endpoint.endsWith('/chat/completions/')) {
      endpoint = endpoint.endsWith('/') ? endpoint + 'chat/completions' : endpoint + '/chat/completions';
    }
    const payload = {
      model: settings.apiModel,
      messages: [
        { role: 'system', content: injectContent },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (settings.apiKey) headers['Authorization'] = `Bearer ${settings.apiKey}`;

    const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${errText}`);
    }
    const data = await response.json();
    if (data?.choices?.[0]?.message?.content) return data.choices[0].message.content;
    throw new Error(`API 返回格式异常: ${JSON.stringify(data)}`);
  }

  // 酒馆原生 generate（与玉简一致：inject + userMessage 一起作为 user_input）
  const combined = injectContent + '\n\n' + userMessage;
  const result = await generate({ user_input: combined });
  return typeof result === 'string' ? result : String(result);
}
