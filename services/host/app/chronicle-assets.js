import * as THREE from 'three';
import {compileAssetCatalog} from './assetcatalog.js';
import {buildAssetField} from './assetforge.js';
import {chamferBox} from './landmarks.js';
import {toWorld,terrainY} from './korea.js';
import {makeSurface} from './style.js';
import {PALETTE,darken} from './artbible.js';

let catalogPromise;
export function loadHistoryAssets(){
  if(!catalogPromise)catalogPromise=fetch('./app/history-asset-catalog.json')
    .then(r=>{if(!r.ok)throw Error('인물 조형을 불러오지 못했습니다.');return r.json();})
    .then(compileAssetCatalog).catch(error=>{catalogPromise=null;throw error;});
  return catalogPromise;
}

function release(group){
  const geometries=new Set(),materials=new Set();
  group.traverse(o=>{
    if(o.geometry)geometries.add(o.geometry);
    for(const m of [o.material,o.customDepthMaterial,o.customDistanceMaterial].flat())if(m)materials.add(m);
  });
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  group.removeFromParent();
}

const CAST_X=-111,CAST_Y=8,COLUMNS=4,STEP_X=18,STEP_Z=26;

export class ChronicleAssets{
  constructor(engine,world,catalog){
    this.engine=engine;this.world=world;this.catalog=catalog;
    this.rows=[];this.picks=[];this.revision=0;this.group=new THREE.Group();
    this.group.name='chronicle-assets';engine.add(this.group);
    engine.scene.background=new THREE.Color(darken(PALETTE.SECOND_SLATE,.65));
    if(engine.scene.fog)engine.scene.fog.color.copy(engine.scene.background);
  }
  rebuild(plan){
    const next=new THREE.Group();next.name='chronicle-assets';
    const rows=[],anchors=new Map(),recipes=[];
    const add=(row,position,scale)=>{
      const anchor=row.id;anchors.set(anchor,position);
      recipes.push({id:row.id,anchor,archetype:row.archetype,
        form:row.kind==='person'?'civilian':row.archetype==='battle'?'local':'plain',
        scale,seed:row.entityId,label:row.label,offset:[0,position.y,0]});
      rows.push({...row,position,scale});
    };
    plan.people.forEach((person,i)=>add(person,new THREE.Vector3(
      CAST_X+(i%COLUMNS-1.5)*STEP_X,CAST_Y,Math.floor(i/COLUMNS)*STEP_Z),3.6));
    const castRows=Math.ceil(plan.people.length/COLUMNS);
    let unlocated=0;
    for(const event of plan.events){
      if(!event.sites.length){
        add({...event,placement:'collection',detail:event.detail+' · 장소 미연결'},
          new THREE.Vector3(CAST_X+(unlocated%3-1)*24,CAST_Y,castRows*STEP_Z+12+Math.floor(unlocated/3)*30),
          event.archetype==='battle'?1.65:4.8);
        unlocated++;
      }
      for(const site of event.sites){
        const [lon,lat]=site.geometry.coordinates,[x,z]=toWorld(lon,lat);
        const y=this.world.heightAt?terrainY(Math.max(0,this.world.heightAt(lon,lat))):7;
        const id=event.id+':'+site.id;
        add({...event,id,placement:'site',site,detail:event.detail+' · 관련 장소'},new THREE.Vector3(x,y,z),
          event.archetype==='battle'?1.65:4.8);
        event.participants.forEach((person,i)=>add({...person,id:id+':'+person.entityId,placement:'relation',
          eventId:event.entityId,site,detail:'관련 인물 · '+person.detail},
          new THREE.Vector3(x+(i-(event.participants.length-1)/2)*10,y,z+12),2.8));
      }
    }
    const field=buildAssetField({world:{ground:[],sky:[],anchorOf:id=>anchors.get(id),surfaceAt:()=>0,time:null,cata:null},
      catalog:this.catalog,recipes,seed:'sigong-history'});
    if(field.stats.built!==recipes.length||field.stats.dropped.length){release(field.group);throw Error('일부 역사 조형을 만들지 못했습니다.');}
    next.add(field.group);
    const byRecipe=new Map(rows.map(r=>[r.id,r]));
    for(const pick of field.picks){
      const row=byRecipe.get(pick.userData.fanAssetId);
      pick.userData.fanNodeId=row.entityId;
      row.pick=pick;row.labelPosition=pick.position.clone();
      row.labelPosition.y+=pick.geometry.parameters.height/2+1;
    }
    const collection=rows.filter(r=>r.placement==='collection');
    if(collection.length){
      const endZ=Math.max(...collection.map(r=>r.position.z))+13;
      const floor=new THREE.Mesh(chamferBox(78,1.3,endZ+14,.35),
        makeSurface({preset:'MAT_STONE',color:PALETTE.BASE_STONE},{key:'chronicle-plinth'}));
      floor.position.set(CAST_X,CAST_Y-.7,(endZ-14)/2);floor.name='contemporary-collection-plinth';next.add(floor);
    }
    const previous=this.group;
    this.engine.add(next);this.group=next;this.rows=rows;this.picks=field.picks;
    this.animated=field.animated;this.stats=field.stats;this.plan=plan;this.revision++;
    this.engine.remove(previous);release(previous);
    this.selection=null;this.setSelected(this.selected,this.selectedRow);
  }
  rowFor(id,preferred){
    const candidates=this.rows.filter(r=>r.entityId===id);
    return candidates.find(r=>r.id===preferred)||candidates.find(r=>r.placement==='site')
      ||candidates.find(r=>r.placement==='collection')||candidates[0];
  }
  focus(id,preferred){
    const row=this.rowFor(id,preferred);
    if(!row)return false;
    this.engine.flyTo(row.pick.position.clone(),row.kind==='person'?62:94,650);return true;
  }
  focusPeriod(){
    const rows=this.rows.filter(r=>r.placement==='collection');
    if(!rows.length)return false;
    const minZ=Math.min(...rows.map(r=>r.position.z)),maxZ=Math.max(...rows.map(r=>r.position.z));
    const aspect=this.engine.renderer.domElement.clientWidth/this.engine.renderer.domElement.clientHeight;
    this.engine.flyTo(new THREE.Vector3(CAST_X+40,CAST_Y+3,(minZ+maxZ)/2),
      Math.max(195,270/aspect,(maxZ-minZ)*1.7),650);
    return true;
  }
  setSelected(id,preferred){
    this.selected=id;this.selectedRow=preferred;
    if(this.selection){release(this.selection);this.selection=null;}
    const row=this.rowFor(id,preferred);
    if(!row)return;
    const ring=new THREE.Mesh(new THREE.RingGeometry(3.4,3.7,40),
      new THREE.MeshBasicMaterial({color:PALETTE.ACCENT_CYAN,side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.copy(row.position);ring.position.y+=.08;
    this.group.add(ring);this.selection=ring;
    this.selectedRow=row.id;
  }
  update(t){for(const animation of this.animated||[])animation.update(t);}
}
