<script setup lang="ts">
import { ArrowRight } from "@lucide/vue"
</script>

<template>
  <div class="beer-skeleton" aria-hidden="true">
    <span class="beer-name-cell">
      <span class="sk-row sk-row--index" />
      <span class="beer-image">
        <span class="sk-row sk-row--bottle" />
      </span>
      <span class="beer-name-text">
        <span class="sk-row sk-row--name" />
        <span class="sk-row sk-row--tagline" />
      </span>
    </span>

    <span v-for="m in 3" :key="m" class="sk-row sk-row--metric" />
    <span class="sk-row sk-row--date" />

    <span class="row-arrow">
      <ArrowRight :size="20" :stroke-width="1.7" aria-hidden="true" />
    </span>
  </div>
</template>

<style scoped src="./beer-row.css"></style>

<style scoped>
.beer-skeleton {
  /* border-box via preflight: 126px matches the exact height of .beer-row */
  min-height: 126px;
  /* 15px + border-top yields the same 16px offset as the image in .beer-row */
  padding: 15px 0;
  border-top: 1px solid var(--border);
}

/*
 * Text wrapper is a flex item with auto width. Allow it to fill the
 * remainder of the column, otherwise pill percentage widths resolve against zero width.
 */
.beer-skeleton .beer-name-text {
  flex: 1 1 auto;
  min-width: 0;
}

/* Skeleton pills: mirror the exact proportions of real row cells */
.sk-row--index {
  width: 24px;
  height: 10px;
  flex: 0 0 24px;
}

.sk-row--name {
  width: min(72%, 460px);
  height: 24px;
}

.sk-row--tagline {
  width: min(58%, 380px);
  height: 12px;
}

.sk-row--metric {
  width: 44px;
  height: 12px;
}

.sk-row--date {
  width: 100px;
  height: 12px;
}

.beer-skeleton .row-arrow {
  color: var(--muted-foreground);
  opacity: 0.45;
}

/* Same breakpoint as beer-row.css: 871px column min-width */
@media (max-width: 1000px) {
  /* Skeleton mirrors the mobile row layout: metrics stack beneath the title */
  .beer-skeleton {
    min-height: 0;
    padding: 22px 0;
  }

  .beer-skeleton > .sk-row {
    grid-column: 1;
    margin-left: 36px;
  }
}

@media (max-width: 600px) {
  /* On narrow viewports, six skeleton rows take up too much vertical space */
  .beer-skeleton:nth-child(n + 5) {
    display: none;
  }

  /* Pills derive their dimensions to match the real row text length */
  .beer-skeleton .beer-name-text {
    flex: 0 0 auto;
  }
}
</style>
