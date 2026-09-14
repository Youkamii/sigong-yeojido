// 모든 장면 패킷을 실제 조립기로 조립해 "어떤 모형이 나오는지"를 표로 뽑는다 (#186 재검사).
// 사용: node scripts/audit_scene_models.mjs [--items-only] [--out docs/research/scene-model-audit-186.json]
// 기본 사료 선택과 같은 조건(로드된 주장·개체 없음)으로 조립한다. 항목 인물 장면의 주인공은 이 조건에서도 조형된다.
import fs from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return s==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:n(s,c);}});
globalThis.document={createElement:()=>({getContext:()=>new Proxy({getImageData:()=>({data:new Uint8ClampedArray(512*512*4)})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const THREE=await import('three');
const {composeHistoricalEvent}=await import('../services/host/app/chronicle-event-scenes.js');
const {planChronicleAssets}=await import('../services/host/app/chronicle-asset-plan.js');
const {contextAt}=await import('../services/host/app/chronicle.js');

const args=process.argv.slice(2);
const itemsOnly=args.includes('--items-only');
const out=args.includes('--out')?args[args.indexOf('--out')+1]:null;
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const {scenes}=read('../services/host/app/history-scenes.json');
const world={contains:()=>true,surfaceAt:()=>10,toWorld:(x,z)=>[x,z],ground:[],sky:[],time:null,cata:null};
const rows=[];
for(const packet of scenes){
  if(itemsOnly&&!packet.itemId)continue;
  if(packet.supersededBy||packet.narrativeType)continue;
  const data={entities:[],claims:[],scenePackets:[packet]};
  let event=null,error=null,scene=null;
  try{
    const context=contextAt(data,packet.startYear,0);
    event=planChronicleAssets(context,data,[],[],[packet]).events.find(e=>e.id===packet.id)||null;
    if(event)scene=composeHistoricalEvent(event,new THREE.Vector3(0,10,0),world);
  }catch(e){error=String(e).slice(0,200);}
  const models=scene?scene.models.map(m=>m.archetype):[];
  const primary=scene?.models.find(m=>m.primary)?.archetype||null;
  rows.push({id:packet.id,itemId:packet.itemId||null,title:packet.title,kind:packet.kind,heritageType:packet.heritageType||null,
    setting:packet.place?.setting||null,medium:packet.place?.medium||null,sceneFunction:packet.sceneFunction||null,
    participants:(packet.participants||[]).map(p=>p.role),groups:(packet.participantGroups||[]).map(g=>g.role),
    planned:!!event,located:!!event?.scenePlace,compositionKind:scene?.compositionKind||null,primary,
    models:Object.entries(models.reduce((c,a)=>(c[a]=(c[a]||0)+1,c),{})).map(([a,n])=>n>1?`${a}×${n}`:a),error});
}
const summary={};
for(const r of rows){
  const key=[r.kind,r.heritageType||'',r.setting||'',r.compositionKind||'',r.primary||'(none)'].join('|');
  (summary[key]??={count:0,examples:[]}).count++;
  if(summary[key].examples.length<3)summary[key].examples.push(r.title.slice(0,20));
}
const report={generated:'audit_scene_models.mjs',packets:rows.length,errors:rows.filter(r=>r.error).length,
  classes:Object.entries(summary).sort((a,b)=>b[1].count-a[1].count).map(([key,v])=>({key,...v})),rows};
if(out)fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({packets:rows.length,errors:report.errors,classes:report.classes.length}));
for(const c of report.classes)console.log(String(c.count).padStart(4),c.key,'|',c.examples.join(' / '));
