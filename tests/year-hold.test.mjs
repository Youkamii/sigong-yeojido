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

test('slider maps absolute position and release commits once without hold acceleration',async()=>{
  const {bindYearSlider}=await import('../services/host/app/year-hold.js');
  const windowListeners={},documentListeners={};
  globalThis.window={addEventListener:(name,fn)=>windowListeners[name]=fn};
  globalThis.document={hidden:false,addEventListener:(name,fn)=>documentListeners[name]=fn};
  try{
    let year=100,commits=0;const values=[],captures=new Set(),listeners={};
    const slider={min:'-2500',max:'2100',getBoundingClientRect:()=>({left:100,width:460}),focus(){},
      addEventListener:(name,fn)=>listeners[name]=fn,setPointerCapture:id=>captures.add(id),
      hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id)};
    bindYearSlider(slider,{read:()=>year,preview:(value,holding)=>{year=value;values.push([value,holding]);},commit:()=>commits++});
    const event=x=>({button:0,isPrimary:true,pointerId:7,clientX:x,preventDefault(){}});
    slider.onpointerdown(event(100));assert.equal(year,-2500);
    slider.onpointermove(event(560));assert.equal(year,2100);
    assert.deepEqual(values,[[-2500,true],[2100,true]]);
    slider.onpointerup(event(560));slider.onpointercancel(event(560));slider.onlostpointercapture();
    assert.equal(commits,1);assert.equal(captures.size,0);
    for(const finish of [()=>slider.onpointercancel(event(100)),()=>slider.onlostpointercapture(),()=>slider.onblur(),()=>windowListeners.blur(),()=>{document.hidden=true;documentListeners.visibilitychange();}]){
      const before=commits;slider.onpointerdown(event(100));finish();assert.equal(commits,before+1);assert.equal(captures.size,0);
    }
    slider.onkeydown({key:'ArrowRight',repeat:false,preventDefault(){}});assert.deepEqual(values.at(-1),[-2499,false]);
    slider.onkeydown({key:'ArrowRight',repeat:true,preventDefault(){}});assert.deepEqual(values.at(-1),[-2498,false]);
    listeners.wheel({deltaY:8,preventDefault(){}});assert.deepEqual(values.at(-1),[-2497,false]);
  }finally{delete globalThis.window;delete globalThis.document;}
});

test('atlas edge holds move a quarter window every 300ms and release commits once',async()=>{
  const {bindYearSlider}=await import('../services/host/app/year-hold.js');
  const {AtlasUI}=await import('../services/host/app/atlas-ui.js');
  const previousWindow=globalThis.window,previousDocument=globalThis.document;
  globalThis.window={addEventListener(){}};globalThis.document={hidden:false,addEventListener(){}};
  try{
    for(const direction of [-1,1]){
      let year=1200,commits=0,id=0;const tasks=new Map(),listeners={},captures=new Set();
      const slider={min:1000,max:1400,style:{},setAttribute(){},getBoundingClientRect:()=>({left:0,width:400}),focus(){},
        addEventListener:(name,fn)=>listeners[name]=fn,dispatchEvent:event=>listeners[event.type]?.(event),
        setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id)};
      const atlas=Object.create(AtlasUI.prototype);
      Object.assign(atlas,{rangeWindow:[1000,1400],slider,root:{querySelector:()=>({value:400})},time:{querySelector:()=>({})},
        currentTick:{style:{}},ticks:{children:[]}});
      listeners.yearedge=event=>atlas.syncTime(year,true,event.detail);
      bindYearSlider(slider,{read:()=>year,preview:value=>{year=value;atlas.syncTime(value,true);},commit:()=>commits++,
        schedule:(fn,delay)=>{tasks.set(++id,{fn,delay});return id;},cancel:id=>tasks.delete(id)});
      const event={button:0,isPrimary:true,pointerId:1,clientX:direction<0?0:400,preventDefault(){}};
      slider.onpointerdown(event);assert.equal(year,direction<0?1000:1400);assert.equal(commits,0);
      for(let i=1;i<=2;i++){
        const [id,task]=tasks.entries().next().value;assert.equal(task.delay,300);tasks.delete(id);task.fn();
        assert.deepEqual(atlas.rangeWindow,[1000+direction*100*i,1400+direction*100*i]);
        assert.equal(year,(direction<0?1000:1400)+direction*100*i);assert.equal(commits,0);
      }
      slider.onpointermove({...event,clientX:200});assert.equal(tasks.size,0,'leaving edge cancels window movement');
      slider.onpointermove(event);assert.equal(tasks.size,1);
      slider.onpointerup(event);assert.equal(commits,1);assert.equal(tasks.size,0);assert.equal(captures.size,0);
      atlas.rangeWindow=direction<0?[-2500,-2100]:[1700,2100];atlas.syncTime(direction<0?-2500:2100);
      slider.onpointerdown(event);assert.equal(tasks.size,0,'global bounds stop edge timers');slider.onpointercancel(event);
      assert.equal(commits,2);
    }
  }finally{if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
    if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;}
});
