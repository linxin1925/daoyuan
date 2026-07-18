<template>
  <PanelCard title="道侣" icon="crane">
    <div v-if="count" class="partner-list">
      <article v-for="[name, p] in entries" :key="name" class="partner-item">
        <button
          v-if="hasPortrait(name, str(p, '性别'))"
          class="partner-thumb"
          type="button"
          title="查看立绘"
          @click.stop="openPortrait(name, str(p, '性别'))"
        >
          <img :src="getPortraitUrl(name, str(p, '性别'))" :alt="name" class="partner-thumb-img" @error="onThumbError" />
        </button>
        <button
          v-else
          class="partner-thumb partner-thumb-empty"
          type="button"
          title="上传立绘"
          @click.stop="openPortrait(name, str(p, '性别'))"
        >
          <Icon name="plus" :size="16" />
        </button>
        <div class="partner-main">
          <div class="partner-head">
            <div class="partner-id">
              <div class="partner-name">{{ name }}</div>
              <div v-if="str(p, '境界')" class="partner-realm">{{ str(p, '境界') }}</div>
            </div>
            <div v-if="meta(p).length" class="partner-meta">
              <span v-for="m in meta(p)" :key="m.label" class="meta-tag">{{ m.label }}·{{ m.value }}</span>
            </div>
            <span v-if="str(p, '状态')" class="partner-status">{{ str(p, '状态') }}</span>
          </div>

          <div v-if="hasFavor(p)" class="partner-favor">
            <span class="fav-label">亲密</span>
            <div class="fav-track"><div class="fav-fill" :style="{ width: favorPct(p) + '%' }" /></div>
            <span class="fav-num">{{ favor(p) }}</span>
          </div>

          <div v-if="stats(p).length" class="partner-stats">
            <span v-for="s in stats(p)" :key="s.label">{{ s.label }} {{ s.value }}</span>
          </div>

          <p v-if="str(p, '性格')" class="partner-line partner-char">
            <span class="field-label">性格</span>{{ str(p, '性格') }}
          </p>
          <p v-if="str(p, '外观')" class="partner-line">
            <span class="field-label">外观</span>{{ str(p, '外观') }}
          </p>
          <p v-if="str(p, '神通')" class="partner-line partner-art">
            <span class="field-label">神通</span>{{ str(p, '神通') }}
          </p>
          <p v-if="str(p, '背景')" class="partner-line">
            <span class="field-label">背景</span>{{ str(p, '背景') }}
          </p>
          <p v-if="str(p, '心声')" class="partner-voice">
            <span class="field-label">心声</span>「{{ str(p, '心声') }}」
          </p>
        </div>
      </article>
    </div>
    <div v-else class="empty-hint"><Icon name="crane" :size="14" /> 红尘未结，道侣无踪</div>

    <PortraitModal
      v-if="portraitName"
      :char-name="portraitName"
      :gender="portraitGender"
      @close="closePortrait"
    />
  </PanelCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import _ from 'lodash';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import PortraitModal from './PortraitModal.vue';
import { hasPortrait, getPortraitUrl } from '../portraitService';

const props = defineProps<{ 道侣: Record<string, unknown> }>();

function onThumbError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none';
}

const portraitName = ref<string | null>(null);
const portraitGender = ref<string | undefined>(undefined);
function openPortrait(name: string, gender?: string) {
  portraitName.value = name;
  portraitGender.value = gender;
}
function closePortrait() {
  portraitName.value = null;
}
const entries = computed(() => Object.entries(props.道侣 ?? {}));
const count = computed(() => entries.value.length);

function get(obj: unknown, key: string): unknown {
  return _.isPlainObject(obj) ? _.get(obj, key) : undefined;
}

function str(obj: unknown, key: string): string {
  const v = get(obj, key);
  if (v == null) return '';
  return typeof v === 'string' ? v : String(v);
}

function hasFavor(p: unknown): boolean {
  const f = get(p, '亲密');
  return typeof f === 'number' || (typeof f === 'string' && !Number.isNaN(Number(f)));
}

function favor(p: unknown): number {
  return Number(get(p, '亲密')) || 0;
}

function favorPct(p: unknown): number {
  return _.clamp(favor(p), 0, 100);
}

function stats(p: unknown): Array<{ label: string; value: number }> {
  const keys = [
    { label: '命', key: '生命' },
    { label: '灵', key: '灵力' },
    { label: '修', key: '修为' },
    { label: '心', key: '道心' },
  ];
  return keys
    .map(({ label, key }) => ({ label, value: Number(get(p, key)) || 0 }))
    .filter(s => s.value > 0);
}

function meta(p: unknown): Array<{ label: string; value: string }> {
  const keys = ['性别', '种族', '身高'];
  return keys
    .map(k => ({ label: k, value: str(p, k) }))
    .filter(m => m.value);
}
</script>

<style lang="scss" scoped>
.partner-list {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.partner-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5em;
  padding: 0.55em 0.7em;
  background: rgba(196, 102, 91, 0.05);
  border: 1px solid rgba(196, 102, 91, 0.25);
  border-radius: 3px;
}

.partner-thumb {
  flex-shrink: 0;
  width: 2.8em;
  height: 3.5em;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(196, 102, 91, 0.4);
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.05);
    border-color: var(--c-danger);
  }

  .partner-thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.partner-thumb-empty {
  color: var(--c-danger);

  &:hover {
    transform: scale(1.05);
    border-color: var(--c-danger);
    color: var(--c-danger);
  }
}

.partner-main {
  flex: 1;
  min-width: 0;
}

.partner-head {
  display: flex;
  align-items: center;
  gap: 0.5em;

  .partner-id {
    flex: 0 1 auto;
    min-width: 0;
  }

  .partner-name {
    color: var(--c-text);
    font-size: 0.96em;
    letter-spacing: 0.04em;
  }

  .partner-realm {
    font-size: 0.76em;
    color: var(--c-warn);
  }

  .partner-status {
    margin-left: auto;
    font-size: 0.72em;
    padding: 0.05em 0.4em;
    border-radius: 2px;
    color: var(--c-danger);
    border: 1px solid rgba(196, 102, 91, 0.4);
    background: rgba(196, 102, 91, 0.06);
  }
}

.partner-favor {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-top: 0.45em;
  font-size: 0.76em;
  color: var(--c-text-muted);

  .fav-track {
    flex: 1;
    height: 4px;
    background: var(--c-border);
    border-radius: 2px;
    overflow: hidden;
  }
  .fav-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--c-danger), #e08a7e);
    box-shadow: 0 0 5px rgba(196, 102, 91, 0.4);
  }
  .fav-num {
    font-variant-numeric: tabular-nums;
    color: var(--c-text);
  }
}

.partner-stats {
  display: flex;
  gap: 0.9em;
  margin-top: 0.4em;
  font-size: 0.74em;
  color: var(--c-text-dim);
  font-variant-numeric: tabular-nums;
}

.partner-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3em 0.6em;
  font-size: 0.74em;
  color: var(--c-text-muted);

  .meta-tag {
    font-variant-numeric: tabular-nums;
  }
}

.partner-line {
  margin: 0.35em 0 0;
  font-size: 0.8em;
  line-height: 1.5;
  color: var(--c-text-muted);
}

.partner-char {
  color: var(--c-accent);
}

.partner-art {
  color: var(--c-warn);
}

.partner-voice {
  margin: 0.4em 0 0;
  font-size: 0.8em;
  line-height: 1.5;
  font-style: italic;
  color: var(--c-text-dim);
}

.field-label {
  display: inline-block;
  margin-right: 0.35em;
  font-size: 0.86em;
  font-style: normal;
  color: var(--c-text-dim);
  letter-spacing: 0.05em;

  &::after {
    content: ' ';
  }
}

/* 窄屏：立绘浮动，长文字环绕填进图下方空白，省行高 */
@media (max-width: 520px) {
  .partner-item { display: block; }
  .partner-thumb { float: left; margin: 0 0.6em 0.4em 0; }
  .partner-main { display: block; width: auto; overflow: visible; flex: none; }
}
</style>
