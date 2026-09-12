import test from 'node:test';
import assert from 'node:assert/strict';
import {eras,eraAt} from '../services/host/app/atlas-eras.js';
test('1910~1944 selects 일제강점기, not 대한제국',()=>{
 assert.equal(eraAt(1909)[1],'대한제국');
 for(const y of [1910,1925,1944]) assert.equal(eraAt(y)[1],'일제강점기');
 assert.equal(eraAt(1945)[1],'현대');
 assert.equal(eraAt(-3000)[1],'고대');
});
test('eras are sorted by start year',()=>{
 for(let i=1;i<eras.length;i++) assert.ok(eras[i-1][0]<eras[i][0]);
});
