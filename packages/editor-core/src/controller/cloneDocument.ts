import type { CanvasDocument } from '@oop-draw/shared';

export function cloneDocument(document: CanvasDocument): CanvasDocument {
  return {
    version: document.version,
    elements: document.elements.map((element) => ({ ...element })),
    assets: [...document.assets],
    camera: { ...document.camera },
    metadata: { ...document.metadata },
    appState: { ...document.appState },
  };
}
