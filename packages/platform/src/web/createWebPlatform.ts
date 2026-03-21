import type { PlatformServices } from '@oop-draw/shared';
import { openDocumentFromFile, saveDocumentToDownload } from './web-document-storage';

export function createWebPlatform(): PlatformServices {
  return {
    kind: 'web',
    openDocument: openDocumentFromFile,
    saveDocument: saveDocumentToDownload,
    async openExternal(url: string) {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    async notify(message: string) {
      window.alert(message);
    },
  };
}
