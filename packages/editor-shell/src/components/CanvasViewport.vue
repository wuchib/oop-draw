<script setup lang="ts">
import { CanvasRenderer, type EditorController } from '@oop-draw/editor-core';
import type { CanvasDocument, PointerInput, ViewportState, WheelInput } from '@oop-draw/shared';
import { Panel } from '@oop-draw/ui';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  controller: EditorController;
  document: CanvasDocument;
  tool: string;
  viewportState: ViewportState;
}>();

const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const spacePressed = ref(false);

let renderer: CanvasRenderer | null = null;
let resizeObserver: ResizeObserver | null = null;
let activePointerId: number | null = null;

function renderDocument(): void {
  renderer?.render(props.document);
}

function syncViewportSize(): void {
  const container = containerRef.value;

  if (!container || !renderer) {
    return;
  }

  const { width, height } = container.getBoundingClientRect();
  props.controller.setViewportSize(width, height);
  renderer.resize(width, height);
  renderDocument();
}

function getLocalPoint(clientX: number, clientY: number): { x: number; y: number } {
  const rect = containerRef.value?.getBoundingClientRect();

  if (!rect) {
    return { x: clientX, y: clientY };
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function toPointerInput(event: PointerEvent): PointerInput {
  const point = getLocalPoint(event.clientX, event.clientY);

  return {
    pointerId: event.pointerId,
    button: event.button,
    clientX: point.x,
    clientY: point.y,
    buttons: event.buttons,
    spaceKey: spacePressed.value,
    altKey: event.altKey,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey || event.metaKey,
  };
}

function toWheelInput(event: WheelEvent): WheelInput {
  const point = getLocalPoint(event.clientX, event.clientY);

  return {
    clientX: point.x,
    clientY: point.y,
    deltaY: event.deltaY,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
  };
}

function handlePointerDown(event: PointerEvent): void {
  containerRef.value?.focus();

  if (!props.controller.handlePointerDown(toPointerInput(event))) {
    return;
  }

  activePointerId = event.pointerId;
  containerRef.value?.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function handlePointerMove(event: PointerEvent): void {
  if (!props.controller.handlePointerMove(toPointerInput(event))) {
    return;
  }

  event.preventDefault();
}

function handlePointerUp(event: PointerEvent): void {
  if (!props.controller.handlePointerUp()) {
    return;
  }

  if (activePointerId !== null && containerRef.value?.hasPointerCapture(activePointerId)) {
    containerRef.value.releasePointerCapture(activePointerId);
  }

  activePointerId = null;
  event.preventDefault();
}

function handleWheel(event: WheelEvent): void {
  props.controller.handleWheel(toWheelInput(event));
  event.preventDefault();
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.code === 'Space') {
    spacePressed.value = true;
  }

  const consumed = props.controller.handleKeyDown(event.code);

  if (consumed) {
    event.preventDefault();
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  if (event.code === 'Space') {
    spacePressed.value = false;
  }

  const consumed = props.controller.handleKeyUp(event.code);

  if (consumed) {
    event.preventDefault();
  }
}

watch(
  () => props.document,
  () => {
    renderDocument();
  },
  { deep: true },
);

onMounted(() => {
  const canvas = canvasRef.value;
  const container = containerRef.value;

  if (!canvas || !container) {
    return;
  }

  renderer = new CanvasRenderer(canvas, props.controller.getCamera());
  syncViewportSize();

  resizeObserver = new ResizeObserver(() => {
    syncViewportSize();
  });
  resizeObserver.observe(container);

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  renderer?.dispose();
  renderer = null;
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});
</script>

<template>
  <section class="h-full">
    <Panel class="relative h-full overflow-hidden rounded-none border-0 px-0 py-0 shadow-none">
      <div class="absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <div class="rounded-full border border-border bg-panel/90 px-3 py-1 text-xs font-medium text-text-muted shadow-sm backdrop-blur-sm">
            Tool · {{ props.tool }}
          </div>
          <div class="rounded-full border border-border bg-panel/90 px-3 py-1 text-xs font-medium text-text-muted shadow-sm backdrop-blur-sm">
            Grid · {{ props.document.appState.gridEnabled ? 'On' : 'Off' }}
          </div>
          <div class="rounded-full border border-border bg-panel/90 px-3 py-1 text-xs font-medium text-text-muted shadow-sm backdrop-blur-sm">
            Zoom · {{ props.viewportState.zoomPercent }}%
          </div>
          <div
            v-if="props.viewportState.isPanning"
            class="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent shadow-sm backdrop-blur-sm"
          >
            Panning · {{ props.viewportState.panSource }}
          </div>
        </div>
      </div>
      <div
        ref="containerRef"
        aria-label="Canvas stage"
        class="relative h-full min-h-[32rem] overflow-hidden rounded-[inherit] bg-[radial-gradient(circle_at_top_left,_rgba(29,78,216,0.12),_transparent_28%),linear-gradient(180deg,_color-mix(in_srgb,var(--od-color-surface)_82%,white)_0%,var(--od-color-surface-muted)_100%)] outline-none"
        tabindex="0"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
        @wheel="handleWheel"
      >
        <canvas ref="canvasRef" class="block h-full w-full" />
      </div>
    </Panel>
  </section>
</template>
