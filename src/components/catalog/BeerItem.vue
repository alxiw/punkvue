<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, BadgeQuestionMark as BeerPlaceholder } from "@lucide/vue"
import type { Beer } from "@/types/beer"
import { useImageLoad } from '@/composables/useImageLoad'
import { getEbcColor } from "@/utils/ebc"
import { formatFirstBrewed } from "@/utils/formatters"

const props = withDefaults(defineProps<{
  beer: Beer
  active?: boolean
}>(), {
  active: false
})

defineEmits<{
  (e: 'open', beer: Beer): void
}>()

/** Row image: skeleton while loading, fallback icon on error */
const { imageLoaded, showImage, onImageLoad, onImageError } = useImageLoad(
  () => props.beer.imageUrl,
)

/** Color marker for the EBC scale, null if the value is unknown */
const colorDot = computed(() => getEbcColor(props.beer.ebc))

/** "04/2007" → "APR 2007", "2007" → "2007"; empty values fallback to an em dash */
const firstBrewed = computed(() => formatFirstBrewed(props.beer.firstBrewed) || '—')
</script>

<template>
  <button
    type="button"
    class="beer-row"
    :aria-pressed="active"
    @click="$emit('open', beer)"
  >
    <span class="beer-name-cell">
      <span class="beer-index">{{ String(beer.id).padStart(3, '0') }}</span>
      <span class="beer-image" :class="{ 'is-loaded': imageLoaded }">
        <img
          v-if="showImage"
          :src="beer.imageUrl"
          alt=""
          loading="lazy"
          decoding="async"
          @load="onImageLoad"
          @error="onImageError"
        />
        <BeerPlaceholder v-else :size="25" :stroke-width="1.7" aria-hidden="true" />

        <!-- Skeleton above the img: wait for load and fade it out with a crossfade -->
        <span
          v-if="showImage"
          class="sk-row sk-row--bottle"
          aria-hidden="true"
        />
      </span>

      <span class="beer-name-text">
        <strong>{{ beer.name }}</strong>
        <small>{{ beer.tagline }}</small>
      </span>
    </span>

    <span>
      <span class="metric-label sr-only">ABV</span>{{ beer.abv || '—' }}
    </span>
    <span>
      <span class="metric-label sr-only">IBU</span>{{ beer.ibu || '—' }}
    </span>
    <span>
      <span class="metric-label sr-only">EBC</span>
      <i
        v-if="colorDot"
        class="ebc-dot beer-ebc-dot"
        :style="{ backgroundColor: colorDot }"
        aria-hidden="true"
      />
      {{ beer.ebc || '—' }}
    </span>
    <span>
      <span class="metric-label sr-only">First brewed</span>{{ firstBrewed }}
    </span>
    <span class="row-arrow">
      <ArrowRight :size="20" :stroke-width="1.7" aria-hidden="true" />
    </span>
  </button>
</template>

<style scoped src="./beer-row.css"></style>

<style scoped>
.beer-row {
  width: 100%;
  min-height: 126px;
  padding: 0;
  border: 0;
  border-top: 1px solid var(--border);
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: padding 180ms ease, background 180ms ease;
}

.beer-row:hover {
  padding: 0 15px;
  background: var(--primary);
  color: var(--primary-foreground);
}

.beer-row:hover .beer-index,
.beer-row:hover .beer-name-cell small,
.beer-row:hover .beer-image svg {
  color: color-mix(in oklab, var(--primary-foreground) 72%, transparent);
}

.beer-index {
  width: 24px;
  flex: 0 0 24px;
  color: var(--muted-foreground);
  font: 400 10px/1 'DM Mono', monospace;
}

/*
 * Absolute positioning forces `height: 100%` resolution
 * (preventing grid auto-height clipping);
 * object-fit: contain preserves aspect ratio.
 */
.beer-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 7px;
  object-fit: contain;
  filter: saturate(0.92) drop-shadow(0 2px 2px rgb(0 0 0 / 75%));
  /* Image skeleton visible until image loads */
  opacity: 0;
  transition: opacity 220ms ease;
}

.beer-image.is-loaded img {
  opacity: 1;
}

/* Subtle rim light separates dark bottles from the dark background without washing out labels */
@media (prefers-color-scheme: dark) {
  .beer-image img {
    filter: saturate(0.92) drop-shadow(0 0 2px rgb(255 255 255 / 45%));
  }

  .beer-row:hover .beer-image img {
    filter: saturate(0.92) drop-shadow(0 2px 2px rgb(0 0 0 / 55%));
  }
}

.beer-image svg {
  color: var(--muted-foreground);
}

.beer-name-cell strong {
  font: 400 28px/1 'Instrument Serif', serif;
  letter-spacing: -0.015em;
}

.beer-name-cell small {
  color: var(--muted-foreground);
  font: 400 11px/1 'DM Mono', monospace;
}

.beer-row > span:not(.beer-name-cell, .row-arrow) {
  display: flex;
  align-items: center;
  gap: 8px;
  font: 400 13px/1 'DM Mono', monospace;
}

/* EBC dot color marker; base shape defined in main.css */
.beer-ebc-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
}

.row-arrow svg {
  transition: transform 160ms ease;
}

.beer-row:hover .row-arrow svg {
  transform: translateX(3px);
}

/* Crossfade: skeleton overlays img and fades out post-load without blank frame flash */
.beer-image .sk-row--bottle {
  position: relative;
  z-index: 1;
  transition: opacity 220ms ease;
}

.beer-image.is-loaded .sk-row--bottle {
  opacity: 0;
  animation: none;
}

/* Matches beer-row.css breakpoint: 871px minimum for grid columns */
@media (max-width: 1000px) {
  .beer-row {
    padding: 22px 0;
  }

  .beer-row:hover {
    padding: 22px 12px;
  }

  /* Metrics wrap below name, left-aligned to text */
  .beer-row > span:not(.beer-name-cell, .row-arrow) {
    grid-column: 1;
    margin-left: 36px;
    display: inline-flex;
  }

  /*
 * Metric labels render on mobile only. Hidden on desktop via .sr-only,
 * they are restored to normal flow here. Scoped specificity (0,2,0)
 * reliably overrides global .sr-only (0,1,0) regardless of bundle order.
 */
  .metric-label {
    position: static;
    width: auto;
    height: auto;
    margin: 0;
    overflow: visible;
    clip: auto;
    clip-path: none;
    white-space: normal;
    min-width: 82px;
    color: var(--muted-foreground);
    font-size: 9px;
    text-transform: uppercase;
  }
}

@media (max-width: 600px) {
  .beer-name-cell {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .beer-name-cell strong {
    font-size: 25px;
  }

  .beer-name-text {
    width: calc(100% - 104px);
  }
}
</style>
