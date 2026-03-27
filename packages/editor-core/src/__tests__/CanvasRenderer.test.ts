// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';

const roughRectangle = vi.fn();
const roughEllipse = vi.fn();
const roughLine = vi.fn();

vi.mock('roughjs/bin/canvas', () => ({
  RoughCanvas: vi.fn(() => ({
      rectangle: roughRectangle,
      ellipse: roughEllipse,
      line: roughLine,
    })),
}));

import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { Camera } from '../camera/camera';
import { createDocument } from '../document/createDocument';

interface MockContext {
  arcTo: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  setLineDash: ReturnType<typeof vi.fn>;
  setTransform: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  globalAlpha: number;
  lineWidth: number;
  strokeStyle: string;
  closePath: ReturnType<typeof vi.fn>;
}

function createMockContext(): MockContext {
  return {
    arcTo: vi.fn(),
    arc: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setLineDash: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
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

  it('renders rectangle, ellipse, and arrow elements', () => {
    roughRectangle.mockClear();
    roughEllipse.mockClear();
    roughLine.mockClear();

    const context = createMockContext();
    const renderer = new CanvasRenderer(createMockCanvas(context), new Camera({ x: 0, y: 0, zoom: 1 }));
    const document = createDocument();

    document.elements = [
      {
        id: 'rect-1',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 80,
        height: 60,
        strokeColor: '#1d4ed8',
        strokeWidth: 2,
        fillColor: 'rgba(59, 130, 246, 0.12)',
      },
      {
        id: 'ellipse-1',
        type: 'ellipse',
        x: 90,
        y: 40,
        width: 70,
        height: 50,
        strokeColor: '#1d4ed8',
        strokeWidth: 2,
        fillColor: 'rgba(59, 130, 246, 0.12)',
      },
      {
        id: 'arrow-1',
        type: 'arrow',
        x: -40,
        y: -30,
        endX: 20,
        endY: 40,
        strokeColor: '#1d4ed8',
        strokeWidth: 2,
        fillColor: 'rgba(59, 130, 246, 0.12)',
      },
    ];

    renderer.resize(320, 240);
    renderer.render(document);

    expect(roughRectangle).toHaveBeenCalledTimes(1);
    expect(roughEllipse).toHaveBeenCalledTimes(1);
    expect(roughLine).toHaveBeenCalledTimes(1);
    expect(roughRectangle.mock.calls[0]?.[4]).toMatchObject({ seed: expect.any(Number) });
  });

  it('renders draft and selected handles from presentation state', () => {
    const context = createMockContext();
    const renderer = new CanvasRenderer(createMockCanvas(context), new Camera({ x: 0, y: 0, zoom: 1 }));
    const document = createDocument();

    document.elements = [
      {
        id: 'rect-1',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 80,
        height: 60,
        strokeColor: '#1d4ed8',
        strokeWidth: 2,
        fillColor: 'rgba(59, 130, 246, 0.12)',
      },
    ];

    renderer.resize(320, 240);
    renderer.render(document, {
      draftElement: {
        id: 'draft-1',
        type: 'ellipse',
        x: 90,
        y: 40,
        width: 70,
        height: 50,
        strokeColor: '#1d4ed8',
        strokeWidth: 2,
        fillColor: 'rgba(59, 130, 246, 0.12)',
      },
      selection: { ids: ['rect-1'] },
    });

    expect(roughEllipse).toHaveBeenCalled();
    expect(context.strokeRect).toHaveBeenCalledTimes(0);
    expect(context.fillRect).toHaveBeenCalledTimes(1);
    expect(context.arcTo).toHaveBeenCalled();
    expect(context.moveTo).toHaveBeenCalled();
    expect(context.lineTo).toHaveBeenCalled();
    expect(context.arc).toHaveBeenCalledTimes(1);
  });

  it('renders arrow selection endpoints and midpoint affordance', () => {
    const context = createMockContext();
    const renderer = new CanvasRenderer(createMockCanvas(context), new Camera({ x: 0, y: 0, zoom: 1 }));
    const document = createDocument();

    document.elements = [
      {
        id: 'arrow-1',
        type: 'arrow',
        x: 0,
        y: 0,
        endX: 80,
        endY: 60,
        strokeColor: '#1d4ed8',
        strokeWidth: 2,
        fillColor: 'rgba(59, 130, 246, 0.12)',
      },
    ];

    renderer.resize(320, 240);
    renderer.render(document, {
      draftElement: null,
      selection: { ids: ['arrow-1'] },
    });

    expect(context.arc).toHaveBeenCalledTimes(3);
    expect(context.strokeRect).not.toHaveBeenCalled();
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
