<template>
  <div class="portrait-modal-overlay" @click.self="$emit('close')">
    <div class="portrait-modal">
      <header class="portrait-modal-head">
        <span class="portrait-title">{{ charName }} 的立绘</span>
        <button class="portrait-close" type="button" @click="$emit('close')">
          <Icon name="close" :size="14" />
        </button>
      </header>

      <div class="portrait-modal-body">
        <div v-if="currentUrl" class="portrait-display">
          <img :src="currentUrl" :alt="charName" class="portrait-img" @error="onImgError" />
          <div v-if="imgError" class="portrait-img-err">立绘加载失败</div>
        </div>
        <div v-else class="portrait-img-err">暂无立绘</div>

        <div class="portrait-source">
          <span v-if="isCustom" class="src-tag custom">自定义</span>
          <span v-else-if="showSpecial" class="src-tag special">特殊</span>
          <span v-else-if="currentUrl" class="src-tag builtin">
            {{ showFemale ? '女版' : '内置' }}
            <template v-if="setCount > 1"> · {{ selectedSetIndex + 1 }}/{{ setCount }}</template>
          </span>
        </div>

        <!-- 多套立绘切换（换装/多表情） -->
        <div v-if="canSwitchSet" class="portrait-set-row">
          <button
            v-for="(url, idx) in portraitSets"
            :key="idx"
            type="button"
            class="portrait-set-thumb"
            :class="{ active: !showFemale && !showSpecial && idx === selectedSetIndex }"
            :title="`立绘 ${idx + 1}`"
            @click="selectSet(idx)"
          >
            <img :src="url" :alt="`立绘${idx + 1}`" @error="onThumbError($event, idx)" />
            <span v-if="thumbErrorSet.has(idx)" class="set-thumb-err">✕</span>
          </button>
        </div>

        <!-- 特殊立绘切换 -->
        <div v-if="canToggleSpecial" class="portrait-toggle-row">
          <button
            type="button"
            class="portrait-btn portrait-toggle-btn portrait-special-btn"
            :class="{ active: showSpecial }"
            @click="toggleSpecial"
          >
            <Icon name="star" :size="12" />
            <span>{{ showSpecial ? '当前：特殊立绘（点击切回）' : '查看特殊立绘' }}</span>
          </button>
        </div>
        <div v-else-if="hasNoSpecial" class="portrait-empty-hint">
          <Icon name="star" :size="12" />
          <span>特殊立绘：无</span>
        </div>

        <!-- 女版立绘切换 -->
        <div v-if="canToggleFemale" class="portrait-toggle-row">
          <button
            type="button"
            class="portrait-btn portrait-toggle-btn"
            :class="{ active: showFemale }"
            @click="toggleFemale"
          >
            <Icon name="lotus" :size="12" />
            <span>{{ showFemale ? '当前：女版立绘（点击切回）' : '切换到女版立绘' }}</span>
          </button>
        </div>

        <!-- 自定义立绘操作 -->
        <div class="portrait-custom-area">
          <label class="portrait-file-label">
            <Icon name="plus" :size="12" />
            <span>选择本地图片</span>
            <input
              type="file"
              accept="image/*"
              class="portrait-file-input"
              @change="onFileUpload"
            />
          </label>
          <div class="portrait-url-row">
            <input
              v-model="urlInput"
              class="portrait-url-input"
              placeholder="或粘贴图片 URL..."
            />
            <button type="button" class="portrait-btn" :disabled="!urlInput.trim()" @click="onUrlSet">应用</button>
          </div>
          <button
            v-if="isCustom"
            type="button"
            class="portrait-btn portrait-btn-danger"
            @click="onRemove"
          >
            <Icon name="trash" :size="12" /> 删除自定义立绘
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import Icon from './Icon.vue';
import {
  getPortraitUrl,
  isCustomPortrait,
  setCustomPortrait,
  removeCustomPortrait,
  hasPortrait,
  hasFemalePortrait,
  getFemalePortraitUrl,
  getDefaultPortraitUrl,
  isFemalePreferred,
  setFemalePortrait,
  getPortraitSets,
  getSelectedSetIndex,
  setSelectedSetIndex,
  hasSpecialPortrait,
  getSpecialPortraitUrl,
  onPortraitsUpdated,
} from '../portraitService';

const props = defineProps<{ charName: string; gender?: string }>();
defineEmits<{ close: [] }>();

const urlInput = ref('');
const imgError = ref(false);
const customVersion = ref(0); // 触发重新计算（自定义立绘 / 女版偏好变更后递增）
const libVersion = ref(0); // 远程立绘库加载完成后递增（触发重算）
const showSpecial = ref(false); // 是否查看特殊立绘（仅本组件内状态，不持久化）
const thumbErrorSet = ref<Set<number>>(new Set());

// 订阅远程立绘库更新
const unsubscribe = onPortraitsUpdated(() => {
  libVersion.value++;
});

onBeforeUnmount(() => unsubscribe());

const isCustom = computed(() => {
  void customVersion.value;
  return isCustomPortrait(props.charName);
});

// 是否当前展示女版。由 localStorage 中的女版偏好持久化驱动。
const showFemale = computed(() => {
  void customVersion.value;
  return isFemalePreferred(props.charName);
});

// 主立绘多套 URL（自定义立绘时为单元素数组）
const portraitSets = computed<string[]>(() => {
  void customVersion.value;
  void libVersion.value;
  return getPortraitSets(props.charName);
});

const setCount = computed(() => portraitSets.value.length);
const selectedSetIndex = computed(() => {
  void customVersion.value;
  void libVersion.value;
  return getSelectedSetIndex(props.charName);
});

// 仅在 非自定义 且 多套 时允许切换
const canSwitchSet = computed(() => {
  void customVersion.value;
  void libVersion.value;
  if (isCustomPortrait(props.charName)) return false;
  return getPortraitSets(props.charName).length > 1;
});

// 仅在 非自定义 且 存在女版立绘 且 女版与默认版不同 时允许切换
const canToggleFemale = computed(() => {
  void customVersion.value;
  void libVersion.value;
  if (isCustomPortrait(props.charName)) return false;
  if (!hasFemalePortrait(props.charName)) return false;
  const femaleUrl = getFemalePortraitUrl(props.charName);
  const defaultUrl = getDefaultPortraitUrl(props.charName);
  return !!femaleUrl && femaleUrl !== defaultUrl;
});

// 仅在 非自定义 且 存在特殊立绘 时允许切换
const canToggleSpecial = computed(() => {
  void customVersion.value;
  void libVersion.value;
  if (isCustomPortrait(props.charName)) return false;
  return hasSpecialPortrait(props.charName);
});

// 非自定义 且 立绘库已加载 且 无特殊立绘 -> 显示「特殊立绘：无」提示
const hasNoSpecial = computed(() => {
  void customVersion.value;
  void libVersion.value;
  if (isCustomPortrait(props.charName)) return false;
  // 立绘库未加载时不显示（避免加载前误报"无"）
  if (!hasPortrait(props.charName, props.gender) && !hasFemalePortrait(props.charName)) return false;
  return !hasSpecialPortrait(props.charName);
});

const currentUrl = computed(() => {
  void customVersion.value;
  void libVersion.value;
  // 自定义优先（不参与特殊/女版/多套切换）
  if (isCustomPortrait(props.charName)) return getPortraitUrl(props.charName, props.gender);
  if (showSpecial.value) {
    return getSpecialPortraitUrl(props.charName) || getPortraitUrl(props.charName, props.gender);
  }
  if (showFemale.value) {
    return getFemalePortraitUrl(props.charName) || getPortraitUrl(props.charName, props.gender);
  }
  return getPortraitUrl(props.charName, props.gender);
});

function selectSet(idx: number) {
  setSelectedSetIndex(props.charName, idx);
  showSpecial.value = false;
  // 切换套后若该角色有女版偏好，取消以便看到选中套
  if (isFemalePreferred(props.charName)) setFemalePortrait(props.charName, false);
  imgError.value = false;
  customVersion.value++;
}

function toggleFemale() {
  setFemalePortrait(props.charName, !isFemalePreferred(props.charName));
  if (showFemale.value) showSpecial.value = false;
  imgError.value = false;
  customVersion.value++;
}

function toggleSpecial() {
  showSpecial.value = !showSpecial.value;
  imgError.value = false;
}

function onImgError() {
  imgError.value = true;
}

function onThumbError(e: Event, idx: number) {
  (e.target as HTMLImageElement).style.visibility = 'hidden';
  thumbErrorSet.value.add(idx);
}

function onFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('图片文件过大，请选择小于5MB的图片（建议使用图床URL）');
    return;
  }
  if (!file.type.startsWith('image/')) {
    alert('请选择有效的图片文件');
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    const base64 = ev.target?.result as string;
    setCustomPortrait(props.charName, base64);
    imgError.value = false;
    customVersion.value++;
  };
  reader.readAsDataURL(file);
}

function onUrlSet() {
  const url = urlInput.value.trim();
  if (!url) return;
  setCustomPortrait(props.charName, url);
  urlInput.value = '';
  imgError.value = false;
  customVersion.value++;
}

function onRemove() {
  if (!confirm('删除自定义立绘，恢复内置立绘？')) return;
  removeCustomPortrait(props.charName);
  imgError.value = false;
  customVersion.value++;
}

onMounted(() => {
  urlInput.value = '';
});
</script>

<style lang="scss" scoped>
.portrait-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 0.6em;
}

.portrait-modal {
  width: 100%;
  max-width: 360px;
  background: var(--c-bg-panel, #1a181d);
  border: 1px solid var(--c-border-gold, #6b5a3a);
  border-radius: 4px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.portrait-modal-head {
  display: flex;
  align-items: center;
  padding: 0.55em 0.7em;
  border-bottom: 1px solid var(--c-border);
  background: rgba(216, 193, 136, 0.06);

  .portrait-title {
    flex: 1;
    color: var(--c-text);
    font-size: 0.92em;
    letter-spacing: 0.04em;
  }
  .portrait-close {
    background: transparent;
    border: none;
    color: var(--c-text-muted);
    cursor: pointer;
    padding: 0.1em;
    display: inline-flex;
    &:hover { color: var(--c-text); }
  }
}

.portrait-modal-body {
  padding: 0.6em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.portrait-display {
  width: 100%;
  max-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  overflow: hidden;
}

.portrait-img {
  max-width: 100%;
  max-height: 50vh;
  object-fit: contain;
}

.portrait-img-err {
  padding: 1.5em;
  color: var(--c-text-dim);
  font-size: 0.84em;
  font-style: italic;
}

.portrait-source {
  display: flex;
  justify-content: center;
  gap: 0.4em;

  .src-tag {
    font-size: 0.72em;
    padding: 0.05em 0.5em;
    border-radius: 2px;

    &.custom {
      color: var(--c-accent);
      border: 1px solid rgba(168, 136, 212, 0.4);
      background: rgba(168, 136, 212, 0.06);
    }
    &.builtin {
      color: var(--c-primary);
      border: 1px solid rgba(216, 193, 136, 0.4);
      background: rgba(216, 193, 136, 0.06);
    }
    &.special {
      color: var(--c-danger, #c4665b);
      border: 1px solid rgba(196, 102, 91, 0.4);
      background: rgba(196, 102, 91, 0.08);
    }
  }
}

// 多套立绘缩略图行
.portrait-set-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35em;
  justify-content: center;
  padding: 0.3em 0;
  border-top: 1px dashed var(--c-border);
}

.portrait-set-thumb {
  position: relative;
  width: 3.2em;
  height: 4.2em;
  padding: 0;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: var(--c-primary-dim, #8a7a4a);
  }
  &.active {
    border-color: var(--c-primary, #d8c188);
    box-shadow: 0 0 0 1px var(--c-primary, #d8c188);
  }

  .set-thumb-err {
    position: absolute;
    color: var(--c-text-dim);
    font-size: 0.9em;
  }
}

.portrait-custom-area {
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  padding-top: 0.4em;
  border-top: 1px dashed var(--c-border);
}

.portrait-toggle-row {
  display: flex;
}

// 无特殊立绘提示
.portrait-empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
  width: 100%;
  padding: 0.35em;
  border: 1px dashed var(--c-border);
  border-radius: 3px;
  color: var(--c-text-dim);
  font-size: 0.78em;
  opacity: 0.7;
}

.portrait-toggle-btn {
  width: 100%;
  justify-content: center;
  background: rgba(168, 136, 212, 0.08);
  border-color: rgba(168, 136, 212, 0.35);
  color: var(--c-accent, #a888d4);

  &:hover:not(:disabled) {
    background: rgba(168, 136, 212, 0.16);
    border-color: var(--c-accent, #a888d4);
  }
  &.active {
    background: rgba(168, 136, 212, 0.18);
    border-color: var(--c-accent, #a888d4);
  }
}

// 特殊立绘按钮用 danger 色系区分
.portrait-special-btn {
  background: rgba(196, 102, 91, 0.08);
  border-color: rgba(196, 102, 91, 0.35);
  color: var(--c-danger, #c4665b);

  &:hover:not(:disabled) {
    background: rgba(196, 102, 91, 0.16);
    border-color: var(--c-danger, #c4665b);
  }
  &.active {
    background: rgba(196, 102, 91, 0.18);
    border-color: var(--c-danger, #c4665b);
  }
}

.portrait-file-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
  padding: 0.4em;
  background: rgba(216, 193, 136, 0.08);
  border: 1px dashed var(--c-border-gold, #6b5a3a);
  border-radius: 3px;
  color: var(--c-primary);
  font-size: 0.82em;
  cursor: pointer;

  &:hover { background: rgba(216, 193, 136, 0.14); }

  .portrait-file-input {
    display: none;
  }
}

.portrait-url-row {
  display: flex;
  gap: 0.35em;

  .portrait-url-input {
    flex: 1;
    min-width: 0;
    padding: 0.35em 0.5em;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--c-border);
    border-radius: 3px;
    color: var(--c-text);
    font-size: 0.82em;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: var(--c-primary-dim, #8a7a4a);
    }
  }
}

.portrait-btn {
  padding: 0.35em 0.6em;
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

.portrait-btn-danger {
  &:hover:not(:disabled) {
    border-color: var(--c-danger, #c4665b);
    color: var(--c-danger, #c4665b);
  }
}
</style>
