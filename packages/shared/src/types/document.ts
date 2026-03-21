import type { CanvasElement } from './element';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasDocument {
  version: number;
  elements: CanvasElement[];
  assets: string[];
  camera: CameraState;
  metadata: {
    title: string;
    updatedAt: string;
  };
  appState: {
    theme: 'light' | 'dark';
    gridEnabled: boolean;
  };
}
