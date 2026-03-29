import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const rendererRoot = path.join(rootDir, 'src', 'renderer');
const workspaceRoot = path.join(rootDir, '..', '..');
const packageRoot = (packageName: string) => path.join(workspaceRoot, 'packages', packageName);
const packageFile = (packageName: string, ...segments: string[]) => path.join(packageRoot(packageName), ...segments);
const workspacePackages = [
  '@oop-draw/editor-shell',
  '@oop-draw/editor-core',
  '@oop-draw/platform',
  '@oop-draw/shared',
  '@oop-draw/ui',
];

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: rendererRoot,
    cacheDir: path.join(rootDir, '.vite-renderer'),
    resolve: {
      alias: [
        {
          find: '@oop-draw/ui/styles/base.css',
          replacement: packageFile('ui', 'src', 'styles', 'base.css'),
        },
        {
          find: '@oop-draw/ui/styles/reset.css',
          replacement: packageFile('ui', 'src', 'styles', 'reset.css'),
        },
        {
          find: '@oop-draw/ui/styles/tokens.css',
          replacement: packageFile('ui', 'src', 'styles', 'tokens.css'),
        },
        { find: '@oop-draw/editor-shell', replacement: packageRoot('editor-shell') },
        { find: '@oop-draw/editor-core', replacement: packageRoot('editor-core') },
        { find: '@oop-draw/platform', replacement: packageRoot('platform') },
        { find: '@oop-draw/shared', replacement: packageRoot('shared') },
        { find: '@oop-draw/ui', replacement: packageRoot('ui') },
      ],
    },
    server: {
      fs: {
        allow: [workspaceRoot],
      },
    },
    optimizeDeps: {
      exclude: workspacePackages,
    },
    build: {
      outDir: path.join(rootDir, 'out', 'renderer'),
      emptyOutDir: true,
      rollupOptions: {
        input: path.join(rendererRoot, 'index.html'),
      },
    },
    plugins: [vue(), tailwindcss()],
  },
});
