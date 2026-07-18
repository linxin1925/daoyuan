import { waitUntil } from 'async-wait-until';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './global.css';

$(async () => {
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'), { timeout: 30_000 });

  const app = createApp(App);
  app.config.compilerOptions.isCustomElement = (tag: string) => tag.startsWith('daoyuan-');
  app.use(createPinia());
  app.mount('#app');

  $(window).on('pagehide', () => app.unmount());
});
