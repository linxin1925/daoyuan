<template>
  <!-- eslint-disable vue/no-v-html -- 图标内容为内置静态字符串，无外部输入 -->
  <svg
    class="dy-icon"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="paths[name] ?? ''"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number | string }>(), { size: 16 });

// 白描线描图标 — currentColor 取色，CSS 可调
const paths: Record<string, string> = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3 2"/>',
  mountain: '<path d="M3 20h18"/><path d="M5.5 20l4.5-7.5 3 4.5 2-3 4 6"/>',
  warning: '<path d="M12 3.5l8.5 15.5H3.5z"/><path d="M12 10v4.2"/><circle cx="12" cy="17" r="0.4" fill="currentColor" stroke="none"/>',
  lotus: '<path d="M12 14c-2.6 0-5-1.6-5-4.2 1.6 0 3.2.8 5 2.2 1.8-1.4 3.4-2.2 5-2.2 0 2.6-2.4 4.2-5 4.2z"/><path d="M12 14v3.2"/><path d="M9.2 16.5c1 .9 4.6.9 5.6 0"/><path d="M7.4 13.4c-1.2.9-1.5 2.6-.6 3.8"/><path d="M16.6 13.4c1.2.9 1.5 2.6.6 3.8"/>',
  heart: '<path d="M12 20s-7-4.6-7-10.2A4 4 0 0112 6.5 4 4 0 0119 9.8C19 15.4 12 20 12 20z"/>',
  drop: '<path d="M12 3.5s5.8 6.3 5.8 10.7A5.8 5.8 0 016.2 14.2C6.2 9.8 12 3.5 12 3.5z"/>',
  spark: '<path d="M12 3.2l1.9 5.9 5.9 1.9-5.9 1.9L12 18.8l-1.9-5.9L4.2 11l5.9-1.9z"/>',
  taiji: '<circle cx="12" cy="12" r="9"/><path d="M12 3a4.5 4.5 0 010 9 4.5 4.5 0 000 9"/><circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="16.5" r="1.1" fill="currentColor" stroke="none"/>',
  eye: '<path d="M2.5 12s4-7 9.5-7 9.5 7 9.5 7-4 7-9.5 7S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  trigram: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  star: '<path d="M12 3.2l2.5 6.4 6.9.5-5.3 4.5 1.7 6.7L12 17.7 6.2 21.8l1.7-6.7L2.6 10.6l6.9-.5z"/>',
  scroll: '<path d="M7 4h8a3 3 0 013 3v10a3 3 0 01-3 3H7"/><path d="M7 4a2 2 0 00-2 2v12a2 2 0 002 2"/><path d="M10 9h5M10 13h5"/>',
  flask: '<path d="M9 3.5h6"/><path d="M10 3.5v5.5L5.5 17a2.2 2.2 0 002 3.3h9a2.2 2.2 0 002-3.3L14 9V3.5"/><path d="M7.5 14h9"/>',
  forge: '<path d="M9 3.5h6"/><path d="M10 3.5v4L6 11v8a1 1 0 001 1h10a1 1 0 001-1v-8l-4-3.5v-4"/><path d="M9 15h6"/>',
  person: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0114 0"/>',
  door: '<path d="M6 21V4.5A1.5 1.5 0 017.5 3h8A1.5 1.5 0 0117 4.5V21"/><path d="M4.5 21h15"/><path d="M12.5 21v-3.5"/>',
  wind: '<path d="M3 8h10.5a3 3 0 100-5"/><path d="M3 12h14a3 3 0 110 6"/><path d="M3 16h8"/>',
  flower: '<circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="6" r="2.6"/><circle cx="12" cy="18" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="12" r="2.6"/>',
  gem: '<path d="M6.5 3h11l3 6-8.5 12L3.5 9z"/><path d="M3.5 9h17"/><path d="M9.5 3l2.5 6 2.5-6"/><path d="M12 9v12"/>',
  bag: '<path d="M6.5 8.5h11l1 11.5a1 1 0 01-1 1H6.5a1 1 0 01-1-1z"/><path d="M9 8.5a3 3 0 016 0"/>',
  crane: '<path d="M3 16c3 0 4-2 6-2s4 2 7 2"/><path d="M14 14l5-5M16 9l3-1-1 3"/><path d="M8 14c-2-1-3-3-2-5"/>',
  spirit: '<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M18.5 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>',
  sword: '<path d="M14.5 3.5L19 8 9 18l-3 1 1-3z"/><path d="M6 18l-2 2M8.5 12.5l3 3"/>',
  'chevron-right': '<path d="M9 6l6 6-6 6"/>',
  'chevron-left': '<path d="M15 6l-6 6 6 6"/>',
  gear: '<path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/><circle cx="12" cy="12" r="3"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  save: '<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  close: '<path d="M18 6L6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>',
  popout: '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  'chevron-up': '<path d="M6 15l6-6 6 6"/>',
  fortress: '<path d="M4 21h16"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6a3 3 0 016 0v6"/><path d="M9 11h6v3H9z"/><path d="M6 5V3"/>',
  'corner-down-right': '<path d="M4 20v-6a4 4 0 014-4h12"/><path d="M15 14l5-4-5-4"/>',
  pen: '<path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="M15 5l4 4"/>',
};
</script>

<style scoped>
.dy-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
