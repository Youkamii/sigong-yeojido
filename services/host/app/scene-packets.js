// #186: 교과서 항목 장면이 같은 사건을 다시 다루면 기존 패킷에 supersededBy 가 붙고, 화면에는 항목 장면만 보인다.
export const visiblePackets=(packets=[])=>packets.filter(packet=>!packet.supersededBy);

// Claims remain available, but must not recreate a hidden packet as a generic event.
export function visiblePacketEvents(events,packets=[]){
  const visible=visiblePackets(packets),ids=new Set(visible.map(packet=>packet.id));
  const entities=new Set(visible.map(packet=>packet.eventId));
  const hidden=packets.filter(packet=>!ids.has(packet.id));
  const hiddenIds=new Set(hidden.map(packet=>packet.id));
  const hiddenSpans=new Map();
  for(const packet of hidden)if(!entities.has(packet.eventId))
    hiddenSpans.set(packet.eventId,[...(hiddenSpans.get(packet.eventId)||[]),[packet.startYear,packet.endYear]]);
  const inHiddenSpan=event=>(hiddenSpans.get(event.id)||[]).some(([lo,hi])=>!(event.hi<lo||event.lo>hi));
  return events.filter(event=>event.sceneId?!hiddenIds.has(event.sceneId):!inHiddenSpan(event));
}
