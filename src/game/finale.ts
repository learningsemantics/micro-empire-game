export type LegacyInput = {
  cash: number;
  reputation: number;
  socialCapital: number;
  ethics: number;
  branches: number;
  staff: number;
  health: number;
  crises: number;
};
export type Legacy = {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  epilogue: string;
};

export function legacyPillars(input: LegacyInput) {
  return {
    prosperity: Math.min(100, Math.max(0, Math.round(input.cash / 150))),
    trust: Math.min(
      100,
      Math.max(0, Math.round((input.reputation + input.socialCapital) / 2)),
    ),
    people: Math.min(
      100,
      Math.max(0, input.staff * 22 + Math.round(input.health * 0.35)),
    ),
    resilience: Math.min(
      100,
      Math.max(0, 40 + input.crises * 12 + Math.round(input.health * 0.2)),
    ),
    ethics: Math.min(100, Math.max(0, input.ethics)),
  };
}

export function founderLegacy(input: LegacyInput): Legacy {
  if (input.ethics < 35)
    return {
      id: "ruthless",
      icon: "♜",
      title: "The Relentless Deal-Maker",
      tagline: "You built fast—and left Toronto debating the cost.",
      epilogue:
        "Your company became impossible to ignore. The numbers impressed investors, while former allies kept careful notes about the compromises behind them. Your next chapter begins with power, scrutiny and a chance to rebuild trust.",
    };
  if (input.socialCapital >= 55 && input.reputation >= 75)
    return {
      id: "community",
      icon: "♥",
      title: "The Neighbourhood Institution",
      tagline: "You proved that relationships can be infrastructure.",
      epilogue:
        "Long after opening day, residents still describe the business as theirs. Employees became leaders, customers became advocates and the neighbourhood grew stronger around what you built.",
    };
  if (input.branches >= 3 && input.cash >= 8000)
    return {
      id: "empire",
      icon: "♛",
      title: "The Toronto Empire Builder",
      tagline: "One storefront became a citywide operating system.",
      epilogue:
        "Your playbook travelled across Toronto without losing its discipline. Each location carries the same promise: local understanding backed by systems strong enough to scale.",
    };
  if (input.staff >= 3 && input.health >= 65)
    return {
      id: "leader",
      icon: "♟",
      title: "The People-First Operator",
      tagline:
        "You built a company that no longer depends on heroic exhaustion.",
      epilogue:
        "The strongest thing you created was not a product or location—it was a team capable of making good decisions without waiting for the founder.",
    };
  return {
    id: "resilient",
    icon: "▲",
    title: "The Resilient Founder",
    tagline: "You stayed in the game long enough to become wiser.",
    epilogue:
      "The campaign did not unfold perfectly. That became its value. You leave with sharper judgment, stronger instincts and a clearer understanding of the company only you can build next.",
  };
}
