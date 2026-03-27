export type PanSource = 'middle-button' | 'space-drag' | 'hand-tool';
export type ViewportInteraction = 'idle' | 'panning' | 'drawing' | 'moving' | 'resizing';

export interface ViewportState {
  isPanning: boolean;
  panSource: PanSource | null;
  zoomPercent: number;
  isDrawing: boolean;
  selectedElementId: string | null;
  interaction: ViewportInteraction;
}
