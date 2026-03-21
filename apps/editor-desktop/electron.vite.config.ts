import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const rendererRoot = path.join(rootDir, 'src', 'renderer');

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: rendererRoot,
    build: {
      outDir: path.join(rootDir, 'out', 'renderer'),
      emptyOutDir: false,
      rollupOptions: {
        input: path.join(rendererRoot, 'index.html'),
      },
    },
    plugins: [vue()],
  },
});
