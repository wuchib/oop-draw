<template>
  <section :class="panelClass">
    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../utils/cn';

const props = withDefaults(
  defineProps<{
    class?: string;
    inset?: boolean;
  }>(),
  {
    class: undefined,
    inset: false,
  },
);

const panelClass = computed(() =>
  cn(
    'rounded-lg border border-border bg-panel px-4 py-4 text-text shadow-sm',
    props.inset && 'bg-surface',
    props.class,
  ),
);
</script>
