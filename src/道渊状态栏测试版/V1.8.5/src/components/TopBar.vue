<template>
  <div class="topbar ink-canvas">
    <div class="cell time">
      <Icon name="clock" :size="14" />
      <span>{{ world.当前时间 || '岁月未明' }}</span>
      <button
        class="collapse-btn"
        type="button"
        :title="collapsed ? '展开状态栏' : '折叠状态栏'"
        @click="collapsed = !collapsed"
      >
        <Icon :name="collapsed ? 'chevron-down' : 'chevron-up'" :size="12" />
      </button>
      <span class="cell crisis" :data-level="world.危机程度">
        <Icon name="warning" :size="13" />
        <span>危机·{{ world.危机程度 || '未知' }}</span>
      </span>
      <span v-if="world.遭遇冷却 !== undefined" class="cell cooldown">
        <Icon name="clock" :size="13" />
        <span>遭遇冷却·{{ world.遭遇冷却 }}</span>
      </span>
    </div>
    <div class="cell location">
      <Icon name="mountain" :size="14" />
      <span class="loc-text">{{ world.当前地点 || '身处未定之地' }}</span>
    </div>
    <div class="right-bottom">
      <div class="update-area">
        <span
          class="update-dot"
          :class="updateStatus ?? 'idle'"
          :title="updateStatus === 'success' ? '变量更新成功' : updateStatus === 'failed' ? '变量更新失败：未检测到变化' : '本楼层本轮未更新'"
        ></span>
        <span class="update-label">{{ updateStatus === 'success' ? '已更新' : updateStatus === 'failed' ? '更新失败' : '未更新' }}</span>
      <span v-if="missedItems.length" class="update-missed">
        <span v-for="item in missedItems" :key="item" class="missed-item">{{ item }}未更新</span>
      </span>
    </div>
    <button
      class="settings-btn"
      type="button"
      title="状态栏设置"
      @click="$emit('open-settings')"
    >
      <Icon name="gear" :size="13" />
    </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';
import type { 世界 } from '../store';

const props = defineProps<{
  world: 世界;
  updateStatus?: 'success' | 'failed' | 'idle';
  mandatoryUpdates?: { 动向: boolean | null; 绝色榜: boolean | null; 器灵台词: boolean | null };
}>();
defineEmits<{ 'open-settings': [] }>();
const collapsed = defineModel<boolean>('collapsed', { default: false });

// 强制项和上一层 AI 相同 = 未更新，列出未更新的项名
const missedItems = computed<string[]>(() => {
  const mu = props.mandatoryUpdates;
  if (!mu) return [];
  const items: string[] = [];
  if (mu.动向 === false) items.push('动向');
  if (mu.绝色榜 === false) items.push('绝色榜');
  if (mu.器灵台词 === false) items.push('器灵台词');
  return items;
});
</script>

<style lang="scss" scoped>
.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4em 1.4em;
  padding: 0.55em 0.9em;
  border: 1px solid var(--c-border);
  border-radius: 4px;
  background:
    linear-gradient(90deg, rgba(216, 193, 136, 0.05), transparent 50%),
    var(--c-surface);
}

.cell {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.9em;
  color: var(--c-text-muted);

  .loc-text {
    color: var(--c-text);
  }

  &.time {
    color: var(--c-primary);
  }

  .collapse-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.1em;
    margin-left: 0.1em;
    line-height: 0;
    color: var(--c-primary);
    background: transparent;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;

    &:hover {
      color: var(--c-text);
      background: rgba(216, 193, 136, 0.1);
    }
  }

  &.crisis {
    margin-left: auto;
    padding: 0.1em 0.6em;
    border-radius: 3px;
    color: #f3e6d0;
    font-size: 0.82em;
    letter-spacing: 0.06em;

    &[data-level='低'] {
      background: linear-gradient(135deg, rgba(111, 179, 154, 0.8), rgba(80, 150, 130, 0.8));
      box-shadow: 0 0 6px rgba(111, 179, 154, 0.3);
    }
    &[data-level='中'] {
      background: linear-gradient(135deg, rgba(217, 164, 65, 0.85), rgba(180, 130, 50, 0.85));
      box-shadow: 0 0 6px rgba(217, 164, 65, 0.3);
    }
    &[data-level='高'] {
      background: linear-gradient(135deg, rgba(196, 102, 91, 0.88), rgba(170, 70, 60, 0.88));
      box-shadow: 0 0 8px rgba(196, 102, 91, 0.45);
      animation: pulseHigh 1.8s ease-in-out infinite;
    }
  }

  &.cooldown {
    font-size: 0.8em;
    color: var(--c-text-muted);
    padding: 0.1em 0.5em;
    border: 1px solid var(--c-border);
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.2);
  }
}

  /* 窄屏：location 省略防止 TopBar 过度换行 */
  @media (max-width: 520px) {
    .cell.location {
      flex: 1 1 100%;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
    }
    .cell.location .loc-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .right-bottom {
    display: flex;
    align-items: center;
    gap: 0.2em;
    width: 100%;
    justify-content: flex-end;
    flex-shrink: 0;
  }

.update-area {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.2em;
  flex-shrink: 0;
}

.update-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--c-text-dim);
  transition: background 0.3s, box-shadow 0.3s;

  &.success {
    background: var(--c-accent);
    box-shadow: 0 0 6px rgba(111, 179, 154, 0.6);
  }
  &.failed {
    background: var(--c-danger);
    box-shadow: 0 0 6px rgba(196, 102, 91, 0.6);
    animation: dotPulse 1.8s ease-in-out infinite;
  }
  &.idle {
    background: var(--c-text-dim);
  }
}

.update-label {
  margin-left: 0.3em;
  font-size: 0.74em;
  color: var(--c-text-muted);
  letter-spacing: 0.04em;
  white-space: nowrap;

  .update-dot.success + & {
    color: var(--c-accent);
  }
  .update-dot.failed + & {
    color: var(--c-danger);
  }
}

.update-missed {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.3em;

  .missed-item {
    font-size: 0.68em;
    color: var(--c-danger);
    padding: 0.05em 0.35em;
    border: 1px solid rgba(196, 102, 91, 0.4);
    border-radius: 2px;
    background: rgba(196, 102, 91, 0.08);
    white-space: nowrap;
  }
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.3em;
  padding: 0.25em 0.4em;
  line-height: 0;
  color: var(--c-text-muted);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  flex-shrink: 0;

  &:hover {
    color: var(--c-primary);
    border-color: var(--c-border-gold);
    background: rgba(216, 193, 136, 0.08);
  }
}

@keyframes pulseHigh {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(196, 102, 91, 0.45);
  }
  50% {
    box-shadow: 0 0 14px rgba(196, 102, 91, 0.7);
  }
}
</style>
