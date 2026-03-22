<script setup lang="ts">
import { FileJson2 } from 'lucide-vue-next';
import { Panel, ScrollArea } from '@oop-draw/ui';

defineProps<{
  documentJson: string;
  title: string;
}>();
</script>

<template>
  <Panel class="overflow-hidden px-0 py-0 shadow-lg backdrop-blur-md">
    <div class="flex items-center justify-between border-b border-border bg-panel/92 px-4 py-3">
      <div class="flex items-center gap-2">
        <FileJson2 class="h-4 w-4 text-accent" aria-hidden="true" />
        <div>
          <h2 class="text-sm font-semibold text-text">
            Document preview
          </h2>
          <p class="text-xs text-text-muted">
            {{ title }}
          </p>
        </div>
      </div>
      <span class="rounded-full border border-border bg-surface px-2 py-1 text-[11px] font-medium text-text-muted">
        JSON
      </span>
    </div>
    <ScrollArea class="max-h-[40vh]">
      <pre class="m-0 px-4 py-4 text-xs leading-6 text-text-muted whitespace-pre-wrap">{{ documentJson }}</pre>
    </ScrollArea>
  </Panel>
</template>
