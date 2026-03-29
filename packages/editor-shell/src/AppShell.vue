<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ToolId } from '@oop-draw/shared';
import type { PlatformServices } from '@oop-draw/shared';
import { Download, FolderOpen, Save, Settings2, Share2 } from 'lucide-vue-next';
import { Dialog, IconButton, Panel, Tooltip } from '@oop-draw/ui';
import { useEditorApp } from './composables/useEditorApp';
import { useShortcuts } from './composables/useShortcuts';
import CanvasViewport from './components/CanvasViewport.vue';
import CanvasSettingsDrawer from './components/CanvasSettingsDrawer.vue';
import LeftToolbar from './components/LeftToolbar.vue';
import StatusBar from './components/StatusBar.vue';

const props = defineProps<{
  platform: PlatformServices;
}>();

const editor = useEditorApp(props.platform);

const updatedLabel = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(editor.document.value.metadata.updatedAt)),
);

const documentStats = computed(() => ({
  assets: editor.document.value.assets.length,
  elements: editor.document.value.elements.length,
  zoom: editor.viewportState.value.zoomPercent,
}));

const showFooter = ref(true);
const showSettings = ref(false);

function handleToolChange(tool: ToolId): void {
  if (editor.viewportState.value.selectedElementId) {
    editor.controller.clearSelection();
  }

  editor.setTool(tool);
}

async function handleShare(): Promise<void> {
  await props.platform.notify('Share flow will be connected to the dedicated export/share workflow.');
}

async function handleExport(): Promise<void> {
  await props.platform.notify('Export flow placeholder: PNG / SVG / JSON options will be wired here.');
}

useShortcuts({
  onSave: () => {
    void editor.save();
  },
  onOpen: () => {
    void editor.open();
  },
  onZoomIn: () => {
    editor.controller.zoomIn();
  },
  onZoomOut: () => {
    editor.controller.zoomOut();
  },
  onResetZoom: () => {
    editor.controller.resetZoom();
  },
  onSelectTool: (tool) => {
    editor.setTool(tool);
  },
  onDeleteSelection: () => {
    editor.controller.deleteSelection();
  },
});
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(27,116,240,0.12),_transparent_34%),linear-gradient(180deg,_var(--od-color-bg)_0%,_color-mix(in_srgb,var(--od-color-bg)_88%,white)_100%)]">
    <main class="relative h-screen overflow-hidden">
      <div class="relative h-full min-h-screen">
        <CanvasViewport
          :controller="editor.controller"
          :document="editor.document.value"
          :tool="editor.currentTool.value"
          :viewport-state="editor.viewportState.value"
        />
        <div class="pointer-events-none absolute inset-0">
          <div class="pointer-events-auto absolute right-3 top-3 z-40 flex items-start gap-3 md:right-4 md:top-4">
            <Panel class="flex flex-row items-center gap-2 rounded-2xl px-2 py-2 shadow-lg">
              <Tooltip content="Import file" side="bottom">
                <IconButton
                  v-bind="{ ariaLabel: 'Import file' }"
                  class="border border-border/70 bg-panel/92 text-text-muted shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-border-strong hover:bg-surface hover:text-text hover:shadow-md"
                  variant="ghost"
                  @click="editor.open"
                >
                  <FolderOpen class="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Share" side="bottom">
                <IconButton
                  v-bind="{ ariaLabel: 'Share' }"
                  class="border border-border/70 bg-panel/92 text-text-muted shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-border-strong hover:bg-surface hover:text-text hover:shadow-md"
                  variant="ghost"
                  @click="handleShare"
                >
                  <Share2 class="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Export" side="bottom">
                <IconButton
                  v-bind="{ ariaLabel: 'Export' }"
                  class="border border-border/70 bg-panel/92 text-text-muted shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-border-strong hover:bg-surface hover:text-text hover:shadow-md"
                  variant="ghost"
                  @click="handleExport"
                >
                  <Download class="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Save" side="bottom">
                <IconButton
                  v-bind="{ ariaLabel: 'Save' }"
                  class="border border-accent/30 bg-accent/10 text-accent shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-accent/45 hover:bg-accent/14 hover:shadow-md"
                  variant="ghost"
                  @click="editor.save"
                >
                  <Save class="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Settings" side="bottom">
                <IconButton
                  v-bind="{ ariaLabel: 'Open settings' }"
                  :class="
                    showSettings
                      ? 'border border-accent/35 bg-accent/10 text-accent shadow-md transition-all duration-150 hover:border-accent/50 hover:bg-accent/14'
                      : 'border border-border/70 bg-panel/92 text-text-muted shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-border-strong hover:bg-surface hover:text-text hover:shadow-md'
                  "
                  variant="ghost"
                  @click="showSettings = true"
                >
                  <Settings2 class="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </Tooltip>
              <Dialog
                :open="showSettings"
                title="Global settings"
                description="Configure shared canvas preferences."
                @update:open="showSettings = $event"
              >
                <CanvasSettingsDrawer
                  :show-footer="showFooter"
                  :show-grid="editor.document.value.appState.gridEnabled"
                  @update:show-footer="showFooter = $event"
                  @update:show-grid="editor.controller.setGridEnabled($event)"
                />
              </Dialog>
            </Panel>
          </div>
          <div class="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:left-5 md:top-1/2 md:-translate-x-0 md:-translate-y-1/2">
            <LeftToolbar :current-tool="editor.currentTool.value" @select-tool="handleToolChange" />
          </div>
          <footer
            v-if="showFooter"
            class="pointer-events-auto absolute inset-x-3 bottom-3 z-20 md:inset-x-4 md:bottom-4"
          >
            <StatusBar
              :asset-count="documentStats.assets"
              :element-count="documentStats.elements"
              :platform="editor.platform.kind"
              :tool="editor.currentTool.value"
              :updated-label="updatedLabel"
              :zoom-percent="documentStats.zoom"
            />
          </footer>
        </div>
      </div>
    </main>
  </div>
</template>
