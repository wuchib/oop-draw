import { describe, expect, it } from 'vitest';
import { Camera } from '../camera/camera';

describe('Camera', () => {
  it('starts at zoom 1 by default', () => {
    const camera = new Camera({ x: 0, y: 0, zoom: 1 });

    expect(camera.toSnapshot().zoom).toBe(1);
  });

  it('pans by world-space deltas', () => {
    const camera = new Camera({ x: 0, y: 0, zoom: 1 });

    camera.panBy(24, -12);

    expect(camera.toSnapshot()).toMatchObject({
      x: 24,
      y: -12,
      zoom: 1,
    });
  });

  it('clamps zoom and keeps the zoom anchor stable', () => {
    const camera = new Camera({ x: 20, y: -10, zoom: 1 });
    const viewport = { width: 800, height: 600 };
    const anchor = { x: 280, y: 160 };

    camera.setViewportSize(viewport.width, viewport.height);

    const before = camera.getTransformer(viewport).screenToWorld(anchor);

    camera.zoomAt(anchor, 10, viewport);

    const after = camera.getTransformer(viewport).screenToWorld(anchor);

    expect(camera.toSnapshot().zoom).toBe(4);
    expect(after.x).toBeCloseTo(before.x, 5);
    expect(after.y).toBeCloseTo(before.y, 5);
  });
});
