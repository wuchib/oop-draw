import { EditorController, createDocument, exportDocument } from '@oop-draw/editor-core';
import type { PlatformServices, ToolId } from '@oop-draw/shared';
import { computed, ref } from 'vue';

export function useEditorApp(platform: PlatformServices) {
  const controller = new EditorController(createDocument());
  const document = ref(controller.getSnapshot());
  const currentTool = ref<ToolId>(controller.getTool());

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
    document.value = controller.getSnapshot();
  }

  function setTool(tool: ToolId): void {
    controller.setTool(tool);
    currentTool.value = tool;
  }

  const jsonPreview = computed(() => exportDocument(document.value));

  return {
    document,
    currentTool,
    jsonPreview,
    save,
    open,
    setTool,
    platform,
  };
}
