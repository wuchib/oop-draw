export type PanSource = 'middle-button' | 'space-drag' | 'hand-tool';

export interface ViewportState {
  isPanning: boolean;
  panSource: PanSource | null;
  zoomPercent: number;
}
