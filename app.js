import {
  METHODOLOGY_VERSION, VALUE_WEIGHTS, READINESS_WEIGHTS, axisScore, calculatedClassification,
  calculateFinancialScenario, evidenceConfidence, escapeHtml, findDependencyCycle, formatScore,
  portfolioRisk, riskSeverity, topologicalOrder, waveCapacity
} from './core.js';
import {
  CONTEXT_QUESTIONS, USE_CASE_SECTIONS, ALL_USE_CASE_QUESTIONS, RUBRICS, GATE_NAMES,
  APPROACHES, APPROACH_GUIDANCE, RISK_CATEGORIES, ROADMAP_TYPES, LIFECYCLE_STATUSES, METHODOLOGY_TEXT
} from './content.js';
import {
  LocalStorageAdapter, blankState, createCustomer, createSession, createUseCase, demoState,
  validateState, mergeStates, makeId, isoNow
} from './storage.js';

const app = document.querySelector('#app');
const adapter = new LocalStorageAdapter();
let state;
let saveError = '';
try { state = adapter.load(); } catch (error) { state = blankState(); saveError = error.message; }

const ui = {
  view: state.customers.length ? 'customers' : 'home', customerId: null, useCaseId: null,
  workspaceTab: 'overview', workshopMode: 'context', questionIndex: 0, modal: null,
  customerSearch: '', registerSearch: '', registerStatus: '', reportCustomerId: null, sidebarOpen: false
};

const icons = { home: '⌂', customers: '◫', register: '▤', priorities: '◈', roadmap: '↗', reports: '▱', methodology: '◎', settings: '⚙' };
const money = (value, currency = 'GBP') => value === null || value === undefined || Number.isNaN(Number(value)) ? 'Unknown' : new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value));
const dateLabel = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'Not set';
const selectedCustomer = () => state.customers.find((customer) => customer.id === ui.customerId);
const selectedUseCase = () => state.useCases.find((useCase) => useCase.id === ui.useCaseId);
const customerCases = (id = ui.customerId) => state.useCases.filter((useCase) => useCase.customerId === id);
const customerSessions = (id = ui.customerId) => state.sessions.filter((session) => session.customerId === id);

function save(message = 'Changes saved') {
  try {
    state = adapter.save(state);
    saveError = '';
    showToast(message);
  } catch (error) {
    saveError = error.message;
    showToast(`Save failed: ${error.message}`, true);
  }
}

function showToast(message, error = false) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = error ? '#9b2941' : '';
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2600);
}

function navigate(view, options = {}) {
  Object.assign(ui, options, { view, modal: null, sidebarOpen: false });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function navButton(view, label) {
  const active = ui.view === view || (view === 'register' && ['case', 'workshop'].includes(ui.view));
  return `<button class="nav-button ${active ? 'active' : ''}" data-action="navigate" data-view="${view}"><span class="nav-icon">${icons[view]}</span>${label}</button>`;
}

function shell(content) {
  const customer = selectedCustomer();
  return `<div class="app-shell">
    <aside class="sidebar ${ui.sidebarOpen ? 'open' : ''}" aria-label="Primary navigation">
      <button class="brand" data-action="navigate" data-view="home" aria-label="Prism home"><img class="brand-logo" src="assets/prism-logo.png" alt=""><span class="brand-copy"><strong>Prism</strong><span>by Simpson Associates</span></span></button>
      <div class="nav-group"><div class="nav-label">Discover</div>${navButton('home','Home')}${navButton('customers','Customers')}${navButton('register','Use-case register')}</div>
      <div class="nav-group"><div class="nav-label">Decide</div>${navButton('priorities','Priorities')}${navButton('roadmap','Roadmap')}${navButton('reports','Reports')}</div>
      <div class="nav-group"><div class="nav-label">Reference</div>${navButton('methodology','Methodology')}${navButton('settings','Settings & backup')}</div>
      <div class="sidebar-foot"><strong>Local workshop edition</strong><br>Records stay in this browser. Export a backup before changing device.</div>
    </aside>
    <div class="main-wrap">
      <header class="topbar"><div class="toolbar-group"><button class="menu-toggle" data-action="toggle-menu" aria-label="Open menu">☰</button><span class="crumb">Prism${customer ? ` / ${escapeHtml(customer.name)}` : ''}</span></div><span class="save-state"><span class="save-dot" style="background:${saveError ? 'var(--red)' : 'var(--green)'}"></span>${saveError ? 'Save error' : 'Saved locally'}</span></header>
      <main id="main" class="content">${saveError ? `<div class="callout error"><strong>Local save problem:</strong> ${escapeHtml(saveError)} Export any recoverable data before continuing.</div>` : ''}${content}</main>
    </div>${renderModal()}
  </div>`;
}

function pageHeader(eyebrow, title, lead = '', action = '') {
  return `<div class="card-head"><div><div class="eyebrow">${eyebrow}</div><h1 style="font-size:clamp(2rem,3vw,3rem)">${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div>${action}</div>`;
}

function renderHome() {
  if (!state.customers.length) return `<section class="hero"><div><div class="eyebrow">Facilitator-led AI discovery</div><h1>From business problems to <span>prioritised opportunities.</span></h1><p class="lead">Guide a clear workshop, test whether AI is appropriate, make uncertainty visible and build a roadmap that customers can trust.</p><div class="actions"><button class="button" data-action="open-modal" data-modal="customer">Create customer</button><button class="button secondary" data-action="create-demo">Explore demo</button></div><hr class="spectrum-rule"><p class="small-text muted">No AI judge and no model-generated answers. Prism uses transparent questions and deterministic rules, with the facilitator in control.</p></div><div class="hero-art" aria-hidden="true"><div class="prism"></div></div></section>`;
  const active = state.customers.filter((customer) => !customer.archived);
  const cases = state.useCases;
  const validation = cases.filter((useCase) => calculatedClassification(useCase).label === 'Validate first').length;
  return `${pageHeader('Portfolio home','Good decisions start with the problem.','Continue a workshop, resolve uncertainty or review the portfolio.')}
    <div class="grid four"><div class="card"><div class="metric">${active.length}</div><div class="metric-label">Active customers</div></div><div class="card"><div class="metric">${cases.length}</div><div class="metric-label">Opportunities</div></div><div class="card"><div class="metric">${validation}</div><div class="metric-label">Need validation</div></div><div class="card"><div class="metric">${state.actions.filter((a)=>a.status!=='Done').length}</div><div class="metric-label">Open actions</div></div></div>
    <div class="toolbar"><h2 style="margin:0">Recent customers</h2><button class="button" data-action="open-modal" data-modal="customer">Create customer</button></div>
    <div class="grid three">${active.slice(0,6).map(customerCard).join('')}</div>`;
}

function customerCard(customer) {
  const cases = customerCases(customer.id);
  return `<article class="card interactive"><div class="card-head"><span class="badge ${customer.isDemo ? 'amber' : 'purple'}">${customer.isDemo ? 'Demo' : 'Customer'}</span><button class="row-action" data-action="open-customer" data-id="${customer.id}">Open →</button></div><h3>${escapeHtml(customer.name)}</h3><p class="muted small-text">${escapeHtml(customer.industry || 'Industry not recorded')} · ${cases.length} opportunit${cases.length === 1 ? 'y' : 'ies'}</p><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, cases.length * 18)}%"></div></div></article>`;
}

function renderCustomers() {
  const search = ui.customerSearch.toLowerCase();
  const customers = state.customers.filter((customer) => !customer.archived && customer.name.toLowerCase().includes(search));
  return `${pageHeader('Customer register','Customers','Manage organisations, workshops and opportunity portfolios.',`<button class="button" data-action="open-modal" data-modal="customer">Create customer</button>`)}
    <div class="toolbar"><input class="search" type="search" placeholder="Search customers" value="${escapeHtml(ui.customerSearch)}" data-input="customer-search"><span class="small-text muted">${customers.length} active · ${state.customers.filter(c=>c.archived).length} archived</span></div>
    ${customers.length ? `<div class="grid three">${customers.map(customerCard).join('')}</div>` : `<div class="empty"><div class="empty-icon">◫</div><h2>No matching customers</h2><p class="muted">Create a customer to begin a discovery session.</p></div>`}`;
}

function renderWorkspace() {
  const customer = selectedCustomer();
  if (!customer) return renderCustomers();
  const cases = customerCases();
  const sessions = customerSessions();
  const contextAnswered = CONTEXT_QUESTIONS.filter((question) => customer.context?.[question.id]?.state && customer.context[question.id].state !== 'unanswered').length;
  const tabs = ['overview','context','sessions','actions','outcomes'].map((tab) => `<button class="tab ${ui.workspaceTab===tab?'active':''}" data-action="workspace-tab" data-tab="${tab}">${tab[0].toUpperCase()+tab.slice(1)}</button>`).join('');
  let body = '';
  if (ui.workspaceTab === 'overview') body = `<div class="grid four"><div class="card"><div class="metric">${sessions.length}</div><div class="metric-label">Sessions</div></div><div class="card"><div class="metric">${cases.length}</div><div class="metric-label">Use cases</div></div><div class="card"><div class="metric">${contextAnswered}/10</div><div class="metric-label">Context addressed</div></div><div class="card"><div class="metric">${state.actions.filter(a=>a.customerId===customer.id&&a.status!=='Done').length}</div><div class="metric-label">Open actions</div></div></div>
    <div class="grid two" style="margin-top:1rem"><div class="card"><h2>Start or continue</h2><p class="muted">Capture organisational context once, then assess several problems without forcing completion.</p><div class="actions"><button class="button" data-action="start-context">Customer context</button><button class="button secondary" data-action="open-modal" data-modal="usecase">Add opportunity</button></div></div><div class="card"><h2>Objectives</h2>${customer.objectives?.length ? `<ul>${customer.objectives.map(o=>`<li>${escapeHtml(o)}</li>`).join('')}</ul>` : '<p class="muted">No objectives extracted yet. Add them during context.</p>'}</div></div>
    <div class="toolbar"><h2 style="margin:0">Opportunities</h2><button class="button secondary small" data-action="open-modal" data-modal="usecase">Add opportunity</button></div>${cases.length ? renderCaseTable(cases) : '<div class="empty"><p>No opportunities captured yet.</p></div>'}`;
  if (ui.workspaceTab === 'context') body = `<div class="grid two">${CONTEXT_QUESTIONS.map((question)=>{const answer=customer.context?.[question.id]; return `<div class="card"><span class="badge ${answer?.state==='unknown'?'amber':answer?.state==='answered'?'green':''}">${question.id} · ${answer?.state||'not answered'}</span><h3 style="margin-top:.8rem">${question.question}</h3><p class="muted small-text">${answer?.value ? escapeHtml(answer.value).replace(/\n/g,'<br>') : 'No response recorded.'}</p></div>`}).join('')}</div><div class="actions"><button class="button" data-action="start-context">Continue context workshop</button></div>`;
  if (ui.workspaceTab === 'sessions') body = `${sessions.length ? `<div class="table-wrap"><table><thead><tr><th>Session</th><th>Date</th><th>Facilitator</th><th>Status</th></tr></thead><tbody>${sessions.map(s=>`<tr><td>${escapeHtml(s.title)}</td><td>${dateLabel(s.date)}</td><td>${escapeHtml(s.facilitator||'Not set')}</td><td><span class="badge">${escapeHtml(s.status)}</span></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><p>No sessions yet.</p></div>'}<div class="actions"><button class="button" data-action="open-modal" data-modal="session">Create session</button></div>`;
  if (ui.workspaceTab === 'actions') body = renderActions(customer.id);
  if (ui.workspaceTab === 'outcomes') body = renderOutcomes(customer.id);
  return `<section class="customer-header"><div class="eyebrow">Customer workspace</div><h1>${escapeHtml(customer.name)}</h1><p class="muted">${escapeHtml(customer.industry||'Industry not set')} ${customer.scale?`· ${escapeHtml(customer.scale)}`:''} · ${escapeHtml(customer.currency)}</p><div class="actions no-print"><button class="button secondary" data-action="open-modal" data-modal="edit-customer">Edit customer</button><button class="button secondary" data-action="go-report" data-id="${customer.id}">Customer report</button></div></section><div class="tabs">${tabs}</div>${body}`;
}

function renderActions(customerId) {
  const actions = state.actions.filter((action) => action.customerId === customerId);
  return `<div class="toolbar"><div><h2>Actions</h2><p class="muted">Unknowns, readiness gaps and risk mitigations stay visible.</p></div><button class="button" data-action="open-modal" data-modal="action">Add action</button></div>${actions.length ? `<div class="table-wrap"><table><thead><tr><th>Action</th><th>Kind</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>${actions.map(a=>`<tr><td>${escapeHtml(a.title)}</td><td>${escapeHtml(a.kind)}</td><td>${escapeHtml(a.owner||'Unassigned')}</td><td>${dateLabel(a.dueDate)}</td><td><select data-change="action-status" data-id="${a.id}">${['Open','In progress','Done','No longer needed'].map(s=>`<option ${a.status===s?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><p>No actions recorded.</p></div>'}`;
}

function renderOutcomes(customerId) {
  const cases = customerCases(customerId);
  const outcomes = cases.flatMap((useCase) => (useCase.outcomes||[]).map((outcome)=>({...outcome,useCaseTitle:useCase.title,useCaseId:useCase.id})));
  return `<div class="toolbar"><div><h2>Outcome tracking</h2><p class="muted">Compare predicted targets with actual results without rewriting history.</p></div>${cases.length?`<button class="button" data-action="open-modal" data-modal="outcome">Record outcome</button>`:''}</div>${outcomes.length?`<div class="table-wrap"><table><thead><tr><th>Opportunity</th><th>Measure</th><th>Baseline</th><th>Predicted</th><th>Actual</th><th>Period</th></tr></thead><tbody>${outcomes.map(o=>`<tr><td>${escapeHtml(o.useCaseTitle)}</td><td>${escapeHtml(o.measure)}</td><td>${escapeHtml(o.baseline||'Unknown')} ${escapeHtml(o.unit||'')}</td><td>${escapeHtml(o.target||'Unknown')} ${escapeHtml(o.unit||'')}</td><td>${escapeHtml(o.actual||'Not measured')} ${escapeHtml(o.unit||'')}</td><td>${escapeHtml(o.period||'Not set')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty"><p>No outcomes recorded yet.</p></div>'}`;
}

function renderWorkshop() {
  const customer = selectedCustomer();
  const useCase = selectedUseCase();
  if (!customer) return renderCustomers();
  const isContext = ui.workshopMode === 'context';
  const questions = isContext ? CONTEXT_QUESTIONS : ALL_USE_CASE_QUESTIONS;
  const index = Math.max(0, Math.min(ui.questionIndex, questions.length - 1));
  const question = questions[index];
  const answers = isContext ? customer.context : useCase?.answers;
  if (!isContext && !useCase) return renderWorkspace();
  const answer = answers?.[question.id] || { state: 'unanswered', value: '' };
  const addressed = questions.filter((item) => answers?.[item.id]?.state && answers[item.id].state !== 'unanswered').length;
  const unknowns = questions.filter((item) => answers?.[item.id]?.state === 'unknown').length;
  const sections = isContext ? [{ id:'context', title:'Customer context', questions: CONTEXT_QUESTIONS }] : USE_CASE_SECTIONS;
  const currentSection = sections.find((section) => section.questions.some((item) => item.id === question.id));
  return `<div class="workshop-shell"><aside class="workshop-nav" aria-label="Workshop sections">${sections.map((section)=>{const sectionAnswered=section.questions.filter(q=>answers?.[q.id]?.state&&answers[q.id].state!=='unanswered').length; return `<button class="section-link ${currentSection?.id===section.id?'active':''}" data-action="jump-section" data-id="${section.questions[0].id}"><span>${section.title}</span><span>${sectionAnswered}/${section.questions.length}</span></button>`}).join('')}</aside>
    <section><div class="toolbar"><div><div class="eyebrow">${isContext?'Customer context':escapeHtml(useCase.title)}</div><span class="small-text muted">${addressed} of ${questions.length} addressed · ${unknowns} unknown</span></div><button class="button ghost" data-action="exit-workshop">Save and exit</button></div><div class="progress-track"><div class="progress-fill" style="width:${(addressed/questions.length)*100}%"></div></div><div class="progress-meta"><span>${currentSection?.title}</span><span>Question ${index+1} of ${questions.length}</span></div>
      <article class="question-card"><span class="question-id">${question.id}</span><h2>${question.question}</h2><div class="guidance">${question.guidance}${question.example?`<br><em>${question.example}</em>`:''}</div>${renderQuestionInput(question, answer)}
      <div class="answer-state"><button class="choice ${answer.state==='unknown'?'selected':''}" data-action="set-answer-state" data-state="unknown">Unknown</button><button class="choice ${answer.state==='unanswered'?'selected':''}" data-action="set-answer-state" data-state="unanswered">Skip for now</button>${!['V01','V02','V03','V04','R01','R02','R03','R04'].includes(question.id)?`<button class="choice ${answer.state==='not-applicable'?'selected':''}" data-action="set-answer-state" data-state="not-applicable">Not applicable</button>`:''}</div>
      <div class="actions" style="justify-content:space-between"><button class="button secondary" data-action="workshop-prev" ${index===0?'disabled':''}>← Back</button><button class="button" data-action="workshop-next">${index===questions.length-1?'Review assessment':'Next →'}</button></div></article></section></div>`;
}

function renderQuestionInput(question, answer) {
  const value = answer.value ?? '';
  if (question.type === 'score') return `<div class="score-choices">${RUBRICS[question.id].map((label,index)=>`<button class="score-choice ${answer.state==='answered'&&Number(value)===index+1?'selected':''}" data-action="score-answer" data-value="${index+1}"><strong>${index+1}</strong><span>${label}</span></button>`).join('')}</div>
    <div class="grid two" style="margin-top:1.2rem"><div class="field"><label for="evidence">Evidence or assumption</label><textarea id="evidence" data-answer-field="evidence" placeholder="What supports this answer?">${escapeHtml(answer.evidence||'')}</textarea></div><div><div class="field"><label for="source">Source or reference</label><input id="source" data-answer-field="source" value="${escapeHtml(answer.source||'')}" placeholder="Workshop notes, measure or stakeholder"></div><div class="field"><label for="confidence">Evidence confidence</label><select id="confidence" data-answer-field="confidence"><option value="unassessed">Unassessed</option>${['low','medium','high'].map(level=>`<option value="${level}" ${answer.confidence===level?'selected':''}>${level[0].toUpperCase()+level.slice(1)}</option>`).join('')}</select></div></div></div>`;
  if (question.type === 'approach') return `<div class="field"><label for="approach-answer">Chosen approach</label><select id="approach-answer" data-answer-field="value"><option value="">Choose an approach</option>${APPROACHES.map(option=>`<option value="${option}" ${value===option?'selected':''}>${option[0].toUpperCase()+option.slice(1)}</option>`).join('')}</select></div><div class="callout"><strong>Deterministic guidance</strong><ul>${APPROACH_GUIDANCE.map(([trigger,suggestion])=>`<li><strong>${trigger}:</strong> ${suggestion}</li>`).join('')}</ul></div>`;
  const tag = question.type === 'text' ? 'input' : 'textarea';
  return `<div class="field"><label for="answer-value">Workshop response</label>${tag==='input'?`<input id="answer-value" data-answer-field="value" value="${escapeHtml(value)}" placeholder="Type the response">`:`<textarea id="answer-value" data-answer-field="value" placeholder="Capture the discussion, evidence and assumptions">${escapeHtml(value)}</textarea>`}<span class="hint">Saved automatically in this browser.</span></div>`;
}

function renderRegister() {
  const search = ui.registerSearch.toLowerCase();
  let cases = state.useCases.filter((useCase) => (useCase.title + ' ' + useCase.problem).toLowerCase().includes(search));
  if (ui.registerStatus) cases = cases.filter((useCase) => calculatedClassification(useCase).label === ui.registerStatus);
  return `${pageHeader('Opportunity portfolio','Use-case register','Compare problem-led opportunities without forcing incomplete assessments into a rank.',`<button class="button" data-action="open-modal" data-modal="usecase-global" ${state.customers.filter(c=>!c.archived).length?'':'disabled'}>Add opportunity</button>`)}
    <div class="toolbar"><div class="toolbar-group"><input class="search" type="search" placeholder="Search opportunities" value="${escapeHtml(ui.registerSearch)}" data-input="register-search"><select data-change="register-status"><option value="">All classifications</option>${['Pilot now','Build foundations','Validate first','Local improvement','Park or reject'].map(label=>`<option ${ui.registerStatus===label?'selected':''}>${label}</option>`).join('')}</select></div><span class="small-text muted">${cases.length} shown</span></div>
    ${cases.length ? renderCaseTable(cases) : '<div class="empty"><div class="empty-icon">▤</div><h2>No opportunities found</h2><p class="muted">Add a problem to a customer workspace or adjust the filters.</p></div>'}`;
}

function renderCaseTable(cases) {
  return `<div class="table-wrap"><table><thead><tr><th>Opportunity</th><th>Customer</th><th>Classification</th><th>Value</th><th>Readiness</th><th>Confidence</th><th>Status</th></tr></thead><tbody>${cases.map((useCase)=>{const result=calculatedClassification(useCase); const customer=state.customers.find(c=>c.id===useCase.customerId); return `<tr><td><button class="row-action" data-action="open-case" data-id="${useCase.id}">${escapeHtml(useCase.title)}</button><br><span class="micro muted">${escapeHtml(useCase.approach||'Approach undecided')}</span></td><td>${escapeHtml(customer?.name||'Unknown')}</td><td><span class="badge ${classificationColour(result.label)}">${result.label}</span></td><td>${result.value.complete?result.value.score.toFixed(1):`Range ${formatScore(result.value)}`}</td><td>${result.readiness.complete?result.readiness.score.toFixed(1):`Range ${formatScore(result.readiness)}`}</td><td>${result.confidence}</td><td>${escapeHtml(useCase.lifecycleStatus)}</td></tr>`}).join('')}</tbody></table></div>`;
}

function classificationColour(label) {
  return ({'Pilot now':'green','Build foundations':'amber','Validate first':'blue','Local improvement':'purple','Park or reject':'red'})[label] || '';
}

function renderCase() {
  const useCase = selectedUseCase();
  if (!useCase) return renderRegister();
  const customer = state.customers.find((record) => record.id === useCase.customerId);
  const result = calculatedClassification(useCase);
  const central = calculateFinancialScenario(useCase.financialScenarios?.central || {});
  return `${pageHeader(escapeHtml(customer?.name||'Customer'),escapeHtml(useCase.title),escapeHtml(useCase.problem||'Problem description not recorded.'),`<button class="button" data-action="start-usecase">Continue workshop</button>`)}
    <div class="toolbar"><div class="toolbar-group"><label class="small-text" for="case-status"><strong>Lifecycle status</strong></label><select id="case-status" data-change="usecase-status">${LIFECYCLE_STATUSES.map(status=>`<option ${useCase.lifecycleStatus===status?'selected':''}>${status}</option>`).join('')}</select></div><span class="small-text muted">Assessment and lifecycle status are separate.</span></div>
    <div class="grid four"><div class="card result-card"><span class="metric-label">Value</span><div class="metric">${formatScore(result.value)}</div><div class="axis-bar"><div class="axis-fill" style="width:${result.value.complete?result.value.score:result.value.lower}%"></div></div><p class="micro muted">${result.value.complete?'Complete':`${result.value.answered}/4 answered · possible range`}</p></div><div class="card result-card readiness"><span class="metric-label">Readiness</span><div class="metric">${formatScore(result.readiness)}</div><div class="axis-bar"><div class="axis-fill readiness" style="width:${result.readiness.complete?result.readiness.score:result.readiness.lower}%"></div></div><p class="micro muted">${result.readiness.complete?'Complete':`${result.readiness.answered}/4 answered · possible range`}</p></div><div class="card result-card risk"><span class="metric-label">Risk</span><div class="metric" style="font-size:1.45rem">${result.risk.band}</div><p class="micro muted">${result.risk.provisional?'Initial rating is provisional':'Current residual assessment'}</p></div><div class="card"><span class="metric-label">Evidence confidence</span><div class="metric" style="font-size:1.45rem">${result.confidence}</div><p class="micro muted">Conservative rule across all eight scores</p></div></div>
    <div class="grid two" style="margin-top:1rem"><div class="card"><div class="card-head"><div><span class="badge ${classificationColour(result.label)}">Calculated recommendation</span><h2 style="margin-top:.8rem">${result.label}</h2></div></div><ul>${result.reasons.map(reason=>`<li>${escapeHtml(reason)}</li>`).join('')}</ul>${useCase.facilitatorRecommendation?`<div class="callout"><strong>Facilitator recommendation:</strong> ${escapeHtml(useCase.facilitatorRecommendation.label)}<br><span class="small-text">${escapeHtml(useCase.facilitatorRecommendation.rationale)}</span></div>`:''}<button class="button secondary small" data-action="open-modal" data-modal="recommendation">Record facilitator recommendation</button></div>
    <div class="card"><h2>Approach</h2><p><strong>${escapeHtml(useCase.approach||'Undecided')}</strong></p><p class="muted">${escapeHtml(useCase.approachRationale||'No rationale recorded.')}</p><p class="small-text"><strong>Alternative considered:</strong> ${escapeHtml(useCase.alternative||'Not recorded')}</p><button class="button secondary small" data-action="open-modal" data-modal="approach">Edit approach</button></div></div>
    <div class="tabs" style="margin-top:1.5rem"><button class="tab active">Review</button></div>
    <div class="grid two"><div>${renderGates(useCase)}</div><div>${renderRisks(useCase)}</div></div>
    <div style="margin-top:1rem">${renderFinancial(useCase, central, customer?.currency||'GBP')}</div>
    <div class="grid two" style="margin-top:1rem"><div class="card"><h2>Next actions</h2>${renderCaseActions(useCase)}</div><div class="card"><h2>Assessment details</h2>${renderAnswerSummary(useCase)}</div></div>`;
}

function renderGates(useCase) {
  const gates = GATE_NAMES.map((name)=>useCase.gates.find((gate)=>gate.name===name)||{name,status:'unknown',reason:''});
  return `<div class="card"><div class="card-head"><div><h2>Required gates</h2><p class="muted small-text">A blocked gate cannot be overridden into readiness.</p></div></div>${gates.map((gate,index)=>`<div class="field"><span class="label">${escapeHtml(gate.name)}</span><div class="toolbar-group"><select data-change="gate-status" data-index="${index}">${['clear','blocked','unknown','not applicable'].map(status=>`<option value="${status}" ${gate.status===status?'selected':''}>${status[0].toUpperCase()+status.slice(1)}</option>`).join('')}</select><input data-change="gate-reason" data-index="${index}" value="${escapeHtml(gate.reason||'')}" placeholder="Reason, owner or next step"></div></div>`).join('')}</div>`;
}

function renderRisks(useCase) {
  return `<div class="card"><div class="card-head"><div><h2>Risk register</h2><p class="muted small-text">Portfolio risk is the maximum residual severity.</p></div><button class="button secondary small" data-action="open-modal" data-modal="risk">Add risk</button></div><label class="small-text"><input type="checkbox" data-change="no-risks" ${useCase.explicitNoRisks?'checked':''}> Explicit review found no material risks</label>${useCase.risks.length?useCase.risks.map((risk)=>{const severity=riskSeverity(risk.residualLikelihood||risk.likelihood,risk.residualImpact||risk.impact);return `<div class="callout" style="margin-top:.7rem"><strong>${escapeHtml(risk.description)}</strong><br><span class="badge ${severity?.band==='Critical'||severity?.band==='High'?'red':'amber'}">${severity?.band||'Unassessed'} ${severity?.score||''}</span> <span class="small-text muted">${escapeHtml(risk.category)} · Owner: ${escapeHtml(risk.owner||'unassigned')}</span><p class="small-text">Mitigation: ${escapeHtml(risk.mitigation||'Not recorded')}</p></div>`}).join(''):'<p class="muted small-text" style="margin-top:1rem">No risk rows. Unless the explicit review box is checked, risk remains incomplete.</p>'}</div>`;
}

function renderFinancial(useCase, central, currency) {
  const scenarios = ['conservative','central','optimistic'];
  return `<div class="card"><div class="card-head"><div><h2>Business case</h2><p class="muted">Capacity, realised financial benefit and cost remain separate.</p></div></div><div class="grid three">${scenarios.map(name=>{const calculated=calculateFinancialScenario(useCase.financialScenarios?.[name]||{});return `<div class="callout"><span class="badge ${name==='central'?'purple':''}">${name}</span><h3 style="margin-top:.8rem">${calculated.valid&&calculated.capacityHours!==null?`${calculated.capacityHours.toFixed(0)} hours`:'Capacity unknown'}</h3><p class="small-text">Capacity value: ${calculated.valid?money(calculated.capacityValue,currency):'Invalid inputs'}<br>Annual net financial benefit: ${calculated.valid?money(calculated.annualNetBenefit,currency):'Invalid inputs'}<br>Simple payback: ${calculated.valid&&calculated.paybackMonths!==null?`${calculated.paybackMonths.toFixed(1)} months`:'No positive/known payback'}</p></div>`}).join('')}</div><div class="actions"><button class="button secondary small" data-action="open-modal" data-modal="financial">Edit scenarios</button></div></div>`;
}

function renderCaseActions(useCase) {
  const actions=state.actions.filter(a=>(a.useCaseIds||[]).includes(useCase.id));
  return actions.length?`<ul>${actions.map(a=>`<li><strong>${escapeHtml(a.title)}</strong> · ${escapeHtml(a.status)} · ${escapeHtml(a.owner||'Unassigned')}</li>`).join('')}</ul>`:'<p class="muted">No linked actions yet.</p>';
}

function renderAnswerSummary(useCase) {
  const core=[...Object.keys(VALUE_WEIGHTS),...Object.keys(READINESS_WEIGHTS)];
  return `<div class="grid two">${core.map(id=>{const answer=useCase.answers[id];return `<div><span class="badge ${answer?.state==='answered'?'green':answer?.state==='unknown'?'amber':''}">${id}</span><p class="small-text"><strong>${answer?.state==='answered'?`Score ${answer.value}`:answer?.state||'Not answered'}</strong><br><span class="muted">${answer?.confidence||'unassessed'} confidence</span></p></div>`}).join('')}</div>`;
}

function renderPriorities() {
  const complete = state.useCases.map((useCase)=>({useCase,result:calculatedClassification(useCase)})).filter(item=>item.result.value.complete&&item.result.readiness.complete);
  const incomplete = state.useCases.filter((useCase)=>{const result=calculatedClassification(useCase);return !result.value.complete||!result.readiness.complete});
  return `${pageHeader('Portfolio decision support','Priorities','Value and readiness stay separate. Risk, confidence, cost and time remain visible beside the recommendation.')}
    ${state.useCases.length?`<div class="grid two"><div><div class="matrix" aria-label="Value and readiness matrix"><span class="matrix-label tl">Build foundations</span><span class="matrix-label tr">Pilot now</span><span class="matrix-label bl">Park / review</span><span class="matrix-label br">Local improvement</span>${complete.map(({useCase,result},index)=>`<button class="matrix-point" title="${escapeHtml(useCase.title)}: value ${result.value.score.toFixed(1)}, readiness ${result.readiness.score.toFixed(1)}" data-action="open-case" data-id="${useCase.id}" style="left:${result.readiness.score}%;bottom:${result.value.score}%">${index+1}</button>`).join('')}</div><div class="progress-meta"><span>← Lower readiness</span><span>Higher readiness →</span></div></div><div class="card"><h2>Matrix legend</h2>${complete.map(({useCase,result},index)=>`<button class="nav-button" style="color:var(--ink)" data-action="open-case" data-id="${useCase.id}"><span class="matrix-point" style="position:static;transform:none;flex:0 0 34px">${index+1}</span><span><strong>${escapeHtml(useCase.title)}</strong><br><span class="small-text muted">${result.label} · ${result.confidence} confidence · ${result.risk.band} risk</span></span></button>`).join('')||'<p class="muted">No complete assessments to plot.</p>'}</div></div>
    <div class="toolbar"><h2 style="margin:0">Comparable portfolio table</h2></div>${renderCaseTable(state.useCases)}${incomplete.length?`<div class="callout warning" style="margin-top:1rem"><strong>${incomplete.length} incomplete assessment${incomplete.length===1?'':'s'}</strong><p class="small-text">These appear in the table with possible ranges and are deliberately not plotted at invented midpoints.</p></div>`:''}`:'<div class="empty"><div class="empty-icon">◈</div><h2>No priorities yet</h2><p class="muted">Assess at least one opportunity to build the portfolio view.</p></div>'}`;
}

function ensureDefaultWaves(customerId) {
  if (state.waves.some((wave)=>wave.customerId===customerId)) return;
  ['Foundations and validation','First pilots','Scale and strategic delivery'].forEach((name,index)=>state.waves.push({id:makeId('wav'),customerId,name,order:index,capacity:'',budget:'',startDate:'',endDate:''}));
  save('Default planning waves created');
}

function renderRoadmap() {
  const customers=state.customers.filter(c=>!c.archived);
  const customerId=ui.customerId&&customers.some(c=>c.id===ui.customerId)?ui.customerId:customers[0]?.id;
  if (customerId && ui.customerId!==customerId) ui.customerId=customerId;
  if (!customerId) return `${pageHeader('Sequencing','Roadmap','Plan foundations, validation, pilots and delivery around dependencies and capacity.')}<div class="empty"><p>Create a customer first.</p></div>`;
  ensureDefaultWaves(customerId);
  const customer=selectedCustomer();
  const waves=state.waves.filter(w=>w.customerId===customerId).sort((a,b)=>a.order-b.order);
  const items=topologicalOrder(state.roadmapItems.filter(item=>item.customerId===customerId));
  const capacities=waveCapacity(items,waves);
  const unscheduled=items.filter(item=>!item.waveId);
  return `${pageHeader('Sequencing',`Roadmap · ${escapeHtml(customer.name)}`,'Shared foundations are represented once and may link to several opportunities.',`<button class="button" data-action="open-modal" data-modal="roadmap">Add roadmap item</button>`)}
    <div class="toolbar"><select data-change="roadmap-customer">${customers.map(c=>`<option value="${c.id}" ${c.id===customerId?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select><span class="small-text muted">Items are shown after their hard prerequisites.</span></div>
    <div class="grid three">${waves.map((wave)=>{const capacity=capacities.find(c=>c.id===wave.id);const waveItems=items.filter(item=>item.waveId===wave.id);return `<section class="roadmap-wave"><div class="card-head"><div><h3>${escapeHtml(wave.name)}</h3><span class="small-text ${capacity.overEffort||capacity.overBudget?'badge red':'muted'}">${capacity.complete?`${capacity.effort} person-days`:'Capacity not fully assessed'}${capacity.overEffort?' · over capacity':''}${capacity.overBudget?' · over budget':''}</span></div><button class="row-action" data-action="open-modal" data-modal="wave" data-id="${wave.id}">Edit</button></div>${waveItems.map(item=>renderRoadmapItem(item,items)).join('')||'<p class="muted small-text">No items scheduled.</p>'}</section>`}).join('')}</div>
    ${unscheduled.length?`<section class="roadmap-wave" style="margin-top:1rem"><h3>Unscheduled / provisional</h3><div class="grid three">${unscheduled.map(item=>renderRoadmapItem(item,items)).join('')}</div></section>`:''}`;
}

function renderRoadmapItem(item,items) {
  const dependencies=(item.dependencies||[]).map(id=>items.find(candidate=>candidate.id===id)?.title).filter(Boolean);
  return `<article class="roadmap-item" data-type="${item.type}"><div class="card-head"><span class="badge">${escapeHtml(item.type)}</span><button class="row-action" data-action="open-modal" data-modal="roadmap" data-id="${item.id}">Edit</button></div><strong>${escapeHtml(item.title)}</strong><p class="micro muted">${item.personDays!==''&&item.personDays!=null?`${item.personDays} person-days`:'Effort unknown'} · ${item.status||'Planned'}</p>${dependencies.length?`<p class="micro">Needs: ${dependencies.map(escapeHtml).join(', ')}</p>`:''}</article>`;
}

function renderReports() {
  const customers=state.customers.filter(c=>!c.archived);
  const customerId=ui.reportCustomerId||ui.customerId||customers[0]?.id;
  const customer=state.customers.find(c=>c.id===customerId);
  if (!customer) return `${pageHeader('Decision records','Reports','Create a customer-ready portfolio report and portable exports.')}<div class="empty"><p>Create a customer first.</p></div>`;
  ui.reportCustomerId=customer.id;
  const cases=customerCases(customer.id);
  return `${pageHeader('Decision records','Reports','Print a customer-ready report, export Markdown, or take a point-in-time decision snapshot.')}
    <div class="toolbar no-print"><select data-change="report-customer">${customers.map(c=>`<option value="${c.id}" ${c.id===customer.id?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select><div class="toolbar-group"><button class="button secondary" data-action="snapshot">Save snapshot</button><button class="button secondary" data-action="download-markdown">Export Markdown</button><button class="button" data-action="print-report">Print / Save PDF</button></div></div>
    <article class="report" id="customer-report"><div class="eyebrow">Prism decision portfolio</div><h1>${escapeHtml(customer.name)}</h1><p class="lead">From business problems to prioritised opportunities.</p><p class="small-text">Prepared ${dateLabel(new Date().toISOString().slice(0,10))} · Facilitator: ${escapeHtml(customer.facilitator||'Not recorded')} · Methodology ${METHODOLOGY_VERSION}</p><hr class="spectrum-rule">
      <section><h2>Customer context</h2><div class="grid two"><div><h3>Objectives</h3>${customer.objectives?.length?`<ul>${customer.objectives.map(o=>`<li>${escapeHtml(o)}</li>`).join('')}</ul>`:'<p>Not recorded.</p>'}</div><div><h3>Portfolio at a glance</h3><p>${cases.length} opportunities · ${state.actions.filter(a=>a.customerId===customer.id&&a.status!=='Done').length} open actions</p><p class="small-text">Records are stored on this browser/device. This report is a point-in-time output, not shared customer management.</p></div></div></section>
      <section><h2>Portfolio</h2>${cases.length?`<table><thead><tr><th>Opportunity</th><th>Recommendation</th><th>Value</th><th>Readiness</th><th>Confidence / risk</th></tr></thead><tbody>${cases.map(useCase=>{const r=calculatedClassification(useCase);return `<tr><td>${escapeHtml(useCase.title)}</td><td>${r.label}</td><td>${formatScore(r.value)}</td><td>${formatScore(r.readiness)}</td><td>${r.confidence} / ${r.risk.band}</td></tr>`}).join('')}</tbody></table>`:'<p>No opportunities.</p>'}</section>
      ${cases.map(decisionBrief).join('')}
      <section><h2>Roadmap and actions</h2>${renderReportRoadmap(customer.id)}</section>
      <section><h2>Methodology note</h2><p>${METHODOLOGY_TEXT}</p><p class="small-text">These weights and thresholds are proposed Prism defaults, not a vendor or scientifically validated formula.</p></section>
    </article>`;
}

function decisionBrief(useCase) {
  const result=calculatedClassification(useCase);const currency=state.customers.find(c=>c.id===useCase.customerId)?.currency||'GBP';const central=calculateFinancialScenario(useCase.financialScenarios?.central||{});
  return `<section><h2>${escapeHtml(useCase.title)}</h2><p>${escapeHtml(useCase.problem||'Problem description not recorded.')}</p><div class="grid two"><div><h3>Decision</h3><p><span class="badge ${classificationColour(result.label)}">${result.label}</span></p><ul>${result.reasons.map(reason=>`<li>${escapeHtml(reason)}</li>`).join('')}</ul><p><strong>Approach:</strong> ${escapeHtml(useCase.approach||'Undecided')}<br><strong>Alternative:</strong> ${escapeHtml(useCase.alternative||'Not recorded')}</p></div><div><h3>Assessment</h3><p>Value: ${formatScore(result.value)}<br>Readiness: ${formatScore(result.readiness)}<br>Confidence: ${result.confidence}<br>Risk: ${result.risk.band}</p><p>Central capacity: ${central.valid&&central.capacityHours!==null?`${central.capacityHours.toFixed(0)} hours/year`:'Unknown'}<br>Annual net financial benefit: ${central.valid?money(central.annualNetBenefit,currency):'Invalid'}<br>Time to first benefit: ${escapeHtml(useCase.answers?.D01?.value||'Unknown')}</p></div></div><h3>Outstanding validation and assumptions</h3>${result.reasons.length?`<ul>${result.reasons.map(reason=>`<li>${escapeHtml(reason)}</li>`).join('')}</ul>`:'<p>No classification blockers recorded.</p>'}</section>`;
}

function renderReportRoadmap(customerId) {
  const items=topologicalOrder(state.roadmapItems.filter(i=>i.customerId===customerId));
  const actions=state.actions.filter(a=>a.customerId===customerId&&a.status!=='Done');
  return `${items.length?`<ol>${items.map(item=>`<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.type)}; ${escapeHtml(item.status||'Planned')}</li>`).join('')}</ol>`:'<p>No roadmap items scheduled.</p>'}${actions.length?`<h3>Open actions</h3><ul>${actions.map(a=>`<li>${escapeHtml(a.title)} — ${escapeHtml(a.owner||'Unassigned')}</li>`).join('')}</ul>`:''}`;
}

function renderMethodology() {
  return `${pageHeader('Transparent by design','Methodology','The facilitator can explain every score, threshold and next action.')}
    <div class="card"><span class="badge purple">${METHODOLOGY_VERSION}</span><h2 style="margin-top:1rem">Separate value, readiness and risk</h2><p class="lead">${METHODOLOGY_TEXT}</p></div>
    <div class="grid two" style="margin-top:1rem"><div class="card"><h2>Value weights</h2>${renderWeightList(VALUE_WEIGHTS)}</div><div class="card"><h2>Readiness weights</h2>${renderWeightList(READINESS_WEIGHTS)}</div></div>
    <div class="card" style="margin-top:1rem"><h2>Classification order</h2><ol><li>Park or reject an explicit stop.</li><li>Build foundations for a blocked gate or hard prerequisite.</li><li>Validate first for uncertainty, missing scores, risk gaps or weak evidence.</li><li>For complete, controlled cases, apply the 60-point value and readiness thresholds.</li></ol><div class="callout"><strong>Confidence is not a discount.</strong> Potential value remains visible while weak evidence changes the next step to validation.</div></div>
    <div class="card" style="margin-top:1rem"><h2>Score rubrics</h2><div class="grid two">${Object.entries(RUBRICS).map(([id,labels])=>`<div><h3>${id}</h3><ol>${labels.map(label=>`<li>${escapeHtml(label)}</li>`).join('')}</ol></div>`).join('')}</div></div>`;
}

function renderWeightList(weights) { return Object.entries(weights).map(([id,weight])=>`<div class="field"><div class="card-head"><strong>${id}</strong><span>${weight*100}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${weight*100}%"></div></div></div>`).join(''); }

function renderSettings() {
  const jsonSize=new Blob([JSON.stringify(state)]).size;
  return `${pageHeader('Local workshop edition','Settings & backup','Records are saved only in this browser on this device. Export a backup before changing browser, device or storage settings.')}
    <div class="grid two"><div class="card"><h2>Portable backup</h2><p class="muted">JSON preserves stable IDs, links, null states, methodology versions and audit records. Import validates the file before any data changes.</p><div class="actions"><button class="button" data-action="download-json">Export JSON backup</button><label class="button secondary" for="import-file">Import backup</label><input id="import-file" type="file" accept="application/json" hidden data-change="import-file"></div><p class="micro muted">Current backup size: ${(jsonSize/1024).toFixed(1)} KB</p></div><div class="card"><h2>Register export</h2><p class="muted">CSV contains a customer and opportunity summary for spreadsheet review.</p><button class="button secondary" data-action="download-csv">Export CSV register</button></div></div>
    <div class="card" style="margin-top:1rem"><h2>Storage model</h2><p>Prism uses a versioned local-storage adapter. Autosave runs after edits and errors are reported. This is reliable for one browser profile, but it is not shared customer management, collaboration or cloud backup.</p><p class="small-text"><strong>Schema version:</strong> ${state.schemaVersion} · <strong>Last saved:</strong> ${state.updatedAt?new Date(state.updatedAt).toLocaleString('en-GB'):'Not yet saved'}</p></div>
    <div class="card danger-zone" style="margin-top:1rem"><h2>Demo and local data</h2><div class="actions"><button class="button secondary" data-action="remove-demo" ${state.customers.some(c=>c.isDemo)?'':'disabled'}>Remove demo records</button><button class="button danger" data-action="confirm-clear">Clear all local data</button></div></div>`;
}

function field(label, name, value = '', type = 'text', options = '') {
  if (type === 'select') return `<div class="field"><label for="${name}">${label}</label><select id="${name}" name="${name}">${options}</select></div>`;
  if (type === 'textarea') return `<div class="field"><label for="${name}">${label}</label><textarea id="${name}" name="${name}">${escapeHtml(value)}</textarea></div>`;
  return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value)}"></div>`;
}

function renderModal() {
  if (!ui.modal) return '';
  const modal=ui.modal;
  const close=`<button class="button ghost small" type="button" data-action="close-modal">Close</button>`;
  let title='';let body='';
  if (modal.type==='customer'||modal.type==='edit-customer') {
    const customer=modal.type==='edit-customer'?selectedCustomer():{};title=modal.type==='edit-customer'?'Edit customer':'Create customer';
    body=`<form data-form="customer">${field('Customer name','name',customer.name||'')}${field('Industry','industry',customer.industry||'')}${field('Organisation size or scale','scale',customer.scale||'') }<div class="grid two">${field('Default currency code','currency',customer.currency||'GBP')}${field('Facilitator','facilitator',customer.facilitator||'')}</div>${field('Optional contact email','contactEmail',customer.contactEmail||'','email')}<div class="actions"><button class="button" type="submit">${modal.type==='edit-customer'?'Save changes':'Create customer'}</button>${close}</div></form>`;
  }
  if (modal.type==='session') { title='Create discovery session';body=`<form data-form="session">${field('Workshop title','title','Discovery workshop') }<div class="grid two">${field('Workshop date','date',new Date().toISOString().slice(0,10),'date')}${field('Facilitator','facilitator',selectedCustomer()?.facilitator||'')}</div>${field('Participants and roles','participants','','textarea')}<div class="actions"><button class="button" type="submit">Create session</button>${close}</div></form>`; }
  if (modal.type==='usecase'||modal.type==='usecase-global') {
    title='Add an opportunity';const customers=state.customers.filter(c=>!c.archived);const chosen=modal.type==='usecase'?selectedCustomer()?.id:customers[0]?.id;
    body=`<form data-form="usecase">${field('Customer','customerId','', 'select',customers.map(c=>`<option value="${c.id}" ${c.id===chosen?'selected':''}>${escapeHtml(c.name)}</option>`).join(''))}${field('Opportunity title','title','')}${field('What happens today, and where does it go wrong?','problem','','textarea')}<p class="hint">A draft can be saved with only customer, title and problem.</p><div class="actions"><button class="button" type="submit">Save draft and assess</button>${close}</div></form>`;
  }
  if (modal.type==='action') { title='Add action';const cases=customerCases();const caseOptions=`<option value="">Customer-wide</option>${cases.map(c=>`<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('')}`;body=`<form data-form="action">${field('Action title','title','') }<div class="grid two">${field('Kind','kind','', 'select',['Discovery','Readiness','Risk mitigation','Dependency','Decision'].map(x=>`<option>${x}</option>`).join(''))}${field('Related opportunity','useCaseId','', 'select',caseOptions)}${field('Owner','owner','')}${field('Due or review date','dueDate','','date')}</div><div class="actions"><button class="button" type="submit">Add action</button>${close}</div></form>`; }
  if (modal.type==='outcome') { title='Record an outcome';const cases=customerCases();body=`<form data-form="outcome">${field('Opportunity','useCaseId','', 'select',cases.map(c=>`<option value="${c.id}">${escapeHtml(c.title)}</option>`).join(''))}${field('Outcome measure','measure','')}<div class="grid three">${field('Baseline','baseline','')}${field('Predicted target','target','')}${field('Actual result','actual','')}</div><div class="grid two">${field('Unit','unit','')}${field('Measurement period','period','')}</div>${field('Evidence','evidence','','textarea')}<div class="actions"><button class="button" type="submit">Record outcome</button>${close}</div></form>`; }
  if (modal.type==='recommendation') { title='Facilitator recommendation';const useCase=selectedUseCase();body=`<form data-form="recommendation">${field('Recommendation','label','', 'select',['Pilot now','Build foundations','Validate first','Local improvement','Strategic investment','Park','Reject'].map(x=>`<option ${useCase.facilitatorRecommendation?.label===x?'selected':''}>${x}</option>`).join(''))}${field('Rationale (required)','rationale',useCase.facilitatorRecommendation?.rationale||'','textarea')}<div class="callout warning small-text">The calculated recommendation remains visible. A manual recommendation cannot clear a blocked gate.</div><div class="actions"><button class="button" type="submit">Record recommendation</button>${close}</div></form>`; }
  if (modal.type==='approach') { title='Approach selection';const useCase=selectedUseCase();body=`<form data-form="approach">${field('Chosen approach','approach','', 'select',APPROACHES.map(x=>`<option value="${x}" ${useCase.approach===x?'selected':''}>${x[0].toUpperCase()+x.slice(1)}</option>`).join(''))}${field('Why does this fit?','rationale',useCase.approachRationale||'','textarea')}${field('Alternative considered','alternative',useCase.alternative||'','textarea')}<div class="actions"><button class="button" type="submit">Save approach</button>${close}</div></form>`; }
  if (modal.type==='risk') { title='Add a risk';body=`<form data-form="risk">${field('Risk description','description','', 'textarea')}${field('Category','category','', 'select',RISK_CATEGORIES.map(x=>`<option>${x}</option>`).join(''))}<div class="grid two">${field('Initial likelihood (1–5)','likelihood','','number')}${field('Initial impact (1–5)','impact','','number')}${field('Residual likelihood (1–5)','residualLikelihood','','number')}${field('Residual impact (1–5)','residualImpact','','number')}</div>${field('Mitigation','mitigation','', 'textarea')}${field('Owner','owner','')}<div class="actions"><button class="button" type="submit">Add risk</button>${close}</div></form>`; }
  if (modal.type==='financial') { title='Business-case scenarios';const useCase=selectedUseCase();const names=['conservative','central','optimistic'];const inputs=[['annualVolume','Annual task volume'],['currentMinutes','Current minutes/task'],['futureMinutes','Future minutes/task including review'],['adoptionPercent','Adoption %'],['hourlyCost','Loaded hourly cost'],['cashSavings','Confirmed cash savings'],['contributionMargin','Incremental contribution margin'],['qualityBenefit','Financial quality benefit'],['recurringCost','Annual recurring cost'],['oneOffCost','One-off cost'],['benefitMonths','First-year benefit-active months'],['operatingMonths','First-year operating-cost months']];body=`<form data-form="financial"><div class="table-wrap"><table><thead><tr><th>Input</th>${names.map(n=>`<th>${n}</th>`).join('')}</tr></thead><tbody>${inputs.map(([key,label])=>`<tr><td>${label}</td>${names.map(name=>`<td><input style="width:110px" type="number" step="any" name="${name}.${key}" value="${escapeHtml(useCase.financialScenarios?.[name]?.[key]??'')}"></td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="small-text muted">Capacity value is illustrative and never becomes cash saving without an explicit spending reduction.</p><div class="actions"><button class="button" type="submit">Calculate and save</button>${close}</div></form>`; }
  if (modal.type==='roadmap') {
    const item=state.roadmapItems.find(i=>i.id===modal.id)||{};const items=state.roadmapItems.filter(i=>i.customerId===ui.customerId&&i.id!==item.id);const waves=state.waves.filter(w=>w.customerId===ui.customerId);
    const waveOptions=`<option value="">Unscheduled</option>${waves.map(w=>`<option value="${w.id}" ${item.waveId===w.id?'selected':''}>${escapeHtml(w.name)}</option>`).join('')}`;
    title=item.id?'Edit roadmap item':'Add roadmap item';body=`<form data-form="roadmap"><input type="hidden" name="id" value="${item.id||''}">${field('Title','title',item.title||'') }<div class="grid two">${field('Type','type','', 'select',ROADMAP_TYPES.map(x=>`<option ${item.type===x?'selected':''}>${x}</option>`).join(''))}${field('Wave','waveId','', 'select',waveOptions)}${field('Owner','owner',item.owner||'')}${field('Status','status','', 'select',['Planned','Ready','In progress','Done','Blocked'].map(x=>`<option ${item.status===x?'selected':''}>${x}</option>`).join(''))}${field('Person-days','personDays',item.personDays??'','number')}${field('One-off allocation cost','cost',item.cost??'','number')}</div><div class="field"><span class="label">Hard prerequisites</span>${items.map(i=>`<label><input type="checkbox" name="dependencies" value="${i.id}" ${(item.dependencies||[]).includes(i.id)?'checked':''}> ${escapeHtml(i.title)}</label>`).join('')||'<span class="muted">No other items yet.</span>'}</div><div class="field"><span class="label">Linked opportunities</span>${customerCases().map(c=>`<label><input type="checkbox" name="useCaseIds" value="${c.id}" ${(item.useCaseIds||[]).includes(c.id)?'checked':''}> ${escapeHtml(c.title)}</label>`).join('')||'<span class="muted">No opportunities yet.</span>'}</div><div class="actions"><button class="button" type="submit">Save item</button>${close}</div></form>`;
  }
  if (modal.type==='wave') { const wave=state.waves.find(w=>w.id===modal.id);title='Edit planning wave';body=`<form data-form="wave"><input type="hidden" name="id" value="${wave.id}">${field('Wave name','name',wave.name)}<div class="grid two">${field('Capacity (person-days)','capacity',wave.capacity??'','number')}${field('Budget','budget',wave.budget??'','number')}${field('Start date','startDate',wave.startDate||'','date')}${field('End date','endDate',wave.endDate||'','date')}</div><div class="actions"><button class="button" type="submit">Save wave</button>${close}</div></form>`; }
  if (modal.type==='import') { title='Import backup';body=`<p><strong>${modal.incoming.customers.length}</strong> customers and <strong>${modal.incoming.useCases.length}</strong> opportunities passed validation.</p><div class="callout warning">Merge keeps existing records and adds new stable IDs. Replace overwrites all current local records and requires confirmation.</div><div class="actions"><button class="button" data-action="apply-import" data-mode="merge">Merge records</button><button class="button danger" data-action="apply-import" data-mode="replace">Replace local data</button>${close}</div>`; }
  if (modal.type==='clear') { title='Clear all local data?';body=`<p>This removes every customer, session, use case, action, roadmap item and snapshot from this browser. Export a backup first if needed.</p><div class="actions"><button class="button danger" data-action="clear-all">Clear all data</button>${close}</div>`; }
  return `<div class="modal-backdrop" role="presentation"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="card-head"><h2 id="modal-title">${title}</h2><button class="row-action" data-action="close-modal" aria-label="Close dialog">✕</button></div>${body}</section></div>`;
}

function render() {
  let content;
  if (ui.view==='home') content=renderHome();
  if (ui.view==='customers') content=renderCustomers();
  if (ui.view==='workspace') content=renderWorkspace();
  if (ui.view==='workshop') content=renderWorkshop();
  if (ui.view==='register') content=renderRegister();
  if (ui.view==='case') content=renderCase();
  if (ui.view==='priorities') content=renderPriorities();
  if (ui.view==='roadmap') content=renderRoadmap();
  if (ui.view==='reports') content=renderReports();
  if (ui.view==='methodology') content=renderMethodology();
  if (ui.view==='settings') content=renderSettings();
  app.innerHTML=shell(content||renderHome());
}

function persistSilent() {
  try { state=adapter.save(state); saveError=''; } catch (error) { saveError=error.message; showToast(`Save failed: ${error.message}`,true); }
}

function currentQuestion() {
  const questions=ui.workshopMode==='context'?CONTEXT_QUESTIONS:ALL_USE_CASE_QUESTIONS;
  return questions[Math.max(0,Math.min(ui.questionIndex,questions.length-1))];
}

function answerStore() { return ui.workshopMode==='context'?selectedCustomer()?.context:selectedUseCase()?.answers; }

function ensureAnswer() {
  const question=currentQuestion();const store=answerStore();
  if (!store[question.id]) store[question.id]={state:'unanswered',value:''};
  return store[question.id];
}

function ensureUnknownAction(question) {
  const useCase=selectedUseCase();const customer=selectedCustomer();
  const existing=state.actions.find(action=>action.sourceQuestionId===question.id&&action.customerId===customer.id&&(ui.workshopMode==='context'||(action.useCaseIds||[]).includes(useCase.id)));
  if (existing) { existing.status='Open'; return; }
  state.actions.push({id:makeId('act'),customerId:customer.id,useCaseIds:useCase?[useCase.id]:[],sourceQuestionId:question.id,title:`Resolve ${question.id}: ${question.question}`,kind:'Discovery',owner:'',status:'Open',dueDate:'',createdAt:isoNow()});
}

app.addEventListener('click',(event)=>{
  const button=event.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action;
  if(action==='navigate') navigate(button.dataset.view);
  if(action==='toggle-menu'){ui.sidebarOpen=!ui.sidebarOpen;render();}
  if(action==='open-modal'){ui.modal={type:button.dataset.modal,id:button.dataset.id||null};render();}
  if(action==='close-modal'){ui.modal=null;render();}
  if(action==='create-demo'){
    const demo=demoState();state=mergeStates(state,demo);save('Demo workspace created');ui.customerId=demo.customers[0].id;navigate('workspace');
  }
  if(action==='open-customer'){ui.customerId=button.dataset.id;ui.workspaceTab='overview';navigate('workspace');}
  if(action==='workspace-tab'){ui.workspaceTab=button.dataset.tab;render();}
  if(action==='start-context'){ui.workshopMode='context';ui.questionIndex=0;navigate('workshop');}
  if(action==='open-case'){const useCase=state.useCases.find(c=>c.id===button.dataset.id);ui.useCaseId=useCase.id;ui.customerId=useCase.customerId;navigate('case');}
  if(action==='start-usecase'){ui.workshopMode='usecase';ui.questionIndex=0;navigate('workshop');}
  if(action==='exit-workshop') navigate(ui.workshopMode==='context'?'workspace':'case');
  if(action==='jump-section'){
    const questions=ui.workshopMode==='context'?CONTEXT_QUESTIONS:ALL_USE_CASE_QUESTIONS;ui.questionIndex=questions.findIndex(q=>q.id===button.dataset.id);render();
  }
  if(action==='workshop-prev'){ui.questionIndex=Math.max(0,ui.questionIndex-1);render();}
  if(action==='workshop-next'){
    const questions=ui.workshopMode==='context'?CONTEXT_QUESTIONS:ALL_USE_CASE_QUESTIONS;
    if(ui.questionIndex>=questions.length-1) navigate(ui.workshopMode==='context'?'workspace':'case'); else {ui.questionIndex+=1;render();}
  }
  if(action==='set-answer-state'){
    const answer=ensureAnswer();const question=currentQuestion();answer.state=button.dataset.state;answer.value=null;answer.updatedAt=isoNow();
    if(answer.state==='unknown')ensureUnknownAction(question);save(answer.state==='unknown'?'Unknown saved and action created':'Answer state saved');render();
  }
  if(action==='score-answer'){
    const answer=ensureAnswer();answer.state='answered';answer.value=Number(button.dataset.value);answer.capturedDate=answer.capturedDate||isoNow().slice(0,10);save('Score saved');render();
  }
  if(action==='go-report'){ui.reportCustomerId=button.dataset.id;navigate('reports');}
  if(action==='print-report')window.print();
  if(action==='snapshot')saveSnapshot();
  if(action==='download-json')download(`prism-backup-${isoNow().slice(0,10)}.json`,JSON.stringify(state,null,2),'application/json');
  if(action==='download-csv')download('prism-use-case-register.csv',makeCsv(),'text/csv');
  if(action==='download-markdown')download(`${slug(state.customers.find(c=>c.id===ui.reportCustomerId)?.name||'customer')}-prism-report.md`,makeMarkdown(ui.reportCustomerId),'text/markdown');
  if(action==='remove-demo')removeDemo();
  if(action==='confirm-clear'){ui.modal={type:'clear'};render();}
  if(action==='clear-all'){adapter.clear();state=blankState();ui.modal=null;ui.customerId=null;ui.useCaseId=null;navigate('home');showToast('Local data cleared');}
  if(action==='apply-import')applyImport(button.dataset.mode);
});

app.addEventListener('input',(event)=>{
  const target=event.target;
  if(target.dataset.input==='customer-search'){ui.customerSearch=target.value;const pos=target.selectionStart;render();setTimeout(()=>{const input=document.querySelector('[data-input="customer-search"]');input?.focus();input?.setSelectionRange(pos,pos)},0);}
  if(target.dataset.input==='register-search'){ui.registerSearch=target.value;const pos=target.selectionStart;render();setTimeout(()=>{const input=document.querySelector('[data-input="register-search"]');input?.focus();input?.setSelectionRange(pos,pos)},0);}
  if(target.dataset.answerField){
    const answer=ensureAnswer();answer[target.dataset.answerField]=target.value;answer.updatedAt=isoNow();
    if(target.dataset.answerField==='value'){
      answer.state=target.value?'answered':'unanswered';const question=currentQuestion();const useCase=selectedUseCase();
      if(ui.workshopMode==='context'&&question.id==='C01')selectedCustomer().objectives=target.value.split('\n').map(value=>value.trim()).filter(Boolean).slice(0,5);
      if(useCase&&question.id==='P01')useCase.title=target.value||'Untitled opportunity';
      if(useCase&&question.id==='P02')useCase.problem=target.value;
      if(useCase&&question.id==='A02')useCase.approach=target.value;
    }
    persistSilent();
  }
});

app.addEventListener('change',async(event)=>{
  const target=event.target;
  if(target.dataset.answerField){const answer=ensureAnswer();answer[target.dataset.answerField]=target.value;if(target.dataset.answerField==='value'){answer.state=target.value?'answered':'unanswered';if(currentQuestion().id==='A02')selectedUseCase().approach=target.value;}save('Answer saved');}
  if(target.dataset.change==='register-status'){ui.registerStatus=target.value;render();}
  if(target.dataset.change==='roadmap-customer'){ui.customerId=target.value;render();}
  if(target.dataset.change==='report-customer'){ui.reportCustomerId=target.value;render();}
  if(target.dataset.change==='action-status'){const record=state.actions.find(a=>a.id===target.dataset.id);record.status=target.value;save('Action updated');}
  if(target.dataset.change==='usecase-status'){selectedUseCase().lifecycleStatus=target.value;save('Lifecycle status updated');render();}
  if(target.dataset.change==='gate-status'||target.dataset.change==='gate-reason'){
    const useCase=selectedUseCase();useCase.gates=GATE_NAMES.map(name=>useCase.gates.find(g=>g.name===name)||{name,status:'unknown',reason:''});const gate=useCase.gates[Number(target.dataset.index)];
    if(target.dataset.change==='gate-status')gate.status=target.value;else gate.reason=target.value;save('Gate updated');render();
  }
  if(target.dataset.change==='no-risks'){const useCase=selectedUseCase();useCase.explicitNoRisks=target.checked;if(target.checked)useCase.risks=[];save('Risk review updated');render();}
  if(target.dataset.change==='import-file'&&target.files?.[0])await previewImport(target.files[0]);
});

app.addEventListener('submit',(event)=>{
  const form=event.target.closest('[data-form]');if(!form)return;event.preventDefault();const data=new FormData(form);handleForm(form.dataset.form,data);
});

function handleForm(type,data){
  if(type==='customer'){
    if(ui.modal.type==='edit-customer'){const customer=selectedCustomer();for(const key of ['name','industry','scale','currency','facilitator','contactEmail'])customer[key]=data.get(key).trim();customer.updatedAt=isoNow();save('Customer updated');ui.modal=null;render();return;}
    const customer=createCustomer(Object.fromEntries(data));state.customers.push(customer);const session=createSession(customer.id,{facilitator:customer.facilitator});state.sessions.push(session);save('Customer created');ui.customerId=customer.id;ui.modal=null;navigate('workspace');return;
  }
  if(type==='session'){const session=createSession(ui.customerId,Object.fromEntries(data));state.sessions.push(session);save('Session created');ui.modal=null;render();return;}
  if(type==='usecase'){
    const customerId=data.get('customerId');let session=state.sessions.find(s=>s.customerId===customerId);if(!session){session=createSession(customerId);state.sessions.push(session);}
    const useCase=createUseCase(customerId,session.id,{title:data.get('title')||'Untitled opportunity',problem:data.get('problem')||''});useCase.answers.P01={state:data.get('title')?'answered':'unanswered',value:data.get('title')||''};useCase.answers.P02={state:data.get('problem')?'answered':'unanswered',value:data.get('problem')||''};state.useCases.push(useCase);save('Opportunity draft saved');ui.customerId=customerId;ui.useCaseId=useCase.id;ui.workshopMode='usecase';ui.questionIndex=0;ui.modal=null;navigate('workshop');return;
  }
  if(type==='action'){state.actions.push({id:makeId('act'),customerId:ui.customerId,useCaseIds:data.get('useCaseId')?[data.get('useCaseId')]:[],title:data.get('title'),kind:data.get('kind'),owner:data.get('owner'),dueDate:data.get('dueDate'),status:'Open',createdAt:isoNow()});save('Action added');ui.modal=null;render();return;}
  if(type==='outcome'){const useCase=state.useCases.find(c=>c.id===data.get('useCaseId'));useCase.outcomes.push({id:makeId('out'),measure:data.get('measure'),baseline:data.get('baseline'),target:data.get('target'),actual:data.get('actual'),unit:data.get('unit'),period:data.get('period'),evidence:data.get('evidence'),recordedAt:isoNow()});save('Outcome recorded');ui.modal=null;render();return;}
  if(type==='recommendation'){const rationale=data.get('rationale').trim();if(!rationale){showToast('A rationale is required.',true);return;}const useCase=selectedUseCase();const recommendation={label:data.get('label'),rationale,author:selectedCustomer()?.facilitator||'Facilitator',at:isoNow()};useCase.facilitatorRecommendation=recommendation;useCase.recommendationHistory.push(recommendation);state.audit.push({id:makeId('aud'),at:isoNow(),type:'recommendation',useCaseId:useCase.id,message:`Facilitator recommendation: ${recommendation.label}`});save('Recommendation recorded');ui.modal=null;render();return;}
  if(type==='approach'){const useCase=selectedUseCase();useCase.approach=data.get('approach');useCase.approachRationale=data.get('rationale');useCase.alternative=data.get('alternative');useCase.answers.A02={state:'answered',value:useCase.approach};useCase.answers.A03={state:useCase.approachRationale?'answered':'unanswered',value:useCase.approachRationale};save('Approach updated');ui.modal=null;render();return;}
  if(type==='risk'){const useCase=selectedUseCase();const record=Object.fromEntries(data);for(const key of ['likelihood','impact','residualLikelihood','residualImpact'])record[key]=record[key]?Number(record[key]):null;useCase.risks.push({id:makeId('rsk'),...record});useCase.explicitNoRisks=false;save('Risk added');ui.modal=null;render();return;}
  if(type==='financial'){const useCase=selectedUseCase();for(const name of ['conservative','central','optimistic']){useCase.financialScenarios[name]={};for(const [key,value] of data.entries())if(key.startsWith(`${name}.`))useCase.financialScenarios[name][key.split('.')[1]]=value;}const invalid=Object.values(useCase.financialScenarios).find(s=>!calculateFinancialScenario(s).valid);if(invalid){showToast(calculateFinancialScenario(invalid).error,true);return;}save('Business case updated');ui.modal=null;render();return;}
  if(type==='roadmap'){saveRoadmapForm(data);return;}
  if(type==='wave'){const wave=state.waves.find(w=>w.id===data.get('id'));for(const key of ['name','capacity','budget','startDate','endDate'])wave[key]=data.get(key);save('Wave updated');ui.modal=null;render();}
}

function saveRoadmapForm(data){
  const id=data.get('id')||makeId('road');const dependencies=data.getAll('dependencies');const existing=state.roadmapItems.find(item=>item.id===id);
  const baseItems=state.roadmapItems.map(item=>item.id===id?{...item,dependencies:[]}:item);
  for(const dependency of dependencies){const cycle=findDependencyCycle(baseItems,id,dependency);if(cycle){const names=cycle.map(cycleId=>state.roadmapItems.find(item=>item.id===cycleId)?.title||data.get('title')).join(' → ');showToast(`Dependency cycle rejected: ${names}`,true);return;}}
  const record={id,customerId:ui.customerId,title:data.get('title'),type:data.get('type'),waveId:data.get('waveId'),owner:data.get('owner'),status:data.get('status'),personDays:data.get('personDays'),cost:data.get('cost'),dependencies,useCaseIds:data.getAll('useCaseIds'),updatedAt:isoNow()};
  if(existing)Object.assign(existing,record);else state.roadmapItems.push({...record,createdAt:isoNow()});save('Roadmap item saved');ui.modal=null;render();
}

function saveSnapshot(){
  const customer=state.customers.find(c=>c.id===ui.reportCustomerId);const snapshot={id:makeId('snap'),customerId:customer.id,createdAt:isoNow(),methodologyVersion:METHODOLOGY_VERSION,customer:structuredClone(customer),sessions:structuredClone(customerSessions(customer.id)),useCases:structuredClone(customerCases(customer.id)),actions:structuredClone(state.actions.filter(a=>a.customerId===customer.id)),roadmapItems:structuredClone(state.roadmapItems.filter(i=>i.customerId===customer.id))};state.snapshots.push(snapshot);save('Decision snapshot saved');
}

function removeDemo(){
  const ids=new Set(state.customers.filter(c=>c.isDemo).map(c=>c.id));state.customers=state.customers.filter(c=>!ids.has(c.id));state.sessions=state.sessions.filter(s=>!ids.has(s.customerId));const useCaseIds=new Set(state.useCases.filter(c=>ids.has(c.customerId)).map(c=>c.id));state.useCases=state.useCases.filter(c=>!ids.has(c.customerId));state.actions=state.actions.filter(a=>!ids.has(a.customerId));state.roadmapItems=state.roadmapItems.filter(i=>!ids.has(i.customerId));state.waves=state.waves.filter(w=>!ids.has(w.customerId));state.snapshots=state.snapshots.filter(s=>!ids.has(s.customerId));state.audit.push({id:makeId('aud'),at:isoNow(),type:'demo-removed',message:`Removed demo records (${useCaseIds.size} opportunities)`});save('Demo records removed');render();
}

async function previewImport(file){
  try{const incoming=JSON.parse(await file.text());const validation=validateState(incoming);if(!validation.valid)throw new Error(validation.error);ui.modal={type:'import',incoming};render();}catch(error){showToast(`Import rejected: ${error.message}`,true);}
}

function applyImport(mode){
  const incoming=ui.modal.incoming;if(mode==='replace')state=structuredClone(incoming);else state=mergeStates(state,incoming);ui.modal=null;save(`Backup ${mode==='replace'?'restored':'merged'}`);navigate('customers');
}

function download(filename,content,type){
  const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),500);showToast(`${filename} exported`);
}

function csvCell(value){const text=String(value??'');return `"${text.replaceAll('"','""')}"`;}
function makeCsv(){
  const rows=[['Customer','Opportunity','Lifecycle status','Calculated classification','Value','Readiness','Confidence','Risk','Approach','Owner']];
  for(const useCase of state.useCases){const customer=state.customers.find(c=>c.id===useCase.customerId);const result=calculatedClassification(useCase);rows.push([customer?.name,useCase.title,useCase.lifecycleStatus,result.label,formatScore(result.value),formatScore(result.readiness),result.confidence,result.risk.band,useCase.approach,useCase.owner]);}
  return rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
}

function makeMarkdown(customerId){
  const customer=state.customers.find(c=>c.id===customerId);const cases=customerCases(customerId);const lines=[`# Prism decision portfolio: ${customer.name}`,'',`Prepared ${new Date().toISOString().slice(0,10)} · Methodology ${METHODOLOGY_VERSION}`,'','## Customer objectives','',...(customer.objectives?.length?customer.objectives.map(o=>`- ${o}`):['Not recorded.']),'','## Opportunities',''];
  for(const useCase of cases){const result=calculatedClassification(useCase);const central=calculateFinancialScenario(useCase.financialScenarios?.central||{});lines.push(`### ${useCase.title}`,'',useCase.problem||'Problem not recorded.','',`- Calculated recommendation: ${result.label}`,`- Value: ${formatScore(result.value)}`,`- Readiness: ${formatScore(result.readiness)}`,`- Evidence confidence: ${result.confidence}`,`- Risk: ${result.risk.band}`,`- Approach: ${useCase.approach||'Undecided'}`,`- Central capacity: ${central.valid&&central.capacityHours!==null?`${central.capacityHours.toFixed(0)} hours/year`:'Unknown'}`,'',...(result.reasons.length?['Outstanding validation:',...result.reasons.map(r=>`- ${r}`),'']:[]));}
  lines.push('## Methodology','',METHODOLOGY_TEXT,'','Records were exported from the local workshop edition; unknowns and provisional results are retained.');return lines.join('\n');
}

function slug(value){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}

render();
