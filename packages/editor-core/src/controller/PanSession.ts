import type { CameraState, PanSource, Point } from '@oop-draw/shared';
import { Camera } from '../camera/camera';

export class PanSession {
  private isFinished = false;

  constructor(
    private readonly camera: Camera,
    private readonly origin: Point,
    private readonly startCamera: CameraState,
    private readonly source: PanSource,
  ) {}

  update(currentPoint: Point): void {
    if (this.isFinished) {
      return;
    }

    const deltaX = currentPoint.x - this.origin.x;
    const deltaY = currentPoint.y - this.origin.y;
    const zoom = this.startCamera.zoom;

    this.camera.setPosition(
      this.startCamera.x + deltaX / zoom,
      this.startCamera.y + deltaY / zoom,
    );
  }

  finish(): void {
    this.isFinished = true;
  }

  getSource(): PanSource {
    return this.source;
  }
}
