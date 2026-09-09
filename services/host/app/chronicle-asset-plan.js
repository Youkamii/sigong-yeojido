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

export function activityFigure(id,role,year,claims){
  if(year>=1876)return 'modern_figure';
  const texts=claims.filter(c=>c.subject===id&&['syj:describedAs','syj:hasTitle'].includes(c.predicate)
    &&c.validFrom!=null&&c.validTo!=null&&within(c,year));
  const text=[role,...texts.map(c=>c.object.value||'')].join(' ');
  if(/승려|승장|스님/.test(text))return 'period_monk';
  if(texts.some(c=>c.predicate==='syj:hasTitle'&&/왕$|황제$|국왕/.test(c.object.value||''))||/국왕|군주|왕으로 즉위/.test(role))return 'period_ruler';
  if(/지휘|통제사|수군|수사|장군|무장|의병장|총사령|대장/.test(text))return 'period_commander';
  if(/학자|문신|문인|시인|저술|판서|정승|학당|강학|편찬|간행/.test(text))return 'period_scholar';
  return 'period_figure';
}

const within=(row,year)=>(row.validFrom==null||row.validFrom<=year)&&(row.validTo==null||row.validTo>=year);
const yearOf=value=>typeof value==='string'?Number(value.slice(0,4)):null;

/** A geographic placement requires the selected activity's own place evidence. */
export function planChronicleAssets(context,data,features,places=[],scenePackets=[],registry={}){
  const claims=new Map(data.claims.map(c=>[c.id,c])),entities=new Map(data.entities.map(e=>[e.id,e]));
  const supported=ids=>Array.isArray(ids)&&ids.length>0&&ids.every(id=>claims.has(id));
  const sceneReference=(placeId)=>{
    const references=[];
    for(const scene of scenePackets){
      const p=scene.place;
      if(!p||p.medium==='sea'||!supported(p.claimIds)||!p.claimIds.some(id=>{
        const c=claims.get(id);return c.subject===scene.eventId&&['syj:tookPlaceAt','syj:occurredAt'].includes(c.predicate)&&c.object.kind==='entity'&&c.object.id===placeId;
      }))continue;
      const anchor=places.find(a=>a.id===p.anchorPlaceId),region=regionalCoordinate(registry,p.anchorPlaceId,p.label);
      const direct=Number.isFinite(p.lon)&&Number.isFinite(p.lat)&&p.coordinateSourceIds?.length;
      const candidate=p.displayCoordinates?{lon:p.displayCoordinates[0],lat:p.displayCoordinates[1]}:direct?{lon:p.lon,lat:p.lat}:anchor?.candidates?.length===1?anchor.candidates[0]:region;
      if(!candidate||!inDiorama(candidate))continue;
      references.push({candidate,claimIds:p.claimIds,precision:'area',coordinateNote:p.coordinateNote||candidate.basis||region?.coordinateNote,
        coordinateSourceIds:direct||p.displayCoordinates?p.coordinateSourceIds:region?.sourceIds||[candidate.fromSource].filter(Boolean)});
    }
    if(new Set(references.map(r=>r.candidate.lon.toFixed(5)+':'+r.candidate.lat.toFixed(5))).size!==1)return null;
    return references[0];
  };
  const referenceFor=(id,person=false)=>{
    for(const c of data.claims.filter(c=>c.subject===id&&c.object.kind==='entity'
      &&(person?['syj:activeIn']:['syj:tookPlaceAt','syj:occurredAt']).includes(c.predicate)&&within(c,context.year)
      &&(!person||(c.validFrom!=null&&c.validTo!=null)))){
      const exact=places.filter(p=>p.id===c.object.id),target=entities.get(c.object.id);
      const region=regionalCoordinate(registry,c.object.id,target&&entityLabel(target));
      if(region&&inDiorama(region))return {placeId:region.id,label:region.label,candidate:region,
        claimIds:[c.id],precision:region.precision||'area',coordinateNote:region.coordinateNote,coordinateSourceIds:region.sourceIds};
      const matches=exact.length?exact:places.filter(p=>target&&(p.labelKo||p.label)===entityLabel(target));
      if(matches.length===1){
        const p=matches[0],candidates=(p.candidates||[]).filter(candidate=>within(candidate,context.year)&&inDiorama(candidate));
        if(candidates.length===1)return {placeId:p.id,label:p.labelKo||p.label,candidate:candidates[0],claimIds:[c.id],precision:'area',
          coordinateNote:candidates[0].basis,coordinateSourceIds:[candidates[0].fromSource].filter(Boolean)};
      }
      const reference=!person&&sceneReference(c.object.id);
      if(reference)return {...reference,placeId:c.object.id,label:target?entityLabel(target):c.object.id,claimIds:[c.id,...reference.claimIds]};
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
      label:entityLabel(person),archetype:activityFigure(person.id,'',context.year,data.claims),locations,locationReference:referenceFor(person.id,true),
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
    const locationReference=referenceFor(event.id);
    return {id:'event:'+event.id,entityId:event.id,kind:'event',year:context.year,label:entityLabel(event),
      archetype:eventArchetype(event),detail:yearLabel(event.lo),summary:'',sites,
      locationReference,participants:[],effects:{},
      claimIds:[...new Set([...event.basis.map(c=>c.id),...(locationReference?.claimIds||[])])]};
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
    const activeParticipants=scene.participants.filter(p=>(p.startYear==null||p.startYear<=context.year)&&(p.endYear==null||p.endYear>=context.year));
    const participants=activeParticipants.filter(p=>supported(p.claimIds)&&present.has(p.entityId)).map(p=>({
      ...present.get(p.entityId),...p,archetype:activityFigure(p.entityId,p.role,context.year,data.claims),
      relationClaims:p.claimIds,detail:p.role+' · '+scene.title,claimIds:[...p.claimIds,...scene.dateClaimIds,...(place?.claimIds||[])]}));
    events.push({id:scene.id,entityId:scene.eventId,kind:'event',year:context.year,label:scene.title,
      archetype:scene.kind,startYear:scene.startYear,endYear:scene.endYear,detail:yearLabel(scene.startYear),summary:scene.summary,
      scenePlace:coordinates?{...place,coordinates,precision:place.displayPrecision||place.precision,...(regionalPlacement?{
        coordinateNote:'지역 기준 추정 배치 · '+region.coordinateNote,coordinateSourceIds:region.sourceIds}: {})}:null,
      sites:[],locationReference:null,visualActions:scene.visualActions,
      participants,effects:Object.fromEntries(Object.entries(scene.effects||{}).map(([key,effect])=>
        [key,{...effect,enabled:effect.enabled&&supported(effect.claimIds)
          &&(effect.startYear==null||effect.startYear<=context.year)&&(effect.endYear==null||effect.endYear>=context.year)}])),
      sides:[...activeParticipants.filter(p=>supported(p.claimIds)&&entities.get(p.entityId)?.type==='Polity')
        .map(p=>({...p,label:entityLabel(entities.get(p.entityId))})),...(scene.sides||[]).filter(p=>supported(p.claimIds))],
      claimIds:[...new Set([...scene.dateClaimIds,...scene.actionClaimIds,...(place?.claimIds||[])])],
      actionClaimIds:scene.actionClaimIds,placeClaimIds:place?.claimIds||[]});
  }
  return {year:context.year,people,events};
}
