import {escapeHtml as esc} from './html.js';
import {planChronicleAssets} from './chronicle-asset-plan.js';

export class ChronicleScene {
  constructor(host,onSelect){this.host=host;this.onSelect=onSelect;this.markers=[];}
  async attach(engine,world){
    this.engine=engine;this.world=world;
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
    const features=world.historyTargets.map(t=>t.userData.feature);
    const plan=planChronicleAssets(chronicle.context,chronicle.data,features);
    const signature=JSON.stringify(plan);
    if(signature===this.signature){this.syncPicks();return;}
    this.assets.rebuild(plan);this.signature=signature;
    this.host.replaceChildren();this.markers=[];
    for(const row of this.assets.rows){
      const button=document.createElement('button');button.className=row.kind==='event'?'scene-event':'scene-person';
      button.dataset.sceneEntity=row.entityId;
      button.dataset.scenePlacement=row.placement;
      if(row.kind==='event')button.dataset.sceneEvent=row.entityId;
      button.innerHTML=`<strong>${esc(row.label)}</strong><small>${esc(row.detail)}</small>`;
      button.onclick=()=>{this.preferredRow=row.id;this.onSelect(row.entityId);};
      this.host.append(button);this.markers.push({button,position:row.labelPosition,row});
    }
    this.syncPicks();
    if(!this.initiallyFramed&&this.assets.rows.length){this.assets.focusPeriod();this.initiallyFramed=true;}
    const note=document.getElementById('sceneAssetNote');
    note.textContent=plan.people.length||plan.events.length?'인물·사건은 상징 조형 · 진열 위치는 실제 활동 장소와 다릅니다.':'';
    note.hidden=!note.textContent;
  }
  syncPicks(){
    if(!this.engine)return;
    const represented=new Set(this.assets?.rows.filter(r=>r.placement==='site').map(r=>r.site.id)||[]);
    for(const target of this.world.historyTargets)target.visible=!represented.has(target.userData.feature.id);
    this.engine.setPickTargets([
      ...(this.world.marks.visible?this.world.pickTargets.filter(t=>t.parent.visible):[]),
      ...this.world.historyTargets.filter(t=>t.visible),...(this.assets?.picks||[])]);
  }
  select(id){
    const preferred=this.preferredRow||(this.assets?.selected===id?this.assets.selectedRow:null);
    this.preferredRow=null;this.assets?.setSelected(id,preferred);
    for(const {button,row} of this.markers)button.classList.toggle('selected',row.entityId===id);
    return this.assets?.focus(id,preferred)||false;
  }
  prefer(id,point){
    if(!point||!this.assets)return;
    this.preferredRow=this.assets.rows.filter(r=>r.entityId===id)
      .sort((a,b)=>a.pick.position.distanceToSquared(point)-b.pick.position.distanceToSquared(point))[0]?.id;
  }
  update(camera,canvas,t){
    this.assets?.update(t);
    const width=canvas.clientWidth,height=canvas.clientHeight;
    const canvasRect=canvas.getBoundingClientRect(),hud=document.getElementById('sceneContext').getBoundingClientRect();
    const occupied=[{left:hud.left-canvasRect.left,right:hud.right-canvasRect.left,
      top:hud.top-canvasRect.top,bottom:hud.bottom-canvasRect.top}];
    const ordered=[...this.markers].sort((a,b)=>
      Number(b.row.id===this.assets?.selectedRow)-Number(a.row.id===this.assets?.selectedRow));
    for(const {button,position} of ordered){
      const p=position.clone().project(camera);
      button.hidden=p.z< -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;
      if(button.hidden)continue;
      button.style.left=(p.x+1)*width/2+'px';button.style.top=(1-p.y)*height/2+'px';
      const x=(p.x+1)*width/2,y=(1-p.y)*height/2,w=button.offsetWidth,h=button.offsetHeight;
      const rect={left:x-w/2,right:x+w/2,top:y-h,bottom:y};
      button.hidden=rect.left<0||rect.right>width||rect.top<0||rect.bottom>height
        ||occupied.some(r=>r.left<rect.right+4&&r.right>rect.left-4&&r.top<rect.bottom+4&&r.bottom>rect.top-4);
      if(!button.hidden)occupied.push(rect);
    }
  }
}
