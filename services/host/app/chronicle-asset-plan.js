import {entityLabel,yearLabel} from './chronicle.js';
import {inDiorama} from './place-state.js';
import {regionalCoordinate} from './history-coordinates.js';

export function personArchetype(id,claims){
  const text=claims.filter(c=>c.subject===id&&['syj:describedAs','syj:hasTitle','syj:activeIn'].includes(c.predicate))
    .map(c=>c.object.value||c.quote||'').join(' ');
  if(/승려|불교 승|스님/.test(text))return 'monk';
  if(/수군|통제사|장군|장수|의병|무신/.test(text))return 'spearman';
  if(/학자|문신|문인|시인|저술가|영의정|판서/.test(text))return 'scribe';
  return 'human';
}

export function eventArchetype(event){
  const label=event.label||event.title||'';
  if(/해전|한산도|명량|노량|옥포|당포/.test(label))return 'naval';
  if(/인쇄|간행|편찬|보성사|훈민정음|동의보감/.test(label))return 'publication';
  if(/축성|건축|중건|화성/.test(label))return 'construction';
  if(/전투|대첩|공성/.test(label))return 'siege';
  if(/만세|독립|시위|운동/.test(label))return 'assembly';
  if(/화재|소실|소각/.test(label))return 'fire';
  if(/전쟁|왜란|항전/.test(label))return 'battle';
  return 'court';
}

const within=(row,year)=>(row.validFrom==null||row.validFrom<=year)&&(row.validTo==null||row.validTo>=year);
const yearOf=value=>typeof value==='string'?Number(value.slice(0,4)):null;

/** A geographic placement requires the selected activity's own place evidence. */
export function planChronicleAssets(context,data,features,places=[],scenePackets=[],registry={}){
  const claims=new Map(data.claims.map(c=>[c.id,c])),entities=new Map(data.entities.map(e=>[e.id,e]));
  const supported=ids=>Array.isArray(ids)&&ids.length>0&&ids.every(id=>claims.has(id));
  const referenceFor=(id,person=false)=>{
    for(const c of data.claims.filter(c=>c.subject===id&&c.object.kind==='entity'
      &&(person?['syj:activeIn']:['syj:tookPlaceAt','syj:occurredAt']).includes(c.predicate)&&within(c,context.year)
      &&(!person||(c.validFrom!=null&&c.validTo!=null)))){
      const exact=places.filter(p=>p.id===c.object.id),target=entities.get(c.object.id);
      const region=regionalCoordinate(registry,c.object.id,target&&entityLabel(target));
      if(region&&inDiorama(region))return {placeId:region.id,label:region.label,candidate:region,
        claimIds:[c.id],precision:'area',coordinateNote:region.coordinateNote,coordinateSourceIds:region.sourceIds};
      const matches=exact.length?exact:places.filter(p=>target&&(p.labelKo||p.label)===entityLabel(target));
      if(matches.length!==1)continue;
      const p=matches[0],candidates=(p.candidates||[]).filter(candidate=>within(candidate,context.year)&&inDiorama(candidate));
      if(candidates.length===1)return {placeId:p.id,label:p.labelKo||p.label,candidate:candidates[0],claimIds:[c.id],precision:'area',
        coordinateNote:candidates[0].basis,coordinateSourceIds:[candidates[0].fromSource].filter(Boolean)};
    }
    return null;
  };
  const people=context.people.map(person=>{
    const period=person.periods.find(p=>p.label==='활동')||person.periods.find(p=>p.label==='사건 참여')||person.periods[0];
    const locations=data.claims.filter(c=>c.subject===person.id&&c.predicate==='syj:physicallyPresentAt'
      &&c.object.kind==='location'&&within(c,context.year)).filter(c=>{
        const p=c.object.presence;
        return p?yearOf(p.earliest)<=context.year&&yearOf(p.latest)>=context.year
          :c.validFrom!=null&&c.validTo!=null;
      });
    return {id:'person:'+person.id,entityId:person.id,kind:'person',placement:'unlocated',
      label:entityLabel(person),archetype:'human',locations,locationReference:referenceFor(person.id,true),
      detail:period.label==='활동'?period.claim.quote:`${yearLabel(period.lo)} – ${yearLabel(period.hi)} · ${period.label}`,
      claimIds:[...new Set(person.periods.flatMap(p=>p.basis.map(c=>c.id)))]};
  });
  const present=new Map(people.map(p=>[p.entityId,p]));
  const current=[...new Map(context.allEvents.filter(e=>e.lo<=context.year&&e.hi>=context.year).map(e=>[e.id,e])).values()];
  const researched=scenePackets.filter(s=>s.startYear<=context.year&&s.endYear>=context.year
    &&supported(s.dateClaimIds)&&supported(s.actionClaimIds));
  const covered=new Set(researched.map(s=>s.eventId));
  const events=current.filter(e=>!covered.has(e.id)).map(event=>{
    const sites=features.filter(f=>f.geometry?.type==='Point'&&f.properties.eventId===event.id
      &&within(f.properties,context.year)&&inDiorama({lon:f.geometry.coordinates[0],lat:f.geometry.coordinates[1]}));
    return {id:'event:'+event.id,entityId:event.id,kind:'event',year:context.year,label:entityLabel(event),
      archetype:eventArchetype(event),detail:yearLabel(event.lo),summary:'',sites,
      locationReference:referenceFor(event.id),participants:[],effects:{},
      claimIds:[...new Set(event.basis.map(c=>c.id))]};
  });
  for(const scene of researched){
    const place=scene.place&&(supported(scene.place.claimIds)||scene.place.placementType==='context-region')?scene.place:null;
    const feature=place?.featureId&&features.find(f=>f.id===place.featureId&&within(f.properties,context.year));
    const anchor=place?.medium!=='sea'&&place?.anchorPlaceId&&places.find(p=>p.id===place.anchorPlaceId);
    const region=place?.medium!=='sea'&&place?.precision==='area'
      ?regionalCoordinate(registry,place.anchorPlaceId,place.label):null;
    const direct=place&&Number.isFinite(place.lon)&&Number.isFinite(place.lat)&&place.coordinateSourceIds?.length;
    const coordinates=place?.displayCoordinates||feature?.geometry?.coordinates||(direct?[place.lon,place.lat]:anchor?.candidates?.length===1
      ?[anchor.candidates[0].lon,anchor.candidates[0].lat]:region?[region.lon,region.lat]:null);
    const regionalPlacement=region&&!place?.displayCoordinates&&!feature&&!direct&&!anchor;
    const participants=scene.participants.filter(p=>supported(p.claimIds)&&present.has(p.entityId)).map(p=>({
      ...present.get(p.entityId),...p,archetype:context.year>=1876?'human':/승장|승려/.test(p.role)?'monk':['defender','invader','naval'].includes(p.side)?'spearman':'scribe',
      relationClaims:p.claimIds,detail:p.role+' · '+scene.title,claimIds:[...p.claimIds,...scene.dateClaimIds,...(place?.claimIds||[])]}));
    events.push({id:scene.id,entityId:scene.eventId,kind:'event',year:context.year,label:scene.title,
      archetype:scene.kind,detail:yearLabel(scene.startYear),summary:scene.summary,
      scenePlace:coordinates?{...place,coordinates,...(regionalPlacement?{
        coordinateNote:'지역 기준 추정 배치 · '+region.coordinateNote,coordinateSourceIds:region.sourceIds}: {})}:null,
      sites:[],locationReference:null,visualActions:scene.visualActions,
      participants,effects:Object.fromEntries(Object.entries(scene.effects||{}).map(([key,effect])=>
        [key,{enabled:effect.enabled&&supported(effect.claimIds),claimIds:effect.claimIds}])),
      sides:[...scene.participants.filter(p=>supported(p.claimIds)&&entities.get(p.entityId)?.type==='Polity')
        .map(p=>({...p,label:entityLabel(entities.get(p.entityId))})),...(scene.sides||[]).filter(p=>supported(p.claimIds))],
      claimIds:[...new Set([...scene.dateClaimIds,...scene.actionClaimIds,...(place?.claimIds||[])])],
      actionClaimIds:scene.actionClaimIds,placeClaimIds:place?.claimIds||[]});
  }
  return {year:context.year,people,events};
}
