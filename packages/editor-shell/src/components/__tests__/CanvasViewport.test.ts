// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { EditorController, createDocument } from '@oop-draw/editor-core';
import CanvasViewport from '../CanvasViewport.vue';

const rendererResize = vi.fn();
const rendererRender = vi.fn();
const rendererDispose = vi.fn();

vi.mock('@oop-draw/editor-core', async () => {
  const actual = await vi.importActual<typeof import('@oop-draw/editor-core')>('@oop-draw/editor-core');

  return {
    ...actual,
    CanvasRenderer: class {
      resize = rendererResize;
      render = rendererRender;
      dispose = rendererDispose;
    },
  };
});

describe('CanvasViewport', () => {
  it('syncs viewport size on mount', async () => {
    const controller = new EditorController(createDocument());
    const setViewportSizeSpy = vi.spyOn(controller, 'setViewportSize');

    const wrapper = mount(CanvasViewport, {
      props: {
        controller,
        document: controller.getSnapshot(),
        tool: controller.getTool(),
        viewportState: controller.getViewportState(),
      },
      global: {
        stubs: {
          Panel: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    const stage = wrapper.get('[aria-label="Canvas stage"]').element as HTMLDivElement;
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      width: 640,
      height: 480,
      left: 0,
      top: 0,
      right: 640,
      bottom: 480,
      x: 0,
      y: 0,
      toJSON: () => undefined,
    });

    await nextTick();

    expect(setViewportSizeSpy).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('forwards wheel events as normalized viewport inputs', async () => {
    const controller = new EditorController(createDocument());
    const handleWheelSpy = vi.spyOn(controller, 'handleWheel');

    const wrapper = mount(CanvasViewport, {
      props: {
        controller,
        document: controller.getSnapshot(),
        tool: controller.getTool(),
        viewportState: controller.getViewportState(),
      },
      global: {
        stubs: {
          Panel: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    const stage = wrapper.get('[aria-label="Canvas stage"]');
    vi.spyOn(stage.element, 'getBoundingClientRect').mockReturnValue({
      width: 640,
      height: 480,
      left: 10,
      top: 20,
      right: 650,
      bottom: 500,
      x: 10,
      y: 20,
      toJSON: () => undefined,
    });

    stage.element.dispatchEvent(
      new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        clientX: 110,
        clientY: 140,
        deltaY: -120,
      }),
    );
    await nextTick();

    expect(handleWheelSpy).toHaveBeenCalledWith({
      clientX: 100,
      clientY: 120,
      deltaX: 0,
      deltaY: -120,
      ctrlKey: false,
      metaKey: false,
    });

    wrapper.unmount();
  });

  it('prevents default only for ctrl or meta wheel zoom gestures', async () => {
    const controller = new EditorController(createDocument());

    const wrapper = mount(CanvasViewport, {
      props: {
        controller,
        document: controller.getSnapshot(),
        tool: controller.getTool(),
        viewportState: controller.getViewportState(),
      },
      global: {
        stubs: {
          Panel: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    const stage = wrapper.get('[aria-label="Canvas stage"]').element as HTMLDivElement;
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      width: 640,
      height: 480,
      left: 0,
      top: 0,
      right: 640,
      bottom: 480,
      x: 0,
      y: 0,
      toJSON: () => undefined,
    });

    const plainWheelEvent = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 40,
    });
    stage.dispatchEvent(plainWheelEvent);

    const zoomWheelEvent = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      deltaY: -40,
    });
    stage.dispatchEvent(zoomWheelEvent);

    expect(plainWheelEvent.defaultPrevented).toBe(false);
    expect(zoomWheelEvent.defaultPrevented).toBe(true);

    wrapper.unmount();
  });

  it('shows grab and grabbing cursors for panning states', async () => {
    const controller = new EditorController(createDocument());

    const wrapper = mount(CanvasViewport, {
      props: {
        controller,
        document: controller.getSnapshot(),
        tool: 'hand',
        viewportState: controller.getViewportState(),
      },
      global: {
        stubs: {
          Panel: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    expect(wrapper.get('[aria-label="Canvas stage"]').classes()).toContain('cursor-grab');

    await wrapper.setProps({
      viewportState: {
        ...controller.getViewportState(),
        isPanning: true,
        panSource: 'hand-tool',
      },
    });

    expect(wrapper.get('[aria-label="Canvas stage"]').classes()).toContain('cursor-grabbing');
    wrapper.unmount();
  });

  it('keeps pointer capture for a pan session until pointerup', async () => {
    const controller = new EditorController(createDocument());

    const wrapper = mount(CanvasViewport, {
      props: {
        controller,
        document: controller.getSnapshot(),
        tool: controller.getTool(),
        viewportState: controller.getViewportState(),
      },
      global: {
        stubs: {
          Panel: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    const stage = wrapper.get('[aria-label="Canvas stage"]').element as HTMLDivElement;
    let captured = false;
    const setPointerCapture = vi.fn(() => {
      captured = true;
    });
    const releasePointerCapture = vi.fn(() => {
      captured = false;
    });
    const hasPointerCapture = vi.fn(() => captured);

    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      width: 640,
      height: 480,
      left: 0,
      top: 0,
      right: 640,
      bottom: 480,
      x: 0,
      y: 0,
      toJSON: () => undefined,
    });

    Object.assign(stage, {
      setPointerCapture,
      releasePointerCapture,
      hasPointerCapture,
    });

    await wrapper.get('[aria-label="Canvas stage"]').trigger('pointerdown', {
      pointerId: 7,
      button: 1,
      buttons: 4,
      clientX: 50,
      clientY: 60,
    });
    await wrapper.get('[aria-label="Canvas stage"]').trigger('pointerup', {
      pointerId: 7,
      button: 1,
      buttons: 0,
      clientX: 50,
      clientY: 60,
    });

    expect(setPointerCapture).toHaveBeenCalledWith(7);
    expect(releasePointerCapture).toHaveBeenCalledWith(7);

    wrapper.unmount();
  });
});
