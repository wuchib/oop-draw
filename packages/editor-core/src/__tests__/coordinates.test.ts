import { describe, expect, it } from 'vitest';
import { ViewportTransformer } from '../camera/coordinates';

describe('ViewportTransformer', () => {
  it('converts between world and screen coordinates symmetrically', () => {
    const transformer = new ViewportTransformer(
      { x: 20, y: -10, zoom: 2 },
      { width: 800, height: 600 },
    );
    const point = { x: 15, y: 30 };

    const screen = transformer.worldToScreen(point);
    const world = transformer.screenToWorld(screen);

    expect(world.x).toBeCloseTo(point.x, 5);
    expect(world.y).toBeCloseTo(point.y, 5);
  });

  it('converts deltas according to zoom', () => {
    const transformer = new ViewportTransformer(
      { x: 0, y: 0, zoom: 2.5 },
      { width: 500, height: 400 },
    );

    expect(transformer.screenDeltaToWorld({ x: 25, y: -50 })).toEqual({
      x: 10,
      y: -20,
    });
    expect(transformer.worldDeltaToScreen({ x: 4, y: 6 })).toEqual({
      x: 10,
      y: 15,
    });
  });
});
