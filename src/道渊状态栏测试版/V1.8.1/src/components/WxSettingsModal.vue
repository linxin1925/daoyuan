<template>
  <div class="wx-modal-overlay" @click.self="$emit('close')">
    <div class="wx-modal">
      <header class="wx-modal-head">
        <Icon name="gear" :size="14" class="wx-head-icon" />
        <span class="wx-modal-title">玉简设定</span>
        <button class="wx-modal-close" type="button" @click="$emit('close')">
          <Icon name="close" :size="14" />
        </button>
      </header>

      <div class="wx-modal-body">
        <!-- 预设 -->
        <section class="wx-section">
          <div class="wx-section-title">传讯预设</div>
          <div class="wx-preset-row">
            <select v-model="presetSelected" class="wx-select">
              <option value="">-- 当前手动配置 --</option>
              <option v-for="name in presetNames" :key="name" :value="name">{{ name }}</option>
            </select>
            <button type="button" class="wx-btn" :disabled="!presetSelected" @click="onApplyPreset">应用</button>
            <button type="button" class="wx-btn" @click="onSavePreset">另存</button>
            <button type="button" class="wx-btn wx-btn-danger" :disabled="!presetSelected" @click="onDeletePreset">删除</button>
          </div>
        </section>

        <!-- API 配置 -->
        <section class="wx-section">
          <div class="wx-section-title">
            自定义 API 配置
            <span class="wx-section-hint">(兼容 OpenAI，留空用酒馆内建生成)</span>
          </div>
          <label class="wx-label">基础 URL (Endpoint)</label>
          <input v-model="settings.apiBaseUrl" class="wx-input" placeholder="https://api.xxx.xxx/v1" />
          <label class="wx-label">API 密钥 (API Key)</label>
          <input v-model="settings.apiKey" type="password" class="wx-input" placeholder="sk-..." />
          <label class="wx-label">模型 (Model)</label>
          <div class="wx-model-row">
            <input v-model="settings.apiModel" class="wx-input" placeholder="gpt-4o / deepseek-chat ..." />
            <button
              type="button"
              class="wx-btn wx-btn-sm"
              :disabled="!canFetchModels || fetchingModels"
              @click="onFetchModels"
            >
              {{ fetchingModels ? '获取中…' : '获取模型列表' }}
            </button>
          </div>
          <div v-if="modelOptions.length" class="wx-model-select-row">
            <select v-model="modelSelectValue" class="wx-select">
              <option value="">-- 从列表选择模型 --</option>
              <option v-for="m in modelOptions" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="wx-model-hint">建议使用 Flash 模型（响应快、成本低，适合玉简传讯的短对话）</div>
        </section>

        <!-- 世界书 -->
        <section class="wx-section">
          <div class="wx-section-title">
            角色知识注入 (世界书)
            <span class="wx-section-hint">({{ loreEntries.length }} 条，按联系人独立勾选)</span>
          </div>
          <div class="wx-lore-char-row">
            <label class="wx-label">应用联系人</label>
            <select v-model="loreCharName" class="wx-select">
              <option v-for="name in contactNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
          <div v-if="loreCharName && selectedLoreEntries.length" class="wx-lore-selected">
            <div class="wls-head">
              <span class="wls-title">已勾选 {{ selectedLoreEntries.length }} 条</span>
              <button type="button" class="wls-clear" @click="deselectAllLore">全部取消</button>
            </div>
            <div class="wls-tags">
              <span v-for="e in selectedLoreEntries" :key="e.uid" class="wls-tag" :title="e.content.slice(0, 80)">
                {{ e.name }}
                <button type="button" class="wls-remove" @click="toggleLore(e.uid)">×</button>
              </span>
            </div>
          </div>
          <div v-if="loreCharName" class="wx-search-row">
            <Icon name="search" :size="12" class="wx-search-icon" />
            <input v-model="loreFilter" class="wx-input wx-search" placeholder="搜索条目名称或内容..." />
          </div>
          <!-- 世界书条目列表 -->
          <div v-if="loreCharName" class="wx-lore-list">
            <div v-if="!loreFilter" class="wx-lore-toolbar">
              <button type="button" class="wx-btn wx-btn-sm" @click="selectAllLore">全选所有</button>
              <button type="button" class="wx-btn wx-btn-sm" @click="deselectAllLore">取消全选</button>
              <button type="button" class="wx-btn wx-btn-sm" @click="expandAllGroups">展开全部</button>
              <button type="button" class="wx-btn wx-btn-sm" @click="collapseAllGroups">折叠全部</button>
            </div>
            <div v-if="loreFilter && !filteredLore.length" class="wx-lore-empty">
              无匹配条目
            </div>
            <div v-if="!loreEntries.length" class="wx-lore-empty">
              当前角色卡无世界书条目
            </div>
            <!-- 搜索模式：平铺 -->
            <template v-if="loreFilter">
              <div v-for="e in filteredLore" :key="e.uid" class="wx-lore-item">
                <label class="wx-lore-label">
                  <input type="checkbox" :checked="selectedUids.has(e.uid)" @change="toggleLore(e.uid)" />
                  <span class="wx-lore-name" :title="e.name">{{ e.name }}</span>
                  <button v-if="e.content" type="button" class="wx-lore-toggle" @click="toggleExpand(e.uid)">
                    <Icon :name="expandedUid === e.uid ? 'chevron-left' : 'chevron-right'" :size="10" />
                  </button>
                </label>
                <div v-if="expandedUid === e.uid && e.content" class="wx-lore-content">{{ e.content }}</div>
              </div>
            </template>
            <!-- 分组模式：折叠面板 -->
            <template v-else>
              <div v-for="group in groupedLore" :key="group.key" class="wx-lore-group">
                <button type="button" class="wx-lore-group-head" @click="toggleGroup(group.key)">
                  <Icon :name="collapsedGroups.has(group.key) ? 'chevron-right' : 'chevron-down'" :size="10" class="wx-group-arrow" />
                  <span class="wx-lore-group-name">{{ group.key }}</span>
                  <span class="wx-lore-group-stat">{{ group.checked }}/{{ group.count }}</span>
                  <button type="button" class="wx-lore-group-check" @click.stop="toggleGroupAll(group.key)">
                    {{ group.allChecked ? '取消' : '全选' }}
                  </button>
                </button>
                <div v-if="!collapsedGroups.has(group.key)" class="wx-lore-group-body">
                  <div v-for="e in group.entries" :key="e.uid" class="wx-lore-item">
                    <label class="wx-lore-label">
                      <input type="checkbox" :checked="selectedUids.has(e.uid)" @change="toggleLore(e.uid)" />
                      <span class="wx-lore-name" :title="e.name">{{ e.displayName }}</span>
                      <button v-if="e.content" type="button" class="wx-lore-toggle" @click="toggleExpand(e.uid)">
                        <Icon :name="expandedUid === e.uid ? 'chevron-left' : 'chevron-right'" :size="10" />
                      </button>
                    </label>
                    <div v-if="expandedUid === e.uid && e.content" class="wx-lore-content">{{ e.content }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- 自定义提示词 -->
        <section class="wx-section">
          <div class="wx-section-title">传讯指引 (自定义提示词)</div>
          <textarea
            v-model="settings.customPrompt"
            class="wx-textarea"
            rows="3"
            placeholder="给 NPC 回复的额外指引，例如语气、风格、禁忌..."
          ></textarea>
        </section>
      </div>

      <footer class="wx-modal-foot">
        <button type="button" class="wx-btn wx-btn-primary" @click="onSave">
          <Icon name="save" :size="12" /> 保存
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Icon from './Icon.vue';
import {
  loadWxSettings,
  saveWxSettings,
  loadPresets,
  saveAsPreset,
  applyPreset,
  deletePreset,
  fetchCharLorebooks,
  getLoreSelected,
  saveWxLore,
  fetchModels,
  type WxSettings,
  type LoreEntry,
} from '../wxService';

interface LoreGroup {
  key: string;
  entries: LoreEntry[];
  count: number;
  checked: number;
  allChecked: boolean;
}

const props = defineProps<{ contactNames: string[] }>();
const $emit = defineEmits<{ close: [] }>();

const settings = ref<WxSettings>({ customPrompt: '', apiBaseUrl: '', apiKey: '', apiModel: '' });
const loreEntries = ref<LoreEntry[]>([]);
const selectedUids = ref<Set<string>>(new Set());
const loreFilter = ref('');
const expandedUid = ref<string | null>(null);
const presets = ref<Record<string, WxSettings>>({});
const presetSelected = ref('');
const loreCharName = ref('');
const collapsedGroups = ref<Set<string>>(new Set());

const presetNames = computed(() => Object.keys(presets.value));

/* ---------- 模型列表获取 ---------- */
const fetchingModels = ref(false);
const modelOptions = ref<string[]>([]);

const canFetchModels = computed(
  () => !!(settings.value.apiBaseUrl.trim() && settings.value.apiKey.trim()),
);

const modelSelectValue = computed({
  get: () => (modelOptions.value.includes(settings.value.apiModel) ? settings.value.apiModel : ''),
  set: (v: string) => {
    settings.value.apiModel = v;
  },
});

async function onFetchModels() {
  if (!canFetchModels.value || fetchingModels.value) return;
  fetchingModels.value = true;
  try {
    const list = await fetchModels(settings.value);
    modelOptions.value = list;
    if (typeof toastr !== 'undefined') {
      if (list.length) toastr.success(`获取到 ${list.length} 个模型`);
      else toastr.warning('模型列表为空');
    }
  } catch (e) {
    if (typeof toastr !== 'undefined') {
      toastr.error(e instanceof Error ? e.message : String(e));
    }
  } finally {
    fetchingModels.value = false;
  }
}

/** 统一冒号格式 */
function normalizeColon(s: string): string {
  return s.replace(/：/g, ':');
}

/** 提取条目分组键（名称中 : 前的部分，无分隔符则为 "其他"） */
function groupKeyOf(name: string): string {
  const m = normalizeColon(name).match(/^(.+?):/);
  return m ? m[1].trim() : '其他';
}

/** 条目在分组内的显示名称（去掉前缀和冒号） */
function displayNameOf(name: string, groupKey: string): string {
  if (groupKey === '其他') return name;
  const m = normalizeColon(name).match(/^(.+?):\s*/);
  if (m) return name.slice(m[0].length).trim();
  return name;
}

const filteredLore = computed(() => {
  const ft = loreFilter.value.trim().toLowerCase();
  if (!ft) return loreEntries.value;
  return loreEntries.value.filter(
    e => e.name.toLowerCase().includes(ft) || e.content.toLowerCase().includes(ft),
  );
});

/** 分组后的条目（搜索为空时使用） */
const groupedLore = computed<LoreGroup[]>(() => {
  const map = new Map<string, LoreEntry[]>();
  for (const e of loreEntries.value) {
    const key = groupKeyOf(e.name);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ ...e, displayName: displayNameOf(e.name, key) } as LoreEntry & { displayName: string });
  }
  const groups: LoreGroup[] = [];
  for (const [key, entries] of map) {
    entries.sort((a, b) => (a as any).displayName.localeCompare((b as any).displayName, 'zh'));
    const checked = entries.filter(e => selectedUids.value.has(e.uid)).length;
    groups.push({ key, entries, count: entries.length, checked, allChecked: checked === entries.length });
  }
  groups.sort((a, b) => a.key.localeCompare(b.key, 'zh'));
  return groups;
});

const selectedLoreEntries = computed(() => {
  return loreEntries.value.filter(e => selectedUids.value.has(e.uid));
});

function toggleLore(uid: string) {
  const s = new Set(selectedUids.value);
  if (s.has(uid)) s.delete(uid);
  else s.add(uid);
  selectedUids.value = s;
  saveSelected(s);
}

function saveSelected(s: Set<string>) {
  const selected = loreEntries.value
    .filter(e => s.has(e.uid))
    .map(e => ({ uid: e.uid, content: e.content }));
  saveWxLore(loreCharName.value, selected);
}

function toggleGroupAll(groupKey: string) {
  const group = groupedLore.value.find(g => g.key === groupKey);
  if (!group) return;
  const s = new Set(selectedUids.value);
  if (group.allChecked) {
    for (const e of group.entries) s.delete(e.uid);
  } else {
    for (const e of group.entries) s.add(e.uid);
  }
  selectedUids.value = s;
  saveSelected(s);
}

function selectAllLore() {
  const s = new Set(selectedUids.value);
  const entries = loreFilter.value ? filteredLore.value : loreEntries.value;
  for (const e of entries) s.add(e.uid);
  selectedUids.value = s;
  saveSelected(s);
}

function deselectAllLore() {
  if (selectedLoreEntries.value.length && !confirm(`清空「${loreCharName.value}」的所有勾选？`)) return;
  selectedUids.value = new Set();
  saveSelected(new Set());
}

function toggleGroup(key: string) {
  const s = new Set(collapsedGroups.value);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  collapsedGroups.value = s;
}

function expandAllGroups() {
  collapsedGroups.value = new Set();
}

function collapseAllGroups() {
  collapsedGroups.value = new Set(groupedLore.value.map(g => g.key));
}

function loadLoreForChar(name: string) {
  if (!name) {
    selectedUids.value = new Set();
    return;
  }
  selectedUids.value = new Set(getLoreSelected(name).map(d => d.uid));
}

function toggleExpand(uid: string) {
  expandedUid.value = expandedUid.value === uid ? null : uid;
}

function onSavePreset() {
  const name = prompt('请输入预设名称：\n(若名称已存在将覆盖原预设)');
  if (!name) return;
  saveAsPreset(name, { ...settings.value });
  presets.value = loadPresets();
  presetSelected.value = name;
}

function onApplyPreset() {
  if (!presetSelected.value) return;
  const p = applyPreset(presetSelected.value);
  if (p) settings.value = { ...p };
}

function onDeletePreset() {
  if (!presetSelected.value) return;
  if (!confirm(`删除预设「${presetSelected.value}」？`)) return;
  deletePreset(presetSelected.value);
  presets.value = loadPresets();
  presetSelected.value = '';
}

function onSave() {
  saveWxSettings({ ...settings.value });
  if (loreCharName.value) {
    const selected = loreEntries.value
      .filter(e => selectedUids.value.has(e.uid))
      .map(e => ({ uid: e.uid, content: e.content }));
    saveWxLore(loreCharName.value, selected);
  }
  if (typeof toastr !== 'undefined') toastr.success('玉简设定已保存');
  $emit('close');
}

onMounted(async () => {
  settings.value = loadWxSettings();
  presets.value = loadPresets();
  try {
    loreEntries.value = await fetchCharLorebooks();
  } catch {
    loreEntries.value = [];
  }
  if (props.contactNames.length) {
    loreCharName.value = props.contactNames[0];
    loadLoreForChar(loreCharName.value);
  }
});

watch(loreCharName, name => {
  loreFilter.value = '';
  expandedUid.value = null;
  collapsedGroups.value = new Set();
  loadLoreForChar(name);
});
</script>

<style lang="scss" scoped>
.wx-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0.6em;
}

.wx-modal {
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg-panel, #1a181d);
  border: 1px solid var(--c-border-gold, #6b5a3a);
  border-radius: 4px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
}

.wx-modal-head {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.55em 0.7em;
  border-bottom: 1px solid var(--c-border);
  background: rgba(216, 193, 136, 0.06);

  .wx-head-icon {
    color: var(--c-primary);
  }
  .wx-modal-title {
    flex: 1;
    color: var(--c-text);
    font-size: 0.92em;
    letter-spacing: 0.04em;
  }
  .wx-modal-close {
    background: transparent;
    border: none;
    color: var(--c-text-muted);
    cursor: pointer;
    padding: 0.1em;
    display: inline-flex;
    &:hover {
      color: var(--c-text);
    }
  }
}

.wx-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.6em 0.7em;
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}

.wx-section {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}

.wx-section-title {
  color: var(--c-primary);
  font-size: 0.84em;
  font-weight: bold;
  letter-spacing: 0.03em;
}

.wx-section-hint {
  color: var(--c-text-dim);
  font-size: 0.86em;
  font-weight: normal;
}

.wx-label {
  font-size: 0.76em;
  color: var(--c-text-dim);
  margin-top: 0.15em;
}

.wx-input,
.wx-select,
.wx-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.35em 0.5em;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  color: var(--c-text);
  font-size: 0.84em;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--c-primary-dim, #8a7a4a);
  }
}

.wx-textarea {
  resize: vertical;
  line-height: 1.5;
}

.wx-model-row {
  display: flex;
  gap: 0.35em;

  .wx-input {
    flex: 1;
    min-width: 0;
  }
  .wx-btn-sm {
    flex-shrink: 0;
  }
}

.wx-model-select-row {
  margin-top: 0.3em;
}

.wx-model-hint {
  margin-top: 0.3em;
  font-size: 0.74em;
  color: var(--c-warn, #d9a441);
  letter-spacing: 0.02em;
  line-height: 1.5;
}

.wx-preset-row {
  display: flex;
  gap: 0.35em;

  .wx-select {
    flex: 1;
    min-width: 0;
  }
}

.wx-search-row {
  position: relative;
  display: flex;
  align-items: center;

  .wx-search-icon {
    position: absolute;
    left: 0.45em;
    color: var(--c-text-dim);
    pointer-events: none;
  }
  .wx-search {
    padding-left: 1.6em;
  }
}

.wx-lore-selected {
  background: rgba(168, 136, 212, 0.08);
  border: 1px solid rgba(168, 136, 212, 0.3);
  border-radius: 3px;
  padding: 0.4em 0.5em;
}

.wls-head {
  display: flex;
  align-items: center;
  margin-bottom: 0.35em;
  font-size: 0.78em;

  .wls-title {
    flex: 1;
    color: var(--c-luck);
    font-weight: bold;
  }
  .wls-clear {
    background: transparent;
    border: 1px solid var(--c-border);
    color: var(--c-text-dim);
    font-size: 0.84em;
    padding: 0.05em 0.4em;
    border-radius: 2px;
    cursor: pointer;
    font-family: inherit;
    &:hover { color: var(--c-danger); border-color: var(--c-danger); }
  }
}

.wls-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3em;
}

.wls-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  font-size: 0.74em;
  padding: 0.15em 0.4em;
  background: rgba(168, 136, 212, 0.14);
  border: 1px solid rgba(168, 136, 212, 0.4);
  border-radius: 2px;
  color: var(--c-text);
  max-width: 100%;
  cursor: default;

  .wls-remove {
    background: transparent;
    border: none;
    color: var(--c-text-dim);
    cursor: pointer;
    font-size: 1.1em;
    line-height: 1;
    padding: 0;
    &:hover { color: var(--c-danger); }
  }
}

.wx-lore-char-row {
  display: flex;
  align-items: center;
  gap: 0.5em;

  .wx-label {
    margin-top: 0;
    flex-shrink: 0;
  }
  .wx-select {
    flex: 1;
    min-width: 0;
  }
}

.wx-lore-list {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  max-height: 440px;
  overflow-y: auto;
  padding-right: 0.2em;
}

/* 工具栏 */
.wx-lore-toolbar {
  display: flex;
  gap: 0.3em;
  padding-bottom: 0.35em;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 0.15em;
}

.wx-btn-sm {
  font-size: 0.72em;
  padding: 0.2em 0.5em;
}

/* 分组 */
.wx-lore-group {
  display: flex;
  flex-direction: column;
}

.wx-lore-group-head {
  display: flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.3em 0.4em;
  background: rgba(216, 193, 136, 0.08);
  border: 1px solid rgba(216, 193, 136, 0.2);
  border-radius: 3px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.78em;
  color: var(--c-text);
  text-align: left;
  width: 100%;
  transition: background 0.15s;

  &:hover {
    background: rgba(216, 193, 136, 0.15);
  }

  .wx-group-arrow {
    flex-shrink: 0;
    color: var(--c-primary);
  }

  .wx-lore-group-name {
    flex: 1;
    font-weight: bold;
    color: var(--c-primary-dim, #8a7a4a);
  }

  .wx-lore-group-stat {
    font-size: 0.9em;
    color: var(--c-text-dim);
    font-variant-numeric: tabular-nums;
  }

  .wx-lore-group-check {
    flex-shrink: 0;
    font-size: 0.85em;
    padding: 0.1em 0.45em;
    background: rgba(0,0,0,0.25);
    border: 1px solid var(--c-border);
    border-radius: 3px;
    color: var(--c-text-muted);
    cursor: pointer;
    font-family: inherit;

    &:hover {
      color: var(--c-primary);
      border-color: var(--c-primary-dim);
    }
  }
}

.wx-lore-group-body {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
  padding: 0.25em 0 0.25em 1.2em;
}

.wx-lore-empty {
  color: var(--c-text-dim);
  font-size: 0.8em;
  font-style: italic;
  text-align: center;
  padding: 0.8em;
}

.wx-lore-item {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.wx-lore-label {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.35em 0.5em;
  cursor: pointer;
  margin: 0;
  font-size: 0.82em;
  color: var(--c-text);

  input[type='checkbox'] {
    cursor: pointer;
    flex-shrink: 0;
  }
  .wx-lore-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .wx-lore-toggle {
    background: transparent;
    border: none;
    color: var(--c-text-dim);
    cursor: pointer;
    padding: 0 0.2em;
    display: inline-flex;
  }
}

.wx-lore-content {
  padding: 0.4em 0.6em;
  font-size: 0.76em;
  line-height: 1.5;
  color: var(--c-text-muted);
  border-top: 1px solid var(--c-border);
  max-height: 120px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.wx-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.4em;
  padding: 0.55em 0.7em;
  border-top: 1px solid var(--c-border);
}

.wx-btn {
  padding: 0.3em 0.7em;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  color: var(--c-text);
  font-size: 0.8em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  font-family: inherit;

  &:hover:not(:disabled) {
    border-color: var(--c-primary-dim, #8a7a4a);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.wx-btn-primary {
  background: linear-gradient(135deg, var(--c-primary, #d8c188), #b89a5a);
  color: #1a181d;
  border-color: var(--c-primary, #d8c188);
  font-weight: bold;
}

.wx-btn-danger {
  &:hover:not(:disabled) {
    border-color: var(--c-danger, #c4665b);
    color: var(--c-danger, #c4665b);
  }
}
</style>
