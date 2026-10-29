import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Beer } from '@/types/beer'
import { fetchBeerById, TOTAL_BEERS } from '@/api/beer.api'

/** Whether the id exists in the collection */
function isValidBeerId(id: number): boolean {
  return id >= 1 && id <= TOTAL_BEERS
}

/**
 * Recipe page state: selected beer, open flag and 404 handling.
 *
 * The URL is the source of truth: `/366` opens the recipe, `/` closes it. Clicking
 * a list item or banner already puts the beer into state, so a request is only
 * sent on direct link visits (including reloads).
 *
 * Called in `App.vue` setup rather than `onMounted`: the `immediate` watcher must
 * see an already resolved route (`router.isReady()` in main.ts).
 */
export function useBeerRecipe() {
  const route = useRoute()
  const router = useRouter()

  const beer = ref<Beer | null>(null)
  const isOpen = ref<boolean>(false)
  /** Linked beer failed to load: show 404, keep the URL as is */
  const loadFailed = ref<boolean>(false)

  /** Beer id from the URL (`/366`); null when another screen is open */
  const routeBeerId = computed<number | null>(() => {
    if (route.name !== 'beer') return null
    const id = Number(route.params.id)
    return Number.isInteger(id) ? id : null
  })

  /** Full-screen 404: unknown route, id outside 1–415, or a beer the API didn't return */
  const isNotFound = computed(() => {
    if (route.name === 'not-found') return true
    if (routeBeerId.value === null) return false
    return !isValidBeerId(routeBeerId.value) || loadFailed.value
  })

  let activeRequest: AbortController | null = null
  /** Latest request id: responses from stale requests are ignored */
  let requestSeq = 0

  /**
   * Resets the recipe page state but keeps the last loaded beer,
   * so the recipe sheet doesn't go empty during the closing animation.
   */
  function hideRecipe() {
    activeRequest?.abort()
    activeRequest = null
    requestSeq += 1
    isOpen.value = false
    loadFailed.value = false
  }

  /** Loads the beer by the id from the URL (direct link visit) */
  async function loadBeer(id: number) {
    activeRequest?.abort()
    const controller = new AbortController()
    activeRequest = controller
    const requestId = ++requestSeq

    loadFailed.value = false

    try {
      const loadedBeer = await fetchBeerById(id, controller.signal)

      // The user may have navigated away while the request was in flight
      if (requestId !== requestSeq) return

      beer.value = loadedBeer
      isOpen.value = true
    } catch (err) {
      if (controller.signal.aborted || requestId !== requestSeq) return
      console.error(err)
      loadFailed.value = true
    } finally {
      if (requestId === requestSeq) activeRequest = null
    }
  }

  watch(
    routeBeerId,
    (id) => {
      if (id === null || !isValidBeerId(id)) {
        hideRecipe()
        return
      }

      loadFailed.value = false

      if (beer.value?.id === id) {
        isOpen.value = true
        return
      }

      void loadBeer(id)
    },
    { immediate: true },
  )

  function openBeer(nextBeer: Beer) {
    // Data is already at hand: the recipe opens without waiting for the API
    beer.value = nextBeer

    if (routeBeerId.value === nextBeer.id) {
      isOpen.value = true
      return
    }

    void router.push({ name: 'beer', params: { id: nextBeer.id } })
  }

  /** X, Esc and backdrop click close the page and return to the catalog */
  function closeBeer() {
    // Going back only makes sense if the recipe was opened from the catalog,
    // not visited via a direct link
    const canGoBack = Boolean(router.options.history.state.back)

    isOpen.value = false

    if (canGoBack) {
      router.back()
      return
    }

    // Direct link visit: replace the entry so Back doesn't return to the recipe
    void router.replace({ name: 'home' })
  }

  function setOpen(value: boolean) {
    if (value) {
      isOpen.value = true
      return
    }

    closeBeer()
  }

  return {
    beer,
    isOpen,
    isNotFound,
    openBeer,
    setOpen,
  }
}
