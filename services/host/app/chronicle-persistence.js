import {figureArchetype} from './period-figures.js';
import {buildingArchetype} from './period-buildings.js';
import {settlementStyle,SETTLEMENT_RADIUS} from './historical-regions.js';
// These are the text-driven visual choices in composeHistoricalEvent.
// Evidence, labels and the current year remain fresh on rows, not in mesh identity.
const actionPatterns=[/누리호|발사체/,/황룡사|불국사|감은사|흥륜사|사찰|사원/,
  /지하철|철도|열차/,/제철|고로|공업단지|공업센터|원자력발전소/,/기공식/,/원자력발전소/,
  /가얏고|가야금|음악 전습/,/가르|배우|배운|전습/,/구휼/,/곡식|구휼미/,/고속도로/,
  /분신|자해/,/대장경판|경판|판목/,/화형식|법전.*태/,/백자|관요|사기제조장|분원리/,
  /벽골제|청못|청제|수리 시설|관개/,/강학|강의|교육|서당|서원|성균관|학교|학사/,
  /장시|시장|교역|무역|상업/];
export function sceneVisualKey(event,position,compact,maxRadius){
  const visualActions={...event.visualActions};
  if(visualActions.constructionYears)visualActions.constructionYears=visualActions.constructionYears.includes(event.year);
  const actions=[event.label,event.summary,JSON.stringify(event.visualActions||'')].join(' ');
  const sea=event.scenePlace?event.scenePlace.medium==='sea':event.archetype==='naval';
  const radius=event.archetype==='settlement'?SETTLEMENT_RADIUS:event.archetype==='tradition'?16:sea?45:['siege','battle'].includes(event.archetype)?36:24;
  return JSON.stringify({position:position.toArray(),compact,
    maxRadius:compact?null:Math.min(maxRadius,radius*(event.scenePlace?.displayScale||1)),
    cityStyle:event.archetype==='settlement'?settlementStyle(event):null,
    figureStyle:figureArchetype('commoner',event.year),buildingStyle:buildingArchetype('house',event.year),
    archetype:event.archetype,modern:event.year>=1876,building:/원자력발전소/.test(actions)&&event.year<event.endYear,
    medium:event.scenePlace?.medium,scale:event.scenePlace?.displayScale,
    fortressWidth:visualActions.fortress?event.scenePlace.label.length%3:null,
    actions:actionPatterns.map(pattern=>pattern.test(actions)),landing:/상륙/.test(event.label),
    visualActions,effects:Object.fromEntries(Object.entries(event.effects||{}).map(([id,value])=>[id,value.enabled])),
    narrative:event.narrative?.id,sides:(event.sides||[]).map(p=>[p.side,p.presence]),
    participants:event.participants.map(p=>[p.id,p.entityId,p.presence,p.side,p.archetype,
      /명나라 수군|명 수군/.test(p.role),/가르친|악사/.test(p.role),/가얏고|가야금/.test(p.role),/춤/.test(p.role)])});
}
