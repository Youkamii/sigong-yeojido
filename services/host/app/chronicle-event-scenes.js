import * as THREE from 'three';
import {figureArchetype} from './period-figures.js';
import {buildingArchetype} from './period-buildings.js';
import {settlementLayout,SETTLEMENT_RADIUS} from './historical-regions.js';
import {urbanRegionAt} from './urban-regions.js';
import {facilityDisplayScale} from './facility-scale.js';
import {HERITAGE_TYPES,HERITAGE_DISPLAY,heritageLook} from './heritage-models.js';
import {sceneRadius} from './chronicle-persistence.js';
import {hash32} from './util.js';

/** #173: 패킷의 sceneFunction 이 문자열 분기보다 먼저 구성을 정한다. */
export const SCENE_FUNCTIONS=['rail_station','temple','print_workshop','migration','persecution','naval_expedition','civil_conflict','uprising_battle','market','relief','construction_site','fortress','harbor','kiln','irrigation'];
const CONFLICT_FUNCTIONS=['civil_conflict','uprising_battle'];
const STANCE_ACTIONS={attacker:'attacking',defender:'defending',bystander:'idle',victim:'idle',marching:'walking',worker:'working'};
const SETTING_STAGES={palace:'palace',office:'academy_hall',academy:'academy_hall',temple:'pagoda',village:'house',battle:'banner'};
const settingStage=setting=>Object.hasOwn(SETTING_STAGES,setting)?SETTING_STAGES[setting]:undefined;

function fireAt(group,position,scale,animated){
  const fire=new THREE.Group();fire.position.copy(position);fire.scale.setScalar(scale);group.add(fire);
  const flames=[];
  for(let i=0;i<7;i++){
    const material=new THREE.MeshStandardMaterial({color:i%2?'#ed9e39':'#c24b25',emissive:'#b64112',emissiveIntensity:.7,roughness:1,flatShading:true});
    const flame=new THREE.Mesh(new THREE.ConeGeometry(.7+i%3*.22,2.5+i%3,5),material);
    flame.position.set(Math.cos(i*2.4)*1.1,1.4,Math.sin(i*2.4)*.9);fire.add(flame);flames.push(flame);
  }
  const smoke=[];
  const material=new THREE.MeshStandardMaterial({color:'#5b5650',transparent:true,opacity:.38,depthWrite:false,flatShading:true});
  for(let i=0;i<7;i++){
    const cloud=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2,0),material);fire.add(cloud);smoke.push(cloud);
  }
  fire.name='event-fire';
  animated.push({update(t){
    flames.forEach((f,i)=>{f.scale.y=.85+Math.sin(t*6+i)*.22;f.rotation.z=Math.sin(t*3+i)*.15;});
    smoke.forEach((s,i)=>{const phase=(t*.17+i/7)%1;s.position.set(phase*4+Math.sin(i)*.7,3+phase*12,Math.cos(i)*phase*2);s.scale.setScalar(.6+phase*1.8);});
  }});
}

/** Local composition explains the event; these offsets are not new geographic facts. */
export function composeHistoricalEvent(event,position,world){
  const facility=event.continuing?.kind==='facility';
  const facilityLook=facility?event.continuing.facilityLook:null;
  // 시설은 건립 종료 당시 외형을 유지하며 당시 인물과 사건 효과를 재연하지 않는다.
  if(facility)event={...event,year:event.endYear??event.continuing.sinceYear-1,participants:[],participantGroups:[],sides:[],
    effects:{...event.effects,fire:{enabled:false},attack:{enabled:false}}};
  const group=new THREE.Group(),animated=[],models=[],occupied=[];
  group.userData.sceneId=event.id;
  const seaMedium=event.scenePlace?event.scenePlace.medium==='sea':event.archetype==='naval';
  // #186: 바다 장면인데 기준점이 육지(항구·해안)면 순수 바다 분기(배가 기준점 주변 물에만 섬)가 아니라 배를 해안 밖 바다에 두는 원정 무대로 조립한다.
  // 기준점이 육지일 때 바다 분기를 타면 배가 전부 생략되고 축척도 0 에 가까워져 장면이 사라진다(왜구의 침입·노량 해전 등 12건).
  const landAnchoredSea=seaMedium&&!facility&&world.contains(position.x,position.z);
  const sea=seaMedium&&!landAnchoredSea;
  const navalStage=!facility&&!event.sceneFunction&&(landAnchoredSea||!sea&&event.archetype==='naval'&&Boolean(event.itemId));
  const actions=[facility?event.title||event.label:event.label,event.summary,JSON.stringify(event.visualActions||'')].join(' ');
  const stageText=[event.title||event.label,event.summary].join(' ');  // visualActions 서술문은 제외한다(정규식 오탐)
  const modern=event.year>=1876,shipType=modern?'motor_ship':'ship';
  const alliedFleet=event.participants.some(p=>p.presence==='on-site'&&p.side==='naval'&&/명나라 수군|명 수군/.test(p.role));
  const soldier=modern?'rifle_soldier':'spearman';
  const launch=!facility&&modern&&/누리호|발사체/.test(actions);
  const temple=!facility&&/황룡사|불국사|감은사|흥륜사|사찰|사원/.test(actions)&&event.archetype==='construction';
  const rail=!facility&&modern&&/지하철|철도|열차/.test(actions);
  const facilityHarbor=facilityLook==='industry'&&/항만|부두|축항/.test(actions);
  const industry=facility?facilityLook==='industry'&&!facilityHarbor:modern&&/제철|고로|공업단지|공업센터|원자력발전소/.test(actions);
  const groundbreaking=!facility&&industry&&/기공식/.test(actions),power=industry&&(facility?/발전소/:/원자력발전소/).test(actions);
  const music=!facility&&!sea&&/가얏고|가야금|음악 전습/.test(actions)&&/가르|배우|배운|전습/.test(actions);
  const relief=!facility&&!sea&&(/구휼/.test(actions)&&/곡식|구휼미/.test(actions)||!event.sceneFunction&&event.archetype==='relief');
  const road=!facility&&modern&&/고속도로/.test(actions),personalFire=!facility&&/분신|자해/.test(actions),blockFire=!facility&&/대장경판|경판|판목/.test(actions)&&event.effects.fire?.enabled;
  const paperFire=blockFire||personalFire&&/화형식|법전.*태/.test(actions);
  const kiln=!facility&&(/백자|관요|사기제조장|분원리/.test(actions)||!event.sceneFunction&&event.archetype==='excavation'&&event.year>=-500&&/요지|가마|자기|청자|백자|분청|도자|굽/.test(stageText)),irrigation=!facility&&/벽골제|청못|청제|수리 시설|관개/.test(actions);
  // participantGroups 가 있으면 sides 기반 invaders 플래그는 무시한다 (집단이 stance 로 배치를 정한다).
  const groups=Array.isArray(event.participantGroups)&&event.participantGroups.length?event.participantGroups:null;
  const functionGroups=groups&&!facility&&['market','relief','construction_site','fortress','harbor','kiln','irrigation'].includes(event.sceneFunction);
  const invaders=!groups&&(event.effects.attack?.enabled||[...(event.sides||[]),...event.participants].some(p=>p.side==='invader'&&p.presence==='on-site'));
  const harbor=facility?facilityHarbor:!sea&&['construction','naval'].includes(event.archetype)&&event.effects.ships?.enabled;
  const teaching=!facility&&!sea&&/강학|강의|교육|서당|서원|성균관|학교|학사/.test(actions)&&['court','publication','assembly'].includes(event.archetype);
  const market=!facility&&!sea&&(/장시|시장|교역|무역|상업/.test(actions)&&['court','construction'].includes(event.archetype)||!event.sceneFunction&&event.archetype==='market');
  const fortress=!facility&&event.visualActions?.fortress;
  const sceneFunction=(facility?['temple','rail_station']:SCENE_FUNCTIONS).includes(event.sceneFunction)&&(!facility||['temple','rail_station'].includes(facilityLook))?event.sceneFunction:null;
  // #186: 항목 공사 장면만 제목·요약으로 무대를 고른다(옛 장면은 한 글자 매칭 오탐이 있어 제외). 한 글자 대안(성·사·절·궁)은 쓰지 않는다.
  const constructionStage=!facility&&!event.sceneFunction&&!sea&&event.archetype==='construction'&&event.itemId
    ?/고인돌|지석묘|거석|선돌/.test(stageText)?'megalith':/성곽|산성|읍성|도성|토성|나성|축성/.test(stageText)?'fortress'
      :(event.scenePlace?.setting==='palace'||/궁궐|궁성|경복궁|창덕궁|창경궁|덕수궁|경희궁/.test(stageText))?'palace_construction'
      :(event.scenePlace?.setting==='temple'||/사찰|사원|법당|석탑|목탑|불사/.test(stageText))?'temple'
      :modern&&/정책|계획|운동|기지화|공업|산업|개발/.test(stageText)?'industry':null:null;
  const fallbackKind=constructionStage||(navalStage?'naval_expedition':event.archetype);
  const compositionKind=['portrait','heritage'].includes(event.archetype)?event.archetype:facilityLook==='palace'?'palace':(sceneFunction==='construction_site'?'construction':sceneFunction)||(fortress?'fortress':music?'music':relief?'relief':kiln?'kiln':irrigation?'irrigation':launch?'launch':temple?'temple':rail?'rail':groundbreaking?'groundbreaking':power?'power':industry?'industry':road?'road':harbor?'harbor':teaching?'teaching':market?'market':fallbackKind);
  const kindIs=(kind,fallback)=>sceneFunction?compositionKind===kind:fallback;
  const newStage=kind=>!facility&&!event.sceneFunction&&compositionKind===kind;
  // 현장 군주 참여자: asset-plan 은 role 을 한글('군주')로 바꿔 넘기고 옛 장면은 서술 역할('국왕'·'임금'·'…왕')을 쓴다. 왕비·왕자는 군주가 아니다.
  const isRuler=p=>p.presence==='on-site'&&(/ruler$/.test(p.archetype||'')||['ruler','군주'].includes(p.role)||/국왕|임금|대왕/.test(p.role||'')||(/왕/.test(p.role||'')&&!/왕비|왕자|왕후|왕세자|왕족|왕실/.test(p.role)));
  const singleModel=['portrait','heritage'].includes(event.archetype);
  let displayScale=singleModel?HERITAGE_DISPLAY.scale:event.scenePlace?.displayScale||1;
  const urbanRegion=event.archetype==='settlement'&&event.scenePlace?.coordinates
    &&urbanRegionAt(...event.scenePlace.coordinates,event.year);
  if(urbanRegion)displayScale*=urbanRegion.radius/SETTLEMENT_RADIUS;
  if(sea){
    let clearance=35;
    for(let r=.1;r<35;r*=1.25){
      if(Array.from({length:24},(_,i)=>i*Math.PI/12).some(a=>world.contains(position.x+Math.cos(a)*r,position.z+Math.sin(a)*r))){clearance=r/1.25;break;}
    }
    // #186: 좁은 물길(한산도·명량)에서는 배가 점만큼 줄어 보이지 않는다 → 하한 .3(뭍에 조금 걸치더라도 장면이 보이게)
    displayScale=Math.min(displayScale,Math.max(clearance/48,.3));
  }
  if(facility&&!singleModel)displayScale=facilityDisplayScale(displayScale,position,world);
  // #186: 항목 해군 장면은 배가 바다에 놓이므로 compact 여도 축소하지 않는다(축소하면 먼바다의 점으로만 보인다).
  if(event.compact&&!singleModel&&!navalStage)displayScale*=.16;
  const radius=sceneRadius(event,facility,sea);
  // #186: 다른 장면과 같은 점에 서면 maxRadius 가 0 이 되어 축척 0 → 조형 좌표가 전부 NaN(콘솔 computeBoundingSphere 경고). 최소 1 단위는 남긴다.
  if((singleModel||!event.compact)&&Number.isFinite(event.maxRadius))displayScale=Math.min(displayScale,Math.max(event.maxRadius,1)/radius);
  const model=(archetype,dx,dz,scale=1,extra={})=>{
    if(facility&&(/worker|handcart|groundbreaking|building_frame|human|figure|monk|scribe|spearman|soldier|commander|ruler|scholar/.test(archetype)||extra.person||extra.role||extra.action==='working'))return;
    if(!modern)archetype=({palace:'korean_hall',house:'korean_house',gatehouse:'korean_gate',academy_hall:'korean_academy',courtyard_house:'korean_courtyard'})[archetype]||archetype;
    dx*=displayScale;dz*=displayScale;scale*=displayScale;
    let x=position.x+dx,z=position.z+dz;
    const onWater=extra.medium?extra.medium==='sea':sea;
    if(!onWater&&!world.contains(x,z)){
      if(event.archetype==='settlement'){
        if(!extra.primary||!world.contains(position.x,position.z))return;
        x=position.x;z=position.z;
      }else{
        x=position.x+dx*.4;z=position.z+dz*.4;
        if(!world.contains(x,z)){
          // #186: 무대 건물(primary)이 물에 빠지면 기준점에 세워 장면 전체가 사라지지 않게 한다.
          if(!extra.primary||!world.contains(position.x,position.z))return;
          x=position.x;z=position.z;
        }
      }
    }
    if(onWater&&world.contains(x,z)){
      // #186: 좁은 물길에서 대표 배가 뭍에 걸리면 기준점(물)에 세워 장면이 사라지지 않게 한다.
      if(!extra.primary||world.contains(position.x,position.z))return;
      x=position.x;z=position.z;
    }
    const p=new THREE.Vector3(x,onWater?world.seaLevel:world.surfaceAt(x,z),z);
    const row={archetype,position:p,scale,...extra,lift:(extra.lift||0)*displayScale};models.push(row);occupied.push({...p,radius:(archetype==='spearman'?1.7:3)*displayScale});
    return row;
  };
  const standard=(row,side,lift=0)=>{
    if(!row)return;
    const flag=new THREE.Mesh(new THREE.BoxGeometry(2.8,.9,.12),new THREE.MeshStandardMaterial({color:side==='invader'||side==='b'?'#9a4435':row.fleet==='ming'?'#a58030':'#346978',roughness:1}));
    flag.position.copy(row.position);flag.position.y+=(lift+2)*displayScale;flag.scale.setScalar(displayScale);
    flag.name='event-side-'+side;flag.userData.fleet=row.fleet||side;group.add(flag);
  };
  const flagColor=side=>side==='invader'||side==='b'?'#9a4435':side==='a'||side==='naval'||side==='defender'?'#346978':null;
  const construction=!facility&&(event.visualActions?.constructionYears?.includes(event.year)||event.visualActions?.construction===true
    ||(event.archetype==='construction'&&(event.endYear==null||event.year<=event.endYear)));
  const shoreward=(range=48)=>{
    for(let r=1;r<range;r+=1)for(let i=0;i<48;i++){
      const angle=i*Math.PI/24,dx=Math.cos(angle)*r,dz=Math.sin(angle)*r;
      if(!world.contains(position.x+dx*displayScale,position.z+dz*displayScale))return {dx,dz,angle};
    }
    return null;
  };
  /** 참여 집단 루프: role→모델, stance→동작·배치, side→깃발 색. 배치 좌표와 count 는 표현용이며 사료의 인원수·위치 주장이 아니다. */
  const composeGroups=(primary=false)=>{
    const counters={};
    groups.forEach((g,gi)=>{
      if(event.compact&&models.some(m=>m.primary))return;
      const stance=STANCE_ACTIONS[g.stance]?g.stance:'bystander',action=STANCE_ACTIONS[stance];
      const archetype=figureArchetype(g.role,event.year),count=Math.max(0,Math.min(event.compact?1:40,Math.trunc(Number(g.count)||0)));
      const extra={side:g.side||'c',stance,role:g.role,groupLabel:g.label,groupIndex:gi,action};
      const seed=hash32([event.id,g.label||'',g.role||'',stance,String(gi)].join('|'));
      const rows=[];
      for(let i=0;i<count;i++){
        const n=counters[stance]||0;counters[stance]=n+1;
        let dx,dz;
        if(stance==='attacker'){dx=-17+(n%5)*8;dz=13+Math.floor(n/5)*7;}
        else if(stance==='defender'){dx=-20+(n%5)*8;dz=-8-Math.floor(n/5)*7;}
        else if(stance==='marching'){dx=-22+n*4;dz=2;}
        else if(stance==='worker'){dx=-12+(n%6)*5;dz=10+Math.floor(n/6)*5;}
        else{
          // 주거 쪽(-x) 군집 · 반경 6 안 결정론 무작위 (hash32 기반, 격자 아님)
          const h=hash32(seed+':'+n),angle=(h%3600)/3600*Math.PI*2,rad=Math.sqrt(((h>>>12)%1000)/1000)*6;
          dx=-24+Math.cos(angle)*rad;dz=Math.sin(angle)*rad;
        }
        const row=model(archetype,dx,dz,1.5,extra);
        if(row){if(primary&&!models.some(m=>m.primary))row.primary=true;rows.push(row);}
      }
      if(!event.compact&&rows.length&&flagColor(g.side)){
        const ax=rows.reduce((t,r)=>t+r.position.x,0)/rows.length,az=rows.reduce((t,r)=>t+r.position.z,0)/rows.length;
        const off=stance==='defender'?-4:4;
        standard(model('banner',(ax-position.x)/displayScale+off,(az-position.z)/displayScale+off,1.8,{side:g.side,groupIndex:gi}),g.side,4);
      }
    });
  };
  if(compositionKind==='portrait'){
    // #186: 무대(사건 행)와 인물 조형(인물 행, 아래 참여자 루프)이 함께 선다. 항목 인물 장면의 주인공은 사료 선택과 무관하게 asset-plan 이 넘긴다.
    // 전장 무대는 성벽이 아니라 군기다(성벽만 서고 인물이 빠지면 인물이 성벽으로 보였다).
    const stage=settingStage(event.scenePlace?.setting)||'heritage_site';
    model(stage,0,-4,stage==='banner'?1.4:.65,{primary:true});
    if(!event.compact&&groups){
      let count=0;
      for(const g of groups)for(let i=0;i<Math.max(0,Math.trunc(Number(g.count)||0))&&count<4;i++){
        model(figureArchetype(g.role,event.year),-3+count*2,3,1,{role:g.role,action:'idle'});count++;
      }
    }
  }else if(compositionKind==='heritage'){
    const type=HERITAGE_TYPES.includes(event.heritageType)?event.heritageType:'site';
    const look=heritageLook(type,event.title||event.label);
    if(look==='fortress'){
      model('gatehouse',0,0,.8,{primary:true});
      for(const x of [-4,4])model('wall',x,0,.65);
    }else if(look==='prison'){
      model('wall',0,0,.8,{primary:true});
      for(const [x,z] of [[-5,3],[5,3]])model('house',x,z,.5);
    }else if(look==='memorial'){
      model('heritage_stele',0,0,.9,{primary:true});
      for(const [x,z] of [[-5,-3],[5,-3],[-6,4],[6,4]])model('pine',x,z,1.1);
    }else model(look==='hall'?buildingArchetype('korean_hall',Math.min(event.year,1875)):
      look==='pagoda'?'heritage_pagoda_'+(event.heritageFloors===5?5:3):look,0,0,1,{primary:true});
  }else if(facilityLook==='palace'){
    model(modern?'civic_hall':'palace',0,0,1.8,{primary:true});
  }else if(sceneFunction==='rail_station'){
    model('station',0,-10,1.4,{primary:true});
    if(!event.compact){
      const base=new THREE.Mesh(new THREE.BoxGeometry(65*displayScale,.12*displayScale,4*displayScale),new THREE.MeshStandardMaterial({color:'#817765',roughness:1}));
      base.position.set(position.x,position.y+.07*displayScale,position.z+8*displayScale);group.add(base);
      model('train',0,8,.9);
      if(construction){model('handcart',18,-1,1.1);for(let i=0;i<6;i++)model('field_worker',-13+i*5,-1,1.5,{action:'working',role:'worker'});}
      else for(let i=0;i<4;i++)model('human',-8+i*5,-1,1.5);
    }
  }else if(sceneFunction==='temple'){
    model('pagoda',0,0,1.8,{primary:true});
    if(!event.compact){
      model('academy_hall',0,-16,1.8);
      if(construction){model('handcart',15,9,1.1);for(let i=0;i<6;i++)model('field_worker',-12+i*5,12,1.5,{action:'working',role:'worker'});}
      else{model('period_monk',-6,9,1.5);model('period_monk',6,9,1.5);}
    }
  }else if(sceneFunction==='print_workshop'){
    model('academy_hall',0,-13,1.7,{primary:true});
    if(!event.compact){
      for(const x of [-9,0,9]){model('table',x,0,1.5);model('book',x,0,1.4,{lift:2.6});}
      if(groups)composeGroups();
      else{
        const printer=figureArchetype('printer',event.year);
        for(let i=0;i<6;i++)model(printer,-11+(i%3)*9,i<3?4:-4,1.5,{action:'working',role:'printer'});
      }
    }
  }else if(sceneFunction==='migration'||newStage('migration')){
    model('handcart',0,0,1.3,{primary:true});
    if(!event.compact){
      const civilian=figureArchetype('civilian',event.year);
      for(let i=0;i<12;i++)model(civilian,-24+i*4,3,1.5,{action:'walking',role:'civilian',stance:'marching'});
      model('handcart',14,0,1.2);
    }
  }else if(sceneFunction==='persecution'){
    if(groups)composeGroups(true);
    else{
      const civilian=figureArchetype('civilian',event.year);
      model(civilian,0,0,1.6,{primary:true,role:'civilian',stance:'victim',action:'idle'});
      if(!event.compact){
        // 전각(palace) 없음 · 군집은 결정론 무작위(반경 6) · 무릎/서기 동작이 없으므로 idle
        const seed=hash32(event.id+'|persecution');
        for(let i=1;i<10;i++){
          const h=hash32(seed+':'+i),angle=(h%3600)/3600*Math.PI*2,rad=Math.sqrt(((h>>>12)%1000)/1000)*6;
          model(civilian,Math.cos(angle)*rad,Math.sin(angle)*rad,1.5,{role:'civilian',stance:'victim',action:'idle'});
        }
        for(const [x,z] of [[-10,4],[10,4],[0,-10]])model(soldier,x,z,1.5,{action:'defending',role:'soldier',stance:'defender'});
      }
    }
  }else if(sceneFunction==='naval_expedition'||newStage('naval_expedition')){
    // place 가 육지면 해안 방향(없으면 +z 18)으로 배 3척, 해안에 사람 4명
    const shore=sea?null:shoreward(),dir=shore||{dx:0,dz:18,angle:Math.PI/2};
    const fleetSide=groups?.find(g=>g.stance==='attacker'||g.stance==='marching')?.side||'naval';
    for(let i=0;i<(event.compact&&!sceneFunction?1:3);i++){
      const dx=sea?-13+i*13:dir.dx+Math.cos(dir.angle)*(6+i*8),dz=sea?(i-1)*10:dir.dz+Math.sin(dir.angle)*(6+i*8);
      standard(model(shipType,dx,dz,i?1.1:1.5,{medium:'sea',side:fleetSide,primary:i===0}),fleetSide,modern?3:7);
    }
    if(!models.some(m=>m.primary))model('boat_slip',0,0,1,{primary:true});  // 닿는 물이 없으면 선착장으로 장면을 남긴다
    if(!event.compact&&!sea)for(let i=0;i<4;i++)model('human',dir.dx*.6-6+i*4,dir.dz*.6,1.5,{medium:'land',action:'idle'});
    if(!event.compact&&groups)composeGroups();
  }else if(CONFLICT_FUNCTIONS.includes(sceneFunction)||(!sceneFunction&&groups&&event.archetype==='battle')){
    model('banner',0,0,1.8,{primary:true,side:groups?'c':'defender'});
    if(!event.compact){
      if(groups)composeGroups();
      else{
        for(let i=0;i<10;i++)model(soldier,-20+(i%5)*8,-8-Math.floor(i/5)*7,1.5,{side:'defender',action:event.effects.attack?.enabled&&i<3?'defending':'idle'});
        if(invaders)for(let i=0;i<10;i++)model(soldier,-17+(i%5)*8,13+Math.floor(i/5)*7,1.5,{side:'invader',action:event.effects.attack?.enabled&&i<3?'attacking':'idle'});
        standard(model('banner',-24,-12,1.8),'defender',4);if(invaders)standard(model('banner',24,18,1.8),'invader',4);
      }
    }
  }else if(!sceneFunction&&sea){
    model(shipType,-13,0,1.5,{primary:true,side:'naval',fleet:alliedFleet?'joseon':undefined});
    const opposingFleet=[...(event.sides||[]),...event.participants].some(p=>p.side==='invader');
    if(!event.compact&&event.effects.ships?.enabled){
      for(const [x,z,s,side] of [[-24,-15,1.1,'naval'],[-22,17,1.2,'naval'],[17,-14,1.15,'invader'],[24,0,1.05,'invader'],[19,18,1.1,'invader']]){
        if(side!=='invader'||opposingFleet)model(shipType,x,z,s,{side,fleet:alliedFleet&&side==='naval'?(z>0?'ming':'joseon'):undefined});
      }
    }
    models.filter(m=>m.archetype===shipType).forEach(m=>standard(m,m.side,modern?3:7));
    if(!event.compact&&/상륙/.test(event.label)){
      let shore=null;
      for(let r=3;r<90&&!shore;r+=2)for(let i=0;i<32;i++){
        const a=i*Math.PI/16,dx=Math.cos(a)*r,dz=Math.sin(a)*r;
        if(world.contains(position.x+dx*displayScale,position.z+dz*displayScale)){shore={dx,dz};break;}
      }
      if(shore)for(let i=0;i<6;i++)model(modern?'human':'spearman',shore.dx+(i%3)*2,shore.dz+Math.floor(i/3)*2,1.2,{medium:'land',side:'naval',action:'walking'});
    }
  }else if(kindIs('tradition',event.archetype==='tradition')){
    // #186: 교과서 항목의 풍속·제도 장면(kind tradition)은 전승 이야기(narrative)가 없다 → 책 무대로 조립한다.
    const motif=(event.narrative?.id||'').replace('nar-syj136-','');
    const primary={gujibong:'story_egg',cheoyong:'hanging_scroll',seodong:'period_figure',samseong:'story_hollows',
      nakhwaam:'story_rock',ondal:'wall',gwaneumsa:'pagoda',mangbuseok:'standing_stone',arang:'korean_house'}[motif]||'book';
    model(primary,0,0,2,{primary:true});
    if(!event.compact){
      model('book',8,5,1.2);
      if(['gujibong','cheoyong','nakhwaam','arang'].includes(motif))model(motif==='arang'?'oak':'pine',-8,-5,1.1);
      if(motif==='gujibong')model('story_rock',-5,3,.65);
      if(motif==='seodong')model('korean_house',-8,-6,.85);
      if(motif==='ondal')model('period_commander',3,5,1.5);
      if(motif==='gwaneumsa')model('period_monk',-7,4,1.5);
      if(motif==='mangbuseok')model('korean_house',-9,-6,.7);
      if(!motif&&newStage('tradition')){
        if(modern){
          model('civic_hall',0,-14,1.4);model('banner',10,2,1.4);
          for(let i=0;i<4;i++)model('modern_figure',-6+i*4,8,1.5,{role:'civilian',action:'idle'});
        }else{
          model('korean_house',-8,-6,.85);
          const performance=/탈춤|놀이|음악|악|춤|판소리|풍속|풍물|농악/.test(stageText);
          if(performance)model('string_instrument',6,2,1.4);
          for(let i=0;i<(performance?4:2);i++)model('period_figure',-6+i*4,8,1.5,{role:'civilian',action:'idle'});
        }
      }
    }
  }else if(kindIs('music',music)){
    model('string_instrument',-8,0,2,{primary:true});
    if(!event.compact)model('string_instrument',2,7,1.7);
  }else if(kindIs('relief',relief)){
    model('grain_stack',0,0,2.4,{primary:true});
    if(!event.compact){
      model('grain_stack',-9,-2,1.8);model('handcart',-13,6,1.2);model('table',5,4,1.5);
      if(!functionGroups)for(const [x,z] of [[4,8],[10,11],[7,16],[-1,13]])model(modern?'modern_figure':'period_figure',x,z,1.6,{action:'working'});
    }
  }else if(!facility&&!event.sceneFunction&&event.year<-500&&['excavation','settlement'].includes(event.archetype)){
    model('rural_hut',0,-6,1.1,{primary:true});
    if(!event.compact){
      const houses=event.archetype==='settlement'?[[-9,2],[8,3],[-12,-9],[11,-10]]:[[-9,2],[8,3]];
      for(const [x,z] of houses)model('rural_hut',x,z,1.1);
      for(let i=0;i<4;i++)model('rural_figure',-6+i*4,12,1.5,{role:'civilian',action:'idle'});
      model('grain_stack',6,8,.8);
      if((event.archetype==='settlement'?/고인돌|청동/:/고인돌|무덤|묘|거석|매장/).test(stageText))model('standing_stone',-6,-10,1);
      if(event.archetype==='excavation')model('dig_site',12,-8,.6);
    }
  }else if(newStage('excavation')&&(/고분|무덤|왕릉|릉|총/.test(stageText)||/묘/.test(event.title||event.label||''))){
    model('heritage_tomb',0,0,1,{primary:true});
    if(!event.compact){
      for(const [x,z] of [[-10,-6],[10,-6],[-12,7],[12,7]])model('pine',x,z,1.2);
      model('dig_site',12,-8,.6);
    }
  }else if(kindIs('excavation',event.archetype==='excavation'&&!kiln)){
    model('dig_site',0,0,2,{primary:true});
    if(!event.compact){
      model('dig_site',-15,-9,1.2);model('table',13,2,1.2);model('book',13,2,1,{lift:2});
      model('groundbreaking',-10,10,.9);
      for(const [x,z] of [[-8,3],[5,-7],[12,6]])model('modern_figure',x,z,1.6,{action:'working'});
    }
  }else if(kindIs('fortress',fortress)||newStage('fortress')){
    model('gatehouse',0,10,1.4,{primary:true});
    if(!event.compact){
      const width=18+((event.scenePlace?.label||event.label||'').length%3)*3;
      for(const x of [-width,-9,9,width]){model('wall',x,10,1);model('wall',x,-17,1);}
      for(const x of [-width-4,width+4])for(const z of [-10,-1,6])model('fort_wall_side',x,z,1);
      model('rural_store',-9,-6,1.4);model('korean_house',10,-5,1.2);
      if(!facility&&(event.visualActions?.construction||!event.sceneFunction&&construction)){
        model('handcart',-12,18,1.3);model('groundbreaking',8,17,1.2);
        if(!functionGroups)for(const [x,z] of [[-14,6],[12,15],[18,-12]])model('period_figure',x,z,1.5,{action:'working'});
      }else if(event.archetype==='court'){model('table',0,-4,1.5);model('book',0,-4,1.2,{lift:2.5});}
    }
  }else if(kindIs('settlement',event.archetype==='settlement')){
    for(const {archetype,x,z,scale,...extra} of settlementLayout(event))model(archetype,x,z,scale,extra);
    if(!event.compact){
      const patches=[];
      for(const x of event.year<1876?[-48,-40,-8,0,8,40,48]:[])for(const z of [47,55,63]){
        const px=position.x+x*displayScale,pz=position.z+z*displayScale;
        if(world.contains(px,pz)&&world.contains(px+3*displayScale,pz+2*displayScale))patches.push([px,world.surfaceAt(px,pz)+.05*displayScale,pz]);
      }
      const fields=new THREE.InstancedMesh(new THREE.BoxGeometry(5*displayScale,.08*displayScale,3*displayScale),new THREE.MeshStandardMaterial({color:'#8c9252',roughness:1}),patches.length);
      const matrix=new THREE.Matrix4();patches.forEach((p,i)=>fields.setMatrixAt(i,matrix.makeTranslation(...p)));
      fields.name='city-symbolic-fields';if(patches.length)group.add(fields);else{fields.geometry.dispose();fields.material.dispose();}
      const lanes=[];
      for(let i=-8;i<=8;i++)for(const [x,z,sx,sz] of [[i*5,6,4.6,1],[-18,i*5,1,4.6],[18,i*5,1,4.6]]){
        const px=position.x+x*displayScale,pz=position.z+z*displayScale;
        if(world.contains(px,pz))lanes.push([px,world.surfaceAt(px,pz)+.06*displayScale,pz,sx,sz]);
      }
      const street=new THREE.InstancedMesh(new THREE.BoxGeometry(1.1*displayScale,.06*displayScale,1.1*displayScale),new THREE.MeshStandardMaterial({color:event.year>=1945?'#777b76':'#ad9e7e',roughness:1}),lanes.length);
      lanes.forEach(([x,y,z,sx,sz],i)=>{matrix.makeScale(sx,1,sz);matrix.setPosition(x,y,z);street.setMatrixAt(i,matrix);});street.name='city-local-lanes';group.add(street);
    }
  }else if(kindIs('kiln',kiln)){
    model('rural_store',0,-9,2,{primary:true});
    if(!event.compact){
      const kiln=new THREE.Mesh(new THREE.CylinderGeometry(3,4,3.5,10),new THREE.MeshStandardMaterial({color:'#a48768',roughness:1}));
      kiln.scale.setScalar(displayScale);kiln.position.set(position.x-10*displayScale,world.surfaceAt(position.x-10*displayScale,position.z)+1.75*displayScale,position.z);group.add(kiln);
      for(const x of [-1,8,17]){model('table',x,5,1.5);for(let i=0;i<3;i++){
        const jar=new THREE.Mesh(new THREE.SphereGeometry(.6,8,6),new THREE.MeshStandardMaterial({color:'#e4dfc9',roughness:.6}));
        jar.scale.set(displayScale*.8,displayScale,displayScale*.8);jar.position.set(position.x+(x+i*1.4-1.4)*displayScale,world.surfaceAt(position.x+x*displayScale,position.z+5*displayScale)+2.8*displayScale,position.z+5*displayScale);group.add(jar);
      }}
      model('handcart',-12,10,1.1);if(!functionGroups)for(let i=0;i<5;i++)model('human',-5+i*5,12,1.4,{action:'working'});
    }
  }else if(kindIs('irrigation',irrigation)){
    model('rural_hut',-20,-9,1.5,{primary:true});
    if(!event.compact){
      const water=new THREE.Mesh(new THREE.PlaneGeometry(34*displayScale,19*displayScale),new THREE.MeshStandardMaterial({color:'#668f8e',roughness:.6,side:THREE.DoubleSide}));
      water.rotation.x=-Math.PI/2;water.position.set(position.x,position.y+.15*displayScale,position.z);water.userData.fanGround=true;group.add(water);
      for(let i=0;i<10;i++){
        const x=position.x+(-19+i*4)*displayScale,z=position.z+11*displayScale;
        const bank=new THREE.Mesh(new THREE.BoxGeometry(4.1*displayScale,1.8*displayScale,3*displayScale),new THREE.MeshStandardMaterial({color:'#958764',roughness:1}));
        bank.position.set(x,world.surfaceAt(x,z)+.9*displayScale,z);group.add(bank);
      }
      if(!facility&&event.visualActions?.constructionYears?.includes(event.year)){model('handcart',-12,17,1.2);if(!functionGroups)for(let i=0;i<5;i++)model('human',-8+i*4,16,1.4,{action:'working'});}
    }
  }else if(kindIs('launch',launch)){
    model('rocket',0,0,1.7,{primary:true});
    if(!event.compact){model('civic_hall',18,-14,1);model('car',16,6,1.2);
      for(let i=0;i<4;i++)model('human',12+i*4,13,1.5);}
  }else if(kindIs('temple',temple)||newStage('temple')){
    model('pagoda',0,0,1.8,{primary:true});
    if(!event.compact){model('academy_hall',0,-16,1.8);
      if(facility){model('period_monk',-6,9,1.5);model('period_monk',6,9,1.5);}
      else{model('handcart',15,9,1.1);for(let i=0;i<6;i++)model('human',-12+i*5,12,1.5,{action:'working'});}}
  }else if(!sceneFunction&&(rail||road)){
    model(rail?'station':'civic_hall',0,-10,1.4,{primary:true});
    if(!event.compact){
      const length=65*displayScale,width=(rail?4:8)*displayScale;
      const base=new THREE.Mesh(new THREE.BoxGeometry(length,.12*displayScale,width),new THREE.MeshStandardMaterial({color:rail?'#817765':'#777b76',roughness:1}));
      base.position.set(position.x,position.y+.07*displayScale,position.z+8*displayScale);group.add(base);
      for(const x of [-20,0,20])model(rail?'train':'car',x,8,rail?.9:1.2);
      for(let i=0;i<8;i++)model('human',-13+i*4,-1,1.5);
      model('banner',-15,0,1.5);model('banner',15,0,1.5);
    }
  }else if(kindIs('groundbreaking',groundbreaking)){
    model('groundbreaking',0,0,2.4,{primary:true});
  }else if(kindIs('power',power)){
    const building=event.year<event.endYear?'building_frame':'power_facility';
    model(building,0,0,2,{primary:true});
    if(!event.compact&&building==='building_frame')model('groundbreaking',-13,8,1.3);
  }else if(kindIs('industry',industry)||newStage('industry')){
    model('steelworks',0,0,1.6,{primary:true});
    if(!event.compact){model('civic_hall',18,-7,1.0);model('car',14,13,1.2);
      for(let i=0;i<6;i++)model('human',-12+i*5,12,1.5,{action:'working'});}
  }else if(!sceneFunction&&(personalFire||blockFire)){
    model(paperFire?'book':'banner',0,0,paperFire?1.5:2,{primary:true});
    if(!event.compact){model(blockFire?'academy_hall':'market',0,-12,1.5);for(let i=0;i<6;i++)model(blockFire?'book':'human',-9+i*4,5,1.5);}
  }else if(kindIs('harbor',harbor)){
    model(facility?'boat_slip':'courtyard_house',0,0,1.4,{primary:true});
    if(!event.compact){
      let shore=null;
      for(let r=1;r<48&&!shore;r+=1)for(let i=0;i<48;i++){
        const angle=i*Math.PI/24,dx=Math.cos(angle)*r,dz=Math.sin(angle)*r;
        if(!world.contains(position.x+dx*displayScale,position.z+dz*displayScale)){
          shore={dx,dz,angle};break;
        }
      }
      model('table',-8,6,1.5);model('handcart',8,5,1.1);
      if(!functionGroups)for(let i=0;i<4;i++)model('human',-10+i*5,8,1.5,{action:'working',side:'naval'});
      if(shore){
        const {dx,dz,angle}=shore;
        model('boat_slip',dx*.7,dz*.7,1.0);
        for(let i=0;i<3;i++){
          const sx=dx+Math.cos(angle)*(8+i*8),sz=dz+Math.sin(angle)*(8+i*8);
          model(i?'boat':'ship',sx,sz,i?.8:1.1,{medium:'sea',side:'naval'});
        }
      }
      for(let i=0;!facility&&i<5;i++){
        const timber=new THREE.Mesh(new THREE.BoxGeometry(5,.55,.7),new THREE.MeshStandardMaterial({color:'#97764c',roughness:1}));
        timber.scale.setScalar(displayScale);timber.position.set(position.x-5*displayScale,position.y+(.4+i%2*.6)*displayScale,position.z+(11+i*.8)*displayScale);
        group.add(timber);
      }
    }
  }else if(kindIs('battle',event.archetype==='battle')){
    model('banner',0,0,1.8,{primary:true,side:'defender'});
    if(!event.compact){
      for(let i=0;i<10;i++)model(soldier,-20+(i%5)*8,-8-Math.floor(i/5)*7,1.5,{side:'defender',action:event.effects.attack?.enabled&&i<3?'defending':'idle'});
      if(invaders)for(let i=0;i<10;i++)model(soldier,-17+(i%5)*8,13+Math.floor(i/5)*7,1.5,{side:'invader',action:event.effects.attack?.enabled&&i<3?'attacking':'idle'});
      standard(model('banner',-24,-12,1.8),'defender',4);if(invaders)standard(model('banner',24,18,1.8),'invader',4);
    }
  }else if(kindIs('siege',event.archetype==='siege')){
    model('gatehouse',0,0,1.55,{primary:true});
    if(!event.compact){
    for(const x of [-19,-9,9,19])model('wall',x,1,1.0);
    for(const x of [-25,25])for(let z=-3;z>=-25;z-=2){
      const px=position.x+x*displayScale,pz=position.z+z*displayScale;
      if(!world.contains(px,pz))continue;
      const wall=new THREE.Mesh(new THREE.BoxGeometry(1.5,4.1,2.2),new THREE.MeshStandardMaterial({color:'#91836a',roughness:1}));
      wall.scale.setScalar(displayScale);wall.position.set(px,world.surfaceAt(px,pz)+2*displayScale,pz);group.add(wall);
    }
    for(const [x,z] of [[-15,-13],[1,-15],[15,-11],[-10,-24],[12,-25]])model('house',x,z,.9,{path:true});
    {
      if(invaders)for(let i=0;i<10;i++)model(soldier,-17+(i%5)*7,19+Math.floor(i/5)*7,1.5,{side:'invader',action:event.effects.attack?.enabled&&i<3?'attacking':'idle'});
      for(let i=0;i<7;i++)model(soldier,-19+i*6,-4,1.5,{side:'defender',action:event.effects.attack?.enabled&&i<3?'defending':'idle'});
      if(invaders)standard(model('banner',-20,22,1.8),'invader',4);standard(model('banner',20,-6,1.8),'defender',4);
    }
    }
  }else if(kindIs('teaching',teaching)){
    model('academy_hall',0,-6,1.7,{primary:true});
    if(!event.compact){
      model('table',0,5,1.6);model('book',0,5,1.5,{lift:2.5});
      for(let i=0;i<9;i++)model('scribe',-9+(i%3)*8,12+Math.floor(i/3)*6,1.4,{action:'working'});
    }
  }else if(newStage('market')&&event.archetype==='market'&&modern&&/회사|경제|호황|위기|산업|원조|개방|수출|자본|은행|화폐|금융|계획/.test(stageText)){
    model('civic_hall',0,-14,1.4,{primary:true});
    if(!event.compact){
      for(const x of [-12,12])model('car',x,2,1.2);
      model('table',0,4,1.5);model('handcart',-10,8,1.1);
      for(let i=0;i<6;i++)model('modern_figure',-6+(i%3)*6,10+Math.floor(i/3)*6,1.5,{role:'civilian',action:'idle'});
    }
  }else if(kindIs('market',market)){
    model('market',0,0,1.8,{primary:true});
    if(!event.compact){
      for(const x of [-16,16]){model('market',x,1,1.3);model('handcart',x,9,1.0);}
      if(!functionGroups)for(let i=0;i<9;i++)model('human',-15+(i%5)*7,10+Math.floor(i/5)*6,1.5,{action:i%3?'walking':'working'});
    }
  }else if(kindIs('publication',event.archetype==='publication')){
    model('table',0,0,2.5,{primary:true});
    if(!event.compact){
      model('academy_hall',0,-13,1.7);
      for(const x of [-7,7]){model('table',x,0,1.5);model('book',x,0,1.4,{lift:2.6});}
      model('handcart',12,6,1.2);model('book',0,0,2,{lift:3.3});
      for(let i=0;i<4;i++){
        const paper=new THREE.Mesh(new THREE.BoxGeometry(2.8,.45,2),new THREE.MeshStandardMaterial({color:'#f3e6bf',roughness:1}));
        paper.scale.setScalar(displayScale);paper.position.set(position.x+(5+i%2*3)*displayScale,world.surfaceAt(position.x,position.z)+(3+i*.5)*displayScale,position.z+2*displayScale);group.add(paper);
      }
    }
  }else if(newStage('court')){
    model(settingStage(event.scenePlace?.setting)||'palace',0,-14,1.8,{primary:true});
    if(!event.compact){
      model('table',0,4,1.5);model('book',0,4,1.2,{lift:2.5});
      if(!event.participants.some(isRuler))model(figureArchetype('ruler',event.year),0,7,1.2,{role:'ruler',action:'idle'});
      for(let i=0;i<6;i++)model(modern?'human':figureArchetype('scholar',event.year),-8+(i%3)*8,12+Math.floor(i/3)*6,1.5,{role:modern?'civilian':'scholar',action:'idle'});
    }
  }else if(newStage('assembly')&&event.id!=='scene-jl-donghak-yongdam-1860'){
    model(modern?'banner':settingStage(event.scenePlace?.setting)||'academy_hall',0,modern?0:-14,1.6,{primary:true});
    if(!event.compact){
      if(modern){model('civic_hall',0,-14,1.4);model('banner',10,2,1.4);}
      else{model('table',0,3,1.5);model('book',0,3,1.2,{lift:2.5});}
      const count=modern?16:8;
      for(let i=0;i<count;i++){
        const angle=(i+.5)/count*Math.PI,r=modern?8+i%3*2:9;
        model(modern?'human':figureArchetype('scholar',event.year),Math.cos(angle)*r,Math.sin(angle)*r,1.5,{role:modern?'civilian':'scholar',action:'idle'});
      }
    }
  }else if(newStage('survey')){
    model('hanging_scroll',0,0,1.6,{primary:true});
    if(!event.compact){
      model('table',6,4,1.5);model('book',6,4,1.2,{lift:2.5});
      model(settingStage(event.scenePlace?.setting)||'academy_hall',0,-14,1.4);model('handcart',-10,6,1.1);
      for(let i=0;i<3;i++)model(modern?'modern_figure':figureArchetype('scholar',event.year),-4+i*5,9,1.5,{role:modern?'civilian':'scholar',action:'working'});
    }
  }else if(newStage('ritual')){
    const buddhist=/사찰|불교|법회|연등|팔관회|승려|종파|천태|화엄|선종|교종|불상|법화|향도|미륵/.test(stageText)&&!/종묘|사직|신사|서원|향교/.test(stageText);
    const ceremony=!buddhist&&modern&&/올림픽|월드컵|대회|축제|기념|행사/.test(stageText);
    model(buddhist?'pagoda':ceremony?'civic_hall':'table',0,ceremony?-14:0,buddhist?1.8:ceremony?1.4:2,{primary:true});
    if(!event.compact){
      if(buddhist){
        model('academy_hall',0,-16,1.8);
        for(let i=0;i<4;i++)model('period_monk',-6+i*4,8,1.5,{role:'monk',action:'idle'});
      }else if(ceremony){
        for(const x of [-10,10])model('banner',x,2,1.5);
        for(let i=0;i<12;i++){const angle=(i+.5)/12*Math.PI;model('human',Math.cos(angle)*10,Math.sin(angle)*10,1.5,{role:'civilian',action:'idle'});}
      }else{
        model(event.scenePlace?.setting==='temple'?'academy_hall':settingStage(event.scenePlace?.setting)||'academy_hall',0,-14,1.4);  // 종묘·사직·신사는 탑이 아니라 사당 전각
        for(const x of [-14,14])for(const z of [-7,7])model('pine',x,z,1.2);
        for(let i=0;i<6;i++)model(modern?'human':figureArchetype('scholar',event.year),-8+(i%3)*8,8+Math.floor(i/3)*6,1.5,{role:modern?'civilian':'scholar',action:'idle'});
      }
    }
  }else if(newStage('megalith')){
    // #186: 고인돌·지석묘 축조는 선돌(standing_stone)이 상징물이다.
    model('standing_stone',0,0,1.6,{primary:true});
    if(!event.compact){
      for(const x of [-12,12])model('handcart',x,6,1.2);
      for(let i=0;i<6;i++)model('human',-10+(i%3)*10,10+Math.floor(i/3)*6,1.5,{role:'worker',action:'working'});
    }
  }else if(newStage('palace_construction')){
    model('palace',0,-14,.9,{primary:true});
    if(!event.compact){
      for(const x of [-12,12])model('handcart',x,4,1.2);
      model('groundbreaking',0,4,1.2);
      for(let i=0;i<6;i++)model('field_worker',-10+(i%3)*10,10+Math.floor(i/3)*6,1.5,{role:'worker',action:'working'});
    }
  }else if(newStage('fire')){
    model(settingStage(event.scenePlace?.setting)||'house',0,-14,1.4,{primary:true});
    if(!event.compact)for(let i=0;i<4;i++)model(figureArchetype('civilian',event.year),-6+i*4,8,1.5,{role:'civilian',action:'walking'});
  }else if(newStage('disaster')){
    model('rural_store',-8,-10,1.4,{primary:true});
    if(!event.compact){
      const seed=hash32(event.id+'|disaster');
      for(let i=0;i<8;i++){
        const h=hash32(seed+':'+i),angle=(h%3600)/3600*Math.PI*2,rad=Math.sqrt(((h>>>12)%1000)/1000)*6;
        model(figureArchetype('civilian',event.year),Math.cos(angle)*rad,8+Math.sin(angle)*rad,1.5,{role:'civilian',stance:'victim',action:'idle'});
      }
    }
  }else{
    model(modern?'civic_hall':'courtyard_house',0,0,1.8,{primary:true});
    if(!event.compact){
    for(const [x,z] of [[-16,-9],[16,-10],[-19,11],[17,15]])model('house',x,z,.9,{path:true});
    if(!facility&&kindIs('construction',event.archetype==='construction')){
      model('handcart',10,9,1.3);model('table',-10,10,1.3);
      if(!functionGroups)for(let i=0;i<6;i++)model('human',-12+i*5,14,1.5,{action:'working'});
    }
    }
  }
  if(!event.compact&&functionGroups&&!['portrait','heritage'].includes(compositionKind))composeGroups();
  if(!event.compact&&event.visualActions?.fireTargets?.includes('rural_store'))model('rural_store',-8,-16,1.5);
  if(!facility&&!sea&&!kindIs('harbor',harbor)&&!event.compact&&event.effects.ships?.enabled){
    let shore=null;
    for(let r=3;r<48&&!shore;r+=2)for(let i=0;i<48;i++){
      const angle=i*Math.PI/24,dx=Math.cos(angle)*r,dz=Math.sin(angle)*r;
      if(!world.contains(position.x+dx*displayScale,position.z+dz*displayScale)){shore={dx,dz,angle};break;}
    }
    if(shore)for(let i=0;i<3;i++){
      const side=[...(event.sides||[]),...event.participants].some(p=>p.side==='invader')?'invader':'naval';
      const ship=model(shipType,shore.dx+Math.cos(shore.angle)*(4+i*6),shore.dz+Math.sin(shore.angle)*(4+i*6),1,{medium:'sea',side});
      standard(ship,side,modern?3:7);
    }
  }
  const kindFire=!facility&&!event.sceneFunction&&event.archetype==='fire'&&(event.effects.fire===undefined||Boolean(event.itemId));
  const burning=event.effects.fire?.enabled||kindFire;
  const fireTargets=kindFire&&!event.visualActions?.fireTargets?.length?null:event.visualActions?.fireTargets;
  if(!event.compact&&burning&&(!personalFire||paperFire)){
    for(const target of models.filter(m=>fireTargets?fireTargets.includes(m.archetype):paperFire?m.archetype==='book':kindFire?m.primary:sea?m.archetype===shipType&&m.side==='invader':['house','korean_house','courtyard_house','korean_courtyard','palace','korean_hall','civic_hall'].includes(m.archetype)).slice(0,3)){
      const p=target.position.clone();p.y+=(paperFire?.4:sea?2:3)*displayScale;
      fireAt(group,p,(paperFire?.2:sea?1.2:1.5)*displayScale,animated);
      group.children.at(-1).userData.targetSide=target.side||null;
    }
  }
  // #186: compact(이웃 장면과 겹침) 항목 장면도 주인공 1명은 세운다(한산도 대첩의 이순신처럼 배 위·무대 옆).
  const actorCounts={};let unloadedPlaced=0;
  for(const person of compositionKind==='heritage'?[]:compositionKind==='portrait'?event.participants.filter(p=>p.presence!=='related').slice(0,1):event.compact?event.participants.filter(p=>p.unloaded&&p.presence==='on-site').slice(0,1):event.participants.filter(p=>p.presence==='on-site')){
    const side=person.side||'civilian',index=actorCounts[side]||0;actorCounts[side]=index+1;
    if(compositionKind==='portrait'){
      model(person.archetype||figureArchetype(person.role,event.year),0,0,1.1,{person,side,primary:true,action:'idle'});  // #186: 1.8 이면 집 3채 높이로 주변 문화재를 가린다
    }else if(sea){
      const affiliation=alliedFleet&&side==='naval'?(/명나라 수군|명 수군/.test(person.role)?'ming':'joseon'):null;
      let fleet=models.filter(m=>m.archetype===shipType&&m.side===side&&(!affiliation||m.fleet===affiliation));
      // #186: 항목 패킷 참여자의 side(a/b/c)는 함대 side(naval/invader)와 다르므로 아군 배, 없으면 아무 배에 태운다(로드 여부 무관 — 한산도 대첩의 이순신이 배에 못 타던 원인).
      if(!fleet.length)fleet=models.filter(m=>m.archetype===shipType&&m.side!=='invader');
      if(!fleet.length)fleet=models.filter(m=>m.archetype===shipType);
      const ship=fleet[index%fleet.length];
      if(!ship)continue;
      const berth=Math.floor(index/fleet.length),dx=berth?(berth%2?-.5:.5)*ship.scale/displayScale:0,dz=berth?(Math.floor((berth-1)/2)+1)*.65*ship.scale/displayScale:0;
      const row=model(person.archetype,(ship.position.x-position.x)/displayScale+dx,(ship.position.z-position.z)/displayScale+dz,1.05,{person,side,lift:(modern?1.9:2.2)*ship.scale/displayScale});
      if(row){row.shipSide=ship.side;row.fleet=ship.fleet;}
    }else if(kindIs('music',music)){
      const teacher=/가르친|악사/.test(person.role),instrument=/가얏고|가야금/.test(person.role),dance=/춤/.test(person.role);
      const [dx,dz]=teacher?[-8,-3]:instrument?[2,4]:dance?[12,11]:[10,-3];
      model(person.archetype,dx,dz,person.unloaded?1.3:2.4,{person,side,action:teacher||instrument?'working':dance?'walking':'idle'});
    }else{
      // #186: 항목 패킷 참여자(side a/b/c)와 미로드 참여자는 side 와 무관하게 순서대로 6 단위씩 띄운다(side 별 index 면 a·b 두 인물이 같은 자리에 겹친다).
      const slot=person.unloaded||['a','b','c'].includes(side)?unloadedPlaced++:index;
      const dx=-7+slot*6,dz=event.archetype==='publication'?4:side==='invader'?22:side==='civilian'?4:-6;
      model(person.archetype,dx,dz,person.unloaded?1.3:2.4,{person,side,action:event.archetype==='publication'?'working':'idle'});
    }
  }
  const anonymousRoles={human:'commoner',period_figure:'commoner',modern_figure:'commoner',spearman:'soldier',rifle_soldier:'soldier',period_commander:'commander',period_scholar:'scholar',scribe:'scholar',period_monk:'monk',period_ruler:'ruler'};
  for(const [seed,row] of models.entries())if(!row.person){
    // 궁궐 시설의 대표 외형은 위에서 고른 korean_hall/civic_hall을 그대로 쓴다.
    if(facilityLook==='palace'&&row.primary)continue;
    const role=anonymousRoles[row.archetype];
    row.archetype=role?figureArchetype(role,event.year):buildingArchetype(row.archetype,event.year,{seed,latitude:event.scenePlace?.coordinates?.[1]});
  }
  return {group,animated,models,occupied,compositionKind,displayScale,radius:radius*displayScale,
    focusDistance:Math.max(.1,(singleModel?HERITAGE_DISPLAY.focus:event.archetype==='settlement'?220:sea?145:harbor?150:groundbreaking?60:music||['publication','tradition'].includes(event.archetype)?85:relief||power?95:115)*displayScale)};
}
