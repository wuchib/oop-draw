import { contextBridge, ipcRenderer } from 'electron';
import type { PlatformBridge } from '@oop-draw/shared';

const api: PlatformBridge = {
  openDocument: () => ipcRenderer.invoke('oop-draw:open-document'),
  saveDocument: (document) => ipcRenderer.invoke('oop-draw:save-document', document),
  openExternal: (url) => ipcRenderer.invoke('oop-draw:open-external', url),
  notify: (message) => ipcRenderer.invoke('oop-draw:notify', message),
};

contextBridge.exposeInMainWorld('oopDrawDesktop', api);
