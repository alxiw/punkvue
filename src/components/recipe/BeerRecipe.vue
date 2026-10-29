<script setup lang="ts">
import { computed } from "vue"
import { BadgeQuestionMark as BeerPlaceholder, X } from "@lucide/vue"
import type { Beer } from "@/types/beer"
import { useImageLoad } from "@/composables/useImageLoad"
import Sheet from "@/components/recipe/Sheet.vue"
import BeerStat from "@/components/recipe/BeerStat.vue"
import { formatFirstBrewed, githubProfileUrl } from "@/utils/formatters"
import { getEbcColor } from "@/utils/ebc"

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  beer: Beer | null
}>()

/** Color marker on the EBC scale; null if the value is unknown */
const ebcColor = computed(() => getEbcColor(props.beer?.ebc))

/** Hero image: skeleton silhouette until load, icon placeholder after a failed load */
const { imageLoaded, showImage, onImageLoad, onImageError } = useImageLoad(
  () => props.beer?.imageUrl,
)

/** Ingredient lists; a block without data is not rendered at all */
const malt = computed(() => props.beer?.ingredients.malt ?? [])
const hops = computed(() => props.beer?.ingredients.hops ?? [])
const yeast = computed(() => props.beer?.ingredients.yeast ?? "")

/** Mash steps with a known temperature: the API may send `temp.value: null` (e.g. beer #89) */
const mashSteps = computed(() => (props.beer?.method.mashTemp ?? []).filter((step) => step.temp))

/** Fermentation temperature; empty when the API sends a null value */
const fermentationTemp = computed(() => props.beer?.method.fermentation.temp ?? "")

/** The method block is shown only while it has at least one filled row */
const hasMethod = computed(
  () =>
    mashSteps.value.length > 0 ||
    Boolean(fermentationTemp.value) ||
    Boolean(props.beer?.method.twist.length),
)
</script>

<template>
  <Sheet
    v-model:open="open"
    :title="beer?.name ?? 'Beer information'"
    :description="beer?.tagline ?? 'Detailed information about the selected beer'"
  >
    <div v-if="beer" class="beer-recipe">
      <article>
        <!-- Hero -->
        <div class="beer-recipe__hero">
          <div class="beer-recipe__hero-shade" aria-hidden="true" />

          <div class="beer-recipe__hero-top">
            <p class="beer-recipe__hero-id">
              #{{ beer.id }} &middot; First brewed {{ formatFirstBrewed(beer.firstBrewed) }}
            </p>
            <button
              type="button"
              class="beer-recipe__close"
              aria-label="Close"
              @click="open = false"
            >
              <X :size="18" :stroke-width="1.7" aria-hidden="true" />
            </button>
          </div>

          <div class="beer-recipe__hero-inner">
            <div class="beer-recipe__hero-intro">
              <header>
                <h2 class="beer-recipe__hero-title">
                  {{ beer.name }}
                </h2>
              </header>
              <p class="beer-recipe__hero-tagline">
                {{ beer.tagline }}
              </p>
            </div>
            <div
              class="beer-recipe__hero-image"
              :class="{ 'is-loaded': imageLoaded }"
            >
              <img
                v-if="showImage"
                :src="beer.imageUrl"
                alt=""
                decoding="async"
                @load="onImageLoad"
                @error="onImageError"
              />
              <BeerPlaceholder
                v-else
                class="beer-recipe__hero-placeholder"
                :size="96"
                :stroke-width="1.2"
                aria-hidden="true"
              />

              <!-- Skeleton above the img: wait for load and fade it out with a crossfade -->
              <span
                v-if="showImage"
                class="sk sk--bottle"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="beer-recipe__body">

          <!-- Stats -->
          <div class="beer-recipe__grid beer-recipe__grid--stats">
            <BeerStat label="Strength, ABV" :value="beer.abv" />
            <BeerStat label="Bitterness, IBU" :value="beer.ibu || '—'" />
            <BeerStat label="Color, EBC" :value="beer.ebc || '—'" :dot-color="ebcColor"/>
          </div>

          <!-- Description -->
          <section class="beer-recipe__section">
            <h3 class="beer-recipe__kicker">Description</h3>
            <p class="beer-recipe__description">
              {{ beer.description }}
            </p>
          </section>

          <!-- Pairing -->
          <section class="beer-recipe__pairing">
            <h3 class="beer-recipe__kicker">Food pairing</h3>
            <ul class="beer-recipe__pairing-list">
              <li v-for="item in beer.foodPairing" :key="item">{{ item }}</li>
            </ul>
          </section>

          <!-- Recipe -->
          <section class="beer-recipe__section">

            <!-- Basics -->
            <div class="beer-recipe__block beer-recipe__block--basics">
              <h4 class="beer-recipe__kicker">Basics</h4>
              <ul class="beer-recipe__list">
                <li class="beer-recipe__row">
                  <span class="beer-recipe__term">Volume</span>
                  <span class="beer-recipe__value">{{ beer.volume }}</span>
                </li>
                <li class="beer-recipe__row">
                  <span class="beer-recipe__term">Boil Volume</span>
                  <span class="beer-recipe__value">{{ beer.boilVolume }}</span>
                </li>
              </ul>

              <div class="beer-recipe__grid beer-recipe__grid--basics">
                <BeerStat label="Target OG" :value="beer.targetOg || '—'" />
                <BeerStat label="Target FG" :value="beer.targetFg || '—'" />
                <BeerStat label="Attenuation level" :value="beer.attenuationLevel || '—'" />
                <BeerStat label="Acidity, pH" :value="beer.ph || '—'" />
              </div>
            </div>

            <!-- Method -->
            <div v-if="hasMethod" class="beer-recipe__block beer-recipe__block--method">
              <h4 class="beer-recipe__kicker">Method / Timings</h4>
              <ul class="beer-recipe__list">
                <li class="beer-recipe__row" v-for="(m, i) in mashSteps" :key="i">
                  <span class="beer-recipe__term">Mash</span>
                  <span class="beer-recipe__value">{{ m.temp }} <span v-if="m.duration">({{ m.duration }} min)</span></span>
                </li>
                <li v-if="fermentationTemp" class="beer-recipe__row">
                  <span class="beer-recipe__term">Fermentation</span>
                  <span class="beer-recipe__value">{{ fermentationTemp }}</span>
                </li>
                <li v-if="beer.method.twist.length" class="beer-recipe__row">
                  <span class="beer-recipe__term">Twist</span>
                  <span class="beer-recipe__value beer-recipe__value--wrap">{{ beer.method.twist.join('\n') }}</span>
                </li>
              </ul>
            </div>

            <!-- Malt -->
            <div v-if="malt.length" class="beer-recipe__block beer-recipe__block--malt">
              <h4 class="beer-recipe__kicker">Malt</h4>
              <ul class="beer-recipe__list">
                <li class="beer-recipe__row"
                    v-for="(m, i) in malt"
                    :key="`${m.name}-${i}`"
                >
                  <span class="beer-recipe__term">{{ m.name }}</span>
                  <span class="beer-recipe__value">{{ m.amount }}</span>
                </li>
              </ul>
            </div>

            <!-- Hops -->
            <div v-if="hops.length" class="beer-recipe__block beer-recipe__block--hops">
              <h4 class="beer-recipe__kicker">Hops</h4>
              <ul class="beer-recipe__list">
                <li class="beer-recipe__row beer-recipe__row--hop"
                    v-for="(h, i) in hops"
                    :key="`${h.name}-${i}`"
                >
                  <span class="beer-recipe__term">{{ h.name }}</span>
                  <span class="beer-recipe__note">{{ h.add }} <span v-if="h.attribute">({{ h.attribute }})</span></span>
                  <span class="beer-recipe__value">{{ h.amount }}</span>
                </li>
              </ul>
            </div>

            <!-- Yeast -->
            <div v-if="yeast" class="beer-recipe__block beer-recipe__block--yeast">
              <h4 class="beer-recipe__kicker">Yeast</h4>
              <ul class="beer-recipe__list">
                <li class="beer-recipe__row"><span class="beer-recipe__term">{{ yeast }}</span></li>
              </ul>
            </div>
          </section>

          <!-- Tips -->
          <div class="beer-recipe__tips">
            <h4 class="beer-recipe__kicker">Brewer's tips</h4>
            <p class="beer-recipe__tips-text">
              {{ beer.brewersTips }}
            </p>
          </div>

          <!-- Contributed by -->
          <p class="beer-recipe__contributed">
            Contributed by:
            <a
              v-if="beer.contributedBy.alias"
              class="beer-recipe__contributed-link"
              :href="githubProfileUrl(beer.contributedBy.alias)"
              target="_blank"
              rel="noreferrer noopener"
            >{{ beer.contributedBy.name }} @{{ beer.contributedBy.alias }}</a>
            <span v-else>{{ beer.contributedBy.name }}</span>
          </p>
        </div>
      </article>
    </div>
  </Sheet>
</template>

<style scoped>
/*
 * Sheet that slides in from the right with detailed beer information.
 * The palette and base page settings are declared in main.css.
 */

.beer-recipe {
  height: 100%;
  overflow-y: auto;
}

.beer-recipe__hero {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 340px;
  gap: 24px;
  padding: 28px clamp(28px, 5vw, 58px) 40px;
  background: var(--primary);
}

/* Darken the primary background: white text and the bottle photo stay readable on any shade */
.beer-recipe__hero-shade {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 25%);
  pointer-events: none;
}

/* In the dark theme primary is lighter, so white text on it loses contrast */
@media (prefers-color-scheme: dark) {
  .beer-recipe__hero-shade {
    background: rgb(0 0 0 / 40%);
  }
}

.beer-recipe__hero-top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 42px;
}

.beer-recipe__hero-id {
  color: rgb(255 255 255 / 85%);
  font-family: 'DM Mono', monospace;
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.beer-recipe__close {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border: 1px solid currentColor;
  border-radius: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: background-color 150ms ease;
}

/*
 * In the dark theme --foreground is almost white: a white cross would disappear on it.
 * --primary-foreground stays dark in both themes.
 */
.beer-recipe__close:hover {
  background: var(--primary-foreground);
}

.beer-recipe__close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.beer-recipe__hero-inner {
  position: relative;
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: space-between;
  gap: 1rem;
}

.beer-recipe__hero-intro {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 0;
}

.beer-recipe__hero-title {
  margin: 0 0 8px;
  padding-bottom: 0.12em;
  color: #fff;
  font-family: 'Instrument Serif', serif;
  font-size: clamp(54px, 7vw, 80px);
  font-weight: 400;
  line-height: 0.84;
  letter-spacing: -0.045em;
  overflow-wrap: break-word;
  hyphens: auto;
}

.beer-recipe__hero-tagline {
  max-width: 28rem;
  margin: 0;
  color: rgb(255 255 255 / 90%);
  font-family: 'Instrument Serif', serif;
  font-size: 1.375rem;
  font-style: italic;
  line-height: 1.2;
  text-wrap: pretty;
}

/*
 * Bottle image column. The column itself sets the size, and the image fits entirely inside it:
 * this way the loaded photo, the skeleton, and the broken-link placeholder all look the same —
 * the hero doesn't jump when the state changes.
 */
.beer-recipe__hero-image {
  position: relative;
  display: grid;
  place-items: center;
  width: 12rem;
  height: 19.2rem;
  flex-shrink: 0;
  align-self: flex-end;
  z-index: 1;
}

.beer-recipe__hero-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: saturate(0.78) contrast(1.08) drop-shadow(0 14px 14px rgb(0 0 0 / 60%));
  /* Fade in after load — crossfade with the skeleton */
  opacity: 0;
  transition: opacity 220ms ease;
}

.beer-recipe__hero-image.is-loaded img {
  opacity: 1;
}

/* The image URL is broken or missing — show the placeholder instead of a bottle */
.beer-recipe__hero-placeholder {
  color: rgb(255 255 255 / 45%);
}

/*
 * The skeleton sits above the img and fades out once it loads.
 * Positioning is absolute so it doesn't take the second grid cell
 * and doesn't push the hero apart.
 */
.beer-recipe__hero-image .sk--bottle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  transition: opacity 220ms ease;
}

.beer-recipe__hero-image.is-loaded .sk--bottle {
  opacity: 0;
  animation: none;
}

.beer-recipe__body {
  padding: 30px clamp(28px, 5vw, 58px) 40px;
}

/* Description and recipe sections */
.beer-recipe__section {
  padding: 28px 0;
}

.beer-recipe__grid {
  display: grid;
  gap: 10px;
}

/* Stats overlap the hero */
.beer-recipe__grid--stats {
  position: relative;
  z-index: 2;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: -52px 0 20px;
}

.beer-recipe__kicker {
  margin: 0 0 10px;
  color: var(--primary);
  font-family: 'DM Mono', monospace;
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.beer-recipe__description {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.9375rem;
  line-height: 1.75;
  text-wrap: pretty;
}

.beer-recipe__pairing {
  padding: 22px 24px;
  border: 1px solid var(--border);
  background: color-mix(in oklab, var(--card) 40%, transparent);
}

.beer-recipe__pairing-list {
  margin: 0;
  padding: 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.65;
  list-style-type: disc;
  list-style-position: inside;
}

.beer-recipe__pairing-list > :not(:last-child) {
  margin-bottom: 0.25rem;
}

.beer-recipe__block {
  margin: 0;
}

.beer-recipe__block--basics {
  margin: 22px 0 28px;
}

.beer-recipe__grid--basics {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 16px 0 0;
}

/* For volume rows the spacing is set via padding */
.beer-recipe__block--basics .beer-recipe__list > :not(:last-child) {
  margin-bottom: 0;
}

.beer-recipe__block--method {
  margin-top: 26px;
}

.beer-recipe__block--malt {
  margin-top: 26px;
}

.beer-recipe__block--hops{
  margin-top: 26px;
}

.beer-recipe__block--yeast{
  margin-top: 26px;
}

.beer-recipe__list {
  margin: 0;
  padding: 0;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.5;
  list-style: none;
}

/* Spacing between list rows */
.beer-recipe__list > :not(:last-child) {
  margin-bottom: 0.5rem;
}

.beer-recipe__row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 0;
  padding: 7px 0;
  border-bottom: 1px solid var(--border);
}

.beer-recipe__row:last-child {
  border-bottom: 0;
}

/* Ingredient name in a row: foreground color on top of the muted list background */
.beer-recipe__term {
  color: var(--foreground);
}

/*
 * The side columns have equal width, so the middle one (the note) sits
 * exactly in the center of the row and doesn't float from row to row.
 * Baselines of the name, the note and the weight match.
 */
.beer-recipe__row--hop {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 9rem minmax(0, 1fr);
  align-items: baseline;
  column-gap: 16px;
}

/* The note is centered on the axis of the middle column */
.beer-recipe__row--hop .beer-recipe__note {
  margin-top: 0;
  text-align: center;
}

/* The amount is flush to the rows's right edge */
.beer-recipe__row--hop .beer-recipe__value {
  min-width: 0;
  text-align: right;
}

.beer-recipe__value {
  color: var(--muted-foreground);
  font-family: 'DM Mono', monospace;
  white-space: nowrap;
}

/*
 * Long values wrap onto the next line if they don't fit on one.
 * min-width: 0 lets the flex item shrink,
 * overflow-wrap: anywhere breaks overly long words.
 */
.beer-recipe__value--wrap {
  min-width: 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
  text-align: right;
}

.beer-recipe__note {
  margin-top: 2px;
  color: var(--muted-foreground);
  font-family: 'DM Mono', monospace;
  font-size: 0.625rem;
  line-height: 1.4;
}

.beer-recipe__tips {
  margin-top: 6px;
  padding: 22px 24px;
  background: var(--muted);
}

.beer-recipe__tips-text {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  font-style: italic;
  line-height: 1.6;
}

.beer-recipe__contributed {
  margin-top: 14px;
  color: var(--muted-foreground);
  font-family: 'DM Mono', monospace;
  font-size: 0.5625rem;
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-align: right;
  text-transform: uppercase;
}

.beer-recipe__contributed-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid color-mix(in oklab, currentColor 45%, transparent);
  transition: color 180ms ease, border-color 180ms ease;
}

.beer-recipe__contributed-link:hover {
  color: var(--foreground);
  border-color: currentColor;
}

/* Narrow screens */
@media (max-width: 600px) {
  .beer-recipe__hero {
    min-height: 310px;
    padding: 22px 22px 34px;
    gap: 18px;
  }

  .beer-recipe__hero-title {
    font-size: clamp(46px, 15vw, 66px);
  }

  .beer-recipe__hero-image {
    width: 10rem;
    height: 16rem;
  }

  .beer-recipe__hero-tagline {
    font-size: 1.125rem;
  }

  .beer-recipe__body {
    padding: 26px 20px 32px;
  }

  .beer-recipe__grid--stats {
    gap: 6px;
    margin-top: -47px;
  }

  .beer-recipe__grid--stats > * {
    min-height: 74px;
    padding-inline: 6px;
  }

  .beer-recipe__pairing,
  .beer-recipe__tips {
    padding: 20px;
  }

  /* On narrow screens the middle column is narrower but stays centered */
  .beer-recipe__row--hop {
    grid-template-columns: minmax(0, 1fr) 7rem minmax(0, 1fr);
    column-gap: 10px;
  }
}
</style>
