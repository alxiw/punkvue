<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { TOTAL_BEERS } from '@/api/beer.api'
</script>

<template>
  <section class="not-found" aria-labelledby="not-found-title">
    <p class="not-found__kicker">Error</p>
    <p class="not-found__code" aria-hidden="true">404</p>
    <h1 id="not-found-title" class="not-found__title">No such beer</h1>
    <p class="not-found__text">
      The collection has {{ TOTAL_BEERS }} beers: numbers from 1 to {{ TOTAL_BEERS }}.
      Check the address or head back to the catalog.
    </p>
    <RouterLink to="/" class="not-found__link">← Back to catalog</RouterLink>
  </section>
</template>

<style scoped>
/* Page 404 */

.not-found {
  min-height: 60vh;
  padding: clamp(60px, 10vw, 120px) 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.not-found__kicker {
  color: var(--muted-foreground);
  font: 400 12px/1 'DM Mono', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.not-found__code {
  margin-top: 18px;
  color: var(--primary);
  font: 400 clamp(92px, 15vw, 180px)/0.76 'Instrument Serif', serif;
  letter-spacing: -0.055em;
  /* Line-height < 1 clips text descenders/overflow — add padding matching hero in banner and recipe */
  padding-bottom: 0.1em;
}

.not-found__title {
  margin-top: 26px;
  font: 400 clamp(28px, 4vw, 44px)/1.1 'Instrument Serif', serif;
}

.not-found__text {
  max-width: 520px;
  margin-top: 14px;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 1.6;
}

.not-found__link {
  margin-top: 28px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--foreground);
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.not-found__link:hover {
  border-color: var(--secondary);
  color: var(--secondary);
}

@media (prefers-color-scheme: dark) {
  .not-found__link:hover {
    /* --secondary lacks contrast on dark backgrounds; use primary instead */
    border-color: var(--primary);
    color: var(--primary);
  }
}
</style>
