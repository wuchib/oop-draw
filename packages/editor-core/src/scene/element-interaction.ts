import type {
  ArrowElement,
  CanvasElement,
  EllipseElement,
  Point,
  RectangleElement,
  ShapeElement,
} from '@oop-draw/shared';

export type BoxHandle = 'nw' | 'ne' | 'se' | 'sw';
export type ArrowHandle = 'start' | 'end';
export type ElementHandleTarget =
  | { kind: 'box'; handle: BoxHandle }
  | { kind: 'arrow'; handle: ArrowHandle };

export interface RectBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const HANDLE_SCREEN_RADIUS = 7;
export const LINE_HIT_SCREEN_TOLERANCE = 8;

export function createDefaultShapeStyle() {
  return {
    strokeColor: '#1d4ed8',
    strokeWidth: 2,
    fillColor: 'rgba(59, 130, 246, 0.12)',
  };
}

export function createElementId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `element-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createShapeElement(
  type: 'rectangle' | 'ellipse' | 'arrow',
  start: Point,
  current: Point,
  id: string = createElementId(),
): ShapeElement {
  const style = createDefaultShapeStyle();

  if (type === 'arrow') {
    return {
      id,
      type,
      x: start.x,
      y: start.y,
      endX: current.x,
      endY: current.y,
      ...style,
    };
  }

  const normalized = normalizeRect(start, current);

  return {
    id,
    type,
    x: normalized.left,
    y: normalized.top,
    width: normalized.right - normalized.left,
    height: normalized.bottom - normalized.top,
    ...style,
  } as RectangleElement | EllipseElement;
}

export function getStableRoughSeed(id: string): number {
  let hash = 0;

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) || 1;
}

export function normalizeRect(a: Point, b: Point): RectBounds {
  return {
    left: Math.min(a.x, b.x),
    top: Math.min(a.y, b.y),
    right: Math.max(a.x, b.x),
    bottom: Math.max(a.y, b.y),
  };
}

export function getElementBounds(element: ShapeElement): RectBounds {
  if (element.type === 'arrow') {
    return normalizeRect(
      { x: element.x, y: element.y },
      { x: element.endX, y: element.endY },
    );
  }

  return {
    left: element.x,
    top: element.y,
    right: element.x + element.width,
    bottom: element.y + element.height,
  };
}

export function translateElement<T extends CanvasElement>(element: T, deltaX: number, deltaY: number): T {
  if (element.type === 'arrow') {
    return {
      ...element,
      x: element.x + deltaX,
      y: element.y + deltaY,
      endX: element.endX + deltaX,
      endY: element.endY + deltaY,
    } as T;
  }

  return {
    ...element,
    x: element.x + deltaX,
    y: element.y + deltaY,
  };
}

export function resizeBoxElement<T extends RectangleElement | EllipseElement>(
  element: T,
  handle: BoxHandle,
  nextPoint: Point,
): T {
  const bounds = getElementBounds(element);
  const anchor = getBoxAnchor(bounds, handle);
  const normalized = normalizeRect(anchor, nextPoint);

  return {
    ...element,
    x: normalized.left,
    y: normalized.top,
    width: normalized.right - normalized.left,
    height: normalized.bottom - normalized.top,
  };
}

export function resizeArrowElement(
  element: ArrowElement,
  handle: ArrowHandle,
  nextPoint: Point,
): ArrowElement {
  if (handle === 'start') {
    return { ...element, x: nextPoint.x, y: nextPoint.y };
  }

  return { ...element, endX: nextPoint.x, endY: nextPoint.y };
}

export function isRenderableShape(element: ShapeElement): boolean {
  if (element.type === 'arrow') {
    return Math.hypot(element.endX - element.x, element.endY - element.y) >= 1;
  }

  return element.width >= 1 && element.height >= 1;
}

export function hitTestElement(element: ShapeElement, point: Point, zoom: number): boolean {
  switch (element.type) {
    case 'rectangle': {
      const bounds = getElementBounds(element);
      return point.x >= bounds.left && point.x <= bounds.right && point.y >= bounds.top && point.y <= bounds.bottom;
    }
    case 'ellipse': {
      if (element.width <= 0 || element.height <= 0) {
        return false;
      }

      const radiusX = element.width / 2;
      const radiusY = element.height / 2;
      const centerX = element.x + radiusX;
      const centerY = element.y + radiusY;
      const normalizedX = (point.x - centerX) / radiusX;
      const normalizedY = (point.y - centerY) / radiusY;
      return normalizedX ** 2 + normalizedY ** 2 <= 1;
    }
    case 'arrow': {
      return distanceToSegment(point, { x: element.x, y: element.y }, { x: element.endX, y: element.endY }) <= LINE_HIT_SCREEN_TOLERANCE / zoom;
    }
  }
}

export function getHandlePoints(element: ShapeElement): Array<{ target: ElementHandleTarget; point: Point }> {
  if (element.type === 'arrow') {
    return [
      { target: { kind: 'arrow', handle: 'start' }, point: { x: element.x, y: element.y } },
      { target: { kind: 'arrow', handle: 'end' }, point: { x: element.endX, y: element.endY } },
    ];
  }

  const bounds = getElementBounds(element);
  return [
    { target: { kind: 'box', handle: 'nw' }, point: { x: bounds.left, y: bounds.top } },
    { target: { kind: 'box', handle: 'ne' }, point: { x: bounds.right, y: bounds.top } },
    { target: { kind: 'box', handle: 'se' }, point: { x: bounds.right, y: bounds.bottom } },
    { target: { kind: 'box', handle: 'sw' }, point: { x: bounds.left, y: bounds.bottom } },
  ];
}

export function hitTestHandle(
  element: ShapeElement,
  point: Point,
  zoom: number,
): ElementHandleTarget | null {
  const worldRadius = HANDLE_SCREEN_RADIUS / zoom;

  for (const handle of getHandlePoints(element)) {
    if (Math.hypot(handle.point.x - point.x, handle.point.y - point.y) <= worldRadius) {
      return handle.target;
    }
  }

  return null;
}

function getBoxAnchor(bounds: RectBounds, handle: BoxHandle): Point {
  switch (handle) {
    case 'nw':
      return { x: bounds.right, y: bounds.bottom };
    case 'ne':
      return { x: bounds.left, y: bounds.bottom };
    case 'se':
      return { x: bounds.left, y: bounds.top };
    case 'sw':
      return { x: bounds.right, y: bounds.top };
  }
}

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
  const clamped = Math.max(0, Math.min(1, projection));
  const closestX = start.x + clamped * dx;
  const closestY = start.y + clamped * dy;
  return Math.hypot(point.x - closestX, point.y - closestY);
}
