import { DOCUMENT_VERSION, type CanvasDocument } from '@oop-draw/shared';

export function createDocument(): CanvasDocument {
  return {
    version: DOCUMENT_VERSION,
    elements: [],
    assets: [],
    camera: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    metadata: {
      title: 'Untitled board',
      updatedAt: new Date().toISOString(),
    },
    appState: {
      theme: 'light',
      gridEnabled: true,
    },
  };
}
