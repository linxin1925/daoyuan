/**
 * 状态栏本地设置 — 折叠默认态 + 标签显示控制。
 *
 * 纯前端 localStorage 配置，与 MVU stat_data 无关，不参与变量更新。
 * 跨楼层 iframe 共享（同源 localStorage），一处设置处处生效。
 */

export interface StatusbarSettings {
  /** 标签栏初始态：true=默认收起(只留主角面板), false=默认展开 */
  defaultTabsCollapsed: boolean;
  /** 整体最小化初始态：true=默认折叠成细条, false=默认展开 */
  defaultCollapsed: boolean;
  /** 标签显示控制：key -> 是否显示。未设置/true 都显示，只有明确 false 才隐藏 */
  enabledTabs: Record<string, boolean>;
}

export interface TabDef {
  key: string;
  label: string;
  icon: string;
}

/** 全部标签定义（供设置弹窗和 App.vue 复用） */
export const TAB_DEFS: TabDef[] = [
  { key: 'gongfa', label: '功法', icon: 'scroll' },
  { key: 'craft', label: '副业', icon: 'flask' },
  { key: 'npc', label: '人物', icon: 'person' },
  { key: 'pet', label: '灵宠', icon: 'spirit' },
  { key: 'daolv', label: '道侣', icon: 'crane' },
  { key: 'opp', label: '机遇', icon: 'door' },
  { key: 'beauty', label: '绝色榜', icon: 'flower' },
  { key: 'trends', label: '动向', icon: 'wind' },
  { key: 'yujian', label: '玉简', icon: 'scroll' },
  { key: 'inv', label: '储物', icon: 'bag' },
  { key: 'artifacts', label: '器物', icon: 'gem' },
  { key: 'map', label: '地图', icon: 'mountain' },
];

const K = 'daoyuan_statusbar_settings';

const DEFAULT: StatusbarSettings = {
  defaultTabsCollapsed: true,
  defaultCollapsed: false,
  enabledTabs: {},
};

export function loadSettings(): StatusbarSettings {
  try {
    const s = JSON.parse(localStorage.getItem(K) || '{}');
    return {
      defaultTabsCollapsed: s.defaultTabsCollapsed ?? DEFAULT.defaultTabsCollapsed,
      defaultCollapsed: s.defaultCollapsed ?? DEFAULT.defaultCollapsed,
      enabledTabs: s.enabledTabs && typeof s.enabledTabs === 'object' ? s.enabledTabs : {},
    };
  } catch {
    return { ...DEFAULT, enabledTabs: {} };
  }
}

export function saveSettings(s: StatusbarSettings): void {
  localStorage.setItem(K, JSON.stringify(s));
}

/** 判断某标签是否被用户启用（未设置视为启用） */
export function isTabEnabled(settings: StatusbarSettings, key: string): boolean {
  return settings.enabledTabs[key] !== false;
}
