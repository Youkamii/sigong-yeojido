"""Verify visible trees stay inside the sunlight projection while navigating."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base',required=True);parser.add_argument('--browser',required=True)
parser.add_argument('--out',type=Path,required=True)
args=parser.parse_args();args.out.mkdir(parents=True,exist_ok=True)
report={'base':args.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=args.browser)
    page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
    page.on('pageerror',lambda error:report['errors'].append(str(error)))
    def inspect(name):
        page.wait_for_function('!window.__sigong.engine.fly && window.__sigong.world.shadowCoverage')
        page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
        result=page.evaluate('''()=>{const r=window.__sigong,e=r.engine,w=r.world,a=r.chronicleScene.assets;
          const shadow=e.key.shadow.camera;let visible=0,clipped=0;
          for(const p of a.forestPositions){const view=p.clone().project(e.camera);
            if(Math.abs(view.x)>.98||Math.abs(view.y)>.98||Math.abs(view.z)>1)continue;
            visible++;for(const height of [0,14]){const q=p.clone();q.y+=height;q.project(shadow);
              if(Math.abs(q.x)>1||Math.abs(q.y)>1||Math.abs(q.z)>1)clipped++;}}
          return {visible,clipped,width:shadow.right-shadow.left,height:shadow.top-shadow.bottom,
            depth:shadow.far,terrainCasts:w.land.getObjectByName('peninsula-surface').castShadow,
            quality:e.quality,fps:e.stats.fps};}''')
        passed=result['visible']>0 and result['clipped']==0 and result['terrainCasts']
        report['checks'].append({'name':name,'pass':passed,'detail':result})
        print(json.dumps(report['checks'][-1]),flush=True)
        assert passed,result
        page.screenshot(path=str(args.out/(name+'.png')))
    try:
        page.goto(args.base,wait_until='domcontentloaded');page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.revision>0')
        inspect('regional')
        page.locator('#wholeMapBtn').click();inspect('whole')
        page.evaluate('''()=>{const e=window.__sigong.engine;
          const offset=e.camera.position.clone().sub(e.controls.target);
          offset.applyAxisAngle(e.camera.up,Math.PI/2);e.camera.position.copy(e.controls.target).add(offset);
          e.controls.update();}''');inspect('rotated')
        page.locator('#geographyDestination').select_option('taebaek-sanmaek');inspect('mountains')
        assert not report['errors'],report['errors']
    finally:
        (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        browser.close()
