import { describe, expect, it } from 'vitest';
import { EditorController } from '../controller/EditorController';

describe('EditorController', () => {
  it('starts a middle-button pan session and updates the camera on move', () => {
    const controller = new EditorController();

    controller.setViewportSize(800, 600);

    expect(
      controller.handlePointerDown({
        pointerId: 1,
        button: 1,
        buttons: 4,
        clientX: 100,
        clientY: 100,
        spaceKey: false,
        altKey: false,
        shiftKey: false,
        ctrlKey: false,
      }),
    ).toBe(true);

    controller.handlePointerMove({
      pointerId: 1,
      button: 1,
      buttons: 4,
      clientX: 160,
      clientY: 140,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });

    const snapshot = controller.getSnapshot();

    expect(snapshot.camera.x).toBeCloseTo(60, 5);
    expect(snapshot.camera.y).toBeCloseTo(40, 5);
    expect(controller.getViewportState().isPanning).toBe(true);
  });

  it('starts a space-drag pan session without switching the active tool', () => {
    const controller = new EditorController();

    controller.handleKeyDown('Space');

    expect(
      controller.handlePointerDown({
        pointerId: 2,
        button: 0,
        buttons: 1,
        clientX: 20,
        clientY: 20,
        spaceKey: true,
        altKey: false,
        shiftKey: false,
        ctrlKey: false,
      }),
    ).toBe(true);
    expect(controller.getTool()).toBe('select');
    expect(controller.getViewportState().panSource).toBe('space-drag');
  });

  it('ignores pointer move when no pan session is active', () => {
    const controller = new EditorController();

    expect(
      controller.handlePointerMove({
        pointerId: 3,
        button: 0,
        buttons: 0,
        clientX: 120,
        clientY: 80,
        spaceKey: false,
        altKey: false,
        shiftKey: false,
        ctrlKey: false,
      }),
    ).toBe(false);
    expect(controller.getSnapshot().camera).toMatchObject({ x: 0, y: 0, zoom: 1 });
  });

  it('updates document camera when zooming with ctrl + wheel', () => {
    const controller = new EditorController();

    controller.setViewportSize(800, 600);
    controller.handleWheel({
      clientX: 320,
      clientY: 240,
      deltaX: 0,
      deltaY: -120,
      ctrlKey: true,
      metaKey: false,
    });

    expect(controller.getSnapshot().camera.zoom).toBeGreaterThan(1);
  });

  it('pans the camera when scrolling without ctrl', () => {
    const controller = new EditorController();

    controller.setViewportSize(800, 600);
    controller.handleWheel({
      clientX: 320,
      clientY: 240,
      deltaX: 30,
      deltaY: 120,
      ctrlKey: false,
      metaKey: false,
    });

    expect(controller.getSnapshot().camera).toMatchObject({ x: -30, y: -120, zoom: 1 });
  });

  it('keeps document state in sync when using keyboard zoom helpers', () => {
    const controller = new EditorController();

    controller.setViewportSize(800, 600);
    controller.zoomIn();
    controller.zoomOut();

    expect(controller.getSnapshot().camera.zoom).toBeCloseTo(1, 5);

    controller.resetZoom();

    expect(controller.getSnapshot().camera.zoom).toBe(1);
  });

  it('uses left-button drag as pan when the hand tool is active', () => {
    const controller = new EditorController();

    controller.setTool('hand');

    expect(
      controller.handlePointerDown({
        pointerId: 4,
        button: 0,
        buttons: 1,
        clientX: 40,
        clientY: 40,
        spaceKey: false,
        altKey: false,
        shiftKey: false,
        ctrlKey: false,
      }),
    ).toBe(true);
    expect(controller.getViewportState().panSource).toBe('hand-tool');
  });

  it('toggles grid visibility in document app state', () => {
    const controller = new EditorController();

    controller.setGridEnabled(false);
    expect(controller.getSnapshot().appState.gridEnabled).toBe(false);

    controller.setGridEnabled(true);
    expect(controller.getSnapshot().appState.gridEnabled).toBe(true);
  });
});
