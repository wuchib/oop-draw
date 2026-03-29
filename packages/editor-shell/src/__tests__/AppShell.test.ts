// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import AppShell from '../AppShell.vue';

const clearSelection = vi.fn();
const setTool = vi.fn();
const open = vi.fn();
const save = vi.fn();

vi.mock('../composables/useEditorApp', () => ({
  useEditorApp: () => ({
    controller: {
      clearSelection,
      setGridEnabled: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      resetZoom: vi.fn(),
      deleteSelection: vi.fn(),
    },
    document: ref({
      assets: [],
      elements: [],
      metadata: {
        updatedAt: '2026-03-29T00:00:00.000Z',
      },
      appState: {
        gridEnabled: false,
      },
    }),
    currentTool: ref('select'),
    viewportState: ref({
      isPanning: false,
      panSource: null,
      zoomPercent: 100,
      isDrawing: false,
      selectedElementId: 'shape-1',
      interaction: 'idle',
      cursor: 'default',
    }),
    jsonPreview: computed(() => '{}'),
    save,
    open,
    setTool,
    platform: {
      kind: 'web',
    },
  }),
}));

vi.mock('../composables/useShortcuts', () => ({
  useShortcuts: vi.fn(),
}));

describe('AppShell', () => {
  it('clears the current selection before switching tools from the toolbar', async () => {
    clearSelection.mockClear();
    setTool.mockClear();

    const wrapper = mount(AppShell, {
      props: {
        platform: {
          kind: 'web',
          notify: vi.fn(),
          openDocument: vi.fn(),
          saveDocument: vi.fn(),
          openExternal: vi.fn(),
        },
      },
      global: {
        stubs: {
          CanvasViewport: { template: '<div />' },
          CanvasSettingsDrawer: { template: '<div />' },
          StatusBar: { template: '<div />' },
          Dialog: { template: '<div><slot /></div>' },
          IconButton: { template: '<button><slot /></button>' },
          Panel: { template: '<div><slot /></div>' },
          Tooltip: { template: '<div><slot /></div>' },
          LeftToolbar: {
            template: '<button data-test="toolbar" @click="$emit(\'select-tool\', \'rectangle\')">tool</button>',
          },
        },
      },
    });

    await wrapper.get('[data-test="toolbar"]').trigger('click');

    expect(clearSelection).toHaveBeenCalledTimes(1);
    expect(setTool).toHaveBeenCalledWith('rectangle');
    expect(clearSelection.mock.invocationCallOrder[0]).toBeLessThan(setTool.mock.invocationCallOrder[0]);
  });
});
