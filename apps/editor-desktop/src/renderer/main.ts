import { createApp } from 'vue';
import App from './App.vue';
import { createDesktopBootstrap } from './bootstrap';

createDesktopBootstrap(createApp(App));
