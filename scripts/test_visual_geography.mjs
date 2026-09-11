import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {RIVERS,RIVER_SOURCE} from '../services/host/app/river-paths.js';
import {GRID_XZ,GRID_INDICES,GRID_INFO} from '../services/host/app/terrain-grid.js';
import {RIVER_MESH,RIVER_MESH_SOURCE} from '../services/host/app/river-grid.js';
const bytes=async path=>readFile(new URL('../'+path,import.meta.url));
const hash=data=>createHash('sha256').update(data).digest('hex');
assert.equal(hash(gunzipSync(await bytes('data/geo/korea-rivers-osm.json.gz'))),RIVER_SOURCE.rawSha256);
assert.equal(RIVER_SOURCE.license,'ODbL-1.0');
assert.equal(hash((await bytes('services/host/app/river-paths.js')).toString().replace(/\r\n/g,'\n')),RIVER_MESH_SOURCE);
assert.equal(new Set(RIVERS.map(r=>r.name)).size,13);
for(const name of ['한강','금강','낙동강','영산강','섬진강','대동강','청천강','압록강','두만강'])assert.ok(RIVERS.some(r=>r.name===name),name);
for(const river of RIVERS){
  assert.ok(river.osm.length&&river.paths.length);
  for(const path of river.paths){
    assert.ok(path.length>1);
    for(const [lon,lat] of path)assert.ok(lon>123&&lon<132&&lat>33&&lat<43.5,'River coordinates must use the same lon/lat order and extent as the map');
  }
}
assert.equal(hash(await bytes('services/host/app/korea-outline.json')),GRID_INFO.outlineSha256);
const decode=(text,Type)=>new Type(Uint8Array.from(atob(text),c=>c.charCodeAt(0)).buffer);
assert.ok(Object.values(RIVER_MESH).reduce((n,m)=>n+m.triangles,0)<40000,'Joined river meshes have a bounded geometry cost');
for(const mesh of Object.values(RIVER_MESH)){
  const positions=decode(mesh.xz,Float32Array),indices=decode(mesh.indices,Uint16Array);
  assert.equal(indices.length/3,mesh.triangles);assert.ok([...positions].every(Number.isFinite));
  for(let i=0;i<indices.length;i+=3){
    const [a,b,c]=[indices[i]*2,indices[i+1]*2,indices[i+2]*2];
    const cross=(positions[b+1]-positions[a+1])*(positions[c]-positions[a])-(positions[b]-positions[a])*(positions[c+1]-positions[a+1]);
    assert.ok(cross>=-1e-4,'Water and bank polygons face upward at tight bends');
  }
}
const xz=decode(GRID_XZ,Float32Array),indices=decode(GRID_INDICES,Uint16Array);
assert.equal(xz.length/2,GRID_INFO.vertices);assert.equal(indices.length/3,GRID_INFO.triangles);
assert.ok(GRID_INFO.triangles<30000);assert.ok(Math.abs(GRID_INFO.areaRatio-1)<1e-6,'Clipping preserves the original land area');
assert.ok([...xz].every(Number.isFinite));
for(let i=0;i<indices.length;i+=3){
  const [a,b,c]=[indices[i]*2,indices[i+1]*2,indices[i+2]*2];
  assert.ok(Math.max(a,b,c)<xz.length);
  const area=(xz[b+1]-xz[a+1])*(xz[c]-xz[a])-(xz[b]-xz[a])*(xz[c+1]-xz[a+1]);
  assert.ok(area>=-1e-4,'Land faces upward; allow float32 rounding of coastal slivers');
}
console.log('PASS: source hashes, 13 river systems, coordinates, coastline area, terrain size and upward faces');
