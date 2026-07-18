<template>
  <PanelCard title="器灵·灵汐" icon="spirit" :count="lines.length">
    <div v-if="lines.length" class="qiling-list">
      <blockquote v-for="(line, i) in lines" :key="i" class="ql-line">
        <span class="ql-mark">「</span>{{ line }}<span class="ql-mark">」</span>
      </blockquote>
    </div>
    <div v-else class="empty-hint"><Icon name="spirit" :size="14" /> 灵汐静默无言</div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';

const props = defineProps<{ 台词: string[] }>();
const lines = computed(() => props.台词 ?? []);
</script>

<style lang="scss" scoped>
.qiling-list {
  display: flex;
  flex-direction: column;
  gap: 0.45em;
}

.ql-line {
  position: relative;
  margin: 0;
  padding: 0.5em 0.7em 0.5em 0.9em;
  font-size: 0.88em;
  line-height: 1.55;
  color: var(--c-text);
  background: linear-gradient(90deg, rgba(216, 193, 136, 0.07), transparent 70%);
  border-left: 2px solid var(--c-primary);
  border-radius: 0 3px 3px 0;
  font-style: italic;

  .ql-mark {
    color: var(--c-primary);
    font-size: 1.1em;
    opacity: 0.8;
  }
}
</style>
