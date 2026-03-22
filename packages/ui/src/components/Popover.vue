<script setup lang="ts">
import {
  PopoverArrow,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../utils/cn';

const props = withDefaults(
  defineProps<{
    align?: 'start' | 'center' | 'end';
    class?: string;
    open?: boolean;
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
  }>(),
  {
    align: 'center',
    class: undefined,
    open: undefined,
    side: 'bottom',
    sideOffset: 10,
  },
);

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const contentClass = computed(() =>
  cn(
    'z-50 w-72 rounded-lg border border-border bg-panel p-4 text-text shadow-md outline-none',
    props.class,
  ),
);
</script>

<template>
  <PopoverRoot :open="props.open" @update:open="emit('update:open', $event)">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :align="props.align"
        :class="contentClass"
        :side="props.side"
        :side-offset="props.sideOffset"
      >
        <slot />
        <PopoverArrow class="fill-panel" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
