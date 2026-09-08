import assert from 'node:assert/strict';
import {timelineEntries,yearAnchors,positionAtYear,yearAtPosition} from '../services/host/app/event-timeline.js';
const entries=timelineEntries([
  {id:'a',title:'1281 원정',lo:1281,hi:1281},
  {id:'a',sceneId:'port',title:'1274 합포',lo:1274,hi:1274},
  {id:'b',sceneId:'suncheon',title:'순천',lo:1948,hi:1948},
  {id:'b',sceneId:'yeosu',title:'여수',lo:1948,hi:1948},
]);
assert.deepEqual(entries.map(e=>e.lo),[1274,1281,1948,1948]);
assert.equal(new Set(entries.map(e=>e.key)).size,4);
const anchors=yearAnchors(entries);
assert.equal(anchors.at(-1).position,2.5,'Same-year locations share the year anchor but remain separate cards');
for(const year of [1274,1275,1281,1400,1948])assert.equal(yearAtPosition(anchors,positionAtYear(anchors,year)),year);
assert.equal(positionAtYear(anchors,-500),0);
assert.equal(yearAtPosition([],1),null);
assert.notEqual(yearAtPosition([{year:-1,position:0},{year:1,position:1}],.5),0,'The timeline cannot introduce year zero');
console.log('PASS: chronological cards, distinct places, year interpolation and BCE');
