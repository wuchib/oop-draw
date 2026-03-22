<script setup lang="ts">
import { computed, ref } from 'vue';
import { FileJson2, Layers3, Palette, Settings2 } from 'lucide-vue-next';
import type { CanvasDocument } from '@oop-draw/shared';
import { Button, Panel, Separator, Tabs, type TabsItemModel } from '@oop-draw/ui';

const props = defineProps<{
  document: CanvasDocument;
  tool: string;
}>();

const activeTab = ref('selection');

const inspectorTabs: TabsItemModel[] = [
  { label: 'Selection', value: 'selection' },
  { label: 'Document', value: 'document' },
  { label: 'Export', value: 'export' },
];

const updatedLabel = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(props.document.metadata.updatedAt)),
);
</script>

<template>
  <Panel class="max-h-[calc(100vh-9rem)] overflow-hidden px-4 py-4 shadow-lg backdrop-blur-md">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
          Inspector
        </p>
        <h2 class="mt-1 text-lg font-semibold tracking-tight text-text">
          Canvas controls
        </h2>
      </div>
      <div class="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-text-muted">
        {{ props.tool }}
      </div>
    </div>
    <Tabs v-model="activeTab" :items="inspectorTabs">
      <template #selection>
        <section class="grid gap-4">
          <div class="rounded-lg border border-border bg-surface p-4">
            <div class="flex items-center gap-2 text-sm font-medium text-text">
              <Layers3 class="h-4 w-4 text-accent" aria-hidden="true" />
              Active selection
            </div>
            <p class="mt-2 text-sm text-text-muted">
              The current MVP keeps selection editing lightweight. Tool-specific controls will grow here as the real canvas runtime lands.
            </p>
          </div>
          <div class="grid gap-3 rounded-lg border border-border bg-surface p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Current tool</span>
              <span class="font-medium text-text">{{ props.tool }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Grid</span>
              <span class="font-medium text-text">{{ props.document.appState.gridEnabled ? 'On' : 'Off' }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Theme</span>
              <span class="font-medium text-text">{{ props.document.appState.theme }}</span>
            </div>
          </div>
        </section>
      </template>
      <template #document>
        <section class="grid gap-4">
          <div class="rounded-lg border border-border bg-surface p-4">
            <div class="flex items-center gap-2 text-sm font-medium text-text">
              <FileJson2 class="h-4 w-4 text-accent" aria-hidden="true" />
              {{ props.document.metadata.title }}
            </div>
            <p class="mt-2 text-sm text-text-muted">
              Updated {{ updatedLabel }} · Version {{ props.document.version }}
            </p>
          </div>
          <div class="grid gap-3 rounded-lg border border-border bg-surface p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Elements</span>
              <span class="font-medium text-text">{{ props.document.elements.length }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Assets</span>
              <span class="font-medium text-text">{{ props.document.assets.length }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Zoom</span>
              <span class="font-medium text-text">{{ Math.round(props.document.camera.zoom * 100) }}%</span>
            </div>
          </div>
        </section>
      </template>
      <template #export>
        <section class="grid gap-4">
          <div class="rounded-lg border border-border bg-surface p-4">
            <div class="flex items-center gap-2 text-sm font-medium text-text">
              <Palette class="h-4 w-4 text-accent" aria-hidden="true" />
              Export-ready panel
            </div>
            <p class="mt-2 text-sm text-text-muted">
              The PRD calls for PNG, SVG, and JSON. This surface keeps those choices visible before the export flow is wired.
            </p>
          </div>
          <div class="grid gap-2">
            <Button variant="secondary">
              Export PNG
            </Button>
            <Button variant="secondary">
              Export SVG
            </Button>
            <Button variant="secondary">
              Export JSON
            </Button>
          </div>
          <Separator />
          <div class="rounded-lg border border-dashed border-border bg-surface-muted p-4 text-sm text-text-muted">
            <div class="flex items-center gap-2 font-medium text-text">
              <Settings2 class="h-4 w-4 text-accent" aria-hidden="true" />
              Next wave
            </div>
            <p class="mt-2">
              Read-only sharing and collaborative controls should extend this inspector, not fork the page layout.
            </p>
          </div>
        </section>
      </template>
    </Tabs>
  </Panel>
</template>
