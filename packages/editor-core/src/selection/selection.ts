export interface SelectionState {
  ids: string[];
}

export function createSelection(): SelectionState {
  return { ids: [] };
}

export function getSingleSelectionId(selection: SelectionState): string | null {
  return selection.ids[0] ?? null;
}
