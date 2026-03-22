<script setup lang="ts">
import type { CanvasDocument } from '@oop-draw/shared';
import { Panel } from '@oop-draw/ui';

const props = defineProps<{
  document: CanvasDocument;
  tool: string;
}>();
</script>

<template>
  <section class="h-full">
    <Panel class="relative h-full overflow-hidden rounded-none border-0 px-0 py-0 shadow-none">
      <div class="absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <div class="rounded-full border border-border bg-panel/90 px-3 py-1 text-xs font-medium text-text-muted shadow-sm backdrop-blur-sm">
            Tool · {{ props.tool }}
          </div>
          <div class="rounded-full border border-border bg-panel/90 px-3 py-1 text-xs font-medium text-text-muted shadow-sm backdrop-blur-sm">
            Grid · {{ props.document.appState.gridEnabled ? 'On' : 'Off' }}
          </div>
        </div>
      </div>
      <div
        aria-label="Canvas stage preview"
        class="relative h-full min-h-[32rem] overflow-hidden rounded-[inherit] bg-[linear-gradient(0deg,transparent_23px,var(--od-color-border)_24px),linear-gradient(90deg,transparent_23px,var(--od-color-border)_24px),linear-gradient(180deg,color-mix(in_srgb,var(--od-color-surface)_68%,white)_0%,var(--od-color-surface-muted)_100%)] bg-[size:24px_24px,24px_24px,100%_100%]"
      />
    </Panel>
  </section>
</template>
