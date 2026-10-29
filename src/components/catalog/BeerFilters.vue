<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Search, SlidersHorizontal, X } from "@lucide/vue"
import type { BeerFilters, BeerRanges } from "@/types/beer"
import RangeRow from "@/components/catalog/RangeRow.vue"

const props = defineProps<{
  filters: BeerFilters
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: BeerFilters): void
  (e: 'reset'): void
}>()

const showFilters = ref(false)

/** Focus targets for buttons that unmount themselves right after a click */
const searchInput = ref<HTMLInputElement | null>(null)
const filtersToggle = ref<HTMLButtonElement | null>(null)

const activeFilterCount = computed(() => {
  const { pairing, ranges } = props.filters
  let count = pairing.trim() ? 1 : 0
  count += Object.values(ranges).filter((value) => value.trim() !== "").length
  return count
})

/** Input field value from DOM event */
function inputValue(event: Event): string {
  return (event.target as HTMLInputElement).value
}

function setQuery(value: string) {
  emit('update:filters', { ...props.filters, query: value })
}

function setPairing(value: string) {
  emit('update:filters', { ...props.filters, pairing: value })
}

function setRange(key: keyof BeerRanges, value: string) {
  const ranges = { ...props.filters.ranges }
  ranges[key] = value
  emit('update:filters', { ...props.filters, ranges })
}

/** Clears the query and moves focus back to the field: the button itself unmounts */
async function handleClear() {
  setQuery('')
  await nextTick()
  searchInput.value?.focus()
}

/** Resets filters and moves focus to the toggle: the button itself unmounts */
async function handleReset() {
  emit('reset')
  await nextTick()
  filtersToggle.value?.focus()
}

/** Collapses the panel and returns focus to the toggle that owns it */
async function closeFilters() {
  if (!showFilters.value) return
  showFilters.value = false
  await nextTick()
  filtersToggle.value?.focus()
}

/**
 * Esc collapses the panel from anywhere inside it.
 * Date fields are skipped: there Esc belongs to the native picker popup.
 */
function handlePanelKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  const target = event.target
  if (target instanceof HTMLInputElement && target.type === 'date') return
  void closeFilters()
}
</script>

<template>
  <div class="controls">
    <!--
      Search landmark: a jump target for screen readers. The clear button sits
      next to the field, not inside the label — a label may only contain the
      control it names.
    -->
    <form class="search-control" role="search" @submit.prevent>
      <Search :size="22" :stroke-width="1.7" aria-hidden="true" />
      <label class="sr-only" for="catalog-search">Search beer by name</label>
      <input
        id="catalog-search"
        ref="searchInput"
        type="search"
        name="query"
        autocomplete="off"
        enterkeyhint="search"
        :value="filters.query"
        placeholder="Search beer by name…"
        @input="setQuery(inputValue($event))"
      />
      <button
        v-if="filters.query"
        type="button"
        aria-label="Clear search"
        @click="handleClear"
      >
        <X :size="18" :stroke-width="1.7" aria-hidden="true" />
      </button>
    </form>

    <button
      id="catalog-filters-toggle"
      ref="filtersToggle"
      type="button"
      class="filter-button"
      :class="{ 'is-active': showFilters }"
      aria-controls="catalog-filters"
      :aria-expanded="showFilters"
      @click="showFilters = !showFilters"
      @keydown.esc="closeFilters"
    >
      <SlidersHorizontal :size="20" :stroke-width="1.7" aria-hidden="true" />
      Filters
      <!-- Digits are decorative: the count is spelled out for screen readers -->
      <span v-if="activeFilterCount > 0" class="filter-badge" aria-hidden="true">{{ activeFilterCount }}</span>
      <span v-if="activeFilterCount > 0" class="sr-only">, {{ activeFilterCount }} active</span>
    </button>
  </div>

  <div
    v-if="showFilters"
    id="catalog-filters"
    class="filter-panel"
    role="group"
    aria-labelledby="catalog-filters-toggle"
    @keydown.esc="handlePanelKeydown"
  >
    <RangeRow
      label="Strength, ABV"
      :min-value="filters.ranges.abvMin"
      :max-value="filters.ranges.abvMax"
      step="0.1"
      @update:min="setRange('abvMin', $event)"
      @update:max="setRange('abvMax', $event)"
    />
    <RangeRow
      label="Bitterness, IBU"
      :min-value="filters.ranges.ibuMin"
      :max-value="filters.ranges.ibuMax"
      @update:min="setRange('ibuMin', $event)"
      @update:max="setRange('ibuMax', $event)"
    />
    <RangeRow
      label="Color, EBC"
      :min-value="filters.ranges.ebcMin"
      :max-value="filters.ranges.ebcMax"
      @update:min="setRange('ebcMin', $event)"
      @update:max="setRange('ebcMax', $event)"
    />

    <fieldset class="filter-range">
      <legend>First brewed</legend>
      <div class="range-inputs">
        <input
          type="date"
          :value="filters.ranges.dateFrom"
          aria-label="From"
          @input="setRange('dateFrom', inputValue($event))"
        />
        <span aria-hidden="true">—</span>
        <input
          type="date"
          :value="filters.ranges.dateTo"
          aria-label="To"
          @input="setRange('dateTo', inputValue($event))"
        />
      </div>
    </fieldset>

    <label class="food-filter">
      <span>Food pairing</span>
      <input
        type="text"
        name="pairing"
        autocomplete="off"
        :value="filters.pairing"
        placeholder="e.g., chocolate, fish, cheese…"
        aria-describedby="pairing-hint"
        @input="setPairing(inputValue($event))"
      />
    </label>
    <!-- Placeholder disappears on typing; the hint stays as a field description -->
    <p id="pairing-hint" class="sr-only">Examples: chocolate, fish, cheese</p>

    <button
      v-if="activeFilterCount > 0"
      type="button"
      class="reset-filters"
      @click="handleReset"
    >
      Reset filters
    </button>
  </div>
</template>

<style scoped src="./filter-range.css"></style>

<style scoped>
.controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.search-control {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--foreground);
  background: var(--card);
}

.search-control input {
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  font-size: 15px;
}

.search-control input::placeholder {
  color: var(--muted-foreground);
}

/* Native search decorations are hidden: clearing is our own button */
.search-control input::-webkit-search-decoration,
.search-control input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

/*
 * The focus ring sits on the container. A scoped input:focus rule beats the
 * global input:focus-visible outline on specificity, so the field itself
 * must not be the only thing announcing focus.
 */
.search-control:focus-within {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.search-control input:focus {
  outline: none;
}

.search-control button {
  position: relative;
  padding: 4px;
  border: 0;
  background: none;
  color: var(--muted-foreground);
  cursor: pointer;
}

/* 26px icon button with a 46px hit area */
.search-control button::after {
  content: "";
  position: absolute;
  inset: -10px;
}

.filter-button {
  min-width: 150px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid var(--primary);
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 160ms, border-color 160ms, color 160ms;
}

.filter-button:hover,
.filter-button.is-active {
  border-color: var(--foreground);
  background: var(--foreground);
  color: var(--background);
}

.filter-badge {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent-foreground);
  font: 500 10px/1 'DM Mono', monospace;
}

.filter-panel {
  padding: clamp(24px, 3.5vw, 46px);
  display: flex;
  flex-direction: column;
  gap: 27px;
  border: solid var(--input);
  border-width: 0 1px 1px;
  background: var(--muted);
}

.food-filter {
  display: block;
}

.reset-filters {
  align-self: flex-start;
  padding: 0 0 2px;
  border: 0;
  border-bottom: 1px solid currentColor;
  background: none;
  color: inherit;
  font: 500 11px/1.4 'DM Mono', monospace;
  text-transform: uppercase;
  cursor: pointer;
}

@media (max-width: 600px) {
  .controls {
    grid-template-columns: 1fr;
  }

  .filter-button {
    min-height: 54px;
  }

  /* 16px keeps iOS Safari from zooming the page when a field gets focus */
  .search-control input {
    font-size: 16px;
  }

  .filter-panel {
    padding: 24px 18px;
  }
}
</style>
