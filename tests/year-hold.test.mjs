import test from 'node:test';
import assert from 'node:assert/strict';
import {createYearHold,stepYear} from '../services/host/app/year-hold.js';
function fixture(year=100){
  let clock=0,id=0,commits=0;const jobs=new Map(),values=[];
  const hold=createYearHold({read:()=>year,preview:value=>{year=value;values.push(value);},commit:()=>commits++,now:()=>clock,
    schedule:(fn,delay)=>{jobs.set(++id,{fn,at:clock+delay});return id;},cancel:id=>jobs.delete(id)});
  return {hold,values,get year(){return year;},get commits(){return commits;},get pending(){return jobs.size;},advance(ms){
    const end=clock+ms;
    while(jobs.size){const [id,job]=[...jobs].sort((a,b)=>a[1].at-b[1].at)[0];if(job.at>end)break;jobs.delete(id);clock=job.at;job.fn();}
    clock=end;
  }};
}
test('tap is exactly one year and release cancels all future movement',()=>{
  const f=fixture();f.hold.start(1);assert.equal(f.year,101);f.advance(399);assert.equal(f.year,101);
  f.hold.stop();f.advance(10000);assert.equal(f.year,101);assert.equal(f.commits,1);assert.equal(f.pending,0);
});
test('sustained input accelerates progressively and reversal resets acceleration',()=>{
  const f=fixture();f.hold.start(1);f.advance(1100);assert.equal(f.values.at(-1)-f.values.at(-2),1);
  for(const [ms,step] of [[100,2],[1200,5],[1600,10],[2000,25]]){f.advance(ms);assert.equal(f.values.at(-1)-f.values.at(-2),step);}
  const year=f.year;f.hold.start(-1);assert.equal(f.year,year-1);f.advance(400);assert.equal(f.year,year-2);
  f.hold.stop();f.advance(1000);assert.equal(f.year,year-2);
});
test('BCE crossing has no zero and boundaries stop the scheduler',()=>{
  assert.equal(stepYear(-1,1),1);assert.equal(stepYear(1,-1),-1);assert.equal(stepYear(-2,5),4);
  for(const [start,direction,end] of [[2099,1,2100],[-2499,-1,-2500]]){
    const f=fixture(start);f.hold.start(direction);f.advance(10000);assert.equal(f.year,end);assert.equal(f.pending,0);assert.equal(f.commits,1);
  }
});
test('repeated keydown does not restart hold and external navigation can cancel without commit',()=>{
  const f=fixture();f.hold.start(1);f.advance(300);f.hold.start(1);f.advance(100);assert.equal(f.year,102);
  f.hold.stop(false);f.advance(10000);assert.equal(f.year,102);assert.equal(f.commits,0);
});

test('pointer cancellation, lost capture, key release, blur and hidden tab stop immediately',async()=>{
  const {bindYearHold}=await import('../services/host/app/year-hold.js');
  const windowListeners={},documentListeners={};
  globalThis.window={addEventListener:(name,fn)=>windowListeners[name]=fn};
  globalThis.document={hidden:false,addEventListener:(name,fn)=>documentListeners[name]=fn};
  const f=fixture(),captures=new Set();
  const button={dataset:{yearStep:'1'},focus(){},setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id)};
  bindYearHold({querySelectorAll:()=>[button]},f.hold);
  const pointer={button:0,isPrimary:true,pointerId:1,preventDefault(){}};
  for(const finish of [()=>button.onpointerup(pointer),()=>button.onpointercancel(pointer),()=>button.onlostpointercapture(),()=>button.onblur(),()=>windowListeners.blur(),()=>{document.hidden=true;documentListeners.visibilitychange();}]){
    button.onpointerdown(pointer);const year=f.year;finish();f.advance(10000);assert.equal(f.year,year);assert.equal(f.pending,0);assert.equal(captures.size,0);
  }
  button.onkeydown({key:'ArrowLeft',repeat:false,preventDefault(){}});const year=f.year;
  button.onkeyup({key:'ArrowLeft',preventDefault(){}});f.advance(10000);assert.equal(f.year,year);
  delete globalThis.window;delete globalThis.document;
});
