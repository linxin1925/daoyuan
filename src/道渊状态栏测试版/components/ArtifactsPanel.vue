<template>
  <PanelCard title="器物" icon="gem">
    <div v-if="count" class="artifact-list">
      <article v-for="[name, a] in entries" :key="name" class="art-item">
        <div class="art-head">
          <Icon name="gem" :size="14" class="art-icon" />
          <div class="art-id">
            <div class="art-name">{{ name }}</div>
            <div v-if="sub(a)" class="art-sub">{{ sub(a) }}</div>
          </div>
          <span v-if="status(a)" class="art-status">{{ status(a) }}</span>
        </div>

        <p v-if="wear(a)" class="art-wear">损耗度：{{ wear(a) }}</p>
        <p v-if="effect(a)" class="art-effect">{{ effect(a) }}</p>
        <p v-if="desc(a)" class="art-desc">{{ desc(a) }}</p>
      </article>
    </div>
    <div v-else class="empty-hint"><Icon name="gem" :size="14" /> 尚未持有器物</div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';

const props = defineProps<{ 器物: Record<string, unknown> }>();
const entries = computed(() => Object.entries(props.器物 ?? {}));
const count = computed(() => entries.value.length);

function get(obj: unknown, key: string): unknown {
  return _.isPlainObject(obj) ? _.get(obj, key) : undefined;
}

function str(obj: unknown, key: string): string {
  const v = get(obj, key);
  return typeof v === 'string' ? v : '';
}

function status(a: unknown): string {
  return str(a, '状态') || str(a, 'status');
}

function effect(a: unknown): string {
  return str(a, '效果') || str(a, 'effect') || str(a, '能力');
}

function desc(a: unknown): string {
  return str(a, '描述') || str(a, 'desc') || str(a, '说明');
}

function sub(a: unknown): string {
  const type = str(a, '类型') || str(a, 'type');
  const rank = str(a, '等级') || str(a, '品阶') || str(a, '阶级') || str(a, 'rank');
  const parts = [type, rank].filter(Boolean);
  return parts.join(' · ');
}

function wear(a: unknown): string {
  return str(a, '损耗度') || str(a, 'wear') || str(a, '耐久');
}
</script>

<style lang="scss" scoped>
.artifact-list {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.art-item {
  padding: 0.55em 0.7em;
  background: rgba(216, 193, 136, 0.05);
  border: 1px solid var(--c-border-gold);
  border-radius: 3px;
}

.art-head {
  display: flex;
  align-items: center;
  gap: 0.5em;

  .art-icon {
    color: var(--c-primary);
  }

  .art-id {
    flex: 1;
    min-width: 0;
  }

  .art-name {
    color: var(--c-text);
    font-size: 0.96em;
    letter-spacing: 0.04em;
  }

  .art-sub {
    font-size: 0.76em;
    color: var(--c-text-muted);
  }

  .art-status {
    margin-left: auto;
    font-size: 0.74em;
    padding: 0.05em 0.4em;
    border-radius: 2px;
    color: var(--c-primary);
    border: 1px solid var(--c-border-gold);
    background: rgba(216, 193, 136, 0.06);
  }
}

.art-effect {
  margin: 0.35em 0 0;
  font-size: 0.85em;
  line-height: 1.5;
  color: var(--c-text);
}

.art-desc {
  margin: 0.25em 0 0;
  font-size: 0.8em;
  line-height: 1.5;
  color: var(--c-text-muted);
}
</style>
