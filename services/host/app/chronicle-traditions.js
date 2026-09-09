/** A story's setting is separate from the year of a historical event. */
export function planTraditions(data,narratives){
  const claims=new Map(data.claims.map(c=>[c.id,c])),entities=new Map(data.entities.map(e=>[e.id,e]));
  return narratives.filter(n=>entities.get(n.entityId)?.type==='Narrative'&&n.claimIds.length&&n.claimIds.every(id=>claims.has(id)))
    .map(n=>({id:n.id,entityId:n.entityId,kind:'event',year:null,label:n.title,archetype:'tradition',narrative:n,
      detail:'설화·전승의 무대 · 연도별 사건과 별도',summary:n.summary,claimIds:n.claimIds,
      scenePlace:{...n.place,coordinates:n.place.displayCoordinates||[n.place.lon,n.place.lat]},sites:[],effects:{},sides:[],
      participants:[...claims.values()].filter(c=>c.subject===n.entityId&&c.object.kind==='entity'&&entities.get(c.object.id)?.type==='Person')
        .map(c=>({entityId:c.object.id,label:entities.get(c.object.id).label,presence:'related',
          role:c.predicate==='syj:hasCharacter'?'전승 속 등장인물':'전승 관련 인물',claimIds:[c.id]}))}));
}
