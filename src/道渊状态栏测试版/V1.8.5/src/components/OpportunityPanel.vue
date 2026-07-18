<template>
  <PanelCard title="机遇" icon="door" :count="count">
    <div v-if="count" class="opp-list">
      <article v-for="[name, o] in entries" :key="name" class="opp-item">
        <div class="opp-head">
          <Icon name="door" :size="14" />
          <span class="opp-name">{{ name }}</span>
          <span v-if="o.难度" class="opp-diff" :data-level="o.难度">难·{{ o.难度 }}</span>
        </div>
        <div v-if="o.目标" class="opp-row"><Icon name="star" :size="11" /><span>{{ o.目标 }}</span></div>
        <div v-if="o.机缘" class="opp-row"><Icon name="spark" :size="11" /><span>{{ o.机缘 }}</span></div>
        <p v-if="o.引言" class="opp-quote">{{ o.引言 }}</p>
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
    <div v-else class="empty-hint"><Icon name="door" :size="14" /> 当前无缘法相随</div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import { deleteStatEntry } from '../services/deleteEntry';
import type { 机遇条目 } from '../store';

const props = defineProps<{ 机遇: Record<string, 机遇条目> }>();
const entries = computed(() => Object.entries(props.机遇 ?? {}));
const count = computed(() => entries.value.length);

async function onDelete(name: string) {
  if (!confirm('确定删除机遇「' + name + '」？此操作同步到楼层变量。')) return;
  await deleteStatEntry('机遇', name);
}
</script>

<style lang="scss" scoped>
.opp-list {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.opp-item {
  padding: 0.5em 2.2em 0.5em 0.65em;
  position: relative;
  background: rgba(111, 179, 154, 0.05);
  border-left: 2px solid var(--c-accent);
  border-radius: 0 3px 3px 0;
}

.opp-head {
  display: flex;
  align-items: center;
  gap: 0.45em;

  .dy-icon {
    color: var(--c-accent);
  }
  .opp-name {
    color: var(--c-accent);
    font-size: 0.95em;
    letter-spacing: 0.04em;
  }
  .opp-diff {
    margin-left: auto;
    font-size: 0.72em;
    padding: 0.05em 0.4em;
    border-radius: 2px;
    color: var(--c-text-muted);
    border: 1px solid var(--c-border);
    &[data-level='高'] {
      color: var(--c-danger);
      border-color: rgba(196, 102, 91, 0.5);
    }
    &[data-level='中'] {
      color: var(--c-warn);
      border-color: rgba(217, 164, 65, 0.5);
    }
  }
}

.opp-row {
  display: flex;
  align-items: flex-start;
  gap: 0.4em;
  margin-top: 0.3em;
  font-size: 0.8em;
  color: var(--c-text);
  line-height: 1.45;

  .dy-icon {
    margin-top: 0.2em;
    color: var(--c-text-muted);
  }
}

.opp-quote {
  margin: 0.35em 0 0;
  padding-left: 0.6em;
  font-size: 0.8em;
  font-style: italic;
  color: var(--c-text-muted);
  border-left: 1px solid var(--c-border-gold);
  line-height: 1.5;
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
