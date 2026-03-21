import { DOCUMENT_VERSION, type CanvasDocument } from '@oop-draw/shared';

export function migrateDocument(document: CanvasDocument): CanvasDocument {
  return {
    ...document,
    version: DOCUMENT_VERSION,
  };
}
