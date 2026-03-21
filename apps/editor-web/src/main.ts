import { createApp } from 'vue';
import App from './App.vue';
import { createWebBootstrap } from './bootstrap';

createWebBootstrap(createApp(App));
