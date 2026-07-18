<template>
  <PanelCard title="宗门" icon="fortress">
    <!-- 有 stat_data.宗门 变量时 -->
    <template v-if="hasInfo">
      <div class="zm-head">
        <Icon name="fortress" :size="20" class="zm-icon" />
        <span class="zm-name">{{ p.宗门 || '无上仙宗' }}</span>
        <span v-if="sectInfo.职位" class="zm-rank">{{ sectInfo.职位 }}</span>
      </div>

      <div class="zm-stats">
        <div v-if="sectInfo.类型" class="zm-stat-line">
          <span class="zs-label">类型</span>
          <span class="zs-num">{{ sectInfo.类型 }}</span>
        </div>
        <div v-if="sectInfo.领袖" class="zm-stat-line">
          <span class="zs-label">领袖</span>
          <span class="zs-num">{{ sectInfo.领袖 }}</span>
        </div>
        <div v-if="sectInfo.声望" class="zm-stat-line">
          <span class="zs-label">声望</span>
          <span class="zs-rep" :data-level="声望等级">{{ sectInfo.声望 }}</span>
        </div>
        <div v-if="sectInfo.贡献 != null || p.宗门贡献" class="zm-stat-line">
          <span class="zs-label">宗门贡献</span>
          <Icon name="star" :size="12" class="zs-icon" />
          <span class="zs-num">{{ p.宗门贡献 ?? sectInfo.贡献 ?? 0 }}</span>
        </div>
        <div v-if="sectInfo.驻地" class="zm-stat-line">
          <span class="zs-label">驻地</span>
          <span class="zs-num">{{ sectInfo.驻地 }}</span>
        </div>
      </div>

      <div v-if="sectInfo.理念" class="zm-section zm-idea">
        <span class="zm-label">宗门理念</span>
        <p class="zm-text">{{ sectInfo.理念 }}</p>
      </div>

      <div v-if="sectInfo.现状" class="zm-section zm-now">
        <span class="zm-label">宗门现状</span>
        <p class="zm-text">{{ sectInfo.现状 }}</p>
      </div>
    </template>

    <!-- 无 stat_data.宗门 变量时：从主角字段提取 -->
    <template v-else>
      <div class="zm-head">
        <Icon name="fortress" :size="20" class="zm-icon" />
        <span class="zm-name">{{ p.宗门 || '暂无宗门' }}</span>
      </div>

      <div v-if="p.宗门贡献 != null" class="zm-stats">
        <div class="zm-stat-line">
          <span class="zs-label">宗门贡献</span>
          <Icon name="star" :size="12" class="zs-icon" />
          <span class="zs-num">{{ p.宗门贡献 }}</span>
        </div>
      </div>

      <div class="empty-hint">
        <Icon name="fortress" :size="14" />
        宗门详情尚未录入天道，待 AI 以天道推演补齐。
      </div>
    </template>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import type { 宗门Info, 主角 } from '../store';

const props = defineProps<{
  宗门?: 宗门Info | null;
  主角: 主角;
}>();

const p = computed(() => props.主角);
const sectInfo = computed(() => props.宗门 ?? {} as 宗门Info);
const hasInfo = computed(() => !!(props.宗门 && (props.宗门.职位 || props.宗门.驻地 || props.宗门.现状 || props.宗门.领袖)));

/** 声望等级数值化，用于颜色映射 */
const 声望等级 = computed(() => {
  const map: Record<string, number> = { 冷漠: 0, 中立: 1, 友善: 2, 尊敬: 3, 崇拜: 4 };
  return map[sectInfo.value.声望 || ''] ?? -1;
});
</script>

<style lang="scss" scoped>
.zm-head {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding-bottom: 0.55em;
  margin-bottom: 0.5em;
  border-bottom: 1px solid var(--c-border-gold);
}

.zm-icon {
  color: var(--c-primary);
  filter: drop-shadow(0 0 5px rgba(216, 193, 136, 0.4));
}

.zm-name {
  flex: 1;
  font-size: 1.15em;
  color: var(--c-primary);
  letter-spacing: 0.08em;
  text-shadow: 0 0 8px rgba(216, 193, 136, 0.2);
}

.zm-rank {
  font-size: 0.7em;
  padding: 0.1em 0.5em;
  color: var(--c-luck);
  border: 1px solid rgba(168, 136, 212, 0.45);
  border-radius: 2px;
  background: rgba(168, 136, 212, 0.06);
}

.zm-section {
  margin-bottom: 0.55em;

  .zm-label {
    display: block;
    font-size: 0.78em;
    color: var(--c-primary-dim);
    letter-spacing: 0.05em;
    margin-bottom: 0.25em;
  }

  .zm-text {
    margin: 0;
    font-size: 0.84em;
    line-height: 1.6;
    color: var(--c-text-muted);
    white-space: pre-wrap;
  }
}

.zm-now {
  padding: 0.4em 0.5em;
  background: rgba(216, 193, 136, 0.06);
  border-left: 2px solid var(--c-primary-dim);
  border-radius: 0 3px 3px 0;

  .zm-text {
    color: var(--c-text);
  }
}

.zm-idea {
  .zm-text {
    font-style: italic;
    letter-spacing: 0.03em;
    color: var(--c-text-muted);
    opacity: 0.85;
  }
}

.zm-stats {
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  margin-bottom: 0.5em;
}

.zm-stat-line {
  display: flex;
  align-items: center;
  gap: 0.45em;

  .zs-label {
    flex-shrink: 0;
    font-size: 0.76em;
    color: var(--c-text-dim);
    width: 5em;
    letter-spacing: 0.04em;
  }

  .zs-icon {
    color: var(--c-warn, #d9a441);
  }

  .zs-num {
    font-size: 0.84em;
    color: var(--c-text);
    font-variant-numeric: tabular-nums;
  }
}

/* 声望等级颜色映射 */
.zs-rep {
  font-size: 0.82em;
  padding: 0.05em 0.45em;
  border-radius: 2px;
  letter-spacing: 0.04em;

  &[data-level="0"] { color: var(--c-text-dim); border: 1px solid var(--c-border); background: transparent; }         /* 冷漠 */
  &[data-level="1"] { color: var(--c-text-muted); border: 1px solid var(--c-border); background: transparent; }      /* 中立 */
  &[data-level="2"] { color: var(--c-accent, #88c0d0); border: 1px solid rgba(136, 192, 208, 0.4); background: rgba(136, 192, 208, 0.06); }  /* 友善 */
  &[data-level="3"] { color: var(--c-primary); border: 1px solid var(--c-primary-dim); background: rgba(216, 193, 136, 0.08); }            /* 尊敬 */
  &[data-level="4"] { color: var(--c-warn, #d9a441); border: 1px solid var(--c-warn); background: rgba(217, 164, 65, 0.1); }                /* 崇拜 */
}
</style>
