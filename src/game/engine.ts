export type EconomyPhase = "growth" | "steady" | "slowdown";

export type ScoreInput = {
  cash: number;
  reputation: number;
  served: number;
  competitorShares: number[];
  storyDecisions: number;
  locations: number;
  socialCapital: number;
  leaguePoints: number;
};

export type RivalInput = {
  id: string;
  strategy: string;
  cash: number;
  reputation: number;
  locations: number;
  score: number;
  relationship: number;
  momentum: number;
};

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function seededUnit(seed: number, day: number, salt: number) {
  let value = (seed ^ Math.imul(day + 1, 0x9e3779b1) ^ Math.imul(salt + 11, 0x85ebca6b)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
}

export function calculateFounderScore(input: ScoreInput) {
  const marketShare = clamp(100 - input.competitorShares.reduce((sum, share) => sum + share, 0), 10, 65);
  return Math.round(input.cash * .35 + input.reputation * 35 + input.served * 28 + marketShare * 20 + input.storyDecisions * 180 + input.locations * 300 + input.socialCapital * 12 + input.leaguePoints * 25);
}

export function calculateDemand(weatherFactor: number, economyFactor: number, neighbourhoodHeat: number) {
  return weatherFactor * economyFactor * (1 + (neighbourhoodHeat - 50) / 250);
}

export function simulateRivalDay<T extends RivalInput>(rivals: T[], day: number, economy: EconomyPhase) {
  const economyFactor = economy === "growth" ? 1.14 : economy === "slowdown" ? .82 : 1;
  return rivals.map((rival, index) => {
    const expansion = (day + index) % (11 - rival.momentum) === 0 ? 1 : 0;
    const allianceBoost = rival.relationship >= 35 ? 1.08 : 1;
    const earned = Math.round((180 + rival.momentum * 45 + rival.locations * 70) * economyFactor * allianceBoost);
    const reputation = clamp(rival.reputation + ((day + index) % 3 - 1) + (rival.strategy.includes("Relationship") ? 1 : 0), 30, 95);
    const locations = Math.min(5, rival.locations + expansion);
    return { ...rival, cash: rival.cash + earned - locations * 45, reputation, locations, score: Math.round(rival.score + earned * .45 + reputation * 5 + locations * 90) };
  });
}

export function explainDemand(factor: number) {
  if (factor >= 1.12) return "City conditions are amplifying willingness to spend.";
  if (factor <= .88) return "City conditions are suppressing traffic and customer budgets.";
  return "City demand is close to its normal baseline.";
}
