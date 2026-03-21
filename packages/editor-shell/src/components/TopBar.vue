<script setup lang="ts">
import { Button, Panel } from '@oop-draw/ui';

defineProps<{
  platform: string;
}>();

defineEmits<{
  save: [];
  open: [];
}>();
</script>

<template>
  <header class="top-bar">
    <strong>OOP Draw</strong>
    <Panel class="actions">
      <span>Platform: {{ platform }}</span>
      <Button @click="$emit('open')">
        Open
      </Button>
      <Button @click="$emit('save')">
        Save
      </Button>
    </Panel>
  </header>
</template>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--od-color-border);
  background: var(--od-color-panel);
}

.actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
</style>
