<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui';

export interface TabsItemModel {
  disabled?: boolean;
  label: string;
  value: string;
}

defineProps<{
  items: TabsItemModel[];
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <TabsRoot
    class="grid gap-4"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <TabsList class="inline-flex w-fit items-center gap-1 rounded-md border border-border bg-surface-muted p-1">
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :class="[
          'rounded-sm px-3 py-1.5 text-sm font-medium text-text-muted outline-none transition-colors data-[state=active]:bg-panel data-[state=active]:text-text data-[state=active]:shadow-sm',
          item.disabled && 'pointer-events-none opacity-50',
        ]"
        :disabled="item.disabled"
        :value="item.value"
      >
        {{ item.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="item in items" :key="item.value" :value="item.value">
      <slot :name="item.value" />
    </TabsContent>
  </TabsRoot>
</template>
