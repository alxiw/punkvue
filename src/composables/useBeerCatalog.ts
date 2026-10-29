import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { Beer, BeerFilters, BeerRanges } from '@/types/beer'
import { fetchBeers, toApiSearchTerm } from '@/api/beer.api'
import { useInfiniteScroll } from './useInfiniteScroll'

/** Empty filter range defaults */
const EMPTY_RANGES: BeerRanges = {
  abvMin: "",
  abvMax: "",
  ibuMin: "",
  ibuMax: "",
  ebcMin: "",
  ebcMax: "",
  dateFrom: "",
  dateTo: "",
}

/** Delay between the last keystroke and the API request */
const SEARCH_DEBOUNCE_MS = 350

/** Number of beers requested per page */
const PER_PAGE = 30

function createInitialFilters(): BeerFilters {
  return {
    query: "",
    pairing: "",
    ranges: { ...EMPTY_RANGES },
  }
}

function getFiltersSnapshot(f: BeerFilters): string {
  return JSON.stringify({
    // Canonical form of the outgoing request: equal snapshots must produce equal
    // requests, otherwise the list keeps the results of a request that is no
    // longer relevant (e.g. "no label " with a trailing space returns nothing)
    query: toApiSearchTerm(f.query).toLowerCase(),
    pairing: toApiSearchTerm(f.pairing).toLowerCase(),
    ranges: {
      abvMin: String(f.ranges.abvMin).trim(),
      abvMax: String(f.ranges.abvMax).trim(),
      ibuMin: String(f.ranges.ibuMin).trim(),
      ibuMax: String(f.ranges.ibuMax).trim(),
      ebcMin: String(f.ranges.ebcMin).trim(),
      ebcMax: String(f.ranges.ebcMax).trim(),
      dateFrom: String(f.ranges.dateFrom).trim(),
      dateTo: String(f.ranges.dateTo).trim(),
    }
  })
}

/** Catalog state: filters, beer list, pagination, search debouncing, and stale request cancellation */
export function useBeerCatalog() {
  const filters = ref<BeerFilters>(createInitialFilters())

  const beers = ref<Beer[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const page = ref(1)

  const loadMoreTrigger = ref<HTMLElement | null>(null)

  let searchTimer: ReturnType<typeof setTimeout> | null = null
  let activeRequest: AbortController | null = null
  /** Latest request ID: responses from superseded requests are discarded */
  let requestSeq = 0

  function cancelActiveRequest() {
    activeRequest?.abort()
    activeRequest = null
  }

  function cancelScheduledSearch() {
    if (!searchTimer) return
    clearTimeout(searchTimer)
    searchTimer = null
  }

  async function loadBeers(reset = false) {
    // Abort pending request so stale data does not overwrite fresh results
    cancelActiveRequest()
    const controller = new AbortController()
    activeRequest = controller
    const requestId = ++requestSeq
    const requestedPage = reset ? 1 : page.value

    if (reset) {
      page.value = 1
      beers.value = []
      hasMore.value = true
      loading.value = true
    } else {
      loadingMore.value = true
    }

    try {
      const results = await fetchBeers({
        page: requestedPage,
        perPage: PER_PAGE,
        query: filters.value.query,
        pairing: filters.value.pairing,
        ...filters.value.ranges,
      }, controller.signal)

      // Discard results if filters changed while request was in flight
      if (requestId !== requestSeq) return

      hasMore.value = results.length >= PER_PAGE

      if (reset) {
        beers.value = results
      } else {
        beers.value.push(...results)
      }
    } catch (err) {
      if (controller.signal.aborted) return
      console.error(err)
    } finally {
      if (requestId === requestSeq) {
        activeRequest = null
        loading.value = false
        loadingMore.value = false
      }
    }
  }

  function scheduleSearch() {
    cancelScheduledSearch()

    searchTimer = setTimeout(() => {
      searchTimer = null
      void loadBeers(true)
    }, SEARCH_DEBOUNCE_MS)
  }

  function loadMore() {
    if (!hasMore.value || loading.value || loadingMore.value) return
    page.value += 1
    void loadBeers()
  }

  /** Resets advanced filters while keeping search query intact */
  function resetFilters() {
    filters.value = {
      ...filters.value,
      pairing: "",
      ranges: { ...EMPTY_RANGES },
    }
  }

  /** Clears both search query and all advanced filters */
  function resetAll() {
    filters.value = createInitialFilters()
  }

  watch(
      () => getFiltersSnapshot(filters.value),
      (newSnapshot, oldSnapshot) => {
        // Guard against redundant runs on initial load
        if (newSnapshot === oldSnapshot) return

        scheduleSearch()
      }
  )

  useInfiniteScroll(loadMoreTrigger, {
    onLoad: loadMore,
    // Prevent fetching while loading or while search debounce is pending
    enabled: () => hasMore.value && !loading.value && !loadingMore.value && searchTimer === null,
  })

  onMounted(() => {
    void loadBeers(true)
  })

  onUnmounted(() => {
    cancelScheduledSearch()
    cancelActiveRequest()
  })

  return {
    filters,
    beers,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    loadMoreTrigger,
    resetFilters,
    resetAll,
  }
}
