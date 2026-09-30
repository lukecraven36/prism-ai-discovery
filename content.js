export const CONTEXT_QUESTIONS = [
  ['C01', 'What are the most important outcomes for your organisation over the next year?', 'List up to five objectives, with a measure and owner where known.', 'For example: reduce order delays from five days to two.'],
  ['C02', 'Where does work get delayed, repeated, corrected or abandoned?', 'Describe the process and pain before naming a solution.', 'For example: invoice details are re-entered and corrected.'],
  ['C03', 'How do you currently manage and use information?', 'Describe practices, ownership and measured quality. Unknown is a valid answer.', 'For example: teams use repeatable reports but ownership is informal.'],
  ['C04', 'Which systems and sources of information do you use?', 'Include purpose, owner and any access or integration notes.', 'For example: Dynamics 365, owned by Sales Operations.'],
  ['C05', 'Who can help deliver and support changes?', 'Consider business, data, technology, security and change roles.', 'For example: internal data team plus implementation partner.'],
  ['C06', 'Who makes decisions and approves investment or data use?', 'Record the sponsor, decision owner and approval route.', 'An unknown should become a discovery action.'],
  ['C07', 'How much change can teams realistically absorb?', 'Include current initiatives, available time and training constraints.', 'For example: no process changes during year-end close.'],
  ['C08', 'What budget and delivery capacity might be available?', 'Distinguish unknown from zero and include role constraints.', 'For example: 30 person-days next quarter; budget unknown.'],
  ['C09', 'What rules or restrictions must we respect?', 'Capture policy, privacy, security, procurement and contract constraints.', 'Do not infer legal compliance from this answer.'],
  ['C10', 'What would make this discovery session successful?', 'State the decisions and deliverables participants expect.', 'For example: agree two cases to validate and their owners.']
].map(([id, question, guidance, example]) => ({ id, question, guidance, example }));

export const USE_CASE_SECTIONS = [
  {
    id: 'problem', title: 'Problem and baseline', questions: [
      ['P01', 'What would you call this opportunity?', 'A short title centred on the outcome, not an AI product.', 'text'],
      ['P02', 'What happens today, and where does it go wrong?', 'Describe the current process and the specific problem.', 'textarea'],
      ['P03', 'Who experiences the problem?', 'Record people, teams, approximate user count and process owner.', 'textarea'],
      ['P04', 'How often does this work happen?', 'Include volume, period and working days where relevant.', 'textarea'],
      ['P05', 'How much time, money or delay does it cause today?', 'Keep units, evidence and assumptions explicit.', 'textarea'],
      ['P06', 'What outcome would improve, and by how much?', 'Record baseline, target, measurement, owner and review date.', 'textarea'],
      ['P07', 'Which customer objective does this support?', 'Link an agreed objective, or record none or unknown.', 'textarea'],
      ['P08', 'Who owns this problem and the decision to act?', 'Business owner, sponsor and decision owner may be the same person.', 'textarea'],
      ['P09', 'What have you already tried?', 'Capture workarounds, previous attempts and known constraints.', 'textarea']
    ]
  },
  {
    id: 'approach', title: 'Approach', questions: [
      ['A01', 'What kind of improvement is needed?', 'Choose capabilities such as simplifying a process, moving information, reporting, predicting, drafting, assisting a decision or acting across systems.', 'textarea'],
      ['A02', 'Which approach should we explore?', 'Process improvement, standard automation, analytics, predictive AI, generative AI, agents, combination or undecided.', 'approach'],
      ['A03', 'Why does that approach fit?', 'Record the rationale and the alternative considered.', 'textarea']
    ]
  },
  {
    id: 'value', title: 'Value', questions: [
      ['V01', 'How significant would the improvement be?', 'Judge measurable benefit relative to this customer.', 'score'],
      ['V02', 'How directly does it support an agreed business priority?', 'Link the objective and explain the contribution.', 'score'],
      ['V03', 'How widely and frequently would it help?', 'Consider recurring volume as well as reach.', 'score'],
      ['V04', 'Could the work or capability help other opportunities?', 'Name reuse opportunities; do not count speculative savings twice.', 'score']
    ]
  },
  {
    id: 'readiness', title: 'Readiness', questions: [
      ['R01', 'Do we have the information needed, and can we use it?', 'Check availability, permission, quality, ownership and representative evaluation examples.', 'score'],
      ['R02', 'Can this fit into the systems and process people use?', 'Consider access, integration route, environment and constraints.', 'score'],
      ['R03', 'Are the owner and affected people ready to make the change?', 'Consider ownership, user involvement, time, training and adoption.', 'score'],
      ['R04', 'Can we build, evaluate and run it reliably?', 'Consider skills, resources, acceptance measures and support ownership.', 'score']
    ]
  },
  {
    id: 'delivery', title: 'Delivery and risk', questions: [
      ['D01', 'When could we first measure a useful improvement?', 'Estimate weeks from start, a range and assumptions.', 'textarea'],
      ['D02', 'What work and cost would be needed?', 'Include person-days, skills, one-off and ongoing costs by scenario.', 'textarea'],
      ['D03', 'What must happen first?', 'Link use cases, foundation tasks and external prerequisites.', 'textarea'],
      ['D04', 'What could go wrong, and who could be affected?', 'Add structured risks in the review screen.', 'textarea'],
      ['D05', 'What decisions or permissions are still needed?', 'Resolve the four required gates in review.', 'textarea'],
      ['D06', 'How will we check quality and keep people in control?', 'Include evaluation, review, exceptions, escalation and rollback.', 'textarea'],
      ['D07', 'What should we do next, and who will do it?', 'Record action, owner and due or review date.', 'textarea']
    ]
  }
].map((section) => ({ ...section, questions: section.questions.map(([id, question, guidance, type]) => ({ id, question, guidance, type })) }));

export const ALL_USE_CASE_QUESTIONS = USE_CASE_SECTIONS.flatMap((section) => section.questions);

export const RUBRICS = {
  V01: ['Negligible outcome change', 'Small local improvement', 'Meaningful team or process improvement', 'Material departmental or customer impact', 'Material organisation-level outcome'],
  V02: ['No objective link', 'Indirect link', 'Direct link to an agreed objective', 'Important contribution to a high-priority objective', 'Essential contribution to a top-priority objective'],
  V03: ['Isolated or rare', 'Small reach and occasional', 'One team or process, recurring', 'Several teams or high recurring volume', 'Broad reach and sustained high volume'],
  V04: ['No identified reuse', 'One plausible extension', 'One named additional opportunity', 'Several named opportunities share assets', 'Clear portfolio-wide shared capability'],
  R01: ['Essential information absent or unusable', 'Major availability or quality gaps', 'Available with bounded preparation', 'Access, ownership and samples adequate', 'Representative information and checks validated'],
  R02: ['No workable route identified', 'Major unresolved system barriers', 'Plausible route; material work remains', 'Feasible route validated', 'Integration and environment proven'],
  R03: ['No accountable owner or engagement', 'Tentative owner/users; major change gaps', 'Owner identified and plan outlined', 'Sponsor and users committed', 'Ownership and adoption resources agreed'],
  R04: ['Required capability unavailable', 'Major skills or support gaps', 'Delivery route outlined; gaps bounded', 'Resources, evaluation and support agreed', 'Capability proven and capacity allocated']
};

export const GATE_NAMES = [
  'Essential data-use permissions',
  'Security, privacy and policy approval',
  'Accountable delivery and operating owner',
  'Safe evaluation and control route'
];

export const APPROACHES = ['process improvement', 'standard automation', 'analytics', 'predictive AI', 'generative AI', 'agents', 'combination', 'undecided'];

export const APPROACH_GUIDANCE = [
  ['Clear repeatable rules and structured inputs', 'Consider standard automation.'],
  ['An avoidable handover or unnecessary step', 'Consider process improvement.'],
  ['Understanding performance', 'Consider analytics.'],
  ['Predicting or classifying from suitable examples', 'Consider predictive AI.'],
  ['Working with variable language or documents', 'Consider generative AI, with evaluation and review.'],
  ['Taking actions across systems', 'Consider agents only with defined permissions, controls and accountability.']
];

export const RISK_CATEGORIES = ['Privacy / data rights', 'Security', 'Incorrect output', 'Operational disruption', 'Financial / customer harm', 'Adoption', 'Supplier dependency', 'Policy / contract', 'Other'];
export const ROADMAP_TYPES = ['foundation', 'validation', 'pilot', 'delivery', 'adoption', 'review'];
export const LIFECYCLE_STATUSES = ['Draft', 'Assessed', 'Approved for pilot', 'In progress', 'Completed', 'Parked', 'Rejected'];

export const METHODOLOGY_TEXT = `Prism v1 keeps value, readiness and risk separate. Each axis uses four scored components from 1–5, normalised to 0–100. Value weights are 50%, 20%, 15% and 15%. Readiness weights are 30%, 25%, 25% and 20%. Missing answers produce a possible range rather than an invented midpoint. Classification applies stop decisions, blocked gates, validation needs, then the 60-point value and readiness thresholds in that order. Evidence confidence never reduces business potential; it changes the recommended next action.`;
