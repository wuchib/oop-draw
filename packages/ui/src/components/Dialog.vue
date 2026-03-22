<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui';
import { computed, useSlots } from 'vue';
import Button from './Button.vue';
import { cn } from '../utils/cn';

const props = withDefaults(
  defineProps<{
    class?: string;
    closeLabel?: string;
    description?: string;
    modal?: boolean;
    open?: boolean;
    title: string;
  }>(),
  {
    class: undefined,
    closeLabel: 'Close',
    description: undefined,
    modal: true,
    open: undefined,
  },
);

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const slots = useSlots();

const contentClass = computed(() =>
  cn(
    'fixed top-1/2 left-1/2 z-50 grid w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-panel p-5 text-text shadow-lg outline-none',
    props.class,
  ),
);
</script>

<template>
  <DialogRoot :modal="props.modal" :open="props.open" @update:open="emit('update:open', $event)">
    <DialogTrigger v-if="slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-overlay backdrop-blur-[2px]" />
      <DialogContent :class="contentClass">
        <div class="grid gap-1">
          <DialogTitle class="text-lg font-semibold">
            {{ props.title }}
          </DialogTitle>
          <DialogDescription v-if="props.description" class="text-sm text-text-muted">
            {{ props.description }}
          </DialogDescription>
        </div>
        <div class="grid gap-4">
          <slot />
        </div>
        <div class="flex items-center justify-end gap-3">
          <slot name="footer">
            <DialogClose as-child>
              <Button variant="secondary">
                {{ props.closeLabel }}
              </Button>
            </DialogClose>
          </slot>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
