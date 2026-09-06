import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { activeAt, candActive, originMatches, outsideCandidates, inDiorama } from '../services/host/app/place-state.js';

test('date boundaries and undated candidates are shared', () => {
  assert.equal(candActive({validFrom:-18, validTo:475}, -18), true);
  assert.equal(candActive({validFrom:-18, validTo:475}, 475), true);
  assert.equal(candActive({validFrom:-18, validTo:475}, 476), false);
  assert.equal(candActive({}, 414), true);
});

test('place and candidate periods must both contain the year', () => {
  const p = {validFrom:1, validTo:668, candidates:[{validFrom:200, validTo:314}, {validFrom:475, validTo:668}]};
  for(const [year, expected] of [[0,false],[200,true],[314,true],[400,false],[475,true],[669,false]])
    assert.equal(activeAt(p, year), expected, String(year));
  assert.equal(activeAt({candidates:[]}, 414), true);
});

test('source omission, all-off and matching selection have distinct behavior', () => {
  const p = {mentions:{a:2}, candidates:[]};
  assert.equal(activeAt(p, 414, null), true);
  assert.equal(activeAt(p, 414, new Set()), false);
  assert.equal(activeAt(p, 414, new Set(['b'])), false);
  assert.equal(activeAt(p, 414, new Set(['a'])), true);
  assert.equal(activeAt({candidates:[]}, 414, new Set()), false);
  assert.equal(activeAt({candidates:[]}, 414, new Set(['a'])), true);
});

test('a researched place remains scoped to its source even without text matches', () => {
  const p = {sourceId:'src-goryeosa', mentions:{}, candidates:[]};
  assert.equal(activeAt(p, 918, new Set(['src-samgukyusa'])), false);
  assert.equal(activeAt(p, 918, new Set(['src-goryeosa'])), true);
  assert.equal(activeAt(p, 918, new Set()), false);
});

test('origin filter inherits provenance without treating missing authorship as human', () => {
  const p = {origin:'ai', candidates:[{validFrom:400, validTo:500}, {origin:'human',validFrom:500,validTo:600}]};
  assert.equal(originMatches(p.candidates[0], 'human', p), false);
  assert.equal(originMatches(p.candidates[1], 'human', p), true);
  assert.equal(originMatches({}, 'human'), false);
  assert.equal(activeAt(p, 414, null, 'human'), false);
  assert.equal(activeAt(p, 550, null, 'human'), true);
  assert.equal(activeAt(p, 550, new Set(), 'human'), false);
  assert.equal(activeAt(p, 414, null, 'all'), true);
});

test('outside candidates retain dates, sources and authorship instead of vanishing', () => {
  const p = {id:'nangnang',sourceId:'s',origin:'ai',candidates:[
    {lon:125.75,lat:39.02}, {lon:120.5,lat:41.5,validFrom:-108,validTo:313}
  ]};
  assert.equal(inDiorama({lon:123,lat:43.5}), true);
  const rows = outsideCandidates([p],100,new Set(['s']));
  assert.equal(rows.length,1);
  assert.equal(rows[0].candidate,p.candidates[1]);
  assert.equal(outsideCandidates([p],414,new Set(['s'])).length,0);
  assert.equal(outsideCandidates([p],100,new Set()).length,0);
  assert.equal(outsideCandidates([p],100,new Set(['s']),'human').length,0);
});
