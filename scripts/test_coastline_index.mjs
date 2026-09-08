import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {insideCoastline,coastlineDistance} from '../services/host/app/coastline-index.js';
import {projectCoordinates} from '../services/host/app/history-coordinates.js';
const geometry=JSON.parse(await readFile(new URL('../services/host/app/korea-outline.json',import.meta.url),'utf8')).geometry;
const rings=geometry.coordinates.map(p=>p[0].map(c=>projectCoordinates(...c,8)));
function inside(x,z,ring){let value=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const a=ring[i],b=ring[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])value=!value;
}return value;}
function distance(x,z,ring){let best=Infinity;for(let i=0;i<ring.length-1;i++){
  const a=ring[i],b=ring[i+1],dx=b[0]-a[0],dz=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
  best=Math.min(best,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));
}return best;}
let checks=0;
for(const ring of rings){
  const samples=[ring[0],ring[Math.floor(ring.length/2)],...Array.from({length:10},(_,i)=>[ring[i%ring.length][0]+Math.sin(i*19)*45,ring[i%ring.length][1]+Math.cos(i*11)*45])];
  for(const [x,z] of samples){
    assert.equal(insideCoastline(x,z,ring),inside(x,z,ring));
    const exact=distance(x,z,ring);
    for(const limit of [.1,1.2,18.4,Infinity])assert.ok(Math.abs(coastlineDistance(x,z,ring,limit)-Math.min(exact,limit))<1e-8);
    checks++;
  }
}
console.log(`PASS: ${checks} actual coastline points preserve containment and shore distance`);
