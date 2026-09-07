import * as THREE from 'three';
import {compileAssetCatalog} from './assetcatalog.js';
import {buildAssetField} from './assetforge.js';
import {stableSeed} from './chronicle-world.js';
import {composeHistoricalEvent} from './chronicle-event-scenes.js';
import {PALETTE,mix,FOLIAGE,WHITE} from './artbible.js';
import {makeSurface,biomeByName} from './style.js';
import {mergeParts,mixColor} from './util.js';

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
    if(o.isInstancedMesh)o.dispose();
    if(o.geometry)geometries.add(o.geometry);
    for(const m of [o.material,o.customDepthMaterial,o.customDistanceMaterial].flat())if(m)materials.add(m);
  });
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());group.removeFromParent();
}

// Fantology terrain.js: the trees actually used in its world scene.
function makeTreeGeometry() {
  const trunk = new THREE.CylinderGeometry(0.26, 0.42, 2.6, 6, 1);
  trunk.translate(0, 1.3, 0);
  const c1 = new THREE.ConeGeometry(2.0, 3.4, 7, 1);
  c1.translate(0, 3.5, 0);
  const c2 = new THREE.ConeGeometry(1.35, 2.6, 7, 1);
  c2.translate(0, 5.3, 0);
  const g = mergeParts([
    { geo: trunk, color: new THREE.Color(FOLIAGE.TRUNK) },
    { geo: c1, color: new THREE.Color(WHITE) },
    { geo: c2, color: new THREE.Color(FOLIAGE.LEAF_HI) },
  ], true);
  trunk.dispose(); c1.dispose(); c2.dispose();
  return g;
}

export class ChronicleAssets{
  constructor(engine,world,catalog){
    this.engine=engine;this.world=world;this.catalog=catalog;
    this.rows=[];this.picks=[];this.revision=0;this.group=new THREE.Group();
    this.group.name='chronicle-assets';engine.add(this.group);
    engine.scene.background=new THREE.Color(PALETTE.NEUTRAL_BONE);
    if(engine.scene.fog)engine.scene.fog.color.copy(engine.scene.background);
  }
  field(recipes,anchors){
    const result={group:new THREE.Group(),picks:[],animated:[],stats:{catalog:this.catalog.stats,dropped:[],batches:0}};
    const regions=new Map();
    for(const recipe of recipes){
      const p=anchors.get(recipe.anchor),key=Math.floor(p.x/128)+':'+Math.floor(p.z/128)+(recipe.scale<.1?':small:'+recipe.id:'');
      if(!regions.has(key))regions.set(key,[]);regions.get(key).push(recipe);
    }
    for(const region of regions.values())for(let i=0;i<region.length;i+=160){
      const batch=region.slice(i,i+160),factor=Math.min(1,...batch.map(r=>r.scale/.1));
      const origin=factor<1?anchors.get(batch[0].anchor):new THREE.Vector3();
      const field=buildAssetField({world:{ground:[],sky:[],anchorOf:id=>anchors.get(id).clone().sub(origin).divideScalar(factor),surfaceAt:()=>0,time:null,cata:null},
        catalog:this.catalog,recipes:batch.map(r=>({...r,scale:r.scale/factor,offset:[0,(r.offset[1]-origin.y)/factor,0]})),seed:'sigong-history'});
      field.group.position.copy(origin);field.group.scale.setScalar(factor);
      result.group.add(field.group);result.picks.push(...field.picks);result.animated.push(...field.animated);
      result.stats.batches++;
      for(const [key,value] of Object.entries(field.stats))if(typeof value==='number')result.stats[key]=(result.stats[key]||0)+value;
      result.stats.dropped.push(...field.stats.dropped);
    }
    for(const key of ['built','requested','meshes','triangles'])result.stats[key]??=0;
    return result;
  }
  buildForest(occupied){
    const group=new THREE.Group();group.name='peninsula-woods';
    const b=this.world.bounds,candidates=this.treeCandidates||[];
    const cells=new Map(),cellSize=3;
    if(!this.treeCandidates)for(let i=0;i<100000&&candidates.length<12000;i++){
      const seed=stableSeed('wood:'+i),x=b.minX+(b.maxX-b.minX)*(seed%10000)/10000;
      const z=b.minZ+(b.maxZ-b.minZ)*(Math.floor(seed/10000)%10000)/10000;
      if(!this.world.contains(x,z,1.2))continue;
      const height=this.world.surfaceAt(x,z),slope=Math.abs(this.world.surfaceAt(x+3,z)-this.world.surfaceAt(x-3,z))/6;
      const grove=Math.sin(x/39)+Math.cos(z/47)+Math.sin((x+z)/21)*.45;
      if(grove<-.25||slope>1.15||(height>23&&seed%4))continue;
      const cx=Math.floor(x/cellSize),cz=Math.floor(z/cellSize);
      let crowded=false;
      for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)
        if((cells.get((cx+dx)+':'+(cz+dz))||[]).some(p=>Math.hypot(x-p.x,z-p.z)<2.8))crowded=true;
      if(crowded)continue;
      candidates.push(new THREE.Vector3(x,this.world.surfaceAt(x,z),z));
      const key=cx+':'+cz;if(!cells.has(key))cells.set(key,[]);cells.get(key).push({x,z});
    }
    this.treeCandidates=candidates;
    const positions=candidates.filter(p=>occupied.every(o=>Math.hypot(p.x-o.x,p.z-o.z)>=o.radius+1.4));
    const geometry=makeTreeGeometry(),material=makeSurface({preset:'MAT_FOLIAGE',vertexColors:true,color:WHITE},{wind:.9,windAxis:'y',key:'tree'});
    const regions=new Map();
    for(const p of positions){const key=Math.floor(p.x/96)+':'+Math.floor(p.z/96);
      if(!regions.has(key))regions.set(key,[]);regions.get(key).push(p);}
    const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),scale=new THREE.Vector3(),biome=biomeByName('forest');
    for(const [key,region] of regions){
      const trees=new THREE.InstancedMesh(geometry,material,region.length);
      region.forEach((position,i)=>{
        const seed=stableSeed('tree:'+position.x+':'+position.z),t=(seed%1000)/1000,s=.7+t*.45;
        q.setFromEuler(new THREE.Euler(0,t*6.28,0));scale.set(s,s*(.85+t*.5),s);
        matrix.compose(position,q,scale);trees.setMatrixAt(i,matrix);
        trees.setColorAt(i,mixColor(biome.low,biome.high,.25+t*.6).multiplyScalar(.92+t*.22));
      });
      trees.instanceMatrix.needsUpdate=true;if(trees.instanceColor)trees.instanceColor.needsUpdate=true;
      trees.name='fan-trees:'+key;trees.computeBoundingSphere();group.add(trees);
    }
    if(!positions.length){geometry.dispose();material.dispose();}
    if(this.forest){this.engine.remove(this.forest);release(this.forest);}
    this.forest=group;this.forestPositions=positions;this.engine.add(group);
  }
  rebuild(plan){
    const next=new THREE.Group();next.name='chronicle-assets';
    const rows=[],anchors=new Map(),recipes=[],occupied=[],eventAnimations=[],unlocated=[];
    const add=(row,position,scale,archetype=row.archetype)=>{
      if(!position)return;
      anchors.set(row.id,position);
      recipes.push({id:row.id,anchor:row.id,archetype,scale,seed:row.id,offset:[0,position.y,0],
        form:archetype==='spearman'?'warrior':undefined,action:row.action||'idle'});
      rows.push({...row,archetype,position,scale});
    };
    const locate=event=>{
      if(event.scenePlace){
        const [x,z]=this.world.toWorld(...event.scenePlace.coordinates);
        return {position:new THREE.Vector3(x,event.scenePlace.medium==='sea'?this.world.seaLevel:this.world.surfaceAt(x,z),z),
          placement:'activity',placementLabel:event.scenePlace.label+' · '+(event.scenePlace.precision==='area'?'활동 지역':'사건 장소'),
          locationReference:event.scenePlace,site:null};
      }
      const site=event.sites?.[0];
      if(site){const [x,z]=this.world.toWorld(...site.geometry.coordinates);return {
        position:new THREE.Vector3(x,this.world.surfaceAt(x,z),z),placement:'site',site,placementLabel:'출처에 연결된 사건 장소'};}
      const ref=event.locationReference;
      if(ref){const [x,z]=this.world.toWorld(ref.candidate.lon,ref.candidate.lat);return {
        position:new THREE.Vector3(x,this.world.surfaceAt(x,z),z),placement:'area',locationReference:ref,
        placementLabel:ref.label+' · 사건이 기록된 지역'};}
      return null;
    };
    const placedPeople=new Set(),fullScenes=[];
    const events=[...plan.events].sort((a,b)=>Number(b.entityId===this.activeScene)-Number(a.entityId===this.activeScene)
      ||Number(!!b.scenePlace)-Number(!!a.scenePlace));
    for(const event of events){
      const loc=locate(event);
      if(!loc){unlocated.push(event);continue;}
      const compact=fullScenes.some(p=>p.distanceTo(loc.position)<55);
      const scene=composeHistoricalEvent({...event,compact},loc.position,this.world);
      if(!scene.models.some(m=>m.primary)){unlocated.push(event);continue;}
      next.add(scene.group);eventAnimations.push(...scene.animated);
      if(!compact)fullScenes.push(loc.position);
      occupied.push({...loc.position,radius:scene.radius},...scene.occupied);
      for(const [index,model] of scene.models.entries()){
        const person=model.person,row=person?{...person,id:person.id+'@'+event.id,kind:'person',eventId:event.entityId,
          activity:event.summary,placement:loc.placement,placementLabel:person.role+' · '+loc.placementLabel,
          site:loc.site,locationReference:loc.locationReference,focusDistance:scene.focusDistance,action:model.action,side:model.side,shipSide:model.shipSide}
          :{...event,...loc,id:model.primary?event.id:event.id+':part:'+index,kind:model.primary?'event':'building',
            sceneKind:event.archetype,path:model.path,focusDistance:scene.focusDistance,action:model.action,compact,side:model.side};
        const position=model.position.clone();position.y+=model.lift||0;
        add(row,position,model.scale,model.archetype);
        if(person)placedPeople.add(person.entityId);
      }
    }
    for(const person of plan.people.filter(p=>!placedPeople.has(p.entityId))){
      if(person.locations?.length!==1){unlocated.push(person);continue;}
      const claim=person.locations[0],o=claim.object,[x,z]=this.world.toWorld(o.lon,o.lat);
      add({...person,placement:'presence',placementLabel:'해당 시기의 출현 근거',claimIds:[...person.claimIds,claim.id]},
        new THREE.Vector3(x,this.world.surfaceAt(x,z),z),2.1);
    }
    this.unlocated=unlocated;
    const field=this.field(recipes,anchors);
    if(field.stats.built!==recipes.length||field.stats.dropped.length){release(field.group);throw Error('일부 역사 조형을 만들지 못했습니다.');}
    next.add(field.group);
    const pathPositions=[];
    for(const row of rows.filter(r=>r.kind==='building'&&r.path)){
      const target=rows.find(r=>r.entityId===row.entityId&&r.kind!=='building');
      if(!target)continue;
      const a=row.position,b=target.position,dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
      const nx=-dz/length*.3,nz=dx/length*.3;
      for(let i=0;i<12;i++){
        const segment=[i/12,(i+1)/12].map(t=>({x:a.x+dx*t,z:a.z+dz*t}));
        if(segment.some(p=>!this.world.contains(p.x,p.z,.5)))continue;
        const corners=segment.flatMap(p=>[-1,1].map(side=>[p.x+nx*side,this.world.surfaceAt(p.x+nx*side,p.z+nz*side)+.08,p.z+nz*side]));
        for(const k of [0,2,1,1,2,3])pathPositions.push(...corners[k]);
      }
    }
    const paths=new THREE.BufferGeometry();paths.setAttribute('position',new THREE.Float32BufferAttribute(pathPositions,3));paths.computeVertexNormals();
    const pathMesh=new THREE.Mesh(paths,new THREE.MeshStandardMaterial({color:mix(PALETTE.NEUTRAL_BONE,PALETTE.BASE_EARTH,.28),roughness:1,side:THREE.DoubleSide}));
    pathMesh.receiveShadow=true;pathMesh.name='settlement-footpaths';next.add(pathMesh);
    this.buildForest(occupied);
    const byRecipe=new Map(rows.map(r=>[r.id,r]));
    field.group.updateMatrixWorld(true);
    for(const pick of field.picks){
      const row=byRecipe.get(pick.userData.fanAssetId);pick.userData.fanNodeId=row.entityId;
      row.pick=pick;row.labelPosition=pick.getWorldPosition(new THREE.Vector3());
      row.labelPosition.y+=row.kind==='event'?Math.min(18,row.focusDistance*.16):row.scale*2;
    }
    const previous=this.group;
    this.engine.add(next);this.group=next;this.rows=rows;this.picks=field.picks;
    this.animated=[...field.animated,...eventAnimations];this.stats=field.stats;this.plan=plan;this.revision++;
    this.engine.remove(previous);release(previous);
    this.selection=null;this.setSelected(this.selected,this.selectedRow);
  }
  rowFor(id,preferred){
    const candidates=this.rows.filter(r=>r.entityId===id);
    return candidates.find(r=>r.id===preferred)||candidates.find(r=>r.kind==='person')
      ||candidates.find(r=>r.kind==='event')||candidates[0];
  }
  focus(id,preferred){
    const row=this.rowFor(id,preferred);if(!row)return false;
    this.engine.flyTo(row.pick.getWorldPosition(new THREE.Vector3()),row.focusDistance||110,650);return true;
  }
  focusPeriod(id){
    const scenes=this.rows.filter(r=>r.kind==='event'&&!r.compact);
    const row=scenes.find(r=>r.entityId===id)||scenes.sort((a,b)=>
      Number(b.placement==='site')-Number(a.placement==='site')||(b.participants?.length||0)-(a.participants?.length||0))[0]
      ||this.rows.find(r=>r.kind==='person');
    if(!row){this.world.frame(this.engine);return false;}
    this.activeScene=row.entityId;
    this.engine.flyTo(row.position.clone().add(new THREE.Vector3(0,5,0)),row.focusDistance||125,650);return true;
  }
  setSelected(id,preferred){
    this.selected=id;this.selectedRow=preferred;
    if(this.selection){release(this.selection);this.selection=null;}
    const row=this.rowFor(id,preferred);if(!row)return;
    const radius=Math.min(2.2,row.focusDistance*.025);
    const ring=new THREE.Mesh(new THREE.RingGeometry(radius,radius*1.09,40),
      new THREE.MeshBasicMaterial({color:PALETTE.ACCENT_GOLD,side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.copy(row.position);ring.position.y+=.1;
    this.group.add(ring);this.selection=ring;this.selectedRow=row.id;
  }
  update(t){for(const animation of this.animated||[])animation.update(t);}
}
