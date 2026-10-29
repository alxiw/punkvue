import { describe, expect, it } from "vitest"
import { buildBeerQuery, toApiSearchTerm } from "./beer.api"

describe("toApiSearchTerm", () => {
  describe("word separator", () => {
    it("joins words with an underscore", () => {
      expect(toApiSearchTerm("no label")).toBe("no_label")
    })

    it("joins every word of a longer name", () => {
      expect(toApiSearchTerm("dead pony club")).toBe("dead_pony_club")
    })

    it("keeps a single word as is", () => {
      expect(toApiSearchTerm("ipa")).toBe("ipa")
    })

    it("keeps the case of the term", () => {
      expect(toApiSearchTerm("No Label")).toBe("No_Label")
    })
  })

  describe("whitespace", () => {
    it("trims surrounding whitespace", () => {
      expect(toApiSearchTerm("  no label  ")).toBe("no_label")
    })

    it("collapses inner whitespace runs", () => {
      expect(toApiSearchTerm("no   label")).toBe("no_label")
    })

    it("collapses tabs and line breaks", () => {
      expect(toApiSearchTerm("no\t\tlabel")).toBe("no_label")
      expect(toApiSearchTerm("no\nlabel")).toBe("no_label")
    })

    it("collapses non-breaking spaces", () => {
      expect(toApiSearchTerm("no\u00A0label")).toBe("no_label")
    })

    it("returns an empty string for an empty term", () => {
      expect(toApiSearchTerm("")).toBe("")
    })

    it("returns an empty string for a whitespace-only term", () => {
      expect(toApiSearchTerm("   \t\n ")).toBe("")
    })
  })
})

describe("buildBeerQuery", () => {
  describe("pagination", () => {
    it("falls back to the first page with the default page size", () => {
      expect(buildBeerQuery({})).toEqual({ page: "1", per_page: "30" })
    })

    it("serializes page and per_page as strings", () => {
      expect(buildBeerQuery({ page: 3, perPage: 10 })).toEqual({ page: "3", per_page: "10" })
    })
  })

  describe("name search", () => {
    it("sends the term without spaces, so no \"+\" ends up in the URL", () => {
      expect(buildBeerQuery({ query: "no label" }).beer_name).toBe("no_label")
    })

    it("trims the term: a trailing space would match nothing", () => {
      expect(buildBeerQuery({ query: "no label " }).beer_name).toBe("no_label")
      expect(buildBeerQuery({ query: " no  label " }).beer_name).toBe("no_label")
    })

    it("omits the parameter for an empty or whitespace-only term", () => {
      expect(buildBeerQuery({ query: "" })).not.toHaveProperty("beer_name")
      expect(buildBeerQuery({ query: "   " })).not.toHaveProperty("beer_name")
    })
  })

  describe("food pairing search", () => {
    it("sends the pairing as the `food` parameter without spaces", () => {
      expect(buildBeerQuery({ pairing: " blue  cheese " }).food).toBe("blue_cheese")
    })

    it("omits the parameter for a whitespace-only pairing", () => {
      expect(buildBeerQuery({ pairing: "  " })).not.toHaveProperty("food")
    })
  })

  describe("ranges", () => {
    it("maps numeric bounds to snake_case greater-than / less-than params", () => {
      expect(
        buildBeerQuery({
          abvMin: "5",
          abvMax: "10",
          ibuMin: "20",
          ibuMax: "60",
          ebcMin: "10",
          ebcMax: "40",
        }),
      ).toEqual({
        page: "1",
        per_page: "30",
        abv_gt: "5",
        abv_lt: "10",
        ibu_gt: "20",
        ibu_lt: "60",
        ebc_gt: "10",
        ebc_lt: "40",
      })
    })

    it("omits empty bounds", () => {
      expect(buildBeerQuery({ abvMin: "", ibuMax: "", ebcMax: "" })).toEqual({
        page: "1",
        per_page: "30",
      })
    })

    it("converts date input values to the PunkAPI month-year format", () => {
      expect(buildBeerQuery({ dateFrom: "2007-05-01", dateTo: "2020-12-31" })).toEqual({
        page: "1",
        per_page: "30",
        brewed_after: "05-2007",
        brewed_before: "12-2020",
      })
    })
  })
})
