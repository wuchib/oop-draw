<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'reka-ui';

export interface DropdownMenuItemModel {
  danger?: boolean;
  disabled?: boolean;
  id: string;
  label: string;
  separatorBefore?: boolean;
}

withDefaults(
  defineProps<{
    items: DropdownMenuItemModel[];
    sideOffset?: number;
  }>(),
  {
    sideOffset: 8,
  },
);

const emit = defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        class="z-50 min-w-44 rounded-lg border border-border bg-panel p-1.5 text-sm shadow-md outline-none"
        :side-offset="sideOffset"
      >
        <template v-for="item in items" :key="item.id">
          <DropdownMenuSeparator
            v-if="item.separatorBefore"
            class="mx-1 my-1 h-px bg-border"
          />
          <DropdownMenuItem
            :class="[
              'flex cursor-default select-none items-center rounded-md px-3 py-2 outline-none data-[highlighted]:bg-surface-muted',
              item.danger ? 'text-danger' : 'text-text',
            ]"
            :disabled="item.disabled"
            @select="emit('select', item.id)"
          >
            {{ item.label }}
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
