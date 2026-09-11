import {datedClaims,entityLabel,yearLabel} from './chronicle.js';

export const cleanTitle=text=>String(text||'').replace(/\s*\(\d{3,4}(?:년)?\)\s*$/,'');
export const typeName=type=>({Person:'인물',Event:'사건',Place:'장소',Polity:'나라',Narrative:'전승'}[type]||'기록');
const normalize=text=>String(text||'').normalize('NFKC').toLocaleLowerCase('ko').replace(/\s/g,'');

export class AtlasData{
  update(data,context,packets){
    if(this.data!==data){
      this.data=data;this.entities=new Map(data.entities.map(e=>[e.id,e]));this.claims=new Map(data.claims.map(c=>[c.id,c]));
      this.subjects=new Map();this.links=new Map();this.dates=new Map();
      const add=(map,key,value)=>{if(!map.has(key))map.set(key,[]);map.get(key).push(value);};
      for(const claim of data.claims){
        add(this.subjects,claim.subject,claim);
        if(claim.object.kind==='entity'){
          add(this.links,claim.subject,{claim,id:claim.object.id});add(this.links,claim.object.id,{claim,id:claim.subject});
        }
      }
      for(const date of datedClaims(data))add(this.dates,date.claim.subject,date);
      this.searchable=data.entities.filter(e=>['Person','Event'].includes(e.type)).map(e=>({entity:e,text:normalize([e.label,e.labelHanja,...(e.aliases||[])].join(' '))}));
    }
    this.context=context;this.events=context?.allEvents||[];
    const active=new Set(this.events.map(e=>e.sceneId));
    this.scenes=new Map((packets||[]).filter(p=>active.has(p.id)).map(p=>[p.id,p]));
  }
  label(entity){return cleanTitle(entityLabel(entity));}
  description(id){
    return (this.subjects.get(id)||[]).find(c=>c.predicate==='syj:describedAs'&&c.object.value)?.object.value||'';
  }
  datesLabel(id){
    const dates=this.dates.get(id)||[],life=dates.find(d=>d.claim.predicate==='syj:livedIn');
    const born=dates.find(d=>d.claim.predicate==='syj:bornIn'),died=dates.find(d=>d.claim.predicate==='syj:diedIn');
    const range=born&&died?[born.lo,died.hi]:life?[life.lo,life.hi]:null;
    if(range)return `${yearLabel(range[0])} – ${yearLabel(range[1])}`;
    const event=this.eventsFor(id)[0];
    if(event)return yearLabel(event.lo)+(event.lo!==event.hi?' – '+yearLabel(event.hi):'');
    return dates[0]?yearLabel(dates[0].lo):'연대 미확인';
  }
  eventsFor(id){
    const related=new Set((this.links.get(id)||[]).filter(r=>this.entities.get(r.id)?.type==='Event').map(r=>r.id));
    return this.events.filter(e=>e.id===id||related.has(e.id)||this.scenes.get(e.sceneId)?.participants?.some(p=>p.entityId===id&&(p.claimIds||[]).some(c=>this.claims.has(c))))
      .sort((a,b)=>Math.abs(a.lo-this.context.year)-Math.abs(b.lo-this.context.year)||a.lo-b.lo);
  }
  relations(id){
    const found=new Map();
    for(const link of this.links.get(id)||[]){
      const entity=this.entities.get(link.id);if(!entity||entity.id===id)continue;
      if(!found.has(entity.id))found.set(entity.id,{entity,claims:[]});found.get(entity.id).claims.push(link.claim);
    }
    return [...found.values()];
  }
  search(query,type='all'){
    const text=normalize(query);if(!text)return [];
    const direct=this.searchable.filter(row=>row.text.includes(text)).sort((a,b)=>Number(b.text===text)-Number(a.text===text)||a.text.length-b.text.length);
    const rows=new Map(direct.map(row=>[row.entity.id,{entity:row.entity,related:false}]));
    for(const match of direct.slice(0,10))for(const event of this.eventsFor(match.entity.id)){
      const entity=this.entities.get(event.id);if(entity&&!rows.has(entity.id))rows.set(entity.id,{entity,related:true});
    }
    return [...rows.values()].filter(row=>type==='all'||row.entity.type===type);
  }
}
