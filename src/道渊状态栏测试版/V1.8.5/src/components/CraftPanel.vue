<template>
  <PanelCard title="副业" icon="flask">
    <div class="craft-grid">
      <div class="craft-block alchemy">
        <div class="cb-head"><Icon name="flask" :size="14" /><span>炼丹</span></div>
        <div class="cb-rank">{{ 炼丹?.阶级 || '未入门' }}</div>
        <div class="cb-stats">
          <span>熟练 <b>{{ 炼丹?.熟练度 ?? 0 }}</b></span>
          <span>成率 <b>{{ 炼丹?.成功率 ?? 0 }}%</b></span>
          <span>次数 <b>{{ 炼丹?.次数 ?? 0 }}</b></span>
        </div>
      </div>
      <div class="craft-block forge">
        <div class="cb-head"><Icon name="forge" :size="14" /><span>炼器</span></div>
        <div class="cb-rank">{{ 炼器?.阶级 || '未入门' }}</div>
        <div class="cb-stats">
          <span>熟练 <b>{{ 炼器?.熟练度 ?? 0 }}</b></span>
          <span>成率 <b>{{ 炼器?.成功率 ?? 0 }}%</b></span>
          <span>次数 <b>{{ 炼器?.次数 ?? 0 }}</b></span>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import type { 技能子面板 } from '../store';

defineProps<{ 炼丹?: 技能子面板; 炼器?: 技能子面板 }>();
</script>

<style lang="scss" scoped>
.craft-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7em;
}

.craft-block {
  padding: 0.55em 0.65em;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--c-border);
  border-radius: 3px;

  &.alchemy .cb-head .dy-icon {
    color: var(--c-accent);
  }
  &.forge .cb-head .dy-icon {
    color: var(--c-warn);
  }
}

.cb-head {
  display: flex;
  align-items: center;
  gap: 0.4em;
  color: var(--c-primary);
  font-size: 0.9em;
  letter-spacing: 0.06em;
}

.cb-rank {
  margin: 0.3em 0;
  font-size: 1em;
  color: var(--c-text);
}

.cb-stats {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
  font-size: 0.76em;
  color: var(--c-text-muted);

  b {
    color: var(--c-text);
    font-variant-numeric: tabular-nums;
    font-weight: normal;
  }
}
</style>
