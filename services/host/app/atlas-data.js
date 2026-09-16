import {datedClaims,entityLabel,displayLabel,labelNote,isGroupEntity,yearLabel,typeWord,RELATION_WORDS} from './chronicle.js';
export {displayLabel,labelNote,isGroupEntity} from './chronicle.js';

export const cleanTitle=text=>String(text||'').replace(/\s*\(\d{3,4}(?:년)?\)\s*$/,'');
// 유형 이름. 집단 행위자(군대·단체)는 나라가 아니라 '집단'으로 보인다(#197). 나머지는 공용 대조표(TYPE_WORDS)를 쓴다.
export const typeName=(type,entity)=>entity&&isGroupEntity(entity)?'집단':typeWord(type);
const normalize=text=>String(text||'').normalize('NFKC').toLocaleLowerCase('ko').replace(/\s/g,'');

export function relationName(claim,id){
  const predicate=claim.predicate.replace('syj:','');
  const inverse={hasParent:'자녀',childOf:'자녀',parentOf:'부모',hasTeacher:'제자',teacherOf:'스승'};
  return (claim.subject!==id&&inverse[predicate])||RELATION_WORDS[predicate]||'';
}
export function relationTime(claim){
  const time=claim.time||(claim.object.kind==='time'?claim.object:null);
  const lo=time?.earliest??time?.year??(time?.kind==='year'?time.value:undefined)??claim.validFrom;
  const hi=time?.latest??time?.year??(time?.kind==='year'?time.value:undefined)??claim.validTo;
  return {lo:Number.isInteger(lo)?lo:null,hi:Number.isInteger(hi)?hi:null};
}
export function relationDates(claim){
  const {lo,hi}=relationTime(claim);
  if(lo!==null&&hi!==null)return yearLabel(lo)+(lo!==hi?'~'+yearLabel(hi):'');
  return lo!==null?yearLabel(lo)+'부터':hi!==null?yearLabel(hi)+'까지':'';
}

export class AtlasData{
  update(data,context,packets){
    if(this.data!==data){
      this.data=data;this.entities=new Map(data.entities.map(e=>[e.id,e]));this.claims=new Map(data.claims.map(c=>[c.id,c]));
      this.subjects=new Map();this.links=new Map();this.dates=new Map();
      const add=(map,key,value)=>{if(!map.has(key))map.set(key,[]);map.get(key).push(value);};
      for(const claim of data.claims){
        add(this.subjects,this.canonicalId(claim.subject),claim);
        // 원래 이름을 남긴 동일성 주장이 관계 목록에 인물을 다시 만들지 않게 한다.
        if(claim.object.kind==='entity'&&!this.entities.get(claim.subject)?.mergedInto&&!this.entities.get(claim.object.id)?.mergedInto){
          add(this.links,claim.subject,{claim,id:claim.object.id});add(this.links,claim.object.id,{claim,id:claim.subject});
        }
      }
      for(const date of datedClaims(data))add(this.dates,date.claim.subject,date);
      this.searchable=data.entities.filter(e=>!e.mergedInto&&['Person','Event'].includes(e.type)).map(e=>{const terms=[e.label,e.labelHanja,...(e.aliases||[])].filter(Boolean).map(normalize).filter(Boolean);return {entity:e,terms,text:terms.join(' ')};});
    }
    this.context=context;this.events=context?.allEvents||[];
    const active=new Set(this.events.map(e=>e.sceneId));
    this.scenes=new Map((packets||[]).filter(p=>active.has(p.id)).map(p=>[p.id,p]));
  }
  canonicalId(id){return this.entities.get(id)?.mergedInto||id;}
  label(entity){
    const scene=entity.type==='Event'&&this.eventsFor(entity.id).find(e=>e.id===entity.id&&e.sceneId);
    if(scene?.title)return cleanTitle(scene.title).replace(/\s*·\s*현재 기관 좌표$/,'');
    return displayLabel(entity)||cleanTitle(entityLabel(entity));
  }
  // 원본 라벨(검색 매칭·툴팁용)과 설명 꼬리("지방 행정 중심지")
  rawLabel(entity){return cleanTitle(entityLabel(entity)).replace(/\s*·\s*현재 기관 좌표$/,'');}
  labelNote(entity){return labelNote(entity);}
  description(id){
    id=this.canonicalId(id);
    return (this.subjects.get(id)||[]).find(c=>c.predicate==='syj:describedAs'&&c.object.value)?.object.value||'';
  }
  datesLabel(id){
    id=this.canonicalId(id);
    const dates=this.dates.get(id)||[],life=dates.find(d=>d.claim.predicate==='syj:livedIn');
    const born=dates.find(d=>d.claim.predicate==='syj:bornIn'),died=dates.find(d=>d.claim.predicate==='syj:diedIn');
    const range=born&&died?[born.lo,died.hi]:life?[life.lo,life.hi]:null;
    if(range)return `${yearLabel(range[0])}~${yearLabel(range[1])}`;
    const event=this.eventsFor(id)[0];
    if(event)return yearLabel(event.lo)+(event.lo!==event.hi?'~'+yearLabel(event.hi):'');
    return dates[0]?yearLabel(dates[0].lo):'연도 미확인';
  }
  eventsFor(id){
    id=this.canonicalId(id);
    const related=new Set((this.links.get(id)||[]).filter(r=>this.entities.get(r.id)?.type==='Event').map(r=>r.id));
    return this.events.filter(e=>!this.entities.get(e.id)?.mergedInto&&(e.id===id||related.has(e.id)||this.scenes.get(e.sceneId)?.participants?.some(p=>this.canonicalId(p.entityId)===id&&(p.claimIds||[]).some(c=>this.claims.has(c)))))
      .sort((a,b)=>Math.abs(a.lo-this.context.year)-Math.abs(b.lo-this.context.year)||a.lo-b.lo);
  }
  relations(id){
    id=this.canonicalId(id);
    const found=new Map();
    for(const link of this.links.get(id)||[]){
      const entity=this.entities.get(link.id);if(!entity||entity.mergedInto||entity.id===id)continue;
      if(!found.has(entity.id))found.set(entity.id,{entity,claims:[]});found.get(entity.id).claims.push(link.claim);
    }
    return [...found.values()];
  }
  search(query,type='all'){
    const text=normalize(query);if(!text)return [];
    // 이름이 검색어를 품거나(세종 ⊂ 세종대왕), 검색어가 이름을 품으면(세종대왕 ⊃ 세종) 맞는다 — 존칭·직함이 붙은 검색어도 찾히게.
    // 표기(이름·한자·다른 표기)마다 따로 재서 가장 잘 맞는 것으로 순위를 매긴다 — 다른 표기를 이어 붙인 문자열로 재면 '세종'의 정확 일치가 깨져 사건이 인물 위로 올라온다.
    const score=row=>{let best=[3,1e9];for(const term of row.terms){const s=term===text?0:term.includes(text)?1:(term.length>=2&&text.includes(term))?2:3;if(s<best[0]||(s===best[0]&&term.length<best[1]))best=[s,term.length];}return best;};
    const direct=this.searchable.filter(row=>score(row)[0]<3).sort((a,b)=>{const x=score(a),y=score(b);return x[0]-y[0]||x[1]-y[1];});
    const rows=new Map(direct.map(row=>[row.entity.id,{entity:row.entity,related:false}]));
    for(const match of direct.slice(0,10))for(const event of this.eventsFor(match.entity.id)){
      const entity=this.entities.get(event.id);if(entity&&!rows.has(entity.id))rows.set(entity.id,{entity,related:true});
    }
    return [...rows.values()].filter(row=>type==='all'||row.entity.type===type);
  }
}
