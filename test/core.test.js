import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VALUE_WEIGHTS, READINESS_WEIGHTS, axisScore, calculatedClassification, calculateFinancialScenario,
  evidenceConfidence, findDependencyCycle, portfolioRisk, riskSeverity, waveCapacity
} from '../core.js';

const answer = (value, confidence = 'medium') => ({ state: 'answered', value, confidence, evidence: 'Named evidence' });
const scores = (value) => Object.fromEntries(['V01','V02','V03','V04','R01','R02','R03','R04'].map((id) => [id, answer(value)]));
const gates = () => ['data','policy','owner','control'].map((name) => ({ name, status: 'clear' }));
const assessed = (answers, extra = {}) => ({ answers, gates: gates(), risks: [], explicitNoRisks: true, approach: 'analytics', ...extra });

test('all eight 5s produce value and readiness 100', () => {
  assert.equal(axisScore(scores(5), VALUE_WEIGHTS).score, 100);
  assert.equal(axisScore(scores(5), READINESS_WEIGHTS).score, 100);
});

test('all eight 1s produce value and readiness 0', () => {
  assert.equal(axisScore(scores(1), VALUE_WEIGHTS).score, 0);
  assert.equal(axisScore(scores(1), READINESS_WEIGHTS).score, 0);
});

test('all eight 3s produce value and readiness 50', () => {
  assert.equal(axisScore(scores(3), VALUE_WEIGHTS).score, 50);
  assert.equal(axisScore(scores(3), READINESS_WEIGHTS).score, 50);
});

test('weighted value fixture is 67.5', () => {
  const answers = { V01: answer(5), V02: answer(3), V03: answer(3), V04: answer(1) };
  assert.equal(axisScore(answers, VALUE_WEIGHTS).score, 67.5);
});

test('unknown V01 yields range 17.5–67.5 and 3/4 answered', () => {
  const answers = { V01: { state: 'unknown', value: null }, V02: answer(3), V03: answer(3), V04: answer(1) };
  const result = axisScore(answers, VALUE_WEIGHTS);
  assert.deepEqual({ complete: result.complete, lower: result.lower, upper: result.upper, answered: result.answered }, { complete: false, lower: 17.5, upper: 67.5, answered: 3 });
});

test('exact 60 thresholds classify Pilot now', () => {
  const answers = { V01:answer(4),V02:answer(4),V03:answer(2),V04:answer(2),R01:answer(5),R02:answer(3),R03:answer(3),R04:answer(2) };
  const result = calculatedClassification(assessed(answers));
  assert.equal(result.value.score, 60);
  assert.equal(result.readiness.score, 60);
  assert.equal(result.label, 'Pilot now');
});

test('blocked gate takes precedence over high scores', () => {
  const input = assessed(scores(5)); input.gates[0].status = 'blocked';
  assert.equal(calculatedClassification(input).label, 'Build foundations');
});

test('unknown gate requires validation', () => {
  const input = assessed(scores(5)); input.gates[0].status = 'unknown';
  assert.equal(calculatedClassification(input).label, 'Validate first');
});

test('low confidence requires validation without reducing value', () => {
  const answers = scores(5); answers.V01.confidence = 'low';
  const result = calculatedClassification(assessed(answers));
  assert.equal(result.label, 'Validate first');
  assert.equal(result.value.score, 100);
});

test('quadrants classify high/low value and readiness', () => {
  const mixed = (value, readiness) => Object.fromEntries([
    ...['V01','V02','V03','V04'].map((id)=>[id,answer(value)]),
    ...['R01','R02','R03','R04'].map((id)=>[id,answer(readiness)])
  ]);
  assert.equal(calculatedClassification(assessed(mixed(5,2))).label, 'Build foundations');
  assert.equal(calculatedClassification(assessed(mixed(2,5))).label, 'Local improvement');
  assert.equal(calculatedClassification(assessed(mixed(2,2))).label, 'Park or reject');
});

test('high residual risk requires validation', () => {
  const risks = [{ likelihood: 5, impact: 5, residualLikelihood: 4, residualImpact: 4 }];
  const result = calculatedClassification(assessed(scores(5), { risks, explicitNoRisks: false }));
  assert.deepEqual(riskSeverity(4,4), { score: 16, band: 'High' });
  assert.equal(result.label, 'Validate first');
});

test('empty risk register remains incomplete without explicit review', () => {
  assert.equal(portfolioRisk([], false).complete, false);
  assert.equal(calculatedClassification(assessed(scores(5), { explicitNoRisks: false })).label, 'Validate first');
});

test('productivity fixture keeps capacity distinct from cash', () => {
  const result = calculateFinancialScenario({ annualVolume:12000,currentMinutes:10,futureMinutes:6,adoptionPercent:75,hourlyCost:30,cashSavings:0,contributionMargin:0,qualityBenefit:0,recurringCost:0,oneOffCost:0,benefitMonths:12,operatingMonths:12 });
  assert.equal(result.capacityHours, 600);
  assert.equal(result.capacityValue, 18000);
  assert.equal(result.annualRealisedBenefit, 0);
  assert.equal(result.paybackMonths, null);
});

test('zero or negative annual benefit has no positive payback', () => {
  assert.equal(calculateFinancialScenario({ cashSavings:0,contributionMargin:0,qualityBenefit:0,recurringCost:0,oneOffCost:100 }).paybackMonths, null);
  assert.equal(calculateFinancialScenario({ cashSavings:10,contributionMargin:0,qualityBenefit:0,recurringCost:20,oneOffCost:100 }).paybackMonths, null);
});

test('dependency cycle A to B to C to A is reported', () => {
  const items=[{id:'A',dependencies:[]},{id:'B',dependencies:['A']},{id:'C',dependencies:['B']}];
  assert.deepEqual(findDependencyCycle(items,'A','C'),['A','C','B','A']);
});

test('shared roadmap item is costed once and unknown effort is visible', () => {
  const waves=[{id:'w',capacity:5,budget:50}];
  const items=[{id:'f',waveId:'w',personDays:8,cost:40,useCaseIds:['a','b','c']},{id:'x',waveId:'w',personDays:'',cost:5}];
  const result=waveCapacity(items,waves)[0];
  assert.equal(result.effort,8);
  assert.equal(result.cost,45);
  assert.equal(result.complete,false);
  assert.equal(result.overEffort,true);
});

test('confidence uses the conservative rule', () => {
  const answers=scores(5);assert.equal(evidenceConfidence(answers),'Medium');answers.V01.confidence='unassessed';assert.equal(evidenceConfidence(answers),'Unassessed');
});

test('high confidence without a linked source or evidence is unassessed', () => {
  const answers=scores(5);for(const answerValue of Object.values(answers)){answerValue.confidence='high';answerValue.evidence='';delete answerValue.source;}
  assert.equal(evidenceConfidence(answers),'Unassessed');
});
