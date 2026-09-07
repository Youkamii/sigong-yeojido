import {readFile} from 'node:fs/promises';
import {datedClaims,contextAt} from '../services/host/app/chronicle.js';
const data=JSON.parse(await readFile(process.argv[2],'utf8')),dates=datedClaims(data),warnings=[];
const events=contextAt(data,1593).allEvents;
for(const event of events){
  for(const relation of data.claims.filter(c=>c.subject===event.id&&['syj:hasParticipant','syj:ledBy'].includes(c.predicate)&&c.object.kind==='entity')){
    const person=relation.object.id,births=dates.filter(d=>d.claim.subject===person&&d.claim.predicate==='syj:bornIn'),deaths=dates.filter(d=>d.claim.subject===person&&d.claim.predicate==='syj:diedIn');
    if(deaths.length&&deaths.every(d=>d.hi<event.lo)||births.length&&births.every(d=>d.lo>event.hi))warnings.push({event:event.id,year:event.lo,person,relation:relation.id,quote:relation.quote});
  }
}
console.log(JSON.stringify({warnings},null,2));
if(warnings.length)process.exitCode=1;
