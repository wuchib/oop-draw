<script setup lang="ts">
import type { ToolId } from '@oop-draw/shared';
import type { PlatformServices } from '@oop-draw/shared';
import { useEditorApp } from './composables/useEditorApp';
import { useShortcuts } from './composables/useShortcuts';
import CanvasViewport from './components/CanvasViewport.vue';
import LeftToolbar from './components/LeftToolbar.vue';
import RightInspector from './components/RightInspector.vue';
import StatusBar from './components/StatusBar.vue';
import TopBar from './components/TopBar.vue';

const props = defineProps<{
  platform: PlatformServices;
}>();

const editor = useEditorApp(props.platform);

function handleToolChange(tool: ToolId): void {
  editor.setTool(tool);
}

useShortcuts(() => {
  void editor.save();
}, () => {
  void editor.open();
});
</script>

<template>
  <div class="layout">
    <TopBar :platform="editor.platform.kind" @save="editor.save" @open="editor.open" />
    <div class="workspace">
      <LeftToolbar :current-tool="editor.currentTool.value" @select-tool="handleToolChange" />
      <CanvasViewport :document-json="editor.jsonPreview.value" />
      <RightInspector :title="editor.document.value.metadata.title" :tool="editor.currentTool.value" />
    </div>
    <StatusBar :platform="editor.platform.kind" :tool="editor.currentTool.value" />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.workspace {
  display: grid;
  grid-template-columns: 96px 1fr 280px;
  gap: 1rem;
  padding: 1rem;
}
</style>
