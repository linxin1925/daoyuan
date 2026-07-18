<template>
  <PanelCard title="玉简" icon="scroll" :count="contacts.length">
    <!-- 一级：联系人列表 -->
    <div v-if="!activeContact || floatingMode" class="yj-list">
      <button class="yj-list-settings" type="button" @click="showSettings = true">
        <Icon name="gear" :size="13" />
        <span>玉简设定（API · 世界书 · 预设）</span>
        <Icon name="chevron-right" :size="12" class="yj-arrow" />
      </button>
      <button
        v-for="[name, info] in contacts"
        :key="name"
        class="yj-contact"
        type="button"
        @click="activeContact = name"
      >
        <Icon name="person" :size="14" class="yj-avatar" />
        <div class="yj-info">
          <div class="yj-top">
            <span class="yj-name">{{ name }}</span>
            <span v-if="str(info, '关系')" class="yj-rel">{{ str(info, '关系') }}</span>
          </div>
          <div class="yj-bottom">
            <span v-if="lastMessage(info)" class="yj-preview">{{ lastMessage(info) }}</span>
            <span v-else class="yj-no-msg">刚结玉简，尚未传讯</span>
          </div>
        </div>
        <Icon name="chevron-right" :size="12" class="yj-arrow" />
      </button>
      <div v-if="!contacts.length" class="empty-hint"><Icon name="scroll" :size="14" /> 玉简静默，无人传讯</div>
    </div>

    <!-- 二级：聊天界面（内嵌） -->
    <div v-else-if="!floatingMode" class="yj-chat">
      <header class="yj-chat-head">
        <button class="yj-back" type="button" @click="activeContact = null">
          <Icon name="chevron-left" :size="14" />
        </button>
        <div class="yj-chat-id">
          <span class="yj-chat-name">{{ activeContact }}</span>
          <span v-if="str(activeInfo, '境界')" class="yj-chat-realm">{{ str(activeInfo, '境界') }}</span>
        </div>
        <span v-if="str(activeInfo, '关系')" class="yj-chat-rel">{{ str(activeInfo, '关系') }}</span>
        <button class="yj-popout-btn" type="button" title="弹出独立窗口" @click="openFloat">
          <Icon name="popout" :size="14" />
        </button>
      </header>

      <div v-if="hasFavor(activeInfo)" class="yj-favor">
        <span class="fav-label">好感</span>
        <div class="fav-track"><div class="fav-fill" :style="{ width: favorPct(activeInfo) + '%' }" /></div>
        <span class="fav-num">{{ favor(activeInfo) }}</span>
      </div>

      <div v-if="messages(activeInfo).length" class="yj-messages">
        <div
          v-for="m in messages(activeInfo)"
          :key="m.id"
          class="yj-bubble"
          :data-mine="m.mine"
        >
          <div class="yj-bubble-main">
            <div class="yj-bubble-meta">
              <span class="yj-sender">{{ m.sender }}</span>
              <span v-if="m.time" class="yj-time">{{ m.time }}</span>
            </div>
            <div class="yj-bubble-content">{{ m.content }}</div>
          </div>
          <button
            class="yj-del-btn"
            type="button"
            title="删除此条传讯"
            :disabled="deleting"
            @click="onDeleteMsg(m.id)"
          >
            <Icon name="trash" :size="11" />
          </button>
        </div>
      </div>
      <div v-else class="empty-hint"><Icon name="scroll" :size="14" /> 刚结玉简，尚未传讯</div>

      <div class="yj-input-area">
        <button class="yj-float-back" type="button" title="返回联系人列表" @click="activeContact = null">
          <Icon name="chevron-left" :size="15" />
        </button>
        <textarea
          v-model="inputText"
          class="yj-input"
          placeholder="输入传讯内容... (Enter 发送)"
          :disabled="sending"
          rows="2"
          @keydown.enter.exact.prevent="send"
        ></textarea>
        <button
          class="yj-send-btn"
          type="button"
          :disabled="sending || !inputText.trim()"
          @click="send"
        >
          <Icon name="send" :size="13" />
          <span v-if="sending">发送中</span>
        </button>
      </div>
    </div>

    <!-- 浮动聊天窗口 -->
    <Teleport to="body" v-if="floatingMode && activeContact">
      <div class="yj-float-overlay" @mousedown.self="floatingMode = false">
        <div
          class="yj-float-win"
          :style="{ left: floatPos.x + 'px', top: floatPos.y + 'px' }"
          @mousedown.stop
        >
          <header class="yj-float-head" @mousedown="startDrag">
            <Icon name="person" :size="14" class="yj-float-avatar" />
            <span class="yj-float-name">{{ activeContact }}</span>
            <span v-if="str(activeInfo, '境界')" class="yj-float-realm">{{ str(activeInfo, '境界') }}</span>
            <button class="yj-float-action" title="还原嵌入" @click="floatingMode = false">
              <Icon name="popout" :size="12" />
            </button>
            <button class="yj-float-action yj-float-close" title="关闭" @click="closeFloat">
              <Icon name="close" :size="13" />
            </button>
          </header>

          <div v-if="hasFavor(activeInfo)" class="yj-favor">
            <span class="fav-label">好感</span>
            <div class="fav-track"><div class="fav-fill" :style="{ width: favorPct(activeInfo) + '%' }" /></div>
            <span class="fav-num">{{ favor(activeInfo) }}</span>
          </div>

          <div class="yj-float-body">
            <div v-if="messages(activeInfo).length" class="yj-messages">
              <div v-for="m in messages(activeInfo)" :key="m.id" class="yj-bubble" :data-mine="m.mine">
                <div class="yj-bubble-main">
                  <div class="yj-bubble-meta">
                    <span class="yj-sender">{{ m.sender }}</span>
                    <span v-if="m.time" class="yj-time">{{ m.time }}</span>
                  </div>
                  <div class="yj-bubble-content">{{ m.content }}</div>
                </div>
                <button class="yj-del-btn" type="button" title="删除此条传讯" :disabled="deleting" @click="onDeleteMsg(m.id)">
                  <Icon name="trash" :size="11" />
                </button>
              </div>
            </div>
            <div v-else class="empty-hint"><Icon name="scroll" :size="14" /> 刚结玉简，尚未传讯</div>
          </div>

          <div class="yj-input-area">
            <button class="yj-float-back" type="button" title="返回联系人列表" @click="closeFloat">
              <Icon name="chevron-left" :size="15" />
            </button>
            <textarea
              v-model="inputText" class="yj-input" placeholder="输入传讯内容... (Enter 发送)"
              :disabled="sending" rows="2" @keydown.enter.exact.prevent="send"
            ></textarea>
            <button class="yj-send-btn" type="button" :disabled="sending || !inputText.trim()" @click="send">
              <Icon name="send" :size="13" />
              <span v-if="sending">发送中</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <WxSettingsModal v-if="showSettings" :contact-names="contactNames" @close="showSettings = false" />
  </PanelCard>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue';
import _ from 'lodash';
import Icon from './Icon.vue';
import PanelCard from './PanelCard.vue';
import WxSettingsModal from './WxSettingsModal.vue';
import { appendChatMessage, deleteChatMessage, loadWxSettings, buildInjectContent, callGenerateReply } from '../wxService';
import { useDataStore } from '../store';

const store = useDataStore();

interface YjMessage {
  id: string;
  sender: string;
  time: string;
  content: string;
  mine: boolean;
}

const props = defineProps<{ 玉简: Record<string, unknown> }>();

const activeContact = ref<string | null>(null);
const showSettings = ref(false);
const inputText = ref('');
const sending = ref(false);
const deleting = ref(false);

/** 滚动消息列表到底部 */
function scrollToBottom() {
  nextTick(() => {
    const el = document.querySelector('.yj-messages');
    if (el) el.scrollTop = el.scrollHeight;
    // 外层滚动容器（内嵌聊天的 tabbody）也滚到底
    const outer = document.querySelector('.tabbody');
    if (outer) outer.scrollTop = outer.scrollHeight;
  });
}

const activeInfo = computed(() => {
  if (!activeContact.value) return null;
  const entry = contacts.value.find(([n]) => n === activeContact.value);
  return entry ? entry[1] : null;
});

// 消息变化时自动滚到底部
watch(
  () => {
    const info = activeInfo.value;
    if (!info) return 0;
    const hist = info.历史记录;
    return hist && typeof hist === 'object' ? Object.keys(hist).length : 0;
  },
  () => scrollToBottom(),
);

// 点开聊天时自动滚到底部
watch(activeContact, name => {
  if (name) scrollToBottom();
});

// 浮动窗口
const floatingMode = ref(false);
const floatPos = ref({ x: 60, y: 40 });
const dragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

function openFloat() {
  floatingMode.value = true;
}

function closeFloat() {
  floatingMode.value = false;
  activeContact.value = null;
}

function startDrag(e: MouseEvent) {
  dragging.value = true;
  dragStart.value = { x: e.clientX - floatPos.value.x, y: e.clientY - floatPos.value.y };
  const onMove = (ev: MouseEvent) => {
    if (!dragging.value) return;
    floatPos.value = { x: ev.clientX - dragStart.value.x, y: ev.clientY - dragStart.value.y };
  };
  const onUp = () => {
    dragging.value = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

async function onDeleteMsg(msgId: string) {
  const name = activeContact.value;
  if (!name || deleting.value) return;
  if (!confirm('删除这条传讯记录？')) return;
  deleting.value = true;
  try {
    await deleteChatMessage(name, msgId);
    store.refresh();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (typeof toastr !== 'undefined') toastr.error(msg);
    else alert(msg);
  } finally {
    deleting.value = false;
  }
}

async function send() {
  const name = activeContact.value;
  const text = inputText.value.trim();
  if (!name || !text || sending.value) return;
  // 神识检查（原版机制：神识≥20 才能传讯）
  const shenshi = parseFloat(_.get(getVariables({ type: 'message' }), 'stat_data.主角.神识', 0));
  if (shenshi < 20) {
    if (typeof toastr !== 'undefined') toastr.error('神识不足20，无法传讯！');
    else alert('神识不足20，无法传讯！');
    return;
  }
  inputText.value = '';
  sending.value = true;
  try {
    // 先写入"我"的消息并刷新，让用户立即看到
    await appendChatMessage(name, '我', text);
    store.refresh();
    scrollToBottom();

    // 构造注入内容并生成回复
    const settings = loadWxSettings();
    const injectContent = buildInjectContent(name, settings);
    const reply = await callGenerateReply(injectContent, text, settings);

    // 写入回复并刷新
    await appendChatMessage(name, name, reply);
    store.refresh();
    scrollToBottom();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (typeof toastr !== 'undefined') toastr.error(msg);
    else alert(msg);
    inputText.value = text;
  } finally {
    sending.value = false;
  }
}

function get(obj: unknown, key: string): unknown {
  return _.isPlainObject(obj) ? _.get(obj, key) : undefined;
}

function str(obj: unknown, key: string): string {
  const v = get(obj, key);
  if (v == null) return '';
  return typeof v === 'string' ? v : String(v);
}

function hasFavor(info: unknown): boolean {
  const f = get(info, '好感度');
  return typeof f === 'number' || (typeof f === 'string' && !Number.isNaN(Number(f)));
}

function favor(info: unknown): number {
  return Number(get(info, '好感度')) || 0;
}

function favorPct(info: unknown): number {
  return _.clamp(favor(info), 0, 100);
}

function messages(info: unknown): YjMessage[] {
  const hist = get(info, '历史记录');
  if (!_.isPlainObject(hist)) return [];
  return Object.entries(hist).map(([id, m]) => {
    const sender = str(m, '发送者');
    return {
      id,
      sender: sender || '未知',
      time: str(m, '时间'),
      content: str(m, '内容'),
      mine: sender === '我',
    };
  });
}

function lastMessage(info: unknown): string {
  const msgs = messages(info);
  if (!msgs.length) return '';
  return msgs[msgs.length - 1].content;
}

const contacts = computed(() => Object.entries(props.玉简 ?? {}));
const contactNames = computed(() => contacts.value.map(([n]) => n));
</script>

<style lang="scss" scoped>
/* 一级：联系人列表 */
.yj-list {
  display: flex;
  flex-direction: column;
  gap: 0.2em;
}

.yj-list-settings {
  display: flex;
  align-items: center;
  gap: 0.4em;
  width: 100%;
  padding: 0.5em 0.5em;
  background: rgba(216, 193, 136, 0.08);
  border: 1px dashed var(--c-border-gold, #6b5a3a);
  border-radius: 3px;
  cursor: pointer;
  text-align: left;
  color: var(--c-primary);
  font-size: 0.84em;
  margin-bottom: 0.3em;

  span {
    flex: 1;
  }

  &:hover {
    background: rgba(216, 193, 136, 0.14);
  }

  .yj-arrow {
    color: var(--c-text-dim);
  }
}

.yj-contact {
  display: flex;
  align-items: center;
  gap: 0.55em;
  width: 100%;
  padding: 0.5em 0.4em;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--c-border);
  cursor: pointer;
  text-align: left;
  color: inherit;
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: rgba(216, 193, 136, 0.06);
  }

  .yj-avatar {
    color: var(--c-primary-dim);
    padding: 0.15em;
    border: 1px solid var(--c-border-gold);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .yj-info {
    flex: 1;
    min-width: 0;
  }

  .yj-top {
    display: flex;
    align-items: center;
    gap: 0.4em;
  }

  .yj-name {
    color: var(--c-text);
    font-size: 0.9em;
    letter-spacing: 0.04em;
  }

  .yj-rel {
    font-size: 0.68em;
    padding: 0.05em 0.35em;
    border-radius: 2px;
    color: var(--c-primary);
    border: 1px solid rgba(216, 193, 136, 0.4);
    background: rgba(216, 193, 136, 0.06);
  }

  .yj-bottom {
    margin-top: 0.15em;
    font-size: 0.74em;
    color: var(--c-text-dim);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .yj-preview {
    color: var(--c-text-muted);
  }

  .yj-no-msg {
    font-style: italic;
    color: var(--c-text-dim);
  }

  .yj-arrow {
    color: var(--c-text-dim);
    flex-shrink: 0;
  }
}

/* 二级：聊天界面 */
.yj-chat {
  display: flex;
  flex-direction: column;
  gap: 0.45em;
}

.yj-chat-head {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding-bottom: 0.4em;
  border-bottom: 1px solid var(--c-border);

  .yj-back {
    display: inline-flex;
    align-items: center;
    padding: 0.1em 0.2em;
    background: transparent;
    border: none;
    color: var(--c-text-muted);
    cursor: pointer;
  }

  .yj-chat-id {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 0.4em;
  }

  .yj-chat-name {
    color: var(--c-text);
    font-size: 0.94em;
    letter-spacing: 0.04em;
  }

  .yj-chat-realm {
    font-size: 0.72em;
    color: var(--c-warn);
  }

  .yj-chat-rel {
    font-size: 0.7em;
    padding: 0.05em 0.35em;
    border-radius: 2px;
    color: var(--c-primary);
    border: 1px solid rgba(216, 193, 136, 0.4);
    background: rgba(216, 193, 136, 0.06);
  }
}

.yj-favor {
  display: flex;
  align-items: center;
  gap: 0.5em;
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
    background: linear-gradient(90deg, var(--c-primary), #e0c97a);
    box-shadow: 0 0 5px rgba(216, 193, 136, 0.4);
  }
  .fav-num {
    font-variant-numeric: tabular-nums;
    color: var(--c-text);
  }
}

.yj-messages {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  max-height: 50vh;
  overflow-y: auto;
  padding: 0.2em 0.2em 0.2em 0;
}

/* 微信式气泡：对方左、我右 */
.yj-bubble {
  display: flex;
  align-items: flex-end;
  gap: 0.3em;
  align-self: flex-start;
  max-width: 100%;

  &[data-mine='true'] {
    flex-direction: row-reverse;
    align-self: flex-end;
  }
}

.yj-bubble-main {
  max-width: 85%;
  padding: 0.35em 0.55em;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  border-bottom-left-radius: 2px;
  position: relative;

  .yj-bubble-meta {
    display: flex;
    align-items: center;
    gap: 0.5em;
    margin-bottom: 0.15em;
    font-size: 0.7em;

    .yj-sender {
      color: var(--c-text);
    }
    .yj-time {
      color: var(--c-text-dim);
      font-variant-numeric: tabular-nums;
    }
  }

  .yj-bubble-content {
    font-size: 0.84em;
    line-height: 1.5;
    color: var(--c-text);
    word-break: break-word;
    white-space: pre-wrap;
  }
}

.yj-bubble[data-mine='true'] {
  .yj-bubble-main {
    background: rgba(168, 136, 212, 0.12);
    border-color: rgba(168, 136, 212, 0.35);
    border-radius: 8px;
    border-bottom-right-radius: 2px;

    .yj-sender {
      color: var(--c-accent);
    }
  }
}

.yj-del-btn {
  flex-shrink: 0;
  width: 1.4em;
  height: 1.4em;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--c-text-dim);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.4;
  transition: opacity 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    color: var(--c-danger, #c4665b);
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
}

.yj-input-area {
  display: flex;
  gap: 0.4em;
  align-items: center;
  margin-top: 0.5em;
  padding: 0.5em;
  border-top: 1px solid var(--c-border);
}

.yj-float-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8em;
  height: 1.8em;
  flex-shrink: 0;
  padding: 0;
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: 3px;
  color: var(--c-text-muted);
  cursor: pointer;

  &:hover {
    color: var(--c-primary);
    border-color: var(--c-primary-dim);
  }
}

.yj-input {
  flex: 1;
  box-sizing: border-box;
  padding: 0.4em 0.5em;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  color: var(--c-text);
  font-size: 0.82em;
  font-family: inherit;
  line-height: 1.4;
  resize: none;

  &:focus {
    outline: none;
    border-color: var(--c-primary-dim, #8a7a4a);
  }
  &:disabled {
    opacity: 0.5;
  }
}

.yj-send-btn {
  padding: 0.45em 0.8em;
  background: linear-gradient(135deg, var(--c-primary, #d8c188), #b89a5a);
  border: 1px solid var(--c-primary, #d8c188);
  border-radius: 3px;
  color: #1a181d;
  font-size: 0.8em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  font-weight: bold;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

/* 弹出按钮 */
.yj-popout-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.15em 0.3em;
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: 3px;
  color: var(--c-text-muted);
  cursor: pointer;
  margin-left: auto;

  &:hover {
    color: var(--c-primary);
    border-color: var(--c-primary-dim);
  }
}

/* 浮动聊天窗口 */
.yj-float-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
  pointer-events: auto;
}

.yj-float-win {
  position: fixed;
  width: 420px;
  max-width: calc(100% - 1.5em);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg-panel, #1a181d);
  border: 1px solid var(--c-primary-dim, #8a7a4a);
  border-radius: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  z-index: 10000;
}

.yj-float-head {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.5em 0.6em;
  background: linear-gradient(180deg, rgba(216, 193, 136, 0.12), rgba(216, 193, 136, 0.04));
  border-bottom: 1px solid var(--c-border-gold, #6b5a3a);
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  .yj-float-avatar {
    color: var(--c-primary);
    flex-shrink: 0;
  }

  .yj-float-name {
    flex: 1;
    color: var(--c-text);
    font-size: 0.9em;
    letter-spacing: 0.04em;
  }

  .yj-float-realm {
    font-size: 0.72em;
    color: var(--c-warn);
  }

  .yj-float-action {
    display: inline-flex;
    align-items: center;
    padding: 0.15em 0.3em;
    background: transparent;
    border: 1px solid var(--c-border);
    border-radius: 3px;
    color: var(--c-text-muted);
    cursor: pointer;

    &:hover {
      color: var(--c-text);
      border-color: var(--c-text-dim);
    }
  }

  .yj-float-close:hover {
    color: var(--c-danger);
    border-color: var(--c-danger);
  }
}

.yj-float-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.5em;
  min-height: 120px;
  overflow: hidden;

  .yj-messages {
    flex: 1;
    max-height: none;
  }
}
</style>
