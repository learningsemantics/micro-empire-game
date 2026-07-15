export type CrisisEffect = {
  cash: number;
  reputation: number;
  morale: number;
  ethics: number;
  demand: number;
  rent: number;
  days: number;
};

export type CrisisChoice = {
  label: string;
  note: string;
  effect: CrisisEffect;
};
export type Crisis = {
  id: string;
  icon: string;
  category: string;
  title: string;
  text: string;
  a: CrisisChoice;
  b: CrisisChoice;
};

export const CRISES: Crisis[] = [
  {
    id: "supply",
    icon: "▣",
    category: "Supply shock",
    title: "The delivery that never arrived",
    text: "A regional disruption has stranded tomorrow's inventory. A spot supplier offers emergency stock at a steep premium.",
    a: {
      label: "Protect service",
      note: "Pay $280 · demand protected",
      effect: {
        cash: -280,
        reputation: 4,
        morale: 2,
        ethics: 0,
        demand: 1,
        rent: 1,
        days: 1,
      },
    },
    b: {
      label: "Absorb the shortage",
      note: "Save cash · demand −20% for 2 days",
      effect: {
        cash: 0,
        reputation: -5,
        morale: -4,
        ethics: 0,
        demand: 0.8,
        rent: 1,
        days: 2,
      },
    },
  },
  {
    id: "privacy",
    icon: "◎",
    category: "Ethical dilemma",
    title: "The customer list",
    text: "A growth partner wants to monetize customer data that people never expected you to share.",
    a: {
      label: "Sell the access",
      note: "+$650 · reputation −10 · ethics −15",
      effect: {
        cash: 650,
        reputation: -10,
        morale: -3,
        ethics: -15,
        demand: 1.08,
        rent: 1,
        days: 2,
      },
    },
    b: {
      label: "Protect customer trust",
      note: "Reputation +9 · ethics +15",
      effect: {
        cash: 0,
        reputation: 9,
        morale: 4,
        ethics: 15,
        demand: 1.03,
        rent: 1,
        days: 3,
      },
    },
  },
  {
    id: "rent",
    icon: "⌂",
    category: "Economic shock",
    title: "Commercial rents jump",
    text: "A speculative deal resets neighbourhood expectations. Your landlord proposes an immediate surcharge.",
    a: {
      label: "Pay and stay",
      note: "Pay $350 · rent normal tomorrow",
      effect: {
        cash: -350,
        reputation: 2,
        morale: 0,
        ethics: 0,
        demand: 1,
        rent: 1,
        days: 1,
      },
    },
    b: {
      label: "Fight with the coalition",
      note: "Rent +15% for 3 days · community +8",
      effect: {
        cash: 0,
        reputation: 8,
        morale: 3,
        ethics: 8,
        demand: 0.96,
        rent: 1.15,
        days: 3,
      },
    },
  },
  {
    id: "layoff",
    icon: "♟",
    category: "Leadership crisis",
    title: "The runway meeting",
    text: "Forecasts weaken. Cutting one role protects cash, while keeping everyone demands a founder sacrifice.",
    a: {
      label: "Protect every job",
      note: "Pay $400 · morale +14 · ethics +10",
      effect: {
        cash: -400,
        reputation: 4,
        morale: 14,
        ethics: 10,
        demand: 1,
        rent: 1,
        days: 1,
      },
    },
    b: {
      label: "Reduce the team",
      note: "Cash protected · morale −18 · ethics −8",
      effect: {
        cash: 0,
        reputation: -3,
        morale: -18,
        ethics: -8,
        demand: 1,
        rent: 1,
        days: 2,
      },
    },
  },
  {
    id: "blackout",
    icon: "⚡",
    category: "City emergency",
    title: "The block loses power",
    text: "A heat-wave outage closes half the street. You can fund a shared generator or protect only your location.",
    a: {
      label: "Power the block",
      note: "Pay $300 · reputation +12 · ethics +12",
      effect: {
        cash: -300,
        reputation: 12,
        morale: 5,
        ethics: 12,
        demand: 1.1,
        rent: 1,
        days: 2,
      },
    },
    b: {
      label: "Protect your storefront",
      note: "Pay $100 · reputation −4",
      effect: {
        cash: -100,
        reputation: -4,
        morale: 0,
        ethics: -6,
        demand: 0.92,
        rent: 1,
        days: 2,
      },
    },
  },
];

export function crisisForDay(seed: number, day: number) {
  return CRISES[Math.abs(seed * 3 + day * 11) % CRISES.length];
}

export function shouldTriggerCrisis(day: number) {
  return day >= 5 && day % 5 === 0;
}
