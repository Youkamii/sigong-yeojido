import assert from 'node:assert/strict';
import {activityGeography} from '../services/host/app/activity-geography.js';
import {readFile} from 'node:fs/promises';
const packets=JSON.parse(await readFile(new URL('../services/host/app/history-scenes.json',import.meta.url),'utf8')).scenes;
const labels=year=>activityGeography({year,events:packets.filter(s=>s.startYear<=year&&year<=s.endYear).map(s=>({
  entityId:s.eventId,label:s.title,archetype:s.kind,scenePlace:s.place&&{...s.place,coordinates:[s.place.lon,s.place.lat]}
}))}).filter(p=>p.capital).map(p=>p.label).join(' ');
assert.match(labels(500),/웅진/);assert.doesNotMatch(labels(500),/사비/);
assert.match(labels(600),/사비/);assert.doesNotMatch(labels(600),/웅진/);
assert.match(labels(1240),/강화/);assert.doesNotMatch(labels(1240),/개경/);
assert.match(labels(1300),/개경/);assert.doesNotMatch(labels(1300),/강화/);
assert.match(labels(1500),/한성/);assert.doesNotMatch(labels(1500),/서울특별시/);
assert.deepEqual(activityGeography({year:1500,events:[]}),[]);
console.log('PASS: sourced capital periods and relocation, historical names and empty source selection');
