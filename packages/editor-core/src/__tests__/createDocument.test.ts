import { describe, expect, it } from 'vitest';
import { createDocument } from '../document/createDocument';

describe('createDocument', () => {
  it('creates a blank document with the expected defaults', () => {
    const document = createDocument();

    expect(document.elements).toEqual([]);
    expect(document.camera.zoom).toBe(1);
    expect(document.appState.gridEnabled).toBe(true);
  });
});
