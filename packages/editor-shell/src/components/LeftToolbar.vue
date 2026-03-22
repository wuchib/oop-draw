<script setup lang="ts">
import type { ToolId } from '@oop-draw/shared';
import { ArrowRight, Circle, Hand, MousePointer2, Square, Type } from 'lucide-vue-next';
import type { Component } from 'vue';
import { Button, Panel, Separator, Tooltip } from '@oop-draw/ui';

defineProps<{
  currentTool: ToolId;
}>();

defineEmits<{
  selectTool: [tool: ToolId];
}>();

const navigationTools: Array<{ id: ToolId; icon: Component; label: string; shortcut: string }> = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
];

const drawingTools: Array<{ id: ToolId; icon: Component; label: string; shortcut: string }> = [
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse', shortcut: 'O' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
];
</script>

<template>
  <nav aria-label="Editor tools">
    <Panel class="flex flex-row items-center gap-2 rounded-2xl px-2 py-2 shadow-lg md:flex-col">
      <div class="grid auto-cols-fr grid-flow-col gap-2 md:grid-flow-row">
        <Tooltip
          v-for="tool in navigationTools"
          :key="tool.id"
          :content="`${tool.label} · ${tool.shortcut}`"
          side="right"
        >
          <Button
            :aria-label="tool.label"
            :class="
              tool.id === currentTool
                ? 'h-11 w-11 rounded-xl border border-accent/35 bg-accent/10 px-0 text-accent shadow-md transition-all duration-150 hover:border-accent/50 hover:bg-accent/14 hover:shadow-lg'
                : 'h-11 w-11 rounded-xl border border-transparent bg-transparent px-0 text-text-muted transition-all duration-150 hover:-translate-y-px hover:border-border/80 hover:bg-panel/96 hover:text-text hover:shadow-md'
            "
            variant="ghost"
            @click="$emit('selectTool', tool.id)"
          >
            <component :is="tool.icon" class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">{{ tool.label }}</span>
          </Button>
        </Tooltip>
      </div>
      <Separator orientation="horizontal" class="h-px w-8 md:hidden" />
      <Separator orientation="vertical" class="hidden h-8 md:block" />
      <div class="grid auto-cols-fr grid-flow-col gap-2 md:grid-flow-row">
        <Tooltip
          v-for="tool in drawingTools"
          :key="tool.id"
          :content="`${tool.label} · ${tool.shortcut}`"
          side="right"
        >
          <Button
            :aria-label="tool.label"
            :class="
              tool.id === currentTool
                ? 'h-11 w-11 rounded-xl border border-accent/35 bg-accent/10 px-0 text-accent shadow-md transition-all duration-150 hover:border-accent/50 hover:bg-accent/14 hover:shadow-lg'
                : 'h-11 w-11 rounded-xl border border-transparent bg-transparent px-0 text-text-muted transition-all duration-150 hover:-translate-y-px hover:border-border/80 hover:bg-panel/96 hover:text-text hover:shadow-md'
            "
            variant="ghost"
            @click="$emit('selectTool', tool.id)"
          >
            <component :is="tool.icon" class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">{{ tool.label }}</span>
          </Button>
        </Tooltip>
      </div>
    </Panel>
  </nav>
</template>
