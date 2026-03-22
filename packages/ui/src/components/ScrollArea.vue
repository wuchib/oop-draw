<script setup lang="ts">
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'reka-ui';
</script>

<template>
  <ScrollAreaRoot class="relative overflow-hidden rounded-lg border border-border bg-surface">
    <ScrollAreaViewport class="size-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      class="flex touch-none select-none p-0.5 transition-colors duration-150"
      orientation="horizontal"
    >
      <ScrollAreaThumb class="relative flex-1 rounded-full bg-border-strong/70" />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar
      class="flex touch-none select-none p-0.5 transition-colors duration-150"
      orientation="vertical"
    >
      <ScrollAreaThumb class="relative flex-1 rounded-full bg-border-strong/70" />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner class="bg-surface-muted" />
  </ScrollAreaRoot>
</template>
