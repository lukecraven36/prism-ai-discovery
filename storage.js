export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'prism-workspace-v1';

const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;

export function blankState() {
  return { schemaVersion: SCHEMA_VERSION, customers: [], sessions: [], useCases: [], actions: [], roadmapItems: [], waves: [], snapshots: [], audit: [], updatedAt: now() };
}

export function createCustomer(values = {}) {
  const timestamp = now();
  return {
    id: id('cus'), name: values.name || 'New customer', industry: values.industry || '', scale: values.scale || '',
    contactEmail: values.contactEmail || '', currency: values.currency || 'GBP', facilitator: values.facilitator || '',
    context: {}, objectives: [], archived: false, isDemo: Boolean(values.isDemo), createdAt: timestamp, updatedAt: timestamp
  };
}

export function createSession(customerId, values = {}) {
  const timestamp = now();
  return { id: id('ses'), customerId, title: values.title || 'Discovery workshop', date: values.date || timestamp.slice(0, 10), facilitator: values.facilitator || '', participants: values.participants || '', notes: '', status: 'Draft', createdAt: timestamp, updatedAt: timestamp };
}

export function createUseCase(customerId, sessionId, values = {}) {
  const timestamp = now();
  return {
    id: id('use'), customerId, sessionId, title: values.title || 'Untitled opportunity', problem: values.problem || '',
    answers: {}, approach: '', approachRationale: '', alternative: '', notes: {}, gates: [], risks: [], explicitNoRisks: false,
    financialScenarios: { conservative: {}, central: {}, optimistic: {} }, owner: '', lifecycleStatus: 'Draft',
    facilitatorRecommendation: null, recommendationHistory: [], outcomes: [], methodologyVersion: 'prism-v1',
    stopped: false, stopType: 'Park', createdAt: timestamp, updatedAt: timestamp
  };
}

export function demoState() {
  const state = blankState();
  const customer = createCustomer({ name: 'Northstar Services (Demo)', industry: 'Professional services', scale: '450 people', currency: 'GBP', facilitator: 'Demo facilitator', isDemo: true });
  customer.objectives = ['Reduce client onboarding delay', 'Improve service quality visibility'];
  customer.context = { C01: { state: 'answered', value: customer.objectives.join('\n') }, C02: { state: 'answered', value: 'New-client documents are checked and re-keyed across teams.' } };
  const session = createSession(customer.id, { title: 'AI opportunity discovery (Demo)', facilitator: 'Demo facilitator' });
  const useCase = createUseCase(customer.id, session.id, { title: 'Faster onboarding document checks', problem: 'Operations staff manually inspect and re-key onboarding documents.' });
  useCase.approach = 'combination';
  useCase.approachRationale = 'Simplify the process, then evaluate document extraction with human review.';
  useCase.alternative = 'Rules-based forms and standard automation';
  const scores = { V01: 4, V02: 4, V03: 4, V04: 3, R01: 3, R02: 3, R03: 4, R04: 3 };
  for (const [questionId, value] of Object.entries(scores)) useCase.answers[questionId] = { state: 'answered', value, confidence: 'medium', evidence: 'Demo workshop estimate', source: 'Demo fixture', capturedDate: now().slice(0, 10) };
  useCase.gates = ['Essential data-use permissions', 'Security, privacy and policy approval', 'Accountable delivery and operating owner', 'Safe evaluation and control route'].map((name) => ({ name, status: 'clear', reason: 'Demo assessment' }));
  useCase.explicitNoRisks = true;
  state.customers.push(customer); state.sessions.push(session); state.useCases.push(useCase);
  state.audit.push({ id: id('aud'), at: now(), type: 'demo-created', message: 'Created labelled demo records' });
  return state;
}

export function validateState(candidate) {
  if (!candidate || typeof candidate !== 'object') return { valid: false, error: 'Backup must contain a JSON object.' };
  if (candidate.schemaVersion !== SCHEMA_VERSION) return { valid: false, error: `Unsupported schema version: ${candidate.schemaVersion ?? 'missing'}.` };
  for (const key of ['customers', 'sessions', 'useCases', 'actions', 'roadmapItems', 'waves', 'snapshots', 'audit']) {
    if (!Array.isArray(candidate[key])) return { valid: false, error: `Backup field “${key}” must be an array.` };
  }
  const ids = new Set();
  for (const collection of ['customers', 'sessions', 'useCases', 'actions', 'roadmapItems']) {
    for (const record of candidate[collection]) {
      if (!record?.id || typeof record.id !== 'string') return { valid: false, error: `A ${collection} record has no stable ID.` };
      if (ids.has(record.id)) return { valid: false, error: `Duplicate record ID: ${record.id}.` };
      ids.add(record.id);
    }
  }
  for (const useCase of candidate.useCases) {
    for (const [questionId, answer] of Object.entries(useCase.answers || {})) {
      if (/^[VR]0[1-4]$/.test(questionId) && answer.state === 'answered' && (!Number.isInteger(Number(answer.value)) || Number(answer.value) < 1 || Number(answer.value) > 5)) {
        return { valid: false, error: `Unsupported score for ${questionId}.` };
      }
    }
  }
  return { valid: true };
}

export class LocalStorageAdapter {
  constructor(storage = globalThis.localStorage) { this.storage = storage; }
  load() {
    const raw = this.storage?.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    try {
      const parsed = JSON.parse(raw);
      const result = validateState(parsed);
      if (!result.valid) throw new Error(result.error);
      return parsed;
    } catch (error) {
      throw new Error(`Saved data could not be loaded: ${error.message}`);
    }
  }
  save(state) {
    const candidate = { ...state, schemaVersion: SCHEMA_VERSION, updatedAt: now() };
    const result = validateState(candidate);
    if (!result.valid) throw new Error(result.error);
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(candidate));
    return candidate;
  }
  clear() { this.storage?.removeItem(STORAGE_KEY); }
}

export function mergeStates(current, incoming) {
  const result = structuredClone(current);
  for (const key of ['customers', 'sessions', 'useCases', 'actions', 'roadmapItems', 'waves', 'snapshots', 'audit']) {
    const known = new Set(result[key].map((record) => record.id));
    for (const record of incoming[key]) if (!known.has(record.id)) result[key].push(record);
  }
  return result;
}

export function makeId(prefix) { return id(prefix); }
export function isoNow() { return now(); }
