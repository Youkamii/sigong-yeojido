"""Check actual collected scenes through the served API and renderer, without fixtures."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
p.add_argument('--scene',action='append',help='Limit a follow-up run to named real scene packets')
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
report={'base':a.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=a.browser)
    page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
    page.on('pageerror',lambda e:report['errors'].append(str(e)))
    def check(name,passed,detail=None):
        row={'name':name,'pass':bool(passed),'detail':detail};report['checks'].append(row)
        print(json.dumps(row,ensure_ascii=False),flush=True)
        assert passed,(name,detail)
    def year(n):
        c=page.locator('#historyTime [type=number]');c.fill(str(n));c.press('Enter')
        page.wait_for_function('(n)=>window.__sigong.chronicleScene.assets.plan.year===n',arg=n)
        page.wait_for_function('!document.querySelector("#chronicle [role=status]") && !window.__sigong.engine.fly')
    def select(scene_id):
        value=page.locator('#sceneDestination option').evaluate_all('(rows,id)=>rows.find(o=>o.dataset.sceneRow===id)?.value',scene_id)
        check(scene_id+' is selectable',bool(value))
        page.locator('#sceneDestination').select_option(value)
        page.wait_for_function('!window.__sigong.engine.fly')
        return page.evaluate('''id=>{const r=window.__sigong,a=r.chronicleScene.assets,e=a.plan.events.find(e=>e.id===id),rows=a.rows.filter(r=>r.sceneId===id);
          return {active:a.activeScene,place:e?.scenePlace,kind:rows.find(r=>r.kind==='event')?.sceneKind,
            rows:rows.map(row=>({archetype:row.archetype,kind:row.kind,inside:r.world.contains(row.position.x,row.position.z),
              coordinates:r.world.coordinatesAt(row.position.x,row.position.z),action:row.action,side:row.side,compact:row.compact})),
            dropped:a.stats.dropped,requested:a.stats.requested,built:a.stats.built};}''',scene_id)
    try:
        page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.revision>0 || window.__sigongErr || window.__sigong?.chronicleScene.error')
        check('Renderer initialized',page.evaluate('!window.__sigongErr&&!window.__sigong.chronicleScene.error'))
        page.wait_for_function('window.__sigong.chronicleScene.chronicle.data.claims.length>0 || window.__sigong.chronicleScene.chronicle.error')
        counts=page.evaluate('''()=>{const r=window.__sigong;return {packets:r.world.scenePackets.length,
          collectedClaims:r.chronicleScene.chronicle.data.claims.filter(c=>c.id.startsWith('claim-scenes-103-')).length,
          claims:r.chronicleScene.chronicle.data.claims.length,error:r.chronicleScene.chronicle.error};}''')
        check('Served API contains the new era evidence',counts['packets']>=145 and counts['collectedClaims']>=850,counts)
        packets=page.evaluate('window.__sigong.world.scenePackets')
        samples=[('scene-anc-usanguk-512','harbor'),('scene-anc-cheonghaejin-828','harbor'),
          ('scene-je-hunminjeongeum-haerye-1446','publication'),('scene-je-daemado-chulhang-1419','harbor'),
          ('scene-je-eulmyo-waebyeon-1555',None),('scene-gohado-jin-1597',None),
          ('scene-syj103-gohado-jujun-1597-1598',None),('scene-jl-injo-banjeong-hongjewon-1623',None),
          ('scene-jl-injo-banjeong-changdeokgung-1623',None),('scene-jl-donghak-yongdam-1860','assembly'),
          ('scene-hwangtohyeon-1894','battle'),('scene-incheon-airport-2001',None),
          ('scene-jinpo-1380','naval'),('scene-jeon-taeil-1970',None),('scene-nuri-launch-2021','launch')]
        for words,kind in [('포항','industry'),('지하철','rail'),('인천상륙','naval')]:
            packet=next(s for s in packets if words in s['title']);samples.append((packet['id'],kind))
        if a.scene:samples=[s for s in samples if s[0] in a.scene]
        for scene_id,kind in samples:
            packet=next(s for s in packets if s['id']==scene_id);year(packet['startYear']);result=select(scene_id)
            check(scene_id+' expands its own models',result['active']==scene_id and any(r['kind']=='event' and not r.get('compact') for r in result['rows'])
              and not result['dropped'] and result['built']==result['requested'] and (not kind or result['kind']==kind),result)
            if scene_id=='scene-jl-donghak-yongdam-1860':check('Individual practice has no invented crowd',not any(r['kind']=='building' and r['archetype']=='human' for r in result['rows']))
            if scene_id in ('scene-gohado-jin-1597','scene-anc-cheonghaejin-828'):
                check(scene_id+' stands on the retained island',all(r['inside'] for r in result['rows'] if r['archetype'] not in ('ship','boat','motor_ship')))
            page.screenshot(path=str(a.out/(scene_id+'.png')))
        year(1593)
        features=page.evaluate('''()=>{const w=window.__sigong.world;return w.historyTargets.filter(t=>t.userData.feature.geometry.type==='Point').map(t=>{
          const f=t.userData.feature,[x,z]=w.toWorld(...f.geometry.coordinates),p=t.geometry.attributes.position;
          return {id:f.id,dx:Math.abs((p.getX(0)+p.getX(1))/2-x),dz:Math.abs(p.getZ(0)-z)};});}''')
        check('Historical point overlays use the same world projection',bool(features) and all(f['dx']<.001 and f['dz']<.001 for f in features),features)
        check('No browser execution errors',not report['errors'],report['errors'])
    finally:
        (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        browser.close()
