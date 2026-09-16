import {entityLabel,displayLabel,yearLabel} from './chronicle.js';
import {inDiorama} from './place-state.js';
import {regionalCoordinate} from './history-coordinates.js';
import {isHistoricalSetting} from './chronicle-sites.js';
import {figureArchetype} from './period-figures.js';
import {visiblePackets} from './scene-packets.js';

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

// #186: 항목 패킷의 역할어는 영어다. 조형은 영어 역할어로 고르고, 화면에는 한글로 보인다.
export const ROLE_KO={ruler:'군주',commander:'지휘관',scholar:'학자',monk:'승려',commoner:'백성',soldier:'군사',worker:'일꾼',militia:'의병',envoy:'사신',printer:'인쇄공',civilian:'백성',police:'경찰'};
// 화면 호칭: 장면 데이터는 국가 원수를 모두 'ruler' 로 두므로 연도가 있으면 시대에 맞게 부른다(대한제국 황제 → 1910 이후 지도자 → 1948 이후 국가 지도자). 연도 없이 부르면 옛 호칭.
export const roleLabel=(role,year)=>(role==='ruler'||role==='군주')&&Number.isInteger(year)?(year>=1948?'국가 지도자':year>=1910?'지도자':year>=1897?'황제':'군주'):(ROLE_KO[role]||role);  // 조형 계획이 이미 '군주'로 바꿔 넘긴 역할도 같은 규칙
export function activityFigure(id,role,year,claims){
  if(Object.hasOwn(ROLE_KO,role))return figureArchetype(role,year);
  const texts=claims.filter(c=>c.subject===id&&['syj:describedAs','syj:hasTitle'].includes(c.predicate)
    &&c.validFrom!=null&&c.validTo!=null&&within(c,year));
  const text=[role,...texts.map(c=>c.object.value||'')].join(' ');
  if(/승려|승장|스님|비구니|여승/.test(text))return figureArchetype('monk',year);
  if(texts.some(c=>c.predicate==='syj:hasTitle'&&/왕$|황제$|국왕/.test(c.object.value||''))||/국왕|군주|왕으로 즉위/.test(role))return figureArchetype('ruler',year);
  if(/지휘|통제사|수군|수사|장군|무장|의병장|총사령|대장/.test(text))return figureArchetype('commander',year);
  if(/학자|문신|문인|시인|저술|판서|정승|학당|강학|편찬|간행/.test(text))return figureArchetype('scholar',year);
  if(/병사|군사|군인|보병|기병|수병/.test(text))return figureArchetype('soldier',year);
  return figureArchetype('commoner',year);
}

const within=(row,year)=>(row.validFrom==null||row.validFrom<=year)&&(row.validTo==null||row.validTo>=year);
const yearOf=value=>typeof value==='string'?Number(value.slice(0,4)):null;

/** A geographic placement requires the selected activity's own place evidence. */
export function planChronicleAssets(context,data,features,places=[],scenePackets=[],registry={}){
  scenePackets=visiblePackets(scenePackets);
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
      if(reference)return {...reference,placeId:c.object.id,label:target?displayLabel(target):c.object.id,claimIds:[c.id,...reference.claimIds]};
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
      label:displayLabel(person),archetype:activityFigure(person.id,'',context.year,data.claims),locations,locationReference:referenceFor(person.id,true),
      detail:period.label==='활동'?period.claim.quote:`${yearLabel(period.lo)} – ${yearLabel(period.hi)} · ${period.label}`,
      claimIds:[...new Set(person.periods.flatMap(p=>p.basis.map(c=>c.id)))]};
  });
  const present=new Map(people.map(p=>[p.entityId,p]));
  const current=[...new Map(context.allEvents.filter(e=>e.type!=='Narrative'&&e.lo<=context.year&&e.hi>=context.year).map(e=>[e.id,e])).values()];
  const researched=scenePackets.filter(s=>!s.narrativeType&&s.startYear<=context.year&&s.endYear>=context.year
    &&(s.itemId||supported(s.dateClaimIds)&&supported(s.actionClaimIds)));
  const covered=new Set(researched.map(s=>s.eventId));
  const events=current.filter(e=>!covered.has(e.id)).map(event=>{
    const sites=features.filter(f=>f.geometry?.type==='Point'&&f.properties.eventId===event.id
      &&within(f.properties,context.year)&&inDiorama({lon:f.geometry.coordinates[0],lat:f.geometry.coordinates[1]}));
    const locationReference=referenceFor(event.id);
    return {id:'event:'+event.id,entityId:event.id,kind:'event',year:context.year,label:displayLabel(event),
      archetype:eventArchetype(event),detail:yearLabel(event.lo),summary:'',sites,
      locationReference,participants:[],effects:{},
      claimIds:[...new Set([...event.basis.map(c=>c.id),...(locationReference?.claimIds||[])])]};
  });
  // Evidence-backed placement: display coordinates, a dated feature, direct coordinates, a single anchor candidate, or a region.
  const locate=place=>{
    if(!place)return {coordinates:null};
    const feature=place.featureId&&features.find(f=>f.id===place.featureId&&within(f.properties,context.year));
    const anchor=place.medium!=='sea'&&place.anchorPlaceId&&places.find(p=>p.id===place.anchorPlaceId);
    const region=place.medium!=='sea'&&place.precision==='area'?regionalCoordinate(registry,place.anchorPlaceId,place.label):null;
    const direct=Number.isFinite(place.lon)&&Number.isFinite(place.lat)&&place.coordinateSourceIds?.length;
    const coordinates=place.displayCoordinates||feature?.geometry?.coordinates||(direct?[place.lon,place.lat]:anchor?.candidates?.length===1
      ?[anchor.candidates[0].lon,anchor.candidates[0].lat]:region?[region.lon,region.lat]:null);
    return {coordinates,region,regionalPlacement:Boolean(region&&!place.displayCoordinates&&!feature&&!direct&&!anchor)};
  };
  for(const scene of researched){
    // #186: 교과서 항목 패킷은 조사 검증기가 좌표 근거를 확인했으므로 사료 선택과 무관하게 패킷 좌표로 놓는다.
    const itemCoordinates=Boolean(scene.itemId&&scene.place?.claimIds?.length&&Number.isFinite(scene.place.lon)&&Number.isFinite(scene.place.lat));
    const place=scene.place&&(itemCoordinates||supported(scene.place.claimIds)||scene.place.placementType==='context-region')?scene.place:null;
    const {coordinates,region,regionalPlacement}=itemCoordinates?{coordinates:[place.lon,place.lat]}:locate(place);
    const activeParticipants=scene.participants.filter(p=>(p.startYear==null||p.startYear<=context.year)&&(p.endYear==null||p.endYear>=context.year));
    const participants=activeParticipants.filter(p=>supported(p.claimIds)&&present.has(p.entityId)).map(p=>({
      ...present.get(p.entityId),...p,archetype:activityFigure(p.entityId,p.role,context.year,data.claims),role:roleLabel(p.role),
      relationClaims:p.claimIds,detail:roleLabel(p.role,scene.startYear)+' · '+scene.title,claimIds:[...p.claimIds,...scene.dateClaimIds,...(place?.claimIds||[])]}));
    // #186: 항목 현장 인물을 최대 2명(portrait는 1명)까지 보완하고, 이름이 없으면 역할을 표시한다.
    if(scene.itemId){
      const limit=scene.kind==='portrait'?1:2;
      for(const lead of activeParticipants){
        if(participants.filter(p=>p.presence==='on-site'||scene.kind==='portrait').length>=limit)break;  // 그려질 참여자만 센다(로드된 관련 인물이 자리를 차지하지 않게)
        // portrait 는 관련 인물이 아니면 주인공으로, 그 밖의 kind 는 현장(on-site) 인물만 세운다(off-site·remote 는 카드 칩으로만).
        if((scene.kind==='portrait'?lead.presence==='related':lead.presence!=='on-site')||participants.some(p=>p.entityId===lead.entityId))continue;
        // 이름: 개체가 있으면 그 이름, 없으면 portrait 는 장면 제목(= 인물 이름), 그 밖의 kind 는 역할 이름(사건 제목을 사람 이름처럼 보이지 않게)
        participants.push({id:lead.entityId,entityId:lead.entityId,kind:'person',label:entities.has(lead.entityId)?displayLabel(entities.get(lead.entityId)):scene.kind==='portrait'?scene.title:roleLabel(lead.role,scene.startYear),
        ...lead,archetype:activityFigure(lead.entityId,lead.role,context.year,data.claims),role:roleLabel(lead.role),locations:[],locationReference:null,unloaded:true,
        relationClaims:lead.claimIds||[],detail:roleLabel(lead.role,scene.startYear)+' · '+scene.title,claimIds:[...(lead.claimIds||[]),...(scene.dateClaimIds||[]),...(place?.claimIds||[])]});
      }
    }
    events.push({id:scene.id,entityId:scene.eventId,kind:'event',year:context.year,label:scene.title,title:scene.title,setting:isHistoricalSetting(scene),
      ...(scene.itemId?{itemId:scene.itemId}:{}),
      archetype:scene.kind,startYear:scene.startYear,endYear:scene.endYear,detail:yearLabel(scene.startYear),summary:scene.summary,
      scenePlace:coordinates?{...place,coordinates,precision:place.displayPrecision||place.precision,...(regionalPlacement?{
        coordinateNote:'지역 기준 추정 배치 · '+region.coordinateNote,coordinateSourceIds:region.sourceIds}: {}),
        ...(itemCoordinates?{placementType:'item-packet'}: {})}:null,
      sites:[],locationReference:null,visualActions:scene.visualActions,
      // #173: 장면 기능과 참여 집단은 패킷 값을 그대로 넘긴다. participantGroups 는 Person 여부와 무관하게 통과(entityId 가 Polity·null 이어도 됨).
      // count 는 화면 표현값이며 사료의 인원수 주장이 아니다.
      ...(scene.sceneFunction?{sceneFunction:scene.sceneFunction}:{}),
      ...(scene.heritageType?{heritageType:scene.heritageType}:{}),
      ...(scene.heritageFloors?{heritageFloors:scene.heritageFloors}:{}),
      ...(Array.isArray(scene.participantGroups)&&scene.participantGroups.length?{participantGroups:scene.participantGroups.map(g=>({...g,
        label:g.label||(g.entityId&&entities.get(g.entityId)?displayLabel(entities.get(g.entityId)):g.role)}))}:{}),
      participants,effects:Object.fromEntries(Object.entries(scene.effects||{}).map(([key,effect])=>
        [key,{...effect,enabled:effect.enabled&&supported(effect.claimIds)
          &&(effect.startYear==null||effect.startYear<=context.year)&&(effect.endYear==null||effect.endYear>=context.year)}])),
      sides:[...activeParticipants.filter(p=>supported(p.claimIds)&&entities.get(p.entityId)?.type==='Polity')
        .map(p=>({...p,label:displayLabel(entities.get(p.entityId))})),...(scene.sides||[]).filter(p=>supported(p.claimIds))],
      claimIds:[...new Set([...scene.dateClaimIds,...scene.actionClaimIds,...(place?.claimIds||[])])],
      actionClaimIds:scene.actionClaimIds,placeClaimIds:place?.claimIds||[]});
  }
  return {year:context.year,people,events};
}
