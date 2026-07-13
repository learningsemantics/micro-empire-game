"use client";

import { useEffect, useState } from "react";

type BusinessKey = "coffee" | "career" | "agency";
type DistrictKey = "junction" | "harbour" | "liberty";
type SegmentKey = "Student" | "Professional" | "Family" | "Tourist" | "Small Business" | "Corporate";
type SupplierKey = "budget" | "local" | "premium";
type DifficultyKey = "founder" | "operator" | "mogul";
type AdviserKey = "finance" | "marketing" | "people" | "operations";
type GameMode = "campaign" | "daily" | "custom";
type StaffMember = { id: number; name: string; role: string; skill: number; morale: number; salary: number };
type Competitor = { name: string; price: number; reputation: number; share: number };
type ExperimentKey = "price" | "segment" | "offer";
type Experiment = { type: ExperimentKey; progress: number; target: number };
type Phase = "home" | "modes" | "scenario" | "select" | "district" | "play" | "dayEnd" | "decision" | "result";

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
  segmentSales: Record<SegmentKey, number>;
  customer: null | { name: string; order: string; value: number; budget: number; patience: number; segment: SegmentKey; fit: string; returning: boolean; source: string };
  message: string;
  event: string;
  dailyRevenue: number;
  dailyExpenses: number;
  quests: boolean[];
};

const BUSINESSES = {
  coffee: { name: "Coffee Cart", icon: "☕", tagline: "Fast, friendly, always moving", cost: 240, unit: 120, stock: "cups", color: "coral", description: "Low setup cost · Fast service · Steady foot traffic" },
  career: { name: "Career Studio", icon: "◆", tagline: "Turn ambition into opportunity", cost: 420, unit: 170, stock: "sessions", color: "teal", description: "Balanced setup · Higher value · Reputation driven" },
  agency: { name: "AI Agency", icon: "✦", tagline: "Automate the neighbourhood", cost: 620, unit: 280, stock: "capacity", color: "violet", description: "High setup cost · Fewer clients · Premium contracts" },
} as const;

const PEOPLE = ["Maya", "Noah", "Priya", "Lucas", "Ava", "Omar", "Sofia", "Ethan", "Mei", "Arjun"];
const ORDERS: Record<BusinessKey, string[]> = {
  coffee: ["Oat latte", "Cold brew", "Maple americano", "Masala chai"],
  career: ["Résumé review", "Interview practice", "Career roadmap", "LinkedIn refresh"],
  agency: ["Lead workflow", "Inbox agent", "Client dashboard", "AI process audit"],
};

const DISTRICTS = {
  junction: { name: "The Junction", icon: "◈", rent: 85, traffic: "Steady", tone: "Community-driven", description: "Families, students and loyal locals. Lower rent rewards patient brand building.", segments: ["Family", "Student", "Professional"] as SegmentKey[] },
  harbour: { name: "Harbourfront", icon: "≈", rent: 145, traffic: "High", tone: "Seasonal & social", description: "Tourists and professionals bring volume, but rent and expectations are higher.", segments: ["Tourist", "Professional", "Corporate"] as SegmentKey[] },
  liberty: { name: "Liberty Village", icon: "▦", rent: 125, traffic: "Targeted", tone: "Business-focused", description: "Startups, corporate teams and ambitious professionals value premium offers.", segments: ["Small Business", "Corporate", "Professional"] as SegmentKey[] },
} as const;

const SEGMENTS: Record<SegmentKey, { icon: string; budget: number; patience: number }> = {
  Student: { icon: "◒", budget: 120, patience: 3 }, Professional: { icon: "◆", budget: 220, patience: 3 },
  Family: { icon: "⌂", budget: 170, patience: 4 }, Tourist: { icon: "◎", budget: 190, patience: 2 },
  "Small Business": { icon: "▣", budget: 330, patience: 3 }, Corporate: { icon: "▲", budget: 460, patience: 2 },
};

const OFFERS: Record<BusinessKey, { names: string[]; notes: string[] }> = {
  coffee: { names: ["Quick Serve", "House Ritual", "Artisan Reserve"], notes: ["Low price · fast volume", "Balanced margin and loyalty", "Premium quality · higher cost"] },
  career: { names: ["Express Review", "Coaching Session", "Career Transformation"], notes: ["Fast, tactical support", "Balanced guidance", "Premium outcome package"] },
  agency: { names: ["Automation Sprint", "Managed Workflow", "Enterprise Control"], notes: ["Defined, fast project", "Recurring operational value", "Premium governed delivery"] },
};

const SUPPLIERS = {
  budget: { name: "Metro Value Supply", cost: .72, quality: -1, reliability: 72, note: "Lowest cost · occasional shortfall" },
  local: { name: "Ontario Local Co-op", cost: 1, quality: 1, reliability: 91, note: "Balanced cost · community reputation" },
  premium: { name: "Northstar Premium", cost: 1.35, quality: 3, reliability: 100, note: "Highest quality · guaranteed fulfilment" },
} as const;

const STAFF_ROLES: Record<BusinessKey, string[]> = {
  coffee: ["Barista", "Shift Lead", "Community Host"], career: ["Career Coach", "Résumé Specialist", "Client Coordinator"],
  agency: ["Automation Builder", "Account Strategist", "Governance Analyst"],
};

const STAGES = [
  { name: "Bootstrap", days: "Days 1–7", icon: "●", note: "Prove customers will pay." },
  { name: "Local Favourite", days: "Days 8–14", icon: "★", note: "Build loyalty and a capable team." },
  { name: "Growth Business", days: "Days 15–22", icon: "▲", note: "Defend margin while competitors react." },
  { name: "Micro Empire", days: "Days 23–30", icon: "◆", note: "Turn operations into an institution." },
];

const NARRATIVES: Record<number, { id: string; title: string; text: string; a: string; b: string }> = {
  4: { id: "review", title: "The One-Star Review", text: "A frustrated customer posts a detailed public complaint. The neighbourhood is watching how you respond.", a: "Refund publicly · Pay $120 · Reputation +9", b: "Defend the team · Morale +12 · Reputation −4" },
  8: { id: "festival", title: "The Junction Festival", text: "Organizers offer you the anchor booth. It could transform awareness, but the fee lands before the next rent payment.", a: "Sponsor it · Pay $350 · Reputation +14", b: "Stay focused · Cash +$120 from normal trade" },
  13: { id: "corporate", title: "The Corporate Contract", text: "A major client wants a discounted exclusive contract. Revenue is guaranteed, but smaller customers may feel abandoned.", a: "Sign exclusivity · Cash +$1,400 · Reputation −7", b: "Protect independence · Reputation +8" },
  19: { id: "talent", title: "Your Best Person Has an Offer", text: "A competitor approaches your most skilled employee. Keeping them will reset expectations across the team.", a: "Counteroffer · Pay $500 · Team morale +18", b: "Let them leave · Lose top employee · Cash protected" },
  24: { id: "investor", title: "The Expansion Offer", text: "An investor offers growth capital in exchange for influence over pricing and operating strategy.", a: "Take capital · Cash +$3,000 · Price locked premium", b: "Remain independent · Reputation +12 · Capacity +3" },
};

const DIFFICULTIES = {
  founder: { name: "Founder", icon: "●", rent: .8, budget: 1.15, rival: .7, note: "Forgiving cash flow · generous customers" },
  operator: { name: "Operator", icon: "▲", rent: 1, budget: 1, rival: 1, note: "Balanced operating challenge" },
  mogul: { name: "Mogul", icon: "◆", rent: 1.3, budget: .88, rival: 1.45, note: "Tight budgets · aggressive competition" },
} as const;

const ACHIEVEMENTS = {
  first_sale: { icon: "☕", name: "First Dollar", note: "Complete the first sale" },
  beloved: { icon: "★", name: "Beloved Brand", note: "Reach 90 reputation" },
  team: { icon: "♟", name: "Team Builder", note: "Hire three specialists" },
  leader: { icon: "▲", name: "Market Leader", note: "Reach 50% market share" },
  cash: { icon: "$", name: "Cash Engine", note: "Hold $10,000 cash" },
  judgment: { icon: "◈", name: "Founder Judgment", note: "Resolve all five story decisions" },
} as const;

const initialState: GameState = {
  phase: "home", business: null, district: "junction", day: 1, hour: 9, cash: 1000, reputation: 50,
  capacity: 8, maxCapacity: 8, served: 0, missed: 0, revenue: 0, expenses: 0,
  speed: 0, marketing: 0, decor: 0, price: 1, offer: 1,
  supplier: "local", staff: [], dailyCogs: 0, dailyPayroll: 0,
  stageRewarded: 0, decision: null, storyLog: [],
  difficulty: "operator", adviserTrust: { finance: 50, marketing: 50, people: 50, operations: 50 }, achievements: [],
  mode: "campaign", campaignDays: 30, scenarioName: "The 30-Day Founder Campaign", seed: 2026,
  interviews: 0, insights: 0, pmf: 35, acquiredCustomers: 0, repeatCustomers: 0, referrals: 0, marketingSpend: 0, totalCogs: 0, experiment: null, experimentHistory: [],
  competitors: [{ name: "Neighbour & Co.", price: 1, reputation: 48, share: 31 }, { name: "Urban Spark", price: 1.1, reputation: 54, share: 34 }],
  segmentSales: { Student: 0, Professional: 0, Family: 0, Tourist: 0, "Small Business": 0, Corporate: 0 },
  customer: null, message: "Your neighbourhood is waiting.",
  event: "", dailyRevenue: 0, dailyExpenses: 0, quests: [false, false, false],
};

function money(n: number) { return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n); }
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

export default function Home() {
  const [game, setGame] = useState<GameState>(initialState);
  const [showHelp, setShowHelp] = useState(false);
  const [sound, setSound] = useState(true);
  const [selected, setSelected] = useState<BusinessKey>("coffee");
  const [opsTab, setOpsTab] = useState<"trade" | "team" | "supply" | "market" | "council" | "lab">("trade");
  const [hydrated, setHydrated] = useState(false);
  const [scenarioDraft, setScenarioDraft] = useState({ name: "My Founder Challenge", cash: 1000, days: 20, difficulty: "operator" as DifficultyKey, business: "coffee" as BusinessKey, district: "junction" as DistrictKey, seed: 4242 });
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("micro-empire-save");
      if (saved) try {
        const prior = JSON.parse(saved);
        setGame({ ...initialState, ...prior, segmentSales: { ...initialState.segmentSales, ...(prior.segmentSales || {}) }, customer: null, phase: "home" });
      } catch { /* ignore invalid save */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("micro-empire-save", JSON.stringify(game)); }, [game, hydrated]);
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/micro-empire-game/sw.js").catch(() => undefined); }, []);

  const business = game.business ? BUSINESSES[game.business] : null;
  const clock = `${game.hour > 12 ? game.hour - 12 : game.hour}:00 ${game.hour >= 12 ? "PM" : "AM"}`;
  const stageIndex = Math.min(3, Math.floor(((game.day - 1) / game.campaignDays) * 4));
  const score = Math.round(game.cash * .35 + game.reputation * 35 + game.served * 28 + playerMarketShare() * 20 + game.storyLog.length * 180);
  const rating = score >= 16000 ? "Empire Builder" : score >= 11000 ? "Micro-SaaS Master" : score >= 6500 ? "Growth Operator" : "Resilient Founder";
  const winCash = Math.round(15000 * game.campaignDays / 30);
  const winCustomers = Math.round(100 * game.campaignDays / 30);
  const conversion = game.served + game.missed ? game.served / (game.served + game.missed) : 0;
  const retention = game.served ? game.repeatCustomers / game.served : 0;
  const cac = game.acquiredCustomers ? game.marketingSpend / game.acquiredCustomers : 0;
  const averageOrder = game.served ? game.revenue / game.served : 0;
  const ltv = averageOrder * Math.min(5, 1 / Math.max(.2, 1 - retention));
  const grossMargin = game.revenue ? (game.revenue - game.totalCogs) / game.revenue : 0;

  function beep(tone = 520) {
    if (!sound) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.frequency.value = tone; gain.gain.setValueAtTime(.05, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .12);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .12);
    } catch { /* audio is an enhancement */ }
  }

  function startBusiness() {
    const b = BUSINESSES[selected];
    const max = selected === "coffee" ? 10 : selected === "career" ? 7 : 5;
    setGame({ ...initialState, phase: "play", business: selected, cash: game.cash - b.cost, capacity: max, maxCapacity: max,
      expenses: b.cost, dailyExpenses: b.cost, message: `${b.name} is open. Serve your first customer!`,
      district: game.district, difficulty: game.difficulty, mode: game.mode, campaignDays: game.campaignDays, scenarioName: game.scenarioName, seed: game.seed,
      customer: makeCustomer(selected, b.unit, 50, game.district, 1, 1, game.difficulty, 35, 0), event: `Opening Day in ${DISTRICTS[game.district].name}: neighbours are curious.` });
    beep(680);
    setShowHelp(true);
  }

  function makeCustomer(key: BusinessKey, base: number, rep: number, district: DistrictKey, price: number, offer: number, difficulty: DifficultyKey, pmf: number, referrals: number) {
    const local = DISTRICTS[district].segments;
    const all = Object.keys(SEGMENTS) as SegmentKey[];
    const segment = Math.random() < .78 ? local[Math.floor(Math.random() * local.length)] : all[Math.floor(Math.random() * all.length)];
    const profile = SEGMENTS[segment];
    const offerMultiplier = [.82, 1, 1.28][offer];
    const value = Math.round(base * price * offerMultiplier * (0.92 + Math.random() * .16) * (1 + Math.max(0, rep - 50) / 300));
    const budget = Math.round(profile.budget * (key === "coffee" ? .75 : key === "career" ? 1.15 : 1.8) * DIFFICULTIES[difficulty].budget);
    const fit = local.includes(segment) ? "Strong local fit" : "Visiting segment";
    const returning = Math.random() < clamp(pmf / 160, .05, .58);
    const source = returning ? "Repeat customer" : Math.random() < clamp(referrals / 20, 0, .35) ? "Customer referral" : "New acquisition";
    return { name: PEOPLE[Math.floor(Math.random() * PEOPLE.length)], order: ORDERS[key][Math.floor(Math.random() * ORDERS[key].length)], value, budget, patience: profile.patience + (returning ? 1 : 0), segment, fit, returning, source };
  }

  function advance(mutator: (g: GameState) => GameState) {
    setGame(prev => {
      let next = mutator({ ...prev });
      let customer = next.customer;
      if (customer) {
        customer = { ...customer, patience: customer.patience - 1 };
        if (customer.patience <= 0) {
          next = { ...next, reputation: clamp(next.reputation - 5, 0, 100), pmf: clamp(next.pmf - 1, 0, 100), missed: next.missed + 1, message: `${customer.name} left unhappy. Reputation -5 · PMF -1.` };
          customer = null;
        }
      }
      const newHour = next.hour + 1;
      next = { ...next, hour: newHour, customer };
      if (!next.customer && next.business && newHour < 17) next.customer = makeCustomer(next.business, BUSINESSES[next.business].unit, next.reputation, next.district, next.price, next.offer, next.difficulty, next.pmf, next.referrals);
      if (newHour >= 17) return closeDay(next);
      return updateQuests(next);
    });
  }

  function updateQuests(g: GameState) {
    const unlocked = new Set(g.achievements);
    if (g.served >= 1) unlocked.add("first_sale");
    if (g.reputation >= 90) unlocked.add("beloved");
    if (g.staff.length >= 3) unlocked.add("team");
    if (100 - g.competitors.reduce((sum,c) => sum + c.share, 0) >= 50) unlocked.add("leader");
    if (g.cash >= 10000) unlocked.add("cash");
    if (g.storyLog.length >= 5) unlocked.add("judgment");
    return { ...g, quests: [g.served >= 30, g.reputation >= 75, g.revenue >= 12000], achievements: [...unlocked] };
  }

  function serve() {
    if (!game.customer || game.capacity <= 0) return;
    advance(g => {
      if (!g.customer) return g;
      if (g.customer.value > g.customer.budget * 1.15) {
        return { ...g, reputation: clamp(g.reputation - 2, 0, 100), pmf: clamp(g.pmf - 2, 0, 100), missed: g.missed + 1,
          message: `${g.customer.name} declined—${money(g.customer.value)} exceeded their ${g.customer.segment.toLowerCase()} budget.`, customer: null };
      }
      const bonus = 1 + g.decor * .08;
      const earned = Math.round(g.customer.value * bonus);
      const supplier = SUPPLIERS[g.supplier];
      const operatingCost = Math.round([4, 11, 24][g.offer] * (g.business === "coffee" ? 1 : g.business === "career" ? 2 : 4) * supplier.cost);
      const staffSkill = g.staff.reduce((sum, member) => sum + member.skill, 0);
      const rep = Math.max(1, [1, 3, 5][g.offer] + g.speed + supplier.quality + Math.floor(staffSkill / 3));
      const experimentProgress = g.experiment ? g.experiment.progress + 1 : 0;
      const experimentComplete = Boolean(g.experiment && experimentProgress >= g.experiment.target);
      const referralsEarned = g.reputation >= 75 && (g.customer.returning || g.pmf >= 70) ? 1 : 0;
      const pmfGain = g.customer.fit === "Strong local fit" ? 2 : 1;
      beep(760);
      return { ...g, cash: g.cash + earned - operatingCost, revenue: g.revenue + earned, dailyRevenue: g.dailyRevenue + earned,
        expenses: g.expenses + operatingCost, dailyExpenses: g.dailyExpenses + operatingCost, dailyCogs: g.dailyCogs + operatingCost, totalCogs: g.totalCogs + operatingCost,
        staff: g.staff.map(member => ({ ...member, morale: clamp(member.morale - 2, 20, 100) })),
        served: g.served + 1, capacity: g.capacity - 1, reputation: clamp(g.reputation + rep, 0, 100),
        pmf: clamp(g.pmf + pmfGain + (experimentComplete ? 6 : 0), 0, 100), acquiredCustomers: g.acquiredCustomers + (g.customer.returning ? 0 : 1),
        repeatCustomers: g.repeatCustomers + (g.customer.returning ? 1 : 0), referrals: g.referrals + referralsEarned,
        experimentHistory: experimentComplete && g.experiment ? [...g.experimentHistory, g.experiment.type] : g.experimentHistory,
        experiment: experimentComplete ? null : g.experiment ? { ...g.experiment, progress: experimentProgress } : null,
        segmentSales: { ...g.segmentSales, [g.customer.segment]: (g.segmentSales[g.customer.segment] || 0) + 1 },
        message: experimentComplete ? `Experiment complete: evidence improved product-market fit by 6.` : `${g.customer.name} loved it! +${money(earned)} · PMF +${pmfGain}${referralsEarned ? " · Referral earned" : ""}`, customer: null };
    });
  }

  function promote() {
    const cost = 75 + game.marketing * 25;
    if (game.cash < cost) return;
    advance(g => ({ ...g, cash: g.cash - cost, expenses: g.expenses + cost, dailyExpenses: g.dailyExpenses + cost,
      marketing: g.marketing + 1, marketingSpend: g.marketingSpend + cost, reputation: clamp(g.reputation + 7, 0, 100), message: `Local campaign launched. Reputation +7.` }));
    beep(600);
  }

  function restock() {
    const missing = game.maxCapacity - game.capacity;
    const supplier = SUPPLIERS[game.supplier];
    const cost = Math.round(Math.max(40, missing * (game.business === "coffee" ? 8 : game.business === "career" ? 16 : 28)) * supplier.cost);
    if (!missing || game.cash < cost) return;
    const delivered = Math.random() * 100 <= supplier.reliability ? game.maxCapacity : Math.max(game.capacity + 1, Math.round(game.maxCapacity * .65));
    advance(g => ({ ...g, cash: g.cash - cost, expenses: g.expenses + cost, dailyExpenses: g.dailyExpenses + cost,
      dailyCogs: g.dailyCogs + cost, totalCogs: g.totalCogs + cost, capacity: delivered, message: delivered === g.maxCapacity ? `${supplier.name} delivered in full for ${money(cost)}.` : `${supplier.name} had a shortfall—only ${delivered}/${g.maxCapacity} capacity received.` }));
    beep(460);
  }

  function upgrade(kind: "speed" | "decor" | "capacity") {
    const level = kind === "speed" ? game.speed : kind === "decor" ? game.decor : game.maxCapacity - (game.business === "coffee" ? 10 : game.business === "career" ? 7 : 5);
    const cost = 180 + Math.max(0, level) * 120;
    if (game.cash < cost) return;
    setGame(g => ({ ...g, cash: g.cash - cost, expenses: g.expenses + cost, dailyExpenses: g.dailyExpenses + cost,
      speed: kind === "speed" ? g.speed + 1 : g.speed, decor: kind === "decor" ? g.decor + 1 : g.decor,
      maxCapacity: kind === "capacity" ? g.maxCapacity + 2 : g.maxCapacity,
      capacity: kind === "capacity" ? g.capacity + 2 : g.capacity,
      message: `${kind === "speed" ? "Service system" : kind === "decor" ? "Storefront" : "Capacity"} upgraded!` }));
    beep(820);
  }

  function closeDay(g: GameState): GameState {
    const rent = Math.round((DISTRICTS[g.district].rent + g.day * 10) * DIFFICULTIES[g.difficulty].rent);
    const payroll = g.staff.reduce((sum, member) => sum + member.salary, 0);
    const cash = g.cash - rent - payroll;
    const expenses = g.expenses + rent + payroll;
    const dailyExpenses = g.dailyExpenses + rent + payroll;
    const finished = g.day >= g.campaignDays || cash < 0;
    const playerStrength = g.reputation / Math.max(.7, g.price);
    const rival = DIFFICULTIES[g.difficulty].rival;
    const competitors = g.competitors.map((c, i) => ({ ...c, price: clamp(Math.round((c.price + (i ? -.05 : .04) * rival) * 100) / 100, .75, 1.35),
      reputation: clamp(c.reputation + (Math.random() > .45 ? Math.round(2 * rival) : -1), 25, 95), share: clamp(Math.round(c.share + (c.reputation - g.reputation) / (18 / rival)), 12, 55) }));
    const playerShare = clamp(Math.round(100 - competitors.reduce((s,c) => s + c.share, 0) + playerStrength / 12), 10, 65);
    competitors[0].share = Math.round((100 - playerShare) * .48); competitors[1].share = 100 - playerShare - competitors[0].share;
    return updateQuests({ ...g, cash, expenses, dailyExpenses, dailyPayroll: payroll, competitors, customer: null, phase: finished ? "result" : "dayEnd",
      message: cash < 0 ? "The business ran out of cash." : `Day ${g.day} complete. Rent ${money(rent)} · Payroll ${money(payroll)}.` });
  }

  function beginNextDay(base?: GameState) {
    const events = [
      { text: "Supplier discount: capacity fully restored", apply: (g: GameState) => ({ ...g, capacity: g.maxCapacity }) },
      { text: "Viral neighbourhood post: reputation +10", apply: (g: GameState) => ({ ...g, reputation: clamp(g.reputation + 10, 0, 100) }) },
      { text: "Rainy morning: reputation -3, but loyal customers remain", apply: (g: GameState) => ({ ...g, reputation: clamp(g.reputation - 3, 0, 100) }) },
      { text: "Community festival: $120 sponsorship cost, reputation +12", apply: (g: GameState) => ({ ...g, cash: g.cash - 120, expenses: g.expenses + 120, reputation: clamp(g.reputation + 12, 0, 100) }) },
      { text: "Corporate enquiry: today’s customers pay 15% more", apply: (g: GameState) => ({ ...g, reputation: clamp(g.reputation + 4, 0, 100) }) },
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    setGame(current => {
      const g = base || current;
      const nextDayNumber = g.day + 1;
      const nextStage = Math.min(3, Math.floor(((nextDayNumber - 1) / g.campaignDays) * 4));
      const stageUp = nextStage > g.stageRewarded;
      const next = ev.apply({ ...g, day: nextDayNumber, hour: 9, phase: "play", event: stageUp ? `${STAGES[nextStage].name} unlocked! $750 growth grant and +3 capacity.` : ev.text,
        dailyRevenue: 0, dailyExpenses: 0, dailyCogs: 0, dailyPayroll: 0, decision: null,
        cash: g.cash + (stageUp ? 750 : 0), maxCapacity: g.maxCapacity + (stageUp ? 3 : 0), capacity: stageUp ? g.maxCapacity + 3 : g.capacity,
        reputation: clamp(g.reputation + (stageUp ? 5 : 0), 0, 100), stageRewarded: Math.max(g.stageRewarded, nextStage),
        staff: g.staff.map(member => ({ ...member, morale: clamp(member.morale + 8, 20, 100) })),
        message: stageUp ? `Welcome to ${STAGES[nextStage].name}. Your operating ceiling just expanded.` : `Day ${nextDayNumber} begins. ${ev.text}` });
      if (next.business) next.customer = makeCustomer(next.business, BUSINESSES[next.business].unit, next.reputation, next.district, next.price, next.offer, next.difficulty, next.pmf, next.referrals);
      return next;
    });
    beep(650);
  }

  function continueCampaign() {
    const story = NARRATIVES[game.day + 1];
    if (story) setGame(g => ({ ...g, phase: "decision", decision: story.id }));
    else beginNextDay();
  }

  function resolveDecision(choice: "a" | "b") {
    setGame(g => {
      const id = g.decision;
      let next = { ...g, storyLog: [...g.storyLog, `${id}:${choice}`] };
      if (id === "review") next = choice === "a" ? { ...next, cash: next.cash-120, expenses:next.expenses+120, reputation:clamp(next.reputation+9,0,100) } : { ...next, reputation:clamp(next.reputation-4,0,100), staff:next.staff.map(m=>({...m,morale:clamp(m.morale+12,20,100)})) };
      if (id === "festival") next = choice === "a" ? { ...next, cash:next.cash-350, expenses:next.expenses+350, reputation:clamp(next.reputation+14,0,100) } : { ...next, cash:next.cash+120, revenue:next.revenue+120 };
      if (id === "corporate") next = choice === "a" ? { ...next, cash:next.cash+1400, revenue:next.revenue+1400, reputation:clamp(next.reputation-7,0,100) } : { ...next, reputation:clamp(next.reputation+8,0,100) };
      if (id === "talent") next = choice === "a" ? { ...next, cash:next.cash-500, expenses:next.expenses+500, staff:next.staff.map(m=>({...m,morale:clamp(m.morale+18,20,100)})) } : { ...next, staff:[...next.staff].sort((a,b)=>b.skill-a.skill).slice(1) };
      if (id === "investor") next = choice === "a" ? { ...next, cash:next.cash+3000, price:1.3 } : { ...next, reputation:clamp(next.reputation+12,0,100), maxCapacity:next.maxCapacity+3, capacity:next.capacity+3 };
      window.setTimeout(() => beginNextDay(next), 0);
      return next;
    });
  }

  function reset() { localStorage.removeItem("micro-empire-save"); setGame(initialState); setSelected("coffee"); beep(400); }

  function prepareDailyChallenge() {
    const dateKey = Number(new Date().toISOString().slice(0,10).replaceAll("-",""));
    const businesses = Object.keys(BUSINESSES) as BusinessKey[]; const districts = Object.keys(DISTRICTS) as DistrictKey[];
    const businessKey = businesses[dateKey % businesses.length]; const district = districts[Math.floor(dateKey / 3) % districts.length];
    setSelected(businessKey);
    setGame({ ...initialState, phase:"district", business:businessKey, district, difficulty:"mogul", mode:"daily", campaignDays:14, cash:850, scenarioName:`Daily Challenge · ${new Date().toLocaleDateString("en-CA")}`, seed:dateKey });
  }

  function launchCustomScenario() {
    setSelected(scenarioDraft.business);
    setGame({ ...initialState, phase:"district", business:scenarioDraft.business, district:scenarioDraft.district, difficulty:scenarioDraft.difficulty, mode:"custom", campaignDays:scenarioDraft.days, cash:scenarioDraft.cash, scenarioName:scenarioDraft.name, seed:scenarioDraft.seed });
  }

  function scenarioCode() { return btoa(unescape(encodeURIComponent(JSON.stringify(scenarioDraft)))); }
  function shareScenario() { navigator.clipboard?.writeText(scenarioCode()); setShareStatus("Challenge code copied"); window.setTimeout(()=>setShareStatus(""),1800); }
  function importScenario(code: string) { try { const data=JSON.parse(decodeURIComponent(escape(atob(code.trim())))); setScenarioDraft({ ...scenarioDraft, ...data }); setShareStatus("Challenge imported"); } catch { setShareStatus("Invalid challenge code"); } }
  function shareScore() { const text=`Micro Empire · ${game.scenarioName}\nScore ${score.toLocaleString()} · ${rating}\n${money(game.cash)} cash · ${game.reputation} reputation · ${game.served} customers\nhttps://learningsemantics.github.io/micro-empire-game/`; navigator.clipboard?.writeText(text); setShareStatus("Scorecard copied"); }

  function interviewCustomer() {
    if (game.cash < 25) return;
    advance(g => ({ ...g, cash:g.cash-25, expenses:g.expenses+25, dailyExpenses:g.dailyExpenses+25, interviews:g.interviews+1,
      insights:g.insights+1, pmf:clamp(g.pmf+2,0,100), message:`Interview insight #${g.insights+1}: ${DISTRICTS[g.district].segments[g.insights % 3]} customers value ${g.offer === 2 ? "proof and premium outcomes" : g.price > 1 ? "clear value justification" : "convenience and trust"}. PMF +2.` }));
    beep(610);
  }

  function startExperiment(type: ExperimentKey) {
    if (game.experiment || game.cash < 100) return;
    setGame(g => ({ ...g, cash:g.cash-100, expenses:g.expenses+100, dailyExpenses:g.dailyExpenses+100, experiment:{type,progress:0,target:5},
      message:`${type === "price" ? "Pricing" : type === "segment" ? "Customer segment" : "Offer positioning"} experiment started. Serve five customers to collect evidence.` }));
    beep(740);
  }

  function adjustPrice(delta: number) {
    setGame(g => ({ ...g, price: clamp(Math.round((g.price + delta) * 10) / 10, .7, 1.5), message: "Pricing updated. Watch how each customer segment responds." }));
    beep(540);
  }

  function hireStaff() {
    if (!game.business || game.cash < 150 || game.staff.length >= 3) return;
    const role = STAFF_ROLES[game.business][game.staff.length];
    const name = PEOPLE[(game.staff.length + game.day * 2) % PEOPLE.length];
    const member: StaffMember = { id: Date.now(), name, role, skill: 1, morale: 82, salary: 55 + game.staff.length * 15 };
    setGame(g => ({ ...g, cash: g.cash - 150, expenses: g.expenses + 150, dailyExpenses: g.dailyExpenses + 150, staff: [...g.staff, member],
      maxCapacity: g.maxCapacity + 2, capacity: g.capacity + 2, message: `${name} joined as ${role}. Daily payroll is now ${money(g.staff.reduce((s,m) => s + m.salary, 0) + member.salary)}.` }));
    beep(720);
  }

  function trainStaff(id: number) {
    if (game.cash < 110) return;
    setGame(g => ({ ...g, cash: g.cash - 110, expenses: g.expenses + 110, dailyExpenses: g.dailyExpenses + 110,
      staff: g.staff.map(m => m.id === id ? { ...m, skill: Math.min(5, m.skill + 1), morale: clamp(m.morale + 7, 20, 100) } : m), message: "Training completed. Service quality and morale improved." }));
    beep(810);
  }

  function playerMarketShare() { return clamp(100 - game.competitors.reduce((sum,c) => sum + c.share, 0), 10, 65); }

  function adviserAdvice(key: AdviserKey) {
    const advice = {
      finance: { name: "Mira", role: "Finance", icon: "$", confidence: game.cash < 1000 ? 92 : 74, text: game.cash < 1000 ? "Protect runway: move supply to value tier and raise price before the next rent cycle." : "Margin can fund growth. Raise price 10% and preserve cash for payroll.", action: "Adopt margin plan" },
      marketing: { name: "Leo", role: "Growth", icon: "✦", confidence: game.reputation < 70 ? 89 : 71, text: "Invest $180 in a focused neighbourhood campaign. It conflicts with Finance, but adds reputation quickly.", action: "Launch campaign" },
      people: { name: "Asha", role: "People", icon: "♥", confidence: game.staff.length ? 86 : 58, text: game.staff.length ? "Spend $160 on recovery and recognition before morale becomes a service-quality risk." : "Hire before scaling demand. A solo founder is now the operating bottleneck.", action: game.staff.length ? "Fund team recovery" : "Back hiring plan" },
      operations: { name: "Owen", role: "Operations", icon: "⚙", confidence: game.capacity < game.maxCapacity / 2 ? 93 : 76, text: "Spend $140 to stabilize capacity and standardize on the reliable local supplier." , action: "Stabilize operations" },
    };
    return advice[key];
  }

  function followAdvice(key: AdviserKey) {
    setGame(g => {
      let next = { ...g };
      if (key === "finance") next = { ...next, price: clamp(next.price + .1, .7, 1.5), supplier: "budget", staff: next.staff.map(m=>({...m,morale:clamp(m.morale-3,20,100)})), message:"Finance plan adopted: margin improved, but the team dislikes the cost pressure." };
      if (key === "marketing" && next.cash >= 180) next = { ...next, cash:next.cash-180, expenses:next.expenses+180, dailyExpenses:next.dailyExpenses+180, reputation:clamp(next.reputation+10,0,100), message:"Growth campaign launched. Finance warns that runway has shortened." };
      if (key === "people" && next.staff.length && next.cash >= 160) next = { ...next, cash:next.cash-160, expenses:next.expenses+160, dailyExpenses:next.dailyExpenses+160, reputation:clamp(next.reputation+2,0,100), staff:next.staff.map(m=>({...m,morale:clamp(m.morale+15,20,100)})), message:"Team recovery funded. Morale and service confidence rose." };
      if (key === "people" && !next.staff.length) { window.setTimeout(hireStaff,0); return next; }
      if (key === "operations" && next.cash >= 140) next = { ...next, cash:next.cash-140, expenses:next.expenses+140, dailyExpenses:next.dailyExpenses+140, supplier:"local", capacity:next.maxCapacity, message:"Operations stabilized capacity and restored the local supplier." };
      next.adviserTrust = Object.fromEntries(Object.entries(next.adviserTrust).map(([k,v]) => [k, clamp(v + (k === key ? 7 : -2), 10, 100)])) as Record<AdviserKey, number>;
      return updateQuests(next);
    });
    beep(690);
  }

  if (!hydrated) return <main className="loading">Opening your neighbourhood…</main>;

  return (
    <main className={`game-shell phase-${game.phase}`}>
      <div className="sky"><span className="cloud c1"/><span className="cloud c2"/><span className="sun"/></div>
      <header className="topbar">
        <button className="brand" onClick={() => setGame(g => ({ ...g, phase: "home" }))} aria-label="Micro Empire home">
          <span>MICRO</span><strong>EMPIRE</strong>
        </button>
        <div className="hud" aria-label="Game status">
          <Stat icon="▣" label="Day" value={`${game.day} / ${game.campaignDays}`} />
          <Stat icon="$" label="Cash" value={money(game.cash)} danger={game.cash < 250} />
          <Stat icon="★" label="Reputation" value={`${game.reputation}`} />
          <Stat icon="◷" label="Time" value={clock} />
        </div>
        <button className="icon-button" onClick={() => setSound(!sound)} aria-label="Toggle sound">{sound ? "♪" : "×"}</button>
        <button className="icon-button" onClick={() => setShowHelp(true)} aria-label="How to play">?</button>
      </header>

      {game.phase === "home" && (
        <section className="home-screen screen">
          <div className="hero-copy">
            <p className="eyebrow">A Toronto founder story</p>
            <h1>MICRO<br/><span>EMPIRE</span></h1>
            <div className="ribbon">V3 · Creator &amp; Challenge Edition</div>
            <p className="lede">Build a company, master the daily challenge, or design a scenario for another founder.</p>
            <button className="primary huge" onClick={() => setGame(g => ({ ...g, phase: "modes" }))}>Choose game mode <span>→</span></button>
            {game.business && <button className="text-button" onClick={() => setGame(g => ({ ...g, phase: "play" }))}>Continue saved game · Day {game.day}</button>}
          </div>
          <Neighbourhood active={game.business || "coffee"} people={6}/>
        </section>
      )}

      {game.phase === "modes" && (
        <section className="mode-screen screen"><div className="selection-head"><p className="eyebrow">Micro Empire V3</p><h2>How will you build?</h2><p>Every mode uses the complete economy, staff, supply, competition and agentic-adviser systems.</p></div>
          <div className="mode-grid">
            <button onClick={() => setGame(g=>({...initialState,phase:"select",mode:"campaign",campaignDays:30,scenarioName:"The 30-Day Founder Campaign"}))}><i>◆</i><small>CORE EXPERIENCE</small><b>Founder Campaign</b><span>Thirty days, four growth stages and five consequential story decisions.</span><em>30 days · configurable difficulty</em></button>
            <button onClick={prepareDailyChallenge}><i>◷</i><small>SAME FOR EVERY PLAYER</small><b>Daily Challenge</b><span>A fixed business, district and Mogul economy generated from today’s date.</span><em>14 days · share your final score</em></button>
            <button onClick={() => setGame(g=>({...g,phase:"scenario"}))}><i>⚙</i><small>CREATE &amp; SHARE</small><b>Scenario Lab</b><span>Design campaign rules and generate a portable challenge code.</span><em>Custom cash · length · market</em></button>
          </div><button className="text-button" onClick={() => setGame(g=>({...g,phase:"home"}))}>← Home</button>
        </section>
      )}

      {game.phase === "scenario" && (
        <section className="scenario-screen screen"><div className="scenario-builder"><p className="eyebrow">Scenario laboratory</p><h2>Design a founder challenge</h2><div className="builder-grid">
          <label>Scenario name<input value={scenarioDraft.name} onChange={e=>setScenarioDraft({...scenarioDraft,name:e.target.value})}/></label>
          <label>Starting cash<input type="number" min="500" max="5000" step="100" value={scenarioDraft.cash} onChange={e=>setScenarioDraft({...scenarioDraft,cash:Number(e.target.value)})}/></label>
          <label>Campaign days<input type="range" min="7" max="30" value={scenarioDraft.days} onChange={e=>setScenarioDraft({...scenarioDraft,days:Number(e.target.value)})}/><b>{scenarioDraft.days} days</b></label>
          <label>Difficulty<select value={scenarioDraft.difficulty} onChange={e=>setScenarioDraft({...scenarioDraft,difficulty:e.target.value as DifficultyKey})}>{(Object.keys(DIFFICULTIES) as DifficultyKey[]).map(k=><option key={k} value={k}>{DIFFICULTIES[k].name}</option>)}</select></label>
          <label>Business<select value={scenarioDraft.business} onChange={e=>setScenarioDraft({...scenarioDraft,business:e.target.value as BusinessKey})}>{(Object.keys(BUSINESSES) as BusinessKey[]).map(k=><option key={k} value={k}>{BUSINESSES[k].name}</option>)}</select></label>
          <label>District<select value={scenarioDraft.district} onChange={e=>setScenarioDraft({...scenarioDraft,district:e.target.value as DistrictKey})}>{(Object.keys(DISTRICTS) as DistrictKey[]).map(k=><option key={k} value={k}>{DISTRICTS[k].name}</option>)}</select></label>
          <label>Challenge seed<input type="number" value={scenarioDraft.seed} onChange={e=>setScenarioDraft({...scenarioDraft,seed:Number(e.target.value)})}/></label>
        </div><div className="code-box"><textarea aria-label="Challenge code" value={scenarioCode()} readOnly/><button onClick={shareScenario}>Copy code</button></div><div className="import-box"><input id="import-code" placeholder="Paste a challenge code"/><button onClick={()=>importScenario((document.getElementById("import-code") as HTMLInputElement).value)}>Import</button></div>{shareStatus&&<p className="share-status">{shareStatus}</p>}
        <button className="primary" onClick={launchCustomScenario}>Launch scenario <span>→</span></button><button className="text-button" onClick={()=>setGame(g=>({...g,phase:"modes"}))}>← Game modes</button></div></section>
      )}

      {game.phase === "select" && (
        <section className="select-screen screen">
          <div className="selection-head"><p className="eyebrow">Choose your first venture</p><h2>What will you build?</h2><p>Each business has a different rhythm. You begin with $1,000—spend wisely.</p></div>
          <div className="business-grid">
            {(Object.keys(BUSINESSES) as BusinessKey[]).map(key => {
              const b = BUSINESSES[key];
              return <button key={key} className={`business-card ${b.color} ${selected === key ? "selected" : ""}`} onClick={() => setSelected(key)}>
                <span className="biz-icon">{b.icon}</span><span className="selected-mark">✓</span>
                <strong>{b.name}</strong><em>{b.tagline}</em><span className="mini-scene"><i/><i/><i/></span>
                <span className="biz-desc">{b.description}</span><span className="setup">Setup <b>{money(b.cost)}</b></span>
              </button>;
            })}
          </div>
          <button className="primary" onClick={() => setGame(g => ({ ...g, phase: "district", business: selected }))}>Choose your location <span>→</span></button>
          <button className="text-button" onClick={() => setGame(g => ({ ...g, phase: "home" }))}>← Back</button>
        </section>
      )}

      {game.phase === "district" && (
        <section className="district-screen screen">
          <div className="selection-head"><p className="eyebrow">Toronto opportunity map</p><h2>Choose your neighbourhood</h2><p>Location changes rent, customer mix and the strategy required to win.</p></div>
          {game.mode === "daily" && <p className="daily-lock">◷ Daily rules are locked so every player receives the same challenge.</p>}
          <div className="difficulty-row">{(Object.keys(DIFFICULTIES) as DifficultyKey[]).map(key => <button key={key} disabled={game.mode === "daily"} className={game.difficulty === key ? "selected" : ""} onClick={() => setGame(g=>({...g,difficulty:key}))}><i>{DIFFICULTIES[key].icon}</i><b>{DIFFICULTIES[key].name}</b><span>{DIFFICULTIES[key].note}</span></button>)}</div>
          <div className="city-map">
            <div className="map-water">LAKE ONTARIO</div><div className="map-grid"/>
            {(Object.keys(DISTRICTS) as DistrictKey[]).map((key, index) => {
              const d = DISTRICTS[key];
              return <button key={key} disabled={game.mode === "daily"} className={`district-pin pin-${index + 1} ${game.district === key ? "selected" : ""}`} onClick={() => setGame(g => ({ ...g, district: key }))}>
                <i>{d.icon}</i><strong>{d.name}</strong><span>{d.tone}</span>
              </button>;
            })}
          </div>
          <div className="district-detail">
            <div><p className="eyebrow">Selected district</p><h3>{DISTRICTS[game.district].name}</h3><p>{DISTRICTS[game.district].description}</p></div>
            <dl><div><dt>Daily rent</dt><dd>{money(Math.round(DISTRICTS[game.district].rent * DIFFICULTIES[game.difficulty].rent))}</dd></div><div><dt>Difficulty</dt><dd>{DIFFICULTIES[game.difficulty].name}</dd></div><div><dt>Core customers</dt><dd>{DISTRICTS[game.district].segments.join(" · ")}</dd></div></dl>
          </div>
          <button className="primary" onClick={startBusiness}>Open in {DISTRICTS[game.district].name} <span>→</span></button>
          <button className="text-button" onClick={() => setGame(g => ({ ...g, phase: "select" }))}>← Change business</button>
        </section>
      )}

      {game.phase === "play" && business && (
        <section className="play-screen screen">
          <aside className="left-panel">
            <p className="eyebrow">{business.icon} {business.name}</p>
            <h2>Day {game.day}</h2>
            <div className="stage-card"><i>{STAGES[stageIndex].icon}</i><span><small>{game.mode.toUpperCase()} · {game.scenarioName}</small><b>{STAGES[stageIndex].name}</b><em>{STAGES[stageIndex].note}</em></span></div>
            <div className="pmf-card"><span><small>PRODUCT–MARKET FIT</small><b>{game.pmf}/100</b></span><i><u style={{width:`${game.pmf}%`}}/></i><em>{game.pmf >= 75 ? "Strong pull · protect retention" : game.pmf >= 50 ? "Promising · keep experimenting" : "Weak signal · interview customers"}</em></div>
            <div className="location-chip">{DISTRICTS[game.district].icon} {DISTRICTS[game.district].name} · {DIFFICULTIES[game.difficulty].name}<small>{money(Math.round((DISTRICTS[game.district].rent + game.day * 10) * DIFFICULTIES[game.difficulty].rent))} rent due today</small></div>
            <p className="event-banner">{game.event || "A fresh day in the neighbourhood"}</p>
            <div className="quests"><h3>Founder goals</h3>
              <Quest done={game.quests[0]} label="Serve 30 customers" progress={`${Math.min(game.served, 30)}/30`} />
              <Quest done={game.quests[1]} label="Reach 75 reputation" progress={`${Math.min(game.reputation, 75)}/75`} />
              <Quest done={game.quests[2]} label="Earn $12,000 revenue" progress={`${money(Math.min(game.revenue, 12000))}/$12,000`} />
            </div>
            <div className="ledger"><span>Total revenue <b>{money(game.revenue)}</b></span><span>Total expenses <b>{money(game.expenses)}</b></span><span>Customers served <b>{game.served}</b></span></div>
            <div className="segment-ledger"><h3>Customer mix</h3>{Object.entries(game.segmentSales).filter(([,count]) => count > 0).map(([segment,count]) => <span key={segment}><b>{SEGMENTS[segment as SegmentKey].icon} {segment}</b><i>{count}</i></span>)}{game.served === 0 && <small>No sales yet—learn who responds.</small>}</div>
            <div className="achievement-mini"><h3>Achievements · {game.achievements.length}/6</h3>{game.achievements.slice(-3).map(id => <i key={id} title={ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS].name}>{ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS].icon}</i>)}</div>
          </aside>

          <div className="world-panel">
            <Neighbourhood active={game.business!} people={Math.min(10, 3 + game.marketing + Math.floor(game.reputation / 20))}/>
            <div className="store-sign">{business.icon} {business.name}<small>OPEN · {game.capacity}/{game.maxCapacity} {business.stock}</small></div>
            {game.customer ? <div className="customer-card">
              <div className="avatar">{game.customer.name[0]}</div><div><small>{game.customer.source.toUpperCase()} · {SEGMENTS[game.customer.segment].icon} {game.customer.segment.toUpperCase()}</small><strong>{game.customer.name}</strong><span>{game.customer.order} · Price {money(game.customer.value)} · {game.insights >= 3 ? `Budget ${money(game.customer.budget)}` : "Budget signal locked—interview customers"}</span>
              <div className="patience"><i style={{ width: `${game.customer.patience / 3 * 100}%` }}/></div></div>
            </div> : <div className="customer-card quiet">Waiting for the next customer…</div>}
            <div className="toast" aria-live="polite">{game.message}</div>
          </div>

          <aside className="action-panel">
            <h3>Founder console</h3><div className="ops-tabs">{(["trade","team","supply","market","council","lab"] as const).map(tab => <button key={tab} className={opsTab === tab ? "active" : ""} onClick={() => setOpsTab(tab)}>{tab}</button>)}</div>
            {opsTab === "trade" && <>
              <div className="strategy-box"><h4>Market strategy</h4>
                <div className="price-control"><button onClick={() => adjustPrice(-.1)} aria-label="Lower price">−</button><span><small>PRICE INDEX</small><b>{Math.round(game.price * 100)}%</b></span><button onClick={() => adjustPrice(.1)} aria-label="Raise price">+</button></div>
                <label>Operating model<select value={game.offer} onChange={e => setGame(g => ({ ...g, offer: Number(e.target.value), message: `${OFFERS[g.business!].names[Number(e.target.value)]} is now your operating model.` }))}>{OFFERS[game.business!].names.map((name: string,i: number) => <option key={name} value={i}>{name}</option>)}</select></label>
                <small>{OFFERS[game.business!].notes[game.offer]}</small>
              </div>
              <button className="action serve" onClick={serve} disabled={!game.customer || game.capacity <= 0}><b>Serve customer</b><span>Earn revenue · build reputation</span></button>
              <button className="action" onClick={restock} disabled={game.capacity === game.maxCapacity}><b>Restock</b><span>Via {SUPPLIERS[game.supplier].name}</span></button>
              <button className="action" onClick={promote}><b>Local marketing</b><span>{money(75 + game.marketing * 25)} · reputation +7</span></button>
              <div className="upgrade-box"><h4>Upgrades</h4><button onClick={() => upgrade("speed")}><span>⚡ Service</span><b>Lv {game.speed}</b></button><button onClick={() => upgrade("decor")}><span>✦ Storefront</span><b>Lv {game.decor}</b></button><button onClick={() => upgrade("capacity")}><span>▦ Capacity</span><b>{game.maxCapacity}</b></button></div>
            </>}
            {opsTab === "team" && <div className="ops-list"><h4>Your team · {money(game.staff.reduce((s,m)=>s+m.salary,0))}/day</h4>
              {game.staff.map(member => <article key={member.id}><strong>{member.name}</strong><span>{member.role}</span><small>Skill {member.skill}/5 · Morale {member.morale}%</small><button onClick={() => trainStaff(member.id)} disabled={member.skill >= 5}>Train {money(110)}</button></article>)}
              {game.staff.length < 3 && <button className="action hire" onClick={hireStaff} disabled={game.cash < 150}><b>Hire next specialist</b><span>{money(150)} hiring · daily salary applies</span></button>}
            </div>}
            {opsTab === "supply" && <div className="ops-list"><h4>Supplier network</h4>{(Object.keys(SUPPLIERS) as SupplierKey[]).map(key => <button key={key} className={`supplier-card ${game.supplier === key ? "active" : ""}`} onClick={() => setGame(g => ({...g,supplier:key,message:`${SUPPLIERS[key].name} selected as supplier.`}))}><b>{SUPPLIERS[key].name}</b><span>{SUPPLIERS[key].note}</span><small>Reliability {SUPPLIERS[key].reliability}% · Quality {SUPPLIERS[key].quality > 0 ? "+" : ""}{SUPPLIERS[key].quality}</small></button>)}</div>}
            {opsTab === "market" && <div className="ops-list"><h4>Competitive market</h4><div className="market-share"><i style={{width:`${playerMarketShare()}%`}}/><b>You {playerMarketShare()}%</b></div>
              {game.competitors.map(c => <article key={c.name}><strong>{c.name}</strong><span>{c.share}% share</span><small>Price {Math.round(c.price*100)}% · Reputation {c.reputation}</small></article>)}<p className="intel">Competitors adjust price and reputation after every day. Your market share responds to both.</p></div>}
            {opsTab === "council" && <div className="ops-list adviser-list"><h4>Agentic advisory council</h4><p className="intel">Advisers optimize different goals. Following one may reduce trust with the others.</p>{(["finance","marketing","people","operations"] as AdviserKey[]).map(key => { const a=adviserAdvice(key); return <article key={key}><div className="adviser-head"><i>{a.icon}</i><span><strong>{a.name} · {a.role}</strong><small>Confidence {a.confidence}% · Trust {game.adviserTrust[key]}%</small></span></div><p>{a.text}</p><button onClick={() => followAdvice(key)}>{a.action}</button></article>; })}</div>}
            {opsTab === "lab" && <div className="ops-list validation-lab"><h4>Validation lab</h4><button className="action interview" onClick={interviewCustomer}><b>Interview a customer</b><span>{money(25)} · reveals demand · PMF +2</span></button><div className="insight-count"><b>{game.interviews}</b><span>interviews</span><b>{game.insights}</b><span>insights</span></div>
              <h4>Run an experiment</h4>{game.experiment ? <div className="experiment-live"><b>{game.experiment.type} experiment</b><span>{game.experiment.progress}/{game.experiment.target} customers</span><i><u style={{width:`${game.experiment.progress/game.experiment.target*100}%`}}/></i></div> : <div className="experiment-buttons"><button onClick={()=>startExperiment("price")}>Test price</button><button onClick={()=>startExperiment("segment")}>Test segment</button><button onClick={()=>startExperiment("offer")}>Test offer</button></div>}
              <h4>Unit economics</h4><div className="metric-grid"><span><small>Conversion</small><b>{Math.round(conversion*100)}%</b></span><span><small>Retention</small><b>{Math.round(retention*100)}%</b></span><span><small>CAC</small><b>{money(cac)}</b></span><span><small>LTV</small><b>{money(ltv)}</b></span><span><small>Gross margin</small><b>{Math.round(grossMargin*100)}%</b></span><span><small>LTV/CAC</small><b>{cac ? (ltv/cac).toFixed(1) : "—"}×</b></span></div><p className="intel">Completed experiments: {game.experimentHistory.length}</p></div>}
          </aside>
        </section>
      )}

      {game.phase === "dayEnd" && (
        <section className="modal-screen"><div className="report-card">
          <p className="eyebrow">Daily close</p><h2>Day {game.day} in the books</h2><p>{game.message}</p>
          <div className="pnl"><h3>Daily profit &amp; loss</h3><span><i>Revenue</i><b>{money(game.dailyRevenue)}</b></span><span><i>Cost of delivery &amp; supply</i><b>−{money(game.dailyCogs)}</b></span><span><i>Payroll</i><b>−{money(game.dailyPayroll)}</b></span><span><i>Rent &amp; other operating costs</i><b>−{money(Math.max(0, game.dailyExpenses-game.dailyCogs-game.dailyPayroll))}</b></span><span className="net"><i>Net operating result</i><b>{money(game.dailyRevenue-game.dailyExpenses)}</b></span></div>
          <div className="report-numbers"><span><small>Cash balance</small><b>{money(game.cash)}</b></span><span><small>Your market share</small><b>{playerMarketShare()}%</b></span><span><small>Team morale</small><b>{game.staff.length ? Math.round(game.staff.reduce((s,m)=>s+m.morale,0)/game.staff.length) : "Solo"}</b></span></div>
          <div className="rep-meter"><span>Neighbourhood reputation</span><b>{game.reputation}/100</b><i><u style={{ width: `${game.reputation}%` }}/></i></div>
          <button className="primary" onClick={continueCampaign}>Continue campaign <span>→</span></button>
        </div></section>
      )}

      {game.phase === "decision" && game.decision && (() => { const story = Object.values(NARRATIVES).find(s => s.id === game.decision)!; return (
        <section className="modal-screen story-screen"><div className="report-card story-card"><p className="eyebrow">Founder decision · Day {game.day + 1}</p><div className="story-icon">◈</div><h2>{story.title}</h2><p>{story.text}</p><div className="choice-grid"><button onClick={() => resolveDecision("a")}><small>OPTION A</small><b>{story.a}</b></button><button onClick={() => resolveDecision("b")}><small>OPTION B</small><b>{story.b}</b></button></div><p className="consequence-note">Your choice becomes part of the company’s story and cannot be undone.</p></div></section>
      ); })()}

      {game.phase === "result" && (
        <section className="modal-screen"><div className="report-card final-card">
          <div className="trophy">{game.cash >= winCash && game.reputation >= 75 && game.served >= winCustomers ? "🏆" : "✦"}</div>
          <p className="eyebrow">{game.scenarioName} · Final report</p><h2>{rating}</h2>
          <p>{game.cash >= winCash && game.reputation >= 75 && game.served >= winCustomers ? "You built a neighbourhood institution ready for its next market." : "The campaign changed the operator—and the next run starts with hard-earned judgment."}</p>
          <div className="score">{score.toLocaleString()}<small>Founder score</small></div>
          <div className="report-numbers"><span><small>Ending cash</small><b>{money(game.cash)}</b></span><span><small>Reputation</small><b>{game.reputation}</b></span><span><small>Served</small><b>{game.served}</b></span><span><small>Quests</small><b>{game.quests.filter(Boolean).length}/3</b></span></div>
          <div className="achievement-grid">{Object.entries(ACHIEVEMENTS).map(([id,a]) => <div key={id} className={game.achievements.includes(id) ? "unlocked" : "locked"}><i>{a.icon}</i><b>{a.name}</b><small>{a.note}</small></div>)}</div>
          <div className="final-validation"><span><small>Product–market fit</small><b>{game.pmf}/100</b></span><span><small>Retention</small><b>{Math.round(retention*100)}%</b></span><span><small>Gross margin</small><b>{Math.round(grossMargin*100)}%</b></span><span><small>LTV/CAC</small><b>{cac ? (ltv/cac).toFixed(1) : "—"}×</b></span></div>
          <button className="score-share" onClick={shareScore}>Share scorecard</button>{shareStatus&&<p className="share-status">{shareStatus}</p>}
          <button className="primary" onClick={reset}>Build another empire <span>↻</span></button>
        </div></section>
      )}

      {showHelp && <div className="help-backdrop" role="dialog" aria-modal="true" aria-label="How to play"><div className="help-card">
        <button className="close" onClick={() => setShowHelp(false)}>×</button><p className="eyebrow">Founder field guide</p><h2>Build wisely. Move quickly.</h2>
        <ol><li><b>Interview before assuming</b><span>Customer conversations reveal budgets and strengthen product–market fit.</span></li><li><b>Run experiments</b><span>Test price, segment or offer across five customers before changing strategy.</span></li><li><b>Build retention</b><span>Repeat customers and referrals matter more than acquisition alone.</span></li><li><b>Know the economics</b><span>Track CAC, LTV, conversion, gross margin and LTV/CAC in the Validation Lab.</span></li></ol>
        <button className="primary" onClick={() => setShowHelp(false)}>Let’s build</button>
      </div></div>}
    </main>
  );
}

function Stat({ icon, label, value, danger }: { icon: string; label: string; value: string; danger?: boolean }) {
  return <div className={`stat ${danger ? "danger" : ""}`}><i>{icon}</i><span><small>{label}</small><b>{value}</b></span></div>;
}
function Quest({ done, label, progress }: { done: boolean; label: string; progress: string }) {
  return <div className={`quest ${done ? "done" : ""}`}><i>{done ? "✓" : "○"}</i><span>{label}<small>{progress}</small></span></div>;
}
function Neighbourhood({ active, people }: { active: BusinessKey; people: number }) {
  return <div className={`neighbourhood active-${active}`} aria-label="Toronto-inspired neighbourhood">
    <div className="cn-tower"><i/></div><div className="skyline"><i/><i/><i/><i/><i/><i/></div>
    <div className="trees"><i/><i/><i/><i/><i/></div>
    <div className="building cafe"><div className="roof-garden">✿ ✿ ✿</div><div className="windows"><i/><i/><i/><i/></div><b>LOTUS CAFÉ</b><span className="awning"/></div>
    <div className="building studio"><div className="windows"><i/><i/><i/><i/></div><b>CAREER STUDIO</b><span className="awning"/></div>
    <div className="building agency"><div className="windows"><i/><i/><i/><i/><i/><i/></div><b>AI WORKS</b><span>⌘</span></div>
    <div className="street"><span className="bike">◯━◯</span><span className="streetcar">504 · KING</span></div>
    <div className="people">{Array.from({ length: people }).map((_, i) => <i key={i} style={{ left: `${8 + (i * 83) % 84}%`, animationDelay: `${i * -.45}s` }}/>)}</div>
  </div>;
}
