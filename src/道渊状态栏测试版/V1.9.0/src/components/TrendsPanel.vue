<template>
  <PanelCard title="天地动向" icon="wind" :count="count">
    <div v-if="count" class="trend-list">
      <article v-for="[name, t] in entries" :key="name" class="trend-item">
        <div class="trend-head">
          <span class="trend-name">{{ name }}</span>
          <span v-if="t.阶段" class="trend-phase">{{ t.阶段 }}</span>
          <span v-if="t.类型" class="trend-type">{{ t.类型 }}</span>
          <span v-if="t.地点" class="trend-loc"><Icon name="mountain" :size="11" /> {{ t.地点 }}</span>
        </div>
        <p v-if="t.描述" class="trend-desc">{{ t.描述 }}</p>
        <button
          class="del-btn"
          type="button"
          title="删除"
          @click.stop="onDelete(name)"
        >
          <Icon name="trash" :size="11" />
        </button>
      </article>
    </div>
    <div v-else class="empty-hint"><Icon name="wind" :size="14" /> 天下太平，风平浪静</div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import { deleteStatEntry } from '../services/deleteEntry';
import type { 世界 } from '../store';

const props = defineProps<{ 动向: 世界['动向'] }>();
const entries = computed(() => Object.entries(props.动向 ?? {}));
const count = computed(() => entries.value.length);

async function onDelete(name: string) {
  if (!confirm('确定删除动向「' + name + '」？此操作同步到楼层变量。')) return;
  await deleteStatEntry('世界.动向', name);
}
</script>

<style lang="scss" scoped>
.trend-list {
  display: flex;
  flex-direction: column;
  gap: 0.55em;
}

.trend-item {
  padding: 0.45em 2.2em 0.45em 0.6em;
  position: relative;
  background: rgba(95, 179, 196, 0.05);
  border: 1px solid var(--c-border);
  border-radius: 3px;
}

.trend-head {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;

  .trend-name {
    color: var(--c-mind);
    font-size: 0.94em;
    letter-spacing: 0.04em;
  }
  .trend-type {
    font-size: 0.74em;
    color: var(--c-text-muted);
    padding: 0.02em 0.4em;
    border: 1px solid var(--c-border);
    border-radius: 2px;
  }
  .trend-phase {
    font-size: 0.7em;
    color: var(--c-warn);
    padding: 0.02em 0.4em;
    border: 1px solid rgba(217, 164, 65, 0.4);
    border-radius: 2px;
    background: rgba(217, 164, 65, 0.08);
  }
  .trend-loc {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
    font-size: 0.74em;
    color: var(--c-text-muted);
  }
}

.trend-desc {
  margin: 0.3em 0 0;
  font-size: 0.82em;
  line-height: 1.5;
  color: var(--c-text);
}

.del-btn {
  position: absolute;
  top: 0.35em;
  right: 0.35em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25em;
  line-height: 0;
  color: var(--c-text-dim);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;

  &:hover {
    color: #f3e6d0;
    background: rgba(196, 102, 91, 0.65);
    border-color: rgba(196, 102, 91, 0.6);
  }
}
</style>
