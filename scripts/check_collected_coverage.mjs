import {readFile,writeFile} from 'node:fs/promises';
import {contextAt,REFERENCE_GROUPS} from '../services/host/app/chronicle.js';
const data=JSON.parse(await readFile(process.argv[2],'utf8'));
data.claims=data.claims.filter(c=>REFERENCE_GROUPS.some(g=>g.matches({id:c.fromSource})));
const years=[-57,1,100,200,300,414,540,660,676,698,800,918,1000,1100,1200,1300,1392,1446,1500,1593,1636,1700,1800,1897,1919,1945,1950,1960,1980,2000,2010,2020,2025];
const samples=years.map(year=>{const c=contextAt(data,year);return {year,people:c.people.map(p=>p.label),events:c.allEvents.filter(e=>e.current).map(e=>e.label)};});
const report={claims:data.claims.length,samples};
await writeFile(process.argv[3],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(samples.map(s=>({year:s.year,people:s.people.length,events:s.events.length}))));
