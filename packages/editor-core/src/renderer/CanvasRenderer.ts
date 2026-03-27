import { RoughCanvas } from 'roughjs/bin/canvas';
import type { Options as RoughOptions } from 'roughjs/bin/core';
import type { CanvasDocument, ShapeElement } from '@oop-draw/shared';
import { Camera } from '../camera/camera';
import { getSceneElements } from '../scene/scene';
import type { EditorPresentationState } from '../scene/presentation';
import { getSingleSelectionId } from '../selection/selection';
import { getElementBounds, getHandlePoints, getStableRoughSeed } from '../scene/element-interaction';

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly roughCanvas: RoughCanvas;
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
    this.roughCanvas = new RoughCanvas(canvas);
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

  render(document: CanvasDocument, presentationState?: EditorPresentationState): void {
    this.context.clearRect(0, 0, this.width, this.height);
    this.fillBackground();

    if (document.appState.gridEnabled) {
      this.drawGrid();
    }

    this.drawOrigin();

    for (const element of getSceneElements(document)) {
      if (element.type === 'text') {
        continue;
      }

      this.drawShape(element);
    }

    if (presentationState?.draftElement && presentationState.draftElement.type !== 'text') {
      this.context.save();
      this.context.globalAlpha = 0.7;
      this.drawShape(presentationState.draftElement);
      this.context.restore();
    }

    const selectedElementId = presentationState ? getSingleSelectionId(presentationState.selection) : null;
    if (!selectedElementId) {
      return;
    }

    const selectedElement = document.elements.find((element) => element.id === selectedElementId);
    if (!selectedElement || selectedElement.type === 'text') {
      return;
    }

    this.drawSelectionOutline(selectedElement);
  }

  dispose(): void {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  private fillBackground(): void {
    this.context.fillStyle = '#f8fafc';
    this.context.fillRect(0, 0, this.width, this.height);
  }

  private drawShape(element: ShapeElement): void {
    const transformer = this.camera.getTransformer({ width: this.width, height: this.height });
    const style = this.toRoughOptions(element);

    switch (element.type) {
      case 'rectangle': {
        const origin = transformer.worldToScreen({ x: element.x, y: element.y });
        const size = transformer.worldDeltaToScreen({ x: element.width, y: element.height });
        this.roughCanvas.rectangle(origin.x, origin.y, size.x, size.y, style);
        break;
      }
      case 'ellipse': {
        const center = transformer.worldToScreen({
          x: element.x + element.width / 2,
          y: element.y + element.height / 2,
        });
        const size = transformer.worldDeltaToScreen({ x: element.width, y: element.height });
        this.roughCanvas.ellipse(center.x, center.y, size.x, size.y, style);
        break;
      }
      case 'arrow': {
        const start = transformer.worldToScreen({ x: element.x, y: element.y });
        const end = transformer.worldToScreen({ x: element.endX, y: element.endY });
        this.roughCanvas.line(start.x, start.y, end.x, end.y, {
          ...style,
          fill: undefined,
        });
        this.drawArrowHead(start, end, element.strokeColor, Math.max(10, element.strokeWidth * 4));
        break;
      }
    }
  }

  private toRoughOptions(element: ShapeElement): RoughOptions {
    return {
      stroke: element.strokeColor,
      strokeWidth: element.strokeWidth,
      fill: element.type === 'arrow' ? undefined : element.fillColor,
      roughness: 1.1,
      bowing: 1,
      seed: getStableRoughSeed(element.id),
    };
  }

  private drawArrowHead(start: { x: number; y: number }, end: { x: number; y: number }, color: string, size: number): void {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const wing = Math.PI / 7;
    const left = {
      x: end.x - size * Math.cos(angle - wing),
      y: end.y - size * Math.sin(angle - wing),
    };
    const right = {
      x: end.x - size * Math.cos(angle + wing),
      y: end.y - size * Math.sin(angle + wing),
    };

    this.context.save();
    this.context.strokeStyle = color;
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(end.x, end.y);
    this.context.lineTo(left.x, left.y);
    this.context.moveTo(end.x, end.y);
    this.context.lineTo(right.x, right.y);
    this.context.stroke();
    this.context.restore();
  }

  private drawSelectionOutline(element: ShapeElement): void {
    const transformer = this.camera.getTransformer({ width: this.width, height: this.height });
    const bounds = getElementBounds(element);
    const topLeft = transformer.worldToScreen({ x: bounds.left, y: bounds.top });
    const bottomRight = transformer.worldToScreen({ x: bounds.right, y: bounds.bottom });
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;

    this.context.save();
    this.context.strokeStyle = '#2563eb';
    this.context.lineWidth = 1.5;
    this.context.setLineDash([6, 4]);
    this.context.strokeRect(topLeft.x, topLeft.y, width, height);
    this.context.setLineDash([]);

    for (const handle of getHandlePoints(element)) {
      const point = transformer.worldToScreen(handle.point);
      this.context.beginPath();
      this.context.fillStyle = '#ffffff';
      this.context.strokeStyle = '#2563eb';
      this.context.lineWidth = 1.5;
      this.context.arc(point.x, point.y, 5, 0, Math.PI * 2);
      this.context.fill();
      this.context.stroke();
    }

    this.context.restore();
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
