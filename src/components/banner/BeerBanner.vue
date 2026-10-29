<script setup lang="ts">
import { computed } from "vue"
import type { Beer } from "@/types/beer"
import { useRandomBeer } from "@/composables/useRandomBeer"
import BeerBannerSkeleton from "./BeerBannerSkeleton.vue"
import BeerBannerError from "./BeerBannerError.vue"
import BeerBannerContent from "./BeerBannerContent.vue"

const emit = defineEmits<{
  (e: 'open', beer: Beer): void
}>()

/**
 * Hero section orchestrator: manages request state and switches between
 * four views — skeleton, error, content, and an empty pending div.
 */
const { beer, loading, error, showSkeleton, shuffle } = useRandomBeer()

/** Banner is busy while a request is in flight or the skeleton is visible */
const busy = computed(() => loading.value || showSkeleton.value)

/** Beer is displayed: the block is interactive and can open the beer recipe */
const canOpen = computed(() => Boolean(beer.value) && !showSkeleton.value && !error.value)

/**
 * Clicking anywhere on the hero section opens the beer recipe,
 * except for the "Roll again" button, which stops propagation to reroll.
 */
function openBeer() {
  if (!beer.value || !canOpen.value) return
  emit('open', beer.value)
}
</script>

<template>
  <section
    class="hero"
    :class="{ 'hero--clickable': canOpen }"
    :aria-busy="busy"
    @click="openBeer"
  >
    <!-- Skeleton is hidden from screen readers -->
    <p class="sr-only" role="status">
      <template v-if="busy">Loading random beer</template>
      <template v-else-if="error">Couldn't load a random beer</template>
    </p>

    <BeerBannerSkeleton v-if="showSkeleton" key="skeleton" />

    <BeerBannerError
      v-else-if="error"
      key="error"
      :loading="loading"
      @reroll="shuffle"
    />

    <BeerBannerContent
      v-else-if="beer"
      key="beer"
      :beer="beer"
      :loading="loading"
      @open="openBeer"
      @reroll="shuffle"
    />

    <!-- First ~200ms of loading: empty div holds hero height -->
    <div v-else key="pending" class="hero-pending" aria-hidden="true" />
  </section>
</template>

<style scoped>
.hero {
  min-height: 520px;
  margin: 28px 0 100px;
  background: var(--primary);
  color: var(--primary-foreground);
}

.hero--clickable {
  cursor: pointer;
}

/* Becomes equal to 520px like parent */
.hero-pending {
  min-height: inherit;
}

@media (max-width: 600px) {
  .hero {
    min-height: 0;
    margin: 16px 0 75px;
  }
}
</style>
