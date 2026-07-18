<template>
  <PanelCard title="人物" icon="person" :count="count">
    <div v-if="count" class="npc-list">
      <article v-for="[name, n] in entries" :key="name" class="npc-item">
        <button
          v-if="hasPortrait(name, n.性别)"
          class="npc-thumb"
          type="button"
          title="查看立绘"
          @click.stop="openPortrait(name, n.性别)"
        >
          <img :src="getPortraitUrl(name, n.性别)" :alt="name" class="npc-thumb-img" @error="onThumbError" />
        </button>
        <button
          v-else
          class="npc-thumb npc-thumb-empty"
          type="button"
          title="上传立绘"
          @click.stop="openPortrait(name, n.性别)"
        >
          <Icon name="plus" :size="16" />
        </button>
        <div class="npc-main">
          <div class="npc-head">
            <div class="npc-id">
              <div class="npc-name">
                {{ name }}
                <span v-if="n.头衔" class="npc-title">{{ n.头衔 }}</span>
              </div>
              <div class="npc-realm">{{ n.境界 }}</div>
            </div>
            <span class="npc-rel" :data-stage="n.关系阶段">{{ n.关系阶段 }}</span>
          </div>

          <div class="npc-favor">
            <span class="fav-label">好感</span>
            <div class="fav-track"><div class="fav-fill" :style="{ width: favorPct(n.好感) + '%' }" /></div>
            <span class="fav-num">{{ n.好感 ?? 0 }}</span>
          </div>

          <div class="npc-stats">
            <span>命 {{ n.生命 ?? 0 }}</span>
            <span>灵 {{ n.灵力 ?? 0 }}</span>
            <span>修 {{ n.修为 ?? 0 }}</span>
            <span>心 {{ n.道心 ?? 0 }}</span>
          </div>

          <p v-if="n.性格 || n.描述" class="npc-desc">
            <span v-if="n.性格" class="npc-char">{{ n.性格 }}</span>
            {{ n.描述 }}
          </p>
        </div>
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
    <div v-else class="empty-hint"><Icon name="person" :size="14" /> 暂无相识之人</div>

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
import { deleteStatEntry } from '../services/deleteEntry';
import type { NPC } from '../store';

const props = defineProps<{ 人物: Record<string, NPC> }>();
const entries = computed(() => Object.entries(props.人物 ?? {}));
const count = computed(() => entries.value.length);

function onThumbError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none';
}

async function onDelete(name: string) {
  if (!confirm('确定删除人物「' + name + '」？此操作同步到楼层变量。')) return;
  await deleteStatEntry('人物', name);
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

function favorPct(v: number): number {
  return _.clamp((Number(v) || 0) / 100 * 100, 0, 100);
}
</script>

<style lang="scss" scoped>
.npc-list {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.npc-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5em;
  padding: 0.5em 2.2em 0.5em 0.65em;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--c-border);
  border-radius: 3px;
}

.npc-thumb {
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
    border-color: var(--c-primary);
  }

  .npc-thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.npc-thumb-empty {
  color: var(--c-text-dim);

  &:hover {
    transform: scale(1.05);
    border-color: var(--c-primary);
    color: var(--c-primary);
  }
}

.npc-main {
  flex: 1;
  min-width: 0;
}

.npc-head {
  display: flex;
  align-items: center;
  gap: 0.5em;

  .npc-id {
    flex: 1;
    min-width: 0;
  }

  .npc-name {
    color: var(--c-text);
    font-size: 0.94em;

    .npc-title {
      margin-left: 0.4em;
      font-size: 0.76em;
      color: var(--c-text-muted);
    }
  }

  .npc-realm {
    font-size: 0.76em;
    color: var(--c-warn);
  }

  .npc-rel {
    font-size: 0.72em;
    padding: 0.05em 0.4em;
    border-radius: 2px;
    color: var(--c-luck);
    border: 1px solid rgba(168, 136, 212, 0.4);
    background: rgba(168, 136, 212, 0.06);
  }
}

.npc-favor {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-top: 0.45em;
  font-size: 0.74em;
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

.npc-stats {
  display: flex;
  gap: 0.9em;
  margin-top: 0.4em;
  font-size: 0.72em;
  color: var(--c-text-dim);
  font-variant-numeric: tabular-nums;
}

.npc-desc {
  margin: 0.35em 0 0;
  font-size: 0.8em;
  line-height: 1.5;
  color: var(--c-text-muted);

  .npc-char {
    color: var(--c-accent);
    margin-right: 0.3em;
  }
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

/* 窄屏：立绘浮动，长文字环绕填进图下方空白，省行高 */
@media (max-width: 520px) {
  .npc-item { display: block; }
  .npc-thumb { float: left; margin: 0 0.6em 0.4em 0; }
  .npc-main { display: block; width: auto; overflow: visible; flex: none; }
}
</style>
