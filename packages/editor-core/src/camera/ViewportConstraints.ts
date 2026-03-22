export interface ViewportConstraintOptions {
  minZoom?: number;
  maxZoom?: number;
}

export class ViewportConstraints {
  private readonly minZoom: number;
  private readonly maxZoom: number;

  constructor(options: ViewportConstraintOptions = {}) {
    this.minZoom = options.minZoom ?? 0.1;
    this.maxZoom = options.maxZoom ?? 4;
  }

  clampZoom(zoom: number): number {
    return Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
  }

  getNextZoomStep(currentZoom: number, deltaY: number): number {
    const wheelScale = Math.exp(-deltaY * 0.0015);
    return this.clampZoom(currentZoom * wheelScale);
  }

  getKeyboardZoomIn(currentZoom: number): number {
    return this.clampZoom(currentZoom * 1.1);
  }

  getKeyboardZoomOut(currentZoom: number): number {
    return this.clampZoom(currentZoom / 1.1);
  }

  getMinZoom(): number {
    return this.minZoom;
  }

  getMaxZoom(): number {
    return this.maxZoom;
  }
}
