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
    expect(controller.getViewportState().cursor).toBe('grabbing');
  });

  it('creates a rectangle from a drag gesture, selects it, and returns to the select tool', () => {
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
    expect(controller.getTool()).toBe('select');
    expect(controller.getViewportState().selectedElementId).toBe(rectangle?.id);
    expect(controller.getViewportState().cursor).toBe('default');
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
    expect(controller.getViewportState().cursor).toBe('grabbing');
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

  it('uses grab and grabbing cursors for arrow endpoints', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('arrow');

    controller.handlePointerDown({
      pointerId: 23,
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
      pointerId: 23,
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

    controller.handlePointerMove({
      pointerId: 23,
      button: 0,
      buttons: 0,
      clientX: 460,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    expect(controller.getViewportState().cursor).toBe('grab');

    controller.handlePointerMove({
      pointerId: 23,
      button: 0,
      buttons: 0,
      clientX: 430,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    expect(controller.getViewportState().cursor).toBe('move');

    controller.handlePointerDown({
      pointerId: 24,
      button: 0,
      buttons: 1,
      clientX: 460,
      clientY: 300,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    expect(controller.getViewportState().cursor).toBe('grabbing');
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
      clientX: 410,
      clientY: 320,
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
      x: 10,
      y: 10,
      width: 70,
      height: 80,
    });
  });

  it('selects an unselected rectangle on click before allowing drag', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 14,
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
      pointerId: 14,
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

    controller.handlePointerDown({
      pointerId: 15,
      button: 0,
      buttons: 1,
      clientX: 320,
      clientY: 220,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    expect(controller.getViewportState().selectedElementId).toBeNull();

    controller.handlePointerDown({
      pointerId: 16,
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
      pointerId: 16,
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
      x: 0,
      y: 0,
      width: 60,
      height: 60,
    });
    expect(controller.getViewportState().selectedElementId).toBe(controller.getSnapshot().elements[0]?.id);

    controller.handlePointerDown({
      pointerId: 17,
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
      pointerId: 17,
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
  });

  it('resizes a selected rectangle from any point along the selection border', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 12,
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
      pointerId: 12,
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

    controller.handlePointerDown({
      pointerId: 13,
      button: 0,
      buttons: 1,
      clientX: 438,
      clientY: 290,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerMove({
      pointerId: 13,
      button: 0,
      buttons: 1,
      clientX: 438,
      clientY: 270,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    expect(controller.getSnapshot().elements[0]).toMatchObject({
      type: 'rectangle',
      x: 0,
      y: -20,
      width: 60,
      height: 80,
    });
  });

  it('resizes width and height when dragging a visible corner handle', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 21,
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
      pointerId: 21,
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

    controller.handlePointerDown({
      pointerId: 22,
      button: 0,
      buttons: 1,
      clientX: 390,
      clientY: 290,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerMove({
      pointerId: 22,
      button: 0,
      buttons: 1,
      clientX: 380,
      clientY: 280,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    expect(controller.getSnapshot().elements[0]).toMatchObject({
      type: 'rectangle',
      x: -10,
      y: -10,
      width: 70,
      height: 70,
    });
  });

  it('exposes move and resize cursors while hovering a selected rectangle', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 18,
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
      pointerId: 18,
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

    controller.handlePointerMove({
      pointerId: 18,
      button: 0,
      buttons: 0,
      clientX: 430,
      clientY: 330,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    expect(controller.getViewportState().cursor).toBe('move');

    controller.handlePointerMove({
      pointerId: 18,
      button: 0,
      buttons: 0,
      clientX: 430,
      clientY: 290,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    expect(controller.getViewportState().cursor).toBe('ns-resize');

    controller.handlePointerMove({
      pointerId: 18,
      button: 0,
      buttons: 0,
      clientX: 470,
      clientY: 330,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    expect(controller.getViewportState().cursor).toBe('ew-resize');

    controller.handlePointerMove({
      pointerId: 18,
      button: 0,
      buttons: 0,
      clientX: 470,
      clientY: 290,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    expect(controller.getViewportState().cursor).toBe('nesw-resize');

    controller.handlePointerMove({
      pointerId: 18,
      button: 0,
      buttons: 0,
      clientX: 390,
      clientY: 290,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    expect(controller.getViewportState().cursor).toBe('nwse-resize');
  });

  it('shows a move cursor when the select tool hovers any shape', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 19,
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
      pointerId: 19,
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

    controller.handlePointerDown({
      pointerId: 20,
      button: 0,
      buttons: 1,
      clientX: 320,
      clientY: 220,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });
    controller.handlePointerUp();

    controller.handlePointerMove({
      pointerId: 20,
      button: 0,
      buttons: 0,
      clientX: 430,
      clientY: 330,
      spaceKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    });

    expect(controller.getViewportState().cursor).toBe('move');
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

  it('clears the current selection without removing elements', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 25,
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
      pointerId: 25,
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

    expect(controller.getViewportState().selectedElementId).toBe(controller.getSnapshot().elements[0]?.id);

    expect(controller.clearSelection()).toBe(true);
    expect(controller.getViewportState().selectedElementId).toBeNull();
    expect(controller.getSnapshot().elements).toHaveLength(1);
    expect(controller.clearSelection()).toBe(false);
  });

  it('clears the current selection when escape is pressed', () => {
    const controller = new EditorController();

    setViewport(controller);
    controller.setTool('rectangle');

    controller.handlePointerDown({
      pointerId: 26,
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
      pointerId: 26,
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

    expect(controller.getViewportState().selectedElementId).toBe(controller.getSnapshot().elements[0]?.id);
    expect(controller.handleKeyDown('Escape')).toBe(true);
    expect(controller.getViewportState().selectedElementId).toBeNull();
    expect(controller.getSnapshot().elements).toHaveLength(1);
    expect(controller.handleKeyDown('Escape')).toBe(false);
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
