import { describe, expect, it } from 'vitest';
import { EditorController } from '../controller/EditorController';

function setViewport(controller: EditorController): void {
  controller.setViewportSize(800, 600);
}

describe('EditorController', () => {
  it('starts a middle-button pan session and updates the camera on move', () => {
    const controller = new EditorController();

    setViewport(controller);

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

    expect(controller.getSnapshot().camera.x).toBeCloseTo(60, 5);
    expect(controller.getSnapshot().camera.y).toBeCloseTo(40, 5);
    expect(controller.getViewportState().isPanning).toBe(true);
  });

  it('creates a rectangle from a drag gesture and keeps the active tool', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 2,
      button: 0,
      buttons: 1,
      clientX: 400,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    const draftId = controller.getPresentationState().draftElement?.id;
    controller.handlePointerMove({
      pointerId: 2,
      button: 0,
      buttons: 1,
      clientX: 460,
      clientY: 360,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    expect(controller.getPresentationState().draftElement?.id).toBe(draftId);
    controller.handlePointerUp();

    const rectangle = controller.getSnapshot().elements[0];
    expect(rectangle).toMatchObject({
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 60,
      height: 60,
    });
    expect(controller.getTool()).toBe('rectangle');
  });

  it('normalizes ellipse geometry when dragging in reverse', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('ellipse');

    controller.handlePointerDown({
      pointerId: 3,
      button: 0,
      buttons: 1,
      clientX: 460,
      clientY: 360,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerMove({
      pointerId: 3,
      button: 0,
      buttons: 1,
      clientX: 400,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    expect(controller.getSnapshot().elements[0]).toMatchObject({
      type: 'ellipse',
      x: 0,
      y: 0,
      width: 60,
      height: 60,
    });
  });

  it('creates an arrow and lets the selected endpoint be edited', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('arrow');

    controller.handlePointerDown({
      pointerId: 4,
      button: 0,
      buttons: 1,
      clientX: 400,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerMove({
      pointerId: 4,
      button: 0,
      buttons: 1,
      clientX: 460,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    controller.setTool('select');
    controller.handlePointerDown({
      pointerId: 5,
      button: 0,
      buttons: 1,
      clientX: 430,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    controller.handlePointerDown({
      pointerId: 6,
      button: 0,
      buttons: 1,
      clientX: 460,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerMove({
      pointerId: 6,
      button: 0,
      buttons: 1,
      clientX: 480,
      clientY: 320,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    expect(controller.getSnapshot().elements[0]).toMatchObject({
      type: 'arrow',
      x: 0,
      y: 0,
      endX: 80,
      endY: 20,
    });
  });

  it('moves and resizes a selected rectangle', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 7,
      button: 0,
      buttons: 1,
      clientX: 400,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerMove({
      pointerId: 7,
      button: 0,
      buttons: 1,
      clientX: 460,
      clientY: 360,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    controller.setTool('select');
    controller.handlePointerDown({
      pointerId: 8,
      button: 0,
      buttons: 1,
      clientX: 430,
      clientY: 330,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerMove({
      pointerId: 8,
      button: 0,
      buttons: 1,
      clientX: 450,
      clientY: 360,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    expect(controller.getSnapshot().elements[0]).toMatchObject({
      type: 'rectangle',
      x: 20,
      y: 30,
      width: 60,
      height: 60,
    });

    controller.handlePointerDown({
      pointerId: 9,
      button: 0,
      buttons: 1,
      clientX: 420,
      clientY: 330,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerMove({
      pointerId: 9,
      button: 0,
      buttons: 1,
      clientX: 400,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    expect(controller.getSnapshot().elements[0]).toMatchObject({
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 80,
      height: 90,
    });
  });

  it('deletes the selected element from keyboard input', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 10,
      button: 0,
      buttons: 1,
      clientX: 400,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerMove({
      pointerId: 10,
      button: 0,
      buttons: 1,
      clientX: 460,
      clientY: 360,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    controller.setTool('select');
    controller.handlePointerDown({
      pointerId: 11,
      button: 0,
      buttons: 1,
      clientX: 430,
      clientY: 330,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    expect(controller.handleKeyDown('Delete')).toBe(true);
    expect(controller.getSnapshot().elements).toHaveLength(0);
    expect(controller.getViewportState().selectedElementId).toBeNull();
  });

  it('updates document camera when zooming with ctrl + wheel', () => {
    const controller = new EditorController();

    setViewport(controller);
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

    setViewport(controller);
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
});
