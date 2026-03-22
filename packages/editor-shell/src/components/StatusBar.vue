<script setup lang="ts">
import { APP_SHORTCUTS } from '@oop-draw/shared';
import { CircleDot, Gauge, Keyboard, Layers2 } from 'lucide-vue-next';

defineProps<{
  assetCount: number;
  elementCount: number;
  platform: string;
  tool: string;
  updatedLabel: string;
  zoomPercent: number;
}>();
</script>

<template>
  <div class="rounded-2xl border border-border/80 bg-panel/88 px-3 py-2 backdrop-blur-md md:px-4">
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted md:text-sm">
      <div class="flex flex-wrap items-center gap-3" role="status" aria-live="polite">
        <span class="inline-flex items-center gap-2">
          <CircleDot class="h-4 w-4 text-accent" aria-hidden="true" />
          Shared renderer on {{ platform }}
        </span>
        <span class="hidden items-center gap-2 md:inline-flex">
          <Layers2 class="h-4 w-4" aria-hidden="true" />
          {{ elementCount }} elements · {{ assetCount }} assets
        </span>
        <span class="hidden md:inline">Last update {{ updatedLabel }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span class="inline-flex items-center gap-2">
          <Gauge class="h-4 w-4" aria-hidden="true" />
          {{ zoomPercent }}% zoom
        </span>
        <span class="hidden items-center gap-2 md:inline-flex">
          <Keyboard class="h-4 w-4" aria-hidden="true" />
          {{ APP_SHORTCUTS.open }} · {{ APP_SHORTCUTS.save }}
        </span>
        <span>Tool: {{ tool }}</span>
      </div>
    </div>
  </div>
</template>
