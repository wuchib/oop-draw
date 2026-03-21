export interface SelectionState {
  ids: string[];
}

export function createSelection(): SelectionState {
  return { ids: [] };
}
