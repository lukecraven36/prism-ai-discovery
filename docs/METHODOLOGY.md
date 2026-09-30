# Prism methodology

Methodology ID: `prism-v1`.

Prism treats value, readiness and risk as separate decision inputs. It never reduces a promising business outcome simply because its evidence is weak; weak evidence changes the recommended next action to validation.

## Scoring

Each core component uses an integer score from 1 to 5. Scores are normalised with `((answer - 1) / 4) × 100`.

Value weights are V01 measurable benefit 50%, V02 strategic alignment 20%, V03 reach and frequency 15%, and V04 reuse and enablement 15%. Readiness weights are R01 required information 30%, R02 technical and integration feasibility 25%, R03 ownership and adoption 25%, and R04 delivery and operation 20%.

Calculations retain full precision and display one decimal place. If a component is unknown or unanswered, Prism reports a possible lower and upper bound by assigning the missing component 0 and 100 respectively. It does not plot or rank an incomplete case using a midpoint.

## Evidence confidence

Overall confidence is High only when all eight answers are High; Medium when every answer is at least Medium and one is Medium; Low when any answer is Low; and Unassessed when any answer lacks a confidence assessment. A High answer requires a linked source or evidence note in the workshop process.

## Risk and gates

Risk severity is likelihood multiplied by impact: 1–4 Low, 5–9 Moderate, 10–16 High, and 17–25 Critical. The current portfolio risk is the maximum residual severity. An initial rating remains provisional until residual risk is assessed. An explicit “no material risks identified” review is distinct from an empty register.

Four gates are recorded separately: essential data-use permission; security, privacy and policy approval; accountable delivery and operating owner; and a safe evaluation and control route.

## Classification order

1. An explicit stop produces Park or reject.
2. A blocked gate or hard prerequisite produces Build foundations.
3. An unknown gate, missing score, undecided approach, incomplete risk assessment, High or Critical residual risk, or Low/Unassessed confidence produces Validate first.
4. For complete cases with resolved gates, Low/Moderate risk and Medium/High confidence, 60 is the high-value and sufficient-readiness threshold: both high means Pilot now; high value only means Build foundations; readiness only means Local improvement; neither means Park with review.

A facilitator may record a different recommendation with rationale, author and date. The calculated result remains visible, and an override never clears a blocked gate.

## Business case

Capacity hours are annual volume × net minutes saved ÷ 60 × adoption fraction. Capacity value is capacity hours × loaded hourly cost and is never presented as cash saving without an explicit spending reduction. Realised financial benefit includes confirmed cash savings, contribution margin and quantified financial quality benefit. Recurring and one-off costs remain separate. Simple payback is shown only when inputs are known and annual net benefit is positive.
