import { EditorController, createDocument, exportDocument } from '@oop-draw/editor-core';
import type { PlatformServices, ToolId, ViewportState } from '@oop-draw/shared';
import { computed, onUnmounted, ref } from 'vue';

export function useEditorApp(platform: PlatformServices) {
  const controller = new EditorController(createDocument());
  const document = ref(controller.getSnapshot());
  const currentTool = ref<ToolId>(controller.getTool());
  const viewportState = ref<ViewportState>(controller.getViewportState());

  const syncFromController = () => {
    document.value = controller.getSnapshot();
    currentTool.value = controller.getTool();
    viewportState.value = controller.getViewportState();
  };

  const unsubscribe = controller.subscribe(syncFromController);
  onUnmounted(unsubscribe);

  async function save(): Promise<void> {
    await platform.saveDocument(document.value);
    await platform.notify('Document saved.');
  }

  async function open(): Promise<void> {
    const nextDocument = await platform.openDocument();

    if (!nextDocument) {
      return;
    }

    controller.load(nextDocument);
  }

  function setTool(tool: ToolId): void {
    controller.setTool(tool);
  }

  const jsonPreview = computed(() => exportDocument(document.value));

  return {
    controller,
    document,
    currentTool,
    viewportState,
    jsonPreview,
    save,
    open,
    setTool,
    platform,
  };
}
