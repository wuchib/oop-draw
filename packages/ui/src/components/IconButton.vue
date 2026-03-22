<script setup lang="ts">
import Button from './Button.vue';
import { cn } from '../utils/cn';
import type { ButtonVariantProps } from '../utils/button';

const props = withDefaults(
  defineProps<{
    ariaLabel: string;
    class?: string;
    disabled?: boolean;
    size?: ButtonVariantProps['size'];
    tone?: ButtonVariantProps['tone'];
    variant?: ButtonVariantProps['variant'];
  }>(),
  {
    class: undefined,
    disabled: false,
    size: 'sm',
    tone: 'solid',
    variant: 'ghost',
  },
);
</script>

<template>
  <Button
    :aria-label="props.ariaLabel"
    :class="cn('aspect-square min-w-0 px-0', props.class)"
    :disabled="props.disabled"
    :size="props.size"
    :tone="props.tone"
    :variant="props.variant"
  >
    <slot />
  </Button>
</template>
