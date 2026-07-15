export type MissionMetric =
  | "served"
  | "interviews"
  | "reputation"
  | "staff"
  | "socialCapital"
  | "storyChoices"
  | "branches"
  | "leaguePoints";

export type Mission = {
  id: string;
  chapter: number;
  icon: string;
  title: string;
  story: string;
  metric: MissionMetric;
  target: number;
  rewardCash: number;
  rewardXp: number;
};

export const CAMPAIGN_MISSIONS: Mission[] = [
  {
    id: "first-customers",
    chapter: 1,
    icon: "☕",
    title: "Open the doors",
    story: "Prove the neighbourhood needs what you are building.",
    metric: "served",
    target: 5,
    rewardCash: 150,
    rewardXp: 10,
  },
  {
    id: "listen",
    chapter: 1,
    icon: "◉",
    title: "Listen before scaling",
    story: "Turn conversations into evidence, not assumptions.",
    metric: "interviews",
    target: 3,
    rewardCash: 100,
    rewardXp: 15,
  },
  {
    id: "trusted-name",
    chapter: 2,
    icon: "★",
    title: "A trusted name",
    story: "Earn enough goodwill for Toronto to start talking.",
    metric: "reputation",
    target: 65,
    rewardCash: 225,
    rewardXp: 20,
  },
  {
    id: "first-hire",
    chapter: 2,
    icon: "♟",
    title: "Build beyond yourself",
    story: "Bring the first teammate into the founder story.",
    metric: "staff",
    target: 1,
    rewardCash: 250,
    rewardXp: 20,
  },
  {
    id: "community-roots",
    chapter: 3,
    icon: "♥",
    title: "Community roots",
    story: "Create relationships that survive beyond one sale.",
    metric: "socialCapital",
    target: 25,
    rewardCash: 300,
    rewardXp: 25,
  },
  {
    id: "hard-choices",
    chapter: 3,
    icon: "◆",
    title: "The founder you become",
    story: "Make consequential choices across the character arcs.",
    metric: "storyChoices",
    target: 3,
    rewardCash: 300,
    rewardXp: 30,
  },
  {
    id: "second-location",
    chapter: 4,
    icon: "⌂",
    title: "A second address",
    story: "Turn one local business into a small Toronto network.",
    metric: "branches",
    target: 2,
    rewardCash: 500,
    rewardXp: 40,
  },
  {
    id: "city-stage",
    chapter: 4,
    icon: "♛",
    title: "Take the city stage",
    story: "Build a reputation among Toronto's founder league.",
    metric: "leaguePoints",
    target: 50,
    rewardCash: 650,
    rewardXp: 50,
  },
];

export type MissionSnapshot = Record<MissionMetric, number>;

export function missionProgress(mission: Mission, snapshot: MissionSnapshot) {
  return Math.min(mission.target, Math.max(0, snapshot[mission.metric]));
}

export function chapterUnlocked(chapter: number, claimedIds: string[]) {
  if (chapter === 1) return true;
  return CAMPAIGN_MISSIONS.filter((mission) => mission.chapter < chapter).every(
    (mission) => claimedIds.includes(mission.id),
  );
}
