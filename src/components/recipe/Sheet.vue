<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from 'radix-vue'

const open = defineModel<boolean>('open', { required: true })

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="sheet__overlay" />
      <DialogContent
        class="sheet"
        @open-auto-focus="(event) => event.preventDefault()"
      >
        <DialogTitle class="sr-only">
          {{ title }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ description }}
        </DialogDescription>

        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/*
 * Sheet built on radix-vue Dialog: backdrop overlay and right slide-over drawer. Palette is declared in main.css.
 *
 * Uses CSS animations rather than transitions: radix-vue Presence
 * unmounts elements only after animationend, ensuring exit animations
 * complete smoothly without snapping.
 */

/*
 * :global() is required because radix-vue renders overlay and panel via internal wrapper components (Presence, *Impl),
 * preventing SFC scope-id from reaching the final DOM nodes. Class names are unique, avoiding collisions.
 */
:global(.sheet__overlay) {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgb(0 0 0 / 40%);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

:global(.sheet__overlay[data-state='open']) {
  animation: sheet-overlay-in 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

:global(.sheet__overlay[data-state='closed']) {
  animation: sheet-overlay-out 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

:global(.sheet) {
  position: fixed;
  inset-block: 0;
  inset-inline-end: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 720px;
  height: 100%;
  background: var(--background);
  overscroll-behavior: contain;
  padding-bottom: env(safe-area-inset-bottom, 1rem);
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 10%),
    0 4px 6px -4px rgb(0 0 0 / 10%);
}

:global(.sheet[data-state='open']) {
  animation: sheet-in 500ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

:global(.sheet[data-state='closed']) {
  animation: sheet-out 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes sheet-overlay-in {
  from {
    opacity: 0;
  }
}

@keyframes sheet-overlay-out {
  to {
    opacity: 0;
  }
}

@keyframes sheet-in {
  from {
    transform: translateX(100%);
  }
}

@keyframes sheet-out {
  to {
    transform: translateX(100%);
  }
}
</style>
