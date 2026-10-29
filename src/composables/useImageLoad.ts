import { computed, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Load state of a beer picture: while the image is loading a skeleton
 * stays in its place, and after a load error the component shows its
 * icon placeholder instead.
 *
 * The URL is passed as a getter, so the state resets whenever it changes.
 */
export function useImageLoad(url: MaybeRefOrGetter<string | null | undefined>) {
  /** The image has not loaded yet — keep the skeleton in its place */
  const imageLoaded = ref(false)

  /** The URL is broken (or missing) — show the icon placeholder instead */
  const imageFailed = ref(false)

  /** An image is expected and it has not failed yet */
  const showImage = computed(() => Boolean(toValue(url)) && !imageFailed.value)

  // A new beer brings a new picture: wait for its own load event
  watch(
    () => toValue(url),
    () => {
      imageLoaded.value = false
      imageFailed.value = false
    },
  )

  function onImageLoad() {
    imageLoaded.value = true
  }

  function onImageError() {
    imageFailed.value = true
  }

  return {
    imageLoaded,
    imageFailed,
    showImage,
    onImageLoad,
    onImageError,
  }
}
