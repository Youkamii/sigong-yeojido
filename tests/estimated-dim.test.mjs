import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const THREE=await import('three');
const {isEstimatedSite,dimmedMaterialFor,setEstimatedMesh,markEstimatedGroup}=await import('../services/host/app/scenery-estimated-dim.js');
const {sceneryOverview}=await import('../services/host/app/scenery-overview.js');
const {sceneryPeriod}=await import('../services/host/app/scenery-period.js');
const {CountrysidePaths}=await import('../services/host/app/chronicle-paths.js');
const {ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js');

const estimated={id:'estimated',estimated:true,documented:false,kind:'village',x:0,z:0,radius:12,angle:0,seed:3};

test('only boolean estimated true marks a site for dimming',()=>{
  assert.equal(isEstimatedSite(estimated),true);
  assert.equal(isEstimatedSite({...estimated,documented:true,kind:'urban'}),true);
  for(const site of [undefined,{}, {...estimated,estimated:'true'}, {...estimated,estimated:false},
    {documented:true}, {kind:'urban'}, {scope:'facility'}])assert.equal(isEstimatedSite(site),false);
});

test('dim material keeps its source intact, shares variants and restores the exact source',()=>{
  const base=new THREE.MeshStandardMaterial({color:'#46812a',opacity:.8,transparent:false,depthWrite:true});
  const before=base.toJSON(),dim=dimmedMaterialFor(base,true);
  assert.notEqual(dim,base);assert.deepEqual(base.toJSON(),before);
  assert.equal(dim.opacity,.55);assert.equal(dim.transparent,true);assert.equal(dim.depthWrite,false);
  assert.equal(dim.forceSinglePass,true,'transparent double-sided fields must not add a back-face draw');
  for(let i=0;i<2;i++){
    assert.equal(dimmedMaterialFor(base,true),dim);assert.equal(dimmedMaterialFor(dim,true),dim);
    assert.equal(dimmedMaterialFor(dim,false),base);
  }
  const far=dimmedMaterialFor(base,true,true);
  assert.equal(far.opacity,1);assert.equal(far.transparent,false);assert.equal(far.depthWrite,true);
  assert.equal(dimmedMaterialFor(base,true,true),far);
  let disposed=0;dim.addEventListener('dispose',()=>disposed++);far.addEventListener('dispose',()=>disposed++);
  base.dispose();assert.equal(disposed,2);
});

test('the color shader desaturates combined vertex/instance colors once and retains existing shader hooks',()=>{
  const base=new THREE.MeshStandardMaterial({vertexColors:true});let calls=0;
  base.onBeforeCompile=shader=>{calls++;shader.uniforms.wind={value:.9};};
  base.customProgramCacheKey=()=> 'existing-wind';
  const shader={uniforms:{},fragmentShader:THREE.ShaderLib.standard.fragmentShader};
  const dim=dimmedMaterialFor(base,true);dim.onBeforeCompile(shader);
  assert.equal(calls,1);assert.equal(shader.uniforms.wind.value,.9);
  assert.equal((shader.fragmentShader.match(/float estimatedGray/g)||[]).length,1);
  assert.ok(shader.fragmentShader.indexOf('float estimatedGray')>shader.fragmentShader.indexOf('#include <color_fragment>'));
  assert.match(shader.fragmentShader,/vec3\(estimatedGray\), 0\.45/);
  assert.match(shader.fragmentShader,/vec3\(1\.0\), 0\.08/);
  assert.equal(dim.customProgramCacheKey(),'existing-wind|estimated-dim-v1');
});

test('mesh toggles preserve geometry, instance colors, material arrays and original shadow settings',()=>{
  const geometry=new THREE.BoxGeometry(),base=new THREE.MeshStandardMaterial({color:'green'});
  const mesh=new THREE.InstancedMesh(geometry,base,2);mesh.setColorAt(0,new THREE.Color('red'));mesh.setColorAt(1,new THREE.Color('blue'));
  mesh.castShadow=true;mesh.userData.estimatedBackground=true;
  const colors=mesh.instanceColor.array.slice(),matrix=mesh.instanceMatrix;
  setEstimatedMesh(mesh,true);assert.equal(mesh.castShadow,false);assert.equal(mesh.material.opacity,.55);
  setEstimatedMesh(mesh,false);assert.equal(mesh.castShadow,true);assert.equal(mesh.material,base);
  assert.equal(mesh.geometry,geometry);assert.equal(mesh.instanceMatrix,matrix);assert.deepEqual(mesh.instanceColor.array,colors);
  const invisible=new THREE.MeshBasicMaterial({visible:false});
  const group=new THREE.Group(),multi=new THREE.Mesh(geometry,[base,invisible]);group.add(multi);
  markEstimatedGroup(group,true,true);assert.equal(multi.material[0].opacity,.55);assert.equal(multi.material[1],invisible);
  markEstimatedGroup(group,false,true);assert.equal(multi.material[0],base);assert.equal(multi.castShadow,false);
});

test('overview splits estimated and documented sites at most in two, sharing three materials across buckets',()=>{
  const world={surfaceAt:()=>0},period=sceneryPeriod(1450);
  const layout={houses:[{x:0,z:0,scale:1,archetype:'rural_cottage'}],fields:[{corners:[[2,2],[4,2],[4,4],[2,4]],color:0}],
    roads:[{points:[[0,0],[4,4]],width:.5}],spaces:[{x:0,z:2,width:1,depth:1}]};
  const cells=[0,600].flatMap(x=>[{site:{...estimated,id:'e'+x,x},layout},{site:{...estimated,id:'d'+x,x:x+30,estimated:false,documented:true},layout}]);
  const group=sceneryOverview(world,cells,period),plain=sceneryOverview(world,cells.map(c=>({...c,site:{...c.site,estimated:false}})),period);
  group.traverse(mesh=>setEstimatedMesh(mesh,true));
  assert.equal(group.children.length,plain.children.length*2);
  assert.equal(new Set(group.children.map(m=>m.material)).size,3);
  assert.equal(group.children.reduce((n,m)=>n+m.geometry.attributes.position.count,0),plain.children.reduce((n,m)=>n+m.geometry.attributes.position.count,0));
  for(const mesh of group.children){
    if(mesh.userData.estimatedBackground)assert.equal(mesh.material.opacity,mesh.name==='settlement-roofs'?1:.55);
    else assert.equal(mesh.material,plain.children[0].material);
  }
});

test('only paths with two estimated endpoints dim and toggling preserves geometry',()=>{
  for(const [a,b] of [[true,true],[true,false],[false,true],[false,false]]){
    const sites=[{...estimated,id:'a',x:-30,estimated:a},{...estimated,id:'b',x:30,estimated:b}];
    const paths=new CountrysidePaths({surfaceAt:()=>0,contains:()=>true},sites);paths.sync(()=>true,[]);
    assert.equal(paths.estimatedMesh.geometry.attributes.position.count>0,a&&b);
    assert.equal(paths.mesh.geometry.attributes.position.count>0,!(a&&b));
    const geometry=paths.estimatedMesh.geometry;setEstimatedMesh(paths.estimatedMesh,false);
    assert.equal(paths.estimatedMesh.geometry,geometry);assert.equal(paths.estimatedMesh.material,paths.mesh.material);
    setEstimatedMesh(paths.estimatedMesh,true);assert.equal(paths.estimatedMesh.material.opacity,.55);
  }
});

test('display toggle is idempotent and preserves geometry and documented materials',()=>{
  const group=new THREE.Group(),geometry=new THREE.BoxGeometry(),base=new THREE.MeshStandardMaterial();
  const estimatedMesh=new THREE.Mesh(geometry,base),documentedMesh=new THREE.Mesh(geometry,base);
  estimatedMesh.userData.estimatedBackground=true;estimatedMesh.castShadow=true;group.add(estimatedMesh,documentedMesh);
  const scenery=Object.create(ChronicleScenery.prototype);
  Object.assign(scenery,{group,estimatedDim:true,refreshPeriod(){assert.fail('must not rebuild');}});
  scenery.setDisplay(true,true,true);const dim=estimatedMesh.material;
  for(let i=0;i<2;i++){
    scenery.setDisplay(true,true,true);assert.equal(estimatedMesh.material,dim);assert.equal(estimatedMesh.castShadow,false);
  }
  for(let i=0;i<2;i++){
    scenery.setDisplay(true,true,false);assert.equal(estimatedMesh.material,base);assert.equal(estimatedMesh.castShadow,true);
  }
  assert.equal(documentedMesh.material,base);assert.equal(estimatedMesh.geometry,geometry);
});
