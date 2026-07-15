export type ModifierKey = "standard" | "lean" | "pressure" | "momentum";

export const RUN_MODIFIERS = {
  standard: {
    name: "Standard",
    icon: "◆",
    note: "The intended balanced Toronto economy.",
    cash: 0,
    reputation: 0,
    rent: 1,
    score: 1,
  },
  lean: {
    name: "Lean Start",
    icon: "△",
    note: "Start with $250 less. Final score +15%.",
    cash: -250,
    reputation: 0,
    rent: 1,
    score: 1.15,
  },
  pressure: {
    name: "High Pressure",
    icon: "⚡",
    note: "Rent is 20% higher. Final score +25%.",
    cash: 0,
    reputation: 0,
    rent: 1.2,
    score: 1.25,
  },
  momentum: {
    name: "Local Favourite",
    icon: "★",
    note: "Start at 60 reputation. Final score −10%.",
    cash: 0,
    reputation: 10,
    rent: 1,
    score: 0.9,
  },
} as const;

export type ObjectiveSnapshot = {
  served: number;
  revenue: number;
  interviews: number;
  socialCapital: number;
};
export type DailyObjective = {
  id: string;
  icon: string;
  title: string;
  note: string;
  metric: keyof ObjectiveSnapshot;
  target: number;
  reward: number;
};

const OBJECTIVES: DailyObjective[] = [
  {
    id: "serve",
    icon: "●",
    title: "Neighbourhood rush",
    note: "Serve 3 customers today",
    metric: "served",
    target: 3,
    reward: 100,
  },
  {
    id: "revenue",
    icon: "$",
    title: "Cash discipline",
    note: "Earn $300 today",
    metric: "revenue",
    target: 300,
    reward: 120,
  },
  {
    id: "listen",
    icon: "◉",
    title: "Listen closely",
    note: "Complete 1 interview today",
    metric: "interviews",
    target: 1,
    reward: 90,
  },
  {
    id: "connect",
    icon: "♥",
    title: "Community day",
    note: "Gain 4 social capital today",
    metric: "socialCapital",
    target: 4,
    reward: 110,
  },
];

export function dailyObjective(seed: number, day: number) {
  return OBJECTIVES[Math.abs(seed + day * 7) % OBJECTIVES.length];
}

export function objectiveProgress(
  objective: DailyObjective,
  current: ObjectiveSnapshot,
  baseline: ObjectiveSnapshot,
) {
  return Math.min(
    objective.target,
    Math.max(0, current[objective.metric] - baseline[objective.metric]),
  );
}

export function scoreGrade(score: number) {
  if (score >= 16000) return "S";
  if (score >= 11000) return "A";
  if (score >= 6500) return "B";
  if (score >= 3500) return "C";
  return "D";
}
