<template>
  <PanelCard title="灵宠" icon="spirit" :count="count">
    <div v-if="count" class="pet-list">
      <article v-for="[name, p] in entries" :key="name" class="pet-item">
        <button
          v-if="hasPortrait(name, gender(p))"
          class="pet-thumb"
          type="button"
          title="查看立绘"
          @click.stop="openPortrait(name, gender(p))"
        >
          <img :src="getPortraitUrl(name, gender(p))" :alt="name" class="pet-thumb-img" @error="onThumbError" />
        </button>
        <button
          v-else
          class="pet-thumb pet-thumb-empty"
          type="button"
          title="上传立绘"
          @click.stop="openPortrait(name, gender(p))"
        >
          <Icon name="plus" :size="16" />
        </button>
        <div class="pet-main">
          <div class="pet-head">
            <Icon name="spirit" :size="14" class="pet-icon" />
            <div class="pet-id">
              <div class="pet-name">{{ name }}</div>
              <div v-if="species(p) || realm(p)" class="pet-sub">
                <span v-if="species(p)">{{ species(p) }}</span>
                <span v-if="realm(p)">{{ realm(p) }}</span>
              </div>
            </div>
            <span v-if="status(p)" class="pet-status">{{ status(p) }}</span>
          </div>

          <div v-if="hasLoyalty(p)" class="pet-loyal">
            <span class="loyal-label">亲密度</span>
            <div class="loyal-track"><div class="loyal-fill" :style="{ width: loyalPct(p) + '%' }" /></div>
            <span class="loyal-num">{{ loyalty(p) }}</span>
          </div>

          <div v-if="stats(p).length" class="pet-stats">
            <span v-for="s in stats(p)" :key="s.label">{{ s.label }} {{ s.value }}</span>
          </div>

          <p v-if="appearance(p)" class="pet-appear">{{ appearance(p) }}</p>
          <p v-if="abilities(p)" class="pet-abilities"><strong>神通：</strong>{{ abilities(p) }}</p>
          <p v-if="desc(p)" class="pet-desc">{{ desc(p) }}</p>
        </div>
      </article>
    </div>
    <div v-else class="empty-hint"><Icon name="spirit" :size="14" /> 尚无灵宠相随</div>

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

const props = defineProps<{ 灵宠: Record<string, unknown> }>();
const entries = computed(() => Object.entries(props.灵宠 ?? {}));
const count = computed(() => entries.value.length);

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

function get(obj: unknown, key: string): unknown {
  return _.isPlainObject(obj) ? _.get(obj, key) : undefined;
}

function str(obj: unknown, key: string): string {
  const v = get(obj, key);
  return typeof v === 'string' ? v : '';
}

function species(p: unknown): string {
  return str(p, '种族') || str(p, 'species') || str(p, '类型');
}

function realm(p: unknown): string {
  return str(p, '境界') || str(p, 'realm');
}

function status(p: unknown): string {
  return str(p, '状态') || str(p, 'status');
}

function gender(p: unknown): string {
  return str(p, '性别') || str(p, 'gender');
}

function hasLoyalty(p: unknown): boolean {
  const v = get(p, '亲密度') ?? get(p, 'loyalty') ?? get(p, '好感');
  return typeof v === 'number' || (typeof v === 'string' && !Number.isNaN(Number(v)));
}

function loyalty(p: unknown): number {
  const v = get(p, '亲密度') ?? get(p, 'loyalty') ?? get(p, '好感');
  return Number(v) || 0;
}

function loyalPct(p: unknown): number {
  return _.clamp((loyalty(p) / 100) * 100, 0, 100);
}

function appearance(p: unknown): string {
  return str(p, '外貌') || str(p, 'appearance') || str(p, '形态');
}

function abilities(p: unknown): string {
  return str(p, '神通') || str(p, 'abilities') || str(p, '能力');
}

function desc(p: unknown): string {
  return str(p, '描述') || str(p, 'desc') || str(p, '背景');
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
</script>

<style lang="scss" scoped>
.pet-list {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.pet-item {
  display: flex;
  align-items: flex-start;
  gap: 0.55em;
  padding: 0.55em 0.7em;
  background: rgba(95, 179, 196, 0.05);
  border: 1px solid rgba(95, 179, 196, 0.25);
  border-radius: 3px;
}

.pet-thumb {
  flex-shrink: 0;
  width: 2.8em;
  height: 3.5em;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--c-border-gold, #6b5a3a);
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.05);
    border-color: var(--c-mind);
  }

  .pet-thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.pet-thumb-empty {
  color: var(--c-text-dim);

  &:hover {
    transform: scale(1.05);
    border-color: var(--c-mind);
    color: var(--c-mind);
  }
}

.pet-main {
  flex: 1;
  min-width: 0;
}

.pet-head {
  display: flex;
  align-items: center;
  gap: 0.5em;

  .pet-icon {
    color: var(--c-mind);
  }

  .pet-id {
    flex: 1;
    min-width: 0;
  }

  .pet-name {
    color: var(--c-text);
    font-size: 0.96em;
    letter-spacing: 0.04em;
  }

  .pet-sub {
    display: flex;
    gap: 0.4em;
    font-size: 0.76em;
    color: var(--c-text-muted);
  }

  .pet-status {
    margin-left: auto;
    font-size: 0.74em;
    padding: 0.05em 0.4em;
    border-radius: 2px;
    color: var(--c-mind);
    border: 1px solid rgba(95, 179, 196, 0.4);
    background: rgba(95, 179, 196, 0.06);
  }
}

.pet-loyal {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-top: 0.45em;
  font-size: 0.76em;
  color: var(--c-text-muted);

  .loyal-track {
    flex: 1;
    height: 4px;
    background: var(--c-border);
    border-radius: 2px;
    overflow: hidden;
  }
  .loyal-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--c-mind), #7fc8d6);
  }
  .loyal-num {
    font-variant-numeric: tabular-nums;
    color: var(--c-text);
  }
}

.pet-stats {
  display: flex;
  gap: 0.9em;
  margin-top: 0.4em;
  font-size: 0.74em;
  color: var(--c-text-dim);
  font-variant-numeric: tabular-nums;
}

.pet-appear,
.pet-abilities,
.pet-desc {
  margin: 0.35em 0 0;
  font-size: 0.82em;
  line-height: 1.5;
  color: var(--c-text-muted);
}

.pet-appear {
  color: var(--c-text);
}

.pet-abilities strong {
  color: var(--c-primary);
  font-weight: normal;
}

/* 窄屏：立绘浮动，长文字环绕填进图下方空白，省行高 */
@media (max-width: 520px) {
  .pet-item { display: block; }
  .pet-thumb { float: left; margin: 0 0.6em 0.4em 0; }
  .pet-main { display: block; width: auto; overflow: visible; flex: none; }
}
</style>
