<script setup lang="ts">
defineProps<{
  platform: string;
  tool: string;
}>();
</script>

<template>
  <footer class="status-bar">
    <span>Shared renderer: active</span>
    <span>Platform: {{ platform }}</span>
    <span>Tool: {{ tool }}</span>
  </footer>
</template>

<style scoped>
.status-bar {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--od-color-border);
  background: var(--od-color-panel);
}
</style>
