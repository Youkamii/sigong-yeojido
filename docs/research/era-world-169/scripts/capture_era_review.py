import base64,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path(__file__).parent/'sigong-era-review'/'captures';out.mkdir(parents=True,exist_ok=True)
# Camera focus coordinates are inspection points, not new historical location claims.
points={
 'amsa':(127.13,37.56),'gimhae':(128.88111111111,35.234166666667),'pyongyang':(125.7475,39.016666666666666),
 'donghae':(128.89,37.75),'guknae':(126.19,41.13),'sabi':(126.9125,36.281944444444),
 'gyeongju':(129.21666666667,35.85),'sanggyong':(129.15,44.1),'wando':(126.76,34.35),
 'gaegyeong':(126.54333333333334,37.985),'byeokrando':(126.37,37.92),'ganghwa':(126.44,37.71),
 'cheongju':(127.48972222222,36.637222222222),'gangjin':(126.77,34.6),'hanseong':(126.9768,37.57988),
 'andong':(128.73,36.57),'jeonju':(127.15,35.82),'busan':(129.075,35.18),'incheon':(126.64861,37.46389),
 'jeju':(126.54,33.36),'mokpo':(126.39,34.79),'pohang':(129.36,36.02),'seoul_gangnam':(127.035,37.5)}
plan=[
 (-2000,['amsa']),(-1000,['amsa','jeju']),(-100,['gimhae']), (200,['gimhae','pyongyang','donghae']),
 (400,['guknae','pyongyang']), (600,['sabi','gyeongju','gimhae']),
 (645,['gyeongju']),(646,['gyeongju']),(800,['sanggyong','gyeongju']),(830,['wando']),
 (920,['sanggyong','gyeongju']), (1100,['gaegyeong','byeokrando']), (1240,['ganghwa']),
 (1356,['pyongyang']), (1377,['cheongju','gangjin']),
 (1450,['hanseong','jeonju']),(1592,['busan']),(1593,['busan']),
 (1700,['hanseong','andong']),(1795,['jeju','hanseong']),
 (1880,['hanseong','incheon']),(1900,['hanseong','incheon','mokpo']),
 (1925,['hanseong','pyongyang']),(1935,['busan','incheon']),
 (1948,['jeju']),(1953,['hanseong','busan']),(1960,['hanseong','jeju']),
 (1975,['seoul_gangnam','pohang','pyongyang']),(1995,['seoul_gangnam','busan']),
 (2006,['jeju']),(2020,['seoul_gangnam','incheon','pyongyang','jeju'])]
report={'code':'7312de21','url':'https://sigong.rabbion.info/','views':[],'errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
 page=b.new_page(viewport={'width':1440,'height':960});page.set_default_timeout(90000)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 try:
  page.goto(report['url'],wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly')
  page.evaluate('__sigong.engine.setQuality("medium",{manual:true,persist:false})')
  for year,locations in plan:
   page.locator('#historyYear').fill(str(year));page.locator('#historyYear').press('Enter')
   page.wait_for_function('y=>{const c=__sigong.chronicleScene;return c.chronicle.year===y&&!c.chronicle.loading&&c.assets.scenery.stats.ready&&c.assets.scenery.stats.year===y}',arg=year)
   for location in locations:
    for distance in [160,60]:
     lon,lat=points[location]
     page.evaluate('''p=>{const {world:w,engine:e}=__sigong;const [x,z]=w.toWorld(p.lon,p.lat);e.fly=null;e.controls.target.set(x,w.surfaceAt(x,z),z);e.camera.position.copy(e.controls.target).add(e.camera.position.clone().set(0,p.distance*.707,p.distance*.707));e.controls.update();}''',{'lon':lon,'lat':lat,'distance':distance})
     page.wait_for_timeout(350)
     filename=f'{year}-{location}-{distance}'
     row=page.evaluate('''()=>{const {world:w,engine:e,chronicleScene:c}=__sigong,s=c.assets.scenery;return {camera:e.camera.position.toArray(),target:e.controls.target.toArray(),period:s.period.id,namedRows:c.assets.rows.length,scenery:s.stats,detailArchetypes:[...s.houseScales.keys()],cells:s.landscapeCells.filter(p=>Math.hypot(p.site.x-e.controls.target.x,p.site.z-e.controls.target.z)<100).map(p=>({id:p.site.id,kind:p.site.kind,houses:p.layout.houses.length,fields:p.layout.fields.length})),stats:e.stats};}''')
     row.update(year=year,location=location,distance=distance,lon=lon,lat=lat,file=filename)
     data=page.evaluate('()=>{const e=__sigong.engine;e.composer.render();return e.renderer.domElement.toDataURL("image/jpeg",.91);}')
     (out/(filename+'-canvas.jpg')).write_bytes(base64.b64decode(data.split(',')[1]))
     page.screenshot(path=str(out/(filename+'-ui.jpg')),type='jpeg',quality=90)
     report['views'].append(row)
    (out/'manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(f'CAPTURED {year} {location}',flush=True)
 finally:
  (out/'manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');b.close()
