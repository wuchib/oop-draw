import { exportDocument, importDocument } from '@oop-draw/editor-core';
import type { CanvasDocument } from '@oop-draw/shared';

export async function saveDocumentToDownload(canvasDocument: CanvasDocument): Promise<void> {
  const blob = new Blob([exportDocument(canvasDocument)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'oop-draw.json';
  link.click();
  URL.revokeObjectURL(url);
}

export async function openDocumentFromFile(): Promise<CanvasDocument | null> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';

  const file = await new Promise<File | null>((resolve) => {
    input.addEventListener('change', () => {
      resolve(input.files?.[0] ?? null);
    });
    input.click();
  });

  if (!file) {
    return null;
  }

  const raw = await file.text();
  return importDocument(raw);
}

