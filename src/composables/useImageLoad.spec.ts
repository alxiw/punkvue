import { describe, expect, it } from "vitest"
import { nextTick, ref } from "vue"
import { useImageLoad } from "./useImageLoad"

describe("useImageLoad", () => {
  describe("initial state", () => {
    it("shows the image right away when the URL is known", () => {
      const { showImage, imageLoaded, imageFailed } = useImageLoad(() => "bottle.png")

      expect(showImage.value).toBe(true)
      expect(imageLoaded.value).toBe(false)
      expect(imageFailed.value).toBe(false)
    })

    it("hides the image when there is no URL", () => {
      const { showImage } = useImageLoad(() => null)

      expect(showImage.value).toBe(false)
    })

    it("treats an empty URL as missing", () => {
      const { showImage } = useImageLoad(() => "")

      expect(showImage.value).toBe(false)
    })
  })

  describe("image events", () => {
    it("marks the image as loaded", () => {
      const { imageLoaded, onImageLoad } = useImageLoad(() => "bottle.png")

      onImageLoad()

      expect(imageLoaded.value).toBe(true)
    })

    it("hides the image after a load error", () => {
      const { showImage, imageFailed, onImageError } = useImageLoad(() => "bottle.png")

      onImageError()

      expect(imageFailed.value).toBe(true)
      expect(showImage.value).toBe(false)
    })
  })

  describe("URL change", () => {
    it("clears the failed flag for the next picture", async () => {
      const url = ref("first.png")
      const { showImage, imageFailed, onImageError } = useImageLoad(() => url.value)
      onImageError()

      url.value = "second.png"
      await nextTick()

      expect(imageFailed.value).toBe(false)
      expect(showImage.value).toBe(true)
    })

    it("waits for the new picture to load", async () => {
      const url = ref("first.png")
      const { imageLoaded, onImageLoad } = useImageLoad(() => url.value)
      onImageLoad()

      url.value = "second.png"
      await nextTick()

      expect(imageLoaded.value).toBe(false)
    })

    it("keeps the loaded state while the URL is unchanged", async () => {
      const url = ref("first.png")
      const { imageLoaded, onImageLoad } = useImageLoad(() => url.value)
      onImageLoad()

      url.value = "first.png"
      await nextTick()

      expect(imageLoaded.value).toBe(true)
    })

    it("follows a beer that lost its picture", async () => {
      const url = ref<string | null>("first.png")
      const { showImage } = useImageLoad(() => url.value)

      url.value = null
      await nextTick()

      expect(showImage.value).toBe(false)
    })
  })
})
