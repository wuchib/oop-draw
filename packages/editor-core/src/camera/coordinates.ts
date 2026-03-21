export function worldToScreen(value: number, offset: number, zoom: number): number {
  return (value + offset) * zoom;
}

export function screenToWorld(value: number, offset: number, zoom: number): number {
  return value / zoom - offset;
}
