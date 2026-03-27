import type { CanvasDocument } from '../types/document';
import type { CanvasElement } from '../types/element';

function isCanvasElement(value: unknown): value is CanvasElement {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CanvasElement>;

  if (typeof candidate.id !== 'string' || typeof candidate.type !== 'string') {
    return false;
  }

  if (typeof candidate.x !== 'number' || typeof candidate.y !== 'number') {
    return false;
  }

  switch (candidate.type) {
    case 'rectangle':
    case 'ellipse':
      return (
        typeof candidate.width === 'number' &&
        typeof candidate.height === 'number' &&
        typeof candidate.strokeColor === 'string' &&
        typeof candidate.strokeWidth === 'number' &&
        typeof candidate.fillColor === 'string'
      );
    case 'arrow':
      return (
        typeof candidate.endX === 'number' &&
        typeof candidate.endY === 'number' &&
        typeof candidate.strokeColor === 'string' &&
        typeof candidate.strokeWidth === 'number' &&
        typeof candidate.fillColor === 'string'
      );
    case 'text':
      return typeof candidate.text === 'string';
    default:
      return false;
  }
}

export function isCanvasDocument(value: unknown): value is CanvasDocument {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CanvasDocument>;
  return (
    typeof candidate.version === 'number' &&
    Array.isArray(candidate.elements) &&
    candidate.elements.every((element) => isCanvasElement(element)) &&
    Array.isArray(candidate.assets) &&
    typeof candidate.camera?.zoom === 'number' &&
    typeof candidate.metadata?.title === 'string'
  );
}
