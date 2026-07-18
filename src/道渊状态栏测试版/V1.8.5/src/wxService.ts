import _ from 'lodash';

/**
 * 玉简传讯服务 — 配置存储、世界书注入、发消息、生成回复。
 *
 * 存储格式与原版 MVU 状态栏兼容（localStorage 同 key），用户已有配置可直接继承。
 * 消息写入用 Mvu.getMvuData/replaceMvuData，message_id 取 getCurrentMessageId()，
 * 与道渊 store (store.ts) 读取一致，写入后 store 监听 VARIABLE_UPDATE_ENDED 自动刷新。
 */

export interface WxSettings {
  customPrompt: string;
  apiBaseUrl: string;
  apiKey: string;
  apiModel: string;
}

export interface LoreEntry {
  uid: string;
  name: string;
  content: string;
  keys: string[];
}

const K_SETTINGS = 'daoyuan_wx_settings';
const K_LORE = 'daoyuan_wx_lore_selected';
const K_PRESETS = 'daoyuan_wx_presets';

const EMPTY_SETTINGS: WxSettings = { customPrompt: '', apiBaseUrl: '', apiKey: '', apiModel: '' };

/* ---------- 配置存储 ---------- */

export function loadWxSettings(): WxSettings {
  try {
    const s = JSON.parse(localStorage.getItem(K_SETTINGS) || '{}');
    return {
      customPrompt: s.customPrompt || '',
      apiBaseUrl: s.apiBaseUrl || '',
      apiKey: s.apiKey || '',
      apiModel: s.apiModel || '',
    };
  } catch {
    return { ...EMPTY_SETTINGS };
  }
}

export function saveWxSettings(s: WxSettings): void {
  localStorage.setItem(K_SETTINGS, JSON.stringify(s));
}

/* ---------- 世界书勾选（按联系人） ---------- */

type LoreSelected = Record<string, Array<{ uid: string; content: string }>>;

export function loadWxLore(): LoreSelected {
  try {
    return JSON.parse(localStorage.getItem(K_LORE) || '{}');
  } catch {
    return {};
  }
}

export function getLoreSelected(charName: string): Array<{ uid: string; content: string }> {
  return loadWxLore()[charName] || [];
}

export function saveWxLore(charName: string, selected: Array<{ uid: string; content: string }>): void {
  const all = loadWxLore();
  all[charName] = selected;
  localStorage.setItem(K_LORE, JSON.stringify(all));
}

/* ---------- 预设管理 ---------- */

export function loadPresets(): Record<string, WxSettings> {
  try {
    return JSON.parse(localStorage.getItem(K_PRESETS) || '{}');
  } catch {
    return {};
  }
}

export function saveAsPreset(name: string, s: WxSettings): void {
  const all = loadPresets();
  all[name] = s;
  localStorage.setItem(K_PRESETS, JSON.stringify(all));
}

export function applyPreset(name: string): WxSettings | null {
  return loadPresets()[name] || null;
}

export function deletePreset(name: string): void {
  const all = loadPresets();
  delete all[name];
  localStorage.setItem(K_PRESETS, JSON.stringify(all));
}

/* ---------- 世界书条目获取 ---------- */

export async function fetchCharLorebooks(): Promise<LoreEntry[]> {
  const cw = getCharWorldbookNames('current');
  const names = [cw.primary, ...cw.additional].filter((n): n is string => !!n);
  if (!names.length) return [];
  const entries: LoreEntry[] = [];
  for (const name of names) {
    try {
      const wb = await getWorldbook(name);
      for (const e of wb) {
        if (!e.enabled) continue;
        const keys = (e.strategy?.keys || [])
          .map(k => (typeof k === 'string' ? k : String(k)))
          .filter(k => k);
        entries.push({
          uid: String(e.uid),
          name: e.name || keys[0] || '未命名条目',
          content: e.content || '',
          keys,
        });
      }
    } catch {
      /* 忽略单个世界书读取失败 */
    }
  }
  return entries;
}

/* ---------- 玉简消息写入 MVU 变量 ---------- */

/** 首次调用时缓存持有 stat_data 的消息 ID，避免 AI 生成新消息后 ID 漂移 */
let statMessageId: string | null = null;
function getStatMessageId(): string {
  if (!statMessageId) statMessageId = getCurrentMessageId();
  return statMessageId;
}

export async function appendChatMessage(charName: string, sender: string, content: string): Promise<void> {
  const messageId = getStatMessageId();
  const fullData = Mvu.getMvuData({ type: 'message', message_id: messageId });
  if (!fullData || !fullData.stat_data) {
    console.warn('[玉简] MVU 数据未初始化');
    return;
  }
  if (!_.isObject(fullData.stat_data.玉简)) {
    fullData.stat_data.玉简 = {};
  }
  const yj = fullData.stat_data.玉简;
  if (!_.isObject(yj[charName])) {
    yj[charName] = { 历史记录: {} };
  }
  if (!_.isObject(yj[charName].历史记录)) {
    yj[charName].历史记录 = {};
  }

  const newMsgId = 'msg_' + Date.now() + Math.floor(Math.random() * 1000);
  const now = new Date();
  const timeStr =
    String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  yj[charName].历史记录[newMsgId] = { 发送者: sender, 内容: content, 时间: timeStr };

  await Mvu.replaceMvuData(fullData, { type: 'message', message_id: messageId });
}

/* ---------- 删除单条玉简消息 ---------- */

export async function deleteChatMessage(charName: string, msgId: string): Promise<void> {
  const messageId = getStatMessageId();
  const fullData = Mvu.getMvuData({ type: 'message', message_id: messageId });
  if (!fullData || !fullData.stat_data) return;
  const hist = _.get(fullData.stat_data, ['玉简', charName, '历史记录']);
  if (!_.isObject(hist) || !(msgId in hist)) return;

  delete hist[msgId];
  await Mvu.replaceMvuData(fullData, { type: 'message', message_id: messageId });
}

/* ---------- 构造注入提示词 ---------- */

export function buildInjectContent(charName: string, settings: WxSettings): string {
  const vars = getVariables({ type: 'message' });
  const stat = _.get(vars, 'stat_data', {}) as Record<string, any>;
  const hero = stat.主角 || {};
  const world = stat.世界 || {};

  // 历史记录
  const historyObj = _.get(stat, ['玉简', charName, '历史记录'], {}) as Record<string, any>;
  let historyText = '';
  Object.values(historyObj).forEach(msg => {
    if (msg && typeof msg === 'object') {
      historyText += `[${msg.发送者}]: ${msg.内容}\n`;
    }
  });

  // 勾选世界书
  let loreContext = '';
  getLoreSelected(charName).forEach(d => {
    if (d.content) loreContext += d.content + '\n\n';
  });

  // 主角状态
  let heroInfo =
    `[主角当前状态]\n` +
    `境界: ${hero.境界 || '未知'}\n` +
    `所在界域: ${hero.所在界 || '未知'}\n` +
    `当前地点: ${world.当前地点 || '未知'}\n` +
    `当前时间: ${world.当前时间 || '未知'}\n` +
    `灵根: ${hero.灵根 || '无'}\n`;
  const skills = hero.功法 || {};
  const skillNames = Object.entries(skills)
    .map(([k, v]: [string, any]) => `${k}(${v?.境界 || '未知'})`)
    .join('、');
  heroInfo += `功法: ${skillNames || '无'}`;

  let inject = '';
  if (loreContext) inject += `[世界书知识注入]\n${loreContext}\n`;
  inject += heroInfo + '\n\n';
  if (historyText) inject += `[历史传讯记录]\n${historyText}\n`;
  if (settings.customPrompt) inject += `[传讯指引]\n${settings.customPrompt}\n\n`;
  inject += `(请以【${charName}】的身份回复，严格只输出纯对话内容，绝对不要带角色名、引号、动作描写或[]符号。)`;
  return inject;
}

/* ---------- 调用生成 ---------- */

export async function callGenerateReply(
  injectContent: string,
  userMessage: string,
  settings: WxSettings,
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
      temperature: 0.7,
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

  // 酒馆原生 generate
  const combined = injectContent + '\n\n' + userMessage;
  const result = await generate({ user_input: combined });
  return typeof result === 'string' ? result : String(result);
}

/* ---------- 获取模型列表 ---------- */

export async function fetchModels(settings: WxSettings): Promise<string[]> {
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

/* ---------- 发消息主流程 ---------- */

export async function handleReply(
  charName: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const vars = getVariables({ type: 'message' });
    const shenshi = parseFloat(_.get(vars, 'stat_data.主角.神识', 0));
    if (shenshi < 20) {
      return { ok: false, error: '神识不足20，无法传讯！' };
    }

    await appendChatMessage(charName, '我', text);

    const settings = loadWxSettings();
    const injectContent = buildInjectContent(charName, settings);
    const reply = await callGenerateReply(injectContent, text, settings);

    await appendChatMessage(charName, charName, reply);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
