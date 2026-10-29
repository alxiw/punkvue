/** Value with a unit of measure (volume, boil_volume, amount, temp) */
export type MeasureDto = {
  value: number
  unit: string
}

export type MashTempDto = {
  temp: MeasureDto | null
  duration: number | null
}

export type MethodDto = {
  mash_temp: MashTempDto[]
  fermentation: {
    temp: MeasureDto | null
  }
  twist: string | null
}

export type MaltDto = {
  name: string
  amount: MeasureDto
}

export type HopDto = {
  name: string
  amount: MeasureDto
  add: string
  attribute: string | null
}

export type IngredientsDto = {
  malt: MaltDto[]
  hops: HopDto[]
  yeast: string | null
}

/** Beer as returned by PunkAPI; mirrors the API snake_case shape and is used only for mapping to the `Beer` domain model. */
export type BeerDto = {
  id: number
  name: string
  tagline: string
  first_brewed: string
  description: string
  /** Image file name, e.g. "366.png" */
  image: string
  abv: number
  ibu: number | null
  target_fg: number | null
  target_og: number | null
  ebc: number | null
  srm: number | null
  ph: number | null
  attenuation_level: number | null
  volume: MeasureDto
  boil_volume: MeasureDto
  method: MethodDto
  ingredients: IngredientsDto
  food_pairing: string[]
  brewers_tips: string
  /** Always a non-empty "Full Name <alias>" string, e.g. "Alexander Ivanovsky <alxiw>" */
  contributed_by: string
}
