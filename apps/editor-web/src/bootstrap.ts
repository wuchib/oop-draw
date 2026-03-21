import type { App } from 'vue';
import { createPinia } from 'pinia';

export function createWebBootstrap(app: App<Element>): void {
  app.use(createPinia());
  app.mount('#app');
}
