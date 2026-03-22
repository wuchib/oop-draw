import type { CameraState, Point, Size } from '@oop-draw/shared';

export class ViewportTransformer {
  constructor(
    private readonly camera: CameraState,
    private readonly viewportSize: Size,
  ) {}

  worldToScreen(point: Point): Point {
    return {
      x: (point.x + this.camera.x) * this.camera.zoom + this.viewportSize.width / 2,
      y: (point.y + this.camera.y) * this.camera.zoom + this.viewportSize.height / 2,
    };
  }

  screenToWorld(point: Point): Point {
    return {
      x: (point.x - this.viewportSize.width / 2) / this.camera.zoom - this.camera.x,
      y: (point.y - this.viewportSize.height / 2) / this.camera.zoom - this.camera.y,
    };
  }

  screenDeltaToWorld(delta: Point): Point {
    return {
      x: delta.x / this.camera.zoom,
      y: delta.y / this.camera.zoom,
    };
  }

  worldDeltaToScreen(delta: Point): Point {
    return {
      x: delta.x * this.camera.zoom,
      y: delta.y * this.camera.zoom,
    };
  }
}
