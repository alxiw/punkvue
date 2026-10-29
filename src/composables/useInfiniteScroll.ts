import { onBeforeUnmount, watch, type Ref } from 'vue'

export type UseInfiniteScrollOptions = {
  /** Called when the sentinel enters the viewport */
  onLoad: () => void
  /** Guards next fetch: checks available pages, active requests, and pending search debounce */
  enabled?: () => boolean
  /** Pre-fetch threshold distance in pixels */
  rootMargin?: string
}

/** IntersectionObserver utility that triggers onLoad when the sentinel becomes visible */
export function useInfiniteScroll(
  target: Ref<HTMLElement | null>,
  { onLoad, enabled = () => true, rootMargin = '200px' }: UseInfiniteScrollOptions
) {
  let observer: IntersectionObserver | null = null

  function stop() {
    observer?.disconnect()
    observer = null
  }

  watch(
    target,
    (el) => {
      // DOM node might be remounted on list reset — recreate observer
      stop()

      if (!el) return

      observer = new IntersectionObserver(
        (entries) => {
          const isVisible = entries.some((entry) => entry.isIntersecting)
          if (!isVisible || !enabled()) return
          onLoad()
        },
        { rootMargin }
      )

      observer.observe(el)
    },
    { immediate: true }
  )

  onBeforeUnmount(stop)

  return { stop }
}
