<template>
  <PanelCard title="储物袋" icon="bag" :count="count">
    <div v-if="count" class="inv-list">
      <article v-for="[name, val] in entries" :key="name" class="inv-item">
        <div class="inv-head">
          <Icon name="bag" :size="12" class="inv-icon" />
          <span class="inv-name">{{ name }}</span>
          <span v-if="qty(val) !== null" class="inv-qty">×{{ qty(val) }}</span>
        </div>
        <p v-if="desc(val)" class="inv-desc">{{ desc(val) }}</p>
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
    <div v-else class="empty-hint"><Icon name="bag" :size="14" /> 储物袋空空如也</div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import { deleteStatEntry } from '../services/deleteEntry';

const props = defineProps<{ 储物袋: Record<string, unknown> }>();
const entries = computed(() => Object.entries(props.储物袋 ?? {}));
const count = computed(() => entries.value.length);

function qty(val: unknown): number | null {
  if (_.isPlainObject(val) && _.has(val, '数量')) {
    const n = Number(_.get(val, '数量'));
    return Number.isFinite(n) ? n : null;
  }
  if (typeof val === 'number') return val;
  return null;
}

function desc(val: unknown): string {
  if (_.isPlainObject(val)) {
    const d = _.get(val, '描述');
    return typeof d === 'string' ? d : '';
  }
  return '';
}

async function onDelete(name: string) {
  if (!confirm('确定删除物品「' + name + '」？此操作同步到楼层变量。')) return;
  await deleteStatEntry('主角.储物袋', name);
}
</script>

<style lang="scss" scoped>
.inv-list {
  display: flex;
  flex-direction: column;
  gap: 0.4em;
}

.inv-item {
  padding: 0.4em 2.2em 0.4em 0.55em;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--c-border);
  border-radius: 3px;
}

.inv-head {
  display: flex;
  align-items: center;
  gap: 0.4em;

  .inv-icon {
    color: var(--c-primary-dim);
    flex-shrink: 0;
  }
  .inv-name {
    flex: 1;
    min-width: 0;
    color: var(--c-text);
    font-size: 0.88em;
    letter-spacing: 0.03em;
  }
  .inv-qty {
    color: var(--c-text-muted);
    font-size: 0.82em;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
}

.inv-desc {
  margin: 0.25em 0 0;
  font-size: 0.78em;
  line-height: 1.5;
  color: var(--c-text-muted);
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
