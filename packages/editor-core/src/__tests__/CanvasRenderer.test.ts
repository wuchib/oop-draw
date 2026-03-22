// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { Camera } from '../camera/camera';
import { createDocument } from '../document/createDocument';

interface MockContext {
  beginPath: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  setTransform: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  fillStyle: string;
  lineWidth: number;
  strokeStyle: string;
}

function createMockContext(): MockContext {
  return {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    lineWidth: 1,
    strokeStyle: '',
  };
}

function createMockCanvas(context: MockContext): HTMLCanvasElement {
  const canvas = {
    width: 0,
    height: 0,
    style: {},
    getContext: vi.fn(() => context),
  };

  return canvas as unknown as HTMLCanvasElement;
}

describe('CanvasRenderer', () => {
  it('updates the canvas size on resize', () => {
    const context = createMockContext();
    const renderer = new CanvasRenderer(createMockCanvas(context), new Camera({ x: 0, y: 0, zoom: 1 }));

    renderer.resize(640, 480);

    expect(context.setTransform).toHaveBeenCalled();
  });

  it('keeps the grid continuous when panning', () => {
    const context = createMockContext();
    const camera = new Camera({ x: 0, y: 0, zoom: 1 });
    const renderer = new CanvasRenderer(createMockCanvas(context), camera);
    const document = createDocument();

    renderer.resize(240, 240);
    renderer.render(document);

    const before = context.moveTo.mock.calls[0]?.[0];

    context.moveTo.mockClear();
    camera.panBy(12, 0);
    document.camera = camera.toSnapshot();
    renderer.render(document);

    const after = context.moveTo.mock.calls[0]?.[0];

    expect(after).not.toBe(before);
  });

  it('jumps grid density instead of drawing hundreds of lines at low zoom', () => {
    const context = createMockContext();
    const camera = new Camera({ x: 0, y: 0, zoom: 0.1 });
    const renderer = new CanvasRenderer(createMockCanvas(context), camera);

    renderer.resize(240, 240);
    renderer.render(createDocument());

    expect(context.moveTo.mock.calls.length).toBeLessThan(60);
  });

  it('skips grid rendering when the grid is disabled', () => {
    const context = createMockContext();
    const renderer = new CanvasRenderer(createMockCanvas(context), new Camera({ x: 0, y: 0, zoom: 1 }));
    const document = createDocument();

    document.appState.gridEnabled = false;

    renderer.resize(240, 240);
    renderer.render(document);

    expect(context.stroke).toHaveBeenCalledTimes(1);
  });
});
