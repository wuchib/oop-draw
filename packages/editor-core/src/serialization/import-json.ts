import { isCanvasDocument, type CanvasDocument } from '@oop-draw/shared';

export function importDocument(raw: string): CanvasDocument {
  const parsed = JSON.parse(raw) as unknown;

  if (!isCanvasDocument(parsed)) {
    throw new Error('Invalid OOP Draw document.');
  }

  return parsed;
}
