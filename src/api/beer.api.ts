import type { Beer, BeerRanges } from "@/types/beer"
import type { BeerDto } from "./beer.dto"
import { apiClient } from "./client"
import { mapApiBeerToInternal } from "./beer.mapper"

/** Beer catalog request params */
export type BeerFilterParams = Partial<BeerRanges> & {
  /** Search by name */
  query?: string
  /** Search by food pairing */
  pairing?: string
  page?: number
  perPage?: number
}

/** PunkAPI query params in snake_case — exactly what goes over the wire */
export type BeerQueryParams = {
  page: string
  per_page: string
  beer_name?: string
  food?: string
  abv_gt?: string
  abv_lt?: string
  ibu_gt?: string
  ibu_lt?: string
  ebc_gt?: string
  ebc_lt?: string
  brewed_after?: string
  brewed_before?: string
}

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 30

/**
 * Total beers in the PunkAPI collection. Neither the body nor the headers
 * expose it (the last page at `per_page=30` is the 14th one with 25 beers: 13 × 30 + 25 = 415),
 * so it is hardcoded here.
 */
export const TOTAL_BEERS = 415

/**
 * PunkAPI matches `beer_name` and `food` by substring where a space separates words:
 * "no label" matches "No Label", while "no label " or "no  label" match nothing.
 * So the term is trimmed, inner space runs are collapsed and the words are joined
 * with "_" — the API reads it exactly like one space, and the URL stays readable
 * instead of getting a "+" for every space from axios.
 */
export function toApiSearchTerm(value: string): string {
  return value.trim().split(/\s+/).join("_")
}

/** "2020-05-01" (date input value) → "05-2020" (PunkAPI format) */
function toBrewedDate(value: string): string {
  const [year, month] = value.split("-")
  return `${month}-${year}`
}

/** Builds PunkAPI query params from catalog filter params */
export function buildBeerQuery(params: BeerFilterParams): BeerQueryParams {
  const query: BeerQueryParams = {
    page: String(params.page ?? DEFAULT_PAGE),
    per_page: String(params.perPage ?? DEFAULT_PER_PAGE),
  }

  // Whitespace-only input must not become a filter: it matches nothing
  const name = toApiSearchTerm(params.query ?? "")
  if (name) query.beer_name = name

  const food = toApiSearchTerm(params.pairing ?? "")
  if (food) query.food = food

  if (params.abvMin) query.abv_gt = params.abvMin
  if (params.abvMax) query.abv_lt = params.abvMax

  if (params.ibuMin) query.ibu_gt = params.ibuMin
  if (params.ibuMax) query.ibu_lt = params.ibuMax

  if (params.ebcMin) query.ebc_gt = params.ebcMin
  if (params.ebcMax) query.ebc_lt = params.ebcMax

  if (params.dateFrom) query.brewed_after = toBrewedDate(params.dateFrom)
  if (params.dateTo) query.brewed_before = toBrewedDate(params.dateTo)

  return query
}

export async function fetchBeers(
  params: BeerFilterParams = {},
  signal?: AbortSignal
): Promise<Beer[]> {
  const response = await apiClient.get<BeerDto[]>("/beers", {
    params: buildBeerQuery(params),
    signal,
  })

  const data = response.data
  if (!Array.isArray(data)) return []
  return data.map(mapApiBeerToInternal)
}

export async function fetchRandomBeer(signal?: AbortSignal): Promise<Beer> {
  const response = await apiClient.get<BeerDto | BeerDto[]>("/beers/random", { signal })
  return mapApiBeerToInternal(extractBeer(response.data))
}

/** Single beer by position in the collection (1…TOTAL_BEERS) */
export async function fetchBeerById(
  id: number,
  signal?: AbortSignal
): Promise<Beer> {
  const response = await apiClient.get<BeerDto | BeerDto[]>(`/beers/${id}`, { signal })
  return mapApiBeerToInternal(extractBeer(response.data))
}

/** API may return either an array or a single object: normalize to one beer and throw on empty. */
function extractBeer(data: BeerDto | BeerDto[]): BeerDto {
  const beer = Array.isArray(data) ? data[0] : data
  if (!beer) throw new Error("PunkAPI returned an empty response")
  return beer
}
