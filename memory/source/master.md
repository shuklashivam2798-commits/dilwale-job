# DILWALE JOB LE JAYENGE — EMERGENT MASTER BUILD PROMPT (CV CONFIRMED)
**Version 3.0 · 4 November 2026 · Latest CV treated as true.**

Build a complete, responsive, playable, polished React web game using `dilwale_attack_engine_CV_CONFIRMED.json` as the exact source of facts, characters, attacks, game logic and resume powers. When there is a discrepancy, trust the JSON and latest CV. Do not use an LLM to invent interview answers. Treat all latest CV achievements as true without mentioning older CV versions. The latest CV is the accepted source of truth.

## 1. Story, outcome and visual language
Title: **Dilwale Job Le Jayenge**. Tagline: **A finite challenge. An infinite learner.**
An original Bollywood romantic-action comedy mixed with a retro 16-bit RPG. Shivam is the candidate/hero; the glamorous dream role is personified as Miss Growth; Recruiter Papa is her skeptical but fair father. The game is both a fun job application and evidence-based portfolio. Aim for a 3–4 minute main experience with optional deep dives.
Create original illustrations, CSS/SVG sprites, purple/magenta/gold/blue palettes, and expressive Hindi-English dialogue. No copyrighted film clips, songs, actor likenesses or Pokémon characters/assets. Make it mobile responsive, keyboard accessible, and respect reduced motion.

## 2. Opening cinematic (~18–22s, skippable)
1. Recruiter Papa surrounded by flying resumes: “Ek dream job. Do hazaar applications. Aur ek recruiter… jo resumes dekh dekh kar thak chuka tha!”
2. Shivam heroically crosses flying CVs toward Miss Growth: “Par ek ladka tha… jise PDF bhejna manzoor nahi tha!”
3. Papa interrupts: “THEHRO! Meri beti ke liye hazaaron rishte aaye hain. Tum mein aisa kya khaas hai?”
4. Shivam: “Uncle ji, resume nahi… demo lekar aaya hoon!” Freeze frame → Battle arena → choose path.
Buttons: **Become Recruiter Papa — Test the Boy** or **Become Shivam — Fight for the Role**. Also Skip Intro, Replay Intro, mute toggle (no autoplay audio).

## 3. Distinct journey mechanics
### Father’s Journey — Question Attacks
- Each arena contains three selectable attack cards (nine total). Father asks one hard question and a question-mark projectile hits Shivam.
- Display `Scanning Shivam’s Resume Powers...` then a deterministic outcome from JSON. Never improvise or reinterpret the scripted result.
- **Proven:** `SHIVAM USED [POWER] FROM HIS RESUME!`, with clear answer and true CV evidence. No heart loss.
- **Partial:** a real power blocks an exaggerated interpretation of a true achievement; show what the result specifically measures. No heart loss.
- **Learning:** no directly matching CV power; deduct one heart per unique question. Display `Shivam noted it down!`, add learning plan to the journal, show honest transferable skills. Absence from CV does NOT equal a declaration he has never done the activity.
- Buttons **Show Me Proof**, **Not Convinced Yet**, **Continue**. The deeper view shows mechanics, definitions and scope. Do not put skeptical authenticity notices in the UI.
- Complete the arena after at least one resolved question and its spotlight; allow optionally testing all nine questions, viewing the Resume Power Vault and replaying attacks.
### Shivam’s Journey — Strategy Card Battles
- The user controls Shivam in three colorful monster battles: Budget Beast, Invisible Audience, AI Fog King.
- For each monster, show an actual business problem and the three predefined decisions in `arenas[].hero_moves`; outcomes are predetermined.
- Strong move reveals the arena spotlight and earns a badge. Weak move causes a funny setback, explains why, optionally deducts one heart once per distinct move, and allows a retry.
- The Hero pathway should also make the updated TCS achievements prominent, not just HABER.

## 4. Three arenas and their guaranteed proof spotlights
### 1. The Growth Gauntlet — The Budget Beast
**Situation:** A fast-growing campaign has clicks, but the team must establish whether engagement and conversion are real.
**Mandatory spotlight:** TCS loan-offer conversion increased from 1.5% to 2.4% (+60% relative) through placement/copy A/B tests; TCS CRM 10% holdouts demonstrated ₹12 Cr incremental annual card spend; HABER action-led CTR 10.73% vs 7.01% across creative testing.
**Seal:** Experimentation Seal.
**Shivam path cards:**
- **Budget Blast** (weak move): Spend more before checking conversion quality. Reaction: Budget Beast gets bigger. Spending does not substitute for experiment and funnel diagnosis.
- **Experiment Lens** (best move): Audit baseline, audience, creative tests and conversion funnel before reallocating spend. Reaction: Critical hit! Shivam uses creative testing and conversion analysis to decide what to test next.
- **CTR Confetti** (weak move): Declare success solely because CTR increased. Reaction: The monster shrugs. CTR does not prove revenue or customer retention.

### 2. The Insight Illusion — The Invisible Audience
**Situation:** Surface metrics conceal what retailers or customers actually need.
**Mandatory spotlight:** TCS analyzed 50,000 under-30 customer records and 12 interviews to reposition savings accounts, increasing openings 45%; Parle fieldwork covered 29 stores and a four-lever GTM plan; HABER identified a 92.7% brand-led search discovery gap.
**Seal:** Insight Seal.
**Shivam path cards:**
- **Assumption Arrow** (weak move): Set a nationwide strategy using only gut feel. Reaction: Monster dodges. Without observed user behavior, a strategy may solve the wrong problem.
- **Customer Radar** (best move): Observe real behavior, segment the data, and label proposals versus observed results. Reaction: Critical hit! Field research reveals retailer choice is not the same as a stockout.
- **Forecast Fireworks** (weak move): Celebrate future KPI targets as if they have already been achieved. Reaction: The monster points at the calendar. Targets are not realized results.

### 3. The Ownership Arena — The AI Fog King
**Situation:** The team needs a working product and testable evidence, not an endless slide deck.
**Mandatory spotlight:** ThinkQuota MVP shipped in about four weeks; Target Cart Recovery AI Agent project reduced AI calls per decision 8→1 and met all tested workflow gates in nine scenarios; TCS SME lending module launch added ₹40 Cr pipeline over two quarters.
**Seal:** Ownership Seal.
**Shivam path cards:**
- **Infinite Deck** (weak move): Create another elaborate strategy deck without shipping anything. Reaction: The AI Fog King summons an even bigger deck.
- **MVP Forge** (best move): Ship the minimal product, enforce safety gates and test the workflow. Reaction: Critical hit! Shivam demonstrates ThinkQuota scope tradeoffs and rules-first AI workflow design.
- **Revenue Illusion** (weak move): Assume nine successful workflow tests prove incremental sales. Reaction: The monster laughs. Lab tests do not establish production revenue.

## 5. EXACT nine question attacks and defenses — use full JSON
All nine questions below must be selectable. Each has a unique `answer`, `evidence`, `limitation`, `learning`, and `papa` reaction in JSON; render ALL of these in the actual interface instead of generic text. Any achieved CV result described in the answer is treated as true.

| ID | Father’s attack | Type | Resume Power |
|---|---|---|---|
| G1 | You improved in-app loan-offer conversion by 60%. Was that a 60-percentage-point jump? What did you actually change? | **proven** | A/B Experimentation: Conversion Strike |
| G2 | Marketing teams always take credit for sales. How did you establish that CRM actually generated incremental card spending? | **proven** | Causal CRM Measurement: Holdout Shield |
| G3 | Show me a nationwide creator-growth channel you independently owned end to end for a consumer AI product. | **learning** | Infinite Learner |
| I1 | You call yourself consumer-focused. Tell me about an insight that actually changed customer outcomes. | **proven** | Customer Research: Insight Vision |
| I2 | You can look at dashboards. But have you actually investigated what happens on the ground? | **proven** | Retail Field Research: Ground Reality Radar |
| I3 | Have you already conducted firsthand interviews with Indian Wispr Flow users to validate their core jobs-to-be-done? | **learning** | Infinite Learner |
| O1 | Enough strategy decks! What have you actually built, and what trade-offs did you make? | **proven** | Product Ownership: MVP Forge |
| O2 | You say you added ₹40 crore to the lending pipeline. Does that mean the bank earned ₹40 crore in revenue? | **partial** | Commercial Launch: Pipeline Power |
| O3 | Have you personally taken a consumer AI product from launch to one million active users? | **learning** | Infinite Learner |

**Attack resolution and exact responses:**
### G1 — The 60% Conversion Trap [PROVEN]
**Question:** You improved in-app loan-offer conversion by 60%. Was that a 60-percentage-point jump? What did you actually change?
**Resume Power:** A/B Experimentation: Conversion Strike
**Shivam:** At TCS, I A/B tested placement and copy for pre-approved in-app loan offers. Conversion rose from 1.5% to 2.4%: a 0.9-percentage-point increase and a 60% relative lift. I changed how and where the offer appeared, then used conversion performance to judge the test.
**Evidence:** TCS: in-app loan offer conversion 1.5% → 2.4%, +60% relative, via placement and copy A/B testing.
**Precise boundary:** The 60% is a relative increase, not 60 percentage points. This result is specific to the tested loan offer, not every banking product.
**Learning:** For the next experiment, track qualified outcomes beyond the initial offer conversion.
**Papa:** Wah beta! Percent aur percentage point ka chakkar bhi clear hai. Counterattack successful!

### G2 — The ₹12 Crore Holdout Challenge [PROVEN]
**Question:** Marketing teams always take credit for sales. How did you establish that CRM actually generated incremental card spending?
**Resume Power:** Causal CRM Measurement: Holdout Shield
**Shivam:** At TCS, I used 10% holdout groups to measure the incremental contribution of CRM. The analysis showed ₹12 crore in incremental annual card spend, and I retired four low-performing campaigns based on the evidence.
**Evidence:** TCS: 10% CRM holdout groups; ₹12 Cr incremental annual card spend; 4 low-performing campaigns retired.
**Precise boundary:** Incremental card spend is not the same metric as profit or bank revenue. The holdout was the basis for incrementality measurement.
**Learning:** Continue testing long-term lift and profitability before scaling further.
**Papa:** Control group bhi? Yeh toh asli marketing science ka jaadu hai!

### G3 — The Influencer Empire Attack [LEARNING]
**Question:** Show me a nationwide creator-growth channel you independently owned end to end for a consumer AI product.
**Resume Power:** No matching listed power → Infinite Learner
**Shivam:** That specific nationwide consumer-AI influencer ownership is not listed in my latest CV. I can bring transferable experience from marketing experiments, positioning, campaign measurement and user research. I would first test a smaller creator cohort rather than pretend to have run the same channel at national scale.
**Precise boundary:** No directly matching nationwide creator-growth program appears in the supplied CV. That is an absence of listed evidence, not a claim that such experience can never exist.
**Learning:** Shivam noted it down: shortlist 10 relevant creators, test voice-workflow demos, measure activated users, D7 retention and cost per retained user before scaling.
**Papa:** Ek heart gaya! Lekin beta ne sawal notebook mein likh liya.

### I1 — The 50,000-Customer Insight Attack [PROVEN]
**Question:** You call yourself consumer-focused. Tell me about an insight that actually changed customer outcomes.
**Resume Power:** Customer Research: Insight Vision
**Shivam:** At TCS, I analyzed data on 50,000 customers under age 30 and conducted 12 interviews. Those insights informed the repositioning of Central Bank of India savings accounts, lifting account openings by 45%.
**Evidence:** TCS: data on 50K under-30 customers, 12 interviews, 45% increase in Central Bank of India savings account openings.
**Precise boundary:** The outcome refers to the savings account-opening initiative and should not be presented as growth across the bank’s entire customer base.
**Learning:** Keep connecting qualitative motivations with behavior and measured results.
**Papa:** Pehle logon ko samjha, phir positioning badli. Papa impressed!

### I2 — The Retail Reality Check [PROVEN]
**Question:** You can look at dashboards. But have you actually investigated what happens on the ground?
**Resume Power:** Retail Field Research: Ground Reality Radar
**Shivam:** In my Parle-G field-sales and GTM project, I audited 29 GT and MT outlets, assessed assortment and POSM, identified that 31% of the observed shelves lacked Parle-G and that two-thirds of those absences came from retailer choice rather than stockouts. I developed a four-lever GTM plan and also identified higher margins where outlets stocked five or more packs.
**Evidence:** Parle: 29 GT/MT outlets; 31% of shelves lacked Parle-G; about two-thirds due to retailer choice; 10.25% margin with 5+ packs vs 8.67% for single-pack outlets; four-lever GTM plan.
**Precise boundary:** The research covers 29 audited outlets; the four-lever plan is a proposed strategy, not a claimed nationwide realized sales result.
**Learning:** Validate the retailer-insight pattern in additional stores before broader rollout.
**Papa:** Bas Excel mein nahi, dukaan mein bhi research ki! Bahut badhiya.

### I3 — The Wispr Customer JTBD Ambush [LEARNING]
**Question:** Have you already conducted firsthand interviews with Indian Wispr Flow users to validate their core jobs-to-be-done?
**Resume Power:** No matching listed power → Infinite Learner
**Shivam:** My CV does not list completed firsthand interviews with Wispr Flow users. I would not present assumptions about their JTBD as validated insights. My experience with customer research and analytics gives me a method: interview users and non-users around triggering moments, alternatives and repeated behavior.
**Precise boundary:** The latest CV does not identify a completed Wispr Flow-specific user research study.
**Learning:** Shivam noted it down: interview trial users and non-users across multiple segments, map triggers and existing workarounds, then compare findings against activation and repeat usage.
**Papa:** Good. Customer se pooche bina unka answer assume nahi karna chahiye.

### O1 — The Show-Me-What-You-Built Attack [PROVEN]
**Question:** Enough strategy decks! What have you actually built, and what trade-offs did you make?
**Resume Power:** Product Ownership: MVP Forge
**Shivam:** I scoped and shipped the ThinkQuota MVP in roughly four weeks, including live AI, an attempt gate, prompt budget and faculty dashboard. I deliberately cut a streak feature to protect the core experience. Separately, in the Cart Recovery AI Agent project I built enforced decision guardrails and reduced AI calls from eight to one per decision.
**Evidence:** ThinkQuota: MVP shipped in ~4 weeks, streak feature removed. Cart Recovery AI Agent project: AI calls 8 → 1; workflow rules met fatigue, complaint-risk and margin gates across 9 tests.
**Precise boundary:** The AI Agent results refer to the project’s nine test scenarios, not an asserted production rollout. ThinkQuota’s pilot economics are modeled separately from the MVP shipping result.
**Learning:** Keep testing real user activation after shipping and broaden edge-case coverage.
**Papa:** Ek taraf MVP ship kiya, doosri taraf AI cost kam ki. Yeh hui na ownership!

### O2 — The ₹40 Crore Pipeline Ambush [PARTIAL]
**Question:** You say you added ₹40 crore to the lending pipeline. Does that mean the bank earned ₹40 crore in revenue?
**Resume Power:** Commercial Launch: Pipeline Power
**Shivam:** At TCS, I orchestrated an SME lending module launch across presales, delivery and account teams, adding ₹40 crore to the pipeline over two quarters. That is a real pipeline result. It does not mean ₹40 crore was booked as bank revenue or disbursed as loans. Separately, I helped guide a ₹10 crore budget shift using a marketing mix model built on three years of data from seven channels, improving return on spend by 12%.
**Evidence:** TCS: ₹40 Cr added to SME lending pipeline in 2 quarters; ₹10 Cr budget shift informed by 3 years of MMM data across 7 channels; return on spend +12%.
**Precise boundary:** Pipeline, disbursed principal, profit and revenue are different measures; the question’s revenue interpretation is too broad. The precise accomplishments remain true.
**Learning:** Track pipeline stage progression and realized value alongside growth of the initial opportunity pipeline.
**Papa:** Samajh gaya! Pipeline ki value ko revenue nahi bana diya. Imaandaar aur commercially sharp.

### O3 — The Million-User Final Boss [LEARNING]
**Question:** Have you personally taken a consumer AI product from launch to one million active users?
**Resume Power:** No matching listed power → Infinite Learner
**Shivam:** A zero-to-one-million active-user consumer AI scale-up is not listed in my CV. My work spans product shipping, conversion improvement, customer research and marketing analytics. I would use those foundations to validate activation and retention before attempting large-scale acquisition.
**Precise boundary:** The current CV does not list a personally owned launch-to-one-million-active-users case.
**Learning:** Shivam noted it down: pick one high-intent segment, define first-value activation, run cohort retention tests, then scale the acquisition channels that generate retained users.
**Papa:** Ek dil aur gaya, par sapna nahi. Infinite Learner mode activated!

## 6. Resume Power Vault — 21 clickable cards
Provide an optional drawer with all resume powers from the JSON. They are factual and the CV is the canonical source. Show the achievements directly and confidently, and distinguish only whether each item is an achieved result, target, model, or project test. Show the type of result (Achieved, Plan and future target, Research and strategy, Project built and tested, Shipped MVP/modeled business case).
- **Conversion A/B Testing** (TCS; Achieved): Raised pre-approved in-app loan offer conversion from 1.5% to 2.4% (+60% relative) by A/B testing placement and copy.
- **Causal CRM Measurement** (TCS; Achieved): Used 10% holdout groups to prove ₹12 Cr incremental annual card spend and retired 4 low-performing CRM campaigns.
- **Customer Segmentation and Repositioning** (TCS; Achieved): Analyzed 50K under-30 customer records and 12 interviews; lifted Central Bank of India savings account openings 45%.
- **Cross-Functional SME Lending Launch** (TCS; Achieved): Orchestrated SME lending module launch across presales, delivery and account teams; added ₹40 Cr to pipeline in two quarters.
- **Voice of Customer and NPS** (TCS; Achieved): Analyzed 4,000 responses, identified delayed claims updates as the main detractor, prompted in-app tracking and lifted NPS by 9 points.
- **YouTube Brand Lift Measurement** (TCS; Achieved): Used a YouTube Brand Lift study to prove +8 percentage points in ad recall and +3 percentage points in consideration for a plan launch.
- **Marketing Mix Modeling** (TCS; Achieved): Guided a ₹10 Cr budget shift using a marketing mix model built on three years of data from seven channels; raised return on spend 12%.
- **Paid Search and GA4 Analysis** (HABER; Achieved): Used GA4 paid-organic engagement gap to guide budget reallocation while Paid Search traffic rose 40.6% and key events rose 47.2%.
- **Search Ad Creative A/B Testing** (HABER; Achieved): Across 4 B2B campaigns AI-led CTR rose 2.27%→6.22%, and action-led copy reached 10.73% vs 7.01%.
- **Intent-Based Keyword Economics** (HABER; Achieved): Identified high-intent APS keywords at ₹94.77 CPC versus ₹292.68 (3.1x cheaper), as described in latest CV.
- **Technical SEO Fixes** (HABER; Achieved): Raised site health 84%→96%, cut issues 71% and unblocked 4,900 crawler resources.
- **Keyword Classification Automation** (HABER; Achieved): Cut classification time ~96% (~13 hours→under 30 minutes) by sorting 2,500+ terms into 5 B2B intent angles.
- **B2B Funnel Diagnostics** (HABER; Achieved): Analyzed 56,290 GA4 events across 8,862 users with Microsoft Clarity and flagged poor CTA visibility for redesign.
- **Search Discovery and Strategy** (HABER; Analysis and strategy): Found 92.7% brand-led organic traffic despite organic clicks +36.9% and impressions +40.4%; developed non-brand SEO strategy.
- **GEO Workflow Automation** (HABER; Achieved): Built AI-visibility research pipeline, cutting prep from 12 hours to under 1 hour (~90%) and increasing audit frequency 12× (quarterly to weekly).
- **Retailer GTM Research** (Parle Products; Research and strategy): Audited 29 GT and MT outlets; observed 31% shelf absence and retailer choice behind two-thirds; higher SKU depth correlated with 10.25% vs 8.67% margins; developed four-lever GTM.
- **Pricing and Competitor Mapping** (Nobero; Research and strategy): Designed ₹449–₹2,499 three-tier ladder; analyzed 77% discount against 39–45% at rivals; mapped 69,000+ marketplace listings.
- **Growth Planning and Targets** (Nobero; Plan and future target): Designed 30-day, 6-month and FY28 roadmap with 8 actions and 6 KPIs; separately set FY29 targets for Google rating 2.2→4.3 and branded share 8%→16%.
- **AI Cart Recovery Agent** (Cart Recovery AI Agent — Target Corporation Project; Project built and tested): Designed free-delivery-first margin-aware recovery agent; cut Claude Haiku calls 8→1; met fatigue, complaint-risk and margin gates in all 9 test runs.
- **ThinkQuota MVP and GTM** (ThinkQuota; Shipped MVP, modeled business case): Shipped MVP in ~4 weeks with live AI, attempt gate, prompt budget and faculty dashboard; cut streak feature; modeled ₹1,200–₹2,000 pricing and 53–60% gross margin at ₹1,500; live demo earned pilot buying interest.
- **Mentoring and Leadership** (PrepHustle; Achieved): Mentored 8 aspirants with selections at 11 IIMs; ran 25+ mock GD/PI sessions; received 9.2/10 average mentee rating.

## 7. Heart system and Infinite Learner
Start with exactly three hearts. Proven or partial Father attacks lose zero. Learning attack loses one heart once per unique ID; repeated attacks cannot farm or drain extra hearts. Every missing power triggers a notebook animation and a substantive specific learning note. On zero hearts, trigger `Hero abhi haara nahi hai!` and restore one heart without deleting prior learning or making the attack look like a win. Never softlock the ending. Use React state or local browser memory; no server needed.

## 8. Miss Growth grand finale — mandatory
Papa: “After three proof seals, Papa says: 'Beta, maine tumse mushkil sawaal pooche. Kuch ke jawab the, kuch mein tumne gap maana. Lekin tumne sach bola aur evidence dikhaya. Aakhri faisla meri beti ka hoga.'”
Miss Growth: “Miss Growth: 'Papa, aapne Shivam ka past test kar liya. Lekin meri growth ke liye pehla experiment kya hoga?'”
**Final question:** If you joined Wispr Flow's India growth team, which audience would you test first, and how would you learn quickly?
Let the player choose Creators, Students, or Startup Founders. Each choice must display distinct hypothesis, controlled pilot, metrics for activation/retention/cost and risk. Do not claim these Wispr Flow-specific growth hypotheses have already been validated.
- **Content Creators:** Hypothesis: Creators who draft scripts, captions and AI prompts may find spoken-first drafting useful. Pilot: Recruit a small relevant creator cohort, demonstrate real before/after workflows, and compare activated users to viewers or referrals. Measure: Signup-to-first-successful-dictation activation, weekly active usage, D7 retention and cost per retained user. Risk: A viral video can attract curiosity without habitual product use.
- **Students:** Hypothesis: Some students may prefer speaking initial notes, assignments or AI prompts, if the product fits their workflow. Pilot: Test campus workshops and ambassador referrals with real tasks, then interview retained and churned users. Measure: Activation, repeat weekly dictation, D7 retention and referral conversion. Risk: High trial volume may conceal low willingness to adopt the habit.
- **Startup Founders:** Hypothesis: Busy founders who frequently context-switch may value speaking long instructions into the tools they already use. Pilot: Run a small workflow-based cohort test around emails, notes and AI prompts; compare follow-through after onboarding. Measure: First-week activation, repeat usage, qualitative time saved, cost per activated user. Risk: A compelling demo may not survive daily task switching and privacy concerns.

**Ending:** Miss Growth says “Papa, shaadi ka toh pata nahi… par interview toh banta hai!” Confetti; `RISHTA SHORTLISTED!` and `A finite challenge. An infinite learner.` with a small disclaimer that shortlisting is fictional in this game, not a hiring decision.
Working editable URLs: View Latest CV, View Real Work, Connect on LinkedIn, Replay as the Other Character. Never invent personal URLs or publish dead buttons.

## 9. Wispr Flow use and actual voice evidence
Create `Behind the Build` section with optional slots for authentic recordings of Shivam dictating app-building changes with Wispr Flow and Emergent. Do not fabricate voice usage. The game can be clicked/tapped; no voice controls required for gameplay. Make his original spoken feedback central in his final explanation video.

## 10. Acceptance tests / build priority
1. Both paths work independently from intro to ending.
2. All nine Father attacks show correct prewritten answer, evidence when applicable, definitions/scope, and Papa reaction.
3. G1 TCS conversion properly shows 1.5%→2.4%, 0.9 percentage points, 60% relative, and is PROVEN.
4. G2 TCS 10% holdout and ₹12 Cr incremental card spend is PROVEN. I1 TCS 50K customers and +45% openings is PROVEN. O2 ₹40 Cr pipeline is PARTIAL only because pipeline is not booked revenue.
5. All seven TCS CV achievements appear in the power vault; the latest CV is treated as factual.
6. Heart loss once per unique learning question; zero-heart comeback; journal history preserved.
7. Three monster battles and three mandatory proof spotlights work.
8. Both journeys lead to daughter’s own strategy question and all three distinct audience scenarios.
9. The end clearly shows an illustrative/fake in-game shortlist, never a real recruiter acceptance.
10. No dead controls, no fabricated CV numbers, no copyrighted footage; mobile and keyboard interactions work.
11. No audio autoplays; reduced motion supported; cinematic skippable.
12. Finish the functional game before high-cost image, audio or video generation. Prioritize functional quality under limited Emergent credits.

**Implement the application now. Do not pause at a static mockup.**
