<template>
  <PanelCard title="绝色榜" icon="flower" :count="count">
    <template #action>
      <button class="beauty-settings-btn" type="button" title="群芳谱·论坛设定" @click="showSettings = true">
        <Icon name="gear" :size="12" />
      </button>
    </template>
    <div v-if="count" class="rank-list">
      <article v-for="[name, r] in entries" :key="name" class="rank-item">
        <button
          v-if="hasPortrait(name, '女')"
          class="rank-thumb"
          type="button"
          title="查看立绘"
          @click.stop="openPortrait(name)"
        >
          <img :src="getPortraitUrl(name, '女')" :alt="name" class="rank-thumb-img" @error="onThumbError" />
        </button>
        <button
          v-else
          class="rank-thumb rank-thumb-empty"
          type="button"
          title="上传立绘"
          @click.stop="openPortrait(name)"
        >
          <Icon name="plus" :size="18" />
        </button>

        <div class="rank-main">
          <div class="rank-head">
            <span class="rank-name">{{ name }}</span>
            <span v-if="r.头衔" class="rank-title">{{ r.头衔 }}</span>
            <daoyuan-applause
              v-if="applauseId(name) !== undefined"
              :character-id="String(applauseId(name))"
              :aria-label="`为${name}点赞`"
              class="rank-applause"
              @daoyuan-applause-error="onApplauseError"
              @daoyuan-applause-state-change="onApplauseStateChange($event, name)"
              @pointerdown="onApplausePointerDown($event, name)"
            >
              <span class="rank-applause__icon" aria-hidden="true">👏</span>
              <span class="rank-applause__label">点赞</span>
            </daoyuan-applause>
            <span v-if="r.排名" class="rank-no">第{{ rankText(r.排名) }}名</span>
          </div>

          <div v-if="r.仙姿" class="rank-zixian">
            <span class="rz-label">仙姿</span>
            <span class="rz-text">{{ r.仙姿 }}</span>
          </div>

          <p v-if="r.群芳谱" class="rank-note">
            <span class="rn-label">群芳谱</span>
            <span class="rn-text">{{ r.群芳谱 }}</span>
          </p>

          <!-- 群芳谱论坛区域 -->
          <div class="forum-area">
            <div class="forum-toolbar">
              <button
                class="forum-toggle"
                type="button"
                @click="toggleForum(name)"
              >
                <Icon name="pen" :size="12" />
                <span>{{ forumReplyCount(name) }}</span>
              </button>
            </div>

            <!-- 展开的回帖列表 -->
            <div v-if="expandedForum === name" class="forum-body">
              <div v-if="repliesOf(name).length" class="forum-replies">
                <div
                  v-for="(reply, ri) in repliesOf(name)"
                  :key="ri"
                  class="forum-reply"
                  :class="{ 'is-reply': reply.replyTo != null && reply.replyTo >= 0 }"
                >
                  <div v-if="reply.replyTo != null && reply.replyTo >= 0" class="fr-ref-line">
                    <Icon name="corner-down-right" :size="13" />
                  </div>
                  <div class="fr-body">
                    <div class="fr-head">
                      <span class="fr-sender">匿名道友</span>
                      <span class="fr-floor">#{{ reply.floor }}</span>
                      <span class="fr-time">{{ reply.time }}</span>
                      <button
                        class="fr-like"
                        type="button"
                        :class="{ liked: reply.liked }"
                        @click="toggleLike(name, ri)"
                      >
                        ❤ {{ reply.likes }}
                      </button>
                      <button
                        class="fr-del"
                        type="button"
                        title="删除此回帖"
                        @click="deleteReply(name, ri)"
                      >
                        <Icon name="trash" :size="10" />
                      </button>
                    </div>
                    <div class="fr-content">{{ reply.content }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="forum-empty">暂无回帖，发表首评</div>

              <div class="forum-input-row">
                <textarea
                  :value="inputOf(name)"
                  class="forum-input"
                  placeholder="输入回帖内容... (Enter 发送)"
                  :disabled="sending"
                  rows="1"
                  @input="setInput(name, ($event.target as HTMLTextAreaElement).value)"
                  @keydown.enter.exact.prevent="sendReply(name)"
                ></textarea>
                <button
                  class="forum-send"
                  type="button"
                  :disabled="sending || !(inputOf(name)).trim()"
                  @click="sendReply(name)"
                >
                  <Icon name="send" :size="12" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty-hint"><Icon name="flower" :size="14" /> 群芳谱尚虚位以待</div>

    <PortraitModal
      v-if="portraitName"
      :char-name="portraitName"
      @close="closePortrait"
    />

    <ForumSettingsModal
      v-if="showSettings"
      @close="showSettings = false"
    />
  </PanelCard>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue';
import _ from 'lodash';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import PortraitModal from './PortraitModal.vue';
import ForumSettingsModal from './ForumSettingsModal.vue';
import { hasPortrait, getPortraitUrl } from '../portraitService';
import { ensureRegistryLoaded, lookupCharacterId } from '../applauseRegistry';
import { loadForumSettings, buildForumInjectContent, callForumGenerateReply } from '../services/forumService';
import type { 绝色榜条目 } from '../store';

interface ForumReply {
  id: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
  replyTo?: number;
  floor: number;
}

/* ---- 全局状态（挂 window 避免切标签丢失） ---- */
const K = '__beauty_forum_store__';
function getStore(): { replies: Record<string, ForumReply[]>; inputs: Record<string, string> } {
  const w = window as any;
  if (!w[K]) w[K] = reactive({ replies: {}, inputs: {} });
  return w[K];
}
const _store = getStore();

const props = defineProps<{ 绝色榜: Record<string, 绝色榜条目> }>();
const entries = computed(() => Object.entries(props.绝色榜 ?? {}));
const count = computed(() => entries.value.length);

/* ---- 道渊点赞 ---- */
// registryTick：fetch 完成后自增，触发 applauseId 重算，避免首次渲染闪烁
const registryTick = ref(0);
onMounted(() => {
  ensureRegistryLoaded().then(() => {
    registryTick.value++;
  });
});
function applauseId(name: string): number | undefined {
  void registryTick.value; // 依赖 tick 触发重算
  return lookupCharacterId(name);
}
function onApplauseError() {
  if (typeof toastr !== 'undefined') toastr.error('点赞失败，请重试');
}
// 记录每个角色上次是否 disabled，检测 false->true 变化（额度耗尽）
const applauseDisabledPrev = new Map<string, boolean>();
// 节流：同一角色额度提示间隔，避免 pointerdown 重复弹
const applauseToastAt = new Map<string, number>();
const TOAST_THROTTLE = 3000;
function toastQuota(name: string) {
  const now = Date.now();
  if (now - (applauseToastAt.get(name) ?? 0) < TOAST_THROTTLE) return;
  applauseToastAt.set(name, now);
  if (typeof toastr !== 'undefined') toastr.warning('点赞额度已用完，请稍后再试');
}
function onApplauseStateChange(event: CustomEvent, name: string) {
  const detail = event.detail || {};
  const disabled = !!detail.disabled;
  const surface = detail.surface || 'closed';
  const prev = applauseDisabledPrev.get(name) ?? false;
  applauseDisabledPrev.set(name, disabled);
  // disabled 由 false 变 true，且不是认证流程（认证会弹 auth surface）= 额度耗尽
  if (disabled && !prev && surface !== 'auth') {
    toastQuota(name);
  }
}
// 按钮已 disabled 时点击无反应，补一个提示（捕获 pointerdown）
function onApplausePointerDown(event: PointerEvent, name: string) {
  const el = event.currentTarget as HTMLElement;
  if (el.hasAttribute('data-disabled')) toastQuota(name);
}

/* ---- 群芳谱论坛 ---- */
const expandedForum = ref<string | null>(null);
const sending = ref(false);
const showSettings = ref(false);

function repliesOf(name: string): ForumReply[] {
  if (!_store.replies[name]) _store.replies[name] = [];
  return _store.replies[name];
}
function inputOf(name: string): string {
  return _store.inputs[name] || '';
}
function setInput(name: string, val: string) {
  _store.inputs[name] = val;
}

function toggleForum(name: string) {
  expandedForum.value = expandedForum.value === name ? null : name;
}

function forumReplyCount(name: string): string {
  const list = _store.replies[name];
  return list?.length ? `回帖 ${list.length}` : '回帖';
}

function toggleLike(name: string, idx: number) {
  const list = _store.replies[name];
  if (!list || !list[idx]) return;
  list[idx].liked = !list[idx].liked;
  list[idx].likes += list[idx].liked ? 1 : -1;
}

function now(): string {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function uid(): string {
  return 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

function deleteReply(name: string, idx: number) {
  const list = _store.replies[name];
  if (!list || !list[idx]) return;
  if (!confirm('删除此回帖？')) return;
  list.splice(idx, 1);
}

async function sendReply(name: string) {
  const text = (_store.inputs[name] || '').trim();
  if (!text || sending.value) return;

  setInput(name, '');
  sending.value = true;

  const list = repliesOf(name);
  const userFloor = list.length + 1;
  const lastReply = list.length > 0 ? list[list.length - 1] : null;
  list.push({ id: uid(), content: text, time: now(), likes: 0, liked: false, replyTo: lastReply?.floor ?? -1, floor: userFloor });

  try {
    const settings = loadForumSettings();
    const entry = props.绝色榜[name];
    const history = list.map(r => ({ content: r.content, floor: r.floor }));
    const inject = buildForumInjectContent(name, entry?.仙姿 || '', entry?.群芳谱 || '', history, text, settings);
    const reply = await callForumGenerateReply(inject, settings);

    const aiFloor = list.length + 1;
    const randomLikes = Math.floor(Math.random() * 6);
    list.push({ id: uid(), content: reply.trim(), time: now(), likes: randomLikes, liked: false, replyTo: userFloor, floor: aiFloor });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (typeof toastr !== 'undefined') toastr.error(msg);
    setInput(name, text);
  } finally {
    sending.value = false;
  }
}

/* ---- 原有逻辑 ---- */
function onThumbError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none';
}

function rankText(rank: string | number): string {
  return String(rank);
}

const portraitName = ref<string | null>(null);
function openPortrait(name: string) {
  portraitName.value = name;
}
function closePortrait() {
  portraitName.value = null;
}
</script>

<style lang="scss" scoped>
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.rank-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6em;
  padding: 0.5em 0.6em;
  background: linear-gradient(135deg, rgba(168, 136, 212, 0.06), transparent);
  border: 1px solid var(--c-border);
  border-radius: 3px;
}

.rank-thumb {
  flex-shrink: 0;
  width: 4.5em;
  height: 5.8em;
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
  &:hover { transform: scale(1.05); border-color: var(--c-luck); }
  .rank-thumb-img { width: 100%; height: 100%; object-fit: cover; }
}

.rank-thumb-empty { color: var(--c-text-dim); &:hover { transform: scale(1.05); border-color: var(--c-luck); color: var(--c-luck); } }

.rank-main { flex: 1; min-width: 0; }

.rank-head {
  display: flex;
  align-items: baseline;
  gap: 0.4em;
  flex-wrap: wrap;
  .rank-name { color: var(--c-luck); font-size: 0.95em; letter-spacing: 0.04em; }
  .rank-title { font-size: 0.74em; color: var(--c-text-muted); }
  .rank-no { font-size: 0.76em; color: var(--c-primary); padding: 0.05em 0.45em; border: 1px solid var(--c-border-gold); border-radius: 2px; background: rgba(0,0,0,0.3); font-variant-numeric: tabular-nums; }
}

/* 道渊点赞按钮 */
.rank-applause {
  display: inline-flex;
  margin-left: auto;
  vertical-align: baseline;
  font-size: 0.76em;

  &::part(surface) {
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--c-border-gold);
    border-radius: 2px;
    color: var(--c-primary);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    justify-content: center;
    padding: 0.05em 0.45em;
  }

  &::part(visual) {
    gap: 0.2em;
  }

  .rank-applause__icon { line-height: 1; }

  &[data-busy],
  &[data-runtime-blocked] {
    cursor: wait;
    opacity: 0.72;
  }
  &[disabled],
  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.48;
  }
}

/* 窄屏：点赞按钮只显图标，避免 rank-head 换行过多 */
@media (max-width: 520px) {
  .rank-applause .rank-applause__label { display: none; }
  /* 立绘缩略图拉长填满整条高度，消除图下方空白 */
  .rank-thumb {
    align-self: stretch;
    height: auto;
    min-height: 5.8em;
  }
  .rank-thumb .rank-thumb-img { width: 100%; height: 100%; object-fit: cover; }
}

.rank-zixian { margin-top: 0.25em; font-size: 0.8em; line-height: 1.5; color: var(--c-text-muted); .rz-label { color: var(--c-warn); margin-right: 0.35em; letter-spacing: 0.05em; &::after { content: '：'; } } .rz-text { color: var(--c-warn); opacity: 0.9; } }

.rank-note { margin: 0.2em 0 0; font-size: 0.8em; line-height: 1.5; color: var(--c-text-muted); .rn-label { color: var(--c-luck); font-style: normal; margin-right: 0.35em; letter-spacing: 0.05em; &::after { content: '：'; } } .rn-text { color: var(--c-text-dim); font-style: italic; } }

/* 绝色榜标题右侧设置按钮 */
.beauty-settings-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.15em 0.3em;
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: 2px;
  color: var(--c-text-dim);
  cursor: pointer;
  margin-left: auto;
  &:hover { color: var(--c-primary); border-color: var(--c-primary-dim); }
}

/* ---- 论坛区域 ---- */
.forum-area { margin-top: 0.4em; border-top: 1px dashed var(--c-border); padding-top: 0.35em; }

.forum-toolbar {
  display: flex;
  align-items: center;
  gap: 0.3em;
}

.forum-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.15em 0.45em;
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: 2px;
  color: var(--c-text-dim);
  font-size: 0.74em;
  cursor: pointer;
  font-family: inherit;
  &:hover { color: var(--c-luck); border-color: var(--c-luck); }
}

.forum-body { margin-top: 0.35em; }

.forum-replies {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.25em 0.3em;
  background: rgba(0,0,0,0.12);
  border-radius: 3px;
}

.forum-reply {
  display: flex;
  align-items: flex-start;
  gap: 0.25em;
  padding: 0.3em 0.4em;
  background: rgba(0,0,0,0.15);
  border-radius: 2px;
  font-size: 0.85em;

  &.is-reply {
    font-size: 0.78em;
    color: var(--c-text-muted);
    border-left: 1px solid var(--c-border);
    border-radius: 0 2px 2px 0;
    background: rgba(0,0,0,0.08);
  }
}

.fr-ref-line {
  flex-shrink: 0;
  padding-top: 0.2em;
  color: var(--c-primary-dim);
}

.fr-body {
  flex: 1;
  min-width: 0;
}

.fr-head {
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.7em;
  margin-bottom: 0.15em;
  .fr-sender { color: var(--c-primary-dim); letter-spacing: 0.03em; }
  .fr-floor { color: var(--c-text-dim); font-size: 0.9em; font-variant-numeric: tabular-nums; }
  .fr-time { color: var(--c-text-dim); font-variant-numeric: tabular-nums; margin-left: auto; }
  .fr-like {
    background: transparent;
    border: none;
    color: var(--c-text-dim);
    cursor: pointer;
    font-size: 0.75em;
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.15em;
    transition: color 0.15s;
    &:hover { color: var(--c-danger); }
    &.liked { color: var(--c-danger, #c4665b); }
  }
  .fr-del {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.2em;
    height: 1.2em;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--c-text-dim);
    cursor: pointer;
    opacity: 0.3;
    transition: opacity 0.15s, color 0.15s;
    &:hover { opacity: 1; color: var(--c-danger, #c4665b); }
  }
}

.fr-content { font-size: 0.78em; line-height: 1.5; color: var(--c-text-muted); word-break: break-word; white-space: pre-wrap; }

.forum-empty { font-size: 0.74em; color: var(--c-text-dim); font-style: italic; text-align: center; padding: 0.5em; }

.forum-input-row {
  display: flex;
  gap: 0.3em;
  margin-top: 0.35em;
  align-items: center;
}

.forum-input {
  flex: 1;
  box-sizing: border-box;
  padding: 0.3em 0.4em;
  background: rgba(0,0,0,0.25);
  border: 1px solid var(--c-border);
  border-radius: 2px;
  color: var(--c-text);
  font-size: 0.76em;
  font-family: inherit;
  line-height: 1.4;
  resize: none;
  &:focus { outline: none; border-color: var(--c-primary-dim); }
  &:disabled { opacity: 0.5; }
}

.forum-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8em;
  height: 1.8em;
  padding: 0;
  background: linear-gradient(135deg, var(--c-primary, #d8c188), #b89a5a);
  border: 1px solid var(--c-primary);
  border-radius: 2px;
  color: #1a181d;
  cursor: pointer;
  flex-shrink: 0;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}
</style>
