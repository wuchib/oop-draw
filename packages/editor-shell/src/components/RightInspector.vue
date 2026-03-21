<script setup lang="ts">
import { Panel } from '@oop-draw/ui';

defineProps<{
  title: string;
  tool: string;
}>();
</script>

<template>
  <Panel class="inspector">
    <h3>Inspector</h3>
    <p>Document: {{ title }}</p>
    <p>Active tool: {{ tool }}</p>
    <p>Shared shell for Web and Electron.</p>
  </Panel>
</template>

<style scoped>
.inspector {
  display: grid;
  gap: 0.5rem;
  align-content: start;
}

h3,
p {
  margin: 0;
}
</style>
