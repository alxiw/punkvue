<script setup lang="ts">
defineProps<{
  label: string
  minValue: string
  maxValue: string
  step?: string
}>()

const emit = defineEmits<{
  (e: 'update:min', value: string): void
  (e: 'update:max', value: string): void
}>()

/** Input field value from DOM event */
function inputValue(event: Event): string {
  return (event.target as HTMLInputElement).value
}
</script>

<template>
  <fieldset class="filter-range">
    <legend>{{ label }}</legend>
    <div class="range-inputs">
      <input
        type="number"
        inputMode="decimal"
        :step="step"
        min="0"
        :value="minValue"
        placeholder="more than"
        :aria-label="label + ': more than'"
        @input="emit('update:min', inputValue($event))"
      />
      <span aria-hidden="true">—</span>
      <input
        type="number"
        inputMode="decimal"
        :step="step"
        min="0"
        :value="maxValue"
        placeholder="less than"
        :aria-label="label + ': less than'"
        @input="emit('update:max', inputValue($event))"
      />
    </div>
  </fieldset>
</template>

<style scoped src="./filter-range.css"></style>
