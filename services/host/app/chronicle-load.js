/** 서버에 보낼 sources 질의값: 기본 묶음 그대로면 '@default' 한 토큰(2,700개 id 를 URL 에 싣지 않는다), 아니면 id 목록. */
export const sourcesParam=(on,primary)=>primary&&on.size===primary.size&&[...on].every(id=>primary.has(id))?'@default':[...on].join(',');
export function mergeSameEntities(data){
  const result=structuredClone(data),entities=new Map(result.entities.map(e=>[e.id,e]));
  const parents=new Map(result.entities.map(e=>[e.id,e.id]));
  const find=id=>{
    while(parents.get(id)!==id){parents.set(id,parents.get(parents.get(id)));id=parents.get(id);}
    return id;
  };
  const union=(subject,target)=>{
    const left=entities.get(subject),right=entities.get(target);
    if(left?.type&&left.type===right?.type)parents.set(find(subject),find(target));
  };
  for(const entity of result.entities)if(entity.mergedInto)union(entity.id,entity.mergedInto);
  const counts=new Map();
  for(const claim of result.claims){
    counts.set(claim.subject,(counts.get(claim.subject)||0)+1);
    if(claim.predicate==='syj:sameEntityAs'&&claim.object.kind==='entity')union(claim.subject,claim.object.id);
  }
  const rank=id=>/^(person|place)-encykorea-.+-e0\d+$/.test(id)?0:
    /^(person|place)-encykorea-/.test(id)?1:id.includes('-hs-')?2:3;
  const compareIds=(a,b)=>a<b?-1:a>b?1:0;
  const priority=(a,b)=>rank(a)-rank(b)||(counts.get(b)||0)-(counts.get(a)||0)||compareIds(a,b);
  const groups=new Map(),canonicalIds=new Map();
  for(const id of entities.keys()){
    const root=find(id);
    if(!groups.has(root))groups.set(root,[]);
    groups.get(root).push(id);
  }
  for(const members of groups.values()){
    if(members.length<2)continue;
    // 서버가 정한 연결을 뒤집지 않도록 이미 묶인 개체는 정본 후보에서 뺀다.
    const candidates=members.filter(id=>!entities.get(id).mergedInto);
    const canonical=entities.get((candidates.length?candidates:[...members]).sort(priority)[0]);
    const aliases=[...(canonical.aliases||[])],mergedIds=new Set();
    for(const id of members.sort(compareIds)){
      const entity=entities.get(id);
      canonicalIds.set(id,canonical.id);
      aliases.push(entity.label,entity.labelHanja,...(entity.aliases||[]));
      for(const mergedId of entity.mergedIds||[])mergedIds.add(mergedId);
      if(id!==canonical.id){entity.mergedInto=canonical.id;mergedIds.add(id);}
    }
    delete canonical.mergedInto;
    mergedIds.delete(canonical.id);
    canonical.mergedIds=[...mergedIds].sort(compareIds);
    canonical.aliases=[...new Set(aliases.filter(label=>label&&label!==canonical.label))];
  }
  // 객체의 키 순서가 달라도 서버와 같은 중복 주장으로 판단한다.
  const sortedObject=value=>Array.isArray(value)?value.map(sortedObject):
    value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,sortedObject(value[key])])):value;
  const claims=new Map();
  for(const claim of result.claims){
    if(claim.predicate!=='syj:sameEntityAs'){
      if(canonicalIds.has(claim.subject)){
        claim.subject=canonicalIds.get(claim.subject);
        claim.subjectLabel=entities.get(claim.subject).label;
      }
      if(canonicalIds.has(claim.object.id))claim.object.id=canonicalIds.get(claim.object.id);
    }
    const source=claim.sourceId??claim.fromSource??claim.chunk?.sourceId;
    const key=JSON.stringify([claim.subject,claim.predicate,sortedObject(claim.object),source]);
    if(!claims.has(key)||compareIds(claim.id,claims.get(key).id)<0)claims.set(key,claim);
  }
  result.claims=[...claims.values()].sort((a,b)=>compareIds(a.id,b.id));
  return result;
}
function mergeParts(parts){
  const entities=new Map();
  for(const entity of parts.flatMap(p=>p.entities)){
    const previous=entities.get(entity.id),merged={...previous,...entity};
    // 뒤 응답에 병합 정보가 없어도 앞 응답의 별칭과 정본 연결을 남긴다.
    for(const key of ['aliases','mergedIds']){
      if(previous?.[key]||entity[key])merged[key]=[...new Set([...(previous?.[key]||[]),...(entity[key]||[])])];
    }
    if(previous?.mergedInto&&!entity.mergedInto)merged.mergedInto=previous.mergedInto;
    entities.set(entity.id,merged);
  }
  return {entities:[...entities.values()],
    claims:[...new Map(parts.flatMap(p=>p.claims).map(c=>[c.id,c])).values()].sort((a,b)=>a.id.localeCompare(b.id)),hasMore:false};
}
/** 선택한 사료를 모두 읽어야 응답 한도 때문에 기록이 빠지지 않는다. */
export async function loadChronicle(sources,origin,signal,request=fetch){
  if(!sources.length)return {entities:[],claims:[],hasMore:false};
  if(sources.length>1&&sources.join(',').length>48000){  // 요청줄 64KB 한도 — 목록이 길면 먼저 반으로
    const middle=Math.ceil(sources.length/2);
    const parts=await Promise.all([loadChronicle(sources.slice(0,middle),origin,signal,request),loadChronicle(sources.slice(middle),origin,signal,request)]);
    return mergeSameEntities(mergeParts(parts));
  }
  const response=await request('/api/chronicle?'+new URLSearchParams({sources:sources.join(','),origin}),{signal});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'시대 정보를 불러오지 못했습니다.');
  if(!data.hasMore)return mergeSameEntities(data);
  if(sources.length===1)throw new Error('한 사료의 기록이 한 번에 불러올 양을 넘었습니다. 전체를 보여줄 수 없어 불러오기를 멈췄습니다.');
  const middle=Math.ceil(sources.length/2);
  const parts=await Promise.all([loadChronicle(sources.slice(0,middle),origin,signal,request),loadChronicle(sources.slice(middle),origin,signal,request)]);
  return mergeSameEntities(mergeParts(parts));
}
