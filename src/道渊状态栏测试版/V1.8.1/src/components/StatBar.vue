<template>
  <div class="stat-bar" :class="lowTone && 'is-low'">
    <div class="row">
      <span class="label"><Icon :name="icon" :size="13" /> {{ label }}</span>
      <span class="value">{{ display }}<span class="max">/{{ max }}</span></span>
    </div>
    <div class="track">
      <div class="fill" :style="{ width: pct + '%', '--tone': toneVar, '--tone-soft': toneSoftVar }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import Icon from './Icon.vue';

const props = withDefaults(
  defineProps<{
    label: string;
    value: number;
    max?: number;
    tone?: 'accent' | 'danger' | 'primary' | 'warn' | 'luck' | 'mind';
    icon?: string;
  }>(),
  { max: 100, tone: 'primary', icon: 'spark' },
);

const pct = computed(() => _.clamp((Number(props.value) || 0) / props.max * 100, 0, 100));
const display = computed(() => Math.round(Number(props.value) || 0));
const lowTone = computed(() => pct.value <= 25);

const toneVar = computed(() => `var(--c-${props.tone})`);
const toneSoftVar = computed(() => `var(--c-${props.tone})`);
</script>

<style lang="scss" scoped>
.stat-bar {
  font-size: 0.86em;

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--c-text-muted);
  }

  .label {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    color: var(--c-primary);
    letter-spacing: 0.04em;
  }

  .value {
    font-variant-numeric: tabular-nums;
    color: var(--c-text);

    .max {
      color: var(--c-text-dim);
      font-size: 0.85em;
    }
  }

  .track {
    margin-top: 3px;
    height: 7px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.45), rgba(255, 255, 255, 0.03));
    border: 1px solid var(--c-border);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .fill {
    height: 100%;
    background: linear-gradient(90deg, color-mix(in srgb, var(--tone) 55%, transparent), var(--tone));
    box-shadow: 0 0 6px color-mix(in srgb, var(--tone) 60%, transparent);
    transition: width 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent 60%);
    }
  }

  &.is-low {
    .fill {
      animation: pulse 1.6s ease-in-out infinite;
    }
    .value {
      color: var(--c-danger);
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}
</style>
