<template>
  <div class="protag">
    <!-- 姓名头：姓名（大、可点击）+ 气运入口 + 境界（右小字） -->
    <div class="realm-head">
      <!-- 主角头像：读取酒馆用户头像 -->
      <div class="hero-avatar-frame">
        <div v-if="avatarUrl" class="hero-avatar" :style="{ backgroundImage: `url('${avatarUrl}')` }" />
        <Icon v-else name="person" :size="24" class="hero-avatar-placeholder" />
      </div>
      <Icon name="lotus" :size="18" class="realm-icon" />
      <div class="realm-main">
        <div class="name-row">
          <button class="name-btn" type="button" @click="toggleDetail('info')">
            <span class="hero-name">{{ p.姓名 || '无名氏' }}</span>
            <Icon
              :name="activeDetail === 'info' ? 'chevron-left' : 'chevron-right'"
              :size="11"
              class="name-arrow"
            />
          </button>
          <button
            v-if="qiyunCount"
            class="qiyun-btn"
            type="button"
            :class="{ active: activeDetail === 'qiyun' }"
            @click="toggleDetail('qiyun')"
          >
            <Icon name="star" :size="11" />
            <span>气运</span>
            <span class="qiyun-badge">{{ qiyunCount }}</span>
          </button>
        </div>
        <div class="realm-inline">
          <span class="realm-text">{{ p.境界 || '凡人' }}</span>
          <span v-if="p.灵根" class="tag">灵根·{{ p.灵根 }}</span>
          <span v-if="p.所在界" class="tag">{{ p.所在界 }}</span>
          <span v-if="p.宗门" class="tag">{{ p.宗门 }}</span>
        </div>
      </div>
      <div v-if="p.宗门贡献" class="contrib">
        <Icon name="star" :size="12" />
        <span>{{ p.宗门贡献 }}</span>
      </div>
      <!-- 器灵头像 -->
      <div v-if="fairyLines.length" class="fairy" :class="{ show: fairyVisible }">
        <div class="fairy-bubble" v-show="fairyVisible">
          <span class="fairy-text">{{ currentFairyLine }}</span>
        </div>
        <div
          class="fairy-avatar"
          :style="{ backgroundImage: `url('${fairyImages[fairyImgIdx]}')` }"
          title="点击器灵传音"
          @click="toggleFairy"
        ></div>
      </div>
    </div>

    <!-- 二级菜单：外貌 / 穿搭（性别置顶） -->
    <Transition name="fade">
      <div v-if="activeDetail === 'info'" class="detail-panel">
        <div v-if="p.性别" class="detail-line">
          <span class="detail-label">性别</span>
          <span>{{ p.性别 }}</span>
        </div>
        <div v-if="p.容貌" class="detail-line">
          <span class="detail-label">容貌</span>
          <span>{{ p.容貌 }}</span>
        </div>
        <div v-if="p.身形" class="detail-line">
          <span class="detail-label">身形</span>
          <span>{{ p.身形 }}</span>
        </div>
        <div v-if="p.衣着" class="detail-line">
          <span class="detail-label">衣着</span>
          <span>{{ p.衣着 }}</span>
        </div>
        <div v-if="!hasDetail" class="detail-empty">暂无外貌穿搭记录</div>
      </div>
    </Transition>

    <!-- 二级菜单：气运 -->
    <Transition name="fade">
      <div v-if="activeDetail === 'qiyun' && qiyunCount" class="detail-panel qiyun-detail">
        <article v-for="[name, q] in qiyunEntries" :key="name" class="qi-item">
          <div class="qi-head">
            <span class="qi-name">{{ name }}</span>
            <span class="qi-type">{{ q.类型 }}</span>
            <span v-if="q.压制状态 && q.压制状态 !== '无'" class="qi-seal active">封·{{ q.压制状态 }}</span>
          </div>
          <p class="qi-effect">{{ q.效果 }}</p>
          <div class="qi-meta">
            <span><Icon name="spark" :size="11" /> {{ q.使用状态 }}</span>
            <span><Icon name="taiji" :size="11" /> 余 {{ q.剩余次数 }}</span>
          </div>
        </article>
      </div>
    </Transition>

    <!-- 五维 + 道心 -->
    <div class="stats">
      <StatBar label="生命" icon="heart" tone="accent" :value="p.生命" />
      <StatBar label="精血" icon="drop" tone="danger" :value="p.精血" />
      <StatBar label="灵力" icon="spark" tone="primary" :value="p.灵力" />
      <StatBar label="修为" icon="taiji" tone="warn" :value="p.修为" />
      <StatBar label="神识" icon="eye" tone="luck" :value="p.神识" />
      <StatBar label="道心" icon="trigram" tone="mind" :value="p.道心" />
    </div>

    <!-- 状态 / 神念 -->
    <div v-if="p.状态" class="state-line">
      <Icon name="spirit" :size="13" />
      <span>{{ p.状态 }}</span>
    </div>
    <div v-if="p.神念" class="shennian">
      <Icon name="eye" :size="13" />
      <span>{{ p.神念 }}</span>
    </div>

    <button
      v-show="!tabsCollapsed"
      class="tabs-collapse-bar"
      type="button"
      @click="tabsCollapsed = !tabsCollapsed"
    >
      <Icon name="chevron-up" :size="12" />
      <span>收起标签</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import _ from 'lodash';
import Icon from './Icon.vue';
import StatBar from './StatBar.vue';
import type { 主角, 气运详情 } from '../store';

const props = defineProps<{ p: 主角; fairyLines?: string[] }>();
const tabsCollapsed = defineModel<boolean>('tabs-collapsed', { default: false });

type DetailView = 'none' | 'info' | 'qiyun';
const activeDetail = ref<DetailView>('none');

// 主角头像：通过酒馆 API 读取当前用户 persona 头像
const avatarUrl = ref('');
onMounted(async () => {
  try {
    const personaId = await parent.window.TavernHelper.getCurrentPersonaId();
    if (personaId) {
      avatarUrl.value = `${parent.location.origin}/thumbnail?type=persona&file=${encodeURIComponent(personaId)}`;
    }
  } catch { /* 无头像时用占位 */ }
});

function toggleDetail(view: DetailView) {
  activeDetail.value = activeDetail.value === view ? 'none' : view;
}

const hasDetail = !!(props.p.性别 || props.p.容貌 || props.p.身形 || props.p.衣着);

const qiyunEntries = computed(() => Object.entries(props.p.气运 ?? {}) as [string, 气运详情][]);
const qiyunCount = computed(() => qiyunEntries.value.length);

// 器灵
const fairyImages = [
  'https://i.postimg.cc/rpz2PCrZ/Image-1765540443504.jpg',
  'https://i.postimg.cc/B6bsPC8Q/Image-1765540442059.jpg',
];
const fairyLines = computed(() => props.fairyLines ?? []);
const fairyImgIdx = ref(0);
const fairyVisible = ref(false);
const currentFairyLine = ref('');

function toggleFairy() {
  if (fairyVisible.value) {
    fairyVisible.value = false;
    return;
  }
  // 切换头像
  fairyImgIdx.value = (fairyImgIdx.value + 1) % fairyImages.length;
  // 随机选一句台词
  const lines = fairyLines.value;
  currentFairyLine.value = lines.length
    ? lines[Math.floor(Math.random() * lines.length)]
    : '道友，此地天机混沌，竟无一言可示...';
  fairyVisible.value = true;
}
</script>

<style lang="scss" scoped>
.protag {
  padding: 0.45em 0.7em;
  background:
    linear-gradient(180deg, rgba(216, 193, 136, 0.05), transparent 30%),
    var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 4px;
}

.realm-head {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding-bottom: 0.35em;
  margin-bottom: 0.4em;
  border-bottom: 1px solid var(--c-border-gold);

  .hero-avatar-frame {
    flex-shrink: 0;
    width: 2.8em;
    height: 2.8em;
    border: 2px solid var(--c-primary-dim, #8a7a4a);
    border-radius: 4px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 10px rgba(216, 193, 136, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-avatar {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
  }

  .hero-avatar-placeholder {
    color: var(--c-text-dim);
  }

  .realm-icon {
    color: var(--c-primary);
    filter: drop-shadow(0 0 4px rgba(216, 193, 136, 0.5));
  }

  .realm-main {
    flex: 1;
    min-width: 0;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: 0.5em;
    flex-wrap: wrap;
  }

  .name-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    font-family: inherit;

    .hero-name {
      font-size: 1.12em;
      color: var(--c-primary);
      letter-spacing: 0.06em;
      text-shadow: 0 0 6px rgba(216, 193, 136, 0.25);
    }

    .name-arrow {
      color: var(--c-text-dim);
    }

    &:hover .hero-name {
      text-shadow: 0 0 8px rgba(216, 193, 136, 0.45);
    }
  }

  .qiyun-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
    padding: 0.1em 0.45em;
    background: rgba(168, 136, 212, 0.08);
    border: 1px solid var(--c-border);
    border-radius: 2px;
    color: var(--c-text-muted);
    font-size: 0.76em;
    cursor: pointer;
    font-family: inherit;

    .qiyun-badge {
      color: var(--c-luck);
      font-variant-numeric: tabular-nums;
    }

    &:hover,
    &.active {
      border-color: var(--c-luck);
      color: var(--c-luck);
      background: rgba(168, 136, 212, 0.14);
    }
  }

  .realm-inline {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35em;
    margin-top: 0.2em;

    .realm-text {
      font-size: 0.82em;
      color: var(--c-text-muted);
      letter-spacing: 0.03em;
    }

    .tag {
      font-size: 0.74em;
      color: var(--c-text-muted);
      padding: 0.05em 0.45em;
      border: 1px solid var(--c-border);
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.2);
    }
  }

  .contrib {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    color: var(--c-warn);
    font-size: 0.85em;
    font-variant-numeric: tabular-nums;
  }

  /* 器灵 */
  .fairy {
    position: relative;
    flex-shrink: 0;
  }

  .fairy-avatar {
    width: 2.6em;
    height: 2.6em;
    background-size: cover;
    background-position: center;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 0 12px var(--c-primary, #d8c188), 0 0 18px rgba(168, 136, 212, 0.4);
    transition: transform 0.3s, filter 0.3s;

    &:hover {
      transform: scale(1.12) rotate(5deg);
      filter: brightness(1.15);
    }
  }

  .fairy-bubble {
    position: absolute;
    right: calc(100% + 0.5em);
    top: 50%;
    transform: translateY(-50%);
    width: max-content;
    max-width: min(320px, 16em);
    padding: 0.4em 0.7em;
    background: rgba(26, 24, 29, 0.95);
    border: 1px solid var(--c-primary, #d8c188);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 20;

    .fairy-text {
      font-size: 0.78em;
      line-height: 1.5;
      color: var(--c-text);
      display: inline-block;
      word-break: break-word;
    }

    &::after {
      content: '';
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      border: 6px solid transparent;
      border-left-color: var(--c-primary, #d8c188);
    }

    @media (max-width: 520px) {
      max-width: 12em;
    }
  }
}

/* 二级菜单：外貌 / 穿搭 */
.detail-panel {
  margin-bottom: 0.55em;
  padding: 0.5em 0.65em;
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed var(--c-border-gold);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 0.35em;
}

.detail-line {
  display: flex;
  gap: 0.5em;
  font-size: 0.8em;
  line-height: 1.5;
  color: var(--c-text-muted);

  .detail-label {
    flex-shrink: 0;
    color: var(--c-primary-dim, #8a7a4a);
    letter-spacing: 0.05em;

    &::after {
      content: ' ';
    }
  }
}

.detail-empty {
  font-size: 0.8em;
  color: var(--c-text-dim);
  font-style: italic;
}

/* 气运二级菜单 */
.qiyun-detail {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  border-color: rgba(168, 136, 212, 0.35);
}

.qi-item {
  padding: 0.45em 0.6em;
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
    font-size: 0.92em;
    letter-spacing: 0.04em;
  }
  .qi-type {
    color: var(--c-text-muted);
    font-size: 0.76em;
  }
  .qi-seal {
    margin-left: auto;
    font-size: 0.72em;
    padding: 0.05em 0.4em;
    border-radius: 2px;
    color: var(--c-danger);
    border: 1px solid rgba(196, 102, 91, 0.5);
  }
}

.qi-effect {
  margin: 0.25em 0 0.3em;
  font-size: 0.82em;
  line-height: 1.5;
  color: var(--c-text);
}

.qi-meta {
  display: flex;
  gap: 1.2em;
  font-size: 0.74em;
  color: var(--c-text-muted);

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
  }
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4em 1em;
}

.state-line,
.shennian {
  display: flex;
  align-items: flex-start;
  gap: 0.45em;
  margin-top: 0.55em;
  font-size: 0.86em;
  line-height: 1.45;
  color: var(--c-text);

  .dy-icon {
    margin-top: 0.15em;
    color: var(--c-primary);
  }
}

.shennian {
  color: var(--c-text-muted);
  font-style: italic;
}

.tabs-collapse-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
  width: 100%;
  margin-top: 0.6em;
  padding: 0.4em;
  background: transparent;
  border: none;
  border-top: 1px solid var(--c-border-gold);
  border-radius: 0;
  color: var(--c-text-muted);
  font-family: inherit;
  font-size: 0.78em;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--c-primary);
  }
}
</style>
