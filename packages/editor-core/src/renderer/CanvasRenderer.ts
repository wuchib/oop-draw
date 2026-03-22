import type { CanvasDocument } from '@oop-draw/shared';
import { Camera } from '../camera/camera';
import { getSceneElements } from '../scene/scene';

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private devicePixelRatio = 1;
  private width = 1;
  private height = 1;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: Camera,
  ) {
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is not available.');
    }

    this.context = context;
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, Math.floor(width));
    this.height = Math.max(1, Math.floor(height));
    this.devicePixelRatio = globalThis.devicePixelRatio || 1;
    this.canvas.width = Math.floor(this.width * this.devicePixelRatio);
    this.canvas.height = Math.floor(this.height * this.devicePixelRatio);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
  }

  render(document: CanvasDocument): void {
    this.context.clearRect(0, 0, this.width, this.height);
    this.fillBackground();

    if (document.appState.gridEnabled) {
      this.drawGrid();
    }

    this.drawOrigin();

    for (const element of getSceneElements(document)) {
      void element;
    }
  }

  dispose(): void {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  private fillBackground(): void {
    this.context.fillStyle = '#f8fafc';
    this.context.fillRect(0, 0, this.width, this.height);
  }

  private drawGrid(): void {
    const zoom = this.camera.getState().zoom;
    const baseGrid = 24;
    let gridSize = baseGrid;

    while (gridSize * zoom < 18) {
      gridSize *= 2;
    }

    const cameraState = this.camera.getState();
    const screenGridSize = gridSize * zoom;
    const offsetX = ((cameraState.x * zoom) % screenGridSize + screenGridSize) % screenGridSize;
    const offsetY = ((cameraState.y * zoom) % screenGridSize + screenGridSize) % screenGridSize;

    this.context.save();
    this.context.beginPath();
    this.context.strokeStyle = '#d8dee9';
    this.context.lineWidth = 1;

    for (let x = this.width / 2 + offsetX; x <= this.width; x += screenGridSize) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.height);
    }

    for (let x = this.width / 2 + offsetX - screenGridSize; x >= 0; x -= screenGridSize) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.height);
    }

    for (let y = this.height / 2 + offsetY; y <= this.height; y += screenGridSize) {
      this.context.moveTo(0, y);
      this.context.lineTo(this.width, y);
    }

    for (let y = this.height / 2 + offsetY - screenGridSize; y >= 0; y -= screenGridSize) {
      this.context.moveTo(0, y);
      this.context.lineTo(this.width, y);
    }

    this.context.stroke();
    this.context.restore();
  }

  private drawOrigin(): void {
    const transformer = this.camera.getTransformer({ width: this.width, height: this.height });
    const origin = transformer.worldToScreen({ x: 0, y: 0 });

    this.context.save();
    this.context.strokeStyle = '#1d4ed8';
    this.context.lineWidth = 1.5;
    this.context.beginPath();
    this.context.moveTo(origin.x - 10, origin.y);
    this.context.lineTo(origin.x + 10, origin.y);
    this.context.moveTo(origin.x, origin.y - 10);
    this.context.lineTo(origin.x, origin.y + 10);
    this.context.stroke();
    this.context.restore();
  }
}
