import { describe, expect, it } from "vitest";
import {
  calculateDemand,
  calculateFounderScore,
  seededUnit,
  simulateRivalDay,
} from "./engine";
import { serializeSave, unwrapSave } from "./save";
import {
  CAMPAIGN_MISSIONS,
  chapterUnlocked,
  missionProgress,
} from "./campaign";

describe("deterministic simulation engine", () => {
  it("returns the same seeded value for identical inputs", () => {
    expect(seededUnit(2026, 4, 9)).toBe(seededUnit(2026, 4, 9));
    expect(seededUnit(2026, 4, 9)).not.toBe(seededUnit(2026, 4, 10));
  });

  it("raises demand when weather, economy and heat improve", () => {
    expect(calculateDemand(1.08, 1.14, 75)).toBeGreaterThan(
      calculateDemand(0.72, 0.82, 35),
    );
  });

  it("scores stronger founder outcomes more highly", () => {
    const base = {
      cash: 1000,
      reputation: 50,
      served: 5,
      competitorShares: [30, 30],
      storyDecisions: 0,
      locations: 1,
      socialCapital: 0,
      leaguePoints: 0,
    };
    expect(
      calculateFounderScore({ ...base, cash: 5000, served: 20 }),
    ).toBeGreaterThan(calculateFounderScore(base));
  });

  it("caps rival expansion at five locations", () => {
    const rival = {
      id: "r",
      strategy: "Expansion",
      cash: 1000,
      reputation: 50,
      locations: 5,
      score: 2000,
      relationship: 0,
      momentum: 5,
    };
    expect(simulateRivalDay([rival], 6, "growth")[0].locations).toBe(5);
  });
});

describe("campaign missions", () => {
  const snapshot = {
    served: 8,
    interviews: 1,
    reputation: 60,
    staff: 0,
    socialCapital: 0,
    storyChoices: 0,
    branches: 1,
    leaguePoints: 0,
  };

  it("caps progress at the mission target", () => {
    expect(missionProgress(CAMPAIGN_MISSIONS[0], snapshot)).toBe(5);
  });

  it("unlocks a chapter only after earlier missions are claimed", () => {
    expect(chapterUnlocked(2, [])).toBe(false);
    expect(chapterUnlocked(2, ["first-customers", "listen"])).toBe(true);
  });
});

describe("versioned saves", () => {
  it("round trips an enveloped save", () => {
    expect(
      unwrapSave<{ day: number }>(serializeSave({ day: 7 })).state.day,
    ).toBe(7);
  });

  it("still reads legacy raw state", () => {
    const save = unwrapSave<{ day: number }>(JSON.stringify({ day: 3 }));
    expect(save.schemaVersion).toBe(0);
    expect(save.state.day).toBe(3);
  });
});
