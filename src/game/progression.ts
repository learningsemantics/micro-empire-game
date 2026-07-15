export type FounderProfile = {
  xp: number;
  badges: string[];
  completedRuns: number;
  processedRuns: string[];
};

export const EMPTY_PROFILE: FounderProfile = {
  xp: 0,
  badges: [],
  completedRuns: 0,
  processedRuns: [],
};

export const FOUNDER_LEVELS = [
  { level: 1, xp: 0, name: "Neighbourhood Starter", icon: "●" },
  { level: 2, xp: 250, name: "Resilient Operator", icon: "▲" },
  { level: 3, xp: 600, name: "Community Builder", icon: "♥" },
  { level: 4, xp: 1100, name: "Growth Founder", icon: "◆" },
  { level: 5, xp: 1800, name: "Toronto Institution", icon: "★" },
  { level: 6, xp: 2700, name: "Micro Empire Architect", icon: "♛" },
];

export const META_BADGES = {
  first_run: {
    icon: "◆",
    name: "First Campaign",
    note: "Complete a founder run",
  },
  ethical: {
    icon: "♥",
    name: "Principled Builder",
    note: "Finish with 70+ ethics",
  },
  crisis: {
    icon: "⚡",
    name: "Crisis Tested",
    note: "Face four crises in one run",
  },
  mission: {
    icon: "✦",
    name: "Campaign Finisher",
    note: "Claim all eight campaign missions",
  },
  grade_a: { icon: "A", name: "Elite Operator", note: "Earn an A or S grade" },
  explorer: {
    icon: "⌂",
    name: "City Builder",
    note: "Operate three locations",
  },
} as const;

export const FOUNDER_TRIALS = [
  {
    id: "turnaround",
    level: 2,
    icon: "↗",
    name: "Toronto Turnaround",
    note: "Recover a struggling Junction business with $600 and 14 days.",
    cash: 600,
    days: 14,
    difficulty: "operator",
    business: "coffee",
    district: "junction",
    modifier: "lean",
    seed: 551,
  },
  {
    id: "community",
    level: 3,
    icon: "♥",
    name: "Community Legacy",
    note: "Build trust in the Junction under a high-pressure economy.",
    cash: 900,
    days: 18,
    difficulty: "mogul",
    business: "career",
    district: "junction",
    modifier: "pressure",
    seed: 733,
  },
  {
    id: "agency",
    level: 4,
    icon: "⚡",
    name: "AI Agency Sprint",
    note: "Scale an AI agency from Liberty Village in only 12 days.",
    cash: 1100,
    days: 12,
    difficulty: "mogul",
    business: "agency",
    district: "liberty",
    modifier: "pressure",
    seed: 947,
  },
] as const;

export function founderLevel(xp: number) {
  return (
    [...FOUNDER_LEVELS].reverse().find((item) => xp >= item.xp) ||
    FOUNDER_LEVELS[0]
  );
}

export function xpToNextLevel(xp: number) {
  const current = founderLevel(xp);
  const next = FOUNDER_LEVELS.find((item) => item.level === current.level + 1);
  return next
    ? { current: xp - current.xp, required: next.xp - current.xp, next }
    : null;
}

export function runXp(score: number, objectives: number, missions: number) {
  return Math.max(
    25,
    Math.round(score / 100) + objectives * 10 + missions * 15,
  );
}

export function earnedBadges(input: {
  grade: string;
  ethics: number;
  crises: number;
  missions: number;
  branches: number;
}) {
  const badges = ["first_run"];
  if (input.ethics >= 70) badges.push("ethical");
  if (input.crises >= 4) badges.push("crisis");
  if (input.missions >= 8) badges.push("mission");
  if (["S", "A"].includes(input.grade)) badges.push("grade_a");
  if (input.branches >= 3) badges.push("explorer");
  return badges;
}
