"use client";

import { useEffect, useState } from "react";

type BusinessKey = "coffee" | "career" | "agency";
type DistrictKey = "junction" | "harbour" | "liberty";
type SegmentKey = "Student" | "Professional" | "Family" | "Tourist" | "Small Business" | "Corporate";
type Phase = "home" | "select" | "district" | "play" | "dayEnd" | "result";

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
  segmentSales: Record<SegmentKey, number>;
  customer: null | { name: string; order: string; value: number; budget: number; patience: number; segment: SegmentKey; fit: string };
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

const initialState: GameState = {
  phase: "home", business: null, district: "junction", day: 1, hour: 9, cash: 1000, reputation: 50,
  capacity: 8, maxCapacity: 8, served: 0, missed: 0, revenue: 0, expenses: 0,
  speed: 0, marketing: 0, decor: 0, price: 1, offer: 1,
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
  const [hydrated, setHydrated] = useState(false);

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

  const business = game.business ? BUSINESSES[game.business] : null;
  const clock = `${game.hour > 12 ? game.hour - 12 : game.hour}:00 ${game.hour >= 12 ? "PM" : "AM"}`;
  const score = Math.round(game.cash * .4 + game.reputation * 30 + game.served * 20 + game.quests.filter(Boolean).length * 250);
  const rating = score >= 7000 ? "Empire Builder" : score >= 5000 ? "Micro-SaaS Master" : score >= 3000 ? "Promising Operator" : "Struggling Founder";

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
    setGame({ ...initialState, phase: "play", business: selected, cash: 1000 - b.cost, capacity: max, maxCapacity: max,
      expenses: b.cost, dailyExpenses: b.cost, message: `${b.name} is open. Serve your first customer!`,
      district: game.district, customer: makeCustomer(selected, b.unit, 50, game.district, 1, 1), event: `Opening Day in ${DISTRICTS[game.district].name}: neighbours are curious.` });
    beep(680);
    setShowHelp(true);
  }

  function makeCustomer(key: BusinessKey, base: number, rep: number, district: DistrictKey, price: number, offer: number) {
    const local = DISTRICTS[district].segments;
    const all = Object.keys(SEGMENTS) as SegmentKey[];
    const segment = Math.random() < .78 ? local[Math.floor(Math.random() * local.length)] : all[Math.floor(Math.random() * all.length)];
    const profile = SEGMENTS[segment];
    const offerMultiplier = [.82, 1, 1.28][offer];
    const value = Math.round(base * price * offerMultiplier * (0.92 + Math.random() * .16) * (1 + Math.max(0, rep - 50) / 300));
    const budget = Math.round(profile.budget * (key === "coffee" ? .75 : key === "career" ? 1.15 : 1.8));
    const fit = local.includes(segment) ? "Strong local fit" : "Visiting segment";
    return { name: PEOPLE[Math.floor(Math.random() * PEOPLE.length)], order: ORDERS[key][Math.floor(Math.random() * ORDERS[key].length)], value, budget, patience: profile.patience, segment, fit };
  }

  function advance(mutator: (g: GameState) => GameState) {
    setGame(prev => {
      let next = mutator({ ...prev });
      let customer = next.customer;
      if (customer) {
        customer = { ...customer, patience: customer.patience - 1 };
        if (customer.patience <= 0) {
          next = { ...next, reputation: clamp(next.reputation - 5, 0, 100), missed: next.missed + 1, message: `${customer.name} left unhappy. Reputation -5.` };
          customer = null;
        }
      }
      const newHour = next.hour + 1;
      next = { ...next, hour: newHour, customer };
      if (!next.customer && next.business && newHour < 17) next.customer = makeCustomer(next.business, BUSINESSES[next.business].unit, next.reputation, next.district, next.price, next.offer);
      if (newHour >= 17) return closeDay(next);
      return updateQuests(next);
    });
  }

  function updateQuests(g: GameState) {
    return { ...g, quests: [g.served >= 5, g.reputation >= 70, g.revenue >= 3000] };
  }

  function serve() {
    if (!game.customer || game.capacity <= 0) return;
    advance(g => {
      if (!g.customer) return g;
      if (g.customer.value > g.customer.budget * 1.15) {
        return { ...g, reputation: clamp(g.reputation - 2, 0, 100), missed: g.missed + 1,
          message: `${g.customer.name} declined—${money(g.customer.value)} exceeded their ${g.customer.segment.toLowerCase()} budget.`, customer: null };
      }
      const bonus = 1 + g.decor * .08;
      const earned = Math.round(g.customer.value * bonus);
      const operatingCost = [4, 11, 24][g.offer] * (g.business === "coffee" ? 1 : g.business === "career" ? 2 : 4);
      const rep = [1, 3, 5][g.offer] + g.speed;
      beep(760);
      return { ...g, cash: g.cash + earned - operatingCost, revenue: g.revenue + earned, dailyRevenue: g.dailyRevenue + earned,
        expenses: g.expenses + operatingCost, dailyExpenses: g.dailyExpenses + operatingCost,
        served: g.served + 1, capacity: g.capacity - 1, reputation: clamp(g.reputation + rep, 0, 100),
        segmentSales: { ...g.segmentSales, [g.customer.segment]: (g.segmentSales[g.customer.segment] || 0) + 1 },
        message: `${g.customer.name} loved it! +${money(earned)} · Reputation +${rep}`, customer: null };
    });
  }

  function promote() {
    const cost = 75 + game.marketing * 25;
    if (game.cash < cost) return;
    advance(g => ({ ...g, cash: g.cash - cost, expenses: g.expenses + cost, dailyExpenses: g.dailyExpenses + cost,
      marketing: g.marketing + 1, reputation: clamp(g.reputation + 7, 0, 100), message: `Local campaign launched. Reputation +7.` }));
    beep(600);
  }

  function restock() {
    const missing = game.maxCapacity - game.capacity;
    const cost = Math.max(40, missing * (game.business === "coffee" ? 8 : game.business === "career" ? 16 : 28));
    if (!missing || game.cash < cost) return;
    advance(g => ({ ...g, cash: g.cash - cost, expenses: g.expenses + cost, dailyExpenses: g.dailyExpenses + cost,
      capacity: g.maxCapacity, message: `${BUSINESSES[g.business!].stock} replenished for ${money(cost)}.` }));
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
    const rent = DISTRICTS[g.district].rent + g.day * 10;
    const cash = g.cash - rent;
    const expenses = g.expenses + rent;
    const dailyExpenses = g.dailyExpenses + rent;
    const finished = g.day >= 7 || cash < 0;
    return updateQuests({ ...g, cash, expenses, dailyExpenses, customer: null, phase: finished ? "result" : "dayEnd",
      message: cash < 0 ? "The business ran out of cash." : `Day ${g.day} complete. Rent of ${money(rent)} paid.` });
  }

  function nextDay() {
    const events = [
      { text: "Supplier discount: capacity fully restored", apply: (g: GameState) => ({ ...g, capacity: g.maxCapacity }) },
      { text: "Viral neighbourhood post: reputation +10", apply: (g: GameState) => ({ ...g, reputation: clamp(g.reputation + 10, 0, 100) }) },
      { text: "Rainy morning: reputation -3, but loyal customers remain", apply: (g: GameState) => ({ ...g, reputation: clamp(g.reputation - 3, 0, 100) }) },
      { text: "Community festival: $120 sponsorship cost, reputation +12", apply: (g: GameState) => ({ ...g, cash: g.cash - 120, expenses: g.expenses + 120, reputation: clamp(g.reputation + 12, 0, 100) }) },
      { text: "Corporate enquiry: today’s customers pay 15% more", apply: (g: GameState) => ({ ...g, reputation: clamp(g.reputation + 4, 0, 100) }) },
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    setGame(g => {
      const next = ev.apply({ ...g, day: g.day + 1, hour: 9, phase: "play", event: ev.text, dailyRevenue: 0, dailyExpenses: 0,
        message: `Day ${g.day + 1} begins. ${ev.text}` });
      if (next.business) next.customer = makeCustomer(next.business, BUSINESSES[next.business].unit, next.reputation, next.district, next.price, next.offer);
      return next;
    });
    beep(650);
  }

  function reset() { localStorage.removeItem("micro-empire-save"); setGame(initialState); setSelected("coffee"); beep(400); }

  function adjustPrice(delta: number) {
    setGame(g => ({ ...g, price: clamp(Math.round((g.price + delta) * 10) / 10, .7, 1.5), message: "Pricing updated. Watch how each customer segment responds." }));
    beep(540);
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
          <Stat icon="▣" label="Day" value={`${game.day} / 7`} />
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
            <div className="ribbon">The 7-Day Startup Challenge</div>
            <p className="lede">One storefront. Seven days. Build something the neighbourhood can’t stop talking about.</p>
            <button className="primary huge" onClick={() => setGame(g => ({ ...g, phase: "select" }))}>Start your empire <span>→</span></button>
            {game.business && <button className="text-button" onClick={() => setGame(g => ({ ...g, phase: "play" }))}>Continue saved game · Day {game.day}</button>}
          </div>
          <Neighbourhood active={game.business || "coffee"} people={6}/>
        </section>
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
          <div className="city-map">
            <div className="map-water">LAKE ONTARIO</div><div className="map-grid"/>
            {(Object.keys(DISTRICTS) as DistrictKey[]).map((key, index) => {
              const d = DISTRICTS[key];
              return <button key={key} className={`district-pin pin-${index + 1} ${game.district === key ? "selected" : ""}`} onClick={() => setGame(g => ({ ...g, district: key }))}>
                <i>{d.icon}</i><strong>{d.name}</strong><span>{d.tone}</span>
              </button>;
            })}
          </div>
          <div className="district-detail">
            <div><p className="eyebrow">Selected district</p><h3>{DISTRICTS[game.district].name}</h3><p>{DISTRICTS[game.district].description}</p></div>
            <dl><div><dt>Daily rent</dt><dd>{money(DISTRICTS[game.district].rent)}</dd></div><div><dt>Foot traffic</dt><dd>{DISTRICTS[game.district].traffic}</dd></div><div><dt>Core customers</dt><dd>{DISTRICTS[game.district].segments.join(" · ")}</dd></div></dl>
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
            <div className="location-chip">{DISTRICTS[game.district].icon} {DISTRICTS[game.district].name}<small>{money(DISTRICTS[game.district].rent + game.day * 10)} rent due today</small></div>
            <p className="event-banner">{game.event || "A fresh day in the neighbourhood"}</p>
            <div className="quests"><h3>Founder goals</h3>
              <Quest done={game.quests[0]} label="Serve 5 customers" progress={`${Math.min(game.served, 5)}/5`} />
              <Quest done={game.quests[1]} label="Reach 70 reputation" progress={`${Math.min(game.reputation, 70)}/70`} />
              <Quest done={game.quests[2]} label="Earn $3,000 revenue" progress={`${money(Math.min(game.revenue, 3000))}/$3,000`} />
            </div>
            <div className="ledger"><span>Total revenue <b>{money(game.revenue)}</b></span><span>Total expenses <b>{money(game.expenses)}</b></span><span>Customers served <b>{game.served}</b></span></div>
            <div className="segment-ledger"><h3>Customer mix</h3>{Object.entries(game.segmentSales).filter(([,count]) => count > 0).map(([segment,count]) => <span key={segment}><b>{SEGMENTS[segment as SegmentKey].icon} {segment}</b><i>{count}</i></span>)}{game.served === 0 && <small>No sales yet—learn who responds.</small>}</div>
          </aside>

          <div className="world-panel">
            <Neighbourhood active={game.business!} people={Math.min(10, 3 + game.marketing + Math.floor(game.reputation / 20))}/>
            <div className="store-sign">{business.icon} {business.name}<small>OPEN · {game.capacity}/{game.maxCapacity} {business.stock}</small></div>
            {game.customer ? <div className="customer-card">
              <div className="avatar">{game.customer.name[0]}</div><div><small>{SEGMENTS[game.customer.segment].icon} {game.customer.segment.toUpperCase()} · {game.customer.fit}</small><strong>{game.customer.name}</strong><span>{game.customer.order} · Price {money(game.customer.value)} · Budget {money(game.customer.budget)}</span>
              <div className="patience"><i style={{ width: `${game.customer.patience / 3 * 100}%` }}/></div></div>
            </div> : <div className="customer-card quiet">Waiting for the next customer…</div>}
            <div className="toast" aria-live="polite">{game.message}</div>
          </div>

          <aside className="action-panel">
            <h3>Take action</h3><p>Each action uses one hour.</p>
            <div className="strategy-box"><h4>Market strategy</h4>
              <div className="price-control"><button onClick={() => adjustPrice(-.1)} aria-label="Lower price">−</button><span><small>PRICE INDEX</small><b>{Math.round(game.price * 100)}%</b></span><button onClick={() => adjustPrice(.1)} aria-label="Raise price">+</button></div>
              <label>Operating model<select value={game.offer} onChange={e => setGame(g => ({ ...g, offer: Number(e.target.value), message: `${OFFERS[g.business!].names[Number(e.target.value)]} is now your operating model.` }))}>{OFFERS[game.business!].names.map((name: string,i: number) => <option key={name} value={i}>{name}</option>)}</select></label>
              <small>{OFFERS[game.business!].notes[game.offer]}</small>
            </div>
            <button className="action serve" onClick={serve} disabled={!game.customer || game.capacity <= 0}><b>Serve customer</b><span>Earn revenue · build reputation</span></button>
            <button className="action" onClick={restock} disabled={game.capacity === game.maxCapacity}><b>Restock</b><span>Refill {business.stock}</span></button>
            <button className="action" onClick={promote}><b>Local marketing</b><span>{money(75 + game.marketing * 25)} · reputation +7</span></button>
            <div className="upgrade-box"><h4>Upgrades</h4>
              <button onClick={() => upgrade("speed")}><span>⚡ Service</span><b>Lv {game.speed}</b></button>
              <button onClick={() => upgrade("decor")}><span>✦ Storefront</span><b>Lv {game.decor}</b></button>
              <button onClick={() => upgrade("capacity")}><span>▦ Capacity</span><b>{game.maxCapacity}</b></button>
              <small>Upgrade prices rise with each purchase.</small>
            </div>
          </aside>
        </section>
      )}

      {game.phase === "dayEnd" && (
        <section className="modal-screen"><div className="report-card">
          <p className="eyebrow">Daily close</p><h2>Day {game.day} in the books</h2><p>{game.message}</p>
          <div className="report-numbers"><span><small>Revenue</small><b>{money(game.dailyRevenue)}</b></span><span><small>Expenses</small><b>{money(game.dailyExpenses)}</b></span><span><small>Cash balance</small><b>{money(game.cash)}</b></span></div>
          <div className="rep-meter"><span>Neighbourhood reputation</span><b>{game.reputation}/100</b><i><u style={{ width: `${game.reputation}%` }}/></i></div>
          <button className="primary" onClick={nextDay}>Begin Day {game.day + 1} <span>→</span></button>
        </div></section>
      )}

      {game.phase === "result" && (
        <section className="modal-screen"><div className="report-card final-card">
          <div className="trophy">{game.cash >= 5000 && game.reputation >= 70 && game.served >= 30 ? "🏆" : "✦"}</div>
          <p className="eyebrow">Seven-day report</p><h2>{rating}</h2>
          <p>{game.cash >= 5000 && game.reputation >= 70 && game.served >= 30 ? "You built a neighbourhood institution." : "Every founder learns by building. Your next empire starts smarter."}</p>
          <div className="score">{score.toLocaleString()}<small>Founder score</small></div>
          <div className="report-numbers"><span><small>Ending cash</small><b>{money(game.cash)}</b></span><span><small>Reputation</small><b>{game.reputation}</b></span><span><small>Served</small><b>{game.served}</b></span><span><small>Quests</small><b>{game.quests.filter(Boolean).length}/3</b></span></div>
          <button className="primary" onClick={reset}>Build another empire <span>↻</span></button>
        </div></section>
      )}

      {showHelp && <div className="help-backdrop" role="dialog" aria-modal="true" aria-label="How to play"><div className="help-card">
        <button className="close" onClick={() => setShowHelp(false)}>×</button><p className="eyebrow">Founder field guide</p><h2>Build wisely. Move quickly.</h2>
        <ol><li><b>Read the market</b><span>Every district attracts a different customer mix with distinct budgets.</span></li><li><b>Set price and offer</b><span>Premium models earn more reputation but cost more to deliver.</span></li><li><b>Protect your cash</b><span>Restock, market and upgrade—but district rent is due at closing.</span></li><li><b>Win by Day 7</b><span>Finish above $5,000 cash, 70 reputation and 30 customers.</span></li></ol>
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
