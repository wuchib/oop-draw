import type { CanvasElement } from '@oop-draw/shared';
import type { SelectionState } from '../selection/selection';

export interface EditorPresentationState {
  draftElement: CanvasElement | null;
  selection: SelectionState;
}
