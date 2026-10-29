<script setup lang="ts">
import { BeerOff } from "@lucide/vue"
import RerollButton from "./RerollButton.vue"

defineProps<{
  /** Reroll request in flight: button is disabled and shows loading */
  loading?: boolean
}>()

defineEmits<{
  (e: 'reroll'): void
}>()
</script>

<template>
  <!-- Matches content/skeleton grid, but non-interactive -->
  <div class="hero-layout">
    <div class="hero-copy">
      <p class="eyebrow">
        <span class="live-dot" aria-hidden="true" />
        <span>Random beer</span>
      </p>

      <div class="hero-inner">
        <h1>Something went wrong</h1>
      </div>

      <div class="hero-bottom hero-bottom--error">
        <p class="hero-error-text">
          Couldn't load a random beer. Check your connection and try again.
        </p>

        <RerollButton :loading="loading" @reroll="$emit('reroll')" />
      </div>
    </div>

    <div class="hero-image hero-image--error" aria-hidden="true">
      <BeerOff :size="128" :stroke-width="1.2" />
    </div>
  </div>
</template>

<style scoped src="./hero-shell.css"></style>

<style scoped>
.hero-copy .hero-inner h1 {
  font-size: clamp(52px, 7.5vw, 108px);
  line-height: 0.84;
  letter-spacing: -0.045em;
  padding-bottom: 0.14em;
}

@media (max-width: 600px) {
  .hero-inner h1 {
    font-size: clamp(38px, 12vw, 64px);
  }
}

.hero-bottom--error {
  align-items: center;
}

.hero-error-text {
  max-width: 340px;
  font-size: 13px;
  line-height: 1.55;
  opacity: 0.85;
}

.hero-image--error svg {
  position: relative;
  z-index: 1;
  opacity: 0.45;
}
</style>
