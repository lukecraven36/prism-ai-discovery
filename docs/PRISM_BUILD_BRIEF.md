# Prism build brief

# Prism by Simpson Associates — Full Build Brief

Version: 1.0  
Prepared: 30 September 2026  
Product owner: Luke  
Target repository: `prism-ai-discovery`

## 1. Instructions to Codex

Treat this document as the self-contained product specification. You do not need access to the original ChatGPT conversation. Read the entire brief before making changes.

Inspect the current repository and any applicable `AGENTS.md` instructions. Compare the existing implementation with this specification, preserve useful work, and complete the gaps. Do not restart merely because an implementation has already begun. Save this specification in the repository under `docs/PRISM_BUILD_BRIEF.md`.

Build a working application, not just designs or a plan. Implement and verify the complete facilitator workflow, persistence, scoring, classifications, business cases, roadmap and exports. Document how to run it and what storage limitations apply. Record any unmet requirement explicitly; do not describe a partially implemented feature as complete.

The requirements below capture the agreed product direction. Exact question wording, scoring rubrics, numerical thresholds, data structures and acceptance fixtures are proposed implementation defaults supplied to make that direction concrete. They are not proprietary vendor formulas or scientifically validated coefficients. Implement them consistently and make them reviewable. Do not silently invent alternative scoring logic.

## 2. Product purpose

Businesses often start by selecting an AI tool before establishing the problem. Prism helps Simpson Associates facilitate a structured conversation that starts with business problems, assesses suitable approaches and produces a defensible investment roadmap.

Product name: **Prism by Simpson Associates**.  
Tagline: **From business problems to prioritised opportunities.**

The prism metaphor represents one problem revealing several possible solutions. SURGE is a possible future delivery programme; it is not the app name and needs no separate feature in this version.

The product must let Luke and other facilitators:

1. Create and manage customers and their discovery sessions.
2. Capture organisational context once, then assess individual use cases.
3. Guide technical and non-technical participants through understandable questions.
4. Record evidence, assumptions, uncertainty and ownership alongside answers.
5. Explain value, readiness, risk, time to benefit and costs separately.
6. Recommend an appropriate next action, including non-AI solutions.
7. Build a roadmap around dependencies, shared foundations and delivery capacity.
8. Produce customer-ready reports and revisit actual outcomes.

**No AI interviewer, AI judge, model-generated answers or LLM integration in this version.** The facilitator leads the discussion. Questions and recommendations come from explicit content and deterministic rules. No OpenAI API key is needed.

## 3. Users and first-version boundary

Primary user: a Simpson Associates facilitator conducting customer workshops. Participants can include executives, business owners, operations staff, data specialists and technical teams. Customer-facing screens and reports must work for people without technical vocabulary.

Deliver the complete local workshop workflow first. A static client application is acceptable if it implements reliable local persistence, backup/import and all required calculations. An existing dependency-free implementation can remain dependency-free; a different maintainable stack is also acceptable where justified by the repository.

Local storage does not constitute shared customer management. If no backend is configured, clearly say that records are saved on this browser/device and provide a portable backup. Do not show fake sign-in or imply that another device sees the same records. Structure storage behind an adapter so authenticated, shared storage can be added later.

Out of scope for this version: multi-user collaboration, CRM integration, calendar integrations, automatic research, vendor marketplace, AI conversation, automatic project delivery and billing. These exclusions must not remove the customer register, multiple sessions, multiple use cases, editable roadmaps or outcome tracking.

## 4. Visual identity and usability

Brand reference: https://www.simpson-associates.co.uk/

Inspect the current official website when implementing the design. Use verified logo assets, colours and typography where available and suitable. Do not claim arbitrary colours are official brand tokens. If assets cannot be obtained, use an attractive temporary treatment and document what needs replacing. Avoid fabricating a corporate logo.

Use a crisp, professional interface with generous spacing, clear typography, large answer targets and a restrained spectrum/prism motif. Use colour accents to distinguish value, readiness and risk, with text labels and icons so meaning never depends on colour. Keep the product credible in a customer meeting rather than resembling a generic administration form.

Required usability:

- Desktop/laptop layout for facilitation, responsive tablet and mobile support.
- One principal question per screen in guided mode; optional section overview for experienced facilitators.
- Plain-English question, short explanation and concrete example.
- Expandable technical guidance, hidden initially.
- Back, next, section navigation, save and exit, and return to outstanding questions.
- Separate `Unknown`, `Not answered` and deliberate `Not applicable` states where relevant.
- Large choices, keyboard access, visible focus, semantic labels and readable contrast.
- Clear save status and useful error messages; do not report a save succeeded if it failed.
- “Skip for now” preserves unanswered state and creates an outstanding item.
- Revisiting answers must not erase later sections, notes or financial assumptions.
- Display workshop progress as questions addressed and unknowns outstanding. Unknown counts as addressed but unresolved.
- Respect reduced-motion preferences; do not require animation to understand a result.

Use neutral language: “What needs to be in place?” rather than “Why aren't you ready?”

## 5. Information architecture

Main areas:

| Area | Required capabilities |
|---|---|
| Customers | Search, create, edit, archive, open customer workspace |
| Customer workspace | Context, sessions, use cases, actions, priorities, roadmap and outcomes |
| Workshop | Guided customer context and use-case assessment |
| Use-case register | Filter by owner, category, status, confidence and completeness |
| Priorities | Value/readiness matrix, comparable table and reasons for classification |
| Roadmap | Foundation work, validation, pilots and delivery waves; dependency and capacity checks |
| Reports | Decision briefs, customer portfolio summary, roadmap and backup/export |
| Methodology | Rubrics, weights, thresholds, risk rules and methodology version |

First-run screen offers **Create customer** and **Explore demo**. Demo records are clearly labelled and removable without affecting real records. No fabricated customer data should be present in exported real reports.

Suggested workshop sequence:

Customer setup → customer context → problem → approach → value → readiness → delivery and risk → review → priorities → roadmap.

The user can capture multiple problems before fully assessing any one of them. Do not force completion of all scores to save a use case.

## 6. Customer setup and context questions

Capture customer name, industry, organisational size or approximate scale, facilitator, workshop title/date, participants and roles. Contact email is optional. Default currency is GBP, with a configurable currency code. Use the workshop's local calendar date consistently.

Ask these context questions once per customer, reviewable per session:

| ID | Plain-English question | Answer format and guidance |
|---|---|---|
| C01 | What are the most important outcomes for your organisation over the next year? | Up to five objectives, optional measure and owner; e.g. reduce order delays |
| C02 | Where does work get delayed, repeated, corrected or abandoned? | Process/pain list; avoid naming a solution first |
| C03 | How do you currently manage and use information? | Context choices: mostly informal; repeatable practices; defined ownership; measured quality; continuously improved; unknown |
| C04 | Which systems and sources of information do you use? | Names, purpose, owner, access/integration notes; plain text is sufficient |
| C05 | Who can help deliver and support changes? | Business, data, technology, security and change roles; internal/partner capacity; unknown allowed |
| C06 | Who makes decisions and approves investment or data use? | Sponsor, decision owner, approval route; unknown creates an action |
| C07 | How much change can teams realistically absorb? | Current initiatives, available time, training/adoption constraints |
| C08 | What budget and delivery capacity might be available? | Optional budget range, person-days per wave, capacity by role; distinguish unknown from zero |
| C09 | What rules or restrictions must we respect? | Policy, privacy, security, procurement and contractual constraints; do not infer legal compliance |
| C10 | What would make this discovery session successful? | Desired decisions and deliverables |

Customer maturity is context, not a blanket penalty applied to all use cases. A customer with weak overall data maturity may still have a viable, bounded document use case. Copy relevant context into suggestions only; never silently assume that specific data access is available.

## 7. Use-case question bank

Every answer can carry a note. Every scored answer also supports evidence/assumption text, source/reference, supplied by, validated by, confidence, captured date and review date. Optional fields must not block a workshop, but missing evidence must remain visible.

### 7.1 Problem and baseline

| ID | Question | Format / example |
|---|---|---|
| P01 | What would you call this opportunity? | Short editable title; avoid requiring an AI product name |
| P02 | What happens today, and where does it go wrong? | Current process and specific problem; example: staff re-enter invoice details and correct mistakes |
| P03 | Who experiences the problem? | Personas/teams, approximate user count, process owner |
| P04 | How often does this work happen? | Task volume, period, working days/year where needed; unknown allowed |
| P05 | How much time, money or delay does it cause today? | Baseline values with units, evidence and assumptions |
| P06 | What outcome would improve, and by how much? | Baseline → target, measurement, success owner and review date |
| P07 | Which customer objective does this support? | Link to C01 objectives; allow none/unknown |
| P08 | Who owns this problem and the decision to act? | Business owner, sponsor and decision owner; may be the same person |
| P09 | What have you already tried? | Current workaround, previous attempts, known constraints |

Allow saving a draft with only customer, title and problem. Clearly mark absent information.

### 7.2 Approach selection

Ask **“What kind of improvement is needed?”** with multiple capability choices: simplify a process; move information between systems; report/visualise; predict/classify; understand or draft content; assist a human decision; perform a sequence of actions.

Offer these approaches: process improvement, standard automation, analytics, predictive AI, generative AI, agents, combination, undecided.

Show deterministic guidance:

- Clear repeatable rules and structured inputs: consider standard automation.
- An avoidable handover or unnecessary step: consider process improvement.
- Understanding performance: consider analytics.
- Predicting/classifying from suitable examples: consider predictive AI.
- Working with variable language/documents: consider generative AI, with evaluation and review.
- Taking multiple actions across systems: consider agents only with defined permissions, controls and accountability.

These are suggestions, not an automatic technical verdict. Require an editable chosen approach, rationale and at least one alternative considered. If undecided, create a validation action. Do not force every use case into AI or block non-AI opportunities from the roadmap.

### 7.3 Value questions

| ID | Question | Guidance |
|---|---|---|
| V01 | How significant would the improvement be? | Measurable benefit, baseline, target and materiality relative to this customer |
| V02 | How directly does it support an agreed business priority? | Link objective and explain the contribution |
| V03 | How widely and frequently would it help? | Reach and recurring volume; do not equate staff count alone with value |
| V04 | Could the work or capability help other opportunities? | Name reuse opportunities; avoid speculative reuse claims |

Attach the rubrics in section 8 to large, descriptive answer buttons. Show numeric scores in methodology/details, not as unexplained labels.

### 7.4 Readiness questions

| ID | Question | Required supporting prompts |
|---|---|---|
| R01 | Do we have the information needed, and can we use it? | Availability, permission, quality, owner and representative evaluation examples, each Yes/Partly/No/Unknown plus notes |
| R02 | Can this fit into the systems and process people use? | Systems, access, integration path, environment and known technical constraints |
| R03 | Are the owner and affected people ready to make the change? | Accountable owner, user involvement, adoption plan, available time and training |
| R04 | Can we build, evaluate and run it reliably? | Skills, delivery resources, acceptance measures, support owner and operating capability |

Technical guidance can explain terms such as API, representative test data, monitoring and access permissions. The principal questions must not require knowing those terms.

### 7.5 Delivery and risk questions

| ID | Question | Capture |
|---|---|---|
| D01 | When could we first measure a useful improvement? | Estimated weeks from start, range if uncertain, assumptions; do not treat zero as unknown |
| D02 | What work and cost would be needed? | Person-days, skills, one-off and ongoing costs; central/conservative/optimistic cases |
| D03 | What must happen first? | Links to use cases, foundation tasks or external prerequisites |
| D04 | What could go wrong, and who could be affected? | Risk register entries: description, category, likelihood, impact, mitigation, owner and residual rating |
| D05 | What decisions or permissions are still needed? | Explicit gate answers: Clear/Blocked/Unknown with reason, owner and next step |
| D06 | How will we check quality and keep people in control? | Evaluation criteria, human review where appropriate, exception handling, escalation and stop/rollback plan |
| D07 | What should we do next, and who will do it? | Action, owner, due date or unresolved date, decision needed |

Use risk categories: privacy/data rights, security, incorrect output, operational disruption, financial/customer harm, adoption, supplier dependency and policy/contract constraints. Allow custom categories.

## 8. Deterministic scoring specification

Methodology ID: `prism-v1`. Version all weights, rubrics and thresholds. Store the methodology version with assessments and report snapshots. Changing defaults must not silently rewrite historical decisions; reassessment is explicit.

Scores use integers 1–5. Normalise each answered component:

`normalised = ((answer - 1) / 4) * 100`

Compute weighted scores at full precision; round only for display to one decimal place. Classification uses unrounded scores. Value and readiness remain separate. There is no mandatory combined rank score.

### 8.1 Value weights and rubrics

| Component | Weight | 1 | 2 | 3 | 4 | 5 |
|---|---:|---|---|---|---|---|
| V01 Measurable benefit | 50% | Negligible outcome change | Small local improvement | Meaningful team/process improvement | Material departmental or customer impact | Material organisation-level outcome |
| V02 Strategic alignment | 20% | No objective link | Indirect link | Direct link to an agreed objective | Important contribution to a high-priority objective | Essential contribution to a top-priority objective |
| V03 Reach/frequency | 15% | Isolated or rare | Small reach and occasional | One team/process, recurring | Several teams or high recurring volume | Broad reach and sustained high volume |
| V04 Reuse/enablement | 15% | No identified reuse | One plausible extension | One named additional opportunity | Several named opportunities share assets | A shared capability with clear portfolio-wide applications |

V01's scope is relative to the customer and uses quantitative or qualitative outcome evidence. Evidence strength is recorded separately; a weakly evidenced benefit can remain high potential but needs validation. V03 and V04 help describe reach and enablement; do not count hypothetical reuse savings again in a business case.

### 8.2 Readiness weights and rubrics

| Component | Weight | 1 | 2 | 3 | 4 | 5 |
|---|---:|---|---|---|---|---|
| R01 Required data | 30% | Essential information absent/unusable | Major availability/quality gaps | Available with bounded preparation work | Access/ownership confirmed, quality and evaluation samples adequate | Representative information and quality checks validated for intended use |
| R02 Technical/integration feasibility | 25% | No workable route identified | Major unresolved system barriers | Plausible route, material work remains | Feasible route validated, bounded integration | Relevant integration/environment proven and available |
| R03 Ownership/adoption | 25% | No accountable owner or user engagement | Owner/users tentative, major change gaps | Owner identified, users consulted, adoption plan outlined | Sponsor and users committed, training/time planned | Ownership, adoption resources and operating changes agreed |
| R04 Delivery/operation | 20% | Required capability unavailable | Major skills/support gaps | Delivery route and evaluation outlined, gaps bounded | Resources, evaluation and support responsibilities agreed | Relevant capability proven; delivery/support capacity allocated |

For R01, show all five underlying checks. An essential permission blocker is a gate regardless of its numeric score. If the approach demonstrably needs no customer data, score readiness of the necessary process inputs and configuration; do not manufacture a data penalty. Record why.

### 8.3 Unknowns, bounds and completeness

- Unknown and unanswered are null states, never 0, 3 or a default midpoint.
- Core V01–V04 and R01–R04 always require an answer or Unknown; `Not applicable` cannot remove weights. Adapt the rubric to the approach and explain its relevance.
- For each axis calculate lower bound by assigning missing components 0 normalised points, and upper bound by assigning them 100. These are possible score bounds, not statistical confidence intervals.
- With missing components, show `Incomplete: possible range X–Y; N of 4 answered`. Do not present a known-only average as a comparable full score.
- Each unknown creates or links to a discovery action. Re-answering resolves the action only after confirmation or clearly marks it as no longer needed.
- Place incomplete cases in a separate list/matrix band; never locate them using invented midpoint scores.
- Distinguish assessment completeness from evidence confidence.

### 8.4 Evidence confidence

For each scored answer choose Low (assumption/unverified), Medium (named stakeholder estimate or partial evidence), High (relevant measured or validated evidence). Missing confidence is Unassessed, not Medium.

Overall confidence is High only if all eight scored answers have High confidence; Medium if all are at least Medium and one is Medium; Low if any is Low; Unassessed if any lacks a confidence assessment. Explain that this is a conservative assessment rule. A linked evidence note/source is required to mark an answer High; do not require file uploads.

Do not multiply value by confidence or reduce business potential because evidence is weak. Low or Unassessed confidence changes the next step to validation. Show component confidence so one uncertain claim can be targeted.

## 9. Risk, gates and classifications

Risk is separate from value and readiness. Do not invert or average it into readiness.

Each risk uses likelihood 1 Rare, 2 Unlikely, 3 Possible, 4 Likely, 5 Very likely; impact 1 Minor, 2 Limited, 3 Material, 4 Major, 5 Severe. Capture before-mitigation and residual ratings separately. An unverified mitigation cannot be assumed to reduce residual risk.

`risk severity = likelihood × impact`. Bands: 1–4 Low; 5–9 Moderate; 10–16 High; 17–25 Critical. Portfolio/use-case risk is the maximum current residual severity, not an average. If residual is not assessed, show initial risk as provisional and prevent Pilot now. An explicit “No material risks identified” assessment is distinct from an empty register.

Required gates, each Clear/Blocked/Unknown/Not applicable (with justification): essential data-use permissions; required security/privacy/policy approval; accountable delivery/operating owner; safe evaluation/control route for the intended approach. An unknown gate generates validation work. An explicitly prohibited use is a separate stop condition.

Classification rules, applied in this order:

1. **Park or reject:** explicit prohibited use or customer/facilitator decision to stop. Record whether parked or rejected and why. Do not automatically declare a legal prohibition.
2. **Build foundations:** any Blocked gate or known unsatisfied hard prerequisite. Describe the prerequisite and owner. This label cannot be overridden into readiness without clearing the gate.
3. **Validate first:** any Unknown gate, missing core score, undecided approach, incomplete risk assessment, residual High/Critical risk requiring review, or Low/Unassessed evidence confidence. List the specific validation work.
4. With complete scores, gates resolved, risk Low/Moderate and confidence Medium/High, use high value ≥60 and sufficient readiness ≥60:
   - Both ≥60: **Pilot now**.
   - Value ≥60, readiness <60: **Build foundations**.
   - Value <60, readiness ≥60: **Local improvement**.
   - Both <60: **Park or reject**, default to Park with a review recommendation.

**Strategic investment** is an additional deliberate facilitator classification for high-potential, sustained investment: value ≥60, complete assessment, funded/phased investment rationale, sponsor and named foundational work. It can replace Pilot now or Build foundations after explicit selection, but never hide gates, uncertainty or risk. An incomplete case remains Validate first with an optional strategic-potential tag.

Allow facilitator recommendations to differ from calculated recommendations, with rationale, author/date and an audit entry. Always retain calculated result. Never let a manual recommendation make a blocked project appear ready. Pilot now means ready for a bounded pilot decision, not authorised production deployment.

Show time to first benefit, one-off cost, ongoing cost, evidence confidence and risk beside every priority result. Default sorting within each classification: value descending, readiness descending, known time to benefit ascending, title ascending; unknown times last. Offer alternative sorts. This is display ordering, not an automatic funding decision.

## 10. Business-case calculator

Support Capacity, Cash savings, Growth/margin and Quality benefits separately. Non-financial cases are valid. Keep missing financial inputs Unknown and do not invent ROI.

For productivity:

`net minutes saved per task = current minutes - future minutes including review, correction and exceptions`

`annual capacity hours = annual task volume × net minutes saved / 60 × adoption fraction`

Adoption is 0–100%. Reject invalid negative volume, time or costs. Allow net savings to be negative when future work takes longer and show the consequence. Volume entry supports explicit annual total or weekly/monthly/daily volume with visible annualisation assumptions. Daily volumes require working days/year; do not assume 365.

`illustrative capacity value = annual capacity hours × loaded hourly cost`

Label this as capacity value, not cash savings. Count cash savings only where spending will demonstrably fall, with a realisation explanation. For revenue improvements use additional contribution margin, not gross revenue, in financial benefit calculations.

Capture one-off implementation, integration, training/change and other costs; annual licences/model consumption, support, maintenance, human review and other operating costs. Avoid double counting review time and review cost; explain where each is included.

`annual realised financial benefit = confirmed cash savings + incremental contribution margin + quantified financial quality benefit`

`annual net financial benefit = annual realised financial benefit - annual recurring cost`

`first-year net benefit = first-year realised financial benefit - first-year operating cost - one-off cost`

First-year timing must be explicit; do not assume a full year's steady-state benefit when delivery takes months. Provide entered benefit-active months and proportional recurring-cost months, or clearly state an explicit full-year scenario assumption.

`steady-state indicative payback months = one-off cost / annual net financial benefit × 12`

Calculate payback only when financial inputs are known and annual net benefit >0. Label this as steady-state simple payback, excluding delivery delay and benefit ramp; do not confuse it with total calendar time to payback. Zero one-off cost with positive net benefit yields zero simple payback. Other cases show unavailable/no positive payback.

Provide conservative, central and optimistic scenarios with editable inputs. Never derive an optimistic number without exposing its assumption. Display units, currencies and formulas. Do not aggregate unlike currencies.

Verification example: 12,000 tasks/year, current time 10 minutes, future time 6 minutes including review, adoption 75% → 600 capacity hours/year. At £30/hour → £18,000 illustrative capacity value. With no spending reduction this is £0 cash saving; the calculator must not turn £18,000 into cash ROI.

## 11. Actions and roadmap

Every readiness gap, unknown, risk mitigation and dependency can produce an editable action with title, kind, related use cases, owner, status, due date, effort/cost estimate and evidence of completion. Suggested actions are deterministic and editable. Deduplicate actions by explicit shared links, not merely by matching titles.

Examples: confirm document access rights; measure baseline processing time; validate evaluation samples; agree support ownership; review residual output risk.

Roadmap item types: foundation, validation, pilot, delivery, adoption and review. Link tasks to one or several use cases so a shared data or integration foundation is represented once.

Support directed dependencies between items, including external prerequisites. Detect cycles and show the exact cycle; reject the invalid link rather than freezing the app. A hard prerequisite must finish before its dependent starts. Soft relationships are advisory and clearly labelled.

Default planning waves: **Foundations and validation**, **First pilots**, **Scale and strategic delivery**. Do not attach fixed dates automatically. Let the facilitator set planning horizon, wave dates, budget/capacity and estimates. Show “Unscheduled” or “Provisional” when these inputs are unknown.

Suggest sequencing using topological order plus classifications: prerequisites first, then eligible pilots/local improvements, then delivery/adoption/reviews. A parked/rejected case is not automatically scheduled. Strategic work includes foundation steps. Priority alone must not cause dependent work to leap ahead.

Manual changes to wave/order trigger dependency, effort and budget checks. When supplied, sum item person-days and one-off cost against each wave's capacity/budget; also check named role capacity if entered. Do not count shared items more than once. Warn when capacity is exceeded and identify the cause. Unknown estimates mean “Capacity not fully assessed,” not “Within capacity.” Keep allocation costs separate from annual business-case costs.

Drag-and-drop is optional; keyboard-accessible move controls are required. The roadmap must be useful without dragging. Future production scheduling/optimisation is not required.

## 12. Priorities, reporting and outcome tracking

Provide an accessible value/readiness matrix and equivalent table. Use the 60-point boundaries, explicit legends and click-through details. Show complete cases with confidence and risk markers; incomplete cases appear separately. No chart should be the only way to access information.

Every use case gets a decision brief containing:

- Problem, current process, affected users, baseline and target.
- Selected approach, rationale and alternative considered.
- Value/readiness breakdown, weights, possible ranges and methodology version.
- Benefit scenarios, capacity versus cash distinction, costs and time to first benefit.
- Evidence confidence, assumptions, risk and gate status.
- Calculated classification and any facilitator recommendation with rationale.
- Dependencies, next actions, owners and review date.

Customer report includes customer objectives, workshop details, portfolio table, decision briefs, shared foundations, roadmap, outstanding assumptions and methodology notes. Provide a print-friendly report usable with browser Save as PDF and a Markdown export. JSON backup/import and CSV register export are also required. Native PDF generation is optional if browser printing produces a verified, readable result.

Reports must include unknowns and provisional labels, not silently omit uncertainty. Snapshot the assessment and methodology at export/save-review time so later edits can be distinguished from earlier decisions.

Outcome tracking: for each outcome measure store baseline, predicted target, actual result, unit, measurement period, evidence, owner and review date. Allow status Draft, Assessed, Approved for pilot, In progress, Completed, Parked and Rejected. Classification and lifecycle status are different fields. Show predicted versus actual side by side; revising a forecast must not overwrite historical measurements.

## 13. Data model and persistence

Use stable IDs and explicit schemas. Suggested entities:

| Entity | Key fields |
|---|---|
| Customer | ID, name, context, objectives, stakeholders, systems, currency, created/updated, archived |
| Session | ID, customer ID, title/date, facilitator, participants, notes, status |
| UseCase | ID, customer/session IDs, problem/baseline/target, approach/rationale, owners, lifecycle status |
| Assessment | ID, use-case ID, version, answer states/values, evidence, confidence, gates, calculation outputs |
| FinancialScenario | Use-case ID, scenario, inputs/units/assumptions, calculations |
| Risk | ID, use-case ID, initial/residual ratings, mitigation, owner, assessment state |
| Action/RoadmapItem | ID, customer ID, linked use cases, type, owner, status, estimate, wave, dependencies |
| Outcome | ID, use-case ID, predicted/actual measure, period, evidence and review |
| DecisionSnapshot | ID, customer/session IDs, assessment copies, methodology version, decision author/date |
| Methodology | Version, weights, rubrics, thresholds and rules |

Store answers as structured states rather than ambiguous strings. Example:

```json
{
  "questionId": "R01",
  "state": "answered",
  "value": 4,
  "evidence": "Representative sample reviewed with data owner",
  "source": "Workshop notes, 30 September 2026",
  "suppliedBy": "Operations lead",
  "validatedBy": "Data owner",
  "confidence": "high",
  "reviewDate": "2026-11-30"
}
```

Unknown uses `state: "unknown", value: null`; unanswered uses `state: "unanswered", value: null`. Core score validation rejects unsupported values.

Autosave after edits; preserve data on reload and reopening. Detect storage errors and provide backup recovery. Version the persisted schema and validate imported JSON. Offer preview and explicit merge/replace choice; replacement requires confirmation. Reject malformed imports without losing existing data. Imported user text must render as text, not executable HTML. Never include secrets in the repository or exports.

Confirm destructive deletion; prefer archive for customers. Ensure unrelated customers remain untouched. For local storage, explain device/browser scope in setup/settings and offer Export backup prominently. Treat demo data as a separate removable dataset.

## 14. Build structure and documentation

Separate question content, pure scoring functions, financial calculations, classification logic, dependency validation, persistence and UI. Avoid duplicating business logic in display components and export code.

Required repository documentation:

- README: product purpose, install/run/build/test instructions, storage model and limitations.
- This brief in `docs/PRISM_BUILD_BRIEF.md`.
- Methodology document explaining current rubrics and examples.
- Short facilitator guide: run a session, resolve unknowns, review recommendations, build roadmap, export/restore.
- Delivery notes: completed requirements and any remaining limitations.

No public deployment or repository deletion is requested by this brief. Keep the old `simpson-prism` repository untouched. Work in `prism-ai-discovery` and follow its branch/review instructions. If repository write access is unavailable, complete the local changes and explain the blocker precisely.

## 15. Acceptance criteria and meaningful verification

Verify the user workflow in a browser at desktop and mobile sizes, including keyboard navigation and a printable customer report. Use meaningful automated tests for scoring, null handling, classifications, financial calculations, dependency cycles and persistence/import validation. Do not substitute screenshots for calculation tests.

Required fixtures:

| Test | Expected result |
|---|---|
| All eight scored answers 5 | Value 100; readiness 100 |
| All eight scored answers 1 | Value 0; readiness 0 |
| All eight scored answers 3 | Value 50; readiness 50 |
| V01=5, V02=3, V03=3, V04=1 | Value 67.5 |
| Previous row with V01 unknown | Value incomplete, possible range 17.5–67.5; 3/4 answered |
| Value/readiness exactly 60, gates clear, risk Low, confidence Medium | Pilot now; compare unrounded values |
| Value 80/readiness 80, essential permission Blocked | Build foundations; blocker visible |
| Value 80/readiness 80, essential permission Unknown | Validate first, linked discovery action |
| Value 80/readiness 80, confidence Low | Validate first; value remains 80 |
| Value 80/readiness 40, gates clear, complete/evidenced | Build foundations |
| Value 40/readiness 80, gates clear, complete/evidenced | Local improvement |
| Value 40/readiness 40, gates clear, complete/evidenced | Park, with rationale/review |
| Residual risk 4×4 | High risk 16; Validate first pending review, not Pilot now |
| No risk rows and no explicit risk review | Incomplete risk assessment; Validate first |
| Productivity example in section 10 | 600 hours; £18,000 capacity value; £0 cash saving |
| Annual net financial benefit zero/negative | No positive payback; no infinity/NaN displayed |
| Dependency A→B→C; proposed C→A | Cycle rejected with useful explanation |
| One foundation linked to three opportunities | Scheduled/costed once, all three links retained |
| Known wave estimate exceeds entered capacity | Over-capacity warning identifies the wave/items |
| Unknown effort in a wave | Capacity not fully assessed |
| Reload after edits | Customers, answers, notes, scenarios and roadmap retained |
| Export/import round trip | Stable IDs, links, null states and methodology retained |
| Malformed import or storage failure | Existing data preserved; actionable error shown |

Also verify two customers with multiple sessions/use cases, skip/back/resume, classification updates after an answer changes, facilitator override history, unknowns in exports, actual outcome recording, print layout and an empty/demo first-run experience.

## 16. Definition of done

The app is ready for first workshop use when Luke can create a customer, guide a participant through the questions, save incomplete cases, see explainable scores and gates, compare several opportunities, build a credible dependency-aware roadmap, export a readable report, close/reopen the app without losing work, and restore a backup.

The completion response should describe the actual functionality, explain local versus shared storage, report verification performed, and identify any material unmet requirement. Provide instructions to launch the app and the repository/branch/commit where changes were saved. Do not claim access to the original chat or brand verification unless it actually occurred.

## 17. Design references and provenance

The earlier research selected Mindfuel as the product-workflow reference and Microsoft's BXT as the public assessment reference, with other sources informing evidence, discovery and dependency planning. These are reference links, not a requirement to reproduce proprietary content, licensed questionnaires or vendor interfaces:

- Mindfuel platform: https://www.mindfuel.ai/platform/platform-overview
- Microsoft BXT business envisioning: https://learn.microsoft.com/en-us/microsoft-cloud/dev/copilot/isv/business-envisioning
- Microsoft AI planning: https://learn.microsoft.com/azure/cloud-adoption-framework/scenarios/ai/plan
- IBM Txture: https://www.ibm.com/products/txture/ai-transformation
- Gartner AI Use Case Insights: https://www.gartner.com/en/products/ai-use-case-insights
- appliedAI methodology: https://www.appliedai.de/en/ai-resources/white-papers/how-to-find-and-prioritize-ai-use-cases/
- Simpson Associates branding: https://www.simpson-associates.co.uk/

This build brief uses an original proposed methodology: separate value/readiness axes, explicit uncertainty, visible gates, credible benefit accounting and dependency-aware planning. Vendor descriptions in earlier research are not independently reverified by this document. No paid platform evaluation is implied. Do not label Prism's proposed weights or thresholds as Microsoft's, Gartner's or Mindfuel's validated formula.

## 18. Immediate instruction when this file is supplied

Read this file fully, inspect what has already been built, and adapt the current implementation to satisfy it. Begin with a concise gap assessment, then complete the work. Use the questions and deterministic methodology here as the implementation baseline. Keep the facilitator in control, preserve business value when confidence is low, show unknowns honestly, and make every roadmap recommendation traceable to evidence, constraints and prerequisites.
