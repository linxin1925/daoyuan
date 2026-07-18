<template>
  <div class="fm-overlay" @click.self="$emit('close')">
    <div class="fm-modal">
      <header class="fm-head">
        <Icon name="gear" :size="14" class="fm-head-icon" />
        <span class="fm-title">群芳谱·论坛设定</span>
        <button class="fm-close" type="button" @click="$emit('close')">
          <Icon name="close" :size="14" />
        </button>
      </header>

      <div class="fm-body">
        <!-- 预设 -->
        <section class="fm-section">
          <div class="fm-section-title">传讯预设</div>
          <div class="fm-preset-row">
            <select v-model="presetSelected" class="fm-select">
              <option value="">-- 当前手动配置 --</option>
              <option v-for="name in presetNames" :key="name" :value="name">{{ name }}</option>
            </select>
            <button type="button" class="fm-btn" :disabled="!presetSelected" @click="onApplyPreset">应用</button>
            <button type="button" class="fm-btn" @click="onSavePreset">另存</button>
            <button type="button" class="fm-btn fm-btn-danger" :disabled="!presetSelected" @click="onDeletePreset">删除</button>
          </div>
        </section>

        <!-- API 配置 -->
        <section class="fm-section">
          <div class="fm-section-title">
            自定义 API 配置
            <span class="fm-hint">(兼容 OpenAI，留空用酒馆内建生成)</span>
          </div>
          <label class="fm-label">基础 URL</label>
          <input v-model="settings.apiBaseUrl" class="fm-input" placeholder="https://api.xxx.xxx/v1" />
          <label class="fm-label">API 密钥</label>
          <input v-model="settings.apiKey" type="password" class="fm-input" placeholder="sk-..." />
          <label class="fm-label">模型</label>
          <div class="fm-model-row">
            <input v-model="settings.apiModel" class="fm-input" placeholder="gpt-4o / deepseek-chat ..." />
            <button type="button" class="fm-btn fm-btn-sm" :disabled="!canFetch || fetching" @click="onFetchModels">
              {{ fetching ? '获取中…' : '获取模型列表' }}
            </button>
          </div>
          <div v-if="modelList.length" class="fm-model-select-row">
            <select v-model="modelSelectValue" class="fm-select">
              <option value="">-- 从列表选择 --</option>
              <option v-for="m in modelList" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </section>

        <!-- 自定义提示词 -->
        <section class="fm-section">
          <div class="fm-section-title">回复指引 (自定义提示词)</div>
          <textarea
            v-model="settings.customPrompt"
            class="fm-textarea"
            rows="3"
            placeholder="给匿名道友回复的额外指引，例如语气偏好、禁忌话题..."
          ></textarea>
        </section>
      </div>

      <footer class="fm-foot">
        <button type="button" class="fm-btn fm-btn-primary" @click="onSave">
          <Icon name="save" :size="12" /> 保存
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Icon from './Icon.vue';
import {
  loadForumSettings,
  saveForumSettings,
  loadForumPresets,
  saveForumAsPreset,
  applyForumPreset,
  deleteForumPreset,
  fetchForumModels,
  type ForumSettings,
} from '../services/forumService';

const $emit = defineEmits<{ close: [] }>();

const settings = ref<ForumSettings>({ customPrompt: '', apiBaseUrl: '', apiKey: '', apiModel: '' });
const presets = ref<Record<string, ForumSettings>>({});
const presetSelected = ref('');

const fetching = ref(false);
const modelList = ref<string[]>([]);

const presetNames = computed(() => Object.keys(presets.value));
const canFetch = computed(() => !!(settings.value.apiBaseUrl.trim() && settings.value.apiKey.trim()));

const modelSelectValue = computed({
  get: () => (modelList.value.includes(settings.value.apiModel) ? settings.value.apiModel : ''),
  set: (v: string) => { settings.value.apiModel = v; },
});

async function onFetchModels() {
  if (!canFetch.value || fetching.value) return;
  fetching.value = true;
  try {
    modelList.value = await fetchForumModels(settings.value);
    if (typeof toastr !== 'undefined') {
      if (modelList.value.length) toastr.success(`获取到 ${modelList.value.length} 个模型`);
      else toastr.warning('模型列表为空');
    }
  } catch (e) {
    if (typeof toastr !== 'undefined') toastr.error(e instanceof Error ? e.message : String(e));
  } finally {
    fetching.value = false;
  }
}

function onSave() {
  saveForumSettings({ ...settings.value });
  if (typeof toastr !== 'undefined') toastr.success('论坛设定已保存');
  $emit('close');
}

function onSavePreset() {
  const name = prompt('请输入预设名称：\n(若名称已存在将覆盖)');
  if (!name) return;
  saveForumAsPreset(name, { ...settings.value });
  presets.value = loadForumPresets();
  presetSelected.value = name;
}

function onApplyPreset() {
  if (!presetSelected.value) return;
  const p = applyForumPreset(presetSelected.value);
  if (p) settings.value = { ...p };
}

function onDeletePreset() {
  if (!presetSelected.value) return;
  if (!confirm(`删除预设「${presetSelected.value}」？`)) return;
  deleteForumPreset(presetSelected.value);
  presets.value = loadForumPresets();
  presetSelected.value = '';
}

onMounted(() => {
  settings.value = loadForumSettings();
  presets.value = loadForumPresets();
});
</script>

<style lang="scss" scoped>
.fm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0.6em;
}

.fm-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg-panel, #1a181d);
  border: 1px solid var(--c-border-gold, #6b5a3a);
  border-radius: 4px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
}

.fm-head {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.55em 0.7em;
  border-bottom: 1px solid var(--c-border);
  background: rgba(216, 193, 136, 0.06);
}

.fm-head-icon { color: var(--c-primary); }

.fm-title {
  flex: 1;
  color: var(--c-text);
  font-size: 0.92em;
  letter-spacing: 0.04em;
}

.fm-close {
  background: transparent;
  border: none;
  color: var(--c-text-muted);
  cursor: pointer;
  padding: 0.1em;
  display: inline-flex;
  &:hover { color: var(--c-text); }
}

.fm-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.6em 0.7em;
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}

.fm-section { display: flex; flex-direction: column; gap: 0.3em; }
.fm-section-title { color: var(--c-primary); font-size: 0.84em; font-weight: bold; letter-spacing: 0.03em; }
.fm-hint { color: var(--c-text-dim); font-size: 0.86em; font-weight: normal; }
.fm-label { font-size: 0.76em; color: var(--c-text-dim); margin-top: 0.15em; }

.fm-input, .fm-select, .fm-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.35em 0.5em;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  color: var(--c-text);
  font-size: 0.84em;
  font-family: inherit;
  &:focus { outline: none; border-color: var(--c-primary-dim); }
}

.fm-textarea { resize: vertical; line-height: 1.5; }

.fm-preset-row, .fm-model-row {
  display: flex;
  gap: 0.35em;
  .fm-input, .fm-select { flex: 1; min-width: 0; }
}

.fm-model-select-row { margin-top: 0.3em; }

.fm-btn {
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
  flex-shrink: 0;
  &:hover:not(:disabled) { border-color: var(--c-primary-dim); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.fm-btn-sm { font-size: 0.72em; padding: 0.2em 0.5em; }
.fm-btn-primary { background: linear-gradient(135deg, var(--c-primary, #d8c188), #b89a5a); color: #1a181d; border-color: var(--c-primary); font-weight: bold; }
.fm-btn-danger { &:hover:not(:disabled) { border-color: var(--c-danger, #c4665b); color: var(--c-danger); } }

.fm-foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.4em;
  padding: 0.55em 0.7em;
  border-top: 1px solid var(--c-border);
}
</style>
