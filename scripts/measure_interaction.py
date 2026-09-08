"""Measure real frame gaps and synchronous year input work on the live viewer."""
import argparse,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--width',type=int,default=1920);p.add_argument('--height',type=int,default=1080)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);report={'base':a.base,'viewport':[a.width,a.height],'errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser);page=b.new_page(viewport={'width':a.width,'height':a.height});page.set_default_timeout(180000)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 try:
  start=time.monotonic();page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!window.__sigong.chronicleScene.chronicle.loading&&!window.__sigong.engine.fly')
  report['readySeconds']=round(time.monotonic()-start,3)
  report['scene']=page.evaluate('''()=>{const {engine:e,chronicleScene:c}=window.__sigong,gl=e.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return {gpu:ext&&gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),quality:e.quality,devicePixelRatio:devicePixelRatio,pixelRatio:e.pixelRatio,drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],trees:c.assets.forestPositions.length,cursor:getComputedStyle(document.querySelector('.time-slider input')).cursor};}''')
  page.evaluate('''()=>{window.inputWork=[];for(const [object,key] of [[__sigong.chronicleScene.assets,'rebuild'],[__sigong.chronicleScene.assets,'buildForest'],[__sigong.chronicleScene.chronicle,'render']]){const fn=object[key];object[key]=function(...args){const start=performance.now();try{return fn.apply(this,args);}finally{inputWork.push({name:key,ms:performance.now()-start});}};}window.frameGaps=[];let last;const tick=t=>{if(last)frameGaps.push(t-last);last=t;requestAnimationFrame(tick);};requestAnimationFrame(tick);}''')
  report['scrub']=page.evaluate('''async()=>{const slider=document.querySelector('.time-slider input'),durations=[],start=performance.now();frameGaps=[];for(let year=1580;year<=1600;year++){slider.value=year;const t=performance.now();slider.dispatchEvent(new Event('input',{bubbles:true}));durations.push(performance.now()-t);await new Promise(r=>setTimeout(r,16));}slider.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,600));return {milliseconds:performance.now()-start,inputDurations:durations,work:inputWork,year:__sigong.chronicleScene.assets.plan.year,frames:frameGaps};}''')
  page.wait_for_function('!window.__sigong.engine.fly')
  for name in ['continuous-pan','overview']:
   if name=='overview':page.locator('#wholeMapBtn').click();page.wait_for_function('!window.__sigong.engine.fly')
   page.evaluate('frameGaps=[]')
   if name=='continuous-pan':
    page.mouse.move(a.width*.4,a.height*.45);page.mouse.down()
    for i in range(100):page.mouse.move(a.width*.4+i*2,a.height*.45+i*.25);page.wait_for_timeout(16)
    page.mouse.up()
   else:page.wait_for_timeout(2500)
   report[name]=page.evaluate('''()=>{const f=frameGaps.slice().sort((a,b)=>a-b);return {frames:f.length,actualFps:f.length*1000/f.reduce((a,b)=>a+b,0),p95:f[Math.floor(f.length*.95)],max:Math.max(...f),over50:f.filter(x=>x>50).length,stats:__sigong.engine.stats};}''')
  page.screenshot(path=str(a.out/'screen.png'))
 finally:
  (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
print(json.dumps({k:v for k,v in report.items() if k!='scrub'},ensure_ascii=False))
