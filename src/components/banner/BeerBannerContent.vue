<script setup lang="ts">
import { computed } from "vue"
import type { Beer } from "@/types/beer"
import { useImageLoad } from "@/composables/useImageLoad"
import { getEbcColor } from "@/utils/ebc"
import RerollButton from "./RerollButton.vue"

const props = defineProps<{
  /** Beer to display: renders only when data is present */
  beer: Beer
  /** Reroll request in flight: button is disabled and shows loading */
  loading?: boolean
}>()

defineEmits<{
  /** Click on block or beer name: opens recipe (parent-handled) */
  (e: 'open'): void
  /** "Roll again": requests a new beer (parent-handled) */
  (e: 'reroll'): void
}>()

/** EBC color indicator; null if unknown */
const colorDot = computed(() => getEbcColor(props.beer.ebc))

/** Bottle image loads independently after beer data — revealed on load */
const { imageLoaded, showImage, onImageLoad, onImageError } = useImageLoad(
  () => props.beer.imageUrl,
)
</script>

<template>
  <div class="hero-layout">
    <div class="hero-copy">
      <p class="eyebrow">
        <span class="live-dot" aria-hidden="true" />
        <span>Random beer · #{{ String(beer.id).padStart(3, '0') }}</span>
      </p>

      <div class="hero-inner">
        <p class="hero-tagline">{{ beer.tagline }}</p>
        <h1>
          <button
            type="button"
            class="hero-title"
            :aria-label="`Открыть рецепт: ${beer.name}`"
            @click.stop="$emit('open')"
          >
            {{ beer.name }}
          </button>
        </h1>
      </div>

      <div class="hero-bottom">
        <div class="hero-metrics">
          <div class="metric">
            <span>ABV</span>
            <strong class="metric-value">{{ beer.abv || '—' }}</strong>
          </div>
          <div class="metric">
            <span>IBU</span>
            <strong class="metric-value">{{ beer.ibu || '—' }}</strong>
          </div>
          <div class="metric">
            <span>EBC</span>
            <strong class="metric-value">
              <i
                v-if="colorDot"
                class="ebc-dot hero-ebc-dot"
                :style="{ backgroundColor: colorDot }"
              />
              {{ beer.ebc || '—' }}
            </strong>
          </div>
        </div>

        <RerollButton :loading="loading" @reroll="$emit('reroll')" />
      </div>
    </div>

    <div class="hero-image" :class="{ 'is-loaded': imageLoaded }">
      <img
        v-if="showImage"
        :src="beer.imageUrl"
        alt=""
        :class="{ 'is-loaded': imageLoaded }"
        fetchpriority="high"
        @load="onImageLoad"
        @error="onImageError"
      />
      <!-- Skeleton stays in DOM, crossfades out on load -->
      <span
        v-if="showImage"
        class="sk sk--bottle"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<style scoped src="./hero-shell.css"></style>

<style scoped>
/* Beer name button that opens the recipe */
.hero-title {
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-align: left;
  cursor: pointer;
}

/* Align EBC dot (if exists) with metric value */
.metric-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* EBC dot: sized for 27px font; base shape defined in main.css */
.hero-ebc-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
}

/*
 * Images are bottles, kegs, cans, and casks (width/height ≈ 0.25–0.67) with a transparent background.
 * Absolute positioning prevents images from stretching the grid row; contain avoids cropping
 */
.hero-image img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  padding: clamp(18px, 3vw, 40px);
  object-fit: contain;
  object-position: center;
  /* Layered with image skeleton; skeleton fades out on load */
  z-index: 1;
  filter: saturate(0.78) contrast(1.08) drop-shadow(0 16px 16px rgb(0 0 0 / 60%));
  /* Image skeleton visible until image loads */
  opacity: 0;
  transition: opacity 320ms ease, transform 700ms cubic-bezier(.2,.7,.2,1);
}

.hero-image img.is-loaded {
  opacity: 1;
}

/*
 * Subtle zoom on whole hero hover.
 * .hero lives in parent component, so scoped attribute applies only to img
 */
.hero:hover .hero-image img {
  transform: scale(1.025);
}
</style>
