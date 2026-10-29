<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  /** Dot color marker next to the value (e.g. for EBC) */
  dotColor?: string | null
}>()
</script>

<template>
  <div class="beer-stat">
    <p class="beer-stat__value">
      <i
        v-if="dotColor"
        class="ebc-dot beer-stat__ebc-dot"
        :style="{ backgroundColor: dotColor }"
        aria-hidden="true"
      />
      <span>{{ value }}</span>
    </p>
    <p class="beer-stat__label">
      {{ label }}
    </p>
  </div>
</template>

<style scoped>
/* Metric card with value and label. min-height keeps all stat cards uniform, even with single-line labels. */
.beer-stat {
  min-height: 5rem;
  padding: 15px 10px 13px;
  border: 1px solid var(--border);
  background: var(--card);
  text-align: center;
}

.beer-stat__value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'DM Mono', monospace;
  font-size: 1.125rem;
  font-weight: 500;
}

/*
 * EBC color marker next to the value. The shared shape lives in .ebc-dot
 * (main.css), size only here; the color comes from the dotColor prop.
 */
.beer-stat__ebc-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
}

.beer-stat__label {
  color: var(--muted-foreground);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
