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
          <span v-else-if="currentUrl" class="src-tag builtin">{{ showFemale ? '女版' : '内置' }}</span>
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
import { ref, computed, onMounted } from 'vue';
import Icon from './Icon.vue';
import {
  getPortraitUrl,
  isCustomPortrait,
  setCustomPortrait,
  removeCustomPortrait,
  hasFemalePortrait,
  getFemalePortraitUrl,
  getDefaultPortraitUrl,
  isFemalePreferred,
  setFemalePortrait,
} from '../portraitService';

const props = defineProps<{ charName: string; gender?: string }>();
defineEmits<{ close: [] }>();

const urlInput = ref('');
const imgError = ref(false);
const customVersion = ref(0); // 触发重新计算（自定义立绘 / 女版偏好变更后递增）

const isCustom = computed(() => {
  // 依赖 customVersion 触发响应式
  void customVersion.value;
  return isCustomPortrait(props.charName);
});

// 是否当前展示女版。由 localStorage 中的女版偏好持久化驱动。
const showFemale = computed(() => {
  void customVersion.value;
  return isFemalePreferred(props.charName);
});

// 仅在 非自定义 且 存在女版立绘 且 女版与默认版不同 时允许切换
const canToggleFemale = computed(() => {
  void customVersion.value;
  if (isCustomPortrait(props.charName)) return false;
  if (!hasFemalePortrait(props.charName)) return false;
  const femaleUrl = getFemalePortraitUrl(props.charName);
  const defaultUrl = getDefaultPortraitUrl(props.charName);
  return !!femaleUrl && femaleUrl !== defaultUrl;
});

const currentUrl = computed(() => {
  void customVersion.value;
  if (showFemale.value) {
    return getFemalePortraitUrl(props.charName) || getPortraitUrl(props.charName, props.gender);
  }
  return getPortraitUrl(props.charName, props.gender);
});

function toggleFemale() {
  setFemalePortrait(props.charName, !isFemalePreferred(props.charName));
  imgError.value = false;
  customVersion.value++;
}

function onImgError() {
  imgError.value = true;
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
