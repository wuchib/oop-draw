import { RoughCanvas } from 'roughjs/bin/canvas';
import type { Options as RoughOptions } from 'roughjs/bin/core';
import type { CanvasDocument, ShapeElement } from '@oop-draw/shared';
import { Camera } from '../camera/camera';
import { getSceneElements } from '../scene/scene';
import type { EditorPresentationState } from '../scene/presentation';
import { getSingleSelectionId } from '../selection/selection';
import {
  getElementBounds,
  getStableRoughSeed,
  SELECTION_OUTLINE_SCREEN_PADDING,
} from '../scene/element-interaction';

const SELECTION_STROKE_COLOR = '#3872e8';
const SELECTION_FILL_COLOR = 'rgba(56, 114, 232, 0.18)';
const SELECTION_FILL_COLOR_STRONG = 'rgba(56, 114, 232, 0.45)';

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
    if (element.type === 'arrow') {
      this.drawArrowSelectionOutline(element);
      return;
    }

    this.drawBoxSelectionOutline(element);
  }

  private drawBoxSelectionOutline(element: Exclude<ShapeElement, { type: 'arrow' }>): void {
    const transformer = this.camera.getTransformer({ width: this.width, height: this.height });
    const bounds = getElementBounds(element);
    const topLeft = transformer.worldToScreen({ x: bounds.left, y: bounds.top });
    const bottomRight = transformer.worldToScreen({ x: bounds.right, y: bounds.bottom });
    const outlineTopLeft = {
      x: topLeft.x - SELECTION_OUTLINE_SCREEN_PADDING,
      y: topLeft.y - SELECTION_OUTLINE_SCREEN_PADDING,
    };
    const outlineBottomRight = {
      x: bottomRight.x + SELECTION_OUTLINE_SCREEN_PADDING,
      y: bottomRight.y + SELECTION_OUTLINE_SCREEN_PADDING,
    };
    const width = outlineBottomRight.x - outlineTopLeft.x;
    const height = outlineBottomRight.y - outlineTopLeft.y;
    const topCenterX = outlineTopLeft.x + width / 2;
    const rotationHandleY = outlineTopLeft.y - 18;
    const cornerSize = 12;
    const cornerOffset = cornerSize / 2;
    const edgeGap = cornerOffset + 2;

    this.context.save();
    this.context.strokeStyle = SELECTION_STROKE_COLOR;
    this.context.lineWidth = 1.5;
    this.context.beginPath();
    this.context.moveTo(outlineTopLeft.x + edgeGap, outlineTopLeft.y);
    this.context.lineTo(outlineBottomRight.x - edgeGap, outlineTopLeft.y);
    this.context.moveTo(outlineBottomRight.x, outlineTopLeft.y + edgeGap);
    this.context.lineTo(outlineBottomRight.x, outlineBottomRight.y - edgeGap);
    this.context.moveTo(outlineTopLeft.x + edgeGap, outlineBottomRight.y);
    this.context.lineTo(outlineBottomRight.x - edgeGap, outlineBottomRight.y);
    this.context.moveTo(outlineTopLeft.x, outlineTopLeft.y + edgeGap);
    this.context.lineTo(outlineTopLeft.x, outlineBottomRight.y - edgeGap);
    this.context.stroke();

    this.drawSquareHandle(outlineTopLeft.x, outlineTopLeft.y, cornerSize, cornerOffset);
    this.drawSquareHandle(outlineBottomRight.x, outlineTopLeft.y, cornerSize, cornerOffset);
    this.drawSquareHandle(outlineBottomRight.x, outlineBottomRight.y, cornerSize, cornerOffset);
    this.drawSquareHandle(outlineTopLeft.x, outlineBottomRight.y, cornerSize, cornerOffset);

    this.context.beginPath();
    this.context.fillStyle = SELECTION_FILL_COLOR;
    this.context.strokeStyle = SELECTION_STROKE_COLOR;
    this.context.lineWidth = 2;
    this.context.arc(topCenterX, rotationHandleY, 7, 0, Math.PI * 2);
    this.context.fill();
    this.context.stroke();

    this.context.restore();
  }

  private drawArrowSelectionOutline(element: Extract<ShapeElement, { type: 'arrow' }>): void {
    const transformer = this.camera.getTransformer({ width: this.width, height: this.height });
    const start = transformer.worldToScreen({ x: element.x, y: element.y });
    const end = transformer.worldToScreen({ x: element.endX, y: element.endY });
    const midpoint = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };

    this.context.save();

    this.context.beginPath();
    this.context.fillStyle = SELECTION_FILL_COLOR;
    this.context.strokeStyle = SELECTION_STROKE_COLOR;
    this.context.lineWidth = 2;
    this.context.arc(start.x, start.y, 8, 0, Math.PI * 2);
    this.context.fill();
    this.context.stroke();

    this.context.beginPath();
    this.context.arc(end.x, end.y, 8, 0, Math.PI * 2);
    this.context.fill();
    this.context.stroke();

    this.context.beginPath();
    this.context.fillStyle = SELECTION_FILL_COLOR_STRONG;
    this.context.arc(midpoint.x, midpoint.y, 8, 0, Math.PI * 2);
    this.context.fill();

    this.context.restore();
  }

  private drawSquareHandle(x: number, y: number, size: number, offset: number): void {
    this.context.fillStyle = SELECTION_FILL_COLOR;
    this.context.strokeStyle = SELECTION_STROKE_COLOR;
    this.context.lineWidth = 2;
    this.drawRoundedRect(x - offset, y - offset, size, size, 4);
    this.context.fill();
    this.context.stroke();
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    const clampedRadius = Math.min(radius, width / 2, height / 2);

    this.context.beginPath();
    this.context.moveTo(x + clampedRadius, y);
    this.context.lineTo(x + width - clampedRadius, y);
    this.context.arcTo(x + width, y, x + width, y + clampedRadius, clampedRadius);
    this.context.lineTo(x + width, y + height - clampedRadius);
    this.context.arcTo(x + width, y + height, x + width - clampedRadius, y + height, clampedRadius);
    this.context.lineTo(x + clampedRadius, y + height);
    this.context.arcTo(x, y + height, x, y + height - clampedRadius, clampedRadius);
    this.context.lineTo(x, y + clampedRadius);
    this.context.arcTo(x, y, x + clampedRadius, y, clampedRadius);
    this.context.closePath();
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
