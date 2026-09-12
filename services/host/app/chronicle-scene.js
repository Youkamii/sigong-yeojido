import {escapeHtml as esc} from './html.js';
import {planChronicleAssets} from './chronicle-asset-plan.js';
import {formatCoordinates} from './history-coordinates.js';
import {planTraditions} from './chronicle-traditions.js';
import {planHistoricalSites,planContinuingCities} from './chronicle-sites.js';
import {planContinuingFacilities} from './facility-persistence.js';
import {buildSettlementZones} from './inhabited-zones.js';

export class ChronicleScene {
  constructor(host,onSelect){
    this.host=host;this.onSelect=onSelect;this.markers=[];
    this.display={regions:true,geography:true,morePlaces:false,territories:true,siteNames:false,siteBackground:false,people:true,events:true,scenery:true,forest:true,paths:true};
    this.traditionId='';
    try{const saved=JSON.parse(localStorage.getItem('sigong-map-display-v1')||'{}');for(const key in this.display)if(typeof saved[key]==='boolean')this.display[key]=saved[key];}catch{}
    for(const input of document.querySelectorAll('[data-map-display]')){
      input.checked=this.display[input.dataset.mapDisplay];input.onchange=()=>{
        this.display[input.dataset.mapDisplay]=input.checked;
        try{localStorage.setItem('sigong-map-display-v1',JSON.stringify(this.display));}catch{}
        if(input.dataset.mapDisplay==='siteBackground'&&this.world)this.refresh(this.world,this.chronicle);
        else this.applyDisplay();
      };
    }
    document.getElementById('traditionDestination').onchange=event=>{
      this.traditionId=event.target.value;
      this.refresh(this.world,this.chronicle);
      const story=this.assets?.plan.events.find(e=>e.id===this.traditionId);
      if(story){this.preferredRow=story.id;this.onSelect(story.entityId);}
      else this.chronicle?.render();
    };
  }
  applyDisplay(){
    this.layoutKey=null;
    if(this.world?.geography)this.world.geography.display=this.display;
    if(this.assets?.scenery)this.assets.scenery.setDisplay(this.display.scenery,this.display.paths);
    if(this.assets?.forest)this.assets.forest.visible=this.display.forest;
    this.world?.territories?.setDisplay(this.display.territories);
    const paths=this.assets?.group.getObjectByName('settlement-footpaths');if(paths)paths.visible=this.display.paths;
  }
  async attach(engine,world){
    this.engine=engine;this.world=world;
    this.settlementZones=buildSettlementZones(world.scenePackets||[],world.coordinateRegistry||{},world.places||[]);
    try{
      const {ChronicleAssets,loadHistoryAssets}=await import('./chronicle-assets.js');
      this.assets=new ChronicleAssets(engine,world,await loadHistoryAssets());
      world.marks.visible=false;
      this.refresh(world,this.chronicle);
    }catch(error){this.error=error.message;this.host.textContent=this.error;console.error('[chronicle assets]',error);}
  }
  refresh(world,chronicle){
    if(!chronicle)return;
    this.chronicle=chronicle;this.world=world;
    if(!this.assets||!chronicle.context)return;
    const changedYear=this.assets.plan?.year!==chronicle.context.year;
    if(changedYear)this.traditionId='';
    const stories=planTraditions(chronicle.data,world.traditions?.narratives||[]);
    if(!stories.some(s=>s.id===this.traditionId))this.traditionId='';
    const storyMenu=document.getElementById('traditionDestination');
    storyMenu.replaceChildren(new Option('이야기를 골라 보기',''),...stories.map(s=>new Option(s.label,s.id)));
    storyMenu.value=this.traditionId;storyMenu.disabled=!stories.length;
    const features=world.historyTargets.map(t=>t.userData.feature);
    const plan=planChronicleAssets(chronicle.context,chronicle.data,features,world.places,world.scenePackets||[],world.coordinateRegistry);
    world.territories?.setYear(plan.year,chronicle.callbacks.filters());
    world.geography?.setActivities(plan);
    const claims=new Map(chronicle.data.claims.map(claim=>[claim.id,claim]));
    plan.events.push(...planContinuingCities(world.scenePackets||[],plan,claims,this.settlementZones));
    plan.events.push(...planContinuingFacilities(world.scenePackets||[],plan,claims));
    if(this.display.siteBackground)plan.events.push(...planHistoricalSites(chronicle.data,world.scenePackets||[],plan));
    plan.events.push(...stories.filter(s=>s.id===this.traditionId));
    if(!plan.events.some(e=>e.id===this.assets.activeScene))this.assets.activeScene=null;
    const signature=JSON.stringify([plan,this.assets.activeScene]);
    if(signature===this.signature){this.syncPicks();this.renderFocus();this.applyDisplay();return;}
    this.assets.rebuild(plan);this.signature=signature;
    this.layoutKey=null;
    this.host.replaceChildren();this.markers=[];
    for(const row of this.assets.rows){
      if(row.kind==='building')continue;
      const button=document.createElement('button');button.className=row.kind==='event'?'scene-event':'scene-person';
      if(row.narrative){button.classList.add('scene-tradition');button.dataset.narrative=row.narrative.id;}
      button.dataset.sceneEntity=row.entityId;
      button.dataset.scenePlacement=row.placement;
      if(row.kind==='event')button.dataset.sceneEvent=row.entityId;
      const label=row.kind==='event'?row.label.replace(/^.*\((제[12]차 [^)]+)\)$/,'$1').replace(/\s*\(임진왜란\)/,''):row.label;
      const detail=row.kind==='person'?(row.role||row.detail.split(' · ')[0]):row.detail;
      button.innerHTML=`<strong>${esc(label)}</strong><small>${esc(detail)}</small>`;
      button.title=row.label+' · '+row.placementLabel;
      button.onclick=()=>{this.preferredRow=row.id;this.onSelect(row.entityId);};
      button.onpointerenter=button.onpointerleave=()=>{const marker=this.markers.find(m=>m.button===button);if(marker)marker.size=null;this.layoutKey=null;};
      this.host.append(button);this.markers.push({button,position:row.labelPosition,row});
    }
    const destination=document.getElementById('sceneDestination'),previous=destination.value;
    destination.replaceChildren(new Option('인물·사건을 골라 이동',''));
    const listed=new Set();
    for(const row of this.assets.rows)if(row.kind!=='building'){
      const option=new Option((row.setting||row.siteBackground?'도시·시설 · ':'')+row.label+(listed.has(row.entityId)?' · '+(row.locationReference?.label||row.detail):''),listed.has(row.entityId)?row.id:row.entityId);
      option.dataset.sceneRow=row.id;option.dataset.sceneEntity=row.entityId;destination.add(option);listed.add(row.entityId);
    }
    if([...destination.options].some(option=>option.value===previous))destination.value=previous;
    destination.disabled=!this.assets.rows.length;
    this.syncPicks();
    const sceneInView=this.assets.rows.some(row=>{
      const p=row.position.clone().project(this.engine.camera);return Math.abs(p.x)<.85&&Math.abs(p.y)<.85&&Math.abs(p.z)<1;
    });
    if(this.assets.rows.length&&(!this.initiallyFramed||(changedYear&&!sceneInView))){
      this.assets.focusPeriod();this.initiallyFramed=true;
    }
    const note=document.getElementById('sceneAssetNote');
    note.textContent='끌어서 이동 · 휠로 확대 · 오른쪽 드래그로 회전';
    note.hidden=!note.textContent;
    this.renderFocus();
    this.applyDisplay();
  }
  renderFocus(){
    const host=document.getElementById('sceneFocus'),row=this.assets?.rowFor(this.assets.selected,this.assets.selectedRow);
    const scene=this.assets?.plan.events.find(e=>e.id===row?.sceneId);
    host.hidden=!scene;
    if(!scene){host.replaceChildren();return;}
    const people=scene.participants.filter(p=>p.presence==='on-site');
    host.innerHTML=`<div class="focus-heading"><span>${scene.narrative?'설화·전승의 무대':scene.siteBackground?.scope==='anonymous-city'?scene.label:scene.siteBackground?.scope==='facility'?'시설 · 추정 존속':scene.siteBackground?'성곽 배경 · 추정':scene.setting?'도시·시설 · '+esc(this.assets.plan.year)+'년':esc(this.assets.plan.year)+'년'} · ${esc(scene.scenePlace?.label||scene.locationReference?.label||'현장')}</span>
      <button data-focus-entity="${esc(scene.entityId)}" data-focus-row="${esc(scene.id)}">${esc(scene.label)} ↗</button></div>
      <div class="focus-people">${people.map(p=>`<button data-focus-entity="${esc(p.entityId)}" data-focus-row="${esc(p.id+'@'+scene.id)}" aria-pressed="${p.entityId===this.assets.selected}"><strong>${esc(p.label)}</strong><small>${esc(p.role)}</small></button>`).join('')}</div>`;
    for(const button of host.querySelectorAll('[data-focus-entity]'))button.onclick=()=>{
      this.preferredRow=button.dataset.focusRow;this.onSelect(button.dataset.focusEntity);
    };
    this.layoutKey=null;
  }
  syncPicks(){
    if(!this.engine)return;
    this.world.marks.visible=false;
    this.world.history.visible=false;
    this.engine.setPickTargets(this.assets?.picks||[]);
  }
  activity(id){
    const plan=this.assets?.plan;if(!plan)return null;
    const events=plan.events.filter(e=>e.entityId===id||e.participants.some(p=>p.entityId===id));
    if(!events.length)return null;
    const selectedRow=this.assets.rowFor(id,this.assets.selectedRow);
    const selected=events.find(e=>selectedRow?.sceneId===e.id)||events[0];
    const person=selected.participants.find(p=>p.entityId===id);
    const row=this.assets.rows.find(r=>r.sceneId===selected.id&&r.kind==='event');
    return {sceneId:selected.id,label:selected.label,setting:selected.setting,summary:selected.summary,narrative:selected.narrative,siteBackground:selected.siteBackground,role:person?.role||(selected.scenePlace?.settlement?.scope==='between-records'?'기록 사이 추정 배경':undefined),participants:selected.participants,place:selected.scenePlace?.label||selected.locationReference?.label,
      placement:row?.placementLabel||'활동은 확인됐으며 지도 위치는 아직 연결되지 않았습니다.',
      claimIds:[...new Set([...selected.claimIds,...(person?.relationClaims||[])])],
      coordinates:formatCoordinates(selected.scenePlace?.coordinates||(selected.locationReference
        ?[selected.locationReference.candidate.lon,selected.locationReference.candidate.lat]:null)),
      coordinateNote:selected.scenePlace?.coordinateNote||selected.locationReference?.coordinateNote,displayBasis:selected.scenePlace?.displayBasis,
      sides:selected.sides||[],events:selected.siteBackground?.episodes||events,sources:(selected.scenePlace?.coordinateSourceIds||selected.locationReference?.coordinateSourceIds||[])
        .map(id=>[...(this.world.sceneSources||[]),...(this.world.coordinateRegistry?.sources||[])].find(s=>s.id===id)).filter(Boolean)};
  }
  select(id){
    const preferred=this.preferredRow||(this.assets?.selected===id?this.assets.selectedRow:null);
    const row=this.assets?.rowFor(id,preferred);
    const sceneId=row?.sceneId
      ||this.assets?.plan.events.find(e=>e.participants.some(p=>p.entityId===id&&p.presence==='on-site'))?.id;
    if(sceneId&&this.assets.activeScene!==sceneId){this.assets.activeScene=sceneId;this.refresh(this.world,this.chronicle);}
    this.preferredRow=null;this.assets?.setSelected(id,preferred);
    for(const marker of this.markers){marker.button.classList.toggle('selected',marker.row.entityId===id);marker.size=null;}
    this.renderFocus();
    return this.assets?.focus(id,preferred)||false;
  }
  prefer(id,point){
    if(!point||!this.assets)return;
    this.preferredRow=this.assets.rows.filter(r=>r.entityId===id)
      .sort((a,b)=>a.pick.getWorldPosition(point.clone()).distanceToSquared(point)-b.pick.getWorldPosition(point.clone()).distanceToSquared(point))[0]?.id;
  }
  update(camera,canvas,t){
    this.assets?.update(t);
    const width=canvas.clientWidth,height=canvas.clientHeight;
    const card=document.getElementById('geographyCard'),hudElement=document.getElementById('sceneContext');
    const viewport=width+':'+height;
    const key=[...camera.matrixWorld.elements,...camera.projectionMatrix.elements,viewport,
      this.assets?.selectedRow,this.assets?.activeScene,this.world?.territories?.key,this.world?.territories?.visible,document.getElementById('geographyDestination').value,card.hidden,card.offsetHeight,hudElement.offsetHeight].join(':');
    if(this.layoutKey===key)return;
    this.layoutKey=key;
    if(this.labelViewport!==viewport){
      this.labelViewport=viewport;
      for(const marker of [...this.markers,...(this.world?.geography?.markers||[])])marker.size=null;
    }
    const canvasRect=canvas.getBoundingClientRect(),hud=document.getElementById('sceneContext').getBoundingClientRect();
    const occupied=[{left:hud.left-canvasRect.left,right:hud.right-canvasRect.left,
      top:hud.top-canvasRect.top,bottom:hud.bottom-canvasRect.top}];
    for(const element of document.querySelectorAll('.geography-navigation,.geography-card:not([hidden]),.scene-focus:not([hidden])')){
      const r=element.getBoundingClientRect();occupied.push({left:r.left-canvasRect.left,right:r.right-canvasRect.left,top:r.top-canvasRect.top,bottom:r.bottom-canvasRect.top});
    }
    this.world?.territories?.update(camera,canvas,occupied);
    const geographyFirst=camera.position.distanceTo(this.engine.controls.target)>600;
    if(geographyFirst)this.world?.geography?.update(camera,canvas,occupied);
    const ordered=[...this.markers].sort((a,b)=>
      Number(b.row.id===this.assets?.selectedRow)-Number(a.row.id===this.assets?.selectedRow)
      ||Number(b.row.sceneId===this.assets?.activeScene)-Number(a.row.sceneId===this.assets?.activeScene)
      ||Number(!!(a.row.setting||a.row.siteBackground))-Number(!!(b.row.setting||b.row.siteBackground))
      ||Number(b.row.kind==='person')-Number(a.row.kind==='person')
      ||Number(b.row.kind==='event')-Number(a.row.kind==='event'));
    let peopleShown=0;
    const named=new Set();
    for(const marker of ordered){
      const {button,position,row}=marker;
      const p=position.clone().project(camera);
      button.hidden=p.z< -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1
        ||(row.kind==='person'&&!this.display.people)||(row.kind==='event'&&!row.setting&&!row.siteBackground&&!row.narrative&&!this.display.events)
        ||((row.setting||row.siteBackground)&&!this.display.siteNames&&row.entityId!==this.assets?.selected)
        ||(row.kind==='person'&&(named.has(row.entityId)||(peopleShown>=(width<600?3:6)&&row.entityId!==this.assets?.selected)));
      if(button.hidden)continue;
      button.style.left=(p.x+1)*width/2+'px';button.style.top=(1-p.y)*height/2+'px';
      const x=(p.x+1)*width/2,y=(1-p.y)*height/2;
      marker.size||=[button.offsetWidth,button.offsetHeight];
      const [w,h]=marker.size;
      button.hidden=true;
      for(const [dx,dy] of [[0,0],[-22,-12],[22,-12],[0,-30],[-38,-30],[38,-30],[0,-52],[-56,-48],[56,-48]]){
        const rect={left:x+dx-w/2,right:x+dx+w/2,top:y+dy-h,bottom:y+dy};
        if(rect.left<0||rect.right>width||rect.top<0||rect.bottom>height
          ||occupied.some(r=>r.left<rect.right+4&&r.right>rect.left-4&&r.top<rect.bottom+4&&r.bottom>rect.top-4))continue;
        button.style.left=x+dx+'px';button.style.top=y+dy+'px';button.hidden=false;occupied.push(rect);break;
      }
      if(row.kind==='person'&&!button.hidden){peopleShown++;named.add(row.entityId);}
    }
    if(!geographyFirst)this.world?.geography?.update(camera,canvas,occupied);
  }
}
