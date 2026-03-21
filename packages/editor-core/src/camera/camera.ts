export interface CameraViewport {
  x: number;
  y: number;
  zoom: number;
}

export function createCamera(): CameraViewport {
  return { x: 0, y: 0, zoom: 1 };
}
