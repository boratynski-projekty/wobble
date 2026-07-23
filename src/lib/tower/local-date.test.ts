import { describe, expect, it } from "vitest";
import { localDateFor } from "./local-date";

describe("localDateFor", () => {
  it("zwraca format YYYY-MM-DD", () => {
    expect(
      localDateFor("Europe/Warsaw", new Date("2026-07-24T12:00:00Z")),
    ).toBe("2026-07-24");
  });

  it("późny wieczór w Warszawie to wciąż ten sam dzień, nie jutro w UTC", () => {
    // 23:30 czasu warszawskiego = 21:30 UTC — użytkownik planujący wieczorem
    // musi dostać wieżę na dziś.
    expect(
      localDateFor("Europe/Warsaw", new Date("2026-07-24T21:30:00Z")),
    ).toBe("2026-07-24");
  });

  it("po północy lokalnie to już nowy dzień, mimo że w UTC jeszcze nie", () => {
    // 00:30 w Warszawie = 22:30 UTC poprzedniego dnia.
    expect(
      localDateFor("Europe/Warsaw", new Date("2026-07-24T22:30:00Z")),
    ).toBe("2026-07-25");
  });

  it("respektuje strefy za UTC", () => {
    expect(
      localDateFor("America/Los_Angeles", new Date("2026-07-24T05:00:00Z")),
    ).toBe("2026-07-23");
  });

  it("nieznana strefa nie wywala ekranu — wpada na UTC", () => {
    expect(localDateFor("Nie/Istnieje", new Date("2026-07-24T12:00:00Z"))).toBe(
      "2026-07-24",
    );
  });
});
