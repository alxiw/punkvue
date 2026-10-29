<script setup lang="ts">
import { useBeerRecipe } from '@/composables/useBeerRecipe'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import BeerBanner from './components/banner/BeerBanner.vue'
import BeerCatalog from './components/catalog/BeerCatalog.vue'
import BeerRecipe from './components/recipe/BeerRecipe.vue'
import NotFound from '@/components/screens/NotFound.vue'

const { beer, isOpen, isNotFound, openBeer, setOpen } = useBeerRecipe()
</script>

<template>
  <div class="app-shell">
    <AppHeader />

    <main>
      <NotFound v-if="isNotFound" />

      <template v-else>
        <BeerBanner @open="openBeer" />

        <BeerCatalog
          :selected-beer-id="beer?.id"
          :is-recipe-open="isOpen"
          @open="openBeer"
        />
      </template>
    </main>

    <AppFooter />

    <BeerRecipe
      :beer="beer"
      :open="isOpen"
      @update:open="setOpen"
    />
  </div>
</template>

<style scoped>
/* Page shell: sticky footer + fluid gutters */

.app-shell {
  /* 100dvh, not 100vh: on mobile 100vh is the large viewport and adds
     extra scroll while the address bar is visible. The column also keeps
     the footer at the bottom of short pages (e.g. 404). */
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  /* Guards against horizontal scroll: unlike hidden, clip creates no
     scroll container, so sticky children keep working. */
  overflow-x: clip;
}

/* main takes the free space, pinning the footer to the bottom */
main {
  flex: 1;
  padding: 0 clamp(24px, 5vw, 76px);
}
</style>
