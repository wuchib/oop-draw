<script setup lang="ts">
import { Panel } from '@oop-draw/ui';

defineProps<{
  documentJson: string;
}>();
</script>

<template>
  <Panel class="canvas-viewport">
    <div class="canvas-stage">
      <strong>Canvas runtime placeholder</strong>
      <p>The shared editor shell is mounted. Canvas rendering will be implemented in `editor-core`.</p>
    </div>
    <pre>{{ documentJson }}</pre>
  </Panel>
</template>

<style scoped>
.canvas-viewport {
  display: grid;
  gap: 1rem;
  min-height: 60vh;
}

.canvas-stage {
  min-height: 320px;
  border: 1px dashed var(--od-color-border);
  border-radius: 12px;
  padding: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #eef4ff 100%);
}

pre {
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
}
</style>
