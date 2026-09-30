export const METHODOLOGY_VERSION = 'prism-v1';

export const VALUE_WEIGHTS = { V01: 0.5, V02: 0.2, V03: 0.15, V04: 0.15 };
export const READINESS_WEIGHTS = { R01: 0.3, R02: 0.25, R03: 0.25, R04: 0.2 };

export function normaliseScore(value) {
  if (!Number.isInteger(value) || value < 1 || value > 5) return null;
  return ((value - 1) / 4) * 100;
}

export function axisScore(answers = {}, weights) {
  let score = 0;
  let answered = 0;
  for (const [id, weight] of Object.entries(weights)) {
    const answer = answers[id];
    const normalised = answer?.state === 'answered' ? normaliseScore(Number(answer.value)) : null;
    if (normalised === null) continue;
    score += normalised * weight;
    answered += 1;
  }
  const complete = answered === Object.keys(weights).length;
  const missingWeight = Object.entries(weights)
    .filter(([id]) => answers[id]?.state !== 'answered' || normaliseScore(Number(answers[id]?.value)) === null)
    .reduce((total, [, weight]) => total + weight, 0);
  return {
    complete,
    answered,
    total: Object.keys(weights).length,
    score: complete ? score : null,
    lower: score,
    upper: score + missingWeight * 100
  };
}

export function evidenceConfidence(answers = {}) {
  const coreIds = [...Object.keys(VALUE_WEIGHTS), ...Object.keys(READINESS_WEIGHTS)];
  const levels = coreIds.map((id) => {
    const answer = answers[id];
    if (answer?.confidence === 'high' && !String(answer.evidence || '').trim() && !String(answer.source || '').trim()) return 'unassessed';
    return answer?.confidence || 'unassessed';
  });
  if (levels.includes('unassessed')) return 'Unassessed';
  if (levels.includes('low')) return 'Low';
  if (levels.every((level) => level === 'high')) return 'High';
  return levels.every((level) => level === 'high' || level === 'medium') ? 'Medium' : 'Unassessed';
}

export function riskSeverity(likelihood, impact) {
  const score = Number(likelihood) * Number(impact);
  if (!Number.isFinite(score) || score < 1) return null;
  const band = score <= 4 ? 'Low' : score <= 9 ? 'Moderate' : score <= 16 ? 'High' : 'Critical';
  return { score, band };
}

export function portfolioRisk(risks = [], explicitNone = false) {
  if (!risks.length) return explicitNone
    ? { complete: true, score: 0, band: 'Low', provisional: false }
    : { complete: false, score: null, band: 'Unassessed', provisional: false };
  let maximum = null;
  let provisional = false;
  for (const risk of risks) {
    const hasResidual = Number(risk.residualLikelihood) > 0 && Number(risk.residualImpact) > 0;
    const severity = hasResidual
      ? riskSeverity(risk.residualLikelihood, risk.residualImpact)
      : riskSeverity(risk.likelihood, risk.impact);
    if (!hasResidual) provisional = true;
    if (severity && (!maximum || severity.score > maximum.score)) maximum = severity;
  }
  return maximum ? { complete: !provisional, ...maximum, provisional } : { complete: false, score: null, band: 'Unassessed', provisional };
}

export function calculatedClassification({
  answers = {}, gates = [], risks = [], explicitNoRisks = false, approach = '', stopped = false, stopType = 'Park'
} = {}) {
  const value = axisScore(answers, VALUE_WEIGHTS);
  const readiness = axisScore(answers, READINESS_WEIGHTS);
  const confidence = evidenceConfidence(answers);
  const risk = portfolioRisk(risks, explicitNoRisks);
  const reasons = [];

  if (stopped) return { label: 'Park or reject', disposition: stopType, reasons: ['Facilitator or customer decision to stop'], value, readiness, confidence, risk };

  const blocked = gates.filter((gate) => gate.status === 'blocked');
  if (blocked.length) {
    reasons.push(...blocked.map((gate) => `${gate.name || 'Required gate'} is blocked`));
    return { label: 'Build foundations', reasons, value, readiness, confidence, risk };
  }

  const unknownGates = gates.filter((gate) => !gate.status || gate.status === 'unknown');
  if (unknownGates.length) reasons.push(...unknownGates.map((gate) => `${gate.name || 'Required gate'} needs a decision`));
  if (!value.complete || !readiness.complete) reasons.push('Core scoring is incomplete');
  if (!approach || approach === 'undecided') reasons.push('Approach is undecided');
  if (!risk.complete) reasons.push('Risk assessment is incomplete');
  if (risk.band === 'High' || risk.band === 'Critical') reasons.push(`${risk.band} residual risk requires review`);
  if (confidence === 'Low' || confidence === 'Unassessed') reasons.push(`${confidence} evidence confidence requires validation`);
  if (reasons.length) return { label: 'Validate first', reasons, value, readiness, confidence, risk };

  const highValue = value.score >= 60;
  const ready = readiness.score >= 60;
  if (highValue && ready) return { label: 'Pilot now', reasons: ['High value and sufficient readiness'], value, readiness, confidence, risk };
  if (highValue) return { label: 'Build foundations', reasons: ['High value with readiness below 60'], value, readiness, confidence, risk };
  if (ready) return { label: 'Local improvement', reasons: ['Readiness is sufficient; value is below 60'], value, readiness, confidence, risk };
  return { label: 'Park or reject', disposition: 'Park', reasons: ['Value and readiness are below 60; review later'], value, readiness, confidence, risk };
}

export function calculateFinancialScenario(input = {}) {
  const number = (value) => value === '' || value === null || value === undefined ? null : Number(value);
  const volume = number(input.annualVolume);
  const currentMinutes = number(input.currentMinutes);
  const futureMinutes = number(input.futureMinutes);
  const adoption = number(input.adoptionPercent);
  const hourlyCost = number(input.hourlyCost);
  const cashSavings = number(input.cashSavings);
  const contributionMargin = number(input.contributionMargin);
  const qualityBenefit = number(input.qualityBenefit);
  const recurringCost = number(input.recurringCost);
  const oneOffCost = number(input.oneOffCost);
  const benefitMonths = number(input.benefitMonths);
  const operatingMonths = number(input.operatingMonths);

  const invalid = [volume, currentMinutes, futureMinutes, hourlyCost, cashSavings, contributionMargin, qualityBenefit, recurringCost, oneOffCost]
    .some((value) => value !== null && value < 0) || (adoption !== null && (adoption < 0 || adoption > 100));
  if (invalid) return { valid: false, error: 'Values must be non-negative and adoption must be between 0 and 100.' };

  const capacityKnown = [volume, currentMinutes, futureMinutes, adoption].every((value) => value !== null);
  const netMinutes = currentMinutes !== null && futureMinutes !== null ? currentMinutes - futureMinutes : null;
  const capacityHours = capacityKnown ? volume * netMinutes / 60 * (adoption / 100) : null;
  const capacityValue = capacityHours !== null && hourlyCost !== null ? capacityHours * hourlyCost : null;
  const realisedKnown = [cashSavings, contributionMargin, qualityBenefit].every((value) => value !== null);
  const annualRealisedBenefit = realisedKnown ? cashSavings + contributionMargin + qualityBenefit : null;
  const annualNetBenefit = annualRealisedBenefit !== null && recurringCost !== null ? annualRealisedBenefit - recurringCost : null;
  const firstYearKnown = annualRealisedBenefit !== null && recurringCost !== null && oneOffCost !== null && benefitMonths !== null && operatingMonths !== null;
  const firstYearNetBenefit = firstYearKnown
    ? annualRealisedBenefit * (benefitMonths / 12) - recurringCost * (operatingMonths / 12) - oneOffCost
    : null;
  const paybackMonths = oneOffCost !== null && annualNetBenefit !== null && annualNetBenefit > 0 ? oneOffCost / annualNetBenefit * 12 : null;
  return { valid: true, netMinutes, capacityHours, capacityValue, annualRealisedBenefit, annualNetBenefit, firstYearNetBenefit, paybackMonths };
}

export function findDependencyCycle(items = [], proposedFrom, proposedTo) {
  const links = new Map(items.map((item) => [item.id, [...(item.dependencies || [])]]));
  if (!links.has(proposedFrom)) links.set(proposedFrom, []);
  links.get(proposedFrom).push(proposedTo);
  const visited = new Set();
  const active = new Set();
  const path = [];
  let cycle = null;
  function walk(id) {
    if (active.has(id)) {
      cycle = [...path.slice(path.indexOf(id)), id];
      return true;
    }
    if (visited.has(id)) return false;
    visited.add(id); active.add(id); path.push(id);
    for (const dependency of links.get(id) || []) if (walk(dependency)) return true;
    active.delete(id); path.pop();
    return false;
  }
  for (const id of links.keys()) if (walk(id)) break;
  return cycle;
}

export function topologicalOrder(items = []) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const visited = new Set();
  const output = [];
  function visit(item) {
    if (visited.has(item.id)) return;
    visited.add(item.id);
    for (const id of item.dependencies || []) if (byId.has(id)) visit(byId.get(id));
    output.push(item);
  }
  items.forEach(visit);
  return output;
}

export function waveCapacity(items = [], waves = []) {
  return waves.map((wave) => {
    const selected = items.filter((item) => item.waveId === wave.id);
    const knownEffort = selected.filter((item) => item.personDays !== '' && item.personDays !== null && item.personDays !== undefined);
    const effort = knownEffort.reduce((sum, item) => sum + Number(item.personDays), 0);
    const cost = selected.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    return {
      ...wave,
      effort,
      cost,
      complete: knownEffort.length === selected.length,
      overEffort: wave.capacity !== '' && wave.capacity !== null && Number(wave.capacity) < effort,
      overBudget: wave.budget !== '' && wave.budget !== null && Number(wave.budget) < cost,
      itemIds: selected.map((item) => item.id)
    };
  });
}

export function formatScore(axis) {
  return axis.complete ? axis.score.toFixed(1) : `${axis.lower.toFixed(1)}–${axis.upper.toFixed(1)}`;
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
