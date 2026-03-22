import type {
  CanvasDocument,
  PanSource,
  PointerInput,
  Point,
  Size,
  ToolId,
  ViewportState,
  WheelInput,
} from '@oop-draw/shared';
import { createDocument } from '../document/createDocument';
import { Camera } from '../camera/camera';
import { ViewportConstraints } from '../camera/ViewportConstraints';
import { PanSession } from './PanSession';
import { cloneDocument } from './cloneDocument';

type EditorSubscriber = () => void;

function getViewportCenter(size: Size): Point {
  return {
    x: size.width / 2,
    y: size.height / 2,
  };
}

export class EditorController {
  private document: CanvasDocument;
  private tool: ToolId = 'select';
  private readonly camera: Camera;
  private readonly constraints: ViewportConstraints;
  private viewportSize: Size = { width: 1, height: 1 };
  private activePanSession: PanSession | null = null;
  private readonly pressedKeys = new Set<string>();
  private readonly subscribers = new Set<EditorSubscriber>();

  constructor(document: CanvasDocument = createDocument()) {
    this.document = cloneDocument(document);
    this.constraints = new ViewportConstraints();
    this.camera = new Camera(this.document.camera, {
      minZoom: this.constraints.getMinZoom(),
      maxZoom: this.constraints.getMaxZoom(),
    });
  }

  subscribe(listener: EditorSubscriber): () => void {
    this.subscribers.add(listener);

    return () => {
      this.subscribers.delete(listener);
    };
  }

  load(document: CanvasDocument): void {
    this.document = cloneDocument(document);
    this.camera.setPosition(this.document.camera.x, this.document.camera.y);
    this.camera.setZoom(this.document.camera.zoom);
    this.syncCameraToDocument();
    this.emitChange();
  }

  setTool(tool: ToolId): void {
    this.tool = tool;
    this.emitChange();
  }

  getTool(): ToolId {
    return this.tool;
  }

  setViewportSize(width: number, height: number): void {
    this.viewportSize = {
      width: Math.max(1, width),
      height: Math.max(1, height),
    };
    this.camera.setViewportSize(this.viewportSize.width, this.viewportSize.height);
    this.emitChange();
  }

  handlePointerDown(input: PointerInput): boolean {
    const source = this.getPanSource(input);

    if (!source) {
      return false;
    }

    this.activePanSession = new PanSession(
      this.camera,
      { x: input.clientX, y: input.clientY },
      this.camera.toSnapshot(),
      source,
    );
    this.emitChange();
    return true;
  }

  handlePointerMove(input: PointerInput): boolean {
    if (!this.activePanSession) {
      return false;
    }

    this.activePanSession.update({ x: input.clientX, y: input.clientY });
    this.syncCameraToDocument();
    this.emitChange();
    return true;
  }

  handlePointerUp(): boolean {
    if (!this.activePanSession) {
      return false;
    }

    this.activePanSession.finish();
    this.activePanSession = null;
    this.emitChange();
    return true;
  }

  handleWheel(input: WheelInput): boolean {
    const nextZoom = this.constraints.getNextZoomStep(this.camera.getState().zoom, input.deltaY);
    this.camera.zoomAt({ x: input.clientX, y: input.clientY }, nextZoom, this.viewportSize);
    this.syncCameraToDocument();
    this.emitChange();
    return true;
  }

  handleKeyDown(code: string): boolean {
    this.pressedKeys.add(code);
    if (code === 'Space') {
      this.emitChange();
      return true;
    }

    return false;
  }

  handleKeyUp(code: string): boolean {
    const hadCode = this.pressedKeys.delete(code);

    if (hadCode) {
      this.emitChange();
    }

    return hadCode;
  }

  zoomIn(center: Point = getViewportCenter(this.viewportSize)): void {
    const nextZoom = this.constraints.getKeyboardZoomIn(this.camera.getState().zoom);
    this.camera.zoomAt(center, nextZoom, this.viewportSize);
    this.syncCameraToDocument();
    this.emitChange();
  }

  zoomOut(center: Point = getViewportCenter(this.viewportSize)): void {
    const nextZoom = this.constraints.getKeyboardZoomOut(this.camera.getState().zoom);
    this.camera.zoomAt(center, nextZoom, this.viewportSize);
    this.syncCameraToDocument();
    this.emitChange();
  }

  resetZoom(center: Point = getViewportCenter(this.viewportSize)): void {
    this.camera.zoomAt(center, 1, this.viewportSize);
    this.syncCameraToDocument();
    this.emitChange();
  }

  getSnapshot(): CanvasDocument {
    return cloneDocument(this.document);
  }

  getViewportState(): ViewportState {
    return {
      isPanning: this.activePanSession !== null,
      panSource: this.activePanSession?.getSource() ?? null,
      zoomPercent: Math.round(this.camera.getState().zoom * 100),
    };
  }

  getCamera(): Camera {
    return this.camera;
  }

  private getPanSource(input: PointerInput): PanSource | null {
    if (this.tool === 'hand' && input.button === 0) {
      return 'hand-tool';
    }

    if (input.button === 1) {
      return 'middle-button';
    }

    if (input.button === 0 && (input.spaceKey || this.pressedKeys.has('Space'))) {
      return 'space-drag';
    }

    return null;
  }

  private syncCameraToDocument(): void {
    this.document.camera = this.camera.toSnapshot();
    this.document.metadata.updatedAt = new Date().toISOString();
  }

  private emitChange(): void {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  }
}
