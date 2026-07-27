Warning: truncated output (original token count: 66909)
Total output lines: 8030

"use client";

import { useEffect, useState } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { BALANCE } from "./game/balance";
import {
  CAMPAIGN_MISSIONS,
  chapterUnlocked,
  missionProgress,
  type MissionSnapshot,
} from "./game/campaign";
import {
  calculateDemand,
  calculateFounderScore as engineScore,
  clamp,
  explainDemand,
  seededUnit,
  simulateRivalDay,
} from "./game/engine";
import {
  BACKUP_SAVE_KEY,
  SAVE_KEY,
  loadSaveWithBackup,
  portableBackup,
  readPortableBackup,
  serializeSave,
  unwrapSave,
} from "./game/save";
import {
  RUN_MODIFIERS,
  dailyObjective,
  objectiveProgress,
  scoreGrade,
  type ModifierKey,
  type ObjectiveSnapshot,
} from "./game/replay";
import { CRISES, crisisForDay, shouldTriggerCrisis } from "./game/crisis";
import {
  EMPTY_PROFILE,
  FOUNDER_TRIALS,
  META_BADGES,
  earnedBadges,
  founderLevel,
  runXp,
  xpToNextLevel,
  type FounderProfile,
} from "./game/progression";
import { dayPhase, safeVolume, soundscapeFor } from "./game/atmosphere";
import { founderLegacy, legacyPillars } from "./game/finale";
import {
  COMMUNITY_STATUS,
  EDITIONS,
  canAccessCommercial,
  normalizeEditionStatus,
  type EditionStatus,
} from "./game/commercial";
import { getSupabaseClient } from "./game/auth";
import { newerSave, normalizeCloudSave, type CloudSave } from "./game/cloud";

type BusinessKey = "coffee" | "career" | "agency";
type DistrictKey = "junction" | "harbour" | "liberty";
type CityKey =
  | "junction"
  | "kensington"
  | "financial"
  | "harbour"
  | "liberty"
  | "yorkville"
  | "mars"
  | "cityhall";
type SegmentKey =
  | "Student"
  | "Professional"
  | "Family"
  | "Tourist"
  | "Small Business"
  | "Corporate";
type SupplierKey = "budget" | "local" | "premium";
type DifficultyKey = "founder" | "operator" | "mogul";
type AdviserKey = "finance" | "marketing" | "people" | "operations";
type GameMode = "campaign" | "daily" | "custom";
type StaffMember = {
  id: number;
  name: string;
  role: string;
  skill: number;
  morale: number;
  salary: number;
  tenure: number;
  loyalty: number;
};
type Competitor = {
  name: string;
  price: number;
  reputation: number;
  share: number;
};
type ExperimentKey = "price" | "segment" | "offer";
type Experiment = { type: ExperimentKey; progress: number; target: number };
type SkillKey =
  "discovery" | "finance" | "leadership" | "negotiation" | "strategy";
type FundingKey = "bootstrapped" | "debt" | "angel";
type JobKey = "none" | "cafe" | "freelance" | "consultant";
type TransportKey = "walk" | "ttc" | "bike" | "rideshare";
type Branch = {
  id: number;
  name: string;
  city: CityKey;
  business: BusinessKey;
  level: number;
  inventory: number;
  maxInventory: number;
  manager: string | null;
  lifetimeRevenue: number;
  propertyValue: number;
};
type Resident = {
  id: string;
  name: string;
  role: string;
  segment: SegmentKey;
  home: CityKey;
  location: CityKey;
  personality: string;
  relationship: number;
  loyalty: number;
  encounters: number;
  mood: string;
};
type WeatherKey = "clear" | "rain" | "snow" | "heat";
type EconomyKey = "growth" | "steady" | "slowdown";
type PolicyKey = "none" | "smallbiz" | "rentcontrol" | "green";
type RivalFounder = {
  id: string;
  name: string;
  company: string;
  business: BusinessKey;
  city: CityKey;
  strategy: string;
  cash: number;
  reputation: number;
  locations: number;
  score: number;
  relationship: number;
  momentum: number;
};
type ConsoleGroup = "city" | "business" | "people" | "founder" | "league";
type OpsTab =
  | "trade"
  | "team"
  | "supply"
  | "market"
  | "council"
  | "lab"
  | "lead"
  | "life"
  | "empire"
  | "people"
  | "pulse"
  | "league";
type ArchetypeKey =
  | "undecided"
  | "community"
  | "operator"
  | "visionary"
  | "dealmaker"
  | "portfolio";
type ConsequenceKey =
  "maya_showcase" | "team_trust" | "mentor_discipline" | "rival_reciprocity";
type StoryMessage = {
  day: number;
  from: string;
  text: string;
  tone: "warm" | "urgent" | "rival" | "mentor";
};
type PendingConsequence = {
  dueDay: number;
  key: ConsequenceKey;
  label: string;
};
type Phase =
  | "home"
  | "modes"
  | "scenario"
  | "select"
  | "district"
  | "play"
  | "dayEnd"
  | "decision"
  | "negotiation"
  | "crisis"
  | "epilogue"
  | "result";

type GameState = {
  phase: Phase;
  business: BusinessKey | null;
  district: DistrictKey;
  day: number;
  hour: number;
  cash: number;
  reputation: number;
  capacity: number;
  maxCapacity: number;
  served: number;
  missed: number;
  revenue: number;
  expenses: number;
  speed: number;
  marketing: number;
  decor: number;
  price: number;
  offer: number;
  supplier: SupplierKey;
  staff: StaffMember[];
  competitors: Competitor[];
  dailyCogs: number;
  dailyPayroll: number;
  stageRewarded: number;
  decision: string | null;
  storyLog: string[];
  difficulty: DifficultyKey;
  adviserTrust: Record<AdviserKey, number>;
  achievements: string[];
  mode: GameMode;
  campaignDays: number;
  scenarioName: string;
  seed: number;
  interviews: number;
  insights: number;
  pmf: number;
  acquiredCustomers: number;
  repeatCustomers: number;
  referrals: number;
  marketingSpend: number;
  totalCogs: number;
  experiment: Experiment | null;
  experimentHistory: ExperimentKey[];
  energy: number;
  stress: number;
  focus: number;
  skills: Record<SkillKey, number>;
  skillPoints: number;
  mentorTrust: Record<string, number>;
  negotiation: string | null;
  negotiationWins: number;
  rentDiscount: number;
  funding: FundingKey;
  debtBalance: number;
  equityGiven: number;
  milestone: "profit" | "brand" | "people";
  founderLocation: CityKey;
  homeLocation: CityKey;
  transitPass: boolean;
  network: number;
  permitLevel: number;
  placesVisited: CityKey[];
  housingTier: "room" | "studio";
  personalCash: number;
  personalDebt: number;
  creditScore: number;
  health: number;
  job: JobKey;
  shiftsWorked: number;
  educationCredits: number;
  transport: TransportKey;
  ownsBike: boolean;
  branches: Branch[];
  branchPermits: number;
  residents: Resident[];
  socialCapital: number;
  collaborations: number;
  weather: WeatherKey;
  economy: EconomyKey;
  interestRate: number;
  ttcStatus: string;
  cityPolicy: PolicyKey;
  cityEvent: string;
  cityEventLog: string[];
  neighbourhoodHeat: Record<CityKey, number>;
  cityActions: number;
  lastCityActionDay: number;
  rivals: RivalFounder[];
  leaguePoints: number;
  alliances: number;
  rivalWins: number;
  seasonName: string;
  lastRivalActionDay: number;
  leagueCodeImported: boolean;
  archetype: ArchetypeKey;
  characterEvent: string | null;
  characterArcs: Record<string, number>;
  storyInbox: StoryMessage[];
  pendingConsequences: PendingConsequence[];
  storyChoices: string[];
  claimedMissionIds: string[];
  campaignXp: number;
  missionStreak: number;
  runModifier: ModifierKey;
  objectiveBaseline: ObjectiveSnapshot;
  objectiveStreak: number;
  completedObjectives: number;
  runId: string;
  activeCrisis: string | null;
  crisisHistory: string[];
  ethicsScore: number;
  marketShock: { days: number; demand: number; rent: number; label: string };
  segmentSales: Record<SegmentKey, number>;
  customer: null | {
    residentId: string;
    name: string;
    order: string;
    value: number;
    budget: number;
    patience: number;
    segment: SegmentKey;
    fit: string;
    returning: boolean;
    source: string;
  };
  message: string;
  event: string;
  dailyRevenue: number;
  dailyExpenses: number;
  quests: boolean[];
};

const BUSINESSES = {
  coffee: {
    name: "Coffee Cart",
    icon: "☕",
    tagline: "Fast, friendly, always moving",
    cost: 240,
    unit: 120,
    stock: "cups",
    color: "coral",
    description: "Low setup cost · Fast service · Steady foot traffic",
  },
  career: {
    name: "Career Studio",
    icon: "◆",
    tagline: "Turn ambition into opportunity",
    cost: 420,
    unit: 170,
    stock: "sessions",
    color: "teal",
    description: "Balanced setup · Higher value · Reputation driven",
  },
  agency: {
    name: "AI Agency",
    icon: "✦",
    tagline: "Automate the neighbourhood",
    cost: 620,
    unit: 280,
    stock: "capacity",
    color: "violet",
    description: "High setup cost · Fewer clients · Premium contracts",
  },
} as const;

const PEOPLE = [
  "Maya",
  "Noah",
  "Priya",
  "Lucas",
  "Ava",
  "Omar",
  "Sofia",
  "Ethan",
  "Mei",
  "Arjun",
];
const ORDERS: Record<BusinessKey, string[]> = {
  coffee: ["Oat latte", "Cold brew", "Maple americano", "Masala chai"],
  career: [
    "Résumé review",
    "Interview practice",
    "Career roadmap",
    "LinkedIn refresh",
  ],
  agency: [
    "Lead workflow",
    "Inbox agent",
    "Client dashboard",
    "AI process audit",
  ],
};

const DISTRICTS = {
  junction: {
    name: "The Junction",
    icon: "◈",
    rent: 85,
    traffic: "Steady",
    tone: "Community-driven",
    description:
      "Families, students and loyal locals. Lower rent rewards patient brand building.",
    segments: ["Family", "Student", "Professional"] as SegmentKey[],
  },
  harbour: {
    name: "Harbourfront",
    icon: "≈",
    rent: 145,
    traffic: "High",
    tone: "Seasonal & social",
    description:
      "Tourists and professionals bring volume, but rent and expectations are higher.",
    segments: ["Tourist", "Professional", "Corporate"] as SegmentKey[],
  },
  liberty: {
    name: "Liberty Village",
    icon: "▦",
    rent: 125,
    traffic: "Targeted",
    tone: "Business-focused",
    description:
      "Startups, corporate teams and ambitious professionals value premium offers.",
    segments: ["Small Business", "Corporate", "Professional"] as SegmentKey[],
  },
} as const;

const CITY: Record<
  CityKey,
  {
    name: string;
    icon: string;
    x: number;
    y: number;
    kind: string;
    signal: string;
  }
> = {
  junction: {
    name: "The Junction",
    icon: "⌂",
    x: 12,
    y: 50,
    kind: "Home",
    signal: "Affordable home base · loyal local demand",
  },
  kensington: {
    name: "Kensington Market",
    icon: "✦",
    x: 31,
    y: 42,
    kind: "Network",
    signal: "Founder meetups · creative customers",
  },
  financial: {
    name: "Financial District",
    icon: "$",
    x: 58,
    y: 54,
    kind: "Bank",
    signal: "Capital and corporate opportunity",
  },
  harbour: {
    name: "Harbourfront",
    icon: "≈",
    x: 60,
    y: 78,
    kind: "Market",
    signal: "Tourism · seasonal foot traffic",
  },
  liberty: {
    name: "Liberty Village",
    icon: "▦",
    x: 36,
    y: 69,
    kind: "Business",
    signal: "Startups · premium B2B demand",
  },
  yorkville: {
    name: "Yorkville",
    icon: "◆",
    x: 67,
    y: 27,
    kind: "Investors",
    signal: "Affluent customers · expensive access",
  },
  mars: {
    name: "MaRS Discovery",
    icon: "◎",
    x: 52,
    y: 31,
    kind: "Learning",
    signal: "Mentors · research · innovation",
  },
  cityhall: {
    name: "City Hall",
    icon: "◫",
    x: 51,
    y: 45,
    kind: "Civic",
    signal: "Permits · grants · city programs",
  },
};

const JOBS: Record<
  JobKey,
  {
    name: string;
    pay: number;
    energy: number;
    requirement: number;
    note: string;
  }
> = {
  none: {
    name: "Full-time founder",
    pay: 0,
    energy: 0,
    requirement: 0,
    note: "Maximum time, no safety-net income",
  },
  cafe: {
    name: "Café shift",
    pay: 95,
    energy: 15,
    requirement: 0,
    note: "Reliable cash · physically demanding",
  },
  freelance: {
    name: "Freelance project",
    pay: 165,
    energy: 12,
    requirement: 1,
    note: "Flexible work · requires one education credit",
  },
  consultant: {
    name: "Business consultant",
    pay: 260,
    energy: 10,
    requirement: 3,
    note: "Premium income · requires three education credits",
  },
};
const TRANSPORT: Record<
  TransportKey,
  { name: string; fare: number; energy: number; note: string }
> = {
  walk: {
    name: "Walk",
    fare: 0,
    energy: 6,
    note: "Free · healthiest · tiring",
  },
  ttc: { name: "TTC", fare: 4, energy: 2, note: "Balanced city travel" },
  bike: {
    name: "Bike",
    fare: 0,
    energy: 2,
    note: "Fast and free after purchase",
  },
  rideshare: {
    name: "Rideshare",
    fare: 18,
    energy: 0,
    note: "Expensive · preserves energy",
  },
};
const PROPERTY_COST: Record<CityKey, number> = {
  junction: 900,
  kensington: 1250,
  financial: 2200,
  harbour: 1750,
  liberty: 1650,
  yorkville: 2800,
  mars: 2100,
  cityhall: 1900,
};
const RESIDENT_PROFILES: Omit<
  Resident,
  "location" | "relationship" | "loyalty" | "encounters" | "mood"
>[] = [
  {
    id: "maya",
    name: "Maya",
    role: "Design student",
    segment: "Student",
    home: "kensington",
    personality: "Curious early adopter",
  },
  {
    id: "noah",
    name: "Noah",
    role: "Financial analyst",
    segment: "Professional",
    home: "financial",
    personality: "Value-conscious planner",
  },
  {
    id: "priya",
    name: "Priya",
    role: "Product manager",
    segment: "Professional",
    home: "liberty",
    personality: "Ambitious connector",
  },
  {
    id: "lucas",
    name: "Lucas",
    role: "Restaurant owner",
    segment: "Small Business",
    home: "junction",
    personality: "Community loyalist",
  },
  {
    id: "ava",
    name: "Ava",
    role: "Travel creator",
    segment: "Tourist",
    home: "harbour",
    personality: "Social storyteller",
  },
  {
    id: "omar",
    name: "Omar",
    role: "Agency founder",
    segment: "Small Business",
    home: "liberty",
    personality: "Competitive collaborator",
  },
  {
    id: "sofia",
    name: "Sofia",
    role: "Family physician",
    segment: "Family",
    home: "yorkville",
    personality: "Quality-first regular",
  },
  {
    id: "ethan",
    name: "Ethan",
    role: "Procurement lead",
    segment: "Corporate",
    home: "financial",
    personality: "Evidence-driven buyer",
  },
  {
    id: "mei",
    name: "Mei",
    role: "Research scientist",
    segment: "Professional",
    home: "mars",
    personality: "Thoughtful experimenter",
  },
  {
    id: "arjun",
    name: "Arjun",
    role: "City program officer",
    segment: "Corporate",
    home: "cityhall",
    personality: "Civic ecosystem builder",
  },
  {
    id: "leila",
    name: "Leila",
    role: "Retail founder",
    segment: "Small Business",
    home: "kensington",
    personality: "Creative dealmaker",
  },
  {
    id: "daniel",
    name: "Daniel",
    role: "New parent",
    segment: "Family",
    home: "junction",
    personality: "Convenience seeker",
  },
];
const makeResidents = (): Resident[] =>
  RESIDENT_PROFILES.map((r) => ({
    ...r,
    location: r.home,
    relationship: 0,
    loyalty: 10,
    encounters: 0,
    mood: "Open to conversation",
  }));
const WEATHER: Record<
  WeatherKey,
  { name: string; icon: string; demand: number; travel: number; note: string }
> = {
  clear: {
    name: "Clear",
    icon: "☀",
    demand: 1.08,
    travel: 0,
    note: "Strong foot traffic across the city",
  },
  rain: {
    name: "Rain",
    icon: "☂",
    demand: 0.88,
    travel: 2,
    note: "Indoor demand rises while streets slow",
  },
  snow: {
    name: "Snow",
    icon: "❄",
    demand: 0.72,
    travel: 4,
    note: "Disruptions suppress traffic and deliveries",
  },
  heat: {
    name: "Heat Alert",
    icon: "☼",
    demand: 0.94,
    travel: 3,
    note: "Waterfront activity rises; founder energy falls",
  },
};
const ECONOMY: Record<
  EconomyKey,
  { name: string; factor: number; note: string }
> = {
  growth: {
    name: "Expansion",
    factor: 1.14,
    note: "Demand and property values are rising",
  },
  steady: {
    name: "Stable",
    factor: 1,
    note: "Balanced demand and predictable costs",
  },
  slowdown: {
    name: "Slowdown",
    factor: 0.82,
    note: "Customers scrutinize every purchase",
  },
};
const POLICIES: Record<PolicyKey, { name: string; note: string }> = {
  none: { name: "Status quo", note: "No active citywide intervention" },
  smallbiz: {
    name: "Main Street Grant",
    note: "Permitted businesses can claim growth support",
  },
  rentcontrol: {
    name: "Commercial Rent Relief",
    note: "Flagship rent growth is temporarily constrained",
  },
  green: {
    name: "Green Toronto Standard",
    note: "Local suppliers and low-carbon travel receive benefits",
  },
};
const makeRivals = (): RivalFounder[] => [
  {
    id: "sienna",
    name: "Sienna Park",
    company: "North & Pine",
    business: "coffee",
    city: "kensington",
    strategy: "Community brand",
    cash: 1350,
    reputation: 58,
    locations: 1,
    score: 2400,
    relationship: 0,
    momentum: 2,
  },
  {
    id: "malik",
    name: "Malik Thompson",
    company: "Career North",
    business: "career",
    city: "financial",
    strategy: "Premium outcomes",
    cash: 1800,
    reputation: 62,
    locations: 1,
    score: 2750,
    relationship: 0,
    momentum: 3,
  },
  {
    id: "elena",
    name: "Elena Rossi",
    company: "Civic Automations",
    business: "agency",
    city: "mars",
    strategy: "Product innovation",
    cash: 2100,
    reputation: 55,
    locations: 1,
    score: 2900,
    relationship: 0,
    momentum: 4,
  },
  {
    id: "dev",
    name: "Dev Shah",
    company: "Harbour Works",
    business: "agency",
    city: "harbour",
    strategy: "Aggressive expansion",
    cash: 1600,
    reputation: 50,
    locations: 2,
    score: 2600,
    relationship: 0,
    momentum: 5,
  },
  {
    id: "claire",
    name: "Claire Wong",
    company: "Liberty Collective",
    business: "career",
    city: "liberty",
    strategy: "Relationship network",
    cash: 1450,
    reputation: 66,
    locations: 1,
    score: 2800,
    relationship: 0,
    momentum: 3,
  },
];
const CONSOLE_GROUPS: Record<
  ConsoleGroup,
  { icon: string; label: string; tabs: OpsTab[] }
> = {
  city: { icon: "⌖", label: "City", tabs: ["pulse", "market", "supply"] },
  business: {
    icon: "▦",
    label: "Business",
    tabs: ["trade", "team", "lab", "empire"],
  },
  people: { icon: "●", label: "People", tabs: ["people", "council"] },
  founder: { icon: "◆", label: "Founder", tabs: ["life", "lead"] },
  league: { icon: "▲", label: "League", tabs: ["league"] },
};
const ARCHETYPES: Record<
  ArchetypeKey,
  { name: string; icon: string; note: string }
> = {
  undecided: {
    name: "Still Becoming",
    icon: "○",
    note: "Choose the founder you want to become",
  },
  community: {
    name: "Community Builder",
    icon: "♥",
    note: "Relationships grow faster",
  },
  operator: {
    name: "Bootstrap Operator",
    icon: "⚙",
    note: "Recovery and operational discipline",
  },
  visionary: {
    name: "Product Visionary",
    icon: "◎",
    note: "Customer discovery compounds",
  },
  dealmaker: {
    name: "Deal Maker",
    icon: "◆",
    note: "Negotiations and rival partnerships",
  },
  portfolio: {
    name: "Portfolio Entrepreneur",
    icon: "▦",
    note: "Expansion and property strategy",
  },
};
const CHARACTER_EVENTS: Record<
  string,
  {
    speaker: string;
    role: string;
    portrait: string;
    title: string;
    text: string;
    a: string;
    b: string;
  }
> = {
  maya_intro: {
    speaker: "Maya",
    role: "Design student",
    portrait: "M",
    title: "A Window for New Founders",
    text: "Maya is organizing a student showcase. She wants your business to host it, but the event will consume time and $120 today.",
    a: "Back the showcase",
    b: "Offer advice instead",
  },
  maya_return: {
    speaker: "Maya",
    role: "Emerging community organizer",
    portrait: "M",
    title: "The Community Remembers",
    text: "Maya’s showcase is growing. She asks whether you will become a long-term neighbourhood partner.",
    a: "Commit to the partnership",
    b: "Keep the relationship informal",
  },
  team_future: {
    speaker: "Your Team",
    role: "The people building beside you",
    portrait: "T",
    title: "What Are We Building Together?",
    text: "Your employees want clarity: is this merely a job, or can they grow into leaders of the empire?",
    a: "Create a leadership path",
    b: "Protect founder control",
  },
  mentor_test: {
    speaker: "Nadia Chen",
    role: "Serial Operator",
    portrait: "N",
    title: "The Discipline Test",
    text: "Nadia challenges you to close early, restore the team and sacrifice one day of maximum revenue for long-term resilience.",
    a: "Accept the discipline",
    b: "Keep pushing growth",
  },
  rival_offer: {
    speaker: "Claire Wong",
    role: "Founder, Liberty Collective",
    portrait: "C",
    title: "A Rival Calls After Hours",
    text: "Claire proposes a shared Toronto founder event. It could deepen the ecosystem—or give her access to your audience.",
    a: "Build it together",
    b: "Compete independently",
  },
  identity: {
    speaker: "Your Inner Voice",
    role: "Founder reflection",
    portrait: "◆",
    title: "What Kind of Founder Are You?",
    text: "The city is beginning to know your name. Your repeated decisions—not your pitch—are becoming your identity.",
    a: "Lead through trust",
    b: "Lead through ambition",
  },
};

const SEGMENTS: Record<
  SegmentKey,
  { icon: string; budget: number; patience: number }
> = {
  Student: { icon: "◒", budget: 120, patience: 3 },
  Professional: { icon: "◆", budget: 220, patience: 3 },
  Family: { icon: "⌂", budget: 170, patience: 4 },
  Tourist: { icon: "◎", budget: 190, patience: 2 },
  "Small Business": { icon: "▣", budget: 330, patience: 3 },
  Corporate: { icon: "▲", budget: 460, patience: 2 },
};

const OFFERS: Record<BusinessKey, { names: string[]; notes: string[] }> = {
  coffee: {
    names: ["Quick Serve", "House Ritual", "Artisan Reserve"],
    notes: [
      "Low price · fast volume",
      "Balanced margin and loyalty",
      "Premium quality · higher cost",
    ],
  },
  career: {
    names: ["Express Review", "Coaching Session", "Career Transformation"],
    notes: [
      "Fast, tactical support",
      "Balanced guidance",
      "Premium outcome package",
    ],
  },
  agency: {
    names: ["Automation Sprint", "Managed Workflow", "Enterprise Control"],
    notes: [
      "Defined, fast project",
      "Recurring operational value",
      "Premium governed delivery",
    ],
  },
};

const SUPPLIERS = {
  budget: {
    name: "Metro Value Supply",
    cost: 0.72,
    quality: -1,
    reliability: 72,
    note: "Lowest cost · occasional shortfall",
  },
  local: {
    name: "Ontario Local Co-op",
    cost: 1,
    quality: 1,
    reliability: 91,
    note: "Balanced cost · community reputation",
  },
  premium: {
    name: "Northstar Premium",
    cost: 1.35,
    quality: 3,
    reliability: 100,
    note: "Highest quality · guaranteed fulfilment",
  },
} as const;

const STAFF_ROLES: Record<BusinessKey, string[]> = {
  coffee: ["Barista", "Shift Lead", "Community Host"],
  career: ["Career Coach", "Résumé Specialist", "Client Coordinator"],
  agency: ["Automation Builder", "Account Strategist", "Governance Analyst"],
};

const STAGES = [
  {
    name: "Bootstrap",
    days: "Days 1–7",
    icon: "●",
    note: "Prove customers will pay.",
  },
  {
    name: "Local Favourite",
    days: "Days 8–14",
    icon: "★",
    note: "Build loyalty and a capable team.",
  },
  {
    name: "Growth Business",
    days: "Days 15–22",
    icon: "▲",
    note: "Defend margin while competitors react.",
  },
  {
    name: "Micro Empire",
    days: "Days 23–30",
    icon: "◆",
    note: "Turn operations into an institution.",
  },
];

const NARRATIVES: Record<
  number,
  { id: string; title: string; text: string; a: string; b: string }
> = {
  4: {
    id: "review",
    title: "The One-Star Review",
    text: "A frustrated customer posts a detailed public complaint. The neighbourhood is watching how you respond.",
    a: "Refund publicly · Pay $120 · Reputation +9",
    b: "Defend the team · Morale +12 · Reputation −4",
  },
  8: {
    id: "festival",
    title: "The Junction Festival",
    text: "Organizers offer you the anchor booth. It could transform awareness, but the fee lands before the next rent payment.",
    a: "Sponsor it · Pay $350 · Reputation +14",
    b: "Stay focused · Cash +$120 from normal trade",
  },
  13: {
    id: "corporate",
    title: "The Corporate Contract",
    text: "A major client wants a discounted exclusive contract. Revenue is guaranteed, but smaller customers may feel abandoned.",
    a: "Sign exclusivity · Cash +$1,400 · Reputation −7",
    b: "Protect independence · Reputation +8",
  },
  19: {
    id: "talent",
    title: "Your Best Person Has an Offer",
    text: "A competitor approaches your most skilled employee. Keeping them will reset expectations across the team.",
    a: "Counteroffer · Pay $500 · Team morale +18",
    b: "Let them leave · Lose top employee · Cash protected",
  },
  24: {
    id: "investor",
    title: "The Expansion Offer",
    text: "An investor offers growth capital in exchange for influence over pricing and operating strategy.",
    a: "Take capital · Cash +$3,000 · Price locked premium",
    b: "Remain independent · Reputation +12 · Capacity +3",
  },
};

const DIFFICULTIES = {
  founder: {
    name: "Founder",
    icon: "●",
    rent: 0.8,
    budget: 1.15,
    rival: 0.7,
    note: "Forgiving cash flow · generous customers",
  },
  operator: {
    name: "Operator",
    icon: "▲",
    rent: 1,
    budget: 1,
    rival: 1,
    note: "Balanced operating challenge",
  },
  mogul: {
    name: "Mogul",
    icon: "◆",
    rent: 1.3,
    budget: 0.88,
    rival: 1.45,
    note: "Tight budgets · aggressive competition",
  },
} as const;

const ACHIEVEMENTS = {
  first_sale: {
    icon: "☕",
    name: "First Dollar",
    note: "Complete the first sale",
  },
  beloved: { icon: "★", name: "Beloved Brand", note: "Reach 90 reputation" },
  team: { icon: "♟", name: "Team Builder", note: "Hire three specialists" },
  leader: { icon: "▲", name: "Market Leader", note: "Reach 50% market share" },
  cash: { icon: "$", name: "Cash Engine", note: "Hold $10,000 cash" },
  judgment: {
    icon: "◈",
    name: "Founder Judgment",
    note: "Resolve all five story decisions",
  },
} as const;

const SKILLS: Record<SkillKey, { name: string; icon: string; note: string }> = {
  discovery: {
    name: "Customer Discovery",
    icon: "◎",
    note: "Interviews produce stronger PMF insight",
  },
  finance: {
    name: "Financial Judgment",
    icon: "$",
    note: "Reduces rent and financing leakage",
  },
  leadership: {
    name: "Leadership",
    icon: "♥",
    note: "Protects energy, morale and loyalty",
  },
  negotiation: {
    name: "Negotiation",
    icon: "◆",
    note: "Improves every commercial deal",
  },
  strategy: {
    name: "Strategy",
    icon: "▲",
    note: "Increases stage-transition rewards",
  },
};
const MENTORS = {
  nadia: {
    name: "Nadia Chen",
    role: "Serial Operator",
    skill: "leadership" as SkillKey,
    icon: "N",
  },
  marcus: {
    name: "Marcus Reid",
    role: "CFO & Investor",
    skill: "finance" as SkillKey,
    icon: "M",
  },
  farah: {
    name: "Farah Khan",
    role: "Growth Founder",
    skill: "discovery" as SkillKey,
    icon: "F",
  },
};
const NEGOTIATIONS: Record<
  number,
  {
    id: string;
    title: string;
    party: string;
    text: string;
    firm: string;
    partner: string;
  }
> = {
  6: {
    id: "lease",
    title: "Lease Renewal",
    party: "Landlord",
    text: "The landlord proposes a 20% increase as the neighbourhood heats up.",
    firm: "Hold the line",
    partner: "Offer a longer commitment",
  },
  11: {
    id: "supplier",
    title: "Supplier Terms",
    party: "Account Manager",
    text: "Your supplier wants payment on delivery instead of weekly terms.",
    firm: "Demand existing terms",
    partner: "Trade volume for flexibility",
  },
  16: {
    id: "client",
    title: "Scope Negotiation",
    party: "Major Client",
    text: "A valuable client requests additional work without increasing the contract.",
    firm: "Charge for scope",
    partner: "Make a strategic concession",
  },
  21: {
    id: "bank",
    title: "Working-Capital Facility",
    party: "Banker",
    text: "The bank offers credit with restrictive operating covenants.",
    firm: "Reduce the covenants",
    partner: "Accept for a lower rate",
  },
  27: {
    id: "talentdeal",
    title: "Leadership Retention",
    party: "Senior Employee",
    text: "Your strongest team member wants a larger role and compensation review.",
    firm: "Tie reward to targets",
    partner: "Share authority now",
  },
};

const initialState: GameState = {
  phase: "home",
  business: null,
  district: "junction",
  day: 1,
  hour: 9,
  cash: 1000,
  reputation: 50,
  capacity: 8,
  maxCapacity: 8,
  served: 0,
  missed: 0,
  revenue: 0,
  expenses: 0,
  speed: 0,
  marketing: 0,
  decor: 0,
  price: 1,
  offer: 1,
  supplier: "local",
  staff: [],
  dailyCogs: 0,
  dailyPayroll: 0,
  stageRewarded: 0,
  decision: null,
  storyLog: [],
  difficulty: "operator",
  adviserTrust: { finance: 50, marketing: 50, people: 50, operations: 50 },
  achievements: [],
  mode: "campaign",
  campaignDays: 30,
  scenarioName: "The 30-Day Founder Campaign",
  seed: 2026,
  interviews: 0,
  insights: 0,
  pmf: 35,
  acquiredCustomers: 0,
  repeatCustomers: 0,
  referrals: 0,
  marketingSpend: 0,
  totalCogs: 0,
  experiment: null,
  experimentHistory: [],
  energy: 100,
  stress: 15,
  focus: 80,
  skills: {
    discovery: 0,
    finance: 0,
    leadership: 0,
    negotiation: 0,
    strategy: 0,
  },
  skillPoints: 1,
  mentorTrust: { nadia: 40, marcus: 40, farah: 40 },
  negotiation: null,
  negotiationWins: 0,
  rentDiscount: 0,
  funding: "bootstrapped",
  debtBalance: 0,
  equityGiven: 0,
  milestone: "profit",
  founderLocation: "junction",
  homeLocation: "junction",
  transitPass: false,
  network: 0,
  permitLevel: 0,
  placesVisited: ["junction"],
  housingTier: "room",
  personalCash: 600,
  personalDebt: 0,
  creditScore: 650,
  health: 85,
  job: "none",
  shiftsWorked: 0,
  educationCredits: 0,
  transport: "ttc",
  ownsBike: false,
  branches: [],
  branchPermits: 1,
  residents: makeResidents(),
  socialCapital: 0,
  collaborations: 0,
  weather: "clear",
  economy: "steady",
  interestRate: 5.25,
  ttcStatus: "Good service",
  cityPolicy: "none",
  cityEvent: "Opening week across Toronto",
  cityEventLog: [],
  neighbourhoodHeat: {
    junction: 48,
    kensington: 62,
    financial: 70,
    harbour: 58,
    liberty: 68,
    yorkville: 76,
    mars: 72,
    cityhall: 55,
  },
  cityActions: 0,
  lastCityActionDay: 0,
  rivals: makeRivals(),
  leaguePoints: 0,
  alliances: 0,
  rivalWins: 0,
  seasonName: "Toronto Founder League · Season One",
  lastRivalActionDay: 0,
  leagueCodeImported: false,
  archetype: "undecided",
  characterEvent: null,
  characterArcs: { maya: 0, team: 0, mentor: 0, rival: 0, self: 0 },
  storyInbox: [
    {
      day: 1,
      from: "Toronto Founder Network",
      text: "Welcome. The city will remember how you build.",
      tone: "warm",
    },
  ],
  pendingConsequences: [],
  storyChoices: [],
  claimedMissionIds: [],
  campaignXp: 0,
  missionStreak: 0,
  runModifier: "standard",
  objectiveBaseline: { served: 0, revenue: 0, interviews: 0, socialCapital: 0 },
  objectiveStreak: 0,
  completedObjectives: 0,
  runId: "",
  activeCrisis: null,
  crisisHistory: [],
  ethicsScore: 50,
  marketShock: { days: 0, demand: 1, rent: 1, label: "Stable conditions" },
  competitors: [
    { name: "Neighbour & Co.", price: 1, reputation: 48, share: 31 },
    { name: "Urban Spark", price: 1.1, reputation: 54, share: 34 },
  ],
  segmentSales: {
    Student: 0,
    Professional: 0,
    Family: 0,
    Tourist: 0,
    "Small Business": 0,
    Corporate: 0,
  },
  customer: null,
  message: "Your neighbourhood is waiting.",
  event: "",
  dailyRevenue: 0,
  dailyExpenses: 0,
  quests: [false, false, false],
};

function money(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}

function restoreGame(prior: GameState): GameState {
  const migratedBranches = prior.branches?.length
    ? prior.branches
    : prior.business
      ? [
          {
            id: 1,
            name: `${DISTRICTS[prior.district as DistrictKey].name} Flagship`,
            city: prior.district,
            business: prior.business,
            level: 1,
            inventory: prior.capacity || 5,
            maxInventory: prior.maxCapacity || 5,
            manager: null,
            lifetimeRevenue: 0,
            propertyValue: PROPERTY_COST[prior.district as CityKey],
          },
        ]
      : [];
  return {
    ...initialState,
    ...prior,
    branches: migratedBranches,
    residents: prior.residents?.length ? prior.residents : makeResidents(),
    rivals: prior.rivals?.length ? prior.rivals : makeRivals(),
    neighbourhoodHeat: {
      ...initialState.neighbourhoodHeat,
      ...(prior.neighbourhoodHeat || {}),
    },
    skills: { ...initialState.skills, ...(prior.skills || {}) },
    mentorTrust: {
      ...initialState.mentorTrust,
      ...(prior.mentorTrust || {}),
    },
    staff: (prior.staff || []).map((member: StaffMember) => ({
      ...member,
      tenure: member.tenure || 0,
      loyalty: member.loyalty || 70,
    })),
    segmentSales: {
      ...initialState.segmentSales,
      ...(prior.segmentSales || {}),
    },
    customer: null,
    phase: "home",
  };
}
export default function Home() {
  const [game, setGame] = useState<GameState>(initialState);
  const [showHelp, setShowHelp] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showCommercial, setShowCommercial] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [editionStatus, setEditionStatus] =
    useState<EditionStatus>(COMMUNITY_STATUS);
  const [authClient, setAuthClient] = useState<SupabaseClient | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<
    "signin" | "signup" | "profile" | "recovery"
  >("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("Cloud sync waiting");
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudUpdatedAt, setCloudUpdatedAt] = useState("");
  const [cloudConflict, setCloudConflict] = useState<CloudSave | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingStatus, setBillingStatus] = useState("");
  const [showAtmosphere, setShowAtmosphere] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState("Autosave ready");
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [sound, setSound] = useState(true);
  const [ambience, setAmbience] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.65);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [selected, setSelected] = useState<BusinessKey>("coffee");
  const [opsTab, setOpsTab] = useState<OpsTab>("trade");
  const [consoleGroup, setConsoleGroup] = useState<ConsoleGroup>("business");
  const [hydrated, setHydrated] = useState(false);
  const [scenarioDraft, setScenarioDraft] = useState({
    name: "My Founder Challenge",
    cash: 1000,
    days: 20,
    difficulty: "operator" as DifficultyKey,
    business: "coffee" as BusinessKey,
    district: "junction" as DistrictKey,
    seed: 4242,
  });
  const [shareStatus, setShareStatus] = useState("");
  const [worldView, setWorldView] = useState<"city" | "business">("city");
  const [showBriefing, setShowBriefing] = useState(false);
  const [celebration, setCelebration] = useState("");
  const [selectedModifier, setSelectedModifier] =
    useState<ModifierKey>("standard");
  const [runHistory, setRunHistory] = useState<
    Array<{
      id: string;
      scenario: string;
      score: number;
      grade: string;
      modifier: ModifierKey;
      day: number;
    }>
  >([]);
  const [founderProfile, setFounderProfile] =
    useState<FounderProfile>(EMPTY_PROFILE);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadSaveWithBackup<GameState>(
        localStorage.getItem(SAVE_KEY),
        localStorage.getItem(BACKUP_SAVE_KEY),
      );
      if (loaded)
        try {
          const prior = loaded.state;
          if (loaded.recovered)
            setSaveStatus("Recovered previous autosave backup");
          setGame(restoreGame(prior));
        } catch {
          /* ignore invalid save */
        }
      setHydrated(true);
      try {
        setRunHistory(
          JSON.parse(localStorage.getItem("micro-empire-runs") || "[]"),
        );
      } catch {
        setRunHistory([]);
      }
      try {
        setFounderProfile({
          ...EMPTY_PROFILE,
          ...JSON.parse(localStorage.getItem("micro-empire-profile") || "{}"),
        });
      } catch {
        setFounderProfile(EMPTY_PROFILE);
      }
      try {
        const audio = JSON.parse(
          localStorage.getItem("micro-empire-atmosphere") || "{}",
        );
        setSound(audio.sound ?? true);
        setAmbience(audio.ambience ?? true);
        setMasterVolume(safeVolume(audio.masterVolume ?? 0.65));
        setReducedMotion(
          audio.reducedMotion ??
            window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        );
        setHighContrast(audio.highContrast ?? false);
      } catch {
        /* defaults remain active */
      }
      if (!localStorage.getItem("micro-empire-onboarding-complete") && !loaded)
        setShowOnboarding(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const current = localStorage.getItem(SAVE_KEY);
    if (current) {
      try {
        unwrapSave<GameState>(current);
        localStorage.setItem(BACKUP_SAVE_KEY, current);
      } catch {
        /* never replace a backup with corrupt data */
      }
    }
    localStorage.setItem(SAVE_KEY, serializeSave(game));
    const savedAt = new Date().toLocaleTimeString("en-CA", {
      hour: "numeric",
      minute: "2-digit",
    });
    setLastSavedAt(savedAt);
    setSaveStatus(`Saved locally at ${savedAt}`);
  }, [game, hydrated]);
  useEffect(() => {
    if (!hydrated || game.phase !== "result" || !game.runId) return;
    setRunHistory((history) => {
      if (history.some((run) => run.id === game.runId)) return history;
      const finalScore = Math.round(
        calculateFounderScore(game) * RUN_MODIFIERS[game.runModifier].score,
      );
      const next = [
        {
          id: game.runId,
          scenario: game.scenarioName,
          score: finalScore,
          grade: scoreGrade(finalScore),
          modifier: game.runModifier,
          day: game.day,
        },
        ...history,
      ].slice(0, 8);
      localStorage.setItem("micro-empire-runs", JSON.stringify(next));
      return next;
    });
  }, [game.phase, game.runId, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      "micro-empire-atmosphere",
      JSON.stringify({
        sound,
        ambience,
        masterVolume,
        reducedMotion,
        highContrast,
      }),
    );
  }, [sound, ambience, masterVolume, reducedMotion, highContrast, hydrated]);
  useEffect(() => {
    if (!hydrated || game.phase !== "result" || !game.runId) return;
    setFounderProfile((profile) => {
      if (profile.processedRuns.includes(game.runId)) return profile;
      const finalScore = Math.round(
        calculateFounderScore(game) * RUN_MODIFIERS[game.runModifier].score,
      );
      const finalGrade = scoreGrade(finalScore);
      const earned = runXp(
        finalScore,
        game.completedObjectives,
        game.claimedMissionIds.length,
      );
      const badges = earnedBadges({
        grade: finalGrade,
        ethics: game.ethicsScore,
        crises: game.crisisHistory.length,
        missions: game.claimedMissionIds.length,
        branches: game.branches.length,
      });
      const next = {
        xp: profile.xp + earned,
        completedRuns: profile.completedRuns + 1,
        processedRuns: [...profile.processedRuns, game.runId].slice(-30),
        badges: [...new Set([...profile.badges, ...badges])],
      };
      localStorage.setItem("micro-empire-profile", JSON.stringify(next));
      return next;
    });
  }, [game.phase, game.runId, hydrated]);
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .catch(() => undefined);
  }, []);
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    getSupabaseClient().then(async (client) => {
      if (!active) return;
      setAuthClient(client);
      if (!client) {
        setAuthReady(true);
        return;
      }
      const { data } = await client.auth.getSession();
      if (!active) return;
      setAuthSession(data.session);
      setAuthUser(data.session?.user || null);
      setAuthDisplayName(
        String(data.session?.user.user_metadata?.display_name || ""),
      );
      setAuthReady(true);
      const listener = client.auth.onAuthStateChange((event, session) => {
        setAuthSession(session);
        setAuthUser(session?.user || null);
        setAuthDisplayName(
          String(session?.user.user_metadata?.display_name || ""),
        );
        if (event === "PASSWORD_RECOVERY") {
          setAuthMode("recovery");
          setShowAccount(true);
        } else if (session) setAuthMode("profile");
      });
      unsubscribe = () => listener.data.subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  useEffect(() => {
    if (import.meta.env.BASE_URL !== "/") return;
    refreshEdition();
  }, [authSession]);

  async function refreshEdition() {
    if (import.meta.env.BASE_URL !== "/") return;
    return fetch("/api/edition", {
      credentials: "same-origin",
      headers: authSession?.access_token
        ? { Authorization: `Bearer ${authSession.access_token}` }
        : {},
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => setEditionStatus(normalizeEditionStatus(value)))
      .catch(() => setEditionStatus(COMMUNITY_STATUS));
  }

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get(
      "checkout",
    );
    if (!checkout) return;
    setShowCommercial(true);
    if (checkout === "cancelled") {
      setBillingStatus("Checkout cancelled. Nothing was charged.");
      return;
    }
    setBillingStatus("Payment received. Verifying your Founder Licence…");
    let checks = 0;
    const timer = window.setInterval(() => {
      checks += 1;
      void refreshEdition();
      if (checks >= 4) window.clearInterval(timer);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [authSession]);

  async function uploadCloudSave(raw?: string, expectedUpdatedAt?: string) {
    if (!authSession?.access_token) return false;
    const localRaw = raw || localStorage.getItem(SAVE_KEY);
    if (!localRaw) return false;
    setCloudBusy(true);
    setCloudStatus("Uploading encrypted session…");
    try {
      const response = await fetch("/api/cloud-save", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          save: JSON.parse(localRaw),
          expectedUpdatedAt,
        }),
      });
      const value = await response.json().catch(() => ({}));
      if (response.status === 503) {
        setCloudStatus("Cloud database setup required");
        return false;
      }
      if (response.status === 409) {
        setCloudStatus("A newer cloud snapshot needs review");
        setCloudReady(false);
        return false;
      }
      if (!response.ok) throw new Error("Cloud upload failed");
      setCloudUpdatedAt(String(value.updatedAt || ""));
      setCloudStatus("Cloud save synchronized");
      setCloudReady(true);
      return true;
    } catch {
      setCloudStatus("Offline — local autosave is protected");
      return false;
    } finally {
      setCloudBusy(false);
    }
  }

  useEffect(() => {
    if (!hydrated) return;
    if (!authSession?.access_token) {
      setCloudReady(false);
      setCloudConflict(null);
      setCloudUpdatedAt("");
      setCloudStatus(
        authClient ? "Sign in to sync across devices" : "Local saves only",
      );
      return;
    }
    let active = true;
    setCloudBusy(true);
    setCloudStatus("Checking cloud save…");
    fetch("/api/cloud-save", {
      headers: { Authorization: `Bearer ${authSession.access_token}` },
      cache: "no-store",
    })
      .then(async (response) => ({
        response,
        value: await response.json().catch(() => null),
      }))
      .then(async ({ response, value }) => {
        if (!active) return;
        if (response.status === 404) {
          setCloudBusy(false);
          await uploadCloudSave();
          return;
        }
        if (response.status === 503) {
          setCloudStatus("Cloud database setup required");
          return;
        }
        if (!response.ok) throw new Error("Cloud read failed");
        const remote = normalizeCloudSave(value);
        if (!remote) throw new Error("Invalid cloud snapshot");
        setCloudUpdatedAt(remote.updatedAt);
        const localRaw = localStorage.getItem(SAVE_KEY);
        const localSave = localRaw ? JSON.parse(localRaw) : null;
        const winner = newerSave(localSave, remote);
        if (winner === "remote") {
          setCloudConflict(remote);
          setCloudStatus("Newer progress found in the cloud");
          setShowAccount(true);
          setAuthMode("profile");
        } else if (winner === "local") {
          setCloudBusy(false);
          await uploadCloudSave(localRaw || undefined, remote.updatedAt);
        } else {
          setCloudReady(true);
          setCloudStatus("Cloud save synchronized");
        }
      })
      .catch(() => setCloudStatus("Offline — local autosave is protected"))
      .finally(() => {
        if (active) setCloudBusy(false);
      });
    return () => {
      active = false;
    };
  }, [authSession, authClient, hydrated]);

  useEffect(() => {
    if (!hydrated || !cloudReady || !authSession?.access_token) return;
    const timer = window.setTimeout(() => void uploadCloudSave(), 4000);
    return () => window.clearTimeout(timer);
  }, [game, hydrated, cloudReady, authSession]);

  function restoreCloudSave() {
    if (!cloudConflict) return;
    try {
      const raw = JSON.stringify(cloudConflict.save);
      const restored = unwrapSave<GameState>(raw);
      const current = localStorage.getItem(SAVE_KEY);
      if (current) localStorage.setItem(BACKUP_SAVE_KEY, current);
      localStorage.setItem(SAVE_KEY, raw);
      setGame(restoreGame(restored.state));
      setCloudUpdatedAt(cloudConflict.updatedAt);
      setCloudConflict(null);
      setCloudReady(true);
      setCloudStatus("Cloud progress restored on this device");
    } catch {
      setCloudStatus("Cloud snapshot could not be restored");
    }
  }

  async function keepLocalSave() {
    const remote = cloudConflict;
    setCloudConflict(null);
    if (await uploadCloudSave(undefined, remote?.updatedAt)) {
      setCloudReady(true);
      setCloudStatus("This device replaced the cloud snapshot");
    }
  }

  async function startFounderCheckout() {
    if (!authSession?.access_token) {
      setShowCommercial(false);
      setShowAccount(true);
      setAuthMode("signin");
      setAuthMessage("Sign in before starting Founder Licence checkout.");
      return;
    }
    setBillingBusy(true);
    setBillingStatus("Opening secure Stripe Checkout…");
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${authSession.access_token}` },
      });
      const value = await response.json().catch(() => ({}));
      if (response.status === 503) {
        setBillingStatus("Stripe test billing still needs configuration.");
        return;
      }
      if (!response.ok || typeof value.url !== "string")
        throw new Error("Checkout could not be started.");
      window.location.assign(value.url);
    } catch (error) {
      setBillingStatus(
        error instanceof Error
          ? error.message
          : "Checkout could not be started.",
      );
    } finally {
      setBillingBusy(false);
    }
  }

  async function submitAuth(
    action:
      "password" | "magic" | "reset" | "profile" | "new-password" | "signout",
  ) {
    if (!authClient) return;
    setAuthBusy(true);
    setAuthMessage("");
    try {
      if (action === "signout") {
        const { error } = await authClient.auth.signOut();
        if (error) throw error;
        setAuthMode("signin");
        setAuthMessage("Signed out. Your local Community save is still here.");
      } else if (action === "magic") {
        const { error } = await authClient.auth.signInWithOtp({
          email: authEmail,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setAuthMessage("Magic link sent. Check your email to continue.");
      } else if (action === "reset") {
        const { error } = await authClient.auth.resetPasswordForEmail(
          authEmail,
          {
            redirectTo: `${window.location.origin}/?recovery=1`,
          },
        );
        if (error) throw error;
        setAuthMessage("Password recovery email sent.");
      } else if (action === "profile") {
        const { error } = await authClient.auth.updateUser({
          data: { display_name: authDisplayName.trim() },
        });
        if (error) throw error;
        setAuthMessage("Founder profile updated.");
      } else if (action === "new-password") {
        const { error } = await authClient.auth.updateUser({
          password: authPassword,
        });
        if (error) throw error;
        setAuthPassword("");
        setAuthMode("profile");
        setAuthMessage("Your new password is active.");
      } else if (authMode === "signup") {
        const { data, error } = await authClient.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: authDisplayName.trim() },
          },
        });
        if (error) throw error;
        setAuthMessage(
          data.session
            ? "Account created. Welcome to Micro Empire."
            : "Account created. Check your email to confirm it.",
        );
      } else {
        const { error } = await authClient.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthMessage(
          "Signed in. Your session will stay active on this device.",
        );
      }
    } catch (error) {
      setAuthMessage(
        error instanceof Error ? error.message : "Account request failed.",
      );
    } finally {
      setAuthBusy(false);
    }
  }

  const business = game.business ? BUSINESSES[game.business] : null;
  const clock = `${game.hour > 12 ? game.hour - 12 : game.hour}:00 ${game.hour >= 12 ? "PM" : "AM"}`;
  const currentDayPhase = dayPhase(game.hour);
  const currentSoundscape = soundscapeFor(
    game.weather,
    game.hour,
    worldView === "city",
  );
  useEffect(() => {
    if (!hydrated || !sound || !ambience || game.phase !== "play") return;
    const timer = window.setInterval(() => playAmbientCue(), 9000);
    return () => window.clearInterval(timer);
  }, [
    hydrated,
    sound,
    ambience,
    masterVolume,
    game.phase,
    game.weather,
    game.hour,
    worldView,
  ]);
  const stageIndex = Math.min(
    3,
    Math.floor(((game.day - 1) / game.campaignDays) * 4),
  );
  const score = Math.round(
    calculateFounderScore(game) * RUN_MODIFIERS[game.runModifier].score,
  );
  const grade = scoreGrade(score);
  const currentFounderLevel = founderLevel(founderProfile.xp);
  const nextFounderLevel = xpToNextLevel(founderProfile.xp);
  const earnedRunXp = runXp(
    score,
    game.completedObjectives,
    game.claimedMissionIds.length,
  );
  const legacyInput = {
    cash: game.cash,
    reputation: game.reputation,
    socialCapital: game.socialCapital,
    ethics: game.ethicsScore,
    branches: game.branches.length,
    staff: game.staff.length,
    health: game.health,
    crises: game.crisisHistory.length,
  };
  const legacy = founderLegacy(legacyInput);
  const legacyScores = legacyPillars(legacyInput);
  const todayObjective = dailyObjective(game.seed, game.day);
  const objectiveNow: ObjectiveSnapshot = {
    served: game.served,
    revenue: game.revenue,
    interviews: game.interviews,
    socialCapital: game.socialCapital,
  };
  const todayObjectiveProgress = objectiveProgress(
    todayObjective,
    objectiveNow,
    game.objectiveBaseline,
  );
  const rating =
    score >= 16000
      ? "Empire Builder"
      : score >= 11000
        ? "Micro-SaaS Master"
        : score >= 6500
          ? "Growth Operator"
          : "Resilient Founder";
  const winCash = Math.round((15000 * game.campaignDays) / 30);
  const winCustomers = Math.round((100 * game.campaignDays) / 30);
  const conversion =
    game.served + game.missed ? game.served / (game.served + game.missed) : 0;
  const retention = game.served ? game.repeatCustomers / game.served : 0;
  const cac = game.acquiredCustomers
    ? game.marketingSpend / game.acquiredCustomers
    : 0;
  const averageOrder = game.served ? game.revenue / game.served : 0;
  const ltv = averageOrder * Math.min(5, 1 / Math.max(0.2, 1 - retention));
  const grossMargin = game.revenue
    ? (game.revenue - game.totalCogs) / game.revenue
    : 0;
  const weekKey = Math.floor(Date.now() / 604800000);
  const weeklyTheme = [
    "Community Builder",
    "Cash Discipline",
    "Customer Loyalty",
    "Green Toronto",
  ][weekKey % 4];
  const missionSnapshot: MissionSnapshot = {
    served: game.served,
    interviews: game.interviews,
    reputation: game.reputation,
    staff: game.staff.length,
    socialCapital: game.socialCapital,
    storyChoices: game.storyChoices.length,
    branches: game.branches.length,
    leaguePoints: game.leaguePoints,
  };
  const availableMissions = CAMPAIGN_MISSIONS.filter((mission) =>
    chapterUnlocked(mission.chapter, game.claimedMissionIds),
  );
  const campaignComplete =
    game.claimedMissionIds.length === CAMPAIGN_MISSIONS.length;
  function calculateFounderScore(g: GameState) {
    return engineScore({
      cash: g.cash,
      reputation: g.reputation,
      served: g.served,
      competitorShares: g.competitors.map((c) => c.share),
      storyDecisions: g.storyLog.length,
      locations: g.branches.length,
      socialCapital: g.socialCapital,
      leaguePoints: g.leaguePoints,
    });
  }
  function founderCoach() {
    if (game.energy < 25)
      return "Your energy is critical. Go home or protect recovery time before making another major decision.";
    if (game.personalCash < 100)
      return "Personal runway is nearly gone. Work a shift or use credit before housing costs land.";
    if (game.capacity <= 2)
      return "Your flagship is nearly out of capacity. Restock before demand arrives.";
    if (game.pmf < 50)
      return "Demand remains uncertain. Interview customers or run an experiment before expanding.";
    if (game.staff.length < 1 && game.served >= 5)
      return "You are becoming the bottleneck. Your first hire can create capacity and resilience.";
    if (game.branches.length >= game.branchPermits)
      return "Your portfolio has reached its permit ceiling. Plan the next expansion permit.";
    return `${explainDemand(cityDemand(game))} Use today to deepen a relationship or build strategic capacity.`;
  }
  function residentDialogue(id: string) {
    const r = game.residents.find((person) => person.id === id);
    if (!r) return "Let’s see what this business can do.";
    if (r.relationship >= 60)
      return `I’ve watched you build this from the beginning. I’m rooting for you.`;
    if (r.relationship >= 30)
      return `Good to see you again. People are starting to talk about this place.`;
    if (r.relationship < 0)
      return `I remember what happened last time. Show me this will be different.`;
    return r.personality === "Curious early adopter"
      ? "I’m always willing to try a thoughtful new idea."
      : `I’m looking for something that respects my time and budget.`;
  }

  function beep(tone = 520) {
    if (!sound) return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = tone;
      gain.gain.setValueAtTime(0.075 * masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      /* audio is an enhancement */
    }
  }
  function playAmbientCue() {
    if (!sound || !ambience) return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.018 * masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.4);
      gain.connect(ctx.destination);
      currentSoundscape.frequencies.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        oscillator.type = index === 0 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        oscillator.start(ctx.currentTime + index * 0.18);
        oscillator.stop(ctx.currentTime + 1.5 + index * 0.2);
      });
    } catch {
      /* ambience is optional */
    }
  }
  function openConsole(group: ConsoleGroup) {
    setConsoleGroup(group);
    setOpsTab(CONSOLE_GROUPS[group].tabs[0]);
    if (group === "city") setWorldView("city");
  }

  function startBusiness() {
    const b = BUSINESSES[selected];
    const max = selected === "coffee" ? 10 : selected === "career" ? 7 : 5;
    const modifier = RUN_MODIFIERS[game.runModifier];
    setGame({
      ...initialState,
      phase: "play",
      business: selected,
      cash: game.cash + modifier.cash - b.cost,
      reputation: game.reputation + modifier.reputation,
      capacity: max,
      maxCapacity: max,
      expenses: b.cost,
      dailyExpenses: b.cost,
      message: `${b.name} is open. Serve your first customer!`,
      district: game.district,
      founderLocation: game.district as CityKey,
      branches: [
        {
          id: 1,
          name: `${DISTRICTS[game.district].name} Flagship`,
          city: game.district as CityKey,
          business: selected,
          level: 1,
          inventory: max,
          maxInventory: max,
          manager: null,
          lifetimeRevenue: 0,
          propertyValue: PROPERTY_COST[game.district as CityKey],
        },
      ],
      difficulty: game.difficulty,
      mode: game.mode,
      campaignDays: game.campaignDays,
      scenarioName: game.scenarioName,
      seed: game.seed,
      runModifier: game.runModifier,
      runId: `${Date.now()}-${game.seed}`,
      customer: makeCustomer(
        selected,
        b.unit,
        50,
        game.district,
        1,
        1,
        game.difficulty,
        35,
        0,
        initialState.residents,
        1,
        game.seed,
        1,
        0,
      ),
      event: `Opening Day in ${DISTRICTS[game.district].name}: neighbours are curious.`,
    });
    beep(680);
    setWorldView("city");
    setConsoleGroup("business");
    setOpsTab("trade");
    if (!localStorage.getItem("micro-empire-onboarding-complete"))
      setShowOnboarding(true);
  }

  function cityDemand(g: GameState) {
    return calculateDemand(
      WEATHER[g.weather].demand * g.marketShock.demand,
      ECONOMY[g.economy].factor,
      g.neighbourhoodHeat[g.district as CityKey],
    );
  }
  function makeCustomer(
    key: BusinessKey,
    base: number,
    rep: number,
    district: DistrictKey,
    price: number,
    offer: number,
    difficulty: DifficultyKey,
    pmf: number,
    referrals: number,
    residents: Resident[] = [],
    cityFactor = 1,
    simulationSeed = 2026,
    simulationDay = 1,
    turnSalt = 0,
  ) {
    const local = DISTRICTS[district].segments;
    const all = Object.keys(SEGMENTS) as SegmentKey[];
    const roll = (salt: number) =>
      seededUnit(simulationSeed, simulationDay, turnSalt * 11 + salt);
    const segment =
      roll(1) < 0.78
        ? local[Math.floor(roll(2) * local.length)]
        : all[Math.floor(roll(3) * all.length)];
    const profile = SEGMENTS[segment];
    const offerMultiplier = [0.82, 1, 1.28][offer];
    const value = Math.round(
      base *
        price *
        offerMultiplier *
        (0.92 + roll(4) * 0.16) *
        (1 + Math.max(0, rep - 50) / 300) *
        cityFactor,
    );
    const budget = Math.round(
      profile.budget *
        (key === "coffee" ? 0.75 : key === "career" ? 1.15 : 1.8) *
        DIFFICULTIES[difficulty].budget,
    );
    const fit = local.includes(segment)
      ? "Strong local fit"
      : "Visiting segment";
    const matching = RESIDENT_PROFILES.filter((r) => r.segment === segment);
    const resident =
      matching[Math.floor(roll(5) * matching.length)] ||
      RESIDENT_PROFILES[Math.floor(roll(6) * RESIDENT_PROFILES.length)];
    const memory = residents.find((r) => r.id === resident.id);
    const returning =
      roll(7) < clamp(pmf / 180 + (memory?.loyalty || 0) / 180, 0.05, 0.78);
    const source = returning
      ? `Returning resident · loyalty ${memory?.loyalty || 10}`
      : roll(8) < clamp(referrals / 20, 0, 0.35)
        ? "Customer referral"
        : "New acquisition";
    return {
      residentId: resident.id,
      name: resident.name,
      order: ORDERS[key][Math.floor(roll(9) * ORDERS[key].length)],
      value,
      budget,
      patience: profile.patience + (returning ? 1 : 0),
      segment,
      fit,
      returning,
      source,
    };
  }

  function advance(mutator: (g: GameState) => GameState) {
    setGame((prev) => {
      let next = mutator({ ...prev });
      const strain = Math.max(
        1,
        5 - next.skills.leadership - (next.archetype === "operator" ? 1 : 0),
      );
      next = {
        ...next,
        energy: clamp(next.energy - strain, 0, 100),
        stress: clamp(
          next.stress + Math.max(1, 3 - next.skills.leadership),
          0,
          100,
        ),
        focus: clamp(next.focus + (next.energy < 25 ? -4 : 1), 0, 100),
      };
      let customer = next.customer;
      if (customer) {
        customer = { ...customer, patience: customer.patience - 1 };
        if (customer.patience <= 0) {
          next = {
            ...next,
            reputation: clamp(next.reputation - 5, 0, 100),
            pmf: clamp(next.pmf - 1, 0, 100),
            missed: next.missed + 1,
            residents: next.residents.map((r) =>
              r.id === customer!.residentId
                ? {
                    ...r,
                    relationship: clamp(r.relationship - 5, -50, 100),
                    loyalty: clamp(r.loyalty - 4, 0, 100),
                    encounters: r.encounters + 1,
                    mood: "Disappointed by the wait",
                  }
                : r,
            ),
            message: `${customer.name} left unhappy. Your relationship will remember it.`,
          };
          customer = null;
        }
      }
      const newHour = next.hour + 1;
      next = { ...next, hour: newHour, customer };
      if (!next.customer && next.business && newHour < 17)
        next.customer = makeCustomer(
          next.business,
          BUSINESSES[next.business].unit,
          next.reputation,
          next.district,
          next.price,
          next.offer,
          next.difficulty,
          next.pmf,
          next.referrals,
          next.residents,
          cityDemand(next),
          next.seed,
          next.day,
          next.served + next.missed,
        );
      if (newHour >= 17) return closeDay(next);
      return updateQuests(next);
    });
  }

  function updateQuests(g: GameState) {
    const unlocked = new Set(g.achievements);
    if (g.served >= 1) unlocked.add("first_sale");
    if (g.reputation >= 90) unlocked.add("beloved");
    if (g.staff.length >= 3) unlocked.add("team");
    if (100 - g.competitors.reduce((sum, c) => sum + c.share, 0) >= 50)
      unlocked.add("leader");
    if (g.cash >= 10000) unlocked.add("cash");
    if (g.storyLog.length >= 5) unlocked.add("judgment");
    if (unlocked.size > g.achievements.length) {
      const newest = [...unlocked].find((id) => !g.achievements.includes(id));
      if (newest)
        window.setTimeout(() => {
          setCelebration(
            `${ACHIEVEMENTS[newest as keyof typeof ACHIEVEMENTS].icon} ${ACHIEVEMENTS[newest as keyof typeof ACHIEVEMENTS].name} unlocked`,
          );
          window.setTimeout(() => setCelebration(""), 2600);
        }, 0);
    }
    return {
      ...g,
      quests: [g.served >= 30, g.reputation >= 75, g.revenue >= 12000],
      achievements: [...unlocked],
    };
  }

  function serve() {
    if (!game.customer || game.capacity <= 0) return;
    advance((g) => {
      if (!g.customer) return g;
      if (g.customer.value > g.customer.budget * 1.15) {
        return {
          ...g,
          reputation: clamp(g.reputation - 2, 0, 100),
          pmf: clamp(g.pmf - 2, 0, 100),
          missed: g.missed + 1,
          residents: g.residents.map((r) =>
            r.id === g.customer!.residentId
              ? {
                  ...r,
                  relationship: clamp(r.relationship - 3, -50, 100),
                  loyalty: clamp(r.loyalty - 2, 0, 100),
                  encounters: r.encounters + 1,
                  mood: "Price-sensitive after the offer",
                }
              : r,
          ),
          message: `${g.customer.name} declined—${money(g.customer.value)} exceeded their ${g.customer.segment.toLowerCase()} budget.`,
          customer: null,
        };
      }
      const bonus = 1 + g.decor * 0.08;
      const earned = Math.round(g.customer.value * bonus);
      const supplier = SUPPLIERS[g.supplier];
      const operatingCost = Math.round(
        [4, 11, 24][g.offer] *
          (g.business === "coffee" ? 1 : g.business === "career" ? 2 : 4) *
          supplier.cost,
      );
      const staffSkill = g.staff.reduce((sum, member) => sum + member.skill, 0);
      const rep = Math.max(
        1,
        [1, 3, 5][g.offer] +
          g.speed +
          supplier.quality +
          Math.floor(staffSkill / 3) -
          (g.energy < 25 ? 3 : g.focus < 40 ? 1 : 0),
      );
      const experimentProgress = g.experiment ? g.experiment.progress + 1 : 0;
      const experimentComplete = Boolean(
        g.experiment && experimentProgress >= g.experiment.target,
      );
      const referralsEarned =
        g.reputation >= 75 && (g.customer.returning || g.pmf >= 70) ? 1 : 0;
      const pmfGain = g.customer.fit === "Strong local fit" ? 2 : 1;
      beep(760);
      return {
        ...g,
        cash: g.cash + earned - operatingCost,
        revenue: g.revenue + earned,
        dailyRevenue: g.dailyRevenue + earned,
        expenses: g.expenses + operatingCost,
        dailyExpenses: g.dailyExpenses + operatingCost,
        dailyCogs: g.dailyCogs + operatingCost,
        totalCogs: g.totalCogs + operatingCost,
        staff: g.staff.map((member) => ({
          ...member,
          morale: clamp(
            member.morale - Math.max(0, 2 - g.skills.leadership),
            20,
            100,
          ),
        })),
        residents: g.residents.map((r) =>
          r.id === g.customer!.residentId
            ? {
                ...r,
                relationship: clamp(
                  r.relationship +
                    4 +
                    (g.customer!.returning ? 2 : 0) +
                    (g.archetype === "community" ? 2 : 0),
                  -50,
                  100,
                ),
                loyalty: clamp(r.loyalty + 5 + (g.pmf >= 70 ? 2 : 0), 0, 100),
                encounters: r.encounters + 1,
                mood: "Happy with the experience",
              }
            : r,
        ),
        served: g.served + 1,
        capacity: g.capacity - 1,
        reputation: clamp(g.reputation + rep, 0, 100),
        pmf: clamp(
          g.pmf +
            pmfGain +
            (experimentComplete ? 6 : 0) +
            (g.archetype === "visionary" ? 1 : 0),
          0,
          100,
        ),
        acquiredCustomers: g.acquiredCustomers + (g.customer.returning ? 0 : 1),
        repeatCustomers: g.repeatCustomers + (g.customer.returning ? 1 : 0),
        referrals: g.referrals + referralsEarned,
        experimentHistory:
          experimentComplete && g.experiment
            ? [...g.experimentHistory, g.experiment.type]
            : g.experimentHistory,
        experiment: experimentComplete
          ? null
          : g.experiment
            ? { ...g.experiment, progress: experimentProgress }
            : null,
        segmentSales: {
          ...g.segmentSales,
          [g.customer.segment]: (g.segmentSales[g.customer.segment] || 0) + 1,
        },
        message: experimentComplete
          ? `Experiment complete: evidence improved product-market fit by 6.`
          : `${g.customer.name} loved it! +${money(earned)} · PMF +${pmfGain}${referralsEarned ? " · Referral earned" : ""}`,
        customer: null,
      };
    });
  }

  function promote() {
    const cost = 75 + game.marketing * 25;
    if (game.cash < cost) return;
    advance((g) => ({
      ...g,
      cash: g.cash - cost,
      expenses: g.expenses + cost,
      dailyExpenses: g.dailyExpenses + cost,
      marketing: g.marketing + 1,
      marketingSpend: g.marketingSpend + cost,
      reputation: clamp(g.reputation + 7, 0, 100),
      message: `Local campaign launched. Reputation +7.`,
    }));
    beep(600);
  }

  function restock() {
    const missing = game.maxCapacity - game.capacity;
    const supplier = SUPPLIERS[game.supplier];
    const cost = Math.round(
      Math.max(
        40,
        missing *
          (game.business === "coffee"
            ? 8
            : game.business === "career"
              ? 16
              : 28),
      ) * supplier.cost,
    );
    if (!missing || game.cash < cost) return;
    const delivered =
      seededUnit(game.seed, game.day, game.hour + game.marketing) * 100 <=
      supplier.reliability
        ? game.maxCapacity
        : Math.max(game.capacity + 1, Math.round(game.maxCapacity * 0.65));
    advance((g) => ({
      ...g,
      cash: g.cash - cost,
      expenses: g.expenses + cost,
      dailyExpenses: g.dailyExpenses + cost,
      dailyCogs: g.dailyCogs + cost,
      totalCogs: g.totalCogs + cost,
      capacity: delivered,
      message:
        delivered === g.maxCapacity
          ? `${supplier.name} delivered in full for ${money(cost)}.`
          : `${supplier.name} had a shortfall—only ${delivered}/${g.maxCapacity} capacity received.`,
    }));
    beep(460);
  }

  function upgrade(kind: "speed" | "decor" | "capacity") {
    const level =
      kind === "speed"
        ? game.speed
        : kind === "decor"
          ? game.decor
          : game.maxCapacity -
            (game.business === "coffee"
              ? 10
              : game.business === "career"
                ? 7
                : 5);
    const cost = 180 + Math.max(0, level) * 120;
    if (game.cash < cost) return;
    setGame((g) => ({
      ...g,
      cash: g.cash - cost,
      expenses: g.expenses + cost,
      dailyExpenses: g.dailyExpenses + cost,
      speed: kind === "speed" ? g.speed + 1 : g.speed,
      decor: kind === "decor" ? g.decor + 1 : g.decor,
      maxCapacity: kind === "capacity" ? g.maxCapacity + 2 : g.maxCapacity,
      capacity: kind === "capacity" ? g.capacity + 2 : g.capacity,
      message: `${kind === "speed" ? "Service system" : kind === "decor" ? "Storefront" : "Capacity"} upgraded!`,
    }));
    beep(820);
  }
  function endDayEarly() {
    setGame((g) =>
      closeDay({
        ...g,
        hour: 17,
        customer: null,
        message:
          "You closed early to protect runway, energy and tomorrow’s decision quality.",
      }),
    );
    beep(390);
  }

  function closeDay(g: GameState): GameState {
    const rentPolicy = g.cityPolicy === "rentcontrol" ? 0.88 : 1;
    const rent = Math.round(
      (DISTRICTS[g.district].rent + g.day * 10) *
        DIFFICULTIES[g.difficulty].rent *
        (1 - g.rentDiscount) *
        (1 - g.skills.finance * 0.04) *
        rentPolicy *
        RUN_MODIFIERS[g.runModifier].rent *
        g.marketShock.rent *
        (0.9 + g.neighbourhoodHeat[g.district as CityKey] / 500),
    );
    const payroll = g.staff.reduce((sum, member) => sum + member.salary, 0);
    const debtPayment = Math.min(
      g.debtBalance,
      Math.round(g.debtBalance * (0.02 + g.interestRate / 350)),
    );
    const housing = BALANCE.personalHousing[g.housingTier];
    let branchRevenue = 0,
      branchCosts = 0;
    const branches = g.branches.map((branch, index) => {
      const heat = g.neighbourhoodHeat[branch.city];
      const appreciation =
        1 + ((heat - 45) / 25000) * (g.economy === "slowdown" ? 0.4 : 1);
      if (index === 0)
        return {
          ...branch,
          propertyValue: Math.round(branch.propertyValue * appreciation),
        };
      const units = Math.min(
        branch.inventory,
        1 + branch.level + (branch.manager ? 1 : 0),
      );
      const localEvent = g.cityEvent.includes(CITY[branch.city].name)
        ? 1.18
        : 1;
      const earned = Math.round(
        units *
          BUSINESSES[branch.business].unit *
          0.62 *
          (0.75 + g.pmf / 200) *
          WEATHER[g.weather].demand *
          ECONOMY[g.economy].factor *
          localEvent,
      );
      const cost = Math.round(
        earned * 0.32 +
          branch.propertyValue *
            0.012 *
            (g.cityPolicy === "rentcontrol" ? 0.9 : 1),
      );
      branchRevenue += earned;
      branchCosts += cost;
      return {
        ...branch,
        inventory: branch.inventory - units,
        lifetimeRevenue: branch.lifetimeRevenue + earned,
        propertyValue: Math.round(branch.propertyValue * appreciation),
      };
    });
    if (g.cityPolicy === "green" && g.supplier === "local")
      branchCosts = Math.round(branchCosts * 0.88);
    const objective = dailyObjective(g.seed, g.day);
    const objectiveComplete =
      objectiveProgress(
        objective,
        {
          served: g.served,
          revenue: g.revenue + branchRevenue,
          interviews: g.interviews,
          socialCapital: g.socialCapital,
        },
        g.objectiveBaseline,
      ) >= objective.target;
    const objectiveReward = objectiveComplete ? objective.reward : 0;
    const cash =
      g.cash -
      rent -
      payroll -
      debtPayment +
      branchRevenue -
      branchCosts +
      objectiveReward;
    const personalCash =
      g.personalCash - housing - Math.round(g.personalDebt * 0.015);
    const expenses = g.expenses + rent + payroll + debtPayment + branchCosts;
    const dailyExpenses =
      g.dailyExpenses + rent + payroll + debtPayment + branchCosts;
    const finished = g.day >= g.campaignDays || cash < 0;
    const playerStrength = g.reputation / Math.max(0.7, g.price);
    const rival = DIFFICULTIES[g.difficulty].rival;
    const competitors = g.competitors.map((c, i) => ({
      ...c,
      price: clamp(
        Math.round((c.price + (i ? -0.05 : 0.04) * rival) * 100) / 100,
        0.75,
        1.35,
      ),
      reputation: clamp(
        c.reputation +
          (seededUnit(g.seed, g.day, 700 + i) > 0.45
            ? Math.round(2 * rival)
            : -1),
        25,
        95,
      ),
      share: clamp(
        Math.round(c.share + (c.reputation - g.reputation) / (18 / rival)),
        12,
        55,
      ),
    }));
    const playerShare = clamp(
      Math.round(
        100 -
          competitors.reduce((s, c) => s + c.share, 0) +
          playerStrength / 12,
      ),
      10,
      65,
    );
    competitors[0].share = Math.round((100 - playerShare) * 0.48);
    competitors[1].share = 100 - playerShare - competitors[0].share;
    return updateQuests({
      ...g,
      branches,
      cash,
      revenue: g.revenue + branchRevenue,
      dailyRevenue: g.dailyRevenue + branchRevenue,
      personalCash,
      creditScore: clamp(
        g.creditScore + (personalCash >= 0 ? 2 : -12),
        300,
        850,
      ),
      health: clamp(g.health + (g.energy > 45 ? 2 : -4), 0, 100),
      stress: clamp(g.stress + (personalCash < 0 ? 10 : 0), 0, 100),
      expenses,
      dailyExpenses,
      dailyPayroll: payroll,
      objectiveStreak: objectiveComplete ? g.objectiveStreak + 1 : 0,
      completedObjectives: g.completedObjectives + (objectiveComplete ? 1 : 0),
      marketShock:
        g.marketShock.days > 1
          ? { ...g.marketShock, days: g.marketShock.days - 1 }
          : { days: 0, demand: 1, rent: 1, label: "Stable conditions" },
      debtBalance: Math.max(0, g.debtBalance - debtPayment),
      competitors,
      customer: null,
      phase: finished ? "result" : "dayEnd",
      message:
        cash < 0
          ? "The business ran out of cash."
          : `Day ${g.day} complete. Branches produced ${money(branchRevenue - branchCosts)} net · ${objectiveComplete ? `${objective.title} completed for ${money(objectiveReward)} · ` : ""}Housing ${money(housing)} · Payroll ${money(payroll)}.`,
    });
  }

  function beginNextDay(base?: GameState) {
    const events = [
      {
        text: "Supplier discount: capacity fully restored",
        apply: (g: GameState) => ({ ...g, capacity: g.maxCapacity }),
      },
      {
        text: "Viral neighbourhood post: reputation +10",
        apply: (g: GameState) => ({
          ...g,
          reputation: clamp(g.reputation + 10, 0, 100),
        }),
      },
      {
        text: "Rainy morning: reputation -3, but loyal customers remain",
        apply: (g: GameState) => ({
          ...g,
          reputation: clamp(g.reputation - 3, 0, 100),
        }),
      },
      {
        text: "Community festival: $120 sponsorship cost, reputation +12",
        apply: (g: GameState) => ({
          ...g,
          cash: g.cash - 120,
          expenses: g.expenses + 120,
          reputation: clamp(g.reputation + 12, 0, 100),
        }),
      },
      {
        text: "Corporate enquiry: today’s customers pay 15% more",
        apply: (g: GameState) => ({
          ...g,
          reputation: clamp(g.reputation + 4, 0, 100),
        }),
      },
    ];
    const eventDay = (base || game).day + 1;
    const ev =
      events[
        Math.floor(
          seededUnit((base || game).seed, eventDay, 909) * events.length,
        )
      ];
    setGame((current) => {
      const g = base || current;
      const nextDayNumber = g.day + 1;
      const nextStage = Math.min(
        3,
        Math.floor(((nextDayNumber - 1) / g.campaignDays) * 4),
      );
      const stageUp = nextStage > g.stageRewarded;
      if (stageUp)
        window.setTimeout(() => {
          setCelebration(
            `${STAGES[nextStage].icon} ${STAGES[nextStage].name} reached`,
          );
          window.setTimeout(() => setCelebration(""), 3000);
        }, 0);
      const grant = 750 + g.skills.strategy * 150;
      const weather = (
        ["clear", "rain", "clear", "snow", "clear", "heat"] as WeatherKey[]
      )[(nextDayNumber + g.seed) % 6];
      const economy: EconomyKey =
        nextDayNumber % 11 >= 8
          ? "slowdown"
          : nextDayNumber % 7 <= 2
            ? "growth"
            : "steady";
      const interestRate =
        economy === "growth" ? 5.75 : economy === "slowdown" ? 4.25 : 5.25;
      const ttcStatus =
        nextDayNumber % 7 === 0
          ? "Line closure"
          : nextDayNumber % 4 === 0
            ? "Major delays"
            : "Good service";
      const policy: PolicyKey =
        nextDayNumber % 12 >= 9
          ? "green"
          : nextDayNumber % 12 >= 6
            ? "rentcontrol"
            : nextDayNumber % 12 >= 3
              ? "smallbiz"
              : "none";
      const cityEvents = [
        "Kensington Night Market",
        "Toronto Tech Week at MaRS",
        "Harbourfront Tourism Surge",
        "Liberty Village Construction",
        "Financial District Conference",
        "Junction Street Festival",
      ];
      const cityEvent = cityEvents[nextDayNumber % cityEvents.length];
      const neighbourhoodHeat = Object.fromEntries(
        (Object.keys(g.neighbourhoodHeat) as CityKey[]).map((key, i) => [
          key,
          clamp(
            g.neighbourhoodHeat[key] +
              (((nextDayNumber + i) % 3) - 1) * 3 +
              (economy === "growth" ? 2 : economy === "slowdown" ? -2 : 0),
            25,
            95,
          ),
        ]),
      ) as Record<CityKey, number>;
      const playerScore = calculateFounderScore(g);
      const rivals = simulateRivalDay(g.rivals, nextDayNumber, economy);
      const leagueGain = rivals.filter((r) => playerScore > r.score).length;
      const characterEvent =
        nextDayNumber === 3
          ? "maya_intro"
          : nextDayNumber === 8 && g.staff.length
            ? "team_future"
            : nextDayNumber === 12 && g.characterArcs.maya > 0
              ? "maya_return"
              : nextDayNumber === 14
                ? "mentor_test"
                : nextDayNumber === 18
                  ? "rival_offer"
                  : nextDayNumber === 22
                    ? "identity"
                    : null;
      let next = ev.apply({
        ...g,
        day: nextDayNumber,
        hour: 9,
        phase: "play",
        weather,
        economy,
        interestRate,
        ttcStatus,
        cityPolicy: policy,
        cityEvent,
        characterEvent,
        neighbourhoodHeat,
        rivals,
        leaguePoints: g.leaguePoints + leagueGain,
        cityEventLog: [
          `${nextDayNumber}: ${cityEvent} · ${WEATHER[weather].name} · ${ECONOMY[economy].name}`,
          ...g.cityEventLog,
        ].slice(0, 8),
        event: stageUp
          ? `${STAGES[nextStage].name} unlocked! ${money(grant)} grant, +3 capacity and a skill point.`
          : `${cityEvent}. ${WEATHER[weather].note}.`,
        dailyRevenue: 0,
        dailyExpenses: 0,
        dailyCogs: 0,
        dailyPayroll: 0,
        objectiveBaseline: {
          served: g.served,
          revenue: g.revenue,
          interviews: g.interviews,
          socialCapital: g.socialCapital,
        },
        decision: null,
        cash: g.cash + (stageUp ? grant : 0),
        skillPoints: g.skillPoints + (stageUp ? 1 : 0),
        energy: clamp(
          g.energy + (g.housingTier === "studio" ? 27 : 18),
          0,
          100,
        ),
        stress: clamp(
          g.stress - (g.housingTier === "studio" ? 18 : 12),
          0,
          100,
        ),
        focus: clamp(g.focus + 10, 0, 100),
        maxCapacity: g.maxCapacity + (stageUp ? 3 : 0),
        capacity: stageUp ? g.maxCapacity + 3 : g.capacity,
        reputation: clamp(g.reputation + (stageUp ? 5 : 0), 0, 100),
        stageRewarded: Math.max(g.stageRewarded, nextStage),
        staff: g.staff.map((member) => ({
          ...member,
          tenure: member.tenure + 1,
          loyalty: clamp(
            member.loyalty + (member.morale >= 70 ? 2 : -2),
            20,
            100,
          ),
          morale: clamp(member.morale + 8, 20, 100),
        })),
        residents: g.residents.map((r, i) => {
          const destinations: CityKey[] = [
            r.home,
            "financial",
            "liberty",
            "mars",
            "harbour",
            "kensington",
            "cityhall",
          ];
          const location =
            destinations[(nextDayNumber + i) % destinations.length];
          return {
            ...r,
            location,
            mood:
              r.relationship >= 40
                ? "Looking forward to seeing you"
                : r.loyalty >= 35
                  ? "Open to another visit"
                  : ["Busy", "Curious", "Social", "Price-conscious"][
                      (i + nextDayNumber) % 4
                    ],
          };
        }),
        message: stageUp
          ? `Welcome to ${STAGES[nextStage].name}. Your operating ceiling just expanded.`
          : `Day ${nextDayNumber} begins. ${ev.text}`,
      });
      const due = g.pendingConsequences.filter(
        (c) => c.dueDay <= nextDayNumber,
      );
      next = {
        ...next,
        pendingConsequences: g.pendingConsequences.filter(
          (c) => c.dueDay > nextDayNumber,
        ),
      };
      for (const consequence of due) {
        if (consequence.key === "maya_showcase")
          next = {
            ...next,
            reputation: clamp(next.reputation + 8, 0, 100),
            socialCapital: clamp(next.socialCapital + 8, 0, 100),
            storyInbox: [
              {
                day: nextDayNumber,
                from: "Maya",
                text: "The showcase brought new people into the neighbourhood. They remember who helped.",
                tone: "warm",
              },
              ...next.storyInbox,
            ],
          };
        if (consequence.key === "team_trust")
          next = {
            ...next,
            staff: next.staff.map((m) => ({
              ...m,
              loyalty: clamp(m.loyalty + 12, 0, 100),
              morale: clamp(m.morale + 8, 20, 100),
            })),
            storyInbox: [
              {
                day: nextDayNumber,
                from: "Your Team",
                text: "The leadership path changed how we see our future here.",
                tone: "warm",
              },
              ...next.storyInbox,
            ],
          };
        if (consequence.key === "mentor_discipline")
          next = {
            ...next,
            energy: clamp(next.energy + 18, 0, 100),
            focus: clamp(next.focus + 12, 0, 100),
            storyInbox: [
              {
                day: nextDayNumber,
                from: "Nadia Chen",
                text: "Discipline compounds quietly. Your systems are beginning to show it.",
                tone: "mentor",
              },
              ...next.storyInbox,
            ],
          };
        if (consequence.key === "rival_reciprocity")
          next = {
            ...next,
            leaguePoints: next.leaguePoints + 20,
            network: clamp(next.network + 10, 0, 100),
            storyInbox: [
              {
                day: nextDayNumber,
                from: "Claire Wong",
                text: "Our shared event worked. I sent two more founders your way.",
                tone: "rival",
              },
              ...next.storyInbox,
            ],
          };
      }
      if (next.business)
        next.customer = makeCustomer(
          next.business,
          BUSINESSES[next.business].unit,
          next.reputation,
          next.district,
          next.price,
          next.offer,
          next.difficulty,
          next.pmf,
          next.referrals,
          next.residents,
          cityDemand(next),
          next.seed,
          next.day,
          next.served + next.missed,
        );
      return next;
    });
    setShowBriefing(true);
    beep(650);
  }

  function continueCampaign() {
    const crisis = crisisForDay(game.seed, game.day + 1);
    const story = NARRATIVES[game.day + 1];
    const negotiation = NEGOTIATIONS[game.day + 1];
    if (shouldTriggerCrisis(game.day + 1))
      setGame((g) => ({ ...g, phase: "crisis", activeCrisis: crisis.id }));
    else if (negotiation)
      setGame((g) => ({
        ...g,
        phase: "negotiation",
        negotiation: negotiation.id,
      }));
    else if (story)
      setGame((g) => ({ ...g, phase: "decision", decision: story.id }));
    else beginNextDay();
  }

  function resolveCrisis(choice: "a" | "b") {
    setGame((g) => {
      const crisis = CRISES.find((item) => item.id === g.activeCrisis);
      if (!crisis) return g;
      const selected = crisis[choice];
      const effect = selected.effect;
      const next: GameState = {
        ...g,
        activeCrisis: null,
        crisisHistory: [...g.crisisHistory, `${crisis.id}:${choice}`],
        cash: g.cash + effect.cash,
        revenue: g.revenue + Math.max(0, effect.cash),
        expenses: g.expenses + Math.max(0, -effect.cash),
        reputation: clamp(g.reputation + effect.reputation, 0, 100),
        ethicsScore: clamp(g.ethicsScore + effect.ethics, 0, 100),
        marketShock: {
          days: effect.days,
          demand: effect.demand,
          rent: effect.rent,
          label: crisis.title,
        },
        staff: g.staff.map((member) => ({
          ...member,
          morale: clamp(member.morale + effect.morale, 20, 100),
        })),
        storyInbox: [
          {
            day: g.day,
            from: "Toronto Business Desk",
            text: `${crisis.title}: ${selected.label}. The consequences will shape the next ${effect.days} day${effect.days === 1 ? "" : "s"}.`,
            tone: effect.ethics < 0 ? "urgent" : "warm",
          },
          ...g.storyInbox,
        ],
        message: `${selected.label}. ${selected.note}.`,
      };
      window.setTimeout(() => beginNextDay(next), 0);
      return next;
    });
    beep(choice === "a" ? 760 : 520);
  }

  function resolveDecision(choice: "a" | "b") {
    setGame((g) => {
      const id = g.decision;
      let next = { ...g, storyLog: [...g.storyLog, `${id}:${choice}`] };
      if (id === "review")
        next =
          choice === "a"
            ? {
                ...next,
                cash: next.cash - 120,
                expenses: next.expenses + 120,
                reputation: clamp(next.reputation + 9, 0, 100),
              }
            : {
                ...next,
                reputation: clamp(next.reputation - 4, 0, 100),
                staff: next.staff.map((m) => ({
                  ...m,
                  morale: clamp(m.morale + 12, 20, 100),
                })),
              };
      if (id === "festival")
        next =
          choice === "a"
            ? {
                ...next,
                cash: next.cash - 350,
                expenses: next.expenses + 350,
                reputation: clamp(next.reputation + 14, 0, 100),
              }
            : { ...next, cash: next.cash + 120, revenue: next.revenue + 120 };
      if (id === "corporate")
        next =
          choice === "a"
            ? {
                ...next,
                cash: next.cash + 1400,
                revenue: next.revenue + 1400,
                reputation: clamp(next.reputation - 7, 0, 100),
              }
            : { ...next, reputation: clamp(next.reputation + 8, 0, 100) };
      if (id === "talent")
        next =
          choice === "a"
            ? {
                ...next,
                cash: next.cash - 500,
                expenses: next.expenses + 500,
                staff: next.staff.map((m) => ({
                  ...m,
                  morale: clamp(m.morale + 18, 20, 100),
                })),
              }
            : {
                ...next,
                staff: [...next.staff]
                  .sort((a, b) => b.skill - a.skill)
                  .slice(1),
              };
      if (id === "investor")
        next =
          choice === "a"
            ? { ...next, cash: next.cash + 3000, price: 1.3 }
            : {
                ...next,
                reputation: clamp(next.reputation + 12, 0, 100),
                maxCapacity: next.maxCapacity + 3,
                capacity: next.capacity + 3,
              };
      window.setTimeout(() => beginNextDay(next), 0);
      return next;
    });
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    setGame(initialState);
    setSelected("coffee");
    setWorldView("city");
    setConsoleGroup("business");
    setOpsTab("trade");
    setSelectedModifier("standard");
    beep(400);
  }

  function completeOnboarding() {
    localStorage.setItem("micro-empire-onboarding-complete", "true");
    setShowOnboarding(false);
    setOnboardingStep(0);
    beep(760);
  }

  function exportPlayerData() {
    const backup = portableBackup({
      game,
      runHistory,
      founderProfile,
      atmosphere: {
        sound,
        ambience,
        masterVolume,
        reducedMotion,
        highContrast,
      },
    });
    navigator.clipboard?.writeText(backup);
    setSaveStatus("Portable backup copied to clipboard");
    beep(820);
  }

  function importPlayerData() {
    const raw = window.prompt("Paste a Micro Empire V5.9 backup:");
    if (!raw) return;
    try {
      const data = readPortableBackup<{
        game: GameState;
        runHistory: typeof runHistory;
        founderProfile: FounderProfile;
        atmosphere?: {
          sound?: boolean;
          ambience?: boolean;
          masterVolume?: number;
          reducedMotion?: boolean;
          highContrast?: boolean;
        };
      }>(raw);
      setGame({ ...initialState, ...data.game, phase: "home", customer: null });
      setRunHistory(data.runHistory || []);
      setFounderProfile({ ...EMPTY_PROFILE, ...(data.founderProfile || {}) });
      if (data.atmosphere) {
        setSound(data.atmosphere.sound ?? true);
        setAmbience(data.atmosphere.ambience ?? true);
        setMasterVolume(safeVolume(data.atmosphere.masterVolume ?? 0.65));
        setReducedMotion(data.atmosphere.reducedMotion ?? false);
        setHighContrast(data.atmosphere.highContrast ?? false);
      }
      setSaveStatus("Portable backup imported successfully");
      setShowAtmosphere(false);
    } catch {
      setSaveStatus("Import failed: backup was not recognized");
    }
  }

  function recoverPreviousSave() {
    const recovered = loadSaveWithBackup<GameState>(
      null,
      localStorage.getItem(BACKUP_SAVE_KEY),
    );
    if (!recovered) {
      setSaveStatus("No valid previous autosave is available");
      return;
    }
    setGame({
      ...initialState,
      ...recovered.state,
      phase: "home",
      customer: null,
    });
    setSaveStatus("Previous autosave recovered");
    setShowAtmosphere(false);
  }

  function prepareDailyChallenge() {
    const dateKey = Number(
      new Date().toISOString().slice(0, 10).replaceAll("-", ""),
    );
    const businesses = Object.keys(BUSINESSES) as BusinessKey[];
    const districts = Object.keys(DISTRICTS) as DistrictKey[];
    const businessKey = businesses[dateKey % businesses.length];
    const district = districts[Math.floor(dateKey / 3) % districts.length];
    setSelected(businessKey);
    setGame({
      ...initialState,
      phase: "district",
      business: businessKey,
      district,
      difficulty: "mogul",
      mode: "daily",
      campaignDays: 14,
      cash: 850,
      scenarioName: `Daily Challenge · ${new Date().toLocaleDateString("en-CA")}`,
      seed: dateKey,
      runModifier: "pressure",
    });
  }

  function launchFounderTrial(id: string) {
    const trial = FOUNDER_TRIALS.find((item) => item.id === id);
    if (!trial || currentFounderLevel.level < trial.level) return;
    setSelected(trial.business as BusinessKey);
    setSelectedModifier(trial.modifier as ModifierKey);
    setGame({
      ...initialState,
      phase: "district",
      business: trial.business as BusinessKey,
      district: trial.district as DistrictKey,
      difficulty: trial.difficulty as DifficultyKey,
      mode: "custom",
      campaignDays: trial.days,
      cash: trial.cash,
      scenarioName: trial.name,
      seed: trial.seed,
      runModifier: trial.modifier as ModifierKey,
    });
  }

  function launchCustomScenario() {
    setSelected(scenarioDraft.business);
    setGame({
      ...initialState,
      phase: "district",
      business: scenarioDraft.business,
      district: scenarioDraft.district,
      difficulty: scenarioDraft.difficulty,
      mode: "custom",
      campaignDays: scenarioDraft.days,
      cash: scenarioDraft.cash,
      scenarioName: scenarioDraft.name,
      seed: scenarioDraft.seed,
      runModifier: selectedModifier,
    });
  }

  function scenarioCode() {
    return btoa(unescape(encodeURIComponent(JSON.stringify(scenarioDraft))));
  }
  function shareScenario() {
    navigator.clipboard?.writeText(scenarioCode());
    setShareStatus("Challenge code copied");
    window.setTimeout(() => setShareStatus(""), 1800);
  }
  function importScenario(code: string) {
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      setScenarioDraft({ ...scenarioDraft, ...data });
      setShareStatus("Challenge imported");
    } catch {
      setShareStatus("Invalid challenge code");
    }
  }
  function shareScore() {
    const text = `Micro Empire · ${game.scenarioName}\nScore ${score.toLocaleString()} · ${rating}\n${money(game.cash)} cash · ${game.reputation} reputation · ${game.served} customers\nhttps://microempire.ca/`;
    navigator.clipboard?.writeText(text);
    setShareStatus("Scorecard copied");
  }

  function interviewCustomer() {
    if (game.cash < 25) return;
    advance((g) => ({
      ...g,
      cash: g.cash - 25,
      expenses: g.expenses + 25,
      dailyExpenses: g.dailyExpenses + 25,
      interviews: g.interviews + 1,
      insights: g.insights + 1,
      pmf: clamp(g.pmf + 2 + g.skills.discovery, 0, 100),
      message: `Interview insight #${g.insights + 1}: ${DISTRICTS[g.district].segments[g.insights % 3]} customers value ${g.offer === 2 ? "proof and premium outcomes" : g.price > 1 ? "clear v…16909 tokens truncated…et—learn who responds.</small>
              )}
            </div>
            <div className="achievement-mini">
              <h3>Achievements · {game.achievements.length}/6</h3>
              {game.achievements.slice(-3).map((id) => (
                <i
                  key={id}
                  title={ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS].name}
                >
                  {ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS].icon}
                </i>
              ))}
            </div>
          </aside>

          {worldView === "business" ? (
            <div className="world-panel">
              <button
                className="map-switch"
                onClick={() => setWorldView("city")}
              >
                ⌖ Toronto map
              </button>
              <Neighbourhood
                active={game.business!}
                people={Math.min(
                  10,
                  3 + game.marketing + Math.floor(game.reputation / 20),
                )}
              />
              <div className="store-sign">
                {business.icon} {business.name}
                <small>
                  OPEN · {game.capacity}/{game.maxCapacity} {business.stock}
                </small>
              </div>
              {game.customer ? (
                <div className="customer-card">
                  <div className="avatar">{game.customer.name[0]}</div>
                  <div>
                    <small>
                      {game.customer.source.toUpperCase()} ·{" "}
                      {SEGMENTS[game.customer.segment].icon}{" "}
                      {game.customer.segment.toUpperCase()}
                    </small>
                    <strong>{game.customer.name}</strong>
                    <span>
                      {game.customer.order} · Price {money(game.customer.value)}{" "}
                      ·{" "}
                      {game.insights >= 3
                        ? `Budget ${money(game.customer.budget)}`
                        : "Budget signal locked—interview customers"}
                    </span>
                    <small>
                      {
                        game.residents.find(
                          (r) => r.id === game.customer?.residentId,
                        )?.role
                      }{" "}
                      · Relationship{" "}
                      {game.residents.find(
                        (r) => r.id === game.customer?.residentId,
                      )?.relationship || 0}
                    </small>
                    <em className="customer-dialogue">
                      “{residentDialogue(game.customer.residentId)}”
                    </em>
                    <div className="patience">
                      <i
                        style={{
                          width: `${(game.customer.patience / 3) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="customer-card quiet">
                  Waiting for the next customer…
                </div>
              )}
              <div className="toast" aria-live="polite">
                {game.message}
              </div>
            </div>
          ) : (
            <div className="city-world">
              <div className="city-map-head">
                <span>
                  <small>LIVE TORONTO</small>
                  <b>
                    {clock} · Day {game.day} · {TRANSPORT[game.transport].name}
                  </b>
                </span>
                <div>
                  <button
                    onClick={buyTransitPass}
                    disabled={game.transitPass || game.personalCash < 180}
                  >
                    {game.transitPass
                      ? "TTC Pass active"
                      : "Buy TTC Pass · $180"}
                  </button>
                  <button onClick={() => setWorldView("business")}>
                    Open business view
                  </button>
                </div>
              </div>
              <div className={`toronto-map hour-${game.hour}`}>
                <div className="city-horizon" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <b />
                </div>
                <div className="city-blocks" aria-hidden="true">
                  {Array.from({ length: 18 }, (_, index) => (
                    <i key={index}>
                      <b />
                    </i>
                  ))}
                </div>
                <div className="city-traffic" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="lake-label">LAKE ONTARIO</div>
                <div className="city-roads" />
                <div className="ttc-line" />
                <div className="cn-map">
                  ⌃<small>CN</small>
                </div>
                {(Object.keys(CITY) as CityKey[]).map((key) => (
                  <button
                    key={key}
                    style={{ left: `${CITY[key].x}%`, top: `${CITY[key].y}%` }}
                    className={`city-place ${game.founderLocation === key ? "current" : ""} ${game.placesVisited.includes(key) ? "visited" : ""}`}
                    onClick={() => travelTo(key)}
                  >
                    <i>{CITY[key].icon}</i>
                    <span>
                      <b>{CITY[key].name}</b>
                      <small>{CITY[key].kind}</small>
                    </span>
                    {game.founderLocation === key && <em>YOU</em>}
                  </button>
                ))}
                <div
                  className="founder-marker"
                  style={{
                    left: `${CITY[game.founderLocation].x}%`,
                    top: `${CITY[game.founderLocation].y}%`,
                  }}
                >
                  ●
                </div>
              </div>
              <div className="place-drawer">
                <span>
                  <small>{CITY[game.founderLocation].kind.toUpperCase()}</small>
                  <b>{CITY[game.founderLocation].name}</b>
                  <em>{CITY[game.founderLocation].signal}</em>
                </span>
                <button onClick={cityAction}>
                  {game.founderLocation === game.homeLocation
                    ? "Recover at home"
                    : game.founderLocation === (game.district as CityKey)
                      ? "Enter your business"
                      : game.founderLocation === "mars"
                        ? "Attend workshop · $80"
                        : game.founderLocation === "cityhall"
                          ? `Upgrade permit · $100`
                          : game.founderLocation === "financial"
                            ? "Meet a banker"
                            : game.founderLocation === "yorkville"
                              ? "Meet investors"
                              : "Explore opportunity"}
                </button>
                {game.founderLocation === game.homeLocation && (
                  <button
                    onClick={upgradeHousing}
                    disabled={
                      game.housingTier === "studio" || game.personalCash < 800
                    }
                  >
                    {game.housingTier === "studio"
                      ? "Studio home active"
                      : "Upgrade to studio · $800"}
                  </button>
                )}
              </div>
              <div className="toast city-toast">{game.message}</div>
            </div>
          )}

          <aside className="action-panel">
            <h3>Founder console</h3>
            <div
              className={`daily-objective ${todayObjectiveProgress >= todayObjective.target ? "complete" : ""}`}
            >
              <i>{todayObjective.icon}</i>
              <span>
                <small>
                  DAY {game.day} OBJECTIVE · {game.objectiveStreak} DAY STREAK
                </small>
                <b>{todayObjective.title}</b>
                <em>
                  {todayObjective.note} · Reward {money(todayObjective.reward)}
                </em>
                <u>
                  <strong
                    style={{
                      width: `${(todayObjectiveProgress / todayObjective.target) * 100}%`,
                    }}
                  />
                </u>
              </span>
              <strong>
                {todayObjectiveProgress}/{todayObjective.target}
              </strong>
            </div>
            <div className="founder-coach">
              <i>✦</i>
              <span>
                <small>FOUNDER COACH</small>
                {founderCoach()}
              </span>
            </div>
            <div className="console-primary">
              {(Object.keys(CONSOLE_GROUPS) as ConsoleGroup[]).map((group) => (
                <button
                  key={group}
                  className={consoleGroup === group ? "active" : ""}
                  onClick={() => openConsole(group)}
                >
                  <i>{CONSOLE_GROUPS[group].icon}</i>
                  <span>{CONSOLE_GROUPS[group].label}</span>
                </button>
              ))}
            </div>
            <div className="ops-tabs contextual">
              {CONSOLE_GROUPS[consoleGroup].tabs.map((tab) => (
                <button
                  key={tab}
                  className={opsTab === tab ? "active" : ""}
                  onClick={() => setOpsTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {opsTab === "trade" && (
              <>
                <div className="strategy-box">
                  <h4>Market strategy</h4>
                  <div className="price-control">
                    <button
                      onClick={() => adjustPrice(-0.1)}
                      aria-label="Lower price"
                    >
                      −
                    </button>
                    <span>
                      <small>PRICE INDEX</small>
                      <b>{Math.round(game.price * 100)}%</b>
                    </span>
                    <button
                      onClick={() => adjustPrice(0.1)}
                      aria-label="Raise price"
                    >
                      +
                    </button>
                  </div>
                  <label>
                    Operating model
                    <select
                      value={game.offer}
                      onChange={(e) =>
                        setGame((g) => ({
                          ...g,
                          offer: Number(e.target.value),
                          message: `${OFFERS[g.business!].names[Number(e.target.value)]} is now your operating model.`,
                        }))
                      }
                    >
                      {OFFERS[game.business!].names.map(
                        (name: string, i: number) => (
                          <option key={name} value={i}>
                            {name}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <small>{OFFERS[game.business!].notes[game.offer]}</small>
                </div>
                <button
                  className="action serve"
                  onClick={serve}
                  disabled={!game.customer || game.capacity <= 0}
                >
                  <b>Serve customer</b>
                  <span>Earn revenue · build reputation</span>
                </button>
                <button
                  className="action"
                  onClick={restock}
                  disabled={game.capacity === game.maxCapacity}
                >
                  <b>Restock</b>
                  <span>Via {SUPPLIERS[game.supplier].name}</span>
                </button>
                <button className="action" onClick={promote}>
                  <b>Local marketing</b>
                  <span>{money(75 + game.marketing * 25)} · reputation +7</span>
                </button>
                <button className="action close-early" onClick={endDayEarly}>
                  <b>Close for the day</b>
                  <span>Skip remaining hours · settle today’s books</span>
                </button>
                <div className="upgrade-box">
                  <h4>Upgrades</h4>
                  <button onClick={() => upgrade("speed")}>
                    <span>⚡ Service</span>
                    <b>Lv {game.speed}</b>
                  </button>
                  <button onClick={() => upgrade("decor")}>
                    <span>✦ Storefront</span>
                    <b>Lv {game.decor}</b>
                  </button>
                  <button onClick={() => upgrade("capacity")}>
                    <span>▦ Capacity</span>
                    <b>{game.maxCapacity}</b>
                  </button>
                </div>
              </>
            )}
            {opsTab === "team" && (
              <div className="ops-list">
                <h4>
                  Your team ·{" "}
                  {money(game.staff.reduce((s, m) => s + m.salary, 0))}/day
                </h4>
                {game.staff.map((member) => (
                  <article key={member.id}>
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                    <small>
                      Skill {member.skill}/5 · Morale {member.morale}% · Loyalty{" "}
                      {member.loyalty}%
                    </small>
                    <small>Tenure {member.tenure} days</small>
                    <button
                      onClick={() => trainStaff(member.id)}
                      disabled={member.skill >= 5}
                    >
                      Train {money(110)}
                    </button>
                  </article>
                ))}
                {game.staff.length < 3 && (
                  <button
                    className="action hire"
                    onClick={hireStaff}
                    disabled={game.cash < 150}
                  >
                    <b>Hire next specialist</b>
                    <span>{money(150)} hiring · daily salary applies</span>
                  </button>
                )}
              </div>
            )}
            {opsTab === "supply" && (
              <div className="ops-list">
                <h4>Supplier network</h4>
                {(Object.keys(SUPPLIERS) as SupplierKey[]).map((key) => (
                  <button
                    key={key}
                    className={`supplier-card ${game.supplier === key ? "active" : ""}`}
                    onClick={() =>
                      setGame((g) => ({
                        ...g,
                        supplier: key,
                        message: `${SUPPLIERS[key].name} selected as supplier.`,
                      }))
                    }
                  >
                    <b>{SUPPLIERS[key].name}</b>
                    <span>{SUPPLIERS[key].note}</span>
                    <small>
                      Reliability {SUPPLIERS[key].reliability}% · Quality{" "}
                      {SUPPLIERS[key].quality > 0 ? "+" : ""}
                      {SUPPLIERS[key].quality}
                    </small>
                  </button>
                ))}
              </div>
            )}
            {opsTab === "market" && (
              <div className="ops-list">
                <h4>Competitive market</h4>
                <div className="market-share">
                  <i style={{ width: `${playerMarketShare()}%` }} />
                  <b>You {playerMarketShare()}%</b>
                </div>
                {game.competitors.map((c) => (
                  <article key={c.name}>
                    <strong>{c.name}</strong>
                    <span>{c.share}% share</span>
                    <small>
                      Price {Math.round(c.price * 100)}% · Reputation{" "}
                      {c.reputation}
                    </small>
                  </article>
                ))}
                <p className="intel">
                  Competitors adjust price and reputation after every day. Your
                  market share responds to both.
                </p>
              </div>
            )}
            {opsTab === "council" && (
              <div className="ops-list adviser-list">
                <h4>Agentic advisory council</h4>
                <p className="intel">
                  Advisers optimize different goals. Following one may reduce
                  trust with the others.
                </p>
                {(
                  [
                    "finance",
                    "marketing",
                    "people",
                    "operations",
                  ] as AdviserKey[]
                ).map((key) => {
                  const a = adviserAdvice(key);
                  return (
                    <article key={key}>
                      <div className="adviser-head">
                        <i>{a.icon}</i>
                        <span>
                          <strong>
                            {a.name} · {a.role}
                          </strong>
                          <small>
                            Confidence {a.confidence}% · Trust{" "}
                            {game.adviserTrust[key]}%
                          </small>
                        </span>
                      </div>
                      <p>{a.text}</p>
                      <button onClick={() => followAdvice(key)}>
                        {a.action}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
            {opsTab === "lab" && (
              <div className="ops-list validation-lab">
                <h4>Validation lab</h4>
                <button
                  className="action interview"
                  onClick={interviewCustomer}
                >
                  <b>Interview a customer</b>
                  <span>{money(25)} · reveals demand · PMF +2</span>
                </button>
                <div className="insight-count">
                  <b>{game.interviews}</b>
                  <span>interviews</span>
                  <b>{game.insights}</b>
                  <span>insights</span>
                </div>
                <h4>Run an experiment</h4>
                {game.experiment ? (
                  <div className="experiment-live">
                    <b>{game.experiment.type} experiment</b>
                    <span>
                      {game.experiment.progress}/{game.experiment.target}{" "}
                      customers
                    </span>
                    <i>
                      <u
                        style={{
                          width: `${(game.experiment.progress / game.experiment.target) * 100}%`,
                        }}
                      />
                    </i>
                  </div>
                ) : (
                  <div className="experiment-buttons">
                    <button onClick={() => startExperiment("price")}>
                      Test price
                    </button>
                    <button onClick={() => startExperiment("segment")}>
                      Test segment
                    </button>
                    <button onClick={() => startExperiment("offer")}>
                      Test offer
                    </button>
                  </div>
                )}
                <h4>Unit economics</h4>
                <div className="metric-grid">
                  <span>
                    <small>Conversion</small>
                    <b>{Math.round(conversion * 100)}%</b>
                  </span>
                  <span>
                    <small>Retention</small>
                    <b>{Math.round(retention * 100)}%</b>
                  </span>
                  <span>
                    <small>CAC</small>
                    <b>{money(cac)}</b>
                  </span>
                  <span>
                    <small>LTV</small>
                    <b>{money(ltv)}</b>
                  </span>
                  <span>
                    <small>Gross margin</small>
                    <b>{Math.round(grossMargin * 100)}%</b>
                  </span>
                  <span>
                    <small>LTV/CAC</small>
                    <b>{cac ? (ltv / cac).toFixed(1) : "—"}×</b>
                  </span>
                </div>
                <p className="intel">
                  Completed experiments: {game.experimentHistory.length}
                </p>
              </div>
            )}
            {opsTab === "lead" && (
              <div className="ops-list leadership-lab">
                <h4>Toronto campaign</h4>
                <div className="campaign-summary">
                  <span>
                    <small>Campaign XP</small>
                    <b>{game.campaignXp}</b>
                  </span>
                  <span>
                    <small>Missions</small>
                    <b>
                      {game.claimedMissionIds.length}/{CAMPAIGN_MISSIONS.length}
                    </b>
                  </span>
                  <span>
                    <small>Streak</small>
                    <b>{game.missionStreak} ◆</b>
                  </span>
                </div>
                {campaignComplete && (
                  <div className="campaign-complete">
                    <i>♛</i>
                    <span>
                      <strong>Toronto campaign complete</strong>
                      <small>
                        You built an enterprise with customers, a team,
                        relationships and citywide ambition.
                      </small>
                    </span>
                  </div>
                )}
                <div className="mission-board">
                  {availableMissions
                    .filter(
                      (mission) => !game.claimedMissionIds.includes(mission.id),
                    )
                    .slice(0, 3)
                    .map((mission) => {
                      const progress = missionProgress(
                        mission,
                        missionSnapshot,
                      );
                      const complete = progress >= mission.target;
                      return (
                        <article
                          className={complete ? "mission ready" : "mission"}
                          key={mission.id}
                        >
                          <i>{mission.icon}</i>
                          <span>
                            <small>Chapter {mission.chapter}</small>
                            <strong>{mission.title}</strong>
                            <p>{mission.story}</p>
                            <u>
                              <b
                                style={{
                                  width: `${(progress / mission.target) * 100}%`,
                                }}
                              />
                            </u>
                            <em>
                              {progress}/{mission.target} ·{" "}
                              {money(mission.rewardCash)} · {mission.rewardXp}{" "}
                              XP
                            </em>
                          </span>
                          <button
                            disabled={!complete}
                            onClick={() => claimMission(mission.id)}
                          >
                            {complete ? "Claim" : "Active"}
                          </button>
                        </article>
                      );
                    })}
                </div>
                <h4>Founder identity</h4>
                <p className="intel">
                  Choose one path. Its advantage becomes part of the simulation.
                </p>
                <div className="archetype-grid">
                  {(Object.keys(ARCHETYPES) as ArchetypeKey[])
                    .filter((key) => key !== "undecided")
                    .map((key) => (
                      <button
                        key={key}
                        className={game.archetype === key ? "selected" : ""}
                        disabled={
                          game.archetype !== "undecided" &&
                          game.archetype !== key
                        }
                        onClick={() => chooseArchetype(key)}
                      >
                        <i>{ARCHETYPES[key].icon}</i>
                        <span>
                          <b>{ARCHETYPES[key].name}</b>
                          <small>{ARCHETYPES[key].note}</small>
                        </span>
                      </button>
                    ))}
                </div>
                <h4>Leadership studio · {game.skillPoints} points</h4>
                <button className="action recover" onClick={restFounder}>
                  <b>Protect recovery time</b>
                  <span>1 hour · restore energy, focus and composure</span>
                </button>
                <div className="skill-tree">
                  {(Object.keys(SKILLS) as SkillKey[]).map((key) => (
                    <article key={key}>
                      <i>{SKILLS[key].icon}</i>
                      <span>
                        <strong>{SKILLS[key].name}</strong>
                        <small>{SKILLS[key].note}</small>
                      </span>
                      <b>Lv {game.skills[key]}</b>
                      <button
                        onClick={() => upgradeSkill(key)}
                        disabled={!game.skillPoints || game.skills[key] >= 5}
                      >
                        +
                      </button>
                    </article>
                  ))}
                </div>
                <h4>Mentor network</h4>
                {(Object.keys(MENTORS) as (keyof typeof MENTORS)[]).map(
                  (key) => {
                    const m = MENTORS[key];
                    return (
                      <article className="mentor-card" key={key}>
                        <i>{m.icon}</i>
                        <span>
                          <strong>{m.name}</strong>
                          <small>
                            {m.role} · Trust {game.mentorTrust[key]}%
                          </small>
                        </span>
                        <button
                          onClick={() => meetMentor(key)}
                          disabled={game.cash < 120}
                        >
                          Meet {money(120)}
                        </button>
                      </article>
                    );
                  },
                )}
                <h4>Capital strategy</h4>
                <div className="funding-grid">
                  <button
                    className={
                      game.funding === "bootstrapped" ? "selected" : ""
                    }
                    disabled={game.funding !== "bootstrapped"}
                  >
                    Bootstrap<small>Keep 100% ownership</small>
                  </button>
                  <button
                    onClick={() => chooseFunding("debt")}
                    disabled={game.funding !== "bootstrapped"}
                  >
                    Debt<small>+$2,200 · repay $2,600</small>
                  </button>
                  <button
                    onClick={() => chooseFunding("angel")}
                    disabled={game.funding !== "bootstrapped"}
                  >
                    Angel<small>+$3,500 · give 15%</small>
                  </button>
                </div>
                {game.funding !== "bootstrapped" && (
                  <p className="intel">
                    Capital: {game.funding} · Debt {money(game.debtBalance)} ·
                    Equity given {game.equityGiven}%
                  </p>
                )}
                <h4>North-star milestone</h4>
                <select
                  value={game.milestone}
                  onChange={(e) =>
                    setGame((g) => ({
                      ...g,
                      milestone: e.target.value as GameState["milestone"],
                    }))
                  }
                >
                  <option value="profit">Profitable engine</option>
                  <option value="brand">Beloved brand</option>
                  <option value="people">High-trust team</option>
                </select>
              </div>
            )}
            {opsTab === "life" && (
              <div className="ops-list life-economy">
                <h4>Life economy</h4>
                <div className="life-balance">
                  <span>
                    <small>Personal cash</small>
                    <b>{money(game.personalCash)}</b>
                  </span>
                  <span>
                    <small>Personal debt</small>
                    <b>{money(game.personalDebt)}</b>
                  </span>
                  <span>
                    <small>Credit score</small>
                    <b>{game.creditScore}</b>
                  </span>
                  <span>
                    <small>Health</small>
                    <b>{game.health}/100</b>
                  </span>
                </div>
                <h4>Employment</h4>
                <select
                  value={game.job}
                  onChange={(e) => chooseJob(e.target.value as JobKey)}
                >
                  {(Object.keys(JOBS) as JobKey[]).map((key) => (
                    <option
                      key={key}
                      value={key}
                      disabled={game.educationCredits < JOBS[key].requirement}
                    >
                      {JOBS[key].name} · {money(JOBS[key].pay)}/shift
                    </option>
                  ))}
                </select>
                <p className="intel">
                  {JOBS[game.job].note} · {game.shiftsWorked} shifts worked
                </p>
                <button
                  className="action"
                  onClick={workShift}
                  disabled={
                    game.job === "none" || game.energy < JOBS[game.job].energy
                  }
                >
                  <b>Work one shift</b>
                  <span>
                    Earn {money(JOBS[game.job].pay)} · energy −
                    {JOBS[game.job].energy}
                  </span>
                </button>
                <h4>Education</h4>
                <button
                  className="action"
                  onClick={study}
                  disabled={game.personalCash < 150}
                >
                  <b>Complete founder course</b>
                  <span>
                    {money(150)} personal · +1 credit · +1 skill point
                  </span>
                </button>
                <p className="intel">
                  Education credits: {game.educationCredits}
                </p>
                <h4>Transportation</h4>
                <div className="transport-grid">
                  {(Object.keys(TRANSPORT) as TransportKey[]).map((key) => (
                    <button
                      key={key}
                      className={game.transport === key ? "selected" : ""}
                      disabled={key === "bike" && !game.ownsBike}
                      onClick={() => chooseTransport(key)}
                    >
                      <b>{TRANSPORT[key].name}</b>
                      <small>{TRANSPORT[key].note}</small>
                    </button>
                  ))}
                </div>
                {!game.ownsBike && (
                  <button onClick={buyBike} disabled={game.personalCash < 350}>
                    Buy city bike · {money(350)}
                  </button>
                )}
                <h4>Personal credit</h4>
                <div className="credit-actions">
                  <button
                    onClick={usePersonalCredit}
                    disabled={game.creditScore < 600 || game.personalDebt > 0}
                  >
                    Borrow $500
                  </button>
                  <button
                    onClick={repayPersonalDebt}
                    disabled={!game.personalDebt || !game.personalCash}
                  >
                    Repay up to $200
                  </button>
                </div>
                <p className="intel">
                  Housing: {game.housingTier} ·{" "}
                  {money(game.housingTier === "studio" ? 55 : 25)}/day
                </p>
              </div>
            )}
            {opsTab === "empire" && (
              <div className="ops-list empire-portfolio">
                <h4>City portfolio</h4>
                <div className="portfolio-total">
                  <span>
                    <small>Locations</small>
                    <b>{game.branches.length}</b>
                  </span>
                  <span>
                    <small>Property value</small>
                    <b>
                      {money(
                        game.branches.reduce((s, b) => s + b.propertyValue, 0),
                      )}
                    </b>
                  </span>
                  <span>
                    <small>Branch revenue</small>
                    <b>
                      {money(
                        game.branches.reduce(
                          (s, b) => s + b.lifetimeRevenue,
                          0,
                        ),
                      )}
                    </b>
                  </span>
                </div>
                {game.branches.map((branch, index) => (
                  <article className="branch-card" key={branch.id}>
                    <div>
                      <i>{BUSINESSES[branch.business].icon}</i>
                      <span>
                        <strong>{branch.name}</strong>
                        <small>
                          {index === 0 ? "FLAGSHIP" : "PASSIVE BRANCH"} · Level{" "}
                          {branch.level}
                        </small>
                      </span>
                    </div>
                    <p>
                      Inventory {branch.inventory}/{branch.maxInventory} ·
                      Manager {branch.manager || "Unassigned"}
                    </p>
                    <small>
                      Property {money(branch.propertyValue)} · Lifetime revenue{" "}
                      {money(branch.lifetimeRevenue)}
                    </small>
                    <div className="branch-actions">
                      <button
                        onClick={() => restockBranch(branch.id)}
                        disabled={branch.inventory === branch.maxInventory}
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => upgradeBranch(branch.id)}
                        disabled={branch.level >= 3}
                      >
                        Upgrade
                      </button>
                      {index > 0 && (
                        <button
                          onClick={() => assignManager(branch.id)}
                          disabled={Boolean(branch.manager)}
                        >
                          Manager
                        </button>
                      )}
                      {index > 0 && (
                        <button onClick={() => sellBranch(branch.id)}>
                          Sell
                        </button>
                      )}
                    </div>
                  </article>
                ))}
                <h4>Expand from {CITY[game.founderLocation].name}</h4>
                {game.branches.some((b) => b.city === game.founderLocation) ? (
                  <p className="intel">
                    You already operate in this neighbourhood. Travel somewhere
                    new to expand.
                  </p>
                ) : game.branches.length >= game.branchPermits ? (
                  <button className="action" onClick={buyBranchPermit}>
                    <b>Purchase expansion permit</b>
                    <span>
                      {money(350 + game.branchPermits * 150)} · unlock location{" "}
                      {game.branchPermits + 1}
                    </span>
                  </button>
                ) : (
                  <div className="new-branch-grid">
                    {(Object.keys(BUSINESSES) as BusinessKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => openBranch(key)}
                        disabled={
                          game.cash <
                          PROPERTY_COST[game.founderLocation] +
                            BUSINESSES[key].cost
                        }
                      >
                        <i>{BUSINESSES[key].icon}</i>
                        <b>{BUSINESSES[key].name}</b>
                        <small>
                          {money(
                            PROPERTY_COST[game.founderLocation] +
                              BUSINESSES[key].cost,
                          )}
                        </small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {opsTab === "people" && (
              <div className="ops-list people-network">
                <h4>Story inbox</h4>
                <div className="story-inbox">
                  {game.storyInbox.slice(0, 4).map((message, index) => (
                    <article
                      className={`message ${message.tone}`}
                      key={`${message.day}-${message.from}-${index}`}
                    >
                      <i>{message.from[0]}</i>
                      <span>
                        <strong>{message.from}</strong>
                        <small>Day {message.day}</small>
                        <p>{message.text}</p>
                      </span>
                    </article>
                  ))}
                </div>
                <h4>People in {CITY[game.founderLocation].name}</h4>
                <div className="social-summary">
                  <span>
                    <small>Social capital</small>
                    <b>{game.socialCapital}</b>
                  </span>
                  <span>
                    <small>Collaborations</small>
                    <b>{game.collaborations}</b>
                  </span>
                  <span>
                    <small>Active relationships</small>
                    <b>
                      {game.residents.filter((r) => r.relationship > 0).length}
                    </b>
                  </span>
                </div>
                {game.residents.filter(
                  (r) => r.location === game.founderLocation,
                ).length === 0 && (
                  <p className="intel">
                    Nobody in your network is here right now. Movement changes
                    each morning.
                  </p>
                )}
                {game.residents
                  .filter((r) => r.location === game.founderLocation)
                  .map((resident) => (
                    <article className="resident-card" key={resident.id}>
                      <div>
                        <i>{resident.name[0]}</i>
                        <span>
                          <strong>{resident.name}</strong>
                          <small>
                            {resident.role} · {resident.segment}
                          </small>
                        </span>
                        <b>{resident.relationship}</b>
                      </div>
                      <p>
                        {resident.personality} · {resident.mood}
                      </p>
                      <div className="relationship-meter">
                        <i
                          style={{
                            width: `${Math.max(0, resident.relationship)}%`,
                          }}
                        />
                      </div>
                      <small>
                        Loyalty {resident.loyalty}% · {resident.encounters}{" "}
                        encounters
                      </small>
                      <div className="resident-actions">
                        <button onClick={() => meetResident(resident.id)}>
                          Talk
                        </button>
                        <button
                          onClick={() => askReferral(resident.id)}
                          disabled={resident.relationship < 20}
                        >
                          Referral
                        </button>
                        <button
                          onClick={() => collaborate(resident.id)}
                          disabled={
                            resident.relationship < 45 || game.cash < 100
                          }
                        >
                          Collaborate
                        </button>
                      </div>
                    </article>
                  ))}
                <h4>Relationship directory</h4>
                {[...game.residents]
                  .sort((a, b) => b.relationship - a.relationship)
                  .slice(0, 5)
                  .map((r) => (
                    <div className="directory-row" key={r.id}>
                      <span>
                        <b>{r.name}</b>
                        <small>{CITY[r.location].name}</small>
                      </span>
                      <strong>{r.relationship}</strong>
                    </div>
                  ))}
              </div>
            )}
            {opsTab === "pulse" && (
              <div className="ops-list toronto-pulse">
                <h4>Toronto Pulse</h4>
                <div className="pulse-grid">
                  <span>
                    <i>{WEATHER[game.weather].icon}</i>
                    <small>Weather</small>
                    <b>{WEATHER[game.weather].name}</b>
                  </span>
                  <span>
                    <i>↔</i>
                    <small>TTC</small>
                    <b>{game.ttcStatus}</b>
                  </span>
                  <span>
                    <i>↗</i>
                    <small>Economy</small>
                    <b>{ECONOMY[game.economy].name}</b>
                  </span>
                  <span>
                    <i>%</i>
                    <small>Interest</small>
                    <b>{game.interestRate.toFixed(2)}%</b>
                  </span>
                </div>
                <p className="pulse-note">
                  {WEATHER[game.weather].note}. {ECONOMY[game.economy].note}.
                </p>
                <h4>Resilience &amp; judgment</h4>
                <div className="crisis-status">
                  <span>
                    <small>Ethics</small>
                    <b>{game.ethicsScore}/100</b>
                  </span>
                  <span>
                    <small>Active shock</small>
                    <b>{game.marketShock.label}</b>
                  </span>
                  <span>
                    <small>Duration</small>
                    <b>{game.marketShock.days} days</b>
                  </span>
                </div>
                {game.crisisHistory
                  .slice(-3)
                  .reverse()
                  .map((entry, index) => {
                    const [id, choice] = entry.split(":");
                    const crisis = CRISES.find((item) => item.id === id);
                    return crisis ? (
                      <p className="crisis-log" key={`${entry}-${index}`}>
                        {crisis.icon} {crisis.title} ·{" "}
                        {crisis[choice as "a" | "b"].label}
                      </p>
                    ) : null;
                  })}
                <h4>City policy</h4>
                <article className="policy-card">
                  <strong>{POLICIES[game.cityPolicy].name}</strong>
                  <span>{POLICIES[game.cityPolicy].note}</span>
                </article>
                <h4>Major event</h4>
                <article className="event-card">
                  <strong>{game.cityEvent}</strong>
                  <span>Local conditions may amplify a matching branch.</span>
                </article>
                <div className="city-response">
                  <button
                    onClick={() => respondToCity("grant")}
                    disabled={
                      game.lastCityActionDay === game.day ||
                      game.cityPolicy !== "smallbiz" ||
                      game.permitLevel < 1
                    }
                  >
                    Claim grant
                  </button>
                  <button
                    onClick={() => respondToCity("activate")}
                    disabled={
                      game.lastCityActionDay === game.day || game.cash < 150
                    }
                  >
                    Activate · $150
                  </button>
                  <button
                    onClick={() => respondToCity("resilience")}
                    disabled={
                      game.lastCityActionDay === game.day || game.cash < 120
                    }
                  >
                    Resilience · $120
                  </button>
                </div>
                <h4>Neighbourhood heat</h4>
                {(Object.keys(CITY) as CityKey[]).map((key) => (
                  <div className="heat-row" key={key}>
                    <span>{CITY[key].name}</span>
                    <i>
                      <u style={{ width: `${game.neighbourhoodHeat[key]}%` }} />
                    </i>
                    <b>{game.neighbourhoodHeat[key]}</b>
                  </div>
                ))}
                <h4>City history</h4>
                {game.cityEventLog.slice(0, 4).map((entry, i) => (
                  <p className="pulse-log" key={i}>
                    {entry}
                  </p>
                ))}
              </div>
            )}
            {opsTab === "league" && (
              <div className="ops-list founder-league">
                <h4>{game.seasonName}</h4>
                <div className="league-hero">
                  <span>
                    <small>Your league points</small>
                    <b>{game.leaguePoints}</b>
                  </span>
                  <span>
                    <small>Challenge wins</small>
                    <b>{game.rivalWins}</b>
                  </span>
                  <span>
                    <small>Alliances</small>
                    <b>{game.alliances}</b>
                  </span>
                </div>
                <article className="weekly-card">
                  <small>WEEKLY SHARED CHALLENGE</small>
                  <strong>{weeklyTheme}</strong>
                  <span>
                    {weeklyTheme === "Community Builder"
                      ? "Reach 50 social capital"
                      : weeklyTheme === "Cash Discipline"
                        ? "Finish with $5,000 business cash"
                        : weeklyTheme === "Customer Loyalty"
                          ? "Build 50% average resident loyalty"
                          : "Use local supply and low-carbon transport"}
                  </span>
                  <b>
                    {weeklyTheme === "Community Builder"
                      ? `${game.socialCapital}/50`
                      : weeklyTheme === "Cash Discipline"
                        ? `${money(game.cash)}/$5,000`
                        : weeklyTheme === "Customer Loyalty"
                          ? `${Math.round(game.residents.reduce((s, r) => s + r.loyalty, 0) / game.residents.length)}/50`
                          : game.supplier === "local" &&
                              (game.transport === "walk" ||
                                game.transport === "bike")
                            ? "Complete"
                            : "In progress"}
                  </b>
                </article>
                <h4>Live standings</h4>
                {[
                  {
                    id: "player",
                    name: "You",
                    company: business?.name || "Your Venture",
                    score: calculateFounderScore(game),
                    locations: game.branches.length,
                    reputation: game.reputation,
                    relationship: 0,
                  },
                  ...game.rivals,
                ]
                  .sort((a, b) => b.score - a.score)
                  .map((r, index) => (
                    <article
                      className={`league-row ${r.id === "player" ? "player" : ""}`}
                      key={r.id}
                    >
                      <b>{index + 1}</b>
                      <span>
                        <strong>
                          {r.name} · {r.company}
                        </strong>
                        <small>
                          {r.locations} locations · Reputation {r.reputation} ·
                          Score {r.score.toLocaleString()}
                        </small>
                        {r.id !== "player" && (
                          <small>Relationship {r.relationship}</small>
                        )}
                      </span>
                      {r.id !== "player" && (
                        <div>
                          <button
                            onClick={() => partnerRival(r.id)}
                            disabled={
                              game.lastRivalActionDay === game.day ||
                              game.cash < 150
                            }
                          >
                            Partner
                          </button>
                          <button
                            onClick={() => challengeRival(r.id)}
                            disabled={game.lastRivalActionDay === game.day}
                          >
                            Challenge
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                <h4>Community challenge</h4>
                <p className="intel">
                  Share a compact league code so another player receives the
                  same city seed, heat and rival standings.
                </p>
                <div className="league-share">
                  <button onClick={exportLeague}>Copy league code</button>
                  <button onClick={importLeague}>Import league</button>
                </div>
                {shareStatus && <p className="share-status">{shareStatus}</p>}
              </div>
            )}
          </aside>
        </section>
      )}

      {game.phase === "dayEnd" && (
        <section className="modal-screen">
          <div className="report-card">
            <p className="eyebrow">Daily close</p>
            <h2>Day {game.day} in the books</h2>
            <p>{game.message}</p>
            <div className="pnl">
              <h3>Daily profit &amp; loss</h3>
              <span>
                <i>Revenue</i>
                <b>{money(game.dailyRevenue)}</b>
              </span>
              <span>
                <i>Cost of delivery &amp; supply</i>
                <b>−{money(game.dailyCogs)}</b>
              </span>
              <span>
                <i>Payroll</i>
                <b>−{money(game.dailyPayroll)}</b>
              </span>
              <span>
                <i>Rent &amp; other operating costs</i>
                <b>
                  −
                  {money(
                    Math.max(
                      0,
                      game.dailyExpenses - game.dailyCogs - game.dailyPayroll,
                    ),
                  )}
                </b>
              </span>
              <span className="net">
                <i>Net operating result</i>
                <b>{money(game.dailyRevenue - game.dailyExpenses)}</b>
              </span>
            </div>
            <div className="report-numbers">
              <span>
                <small>Cash balance</small>
                <b>{money(game.cash)}</b>
              </span>
              <span>
                <small>Your market share</small>
                <b>{playerMarketShare()}%</b>
              </span>
              <span>
                <small>Team morale</small>
                <b>
                  {game.staff.length
                    ? Math.round(
                        game.staff.reduce((s, m) => s + m.morale, 0) /
                          game.staff.length,
                      )
                    : "Solo"}
                </b>
              </span>
            </div>
            <div className="personal-close">
              <span>
                Personal cash <b>{money(game.personalCash)}</b>
              </span>
              <span>
                Credit score <b>{game.creditScore}</b>
              </span>
              <span>
                Health <b>{game.health}/100</b>
              </span>
              <span>
                Housing <b>{game.housingTier}</b>
              </span>
            </div>
            <div className="rep-meter">
              <span>Neighbourhood reputation</span>
              <b>{game.reputation}/100</b>
              <i>
                <u style={{ width: `${game.reputation}%` }} />
              </i>
            </div>
            <button className="primary" onClick={continueCampaign}>
              Continue campaign <span>→</span>
            </button>
          </div>
        </section>
      )}

      {game.phase === "decision" &&
        game.decision &&
        (() => {
          const story = Object.values(NARRATIVES).find(
            (s) => s.id === game.decision,
          )!;
          return (
            <section className="modal-screen story-screen">
              <div className="report-card story-card">
                <p className="eyebrow">Founder decision · Day {game.day + 1}</p>
                <div className="story-icon">◈</div>
                <h2>{story.title}</h2>
                <p>{story.text}</p>
                <div className="choice-grid">
                  <button onClick={() => resolveDecision("a")}>
                    <small>OPTION A</small>
                    <b>{story.a}</b>
                  </button>
                  <button onClick={() => resolveDecision("b")}>
                    <small>OPTION B</small>
                    <b>{story.b}</b>
                  </button>
                </div>
                <p className="consequence-note">
                  Your choice becomes part of the company’s story and cannot be
                  undone.
                </p>
              </div>
            </section>
          );
        })()}

      {game.phase === "crisis" &&
        game.activeCrisis &&
        (() => {
          const crisis = CRISES.find((item) => item.id === game.activeCrisis)!;
          return (
            <section className="modal-screen crisis-screen">
              <div className="report-card crisis-card">
                <p className="eyebrow">
                  {crisis.category} · Day {game.day + 1}
                </p>
                <div className="crisis-icon">{crisis.icon}</div>
                <h2>{crisis.title}</h2>
                <p>{crisis.text}</p>
                <div className="ethics-readout">
                  <span>
                    Founder ethics <b>{game.ethicsScore}/100</b>
                  </span>
                  <span>
                    Crises faced <b>{game.crisisHistory.length}</b>
                  </span>
                </div>
                <div className="crisis-choices">
                  {(["a", "b"] as const).map((key) => (
                    <button key={key} onClick={() => resolveCrisis(key)}>
                      <small>PATH {key.toUpperCase()}</small>
                      <b>{crisis[key].label}</b>
                      <span>{crisis[key].note}</span>
                      <em>
                        Consequences persist {crisis[key].effect.days} day
                        {crisis[key].effect.days === 1 ? "" : "s"}
                      </em>
                    </button>
                  ))}
                </div>
                <p className="consequence-note">
                  There is no perfect answer. Toronto will remember what you
                  protected.
                </p>
              </div>
            </section>
          );
        })()}

      {game.phase === "negotiation" &&
        game.negotiation &&
        (() => {
          const deal = Object.values(NEGOTIATIONS).find(
            (n) => n.id === game.negotiation,
          )!;
          return (
            <section className="modal-screen story-screen">
              <div className="report-card story-card negotiation-card">
                <p className="eyebrow">Live negotiation · Day {game.day + 1}</p>
                <div className="story-icon">◆</div>
                <h2>{deal.title}</h2>
                <h3>{deal.party}</h3>
                <p>{deal.text}</p>
                <div className="negotiation-readout">
                  <span>
                    Negotiation <b>Lv {game.skills.negotiation}</b>
                  </span>
                  <span>
                    Focus <b>{game.focus}</b>
                  </span>
                </div>
                <div className="choice-grid">
                  <button onClick={() => resolveNegotiation("firm")}>
                    <small>FIRM POSITION</small>
                    <b>{deal.firm}</b>
                  </button>
                  <button onClick={() => resolveNegotiation("partner")}>
                    <small>PARTNERSHIP MOVE</small>
                    <b>{deal.partner}</b>
                  </button>
                </div>
              </div>
            </section>
          );
        })()}

      {game.phase === "result" && (
        <section className="modal-screen">
          <div className="report-card final-card">
            <div className="trophy">
              {game.cash >= winCash &&
              game.reputation >= 75 &&
              game.served >= winCustomers
                ? "🏆"
                : "✦"}
            </div>
            <p className="eyebrow">{game.scenarioName} · Final report</p>
            <h2>{rating}</h2>
            <p>
              {game.cash >= winCash &&
              game.reputation >= 75 &&
              game.served >= winCustomers
                ? "You built a neighbourhood institution ready for its next market."
                : "The campaign changed the operator—and the next run starts with hard-earned judgment."}
            </p>
            <div className="score">
              <b>{grade}</b> {score.toLocaleString()}
              <small>
                Grade · Founder score · {RUN_MODIFIERS[game.runModifier].name}
              </small>
            </div>
            <div className="progression-reward">
              <i>{currentFounderLevel.icon}</i>
              <span>
                <small>FOUNDER PROGRESSION</small>
                <b>
                  +{earnedRunXp} XP · Level {currentFounderLevel.level}
                </b>
                <em>{currentFounderLevel.name}</em>
                {nextFounderLevel && (
                  <u>
                    <strong
                      style={{
                        width: `${Math.min(100, (nextFounderLevel.current / nextFounderLevel.required) * 100)}%`,
                      }}
                    />
                  </u>
                )}
              </span>
            </div>
            <div className="meta-badges">
              {Object.entries(META_BADGES).map(([id, badge]) => {
                const unlocked =
                  founderProfile.badges.includes(id) ||
                  earnedBadges({
                    grade,
                    ethics: game.ethicsScore,
                    crises: game.crisisHistory.length,
                    missions: game.claimedMissionIds.length,
                    branches: game.branches.length,
                  }).includes(id);
                return (
                  <div key={id} className={unlocked ? "unlocked" : "locked"}>
                    <i>{badge.icon}</i>
                    <b>{badge.name}</b>
                    <small>{badge.note}</small>
                  </div>
                );
              })}
            </div>
            <div className="run-history-final">
              <h3>Run history</h3>
              <p>Your last attempts stay on this device.</p>
              {runHistory.slice(0, 5).map((run) => (
                <span key={run.id}>
                  <b>{run.grade}</b>
                  <em>{run.scenario}</em>
                  <small>{RUN_MODIFIERS[run.modifier].name}</small>
                  <strong>{run.score.toLocaleString()}</strong>
                </span>
              ))}
            </div>
            <div className="report-numbers">
              <span>
                <small>Ending cash</small>
                <b>{money(game.cash)}</b>
              </span>
              <span>
                <small>Reputation</small>
                <b>{game.reputation}</b>
              </span>
              <span>
                <small>Served</small>
                <b>{game.served}</b>
              </span>
              <span>
                <small>Quests</small>
                <b>{game.quests.filter(Boolean).length}/3</b>
              </span>
            </div>
            <div className="achievement-grid">
              {Object.entries(ACHIEVEMENTS).map(([id, a]) => (
                <div
                  key={id}
                  className={
                    game.achievements.includes(id) ? "unlocked" : "locked"
                  }
                >
                  <i>{a.icon}</i>
                  <b>{a.name}</b>
                  <small>{a.note}</small>
                </div>
              ))}
            </div>
            <div className="final-validation">
              <span>
                <small>League position</small>
                <b>
                  #
                  {1 +
                    game.rivals.filter(
                      (r) => r.score > calculateFounderScore(game),
                    ).length}
                </b>
              </span>
              <span>
                <small>League points</small>
                <b>{game.leaguePoints}</b>
              </span>
              <span>
                <small>Rival wins</small>
                <b>{game.rivalWins}</b>
              </span>
              <span>
                <small>Alliances</small>
                <b>{game.alliances}</b>
              </span>
            </div>
            <button className="score-share" onClick={shareScore}>
              Share scorecard
            </button>
            {shareStatus && <p className="share-status">{shareStatus}</p>}
            <button
              className="primary"
              onClick={() => setGame((g) => ({ ...g, phase: "epilogue" }))}
            >
              Reveal founder legacy <span>→</span>
            </button>
            <button className="score-share replay-now" onClick={reset}>
              Build another empire ↻
            </button>
          </div>
        </section>
      )}

      {game.phase === "epilogue" && (
        <section className="epilogue-screen screen">
          <div className="legacy-card">
            <p className="eyebrow">Micro Empire · Founder legacy</p>
            <div className="legacy-icon">{legacy.icon}</div>
            <h2>{legacy.title}</h2>
            <h3>{legacy.tagline}</h3>
            <p className="legacy-copy">{legacy.epilogue}</p>
            <div className="legacy-pillars">
              {Object.entries(legacyScores).map(([name, value]) => (
                <span key={name}>
                  <small>{name}</small>
                  <b>{value}</b>
                  <i>
                    <u style={{ width: `${value}%` }} />
                  </i>
                </span>
              ))}
            </div>
            <div className="legacy-summary">
              <span>
                <small>Final grade</small>
                <b>{grade}</b>
              </span>
              <span>
                <small>Founder level</small>
                <b>{currentFounderLevel.level}</b>
              </span>
              <span>
                <small>Campaign missions</small>
                <b>{game.claimedMissionIds.length}/8</b>
              </span>
              <span>
                <small>Ethics</small>
                <b>{game.ethicsScore}</b>
              </span>
            </div>
            {runHistory.length > 0 && (
              <div className="hall-of-fame">
                <h3>Local Hall of Fame</h3>
                {[...runHistory]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((run, index) => (
                    <span key={run.id}>
                      <b>#{index + 1}</b>
                      <em>{run.scenario}</em>
                      <small>{run.grade}</small>
                      <strong>{run.score.toLocaleString()}</strong>
                    </span>
                  ))}
              </div>
            )}
            <div className="legacy-actions">
              <button className="primary" onClick={reset}>
                Begin a new legacy <span>↻</span>
              </button>
              <button onClick={() => setShowCredits(true)}>
                Credits &amp; Free Edition
              </button>
              <a
                href="https://github.com/learningsemantics/micro-empire-game/issues/new?title=V6.0%20Player%20Feedback&body=What%20I%20enjoyed%3A%0A%0AWhat%20was%20confusing%3A%0A%0AMy%20suggestion%3A"
                target="_blank"
                rel="noreferrer"
              >
                Share player feedback
              </a>
            </div>
          </div>
        </section>
      )}

      {showBriefing && game.phase === "play" && (
        <div className="briefing-backdrop">
          <section className="morning-briefing">
            <p className="eyebrow">Toronto morning briefing · Day {game.day}</p>
            <div className="briefing-weather">{WEATHER[game.weather].icon}</div>
            <h2>{game.cityEvent}</h2>
            <p>
              {WEATHER[game.weather].note}. {ECONOMY[game.economy].note}.
            </p>
            <div className="briefing-grid">
              <span>
                <small>WEATHER</small>
                <b>{WEATHER[game.weather].name}</b>
              </span>
              <span>
                <small>TTC</small>
                <b>{game.ttcStatus}</b>
              </span>
              <span>
                <small>ECONOMY</small>
                <b>{ECONOMY[game.economy].name}</b>
              </span>
              <span>
                <small>POLICY</small>
                <b>{POLICIES[game.cityPolicy].name}</b>
              </span>
            </div>
            <div className="briefing-priority">
              <i>✦</i>
              <span>
                <small>YOUR PRIORITY</small>
                <b>{founderCoach()}</b>
              </span>
            </div>
            <div className="briefing-actions">
              <button onClick={() => setShowBriefing(false)}>
                Begin the day
              </button>
              <button
                onClick={() => {
                  setShowBriefing(false);
                  openConsole("city");
                  setWorldView("city");
                }}
              >
                Open Toronto map
              </button>
            </div>
          </section>
        </div>
      )}
      {game.characterEvent &&
        game.phase === "play" &&
        (() => {
          const story = CHARACTER_EVENTS[game.characterEvent];
          return (
            <div className="character-backdrop">
              <section className="character-scene">
                <div className="character-portrait">{story.portrait}</div>
                <p className="eyebrow">Character story · Day {game.day}</p>
                <h2>{story.title}</h2>
                <h3>{story.speaker}</h3>
                <small>{story.role}</small>
                <p className="character-copy">“{story.text}”</p>
                <div className="character-choices">
                  <button onClick={() => resolveCharacterEvent("a")}>
                    <small>PATH A</small>
                    <b>{story.a}</b>
                  </button>
                  <button onClick={() => resolveCharacterEvent("b")}>
                    <small>PATH B</small>
                    <b>{story.b}</b>
                  </button>
                </div>
                <p className="consequence-note">
                  People remember. Some consequences may return several days
                  later.
                </p>
              </section>
            </div>
          );
        })()}
      {celebration && (
        <div className="celebration" role="status">
          <i>✦</i>
          <b>{celebration}</b>
          <span>Keep building your Toronto story.</span>
        </div>
      )}

      {game.phase === "play" && ambience && sound && (
        <button
          className="now-playing"
          onClick={playAmbientCue}
          aria-label="Play current ambience cue"
        >
          <i>{currentSoundscape.icon}</i>
          <span>
            <small>TORONTO SOUNDSCAPE</small>
            <b>{currentSoundscape.name}</b>
          </span>
          <em>♫</em>
        </button>
      )}

      {showAtmosphere && (
        <div
          className="help-backdrop atmosphere-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Audio and atmosphere settings"
        >
          <div className="help-card atmosphere-card">
            <button className="close" onClick={() => setShowAtmosphere(false)}>
              ×
            </button>
            <p className="eyebrow">V5.8 atmosphere studio</p>
            <h2>Make Toronto feel alive.</h2>
            <div className="soundscape-preview">
              <i>{currentSoundscape.icon}</i>
              <span>
                <small>NOW PLAYING</small>
                <b>{currentSoundscape.name}</b>
                <em>
                  {currentDayPhase} · {WEATHER[game.weather].name}
                </em>
              </span>
              <button onClick={playAmbientCue}>Preview</button>
            </div>
            <div className="atmosphere-controls">
              <label>
                <span>
                  <b>Interface sound</b>
                  <small>Actions, rewards and decisions</small>
                </span>
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(event) => setSound(event.target.checked)}
                />
              </label>
              <label>
                <span>
                  <b>Toronto ambience</b>
                  <small>Gentle procedural soundscape cues</small>
                </span>
                <input
                  type="checkbox"
                  checked={ambience}
                  onChange={(event) => setAmbience(event.target.checked)}
                />
              </label>
              <label className="volume-control">
                <span>
                  <b>Master volume</b>
                  <small>{Math.round(masterVolume * 100)}%</small>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterVolume}
                  onChange={(event) =>
                    setMasterVolume(safeVolume(Number(event.target.value)))
                  }
                />
              </label>
              <label>
                <span>
                  <b>Reduced motion</b>
                  <small>Stops decorative movement and weather animation</small>
                </span>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(event) => setReducedMotion(event.target.checked)}
                />
              </label>
              <label>
                <span>
                  <b>High contrast</b>
                  <small>Stronger panels, borders and focus visibility</small>
                </span>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(event) => setHighContrast(event.target.checked)}
                />
              </label>
            </div>
            <div className="save-management">
              <span>
                <small>SAVE HEALTH</small>
                <b>{saveStatus}</b>
                <em>
                  {lastSavedAt
                    ? `Latest snapshot · ${lastSavedAt}`
                    : "Waiting for first autosave"}
                </em>
              </span>
              <div>
                <button onClick={exportPlayerData}>Copy full backup</button>
                <button onClick={importPlayerData}>Import backup</button>
                <button onClick={recoverPreviousSave}>
                  Recover previous save
                </button>
              </div>
            </div>
            <button
              className="onboarding-reset"
              onClick={() => {
                setOnboardingStep(0);
                setShowOnboarding(true);
                setShowAtmosphere(false);
              }}
            >
              Replay guided tour
            </button>
            <p className="atmosphere-note">
              All sounds are generated in your browser. No audio files, tracking
              or downloads are used.
            </p>
            <button
              className="primary"
              onClick={() => setShowAtmosphere(false)}
            >
              Save atmosphere
            </button>
          </div>
        </div>
      )}

      {showOnboarding && (
        <div
          className="help-backdrop onboarding-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Micro Empire"
        >
          <div className="onboarding-card">
            <div className="onboarding-progress">
              {[0, 1, 2, 3].map((step) => (
                <i
                  key={step}
                  className={step <= onboardingStep ? "active" : ""}
                />
              ))}
            </div>
            {onboardingStep === 0 && (
              <>
                <div className="onboarding-icon">⌂</div>
                <p className="eyebrow">Welcome to Toronto</p>
                <h2>Build small. Think like an empire.</h2>
                <p>
                  Micro Empire is a founder simulation about customers, cash,
                  people and judgment—not just clicking for revenue.
                </p>
              </>
            )}
            {onboardingStep === 1 && (
              <>
                <div className="onboarding-icon">◷</div>
                <p className="eyebrow">Your operating day</p>
                <h2>Every hour is a tradeoff.</h2>
                <p>
                  Serve customers, interview the market, manage supply and
                  protect founder energy. Close the day when the next action is
                  no longer worth the risk.
                </p>
                <div className="onboarding-demo">
                  <span>
                    9 AM<small>Read conditions</small>
                  </span>
                  <b>→</b>
                  <span>
                    Operate<small>Choose actions</small>
                  </span>
                  <b>→</b>
                  <span>
                    5 PM<small>Review results</small>
                  </span>
                </div>
              </>
            )}
            {onboardingStep === 2 && (
              <>
                <div className="onboarding-icon">◆</div>
                <p className="eyebrow">What success means</p>
                <h2>Balance more than cash.</h2>
                <p>
                  Reputation, product-market fit, relationships, ethics, health
                  and team trust all shape the final founder score.
                </p>
                <div className="onboarding-metrics">
                  <span>
                    $<small>Runway</small>
                  </span>
                  <span>
                    ★<small>Trust</small>
                  </span>
                  <span>
                    ♥<small>People</small>
                  </span>
                  <span>
                    ▲<small>Growth</small>
                  </span>
                </div>
              </>
            )}
            {onboardingStep === 3 && (
              <>
                <div className="onboarding-icon">♛</div>
                <p className="eyebrow">Your founder journey</p>
                <h2>One run teaches the next.</h2>
                <p>
                  Complete daily goals and campaign missions, face Toronto
                  crises, earn XP, collect badges and unlock harder founder
                  trials.
                </p>
                <p className="onboarding-save-note">
                  Your game autosaves locally and keeps a previous recovery
                  snapshot.
                </p>
              </>
            )}
            <div className="onboarding-actions">
              {onboardingStep > 0 && (
                <button onClick={() => setOnboardingStep((step) => step - 1)}>
                  Back
                </button>
              )}
              <button
                className="primary"
                onClick={() =>
                  onboardingStep === 3
                    ? completeOnboarding()
                    : setOnboardingStep((step) => step + 1)
                }
              >
                {onboardingStep === 3 ? "Start building" : "Continue"}{" "}
                <span>→</span>
              </button>
            </div>
            <button className="onboarding-skip" onClick={completeOnboarding}>
              Skip tour
            </button>
          </div>
        </div>
      )}

      {showCredits && (
        <div
          className="help-backdrop credits-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Micro Empire credits"
        >
          <div className="help-card credits-card">
            <button className="close" onClick={() => setShowCredits(false)}>
              ×
            </button>
            <p className="eyebrow">Micro Empire V6.4.4</p>
            <h2>A Learning Semantics Simulation</h2>
            <p className="credits-lede">
              A Toronto entrepreneurship simulation about building a company
              without losing sight of the people, city and founder behind it.
            </p>
            <div className="edition-grid">
              <span>
                <i>◆</i>
                <b>Complete campaign</b>
                <small>30 days, four stages and founder legacies</small>
              </span>
              <span>
                <i>⌂</i>
                <b>Living Toronto</b>
                <small>Eight destinations, residents, weather and policy</small>
              </span>
              <span>
                <i>♥</i>
                <b>Human stories</b>
                <small>Mentors, rivals, teams and delayed consequences</small>
              </span>
              <span>
                <i>♛</i>
                <b>Replay progression</b>
                <small>Trials, modifiers, XP, badges and Hall of Fame</small>
              </span>
            </div>
            <div className="credits-list">
              <p>
                <small>DEVELOPER &amp; PUBLISHER</small>
                <b>Learning Semantics</b>
              </p>
              <p>
                <small>DESIGN &amp; DIRECTION</small>
                <b>Amol Muzumdar</b>
              </p>
              <p>
                <small>BUILT WITH</small>
                <b>React · TypeScript · Vite · Web Audio</b>
              </p>
              <p>
                <small>EDITION</small>
                <b>V6.4.4 · July 2026</b>
              </p>
            </div>
            <div className="privacy-note">
              <b>Private by default</b>
              <span>
                Community play remains local. Signed-in Vercel players may sync
                their game snapshot to their private Supabase account. Micro
                Empire has no advertising SDK or analytics tracker.
              </span>
            </div>
            <div className="credits-actions">
              <a
                href="https://github.com/learningsemantics/micro-empire-game/issues/new?title=V6.0%20Player%20Feedback&body=What%20I%20enjoyed%3A%0A%0AWhat%20was%20confusing%3A%0A%0AMy%20suggestion%3A"
                target="_blank"
                rel="noreferrer"
              >
                Send feedback
              </a>
              <button className="primary" onClick={() => setShowCredits(false)}>
                Return to Toronto
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccount && (
        <div
          className="help-backdrop account-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Founder account"
        >
          <div className="help-card account-card">
            <button className="close" onClick={() => setShowAccount(false)}>
              ×
            </button>
            <p className="eyebrow">Micro Empire V6.4</p>
            <h2>
              {authUser
                ? "Your founder account"
                : "Play free. Sign in when useful."}
            </h2>
            <p className="account-lede">
              Accounts are optional in the complete Community Edition. Signed-in
              players can now protect their current campaign and continue it on
              another device.
            </p>

            {!authReady && <p className="auth-notice">Connecting securely…</p>}
            {authReady && !authClient && (
              <p className="auth-notice">
                Accounts are available on the Vercel edition. You can keep
                playing the Community Edition anonymously here.
              </p>
            )}

            {authClient && !authUser && (
              <>
                <div className="auth-tabs">
                  <button
                    className={authMode === "signin" ? "active" : ""}
                    onClick={() => setAuthMode("signin")}
                  >
                    Sign in
                  </button>
                  <button
                    className={authMode === "signup" ? "active" : ""}
                    onClick={() => setAuthMode("signup")}
                  >
                    Create account
                  </button>
                </div>
                <form
                  className="auth-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitAuth("password");
                  }}
                >
                  {authMode === "signup" && (
                    <label>
                      Founder name
                      <input
                        value={authDisplayName}
                        onChange={(event) =>
                          setAuthDisplayName(event.target.value)
                        }
                        autoComplete="name"
                        placeholder="How Toronto knows you"
                      />
                    </label>
                  )}
                  <label>
                    Email
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(event) => setAuthEmail(event.target.value)}
                      autoComplete="email"
                      placeholder="founder@example.com"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={authPassword}
                      onChange={(event) => setAuthPassword(event.target.value)}
                      autoComplete={
                        authMode === "signup"
                          ? "new-password"
                          : "current-password"
                      }
                    />
                  </label>
                  <button className="primary" disabled={authBusy}>
                    {authBusy
                      ? "Working…"
                      : authMode === "signup"
                        ? "Create free account"
                        : "Sign in"}
                  </button>
                </form>
                <div className="auth-alternatives">
                  <button
                    disabled={authBusy || !authEmail}
                    onClick={() => void submitAuth("magic")}
                  >
                    Email me a magic link
                  </button>
                  <button
                    disabled={authBusy || !authEmail}
                    onClick={() => void submitAuth("reset")}
                  >
                    Reset password
                  </button>
                </div>
              </>
            )}

            {authClient && authUser && authMode === "recovery" && (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitAuth("new-password");
                }}
              >
                <label>
                  New password
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    autoComplete="new-password"
                  />
                </label>
                <button className="primary" disabled={authBusy}>
                  Save new password
                </button>
              </form>
            )}

            {authClient && authUser && authMode !== "recovery" && (
              <div className="profile-panel">
                <span className="profile-avatar">
                  {(authDisplayName || authUser.email || "F")
                    .charAt(0)
                    .toUpperCase()}
                </span>
                <div>
                  <small>VERIFIED SESSION</small>
                  <b>{authUser.email}</b>
                </div>
                <label>
                  Founder display name
                  <input
                    value={authDisplayName}
                    onChange={(event) => setAuthDisplayName(event.target.value)}
                  />
                </label>
                <button
                  className="primary"
                  disabled={authBusy}
                  onClick={() => void submitAuth("profile")}
                >
                  Update profile
                </button>
                <button
                  className="text-button"
                  disabled={authBusy}
                  onClick={() => void submitAuth("signout")}
                >
                  Sign out
                </button>
                <section className="cloud-panel">
                  <span
                    className={`cloud-indicator ${cloudReady ? "ready" : ""}`}
                  >
                    {cloudBusy ? "↻" : cloudReady ? "✓" : "☁"}
                  </span>
                  <div>
                    <small>CROSS-DEVICE SAVE</small>
                    <b>{cloudStatus}</b>
                    {cloudUpdatedAt && (
                      <em>
                        Server snapshot ·{" "}
                        {new Date(cloudUpdatedAt).toLocaleString("en-CA", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </em>
                    )}
                  </div>
                  <button
                    disabled={cloudBusy || Boolean(cloudConflict)}
                    onClick={() => void uploadCloudSave()}
                  >
                    Sync now
                  </button>
                </section>
              </div>
            )}
            {cloudConflict && (
              <section className="cloud-conflict" role="alert">
                <b>Newer progress exists in the cloud</b>
                <p>
                  That snapshot was saved{" "}
                  {new Date(cloudConflict.clientSavedAt).toLocaleString(
                    "en-CA",
                    { dateStyle: "medium", timeStyle: "short" },
                  )}
                  . Choose which campaign should become your active save.
                </p>
                <div>
                  <button className="primary" onClick={restoreCloudSave}>
                    Use cloud progress
                  </button>
                  <button onClick={() => void keepLocalSave()}>
                    Keep this device
                  </button>
                </div>
              </section>
            )}
            {authMessage && (
              <p className="auth-message" role="status">
                {authMessage}
              </p>
            )}
            <p className="auth-privacy">
              Your password is handled by Supabase Auth and is never stored in
              the game or local save file.
            </p>
          </div>
        </div>
      )}

      {showCommercial && (
        <div
          className="help-backdrop commercial-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Micro Empire editions"
        >
          <div className="help-card commercial-card">
            <button className="close" onClick={() => setShowCommercial(false)}>
              ×
            </button>
            <p className="eyebrow">Micro Empire V6.4.4</p>
            <h2>Free community. Licensed expansion.</h2>
            <p className="commercial-lede">
              The complete V6.0 game stays free. The Founder Licence will fund
              cloud services, new campaigns and advanced tools—without taking
              Community features away.
            </p>
            <div className="edition-comparison">
              {(["community", "founder"] as const).map((key) => (
                <article key={key} className={key}>
                  <i>{key === "community" ? "♥" : "♛"}</i>
                  <small>
                    {key === "community"
                      ? "AVAILABLE NOW"
                      : "COMMERCIAL ROADMAP"}
                  </small>
                  <h3>{EDITIONS[key].name}</h3>
                  <b>{EDITIONS[key].price}</b>
                  <p>{EDITIONS[key].note}</p>
                  <ul>
                    {EDITIONS[key].features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="commercial-status">
              <span>
                <small>DEPLOYMENT</small>
                <b>
                  {editionStatus.source === "vercel"
                    ? "Vercel commercial runtime connected"
                    : "GitHub Pages Community runtime"}
                </b>
              </span>
              <span>
                <small>SERVER ENTITLEMENT</small>
                <b>{editionStatus.entitlement}</b>
              </span>
              <span>
                <small>PLAYER IDENTITY</small>
                <b>
                  {editionStatus.authenticated
                    ? "Server verified"
                    : "Anonymous session"}
                </b>
              </span>
            </div>
            <div className="commercial-roadmap">
              <span className="done">
                <b>6.1</b>
                <small>Edition boundary</small>
              </span>
              <span className="done">
                <b>6.2</b>
                <small>Accounts</small>
              </span>
              <span className="done">
                <b>6.3</b>
                <small>Cloud saves</small>
              </span>
              <span className="done">
                <b>6.4</b>
                <small>Stripe</small>
              </span>
              <span>
                <b>6.5</b>
                <small>Customer access</small>
              </span>
            </div>
            <p className="commercial-integrity">
              <b>Verified commerce:</b> V6.4 activates Founder access only after
              Stripe signs a subscription webhook and the server confirms an
              active entitlement. Community features remain free.
            </p>
            {billingStatus && (
              <p className="billing-message" role="status">
                {billingStatus}
              </p>
            )}
            <div className="commercial-actions">
              <button
                className="primary"
                onClick={() => setShowCommercial(false)}
              >
                Continue Community Edition
              </button>
              <button
                className="founder-checkout"
                disabled={billingBusy || canAccessCommercial(editionStatus)}
                onClick={() => void startFounderCheckout()}
              >
                {canAccessCommercial(editionStatus)
                  ? "Founder Licence active"
                  : billingBusy
                    ? "Opening Stripe…"
                    : authUser
                      ? "Start test checkout"
                      : "Sign in to get Founder Licence"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div
          className="help-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="How to play"
        >
          <div className="help-card">
            <button className="close" onClick={() => setShowHelp(false)}>
              ×
            </button>
            <p className="eyebrow">Founder field guide</p>
            <h2>Build your Toronto story.</h2>
            <ol>
              <li>
                <b>Follow the journey</b>
                <span>
                  Start by exploring three places, serving five customers and
                  earning the trust of one resident.
                </span>
              </li>
              <li>
                <b>Use five clear areas</b>
                <span>
                  City, Business, People, Founder and League organize every
                  decision without hiding the simulation depth.
                </span>
              </li>
              <li>
                <b>Read each morning</b>
                <span>
                  The daily briefing explains weather, transit, policy, the
                  economy and your most urgent priority.
                </span>
              </li>
              <li>
                <b>Remember the human story</b>
                <span>
                  Residents, employees and rivals remember how you treat them.
                  Relationships can become your strongest advantage.
                </span>
              </li>
            </ol>
            <button className="primary" onClick={() => setShowHelp(false)}>
              Let’s build
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  danger,
}: {
  icon: string;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className={`stat ${danger ? "danger" : ""}`}>
      <i>{icon}</i>
      <span>
        <small>{label}</small>
        <b>{value}</b>
      </span>
    </div>
  );
}
function Quest({
  done,
  label,
  progress,
}: {
  done: boolean;
  label: string;
  progress: string;
}) {
  return (
    <div className={`quest ${done ? "done" : ""}`}>
      <i>{done ? "✓" : "○"}</i>
      <span>
        {label}
        <small>{progress}</small>
      </span>
    </div>
  );
}
function Neighbourhood({
  active,
  people,
}: {
  active: BusinessKey;
  people: number;
}) {
  return (
    <div
      className={`neighbourhood active-${active}`}
      aria-label="Toronto-inspired neighbourhood"
    >
      <div className="cn-tower">
        <i />
      </div>
      <div className="skyline">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="trees">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="building cafe">
        <div className="roof-garden">✿ ✿ ✿</div>
        <div className="windows">
          <i />
          <i />
          <i />
          <i />
        </div>
        <b>LOTUS CAFÉ</b>
        <span className="awning" />
      </div>
      <div className="building studio">
        <div className="windows">
          <i />
          <i />
          <i />
          <i />
        </div>
        <b>CAREER STUDIO</b>
        <span className="awning" />
      </div>
      <div className="building agency">
        <div className="windows">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <b>AI WORKS</b>
        <span>⌘</span>
      </div>
      <div className="street">
        <span className="bike">◯━◯</span>
        <span className="streetcar">504 · KING</span>
      </div>
      <div className="people">
        {Array.from({ length: people }).map((_, i) => (
          <i
            key={i}
            style={{
              left: `${8 + ((i * 83) % 84)}%`,
              animationDelay: `${i * -0.45}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
