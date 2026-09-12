import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=(await readFile(new URL('../services/host/app/chronicle-paths.js',import.meta.url),'utf8')).replace("'three'",JSON.stringify(new URL('../services/host/vendor/three.module.min.js',import.meta.url).href));
const {CountrysidePaths,pathSegmentClear}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('active urban core cuts only intersecting rural street segments and restores on seeking back',()=>{
  const world={surfaceAt:()=>0,contains:()=>true};
  const paths=new CountrysidePaths(world,[{id:'west',x:-30,z:0,seed:50},{id:'east',x:30,z:0,seed:50}]);
  paths.sync(()=>true,[]);const full=paths.mesh.geometry.attributes.position.count;
  paths.sync(()=>true,[],[{x:0,z:0,radius:8}]);
  assert.ok(paths.mesh.geometry.attributes.position.count>full*.5);
  assert.ok(paths.mesh.geometry.attributes.position.count<full);
  assert.equal(paths.near(0,0,.1),false);assert.equal(paths.near(-25,0,1),true);
  const geometry=paths.mesh.geometry;paths.sync(()=>true,[],[{x:0,z:0,radius:8}]);assert.equal(paths.mesh.geometry,geometry);
  paths.sync(()=>true,[]);assert.equal(paths.mesh.geometry.attributes.position.count,full);assert.equal(paths.near(0,0,1),true);
});
test('segment crossing a core is excluded even with both endpoints outside it',()=>{
  assert.equal(pathSegmentClear({x:-10,z:0},{x:10,z:0},[{x:0,z:0,radius:2}]),false);
  assert.equal(pathSegmentClear({x:-10,z:3},{x:10,z:3},[{x:0,z:0,radius:2}]),true);
});
