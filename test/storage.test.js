import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageAdapter, blankState, createCustomer, createSession, createUseCase, mergeStates, validateState } from '../storage.js';

class MemoryStorage {
  value = null;
  getItem() { return this.value; }
  setItem(_key, value) { this.value = value; }
  removeItem() { this.value = null; }
}

test('local adapter preserves customers, answers, notes and roadmap on reload', () => {
  const storage=new MemoryStorage();const adapter=new LocalStorageAdapter(storage);const state=blankState();
  const customer=createCustomer({name:'Acme'});const session=createSession(customer.id);const useCase=createUseCase(customer.id,session.id,{title:'Test'});
  useCase.answers.V01={state:'unknown',value:null};useCase.notes.P02='Facilitator note';
  state.customers.push(customer);state.sessions.push(session);state.useCases.push(useCase);state.roadmapItems.push({id:'road_1',customerId:customer.id,title:'Foundation',dependencies:[],useCaseIds:[useCase.id]});
  adapter.save(state);const restored=adapter.load();
  assert.equal(restored.customers[0].name,'Acme');
  assert.deepEqual(restored.useCases[0].answers.V01,{state:'unknown',value:null});
  assert.deepEqual(restored.roadmapItems[0].useCaseIds,[useCase.id]);
});

test('export/import round trip validates stable IDs, links and null states', () => {
  const state=blankState();const customer=createCustomer({name:'Round trip'});const session=createSession(customer.id);const useCase=createUseCase(customer.id,session.id);
  useCase.answers.R01={state:'unknown',value:null};state.customers.push(customer);state.sessions.push(session);state.useCases.push(useCase);
  const parsed=JSON.parse(JSON.stringify(state));assert.equal(validateState(parsed).valid,true);assert.equal(parsed.useCases[0].customerId,customer.id);assert.equal(parsed.useCases[0].answers.R01.value,null);
});

test('malformed import is rejected without changing current state', () => {
  const state=blankState();state.customers.push(createCustomer({name:'Keep me'}));
  const before=JSON.stringify(state);const result=validateState({...state,useCases:'invalid'});
  assert.equal(result.valid,false);assert.equal(JSON.stringify(state),before);
});

test('merge does not duplicate stable IDs', () => {
  const first=blankState();const customer=createCustomer({name:'One'});first.customers.push(customer);const second=structuredClone(first);
  assert.equal(mergeStates(first,second).customers.length,1);
});
