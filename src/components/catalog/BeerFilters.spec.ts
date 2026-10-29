import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import BeerFilters from '@/components/catalog/BeerFilters.vue'
import type { BeerFilters as BeerFiltersState } from '@/types/beer'

/**
 * Accessibility contract for the catalog filters.
 *
 * The component is rendered to a string instead of a DOM: what a screen reader
 * receives is checked as-is. The panel is collapsed by default, so only the
 * always-visible controls are covered here.
 */
const filters: BeerFiltersState = {
  query: 'ipa',
  pairing: 'chocolate',
  ranges: {
    abvMin: '5',
    abvMax: '',
    ibuMin: '',
    ibuMax: '',
    ebcMin: '',
    ebcMax: '',
    dateFrom: '',
    dateTo: '',
  },
}

function renderFilters(): Promise<string> {
  return renderToString(createSSRApp({ render: () => h(BeerFilters, { filters }) }))
}

describe('BeerFilters accessibility', () => {
  it('exposes the search field as a landmark with a programmatic label', async () => {
    const html = await renderFilters()

    expect(html).toContain('role="search"')
    expect(html).toMatch(/<label class="sr-only" for="catalog-search"[^>]*>Search beer by name<\/label>/)
    expect(html).toMatch(/<input id="catalog-search"[^>]*type="search"/)
    expect(html).toContain('name="query"')
    expect(html).toContain('enterkeyhint="search"')
  })

  it('keeps the clear button out of the label', async () => {
    const html = await renderFilters()
    const label = html.match(/<label[^>]*>[\s\S]*?<\/label>/)?.[0] ?? ''

    expect(label).not.toContain('<button')
    expect(html).toContain('aria-label="Clear search"')
  })

  it('pairs the toggle with the panel it controls', async () => {
    const html = await renderFilters()

    expect(html).toContain('id="catalog-filters-toggle"')
    expect(html).toContain('aria-controls="catalog-filters"')
    expect(html).toContain('aria-expanded="false"')
    // Collapsed: the controlled panel is not in the tree yet
    expect(html).not.toContain('id="catalog-filters"')
  })

  it('spells the active filter count out instead of leaving bare digits', async () => {
    const html = await renderFilters()

    // Two non-empty fields: pairing and the lower ABV bound. The query is separate.
    expect(html).toMatch(/<span class="filter-badge" aria-hidden="true"[^>]*>2<\/span>/)
    expect(html).toMatch(/<span class="sr-only"[^>]*>, 2 active<\/span>/)
    expect(html).not.toContain('>Filters 2<')
  })

  it('hides decorative icons from the accessibility tree', async () => {
    const html = await renderFilters()
    const icons = html.match(/<svg[^>]*class="lucide[^"]*"[^>]*>/g) ?? []

    expect(icons.length).toBeGreaterThan(0)
    expect(icons.every((icon) => icon.includes('aria-hidden="true"'))).toBe(true)
  })
})
