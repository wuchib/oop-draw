<script setup lang="ts">
import type { ToolId } from '@oop-draw/shared';
import { Button, Panel } from '@oop-draw/ui';

defineProps<{
  currentTool: ToolId;
}>();

defineEmits<{
  selectTool: [tool: ToolId];
}>();

const tools: ToolId[] = ['select', 'rectangle', 'text', 'hand'];
</script>

<template>
  <Panel class="toolbar">
    <Button
      v-for="tool in tools"
      :key="tool"
      @click="$emit('selectTool', tool)"
    >
      {{ tool }}<span v-if="tool === currentTool"> *</span>
    </Button>
  </Panel>
</template>

<style scoped>
.toolbar {
  display: grid;
  gap: 0.5rem;
  align-content: start;
}
</style>
