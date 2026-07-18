<template>
  <div v-if="data" class="daoyuan ink-canvas" :class="{ collapsed }">
    <TopBar :world="data.世界" :update-status="updateStatus" :mandatory-updates="mandatoryUpdates" v-model:collapsed="collapsed" @open-settings="settingsOpen = true" />
    <ProtagonistPanel
      v-show="!collapsed"
      :p="data.主角"
      :fairy-lines="data.$器灵台词 ?? []"
      v-model:tabs-collapsed="tabsCollapsed"
    />

    <!-- 收起标签后：展开通栏 -->
    <button
      v-show="!collapsed && tabsCollapsed"
      class="tabs-expand-bar"
      type="button"
      @click="tabsCollapsed = false"
    >
      <Icon name="chevron-down" :size="12" />
      <span>展开标签</span>
    </button>

    <!-- 标签栏 -->
    <nav v-show="!collapsed && !tabsCollapsed" class="tabnav">
      <button
        v-for="t in visibleTabs"
        :key="t.key"
        class="tab"
        :class="{ active: active === t.key }"
        type="button"
        @click="active = t.key"
      >
        <Icon :name="t.icon" :size="13" />
        <span>{{ t.label }}</span>
        <span v-if="t.count > 0" class="tab-count">{{ t.count }}</span>
      </button>
    </nav>

    <!-- 标签内容 -->
    <div ref="tabbodyRef" v-show="!collapsed && !tabsCollapsed" class="tabbody">
      <Transition name="fade" mode="out-in">
        <GongfaPanel v-if="active === 'gongfa'" key="gongfa" :功法="data.主角.功法" />
        <CraftPanel v-else-if="active === 'craft'" key="craft" :炼丹="data.主角.炼丹" :炼器="data.主角.炼器" />
        <NpcPanel v-else-if="active === 'npc'" key="npc" :人物="data.人物" />
        <PetPanel v-else-if="active === 'pet'" key="pet" :灵宠="data.灵宠" />
        <DaolvPanel v-else-if="active === 'daolv'" key="daolv" :道侣="data.道侣" />
        <OpportunityPanel v-else-if="active === 'opp'" key="opp" :机遇="data.机遇" />
        <BeautyRankPanel v-else-if="active === 'beauty'" key="beauty" :绝色榜="data.绝色榜" />
        <TrendsPanel v-else-if="active === 'trends'" key="trends" :动向="data.世界.动向" />
        <YujianPanel v-else-if="active === 'yujian'" key="yujian" :玉简="data.玉简" />
        <InventoryPanel v-else-if="active === 'inv'" key="inv" :储物袋="data.主角.储物袋" />
        <ArtifactsPanel v-else-if="active === 'artifacts'" key="artifacts" :器物="data.主角.器物" />
        <MapPanel v-else-if="active === 'map'" key="map" />
        <ZongmenPanel v-else-if="active === 'zongmen'" key="zongmen" :宗门="data.宗门" :主角="data.主角" />
      </Transition>
    </div>
  </div>

  <div v-else class="daoyuan ink-canvas loading">
    <Icon name="taiji" :size="28" class="spin" />
    <span>正在凝神聚气·读取道途…</span>
  </div>

  <SettingsModal
    v-if="settingsOpen"
    :settings="settings"
    @close="settingsOpen = false"
    @save="onSaveSettings"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from './store';
import Icon from './components/Icon.vue';
import TopBar from './components/TopBar.vue';
import ProtagonistPanel from './components/ProtagonistPanel.vue';
import GongfaPanel from './components/GongfaPanel.vue';
import CraftPanel from './components/CraftPanel.vue';
import NpcPanel from './components/NpcPanel.vue';
import OpportunityPanel from './components/OpportunityPanel.vue';
import TrendsPanel from './components/TrendsPanel.vue';
import BeautyRankPanel from './components/BeautyRankPanel.vue';
import InventoryPanel from './components/InventoryPanel.vue';
import DaolvPanel from './components/DaolvPanel.vue';
import PetPanel from './components/PetPanel.vue';
import YujianPanel from './components/YujianPanel.vue';
import ArtifactsPanel from './components/ArtifactsPanel.vue';
import MapPanel from './components/MapPanel.vue';
import ZongmenPanel from './components/ZongmenPanel.vue';
import SettingsModal from './components/SettingsModal.vue';
import { loadSettings, saveSettings, isTabEnabled, type StatusbarSettings } from './settingsService';
const store = useDataStore();
const { data, updateStatus, mandatoryUpdates } = storeToRefs(store);

const active = ref<string>('gongfa');
const tabbodyRef = ref<HTMLElement | null>(null);
const settings = ref<StatusbarSettings>(loadSettings());
const settingsOpen = ref(false);
const collapsed = ref(settings.value.defaultCollapsed);
const tabsCollapsed = ref(settings.value.defaultTabsCollapsed);

interface Tab {
  key: string;
  label: string;
  icon: string;
  show: boolean;
  count: number;
}

const tabs = computed<Tab[]>(() => {
  const d = data.value;
  if (!d) return [];
  const on = (key: string) => isTabEnabled(settings.value, key);
  const len = (v: unknown) => _.isObject(v) ? Object.keys(v).length : 0;
  return [
    { key: 'gongfa', label: '功法', icon: 'scroll', show: on('gongfa'), count: len(d.主角.功法) },
    { key: 'craft', label: '副业', icon: 'flask', show: on('craft'), count: len(d.主角.炼丹) + len(d.主角.炼器) },
    { key: 'npc', label: '人物', icon: 'person', show: on('npc'), count: len(d.人物) },
    { key: 'pet', label: '灵宠', icon: 'spirit', show: on('pet'), count: len(d.灵宠) },
    { key: 'daolv', label: '道侣', icon: 'crane', show: on('daolv'), count: len(d.道侣) },
    { key: 'opp', label: '机遇', icon: 'door', show: on('opp'), count: len(d.机遇) },
    { key: 'beauty', label: '绝色榜', icon: 'flower', show: on('beauty'), count: len(d.绝色榜) },
    { key: 'trends', label: '动向', icon: 'wind', show: on('trends'), count: len(d.世界.动向) },
    { key: 'yujian', label: '玉简', icon: 'scroll', show: on('yujian'), count: len(d.玉简) },
    { key: 'inv', label: '储物', icon: 'bag', show: on('inv'), count: len(d.主角.储物袋) },
    { key: 'artifacts', label: '器物', icon: 'gem', show: on('artifacts'), count: len(d.主角.器物) },
    { key: 'map', label: '地图', icon: 'mountain', show: on('map'), count: 0 },
    { key: 'zongmen', label: '宗门', icon: 'fortress', show: on('zongmen'), count: d.宗门 ? 1 : 0 },
  ];
});

const visibleTabs = computed(() => tabs.value.filter(t => t.show));

// 当前标签被隐藏时，回退到第一个可见标签
watch(
  visibleTabs,
  vt => {
    if (vt.length && !vt.some(t => t.key === active.value)) {
      active.value = vt[0].key;
    }
  },
  { immediate: true },
);

// 切换标签时重置内容区滚动位置，避免残留滚动导致新内容显示空白
watch(active, () => {
  nextTick(() => {
    if (tabbodyRef.value) tabbodyRef.value.scrollTop = 0;
  });
});

function onSaveSettings(newSettings: StatusbarSettings) {
  settings.value = newSettings;
  saveSettings(newSettings);
  settingsOpen.value = false;
}
</script>

<style lang="scss" scoped>
.daoyuan {
  width: 100%;
  aspect-ratio: auto;
  max-height: 1400px;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  padding: 0.7em;
  color: var(--c-text);
  border: 1px solid var(--c-border-gold);
  border-radius: 6px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(0, 0, 0, 0.4);
  box-sizing: border-box;

  &.collapsed {
    aspect-ratio: auto;
    max-height: none;
    min-height: 0;
    gap: 0;
  }
}

.loading {
  align-items: center;
  justify-content: center;
  gap: 0.8em;
  color: var(--c-text-muted);
  font-style: italic;

  .spin {
    color: var(--c-primary);
    animation: spin 2.4s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tabnav {
  display: flex;
  gap: 0.2em;
  padding: 0.25em;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--c-border);
  border-radius: 4px;
  flex-wrap: wrap;
  flex-shrink: 0;

  .tab {
    flex: 1 1 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3em;
    padding: 0.3em 0.5em;
    font-family: inherit;
    font-size: 0.8em;
    color: var(--c-text-muted);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
    letter-spacing: 0.04em;

    &:hover {
      color: var(--c-text);
    }
    &.active {
      color: var(--c-primary);
      border-bottom-color: var(--c-primary);
      background: linear-gradient(180deg, rgba(216, 193, 136, 0.1), transparent);
    }

    .tab-count {
      font-size: 0.72em;
      font-weight: 600;
      color: var(--c-primary);
      background: rgba(216, 193, 136, 0.12);
      border-radius: 8px;
      padding: 0.05em 0.4em;
      min-width: 1.2em;
      text-align: center;
      line-height: 1.4;
    }
  }
}

.tabbody {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.2em;
}

.tabs-expand-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
  width: 100%;
  padding: 0.5em;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--c-border);
  border-radius: 4px;
  color: var(--c-text-muted);
  font-family: inherit;
  font-size: 0.8em;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;

  &:hover {
    color: var(--c-primary);
    border-color: var(--c-border-gold);
    background: rgba(216, 193, 136, 0.06);
  }
}

/* —— 窄屏（手机）适配 —— */
@media (max-width: 520px) {
  .daoyuan {
    /* 内容驱动高度 + max-height 上限：内容少时随主角面板，多时不超过屏幕 */
    max-height: 80em;
    gap: 0.5em;
    padding: 0.6em;
  }

  .tabnav {
    flex-wrap: nowrap;
    flex-shrink: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 0.2em;

    &::-webkit-scrollbar {
      display: none;
    }

    .tab {
      flex: 0 0 auto;
      padding: 0.5em 0.75em;
      font-size: 0.85em;
    }
  }

  .tabbody {
    /* 内容驱动高度，超出滚动；不再强制 min-height */
    flex: 1 1 auto;
    min-height: 0;
  }
}
</style>
