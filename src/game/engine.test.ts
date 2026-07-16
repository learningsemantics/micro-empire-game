import { describe, expect, it } from "vitest";
import {
  calculateDemand,
  calculateFounderScore,
  seededUnit,
  simulateRivalDay,
} from "./engine";
import {
  loadSaveWithBackup,
  portableBackup,
  readPortableBackup,
  serializeSave,
  unwrapSave,
} from "./save";
import {
  CAMPAIGN_MISSIONS,
  chapterUnlocked,
  missionProgress,
} from "./campaign";
import {
  RUN_MODIFIERS,
  dailyObjective,
  objectiveProgress,
  scoreGrade,
} from "./replay";
import { crisisForDay, shouldTriggerCrisis } from "./crisis";
import {
  FOUNDER_TRIALS,
  earnedBadges,
  founderLevel,
  runXp,
  xpToNextLevel,
} from "./progression";
import { dayPhase, safeVolume, soundscapeFor } from "./atmosphere";
import { founderLegacy, legacyPillars } from "./finale";

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

describe("replay systems", () => {
  it("generates deterministic daily objectives", () => {
    expect(dailyObjective(2026, 4)).toEqual(dailyObjective(2026, 4));
    expect(dailyObjective(2026, 4)).not.toEqual(dailyObjective(2026, 5));
  });

  it("tracks progress from the start-of-day baseline", () => {
    const objective = dailyObjective(1, 2);
    const baseline = {
      served: 3,
      revenue: 100,
      interviews: 0,
      socialCapital: 2,
    };
    const current = {
      served: 20,
      revenue: 900,
      interviews: 5,
      socialCapital: 20,
    };
    expect(objectiveProgress(objective, current, baseline)).toBe(
      objective.target,
    );
  });

  it("rewards harder modifiers and grades stronger scores", () => {
    expect(RUN_MODIFIERS.pressure.score).toBeGreaterThan(
      RUN_MODIFIERS.standard.score,
    );
    expect(scoreGrade(17000)).toBe("S");
    expect(scoreGrade(4000)).toBe("C");
  });
});

describe("crisis engine", () => {
  it("schedules crises every fifth day after opening week begins", () => {
    expect(shouldTriggerCrisis(4)).toBe(false);
    expect(shouldTriggerCrisis(5)).toBe(true);
    expect(shouldTriggerCrisis(10)).toBe(true);
  });

  it("selects crises deterministically from seed and day", () => {
    expect(crisisForDay(2026, 10)).toEqual(crisisForDay(2026, 10));
    expect(crisisForDay(2026, 10).a.effect.days).toBeGreaterThan(0);
  });
});

describe("founder progression", () => {
  it("advances levels at stable XP thresholds", () => {
    expect(founderLevel(0).level).toBe(1);
    expect(founderLevel(600).level).toBe(3);
    expect(xpToNextLevel(600)?.next.level).toBe(4);
  });

  it("rewards stronger runs and detects earned badges", () => {
    expect(runXp(10000, 5, 4)).toBeGreaterThan(runXp(3000, 0, 0));
    expect(
      earnedBadges({
        grade: "A",
        ethics: 75,
        crises: 4,
        missions: 8,
        branches: 3,
      }),
    ).toContain("grade_a");
  });

  it("assigns increasing level requirements to founder trials", () => {
    expect(FOUNDER_TRIALS.map((trial) => trial.level)).toEqual([2, 3, 4]);
  });
});

describe("audio and atmosphere", () => {
  it("maps operating hours to stable lighting phases", () => {
    expect(dayPhase(9)).toBe("morning");
    expect(dayPhase(14)).toBe("afternoon");
    expect(dayPhase(18)).toBe("evening");
    expect(dayPhase(22)).toBe("night");
  });

  it("selects weather-aware procedural soundscapes", () => {
    expect(soundscapeFor("rain", 12, true).name).toContain("Rain");
    expect(soundscapeFor("clear", 22, true).name).toContain("dark");
  });

  it("keeps volume inside the Web Audio safe range", () => {
    expect(safeVolume(-1)).toBe(0);
    expect(safeVolume(2)).toBe(1);
    expect(safeVolume(0.4)).toBe(0.4);
  });
});

describe("complete-edition finale", () => {
  const base = {
    cash: 4000,
    reputation: 70,
    socialCapital: 30,
    ethics: 60,
    branches: 1,
    staff: 1,
    health: 70,
    crises: 2,
  };

  it("selects distinct legacies from the full campaign outcome", () => {
    expect(founderLegacy({ ...base, ethics: 20 }).id).toBe("ruthless");
    expect(
      founderLegacy({ ...base, reputation: 90, socialCapital: 75 }).id,
    ).toBe("community");
    expect(founderLegacy({ ...base, cash: 10000, branches: 4 }).id).toBe(
      "empire",
    );
  });

  it("keeps every legacy pillar inside a 0–100 range", () => {
    const pillars = legacyPillars({ ...base, cash: 999999, ethics: -20 });
    expect(
      Object.values(pillars).every((value) => value >= 0 && value <= 100),
    ).toBe(true);
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

  it("recovers a valid backup when the primary snapshot is corrupt", () => {
    const loaded = loadSaveWithBackup<{ day: number }>(
      "not-json",
      serializeSave({ day: 9 }),
    );
    expect(loaded?.state.day).toBe(9);
    expect(loaded?.recovered).toBe(true);
  });

  it("round trips a portable full-player backup", () => {
    const raw = portableBackup({ profile: { xp: 250 }, runs: 2 });
    expect(
      readPortableBackup<{ profile: { xp: number }; runs: number }>(raw),
    ).toEqual({
      profile: { xp: 250 },
      runs: 2,
    });
  });
});
