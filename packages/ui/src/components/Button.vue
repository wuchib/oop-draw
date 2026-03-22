<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    :class="buttonClass"
    :disabled="props.disabled"
    :type="props.type"
  >
    <slot />
  </Primitive>
</template>

<script setup lang="ts">
import { Primitive } from 'reka-ui';
import { computed } from 'vue';
import { buttonVariants, type ButtonVariantProps } from '../utils/button';
import { cn } from '../utils/cn';

const props = withDefaults(
  defineProps<{
    as?: string;
    asChild?: boolean;
    class?: string;
    disabled?: boolean;
    size?: ButtonVariantProps['size'];
    tone?: ButtonVariantProps['tone'];
    type?: 'button' | 'submit' | 'reset';
    variant?: ButtonVariantProps['variant'];
  }>(),
  {
    as: 'button',
    asChild: false,
    class: '',
    disabled: false,
    size: 'md',
    tone: 'solid',
    type: 'button',
    variant: 'secondary',
  },
);

const buttonClass = computed(() =>
  cn(
    buttonVariants({
      size: props.size,
      tone: props.tone,
      variant: props.variant,
    }),
    props.class,
  ),
);
</script>
