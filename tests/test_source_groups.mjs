import test from 'node:test';
import assert from 'node:assert/strict';
import { groupSources, selectionOf, shortSourceLabel } from '../services/host/app/source-groups.js';

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

test('출처 설정 목록의 줄 이름은 발행처를 떼고 이름만 남긴다 (#205)', () => {
  assert.equal(shortSourceLabel({label: '평양 (Pyongyang) — 영어 위키백과 (English Wikipedia)'}), '평양 (Pyongyang)');
  assert.equal(shortSourceLabel({label: '수원 화성 (Hwaseong Fortress) — 유네스코 세계유산센터 (UNESCO World Heritage Centre)'}), '수원 화성 (Hwaseong Fortress)');
  assert.equal(shortSourceLabel({label: '삼국사기'}), '삼국사기');            // 발행처가 없으면 그대로
  assert.equal(shortSourceLabel({id: 'src-x'}), 'src-x');                      // 이름이 없으면 id
});
