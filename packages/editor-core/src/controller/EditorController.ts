import type {
  ArrowElement,
  CanvasDocument,
  EllipseElement,
  PanSource,
  PointerInput,
  Point,
  RectangleElement,
  ShapeElement,
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
import { createSelection, getSingleSelectionId, type SelectionState } from '../selection/selection';
import type { EditorPresentationState } from '../scene/presentation';
import {
  createElementId,
  createShapeElement,
  hitTestElement,
  hitTestHandle,
  isRenderableShape,
  resizeArrowElement,
  resizeBoxElement,
  SELECTION_OUTLINE_SCREEN_PADDING,
  translateElement,
  type ArrowHandle,
  type BoxHandle,
  type ElementHandleTarget,
} from '../scene/element-interaction';

type EditorSubscriber = () => void;

type DrawTool = Extract<ToolId, 'rectangle' | 'ellipse' | 'arrow'>;

interface DrawSession {
  kind: 'draw';
  pointerId: number;
  tool: DrawTool;
  elementId: string;
  startWorld: Point;
}

interface ClickSelectionSession {
  kind: 'click-select';
  pointerId: number;
  elementId: string | null;
}

interface MoveSession {
  kind: 'move';
  pointerId: number;
  elementId: string;
  startWorld: Point;
  startElement: ShapeElement;
}

interface ResizeBoxSession {
  kind: 'resize-box';
  pointerId: number;
  elementId: string;
  handle: BoxHandle;
  startWorld: Point;
  startElement: RectangleElement | EllipseElement;
}

interface ResizeArrowSession {
  kind: 'resize-arrow';
  pointerId: number;
  elementId: string;
  handle: ArrowHandle;
  startElement: ArrowElement;
}

type TransformSession = MoveSession | ResizeBoxSession | ResizeArrowSession;

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
  private activeDrawSession: DrawSession | null = null;
  private activeClickSelectionSession: ClickSelectionSession | null = null;
  private activeTransformSession: TransformSession | null = null;
  private hoveredHandle: ElementHandleTarget | null = null;
  private isHoveringSelectedElementBody = false;
  private isHoveringAnyShape = false;
  private draftElement: ShapeElement | null = null;
  private readonly selection: SelectionState = createSelection();
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
    this.selection.ids = [];
    this.draftElement = null;
    this.activeDrawSession = null;
    this.activeClickSelectionSession = null;
    this.activeTransformSession = null;
    this.hoveredHandle = null;
    this.isHoveringSelectedElementBody = false;
    this.isHoveringAnyShape = false;
    this.syncCameraToDocument();
    this.emitChange();
  }

  setTool(tool: ToolId): void {
    this.tool = tool;
    this.draftElement = null;
    this.activeDrawSession = null;
    this.activeClickSelectionSession = null;
    this.activeTransformSession = null;
    this.hoveredHandle = null;
    this.isHoveringSelectedElementBody = false;
    this.isHoveringAnyShape = false;
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

    if (source) {
      this.activePanSession = new PanSession(
        this.camera,
        { x: input.clientX, y: input.clientY },
        this.camera.toSnapshot(),
        source,
      );
      this.emitChange();
      return true;
    }

    if (input.button !== 0) {
      return false;
    }

    const worldPoint = this.toWorldPoint(input.clientX, input.clientY);

    if (this.isDrawTool(this.tool)) {
      this.activeClickSelectionSession = null;
      this.hoveredHandle = null;
      this.isHoveringSelectedElementBody = false;
      this.isHoveringAnyShape = false;
      this.activeDrawSession = {
        kind: 'draw',
        pointerId: input.pointerId,
        tool: this.tool,
        elementId: createElementId(),
        startWorld: worldPoint,
      };
      this.draftElement = createShapeElement(
        this.tool,
        worldPoint,
        worldPoint,
        this.activeDrawSession.elementId,
      );
      this.emitChange();
      return true;
    }

    if (this.tool !== 'select') {
      return false;
    }

    const selectedElement = this.getSelectedShapeElement();

    if (selectedElement) {
      const handleTarget = hitTestHandle(selectedElement, worldPoint, this.camera.getState().zoom);

      if (handleTarget) {
        this.activeClickSelectionSession = null;
        this.hoveredHandle = handleTarget;
        this.isHoveringSelectedElementBody = false;
        this.isHoveringAnyShape = true;
        this.activeTransformSession = this.createResizeSession(input.pointerId, selectedElement, handleTarget);
        this.emitChange();
        return true;
      }
    }

    const hitElement = this.findTopmostShapeAt(worldPoint);
    const selectedElementId = getSingleSelectionId(this.selection);

    if (!hitElement) {
      this.hoveredHandle = null;
      this.isHoveringSelectedElementBody = false;
      this.isHoveringAnyShape = false;
      this.activeClickSelectionSession = {
        kind: 'click-select',
        pointerId: input.pointerId,
        elementId: null,
      };
      this.emitChange();
      return true;
    }

    if (hitElement.id !== selectedElementId) {
      this.hoveredHandle = null;
      this.isHoveringSelectedElementBody = false;
      this.isHoveringAnyShape = true;
      this.activeClickSelectionSession = {
        kind: 'click-select',
        pointerId: input.pointerId,
        elementId: hitElement.id,
      };
      this.emitChange();
      return true;
    }

    this.activeClickSelectionSession = null;
    this.hoveredHandle = null;
    this.isHoveringSelectedElementBody = false;
    this.isHoveringAnyShape = true;
    this.activeTransformSession = {
      kind: 'move',
      pointerId: input.pointerId,
      elementId: hitElement.id,
      startWorld: worldPoint,
      startElement: { ...hitElement },
    };
    this.emitChange();
    return true;
  }

  handlePointerMove(input: PointerInput): boolean {
    if (this.activePanSession) {
      this.activePanSession.update({ x: input.clientX, y: input.clientY });
      this.syncCameraToDocument();
      this.emitChange();
      return true;
    }

    const worldPoint = this.toWorldPoint(input.clientX, input.clientY);

    if (this.activeDrawSession) {
      this.draftElement = createShapeElement(
        this.activeDrawSession.tool,
        this.activeDrawSession.startWorld,
        worldPoint,
        this.activeDrawSession.elementId,
      );
      this.emitChange();
      return true;
    }

    if (this.activeClickSelectionSession) {
      return true;
    }

    if (!this.activeTransformSession) {
      return this.updateHoverState(worldPoint);
    }

    switch (this.activeTransformSession.kind) {
      case 'move': {
        const deltaX = worldPoint.x - this.activeTransformSession.startWorld.x;
        const deltaY = worldPoint.y - this.activeTransformSession.startWorld.y;
        this.updateElementById(
          this.activeTransformSession.elementId,
          translateElement(this.activeTransformSession.startElement, deltaX, deltaY),
        );
        break;
      }
      case 'resize-box': {
        this.updateElementById(
          this.activeTransformSession.elementId,
          resizeBoxElement(
            this.activeTransformSession.startElement,
            this.activeTransformSession.handle,
            this.activeTransformSession.startWorld,
            worldPoint,
          ),
        );
        break;
      }
      case 'resize-arrow': {
        this.updateElementById(
          this.activeTransformSession.elementId,
          resizeArrowElement(this.activeTransformSession.startElement, this.activeTransformSession.handle, worldPoint),
        );
        break;
      }
    }

    this.touchDocument();
    this.emitChange();
    return true;
  }

  handlePointerUp(): boolean {
    if (this.activePanSession) {
      this.activePanSession.finish();
      this.activePanSession = null;
      this.emitChange();
      return true;
    }

    if (this.activeDrawSession) {
      if (this.draftElement && isRenderableShape(this.draftElement)) {
        this.document.elements = [...this.document.elements, this.draftElement];
        this.selection.ids = [this.draftElement.id];
        this.tool = 'select';
        this.touchDocument();
      }

      this.activeDrawSession = null;
      this.activeClickSelectionSession = null;
      this.hoveredHandle = null;
      this.isHoveringSelectedElementBody = false;
      this.isHoveringAnyShape = false;
      this.draftElement = null;
      this.emitChange();
      return true;
    }

    if (this.activeClickSelectionSession) {
      this.selection.ids = this.activeClickSelectionSession.elementId
        ? [this.activeClickSelectionSession.elementId]
        : [];
      this.activeClickSelectionSession = null;
      this.hoveredHandle = null;
      this.isHoveringSelectedElementBody = false;
      this.isHoveringAnyShape = false;
      this.emitChange();
      return true;
    }

    if (this.activeTransformSession) {
      this.activeTransformSession = null;
      this.hoveredHandle = null;
      this.isHoveringSelectedElementBody = false;
      this.isHoveringAnyShape = false;
      this.emitChange();
      return true;
    }

    return false;
  }

  handleWheel(input: WheelInput): boolean {
    if (!input.ctrlKey && !input.metaKey) {
      const zoom = this.camera.getState().zoom;
      this.camera.panBy(-input.deltaX / zoom, -input.deltaY / zoom);
      this.syncCameraToDocument();
      this.emitChange();
      return true;
    }

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

    if (code === 'Escape') {
      return this.clearSelection();
    }

    if (code === 'Delete' || code === 'Backspace') {
      return this.deleteSelection();
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

  setGridEnabled(enabled: boolean): void {
    if (this.document.appState.gridEnabled === enabled) {
      return;
    }

    this.document.appState.gridEnabled = enabled;
    this.document.metadata.updatedAt = new Date().toISOString();
    this.emitChange();
  }

  deleteSelection(): boolean {
    const selectedId = getSingleSelectionId(this.selection);

    if (!selectedId) {
      return false;
    }

    this.document.elements = this.document.elements.filter((element) => element.id !== selectedId);
    this.selection.ids = [];
    this.touchDocument();
    this.emitChange();
    return true;
  }

  clearSelection(): boolean {
    if (this.selection.ids.length === 0) {
      return false;
    }

    this.selection.ids = [];
    this.hoveredHandle = null;
    this.isHoveringSelectedElementBody = false;
    this.emitChange();
    return true;
  }

  getSnapshot(): CanvasDocument {
    return cloneDocument(this.document);
  }

  getViewportState(): ViewportState {
    const selectedElementId = getSingleSelectionId(this.selection);
    const interaction = this.activePanSession
      ? 'panning'
      : this.activeDrawSession
        ? 'drawing'
        : this.activeTransformSession?.kind === 'move'
          ? 'moving'
          : this.activeTransformSession
            ? 'resizing'
            : 'idle';

    return {
      isPanning: this.activePanSession !== null,
      panSource: this.activePanSession?.getSource() ?? null,
      zoomPercent: Math.round(this.camera.getState().zoom * 100),
      isDrawing: this.activeDrawSession !== null,
      selectedElementId,
      interaction,
      cursor: this.getViewportCursor(),
    };
  }

  getCamera(): Camera {
    return this.camera;
  }

  getPresentationState(): EditorPresentationState {
    return {
      draftElement: this.draftElement ? { ...this.draftElement } : null,
      selection: { ids: [...this.selection.ids] },
    };
  }

  private isDrawTool(tool: ToolId): tool is DrawTool {
    return tool === 'rectangle' || tool === 'ellipse' || tool === 'arrow';
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

  private toWorldPoint(clientX: number, clientY: number): Point {
    return this.camera.getTransformer(this.viewportSize).screenToWorld({ x: clientX, y: clientY });
  }

  private getSelectedShapeElement(): ShapeElement | null {
    const selectedId = getSingleSelectionId(this.selection);

    if (!selectedId) {
      return null;
    }

    const element = this.document.elements.find((item) => item.id === selectedId);
    return element && element.type !== 'text' ? element : null;
  }

  private createResizeSession(pointerId: number, element: ShapeElement, target: ElementHandleTarget): TransformSession {
    if (target.kind === 'arrow' && element.type === 'arrow') {
      return {
        kind: 'resize-arrow',
        pointerId,
        elementId: element.id,
        handle: target.handle,
        startElement: { ...element },
      };
    }

    return {
      kind: 'resize-box',
      pointerId,
      elementId: element.id,
      handle: target.handle as BoxHandle,
      startWorld: this.toWorldPointFromElementHandleTarget(element, target),
      startElement: { ...element } as RectangleElement | EllipseElement,
    };
  }

  private toWorldPointFromElementHandleTarget(element: ShapeElement, target: ElementHandleTarget): Point {
    if (element.type === 'arrow') {
      return target.handle === 'start'
        ? { x: element.x, y: element.y }
        : { x: element.endX, y: element.endY };
    }

    const padding = SELECTION_OUTLINE_SCREEN_PADDING / this.camera.getState().zoom;
    const bounds = {
      left: element.x - padding,
      top: element.y - padding,
      right: element.x + element.width + padding,
      bottom: element.y + element.height + padding,
    };

    switch (target.handle) {
      case 'n':
        return { x: (bounds.left + bounds.right) / 2, y: bounds.top };
      case 'ne':
        return { x: bounds.right, y: bounds.top };
      case 'e':
        return { x: bounds.right, y: (bounds.top + bounds.bottom) / 2 };
      case 'se':
        return { x: bounds.right, y: bounds.bottom };
      case 's':
        return { x: (bounds.left + bounds.right) / 2, y: bounds.bottom };
      case 'sw':
        return { x: bounds.left, y: bounds.bottom };
      case 'w':
        return { x: bounds.left, y: (bounds.top + bounds.bottom) / 2 };
      case 'nw':
        return { x: bounds.left, y: bounds.top };
    }

    throw new Error(`Unsupported handle: ${String(target.handle)}`);
  }

  private findTopmostShapeAt(worldPoint: Point): ShapeElement | null {
    const zoom = this.camera.getState().zoom;

    for (let index = this.document.elements.length - 1; index >= 0; index -= 1) {
      const element = this.document.elements[index];

      if (element.type === 'text') {
        continue;
      }

      if (hitTestElement(element, worldPoint, zoom)) {
        return element;
      }
    }

    return null;
  }

  private updateElementById(elementId: string, nextElement: ShapeElement): void {
    this.document.elements = this.document.elements.map((element) =>
      element.id === elementId ? nextElement : element,
    );
  }

  private updateHoverState(worldPoint: Point): boolean {
    if (this.tool !== 'select') {
      return false;
    }

    const selectedElement = this.getSelectedShapeElement();
    const zoom = this.camera.getState().zoom;
    const nextHoveredHandle = selectedElement ? hitTestHandle(selectedElement, worldPoint, zoom) : null;
    const nextHoveringSelectedElementBody =
      selectedElement !== null && nextHoveredHandle === null && hitTestElement(selectedElement, worldPoint, zoom);
    const nextHoveringAnyShape = this.findTopmostShapeAt(worldPoint) !== null;

    const didChange =
      !this.isSameHandleTarget(this.hoveredHandle, nextHoveredHandle) ||
      this.isHoveringSelectedElementBody !== nextHoveringSelectedElementBody ||
      this.isHoveringAnyShape !== nextHoveringAnyShape;

    this.hoveredHandle = nextHoveredHandle;
    this.isHoveringSelectedElementBody = nextHoveringSelectedElementBody;
    this.isHoveringAnyShape = nextHoveringAnyShape;

    if (didChange) {
      this.emitChange();
    }

    return didChange;
  }

  private isSameHandleTarget(a: ElementHandleTarget | null, b: ElementHandleTarget | null): boolean {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    return a.kind === b.kind && a.handle === b.handle;
  }

  private getViewportCursor(): ViewportState['cursor'] {
    if (this.activePanSession) {
      return 'grabbing';
    }

    if (this.activeDrawSession) {
      return 'crosshair';
    }

    if (this.activeTransformSession?.kind === 'move') {
      return 'move';
    }

    if (this.activeTransformSession?.kind === 'resize-box') {
      return this.getBoxHandleCursor(this.activeTransformSession.handle);
    }

    if (this.activeTransformSession?.kind === 'resize-arrow') {
      return 'grabbing';
    }

    if (this.hoveredHandle?.kind === 'box') {
      return this.getBoxHandleCursor(this.hoveredHandle.handle);
    }

    if (this.hoveredHandle?.kind === 'arrow') {
      return 'grab';
    }

    if (this.isHoveringSelectedElementBody) {
      return 'move';
    }

    if (this.tool === 'select' && this.isHoveringAnyShape) {
      return 'move';
    }

    if (this.tool === 'hand' || this.pressedKeys.has('Space')) {
      return 'grab';
    }

    if (this.isDrawTool(this.tool)) {
      return 'crosshair';
    }

    return 'default';
  }

  private getBoxHandleCursor(handle: BoxHandle): ViewportState['cursor'] {
    switch (handle) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
    }
  }

  private touchDocument(): void {
    this.document.metadata.updatedAt = new Date().toISOString();
  }

  private syncCameraToDocument(): void {
    this.document.camera = this.camera.toSnapshot();
    this.touchDocument();
  }

  private emitChange(): void {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  }
}
