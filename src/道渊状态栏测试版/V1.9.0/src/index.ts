import { waitUntil } from 'async-wait-until';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './global.css';
import { initPortraits } from './portraitService';

$(async () => {
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'), { timeout: 30_000 });

  // 异步加载远程立绘库（不阻塞渲染，fetch 成功后自动刷新）
  void initPortraits();

  const app = createApp(App);
  app.config.compilerOptions.isCustomElement = (tag: string) => tag.startsWith('daoyuan-');
  app.use(createPinia());
  app.mount('#app');

  $(window).on('pagehide', () => app.unmount());
});
