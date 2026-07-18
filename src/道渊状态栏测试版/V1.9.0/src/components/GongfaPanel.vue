<template>
  <PanelCard title="功法" icon="scroll" :count="count">
    <div v-if="count" class="gongfa-list">
      <article v-for="[name, g] in entries" :key="name" class="gf-item">
        <div class="gf-head">
          <span class="gf-name">{{ name }}</span>
          <span v-if="g.类型" class="gf-tag">{{ g.类型 }}</span>
          <span v-if="g.境界" class="gf-tag gf-realm">{{ g.境界 }}</span>
        </div>
        <div v-if="g.熟练度" class="gf-prof">
          <span>熟练</span>
          <div class="prof-track"><div class="prof-fill" :style="{ width: profPct(g.熟练度) + '%' }" /></div>
          <span class="prof-num">{{ g.熟练度 }}</span>
        </div>
        <p v-if="g.描述" class="gf-desc">{{ g.描述 }}</p>
      </article>
    </div>
    <div v-else class="empty-hint"><Icon name="scroll" :size="14" /> 尚未修习功法</div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import type { 功法详情 } from '../store';

const props = defineProps<{ 功法: Record<string, 功法详情> }>();
const entries = computed(() => Object.entries(props.功法 ?? {}));
const count = computed(() => entries.value.length);

function profPct(v: number): number {
  return _.clamp((Number(v) || 0) / 100 * 100, 0, 100);
}
</script>

<style lang="scss" scoped>
.gongfa-list {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.gf-item {
  padding: 0.5em 0.65em;
  background: rgba(216, 193, 136, 0.04);
  border: 1px solid var(--c-border);
  border-radius: 3px;
}

.gf-head {
  display: flex;
  align-items: center;
  gap: 0.45em;
  flex-wrap: wrap;

  .gf-name {
    color: var(--c-primary);
    font-size: 0.96em;
    letter-spacing: 0.04em;
  }
  .gf-tag {
    font-size: 0.74em;
    color: var(--c-text-muted);
    padding: 0.03em 0.4em;
    border: 1px solid var(--c-border);
    border-radius: 2px;
  }
  .gf-realm {
    color: var(--c-warn);
    border-color: rgba(217, 164, 65, 0.4);
  }
}

.gf-prof {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-top: 0.4em;
  font-size: 0.76em;
  color: var(--c-text-muted);

  .prof-track {
    flex: 1;
    height: 4px;
    background: var(--c-border);
    border-radius: 2px;
    overflow: hidden;
  }
  .prof-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--c-primary-dim), var(--c-primary));
  }
  .prof-num {
    font-variant-numeric: tabular-nums;
    color: var(--c-text);
  }
}

.gf-desc {
  margin: 0.35em 0 0;
  font-size: 0.82em;
  line-height: 1.5;
  color: var(--c-text-muted);
}
</style>
