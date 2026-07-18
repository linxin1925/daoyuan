<template>
  <PanelCard title="气运加身" icon="star">
    <div v-if="count" class="qiyun-list">
      <article v-for="[name, q] in entries" :key="name" class="qi-item">
        <div class="qi-head">
          <span class="qi-name">{{ name }}</span>
          <span class="qi-type">{{ q.类型 }}</span>
          <span v-if="q.压制状态" class="qi-seal" :class="{ active: q.压制状态 !== '无' }">封·{{ q.压制状态 }}</span>
        </div>
        <p class="qi-effect">{{ q.效果 }}</p>
        <div class="qi-meta">
          <span><Icon name="spark" :size="11" /> {{ q.使用状态 }}</span>
          <span><Icon name="taiji" :size="11" /> 余 {{ q.剩余次数 }}</span>
        </div>
      </article>
    </div>
    <div v-else class="empty-hint"><Icon name="star" :size="14" /> 未有机缘加身</div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import type { 气运详情 } from '../store';

const props = defineProps<{ 气运: Record<string, 气运详情> }>();
const entries = computed(() => Object.entries(props.气运 ?? {}));
const count = computed(() => entries.value.length);
</script>

<style lang="scss" scoped>
.qiyun-list {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.qi-item {
  padding: 0.5em 0.65em;
  background: rgba(168, 136, 212, 0.05);
  border-left: 2px solid var(--c-luck);
  border-radius: 0 3px 3px 0;
}

.qi-head {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;

  .qi-name {
    color: var(--c-luck);
    font-size: 0.96em;
    letter-spacing: 0.04em;
  }
  .qi-type {
    color: var(--c-text-muted);
    font-size: 0.78em;
  }
  .qi-seal {
    margin-left: auto;
    font-size: 0.72em;
    padding: 0.05em 0.4em;
    border-radius: 2px;
    color: var(--c-text-dim);
    border: 1px solid var(--c-border);
    &.active {
      color: var(--c-danger);
      border-color: rgba(196, 102, 91, 0.5);
    }
  }
}

.qi-effect {
  margin: 0.3em 0 0.35em;
  font-size: 0.86em;
  line-height: 1.5;
  color: var(--c-text);
}

.qi-meta {
  display: flex;
  gap: 1.2em;
  font-size: 0.76em;
  color: var(--c-text-muted);

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
  }
}
</style>
