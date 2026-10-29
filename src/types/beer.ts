export type Beer = {
  id: number
  name: string
  tagline: string
  firstBrewed: string
  description: string
  imageUrl: string
  abv: string
  ibu: string
  targetOg: string
  targetFg: string
  ebc: string
  srm: string
  ph: string
  attenuationLevel: string
  volume: string
  boilVolume: string
  method: Method
  ingredients: Ingredients
  foodPairing: string[]
  brewersTips: string
  contributedBy: Contributor
}

/** Recipe author, parsed from the API "Full Name <alias>" string */
export type Contributor = {
  name: string
  /** GitHub login without "@"; null when the API value has no <alias> part */
  alias: string | null
}

/** Catalog filter form state */
export type BeerFilters = {
  /** Name search */
  query: string
  /** Food pairing search */
  pairing: string
  /** Numeric and date ranges */
  ranges: BeerRanges
}

/** Catalog filter ranges as raw form field values */
export type BeerRanges = {
  abvMin: string
  abvMax: string
  ibuMin: string
  ibuMax: string
  ebcMin: string
  ebcMax: string
  dateFrom: string
  dateTo: string
}

export type Method = {
  mashTemp: MashTemp[]
  fermentation: Fermentation
  twist: string[]
}

export type MashTemp = {
  temp: string
  duration: number | null
}

export type Fermentation = {
  temp: string
}

export type Ingredients = {
  malt: Malt[]
  hops: Hop[]
  yeast: string | null
}

export type Malt = {
  name: string
  amount: string
}

export type Hop = {
  name: string
  amount: string
  add: string
  attribute: string | null
}
