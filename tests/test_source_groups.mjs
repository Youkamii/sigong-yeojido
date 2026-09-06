import test from 'node:test';
import assert from 'node:assert/strict';
import { groupSources, selectionOf } from '../services/host/app/source-groups.js';

test('small collections keep individual rows and order', () => {
  const sources = [{id: 'a', sourceGroup: '실록'}, {id: 'b', sourceGroup: '실록'}];
  assert.deepEqual(groupSources(sources).map(g => g.sources[0].id), ['a', 'b']);
  assert.ok(groupSources(sources).every(g => g.label === null));
});

test('groups retain every edition and distinguish partial selection', () => {
  const sources = [{id: 'original'}, ...Array.from({length: 30}, (_, i) => ({id: `s${i}`, sourceGroup: '실록'}))];
  const groups = groupSources(sources);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.flatMap(g => g.sources), sources);
  const editions = groups[1].sources;
  assert.equal(selectionOf(editions, new Set()), 'false');
  assert.equal(selectionOf(editions, new Set(['s0'])), 'mixed');
  assert.equal(selectionOf(editions, new Set(editions.map(s => s.id))), 'true');
});
