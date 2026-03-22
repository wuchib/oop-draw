<script setup lang="ts">
import { Settings2 } from 'lucide-vue-next';

defineProps<{
  showFooter: boolean;
}>();

defineEmits<{
  'update:showFooter': [value: boolean];
}>();
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-2 text-sm font-semibold text-text">
      <Settings2 class="h-4 w-4 text-accent" aria-hidden="true" />
      Canvas preferences
    </div>
    <label class="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3">
      <div>
        <p class="text-sm font-medium text-text">Show bottom status bar</p>
        <p class="mt-1 text-xs text-text-muted">
          Keep the floating status strip visible at the bottom of the canvas.
        </p>
      </div>
      <input
        :checked="showFooter"
        class="h-4 w-4 rounded border-border text-accent focus:ring-accent/45"
        type="checkbox"
        @change="$emit('update:showFooter', ($event.target as HTMLInputElement).checked)"
      >
    </label>
    <p class="text-xs text-text-muted">
      More global options will be added here as the canvas runtime grows.
    </p>
  </div>
</template>
