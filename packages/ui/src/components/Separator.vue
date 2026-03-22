<script setup lang="ts">
import { Separator } from 'reka-ui';

withDefaults(
  defineProps<{
    decorative?: boolean;
    orientation?: 'horizontal' | 'vertical';
  }>(),
  {
    decorative: true,
    orientation: 'horizontal',
  },
);
</script>

<template>
  <Separator
    :class="orientation === 'horizontal' ? 'h-px w-full bg-border' : 'h-full w-px bg-border'"
    :decorative="decorative"
    :orientation="orientation"
  />
</template>
