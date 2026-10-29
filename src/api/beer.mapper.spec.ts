import { describe, expect, it } from "vitest"
import { toContributor, toTwistList } from "./beer.mapper"

describe("toTwistList", () => {
  describe("empty input", () => {
    it("returns an empty list for null", () => {
      expect(toTwistList(null)).toEqual([])
    })

    it("returns an empty list for undefined", () => {
      expect(toTwistList(undefined)).toEqual([])
    })

    it("returns an empty list for an empty string", () => {
      expect(toTwistList("")).toEqual([])
    })

    it("returns an empty list for a whitespace-only string", () => {
      expect(toTwistList("   ")).toEqual([])
    })
  })

  describe("single item", () => {
    it("keeps a value without commas as one item", () => {
      expect(toTwistList("Kettle Soured")).toEqual(["Kettle Soured"])
    })

    it("trims surrounding whitespace", () => {
      expect(toTwistList("  Kettle Soured  ")).toEqual(["Kettle Soured"])
    })

    it("keeps a trailing comma inside the only item", () => {
      expect(toTwistList("Lactose: 125g,")).toEqual(["Lactose: 125g,"])
    })
  })

  describe("separators: comma + whitespace + uppercase letter or digit", () => {
    it("splits an ingredient list", () => {
      expect(toTwistList("Strawberries: 1kg, Raspberries: 1kg, Oak Chips: 75g")).toEqual([
        "Strawberries: 1kg",
        "Raspberries: 1kg",
        "Oak Chips: 75g",
      ])
    })

    it("splits when the next item starts with a digit", () => {
      expect(toTwistList("2.5g chili powder in the boil, 1 whole chili in FV")).toEqual([
        "2.5g chili powder in the boil",
        "1 whole chili in FV",
      ])
    })

    it("splits after a sentence punctuation mark", () => {
      expect(toTwistList("Several dozen brewers!, Toasted oak chips: 75g at FV")).toEqual([
        "Several dozen brewers!",
        "Toasted oak chips: 75g at FV",
      ])
    })

    it("splits when the comma is followed by any whitespace", () => {
      expect(toTwistList("Oak chips,   Raspberries")).toEqual(["Oak chips", "Raspberries"])
      expect(toTwistList("Oak chips,\tRaspberries")).toEqual(["Oak chips", "Raspberries"])
      expect(toTwistList("Oak chips,\nRaspberries")).toEqual(["Oak chips", "Raspberries"])
      expect(toTwistList("Oak chips,\u00A0Raspberries")).toEqual(["Oak chips", "Raspberries"])
    })

    it("treats a capitalised continuation as a new item", () => {
      expect(toTwistList("Add hops, Then wait")).toEqual(["Add hops", "Then wait"])
    })

    it("splits a four-item list", () => {
      expect(
        toTwistList(
          "Cranberry: 25g at end, Jasmine: 25g at end, Muscovado sugar: 500g at start, Oak chips soaked in lowland whisky: 15g at dry hop",
        ),
      ).toEqual([
        "Cranberry: 25g at end",
        "Jasmine: 25g at end",
        "Muscovado sugar: 500g at start",
        "Oak chips soaked in lowland whisky: 15g at dry hop",
      ])
    })
  })

  describe("non-separators", () => {
    it("does not split when the next word is lowercase", () => {
      expect(toTwistList("Try ageing on oak chips, infusing with rum raisins, or vanilla pods")).toEqual([
        "Try ageing on oak chips, infusing with rum raisins, or vanilla pods",
      ])
    })

    it("does not split a comma inside a sentence", () => {
      expect(toTwistList("Part-aged in oak barrels, finished with champagne yeast")).toEqual([
        "Part-aged in oak barrels, finished with champagne yeast",
      ])
    })

    it("does not split when uppercase letters appear earlier in the sentence", () => {
      expect(toTwistList("Based on AB:04, but with added vanilla and 3.5 times the chili.")).toEqual([
        "Based on AB:04, but with added vanilla and 3.5 times the chili.",
      ])
    })

    it("does not split a comma without a following space", () => {
      expect(toTwistList("a,b")).toEqual(["a,b"])
    })

    it("does not split a decimal comma", () => {
      expect(toTwistList("2,5 g lactose")).toEqual(["2,5 g lactose"])
    })

    it("does not split when a non-ASCII word is lowercase", () => {
      expect(toTwistList("Мед: 100г, соль: 5г")).toEqual(["Мед: 100г, соль: 5г"])
    })
  })

  describe("item starts in any alphabet or numeral system", () => {
    it("splits on Cyrillic uppercase", () => {
      expect(toTwistList("Мед: 100г, Соль: 5г")).toEqual(["Мед: 100г", "Соль: 5г"])
    })

    it("splits on Greek uppercase", () => {
      expect(toTwistList("Σιρόπι: 100γ, Αλάτι: 5γ")).toEqual(["Σιρόπι: 100γ", "Αλάτι: 5γ"])
    })

    it("splits on accented and ligature uppercase", () => {
      expect(toTwistList("Œuvre: 1kg, Épices: 20g")).toEqual(["Œuvre: 1kg", "Épices: 20g"])
    })

    it("splits on uppercase letters with diacritics", () => {
      expect(toTwistList("Øl: 10l, Æbler: 5kg")).toEqual(["Øl: 10l", "Æbler: 5kg"])
    })

    it("splits on Arabic-Indic digits", () => {
      expect(toTwistList("Dextrose: 300g, ٢٠٠g Lactose")).toEqual(["Dextrose: 300g", "٢٠٠g Lactose"])
    })

    it("splits on Devanagari digits", () => {
      expect(toTwistList("Dextrose: 300g, २००g Lactose")).toEqual(["Dextrose: 300g", "२००g Lactose"])
    })

    it("splits on fullwidth digits", () => {
      expect(toTwistList("Dextrose: 300g, ２００g Lactose")).toEqual(["Dextrose: 300g", "２００g Lactose"])
    })

    it("splits on letter numbers and fractions", () => {
      expect(toTwistList("Oak chips: 75g, Ⅳ vanilla pods")).toEqual(["Oak chips: 75g", "Ⅳ vanilla pods"])
      expect(toTwistList("Honey: 100g, ½ vanilla pod")).toEqual(["Honey: 100g", "½ vanilla pod"])
    })
  })

  describe("real API values", () => {
    it("splits an ingredient from the following sentence", () => {
      expect(
        toTwistList(
          "Scottish Heather Honey: 62.5g at middle, Add honey during the boil. After fermentation, age in a Scottish whisky cask",
        ),
      ).toEqual([
        "Scottish Heather Honey: 62.5g at middle",
        "Add honey during the boil. After fermentation, age in a Scottish whisky cask",
      ])
    })

    it("keeps parenthesised names together with their amounts", () => {
      expect(toTwistList("Milk Sugars (Lactose): 400g FV, Sea Salt: 4g FV")).toEqual([
        "Milk Sugars (Lactose): 400g FV",
        "Sea Salt: 4g FV",
      ])
    })
  })
})

describe("toContributor", () => {
  describe("name and alias", () => {
    it("splits the name and the GitHub alias", () => {
      expect(toContributor("Alexander Ivanovsky <alxiw>")).toEqual({
        name: "Alexander Ivanovsky",
        alias: "alxiw",
      })
    })

    it("trims surrounding whitespace", () => {
      expect(toContributor("  Alexander Ivanovsky <alxiw>  ")).toEqual({
        name: "Alexander Ivanovsky",
        alias: "alxiw",
      })
    })

    it("trims whitespace around the name and the alias", () => {
      expect(toContributor("  Alexander   Ivanovsky   <  alxiw  >")).toEqual({
        name: "Alexander   Ivanovsky",
        alias: "alxiw",
      })
    })

    it("uses the alias as the name when the name part is empty", () => {
      expect(toContributor("<alxiw>")).toEqual({ name: "alxiw", alias: "alxiw" })
    })
  })

  describe("missing alias", () => {
    it("returns alias: null when there is no <alias> part", () => {
      expect(toContributor("Alexander Ivanovsky")).toEqual({
        name: "Alexander Ivanovsky",
        alias: null,
      })
    })

    it("returns alias: null for empty angle brackets", () => {
      expect(toContributor("Alexander Ivanovsky <>")).toEqual({
        name: "Alexander Ivanovsky",
        alias: null,
      })
    })

    it("returns alias: null for whitespace-only angle brackets", () => {
      expect(toContributor("Alexander Ivanovsky <   >")).toEqual({
        name: "Alexander Ivanovsky",
        alias: null,
      })
    })
  })
})
