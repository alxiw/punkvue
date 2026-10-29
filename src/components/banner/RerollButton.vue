<script setup lang="ts">
import { RefreshCw } from "@lucide/vue"

defineProps<{
  /** In-flight request for new beer: button is disabled and shows loading state */
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'reroll'): void
}>()

/**
 * The button is nested inside a clickable hero section:
 * stop propagation to prevent triggering the parent card click
 * when rerolling.
 */
function onClick(event: MouseEvent) {
  event.stopPropagation()
  emit('reroll')
}
</script>

<template>
  <button
    type="button"
    class="reroll-button"
    :disabled="loading"
    @click="onClick"
  >
    <RefreshCw :size="20" :stroke-width="1.7" aria-hidden="true" />
    {{ loading ? 'Loading…' : 'Roll again' }}
  </button>
</template>

<style scoped>
.reroll-button {
  flex: 0 0 auto;
  /* Label must stay on a single line: "Roll again" is never split */
  white-space: nowrap;
  padding: 14px 19px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid var(--foreground);
  background: transparent;
  color: inherit;
  font-size: 13px;
  font-weight: 600;
  /* Prevents button from inheriting the hero's pointer cursor */
  cursor: pointer;
  transition: background 160ms, color 160ms;
}

.reroll-button:hover:not(:disabled) {
  background: var(--foreground);
  color: var(--background);
}

.reroll-button:hover:not(:disabled) svg {
  transform: rotate(45deg);
}

.reroll-button:disabled {
  cursor: default;
  opacity: 0.55;
}

.reroll-button svg {
  /* Icon keeps its 20px size even if the label gets long */
  flex: 0 0 auto;
  transition: transform 220ms ease;
}
</style>
