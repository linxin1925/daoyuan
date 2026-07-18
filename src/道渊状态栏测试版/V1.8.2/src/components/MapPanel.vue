<template>
  <PanelCard title="地图" icon="mountain">
    <div class="map-tabs">
      <button
        v-for="m in maps"
        :key="m.key"
        class="map-tab"
        :class="{ active: activeMap === m.key }"
        type="button"
        @click="activeMap = m.key"
      >
        {{ m.label }}
      </button>
      <button
        v-if="activeMap === 'xuantian'"
        class="map-fullimg-btn"
        type="button"
        @click="toggleFullImage"
      >
        <Icon name="eye" :size="12" />
        <span>{{ showFullImage ? '收起全图' : '查看玄天界全图' }}</span>
      </button>
    </div>

    <!-- 玄天界全图 -->
    <Transition name="fade">
      <div v-if="activeMap === 'xuantian' && showFullImage" class="fullimg-wrap">
        <img
          src="https://free-img.400040.xyz/4/2026/05/17/6a09d0b65af1c.png"
          alt="玄天界全图"
          class="fullimg"
          @click="imageZoom = true"
          @error="onImgError"
        />
        <div v-if="imgError" class="fullimg-err">地图图片加载失败</div>
      </div>
    </Transition>

    <div class="map-canvas">
      <!-- 连线 -->
      <div
        v-for="(line, i) in lines"
        :key="'l' + i"
        class="map-line"
        :style="line.style"
      />
      <!-- 节点 -->
      <button
        v-for="[key, node] in nodes"
        :key="key"
        class="map-node"
        :class="['node-' + nodeTypeClass(key), { active: selectedKey === key }]"
        :style="{ left: node.x + '%', top: node.y + '%', '--node-color': resolveColor(node.color) }"
        type="button"
        :title="node.name"
        @click="selectNode(key)"
      >
        <span class="map-node-dot" />
        <span class="map-node-label">{{ node.name }}</span>
      </button>
    </div>

    <!-- 节点详情 -->
    <Transition name="fade">
      <div v-if="selected" class="map-details" :style="{ '--node-color': resolveColor(selected.color) }">
        <header class="md-head">
          <Icon name="mountain" :size="13" />
          <span class="md-name">{{ selected.name }}</span>
          <span class="md-realm">{{ selected.realm }}</span>
        </header>
        <p class="md-desc">{{ selected.desc }}</p>
        <div v-if="selected.factions?.length" class="md-factions">
          <span
            v-for="f in selected.factions"
            :key="f.name"
            class="faction-tag"
            :class="'tag-' + f.type"
            :title="f.note || ''"
            @click="openFaction(f)"
          >{{ f.name }}</span>
        </div>
      </div>
    </Transition>

    <!-- 势力详情弹窗 -->
    <Teleport to="body">
      <div v-if="activeFaction" class="faction-modal-overlay" @click.self="activeFaction = null">
        <div class="faction-modal" :style="{ '--node-color': resolveColor(selected?.color || '--accent-gold') }">
          <header class="fm-head">
            <Icon name="door" :size="13" />
            <span class="fm-title">【{{ activeFaction.name }}】</span>
            <button class="fm-close" type="button" @click="activeFaction = null">
              <Icon name="close" :size="13" />
            </button>
          </header>
          <div class="fm-body">{{ activeFaction.note || '暂无详细信息' }}</div>
        </div>
      </div>
    </Teleport>

    <!-- 地图图片放大 -->
    <Teleport to="body">
      <div v-if="imageZoom" class="image-zoom-overlay" @click.self="imageZoom = false">
        <img
          src="https://free-img.400040.xyz/4/2026/05/17/6a09d0b65af1c.png"
          alt="玄天界全图"
          class="image-zoom-img"
        />
        <button class="image-zoom-close" type="button" @click="imageZoom = false">
          <Icon name="close" :size="16" />
        </button>
      </div>
    </Teleport>
  </PanelCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import { xuantianLore, xianjieLore, getConnections, resolveColor, type MapData } from '../mapService';

const maps = [
  { key: 'xuantian', label: '玄天界', data: xuantianLore },
  { key: 'xianjie', label: '仙界', data: xianjieLore },
] as const;

const activeMap = ref<'xuantian' | 'xianjie'>('xuantian');
const selectedKey = ref<string | null>(null);

const currentData = computed<MapData>(() => {
  const m = maps.find(m => m.key === activeMap.value);
  return m ? m.data : {};
});

const nodes = computed(() => Object.entries(currentData.value));

const lines = computed(() => {
  const conns = getConnections(currentData.value);
  return conns.map(([a, b]) => {
    const n1 = currentData.value[a];
    const n2 = currentData.value[b];
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return {
      style: {
        width: `calc(${dist}% - 10px)`,
        left: `${n1.x}%`,
        top: `${n1.y}%`,
        transform: `rotate(${angle}deg)`,
      },
    };
  });
});

const selected = computed(() => (selectedKey.value ? currentData.value[selectedKey.value] : null));

const activeFaction = ref<{ name: string; note?: string } | null>(null);
const showFullImage = ref(false);
const imageZoom = ref(false);
const imgError = ref(false);

function openFaction(f: { name: string; note?: string }) {
  activeFaction.value = f;
}

function toggleFullImage() {
  showFullImage.value = !showFullImage.value;
}

function onImgError() {
  imgError.value = true;
}

function nodeTypeClass(key: string): string {
  if (['center', 'north', 'south', 'east', 'west'].includes(key)) return key;
  if (key === 'special_east') return 'special';
  return 'secret';
}

function selectNode(key: string) {
  selectedKey.value = selectedKey.value === key ? null : key;
}
</script>

<style lang="scss" scoped>
.map-tabs {
  display: flex;
  gap: 0.3em;
  margin-bottom: 0.5em;
}

.map-tab {
  flex: 1;
  padding: 0.35em;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  color: var(--c-text-muted);
  font-size: 0.82em;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    border-color: var(--c-primary-dim, #8a7a4a);
  }
  &.active {
    background: rgba(216, 193, 136, 0.12);
    border-color: var(--c-primary);
    color: var(--c-primary);
  }
}

.map-fullimg-btn {
  flex-shrink: 0;
  padding: 0.35em 0.6em;
  background: rgba(216, 193, 136, 0.08);
  border: 1px dashed var(--c-border-gold, #6b5a3a);
  border-radius: 3px;
  color: var(--c-primary);
  font-size: 0.78em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  font-family: inherit;

  &:hover {
    background: rgba(216, 193, 136, 0.14);
  }
}

.fullimg-wrap {
  margin-bottom: 0.5em;
  text-align: center;
}

.fullimg {
  max-width: 100%;
  border-radius: 6px;
  border: 1px solid var(--c-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  cursor: zoom-in;
}

.fullimg-err {
  padding: 1em;
  color: var(--c-text-dim);
  font-size: 0.84em;
  font-style: italic;
}

.image-zoom-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
  padding: 1em;
}

.image-zoom-img {
  max-width: 95vw;
  max-height: 95vh;
  border-radius: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.image-zoom-close {
  position: fixed;
  top: 1em;
  right: 1em;
  width: 2em;
  height: 2em;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--c-border);
  border-radius: 50%;
  color: var(--c-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(196, 102, 91, 0.3);
    border-color: var(--c-danger);
  }
}

.map-canvas {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 0.62;
  background:
    radial-gradient(circle at 50% 50%, rgba(216, 193, 136, 0.04), transparent 70%),
    rgba(0, 0, 0, 0.3);
  border: 1px solid var(--c-border);
  border-radius: 4px;
  margin-bottom: 0.5em;
  overflow: hidden;
}

.map-line {
  position: absolute;
  height: 1px;
  transform-origin: 0 50%;
  background: linear-gradient(90deg, transparent, var(--c-border-gold), transparent);
  opacity: 0.5;
  pointer-events: none;
}

.map-node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15em;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;

  .map-node-dot {
    width: 0.7em;
    height: 0.7em;
    border-radius: 50%;
    background: var(--node-color, var(--c-primary));
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 5px var(--node-color, var(--c-primary));
    transition: transform 0.15s;
  }

  .map-node-label {
    font-size: 0.72em;
    color: var(--c-text-muted);
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }

  &:hover .map-node-dot {
    transform: scale(1.3);
  }

  &.active .map-node-dot {
    transform: scale(1.4);
    box-shadow: 0 0 8px var(--node-color, var(--c-primary)), 0 0 12px var(--node-color, var(--c-primary));
  }

  &.active .map-node-label {
    color: var(--node-color, var(--c-primary));
  }

  &.node-center .map-node-dot { width: 1em; height: 1em; }
}

.map-details {
  padding: 0.5em 0.6em;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--node-color, var(--c-border-gold));
  border-radius: 3px;
}

.md-head {
  display: flex;
  align-items: center;
  gap: 0.4em;
  margin-bottom: 0.3em;

  .dy-icon {
    color: var(--node-color, var(--c-primary));
  }
  .md-name {
    color: var(--node-color, var(--c-primary));
    font-size: 0.94em;
    letter-spacing: 0.04em;
  }
  .md-realm {
    font-size: 0.74em;
    color: var(--c-text-muted);
    padding: 0.05em 0.35em;
    border: 1px solid var(--c-border);
    border-radius: 2px;
  }
}

.md-desc {
  margin: 0 0 0.4em;
  font-size: 0.8em;
  line-height: 1.5;
  color: var(--c-text-muted);
}

.md-factions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3em;
}

.faction-tag {
  font-size: 0.72em;
  padding: 0.1em 0.4em;
  border-radius: 2px;
  border: 1px solid var(--c-border);
  color: var(--c-text-muted);
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
  }

  &.tag-human { color: var(--c-primary); border-color: rgba(216, 193, 136, 0.4); }
  &.tag-demon { color: var(--c-danger); border-color: rgba(196, 102, 91, 0.4); }
  &.tag-monster { color: var(--c-luck); border-color: rgba(168, 136, 212, 0.4); }
  &.tag-blood { color: var(--c-danger); border-color: rgba(196, 102, 91, 0.4); }
  &.tag-neutral { color: var(--c-text-dim); }
}

/* 势力详情弹窗 */
.faction-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 0.6em;
}

.faction-modal {
  width: 100%;
  max-width: 340px;
  background: var(--c-bg-panel, #1a181d);
  border: 1px solid var(--node-color, var(--c-border-gold));
  border-radius: 4px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.fm-head {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.55em 0.7em;
  border-bottom: 1px solid var(--c-border);
  background: rgba(216, 193, 136, 0.06);

  .dy-icon {
    color: var(--node-color, var(--c-primary));
  }
  .fm-title {
    flex: 1;
    color: var(--node-color, var(--c-primary));
    font-size: 0.94em;
    letter-spacing: 0.04em;
  }
  .fm-close {
    background: transparent;
    border: none;
    color: var(--c-text-muted);
    cursor: pointer;
    padding: 0.1em;
    display: inline-flex;
    &:hover { color: var(--c-text); }
  }
}

.fm-body {
  padding: 0.65em 0.75em;
  font-size: 0.84em;
  line-height: 1.6;
  color: var(--c-text-muted);
  max-height: 50vh;
  overflow-y: auto;
}
</style>
