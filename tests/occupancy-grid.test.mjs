import test from 'node:test';
import assert from 'node:assert/strict';
import {occupancyGrid} from '../services/host/app/occupancy-grid.js';

test('점유 격자는 칸 경계·음수 좌표·큰 원·접점에서 전수 검사와 같다',()=>{
  const occupied=[{x:0,z:0,radius:0},{x:16,z:-16,radius:2},{x:-31,z:32,radius:70},
    ...Array.from({length:70},(_,i)=>({x:(i*37)%200-100,z:(i*71)%200-100,radius:i%8}))];
  for(const margin of [0,.15]){
  const free=occupancyGrid(occupied,{cellSize:16,margin});
  for(let x=-120;x<=120;x+=3)for(let z=-120;z<=120;z+=5)for(const radius of [0,.15,2,18])
    assert.equal(free(x,z,radius),occupied.every(o=>Math.hypot(x-o.x,z-o.z)>radius+o.radius+margin),`${x},${z},${radius},${margin}`);
  }
  assert.equal(occupancyGrid([])(0,0,100),true);
  assert.equal(occupancyGrid([{x:0,z:0,radius:2}])(4,0,2),false);
  assert.equal(occupancyGrid([{x:16.1,z:0,radius:0}],{margin:.15})(15.99,0),false);
  const radius=.1,other=.2,margin=.15,tangent=radius+other+margin;
  assert.equal(occupancyGrid([{x:0,z:0,radius:other}],{margin})(tangent,0,radius),false);
});
