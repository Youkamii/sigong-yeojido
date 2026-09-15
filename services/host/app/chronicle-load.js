/** 서버에 보낼 sources 질의값: 기본 묶음 그대로면 '@default' 한 토큰(2,700개 id 를 URL 에 싣지 않는다), 아니면 id 목록. */
export const sourcesParam=(on,primary)=>primary&&on.size===primary.size&&[...on].every(id=>primary.has(id))?'@default':[...on].join(',');
/** Fetch all selected sources even when their combined response exceeds the API limit. */
export async function loadChronicle(sources,origin,signal,request=fetch){
  if(!sources.length)return {entities:[],claims:[],hasMore:false};
  if(sources.length>1&&sources.join(',').length>48000){  // 요청줄 64KB 한도 — 목록이 길면 먼저 반으로
    const middle=Math.ceil(sources.length/2);
    const parts=await Promise.all([loadChronicle(sources.slice(0,middle),origin,signal,request),loadChronicle(sources.slice(middle),origin,signal,request)]);
    return {entities:[...new Map(parts.flatMap(p=>p.entities).map(e=>[e.id,e])).values()],
      claims:[...new Map(parts.flatMap(p=>p.claims).map(c=>[c.id,c])).values()].sort((a,b)=>a.id.localeCompare(b.id)),hasMore:false};
  }
  const response=await request('/api/chronicle?'+new URLSearchParams({sources:sources.join(','),origin}),{signal});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'시대 정보를 불러오지 못했습니다.');
  if(!data.hasMore)return data;
  if(sources.length===1)throw new Error('한 사료의 기록이 조회 한도를 넘었습니다. 일부 기록만 표시하지 않고 조회를 멈췄습니다.');
  const middle=Math.ceil(sources.length/2);
  const parts=await Promise.all([loadChronicle(sources.slice(0,middle),origin,signal,request),loadChronicle(sources.slice(middle),origin,signal,request)]);
  return {entities:[...new Map(parts.flatMap(p=>p.entities).map(e=>[e.id,e])).values()],
    claims:[...new Map(parts.flatMap(p=>p.claims).map(c=>[c.id,c])).values()].sort((a,b)=>a.id.localeCompare(b.id)),hasMore:false};
}
