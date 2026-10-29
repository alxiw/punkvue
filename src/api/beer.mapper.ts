import type { Beer, Contributor, Ingredients, Method } from "@/types/beer"
import type { BeerDto, IngredientsDto, MeasureDto, MethodDto } from "./beer.dto"
import { API_BASE_URL } from "./client"

/** API image file name → absolute URL; empty string when there is no image */
function toImageUrl(image: string | null): string {
  return image ? `${API_BASE_URL}/images/${image}` : ""
}

function toAbvText(value: number | null): string {
  return value != null ? `${value}%` : ""
}

function toStringOrDefault(value: number | null): string {
  return value != null ? value.toString() : ""
}

/** API units → short UI labels */
const UNIT_LABELS: Record<string, string> = {
  grams: "g",
  kilograms: "kg",
  litres: "L",
  celsius: "°C"
}

function toMeasureText(measure: MeasureDto | null | undefined): string {
  if (!measure || measure.value == null) return ""
  const unit = UNIT_LABELS[measure.unit] ?? measure.unit
  return `${measure.value}${unit}`
}

/**
 * API twist string → list of separate tweaks.
 * Splitting is strict: only a comma followed by whitespace and a new item start
 * (an uppercase letter in any alphabet or a number in any numeral system) is a
 * separator, so commas inside a sentence are kept:
 * "Try ageing on oak chips, infusing with rum raisins" → one item,
 * "Lactose: 125g, Sour cherries: 187.5g" → two items.
 */
export function toTwistList(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(/,\s+(?=[\p{Lu}\p{N}])/u)
    .map((part) => part.trim())
    .filter(Boolean)
}

function mapMethod(method: MethodDto | null | undefined): Method {
  return {
    mashTemp: (method?.mash_temp ?? []).map((m) => ({
      temp: toMeasureText(m.temp),
      duration: m.duration,
    })),
    fermentation: {
      temp: toMeasureText(method?.fermentation.temp),
    },
    twist: toTwistList(method?.twist),
  }
}

function mapIngredients(ingredients: IngredientsDto | null | undefined): Ingredients {
  return {
    malt: (ingredients?.malt ?? []).map((m) => ({
      name: m.name,
      amount: toMeasureText(m.amount),
    })),
    hops: (ingredients?.hops ?? []).map((h) => ({
      name: h.name,
      amount: toMeasureText(h.amount),
      add: h.add,
      attribute: h.attribute,
    })),
    yeast: ingredients?.yeast ?? null,
  }
}

/**
 * API contributor string → name and GitHub alias:
 * "Alexander Ivanovsky <alxiw>" → { name: "Alexander Ivanovsky", alias: "alxiw" }.
 * The API always sends a non-empty string, so the contributor is never null;
 * missing or empty <...> → alias: null, the whole string stays the name.
 */
export function toContributor(value: string): Contributor {
  const raw = value.trim()

  const match = /^(.*?)\s*<([^<>]*)>$/.exec(raw)
  if (!match) return { name: raw, alias: null }

  const name = match[1].trim()
  const alias = match[2].trim()
  return { name: name || alias, alias: alias || null }
}

/** Maps the backend DTO to the app domain model: snake_case → camelCase, numbers → strings with units. */
export function mapApiBeerToInternal(apiBeer: BeerDto): Beer {
  return {
    id: apiBeer.id,
    name: apiBeer.name,
    tagline: apiBeer.tagline,
    firstBrewed: apiBeer.first_brewed,
    description: apiBeer.description,
    imageUrl: toImageUrl(apiBeer.image),
    abv: toAbvText(apiBeer.abv),
    ibu: toStringOrDefault(apiBeer.ibu),
    targetOg: toStringOrDefault(apiBeer.target_og),
    targetFg: toStringOrDefault(apiBeer.target_fg),
    ebc: toStringOrDefault(apiBeer.ebc),
    srm: toStringOrDefault(apiBeer.srm),
    ph: toStringOrDefault(apiBeer.ph),
    attenuationLevel: toStringOrDefault(apiBeer.attenuation_level),
    volume: toMeasureText(apiBeer.volume),
    boilVolume: toMeasureText(apiBeer.boil_volume),
    method: mapMethod(apiBeer.method),
    ingredients: mapIngredients(apiBeer.ingredients),
    foodPairing: apiBeer.food_pairing,
    brewersTips: apiBeer.brewers_tips,
    contributedBy: toContributor(apiBeer.contributed_by),
  }
}
