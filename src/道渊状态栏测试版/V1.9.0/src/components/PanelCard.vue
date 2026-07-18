<template>
  <section class="panel" :class="{ bare }">
    <header v-if="!bare" class="panel-head">
      <span class="title">
        <Icon :name="icon" :size="14" />
        <span>{{ title }}</span>
      </span>
      <slot name="action" />
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import Icon from './Icon.vue';

defineProps<{
  title?: string;
  icon?: string;
  count?: number | string;
  bare?: boolean;
}>();
</script>

<style lang="scss" scoped>
.panel {
  position: relative;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 40%),
    var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 4px;

  /* 鎏金角饰 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    border: 1px solid var(--c-primary-dim);
    opacity: 0.7;
    pointer-events: none;
  }
  &::before {
    top: -1px;
    left: -1px;
    border-right: none;
    border-bottom: none;
  }
  &::after {
    bottom: -1px;
    right: -1px;
    border-left: none;
    border-top: none;
  }

  &.bare {
    background: transparent;
    border: none;
    &::before,
    &::after {
      display: none;
    }
  }
}

.panel-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  padding: 0.5em 0.8em;
  border-bottom: 1px solid var(--c-border);
  background: linear-gradient(90deg, rgba(216, 193, 136, 0.06), transparent 60%);

  .title {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    color: var(--c-primary);
    font-size: 0.96em;
    letter-spacing: 0.08em;
  }

  /* action 插槽（如绝色榜右侧按钮）贴右，不挤占居中标题 */
  :slotted([slot='action']) {
    position: absolute;
    right: 0.6em;
    top: 50%;
    transform: translateY(-50%);
  }
}

.panel-body {
  padding: 0.6em 0.85em;
}

/* 空状态 */
:deep(.empty-hint) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
  padding: 1.2em 0.5em;
  color: var(--c-text-dim);
  font-size: 0.85em;
  font-style: italic;
  letter-spacing: 0.06em;
}
</style>
