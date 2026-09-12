import json
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path(__file__).parent/'sigong-era-review'/'runtime-inspection.json'
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
 p=b.new_page(viewport={'width':1440,'height':960});p.set_default_timeout(90000)
 try:
  p.goto('https://sigong.rabbion.info/',wait_until='domcontentloaded');p.locator('#enter').click()
  p.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly')
  result=p.evaluate('''()=>{const {engine:e,world:w}=__sigong,matches=[]; e.scene.traverse(o=>{if(/river/i.test(o.name||'')){let visible=true;for(let p=o;p;p=p.parent)visible&&=p.visible;matches.push({name:o.name,type:o.type,visible,children:o.children.length});}});return {riverObjects:matches,worldChildren:w.group.children.map(o=>({name:o.name,type:o.type,visible:o.visible})),worldBounds:w.bounds,navigationBounds:w.navigationBounds,geographyKeys:Object.keys(w.geo||{}),selectedYear:__sigong.chronicleScene.chronicle.year};}''')
  out.write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps(result))
 finally:b.close()
