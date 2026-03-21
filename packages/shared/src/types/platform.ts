import type { CanvasDocument } from './document';

export type PlatformKind = 'web' | 'desktop';

export interface PlatformBridge {
  openDocument(): Promise<CanvasDocument | null>;
  saveDocument(document: CanvasDocument): Promise<void>;
  openExternal(url: string): Promise<void>;
  notify(message: string): Promise<void>;
}

export interface PlatformServices extends PlatformBridge {
  kind: PlatformKind;
}
