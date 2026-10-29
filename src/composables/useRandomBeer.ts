import { onMounted, onUnmounted, ref } from 'vue'
import type { Beer } from '@/types/beer'
import { fetchRandomBeer } from '@/api/beer.api'

/** Do not show the skeleton immediately — only if the request takes longer */
const SKELETON_DELAY_MS = 200

/** Once displayed, keep the skeleton visible for at least this duration */
const SKELETON_MIN_VISIBLE_MS = 350

/** Random beer banner hook: loads on mount, supports re-fetching, and cancels stale requests */
export function useRandomBeer() {
  const beer = ref<Beer | null>(null)
  const loading = ref(false)
  const error = ref(false)
  const showSkeleton = ref(false)

  let activeRequest: AbortController | null = null
  /** Identifier of the latest request: responses from stale requests are ignored */
  let requestSeq = 0

  let skeletonDelayTimer: ReturnType<typeof setTimeout> | null = null
  let skeletonHideTimer: ReturnType<typeof setTimeout> | null = null
  /** Timestamp when the skeleton was displayed: used to enforce minimum visible time */
  let skeletonShownAt = 0

  function cancelActiveRequest() {
    activeRequest?.abort()
    activeRequest = null
  }

  function clearSkeletonDelay() {
    if (!skeletonDelayTimer) return
    clearTimeout(skeletonDelayTimer)
    skeletonDelayTimer = null
  }

  function clearSkeletonHide() {
    if (!skeletonHideTimer) return
    clearTimeout(skeletonHideTimer)
    skeletonHideTimer = null
  }

  /** Shows skeleton if the request exceeds SKELETON_DELAY_MS: prevents flicker on fast responses */
  function scheduleSkeleton(requestId: number) {
    clearSkeletonDelay()

    // Skeleton is already visible from a previous roll — do not restart the delay
    if (showSkeleton.value) return

    skeletonDelayTimer = setTimeout(() => {
      skeletonDelayTimer = null
      if (requestId !== requestSeq || !loading.value) return

      // Error yields to the skeleton only once it actually appear
      error.value = false
      showSkeleton.value = true
      skeletonShownAt = Date.now()
    }, SKELETON_DELAY_MS)
  }

  /** Hides the skeleton while respecting the minimum display duration */
  function hideSkeleton(requestId: number) {
    clearSkeletonDelay()

    if (!showSkeleton.value) return

    const remaining = SKELETON_MIN_VISIBLE_MS - (Date.now() - skeletonShownAt)

    if (remaining <= 0) {
      showSkeleton.value = false
      return
    }

    clearSkeletonHide()
    skeletonHideTimer = setTimeout(() => {
      skeletonHideTimer = null
      if (requestId !== requestSeq) return
      showSkeleton.value = false
    }, remaining)
  }

  async function shuffle() {
    // Consecutive clicks cancel the preceding in-flight request
    cancelActiveRequest()
    clearSkeletonHide()
    const controller = new AbortController()
    activeRequest = controller
    const requestId = ++requestSeq

    loading.value = true
    // Keep error untouched: on retry from error state,
    // it remains visible until skeleton appears or request succeeds
    scheduleSkeleton(requestId)

    try {
      const result = await fetchRandomBeer(controller.signal)

      // If user re-triggered request in-flight, discard stale response data
      if (requestId !== requestSeq) return

      beer.value = result
      error.value = false
    } catch (err) {
      if (controller.signal.aborted || requestId !== requestSeq) return
      console.error(err)
      beer.value = null
      error.value = true
    } finally {
      if (requestId === requestSeq) {
        activeRequest = null
        loading.value = false
        hideSkeleton(requestId)
      }
    }
  }

  onMounted(() => {
    void shuffle()
  })

  onUnmounted(() => {
    cancelActiveRequest()
    clearSkeletonDelay()
    clearSkeletonHide()
  })

  return {
    beer,
    loading,
    error,
    showSkeleton,
    shuffle,
  }
}
