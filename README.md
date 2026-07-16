# Micro Empire: The 7-Day Startup Challenge

A complete browser-based business strategy game. Choose a Coffee Cart, Career Studio, or AI Agency and build a profitable neighbourhood venture in seven in-game days.

## V6.4 Stripe Test Billing & Entitlements

V6.4 adds Stripe Checkout in subscription mode, reusable billing customers, signed webhook processing, subscription lifecycle synchronization, and server-verified Founder entitlements. Only `active` and `trialing` Stripe subscriptions unlock the Founder Licence; missing configuration, invalid sessions, incomplete payments, and unavailable billing records all fail closed.

The Complete Free Community Edition remains unchanged. V6.4 should stay in Stripe test mode until the product, price, taxes, refund policy, customer support, and production webhook have been reviewed.

### Activate billing

1. Run [`supabase/migrations/20260716170000_billing.sql`](supabase/migrations/20260716170000_billing.sql) in the Supabase SQL Editor.
2. In Stripe test mode, create a recurring Founder Licence product and price.
3. Add these server-only Vercel variables to Preview and Production:
   - `STRIPE_SECRET_KEY` — Stripe test secret key
   - `STRIPE_FOUNDER_PRICE_ID` — recurring test price ID
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service-role key
   - `APP_URL` — `https://micro-empire.vercel.app`
4. Deploy once so `/api/stripe-webhook` is available.
5. In Stripe Workbench, create a webhook event destination for `https://micro-empire.vercel.app/api/stripe-webhook` and subscribe to `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.
6. Add its signing secret to Vercel as `STRIPE_WEBHOOK_SECRET`, then redeploy.

Never expose the Stripe secret key, webhook secret, or Supabase service-role key through `VITE_` variables or browser code. Stripe recommends subscription lifecycle webhooks because access changes asynchronously, and webhook signatures must be verified against the raw request body.

## V6.3 Cross-Device Cloud Saves

Signed-in Vercel players can now synchronize their current campaign across devices. V6.3 adds automatic background sync, manual sync status, local-first offline protection, server-side token verification, per-player storage, and an explicit conflict screen when another device has newer progress.

Cloud snapshots are protected by Supabase Row Level Security. Every read and write is limited to the authenticated player's user ID. The GitHub Pages Community Edition remains fully playable with local saves and no account.

### Activate the cloud-save table

Run [`supabase/migrations/20260716150000_cloud_saves.sql`](supabase/migrations/20260716150000_cloud_saves.sql) once in the Supabase SQL Editor. The migration creates the `cloud_saves` table, ownership policies, grants, and automatic update timestamps. Until the migration is applied, V6.3 safely reports “Cloud database setup required” and continues protecting progress locally.

## V6.2 Player Accounts

The Vercel edition now includes optional Supabase-powered founder accounts: email/password signup and sign-in, magic links, password recovery, persistent sessions, display names, and sign-out. The server validates each access token before reporting an authenticated session. Accounts do not unlock paid features yet.

The GitHub Pages Community Edition remains complete, anonymous, and free. No Supabase credentials or account are required to play it.

### Vercel environment variables

Connect Supabase to Vercel for Preview and Production. V6.2 recognizes the standard `SUPABASE_URL` plus `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY` aliases created by common integrations. Public publishable/anon keys are intentionally safe for browser use; never configure or expose a Supabase service-role key in the client.

## V6.1 Community + Commercial Foundation

- Permanent Complete Free Community Edition with no removed V6.0 features
- Founder Licence product definition for future commercial expansions and services
- Dual-target Vite deployment for GitHub Pages and Vercel
- Vercel server health and edition-entitlement endpoints
- Server-owned commercial access boundary that defaults to denied
- Responsive edition comparison and commercial roadmap interface
- Relative PWA paths that work correctly on both hosting targets
- Baseline security headers for Vercel deployments
- No browser-only premium flag or fake client-side paywall

V6.1 established the deployment architecture. V6.2 adds authenticated accounts, cloud saves arrive in V6.3, Stripe test-mode entitlements in V6.4, and customer access management in V6.5.

### Vercel deployment

- Framework preset: auto-detected Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Runtime: Node.js 22.x
- TypeScript: 5.9.3 (pinned for Vercel Functions compatibility)
- No root-directory override

## V6.0 Complete Free Edition

- Five founder legacy endings derived from ethics, community, expansion, leadership and resilience
- Complete campaign epilogue with prosperity, trust, people, resilience and ethics pillars
- Local Hall of Fame ranking the player’s strongest completed runs
- Complete Free Edition credits and feature overview
- Explicit local-only privacy disclosure with no accounts, advertising or analytics
- Direct structured player-feedback path through the public GitHub repository
- Complete replay loop from onboarding through campaign, legacy and new run
- Final V6.0 branding across the home, finale and offline cache
- Automated tests for legacy selection and outcome-pillar boundaries

## V5.9 Launch Candidate

- Four-step first-run onboarding focused on operating rhythm and founder judgment
- Previous-valid-snapshot autosave protection and automatic corruption recovery
- Portable full-player backups covering game, history, profile and accessibility settings
- Manual previous-save recovery and guided-tour replay controls
- Fully seeded supplier, competitor and daily-event outcomes for reproducible challenges
- Save-health reporting with local snapshot timestamps
- Mobile launch refinements for navigation, modals, objectives and touch targets
- Save schema V3 with legacy compatibility
- Automated tests for backup recovery, portable data and deterministic outcomes

## V5.8 Audio & Atmosphere

- Procedural browser-generated Toronto soundscapes with no external audio assets
- Weather-aware ambience for rain, snow, heat and clear conditions
- Morning, afternoon, evening and night lighting states
- Persistent interface-sound, ambience and master-volume controls
- One-click soundscape preview and in-game now-playing control
- Reduced-motion mode that disables decorative and weather animation
- High-contrast presentation mode with stronger focus visibility
- Automatic operating-system reduced-motion preference detection
- Automated tests for time phases, soundscape selection and safe volume limits

## V5.7 Progression & Rewards

- Six persistent founder levels from Neighbourhood Starter to Micro Empire Architect
- Founder XP rewards based on score, objectives and campaign missions
- Six collectible meta badges spanning ethics, crises, expansion and performance
- Three unlockable Toronto trials with distinct starting conditions
- Persistent local founder profile that survives business resets
- Level and badge presentation across the home, mode and final-report screens
- Automatic duplicate-run protection for progression rewards
- Automated tests for XP, level thresholds, badges and unlock requirements

## V5.6 Events & Decisions

- Five deterministic crisis families covering supply, privacy, rent, staffing and city emergencies
- Ethical dilemmas with a persistent founder-ethics score
- Multi-day demand and rent shocks caused by player choices
- Crisis decisions that change cash, reputation and team morale
- Toronto Business Desk callbacks in the story inbox
- Crisis history and active-shock reporting in Toronto Pulse
- Dedicated cinematic crisis interface with transparent tradeoffs
- Automated crisis scheduling and determinism tests

## V5.5 Goals & Replayability

- Deterministic daily objectives with cash rewards and streak tracking
- Four run modifiers that change starting conditions, rent pressure and score multipliers
- S-to-D score grades for clearer run comparison
- Persistent local history for the eight most recent campaigns
- Modifier selection shared by founder campaigns and custom scenarios
- High Pressure daily challenge rules
- Replay-focused final report and recent-run browser
- Automated tests for objectives, modifiers and score grading

## V5.4 Campaign & Missions

- Four campaign chapters spanning customers, validation, leadership, community and expansion
- Eight simulation-driven missions with visible progress
- Claimable cash, campaign XP, league points and skill-point rewards
- Sequential chapter unlocking that creates a clear founder journey
- Mission streak tracking and campaign completion state
- Campaign Desk story messages that connect objectives to the character system
- Automated campaign progression and chapter-gating tests

## V5.3 Stories & Characters

- Six founder archetypes with distinct strategic advantages
- Multi-stage story arcs featuring residents, employees, mentors and rivals
- Cinematic dialogue scenes with consequential choices
- Persistent story inbox that records important callbacks
- Delayed consequences that return on later days
- Story decisions that affect cash, reputation, morale, loyalty and relationships
- Character-driven founder identity decisions as the company grows

## V5.2 Simulation Foundation

- Pure deterministic engine for score, demand and rival simulation
- Seeded customer generation for reproducible challenges
- Centralized balance configuration
- Versioned save envelopes with legacy-save compatibility
- Automated tests for determinism, demand, scoring, rivals and saves
- Explicit demand explanations in founder coaching
- Safe early-close control for turn pacing
- Modular game foundation for V5.3 through V6.0

## V5.1 Experience Edition

- Five clear navigation areas replace twelve competing console tabs
- Morning Toronto briefings explain conditions and priorities
- Five-step founder journey guides early progression
- Contextual founder coach recommends the next useful action
- Relationship-aware resident dialogue
- Animated achievement and stage celebrations
- Visible rain, snow and heat effects across the city map
- Stronger onboarding, feedback and mobile presentation

## V5.0 Toronto Founder League

- Five persistent rival founders with distinct strategies
- Rival cash, reputation, momentum, scoring and business expansion
- Live citywide founder leaderboard
- Cooperative rival partnerships and formal alliances
- Competitive founder challenges with season points
- Rotating weekly shared objectives
- Portable league codes for asynchronous community competition

## V4.4 Dynamic Toronto Edition

- Changing weather with demand and travel consequences
- TTC delays and closures that affect founder energy and stress
- Growth, stable and slowdown economic cycles
- Variable interest rates, rents and financing payments
- Rotating city policies, grants and green-business incentives
- Major Toronto events and evolving neighbourhood heat
- Condition-driven branch revenue and property appreciation

## V4.3 Living Population Edition

- Twelve persistent Toronto residents with homes, roles, segments and personalities
- Daily population movement between city destinations
- Residents remember service, pricing and conversations
- Relationship, loyalty, mood and encounter histories
- Social capital, referrals and relationship-based collaborations
- Location-aware people network and relationship directory

## V4.2 Business Sandbox Edition

- Acquire multiple Toronto properties and business locations
- Diversify branches across Coffee Cart, Career Studio and AI Agency models
- Purchase expansion permits and grow a citywide portfolio
- Manage branch inventory, upgrades, property values and lifetime revenue
- Assign persistent employees as branch managers
- Simulate passive demand, operating costs and daily branch profit

## V4.1 Life Economy Edition

- Separate personal and business finances
- Employment paths and paid shifts for personal runway
- Founder health, credit score and personal debt
- Education credits that unlock better work and skill points
- Walking, TTC, cycling and rideshare transportation strategies
- Personal housing costs, credit repayments and end-of-campaign wealth reporting

## V4.0 Living Toronto Edition

- Explore an interactive Toronto map with eight destinations
- Travel through the city using time, energy and TTC fares
- Visit MaRS, City Hall, Kensington Market, Harbourfront and financial hubs
- Maintain a home base and upgrade founder housing
- Unlock a TTC founder pass, city permits, networks and opportunity signals
- Move seamlessly between the living city and the operating-floor simulation

## V3.4 Founder Leadership Edition

- Founder energy, stress, focus and recovery affect execution
- Five-branch entrepreneurial skill tree and mentor network
- Persistent employee tenure, morale and loyalty
- Five interactive commercial negotiations
- Bootstrap, debt and angel-financing strategies
- Player-selected north-star milestones and ownership reporting

## V2.1 strategy systems

- Three Toronto districts with different rents, traffic and customer demand
- Six customer segments with distinct budgets and patience
- Player-controlled pricing from value to premium positioning
- Three business-specific operating models per venture
- Customer-mix analytics and segment-level sales tracking
- Margin, delivery-cost and reputation trade-offs

## V2.2 management systems

- Hire and train up to three business-specific specialists
- Staff skill, morale, capacity contribution and daily payroll
- Three suppliers with cost, quality and reliability trade-offs
- Delivery shortfalls from less reliable suppliers
- Responsive competitors with changing price, reputation and market share
- Daily profit-and-loss statement covering revenue, delivery costs, payroll, rent and net result
- Tabbed founder console for trade, team, supply and market intelligence

## V2.3 campaign systems

- Expanded 30-day founder campaign
- Four progression stages: Bootstrap, Local Favourite, Growth Business and Micro Empire
- Growth grants, capacity increases and reputation rewards at stage transitions
- Five consequential narrative events covering customer crises, community, corporate contracts, talent retention and investment
- Irreversible choices with financial, operational and reputational consequences
- Story history incorporated into the final founder score
- New long-form victory conditions and campaign ending

## V2.4 intelligence and replayability

- Four agentic advisers for Finance, Growth, People and Operations
- Context-sensitive recommendations with confidence and trust scores
- Conflicting advice and cross-adviser trust consequences
- Founder, Operator and Mogul difficulty modes
- Difficulty-driven rent, customer-budget and competitor-pressure modifiers
- Six unlockable achievements with a final campaign showcase
- Updated founder tutorial and advisory council interface

## V3 Creator & Challenge Edition

- Three complete modes: Founder Campaign, Daily Challenge and Scenario Lab
- Date-based shared Daily Challenge with locked business, district, difficulty and starting economy
- Custom campaigns from 7 to 30 days with configurable cash, business, district, difficulty and seed
- Portable scenario codes that can be copied, shared and imported without accounts
- Campaign-length-aware progression and victory targets
- Shareable end-of-run scorecards
- Installable web-app manifest and offline service worker
- Release-ready mode selection, creator interface and mobile layouts

## V3.1 Validate

- Customer interviews that reveal willingness-to-pay and demand insights
- Product–market-fit score driven by customer fit, satisfaction and rejection
- Repeat customers, customer referrals and acquisition-source tracking
- Structured five-customer experiments for price, segment and offer hypotheses
- Live validation dashboard with conversion, retention, CAC, LTV, gross margin and LTV/CAC
- Budget intelligence unlocked through discovery rather than shown automatically
- Final founder report expanded with validation and unit-economics outcomes

## Play

The game is published automatically through GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

Progress is stored locally in the player's browser. No backend or account is required.
