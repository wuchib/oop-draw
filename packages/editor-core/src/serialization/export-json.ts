import type { CanvasDocument } from '@oop-draw/shared';

export function exportDocument(document: CanvasDocument): string {
  return JSON.stringify(document, null, 2);
}
