import type { CameraState, Point, Size } from '@oop-draw/shared';
import { ViewportTransformer } from './coordinates';
import { ViewportConstraints } from './ViewportConstraints';

export interface CameraOptions {
  minZoom?: number;
  maxZoom?: number;
}

export class Camera {
  private readonly constraints: ViewportConstraints;
  private viewportSize: Size = { width: 1, height: 1 };
  private state: CameraState;

  constructor(state: CameraState, options: CameraOptions = {}) {
    this.constraints = new ViewportConstraints(options);
    this.state = {
      x: state.x,
      y: state.y,
      zoom: this.constraints.clampZoom(state.zoom),
    };
  }

  panBy(dx: number, dy: number): void {
    this.state.x += dx;
    this.state.y += dy;
  }

  setPosition(x: number, y: number): void {
    this.state.x = x;
    this.state.y = y;
  }

  setZoom(zoom: number): void {
    this.state.zoom = this.constraints.clampZoom(zoom);
  }

  zoomAt(screenPoint: Point, requestedZoom: number, viewportSize: Size = this.viewportSize): void {
    const nextZoom = this.constraints.clampZoom(requestedZoom);
    const transformer = this.getTransformer(viewportSize);
    const worldPoint = transformer.screenToWorld(screenPoint);

    this.state.zoom = nextZoom;

    const recentered = this.getTransformer(viewportSize);
    const nextScreenPoint = recentered.worldToScreen(worldPoint);

    this.state.x += (screenPoint.x - nextScreenPoint.x) / this.state.zoom;
    this.state.y += (screenPoint.y - nextScreenPoint.y) / this.state.zoom;
  }

  reset(): void {
    this.state = {
      x: 0,
      y: 0,
      zoom: 1,
    };
  }

  setViewportSize(width: number, height: number): void {
    this.viewportSize = {
      width: Math.max(1, width),
      height: Math.max(1, height),
    };
  }

  getViewportSize(): Size {
    return { ...this.viewportSize };
  }

  getTransformer(viewportSize: Size = this.viewportSize): ViewportTransformer {
    return new ViewportTransformer(this.toSnapshot(), viewportSize);
  }

  getState(): Readonly<CameraState> {
    return this.state;
  }

  toSnapshot(): CameraState {
    return {
      x: this.state.x,
      y: this.state.y,
      zoom: this.state.zoom,
    };
  }

  getMinZoom(): number {
    return this.constraints.getMinZoom();
  }

  getMaxZoom(): number {
    return this.constraints.getMaxZoom();
  }
}
