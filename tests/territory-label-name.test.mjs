import test from 'node:test';
import assert from 'node:assert/strict';
import {territoryName} from '../services/host/app/territory-label-geometry.js';

test('territory names retain Korean parenthetical separators and remove only the English suffix',()=>{
  for(const [label,expected] of [
    ['조선 (일제강점기 · 조선총독부 관할) · Korea under Japanese rule','조선 (일제강점기 · 조선총독부 관할)'],
    ['38도선 이남 (미군정) · US Army Military Government in Korea','38도선 이남 (미군정)'],
    ['대한제국 · Korean Empire','대한제국'],
    ['조선','조선'],
  ])assert.equal(territoryName({properties:{label}}),expected);
});
