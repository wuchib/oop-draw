import type { CanvasDocument } from '../types/document';

export function isCanvasDocument(value: unknown): value is CanvasDocument {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CanvasDocument>;
  return (
    typeof candidate.version === 'number' &&
    Array.isArray(candidate.elements) &&
    Array.isArray(candidate.assets) &&
    typeof candidate.camera?.zoom === 'number' &&
    typeof candidate.metadata?.title === 'string'
  );
}
