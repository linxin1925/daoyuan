<template>
  <div class="settings-overlay" @click.self="$emit('close')">
    <div class="settings-modal">
      <header class="settings-head">
        <Icon name="gear" :size="14" class="head-icon" />
        <span class="settings-title">状态栏设置</span>
        <button class="settings-close" type="button" @click="$emit('close')">
          <Icon name="close" :size="14" />
        </button>
      </header>

      <div class="settings-body">
        <!-- 折叠默认态 -->
        <section class="settings-section">
          <div class="section-title">折叠默认态</div>
          <div class="section-hint">新楼层状态栏出现时的初始状态</div>
          <label class="toggle-row">
            <span class="toggle-label">标签栏默认收起</span>
            <span class="toggle-desc">开启后新楼层只显示主角面板，需手动展开标签</span>
            <input type="checkbox" v-model="draft.defaultTabsCollapsed" class="toggle-check" />
          </label>
          <label class="toggle-row">
            <span class="toggle-label">整体默认最小化</span>
            <span class="toggle-desc">开启后新楼层折叠成 TopBar 细条</span>
            <input type="checkbox" v-model="draft.defaultCollapsed" class="toggle-check" />
          </label>
        </section>

        <!-- 标签显示控制 -->
        <section class="settings-section">
          <div class="section-title">
            标签显示
            <span class="section-hint">({{ enabledCount }}/{{ TAB_DEFS.length }} 已启用，只控制展示不修改变量)</span>
          </div>
          <div class="tab-toolbar">
            <button type="button" class="tab-tool-btn" @click="enableAll">全选</button>
            <button type="button" class="tab-tool-btn" @click="disableAll">全不选</button>
          </div>
          <div class="tab-grid">
            <label v-for="t in TAB_DEFS" :key="t.key" class="tab-check-row">
              <input
                type="checkbox"
                :checked="draft.enabledTabs[t.key] !== false"
                @change="onToggleTab(t.key, ($event.target as HTMLInputElement).checked)"
              />
              <Icon :name="t.icon" :size="13" class="tab-check-icon" />
              <span class="tab-check-label">{{ t.label }}</span>
            </label>
          </div>
        </section>
      </div>

      <footer class="settings-foot">
        <button type="button" class="foot-btn foot-btn-primary" @click="onSave">
          <Icon name="save" :size="12" /> 保存
        </button>
        <button type="button" class="foot-btn" @click="$emit('close')">取消</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import _ from 'lodash';
import Icon from './Icon.vue';
import { TAB_DEFS, type StatusbarSettings } from '../settingsService';

const props = defineProps<{ settings: StatusbarSettings }>();
const emit = defineEmits<{ close: []; save: [StatusbarSettings] }>();

const draft = ref<StatusbarSettings>(_.cloneDeep(props.settings));

const enabledCount = computed(
  () => TAB_DEFS.filter(t => draft.value.enabledTabs[t.key] !== false).length,
);

function onToggleTab(key: string, checked: boolean) {
  draft.value.enabledTabs[key] = checked;
}

function enableAll() {
  TAB_DEFS.forEach(t => {
    draft.value.enabledTabs[t.key] = true;
  });
}

function disableAll() {
  TAB_DEFS.forEach(t => {
    draft.value.enabledTabs[t.key] = false;
  });
}

function onSave() {
  emit('save', _.cloneDeep(draft.value));
}
</script>

<style lang="scss" scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1em;
}

.settings-modal {
  width: min(440px, 100%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(216, 193, 136, 0.06), transparent 30%),
    var(--c-surface);
  border: 1px solid var(--c-border-gold);
  border-radius: 6px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
}

.settings-head {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.7em 0.9em;
  border-bottom: 1px solid var(--c-border);
  background: linear-gradient(90deg, rgba(216, 193, 136, 0.06), transparent 60%);

  .head-icon {
    color: var(--c-primary);
  }
  .settings-title {
    flex: 1;
    color: var(--c-primary);
    font-size: 1em;
    letter-spacing: 0.06em;
  }
  .settings-close {
    background: transparent;
    border: none;
    color: var(--c-text-muted);
    cursor: pointer;
    padding: 0.2em;
    display: inline-flex;
    &:hover {
      color: var(--c-text);
    }
  }
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.8em 0.9em;
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.settings-section {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--c-border);
  border-radius: 4px;
  padding: 0.6em 0.7em;

  .section-title {
    color: var(--c-primary);
    font-size: 0.9em;
    letter-spacing: 0.05em;
    display: flex;
    align-items: baseline;
    gap: 0.5em;
  }
  .section-hint {
    color: var(--c-text-dim);
    font-size: 0.76em;
    margin: 0.2em 0 0.5em;
  }
}

.toggle-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.1em 0.6em;
  align-items: center;
  padding: 0.45em 0;
  cursor: pointer;

  .toggle-label {
    color: var(--c-text);
    font-size: 0.86em;
  }
  .toggle-desc {
    grid-column: 1;
    color: var(--c-text-dim);
    font-size: 0.74em;
    line-height: 1.4;
  }
  .toggle-check {
    grid-column: 2;
    grid-row: 1 / span 2;
    width: 16px;
    height: 16px;
    accent-color: var(--c-primary);
    cursor: pointer;
  }
}

.tab-toolbar {
  display: flex;
  gap: 0.5em;
  margin-bottom: 0.5em;

  .tab-tool-btn {
    padding: 0.2em 0.7em;
    font-size: 0.76em;
    font-family: inherit;
    color: var(--c-text-muted);
    background: transparent;
    border: 1px solid var(--c-border);
    border-radius: 3px;
    cursor: pointer;
    &:hover {
      color: var(--c-primary);
      border-color: var(--c-border-gold);
    }
  }
}

.tab-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.3em 0.5em;
}

.tab-check-row {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.3em 0.4em;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.82em;
  color: var(--c-text);

  &:hover {
    background: rgba(216, 193, 136, 0.06);
  }
  input[type='checkbox'] {
    width: 14px;
    height: 14px;
    accent-color: var(--c-primary);
    cursor: pointer;
  }
  .tab-check-icon {
    color: var(--c-text-muted);
  }
}

.settings-foot {
  display: flex;
  gap: 0.5em;
  justify-content: flex-end;
  padding: 0.6em 0.9em;
  border-top: 1px solid var(--c-border);

  .foot-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    padding: 0.4em 1em;
    font-family: inherit;
    font-size: 0.84em;
    color: var(--c-text-muted);
    background: transparent;
    border: 1px solid var(--c-border);
    border-radius: 3px;
    cursor: pointer;
    &:hover {
      color: var(--c-text);
      border-color: var(--c-border-gold);
    }
    &.foot-btn-primary {
      color: var(--c-primary);
      border-color: var(--c-border-gold);
      background: rgba(216, 193, 136, 0.08);
    }
  }
}
</style>
