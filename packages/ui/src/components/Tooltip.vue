<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui';

withDefaults(
  defineProps<{
    content: string;
    delayDuration?: number;
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
  }>(),
  {
    delayDuration: 150,
    side: 'top',
    sideOffset: 8,
  },
);
</script>

<template>
  <TooltipProvider :delay-duration="delayDuration">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          class="z-50 rounded-md bg-text px-2 py-1 text-xs text-white shadow-sm"
          :side="side"
          :side-offset="sideOffset"
        >
          {{ content }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
