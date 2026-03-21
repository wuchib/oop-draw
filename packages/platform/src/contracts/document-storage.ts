import type { CanvasDocument } from '@oop-draw/shared';

export interface DocumentStorage {
  openDocument(): Promise<CanvasDocument | null>;
  saveDocument(document: CanvasDocument): Promise<void>;
}
