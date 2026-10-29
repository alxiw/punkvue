<script setup lang="ts">
import { computed } from 'vue'
import { Beer as BeerIcon } from "@lucide/vue"
import type { Beer } from "@/types/beer"
import { TOTAL_BEERS } from "@/api/beer.api"
import { useBeerCatalog } from "@/composables/useBeerCatalog"
import { formatBeerCount } from "@/utils/formatters"
import BeerFilters from "@/components/catalog/BeerFilters.vue"
import BeerItem from "@/components/catalog/BeerItem.vue"
import BeerItemSkeleton from "@/components/catalog/BeerItemSkeleton.vue"

defineProps<{
  selectedBeerId?: number
  isRecipeOpen?: boolean
}>()

defineEmits<{
  (e: 'open', beer: Beer): void
}>()

const {
  filters,
  beers,
  loading,
  loadingMore,
  hasMore,
  loadMoreTrigger,
  resetFilters,
  resetAll,
} = useBeerCatalog()

const hasActiveFilters = computed(() => {
  const { query, pairing, ranges } = filters.value
  return Boolean(query.trim() || pairing.trim() || Object.values(ranges).some((value) => value.trim()))
})
</script>

<template>
  <section id="catalog" class="catalog" aria-labelledby="catalog-title">
    <div class="catalog-heading">
      <h2 id="catalog-title" class="catalog-title">The complete collection</h2>

      <p class="catalog-count" aria-live="polite">
        <template v-if="loading">Loading beers…</template>
        <template v-else-if="hasActiveFilters">
          Showing <strong>{{ formatBeerCount(beers.length) }}</strong>
          <span> · with filters</span>
        </template>
        <template v-else>
          Showing <strong>{{ beers.length }}</strong> of <strong>{{ formatBeerCount(TOTAL_BEERS) }}</strong>
        </template>
      </p>
    </div>

    <BeerFilters
      v-model:filters="filters"
      @reset="resetFilters"
    />

    <div class="beer-list" :aria-busy="loading || loadingMore">
      <!-- Visual-only column header (hidden from screen readers): metric labels live inside the rows -->
      <div class="beer-list__header" aria-hidden="true">
        <span>Beer / tagline</span>
        <span>ABV</span>
        <span>IBU</span>
        <span>EBC</span>
        <span>First brewed</span>
        <span />
      </div>

      <div v-if="loading" class="beer-list__skeletons">
        <BeerItemSkeleton v-for="n in 6" :key="n" />
      </div>

      <div v-else-if="beers.length === 0" class="beer-list__empty-state">
        <BeerIcon :size="32" :stroke-width="1.7" aria-hidden="true" />
        <h3>No beers found</h3>
        <p>Try changing your search or filters</p>
        <button type="button" @click="resetAll">Reset all</button>
      </div>

      <ul v-else class="beer-list__rows">
        <li v-for="beer in beers" :key="beer.id">
          <BeerItem
            :beer="beer"
            :active="selectedBeerId === beer.id && isRecipeOpen"
            @open="$emit('open', beer)"
          />
        </li>
      </ul>

      <!-- Infinite scroll sentinel -->
      <div ref="loadMoreTrigger" class="beer-list__load-sentinel">
        <div v-if="loadingMore" class="beer-list__loading-more">
          <span class="beer-list__spinner" aria-hidden="true" />
          <span>Loading 30 beers more…</span>
        </div>
        <p v-else-if="!loading && !hasMore && beers.length > 0" class="beer-list__end-of-list">
          You reached the end of the list
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped src="./beer-row.css"></style>

<style scoped>
.catalog {
  scroll-margin-top: 30px;
}

.catalog-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 34px;
}

.catalog-title {
  color: var(--muted-foreground);
  font: 400 12px/1 'DM Mono', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.catalog-count {
  color: var(--muted-foreground);
  font: 400 12px/1 'DM Mono', monospace;
}

.catalog-count strong {
  color: var(--foreground);
  font-weight: 500;
}

.beer-list {
  margin-top: 36px;
  border-top: 1px solid var(--foreground);
}

.beer-list__header {
  min-height: 44px;
  color: var(--muted-foreground);
  font: 500 9px/1 'DM Mono', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.beer-list__rows {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Bottom border caps the list, anchoring the final row */
.beer-list__rows > li:last-child .beer-row {
  border-bottom: 1px solid var(--foreground);
}

.beer-list__skeletons {
  border-bottom: 1px solid var(--foreground);
}

.beer-list__load-sentinel {
  min-height: 92px;
  display: grid;
  place-items: center;
  border-top: 1px solid var(--border);
}

.beer-list__loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--muted-foreground);
  font: 400 11px/1.4 'DM Mono', monospace;
}

.beer-list__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.beer-list__end-of-list {
  color: var(--muted-foreground);
  font: 400 10px/1.4 'DM Mono', monospace;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.beer-list__empty-state {
  min-height: 320px;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--foreground);
  text-align: center;
}

.beer-list__empty-state h3 {
  margin: 18px 0 6px;
  font: 400 34px/1 'Instrument Serif', serif;
}

.beer-list__empty-state p {
  color: var(--muted-foreground);
  font-size: 13px;
}

.beer-list__empty-state button {
  margin-top: 20px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--foreground);
  background: none;
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Matches beer-row.css breakpoint: column layout persists only while header is visible */
@media (max-width: 1000px) {
  /* Column header is replaced by inline .metric-label on smaller screens */
  .beer-list__header {
    display: none;
  }

  .beer-list {
    margin-top: 25px;
  }
}

@media (max-width: 600px) {
  .catalog-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }
}
</style>
