import {entityLabel,yearLabel} from './chronicle.js';
import {inDiorama} from './place-state.js';

// Symbolic models from Fantology's catalog, not reconstructed portraits.
export function personArchetype(id,claims){
  const descriptions=claims.filter(c=>c.subject===id&&['syj:describedAs','syj:hasTitle','syj:activeIn'].includes(c.predicate));
  const text=descriptions.map(c=>c.object.value||c.quote||'').join(' ');
  if(/승려|불교 승|스님/.test(text))return 'monk';
  if(/학자|문신|문인|시인|저술가|영의정|판서/.test(text))return 'scribe';
  if(/수군|통제사|장군|장수|의병|무신/.test(text))return 'spearman';
  return 'human';
}

export function eventArchetype(event){
  return /전투|대첩|왜란|전쟁|항전/.test(event.label)?'battle':'hanging_scroll';
}

/** Only a cited event site supplies coordinates; being a contemporary never does. */
export function planChronicleAssets(context,data,features,places=[]){
  const referenceFor=id=>{
    const claims=data.claims.filter(c=>c.subject===id);
    for(const c of claims.filter(c=>c.object.kind==='entity'&&/locatedAt|tookPlaceAt|occurredAt/.test(c.predicate))){
      const target=data.entities.find(e=>e.id===c.object.id);
      const p=places.find(p=>p.id===c.object.id||target&&(p.labelKo===entityLabel(target)||p.label===entityLabel(target)));
      if(p?.candidates?.length)return {placeId:p.id,label:p.labelKo||p.label,candidate:p.candidates[0],claimIds:[c.id]};
    }
    for(const c of claims.filter(c=>['syj:activeIn','syj:describedAs'].includes(c.predicate))){
      const text=c.quote||c.object.value||'';
      const p=places.find(p=>p.candidates?.length&&(p.labelKo||'').length>=2&&text.includes(p.labelKo));
      if(p)return {placeId:p.id,label:p.labelKo,candidate:p.candidates[0],claimIds:[c.id]};
    }
    return null;
  };
  const people=context.people.map(person=>{
    const period=person.periods.find(p=>p.label==='생몰')||person.periods[0];
    return {id:'person:'+person.id,entityId:person.id,kind:'person',placement:'symbolic',
      locationReference:referenceFor(person.id),
      label:entityLabel(person),archetype:personArchetype(person.id,data.claims),
      detail:`${yearLabel(period.lo)} – ${yearLabel(period.hi)} · ${period.label}`,
      claimIds:[...new Set(person.periods.flatMap(p=>p.basis.map(c=>c.id)))]};
  });
  const present=new Map(people.map(p=>[p.entityId,p]));
  const current=[...new Map(context.allEvents.filter(e=>e.lo<=context.year&&e.hi>=context.year).map(e=>[e.id,e])).values()];
  const events=current.map(event=>{
    const sites=features.filter(f=>f.geometry?.type==='Point'&&f.properties.eventId===event.id
      &&Number(f.properties.validFrom)<=context.year&&Number(f.properties.validTo)>=context.year
      &&inDiorama({lon:f.geometry.coordinates[0],lat:f.geometry.coordinates[1]}));
    const relatives=data.claims.filter(c=>c.object.kind==='entity'&&(c.subject===event.id||c.object.id===event.id));
    const participants=new Map();
    for(const claim of relatives){
      const id=claim.subject===event.id?claim.object.id:claim.subject;
      if(present.has(id)){
        const row=participants.get(id)||{...present.get(id),relationClaims:[]};
        row.relationClaims.push(claim.id);participants.set(id,row);
      }
    }
    return {id:'event:'+event.id,entityId:event.id,kind:'event',
      label:entityLabel(event.type==='Polity'?{...event,label:event.title}:event),
      archetype:eventArchetype(event),detail:`${yearLabel(event.lo)}${event.lo!==event.hi?' – '+yearLabel(event.hi):''}`,
      sites,locationReference:referenceFor(event.id),participants:[...participants.values()],claimIds:[...new Set(event.basis.map(c=>c.id))]};
  });
  return {year:context.year,people,events};
}
