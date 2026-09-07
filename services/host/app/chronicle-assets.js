import * as THREE from 'three';
import {compileAssetCatalog} from './assetcatalog.js';
import {buildAssetField} from './assetforge.js';
import {stableSeed} from './chronicle-world.js';
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
      const p=anchors.get(recipe.anchor),key=Math.floor(p.x/128)+':'+Math.floor(p.z/128);
      if(!regions.has(key))regions.set(key,[]);regions.get(key).push(recipe);
    }
    for(const region of regions.values())for(let i=0;i<region.length;i+=160){
      const field=buildAssetField({world:{ground:[],sky:[],anchorOf:id=>anchors.get(id),surfaceAt:()=>0,time:null,cata:null},
        catalog:this.catalog,recipes:region.slice(i,i+160),seed:'sigong-history'});
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
    const rows=[],anchors=new Map(),recipes=[],occupied=[],eventPositions=new Map();
    const add=(row,position,scale,archetype=row.archetype)=>{
      if(!position)return;
      anchors.set(row.id,position);
      recipes.push({id:row.id,anchor:row.id,archetype,form:row.kind==='person'?(archetype==='spearman'?'warrior':'civilian')
        :archetype==='battle'?'local':archetype==='hanging_scroll'?'plain':'compact',
        scale,seed:row.entityId,offset:[0,position.y,0]});
      rows.push({...row,archetype,position,scale});
    };
    const locate=row=>{
      const site=row.sites?.find(s=>this.world.contains(...this.world.toWorld(...s.geometry.coordinates)));
      if(site){const [x,z]=this.world.toWorld(...site.geometry.coordinates);return {position:new THREE.Vector3(x,this.world.surfaceAt(x,z),z),
        placement:'site',site,placementLabel:'출처에 연결된 사건 장소'};}
      const ref=row.locationReference;
      if(ref){const [x,z]=this.world.toWorld(ref.candidate.lon,ref.candidate.lat);
        if(this.world.contains(x,z))return {position:this.world.placeNear(x,z,3,occupied),placement:'related-place',
          placementLabel:ref.label+' 관련 기록 · 상징 배치'};}
      const center=row.kind==='person'&&[...eventPositions.values()][0]?.position;
      return {position:center?this.world.placeNear(center.x,center.z,3,occupied):this.world.displayAnchor(row.entityId,occupied,3),placement:'symbolic',
        placementLabel:'시대 구성용 상징 배치 · 실제 위치 미확인'};
    };
    for(const event of plan.events){
      const loc=locate(event);if(!loc.position)continue;
      const row={...event,...loc};add(row,loc.position,event.archetype==='battle'?1.2:2.6);
      occupied.push({...loc.position,radius:4});eventPositions.set(event.entityId,loc);
      const building=this.world.placeNear(loc.position.x,loc.position.z-6,3.6,occupied);
      if(building){add({...row,id:event.id+':building',kind:'building',label:event.label,detail:'사건을 나타내는 상징 건물'},
        building,event.archetype==='battle'?.75:1.1,event.archetype==='battle'?'gatehouse':'academy_hall');
        occupied.push({...building,radius:4});}
    }
    for(const person of plan.people){
      const event=plan.events.find(e=>e.participants.some(p=>p.entityId===person.entityId)&&eventPositions.has(e.entityId));
      const loc=event?eventPositions.get(event.entityId):locate(person);
      const position=event?this.world.placeNear(loc.position.x+5,loc.position.z+4,1.8,occupied):loc.position;
      if(!position)continue;
      const relationClaims=event?.participants.find(p=>p.entityId===person.entityId)?.relationClaims;
      add({...person,placement:event?'relation':loc.placement,placementLabel:event?event.label+' 관련 인물 · 상징 배치':loc.placementLabel,
        eventId:event?.entityId,relationClaims,site:event?loc.site:undefined},position,2.3);
      occupied.push({...position,radius:2.5});
      if(!event){
        const building=this.world.placeNear(position.x-5,position.z-4,3.3,occupied);
        if(building){add({...person,id:person.id+':building',kind:'building',placement:loc.placement,placementLabel:loc.placementLabel,
          detail:'인물의 기록을 여는 상징 건물'},building,1.1,person.archetype==='monk'?'pagoda':person.archetype==='scribe'?'academy_hall':'courtyard_house');
          occupied.push({...building,radius:3.5});}
      }
    }
    for(const building of rows.filter(r=>r.kind==='building')){
      for(let i=0;i<2;i++){
        const position=this.world.placeNear(building.position.x+(i?5:-5),building.position.z+2,1.6,occupied);
        if(!position)continue;
        add({...building,id:building.id+':house:'+i,detail:'장면을 구성하는 상징 가옥'},position,.55,i?'farmhouse':'house');
        occupied.push({...position,radius:1.8});
      }
    }
    const field=this.field(recipes,anchors);
    if(field.stats.built!==recipes.length||field.stats.dropped.length){release(field.group);throw Error('일부 역사 조형을 만들지 못했습니다.');}
    next.add(field.group);
    const pathPositions=[];
    for(const row of rows.filter(r=>r.kind==='building')){
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
    for(const pick of field.picks){
      const row=byRecipe.get(pick.userData.fanAssetId);pick.userData.fanNodeId=row.entityId;
      row.pick=pick;row.labelPosition=pick.position.clone();row.labelPosition.y+=pick.geometry.parameters.height/2+.7;
    }
    const previous=this.group;
    this.engine.add(next);this.group=next;this.rows=rows;this.picks=field.picks;
    this.animated=field.animated;this.stats=field.stats;this.plan=plan;this.revision++;
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
    this.engine.flyTo(row.pick.position.clone(),row.kind==='person'?86:106,650);return true;
  }
  focusPeriod(id){
    const scenes=this.rows.filter(r=>r.kind==='event');
    const row=scenes.find(r=>r.entityId===id)||scenes.sort((a,b)=>
      Number(b.placement==='site')-Number(a.placement==='site')||(b.participants?.length||0)-(a.participants?.length||0))[0]
      ||this.rows.find(r=>r.kind==='person');
    if(!row){this.world.frame(this.engine);return false;}
    this.activeScene=row.entityId;
    this.engine.flyTo(row.position.clone().add(new THREE.Vector3(0,5,0)),125,650);return true;
  }
  setSelected(id,preferred){
    this.selected=id;this.selectedRow=preferred;
    if(this.selection){release(this.selection);this.selection=null;}
    const row=this.rowFor(id,preferred);if(!row)return;
    const ring=new THREE.Mesh(new THREE.RingGeometry(2.2,2.4,40),
      new THREE.MeshBasicMaterial({color:PALETTE.ACCENT_GOLD,side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.copy(row.position);ring.position.y+=.1;
    this.group.add(ring);this.selection=ring;this.selectedRow=row.id;
  }
  update(t){for(const animation of this.animated||[])animation.update(t);}
}
