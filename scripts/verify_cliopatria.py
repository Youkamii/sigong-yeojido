"""Exercise the published polity layer, raw records and real 2D/3D selection."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS)
        page=browser.new_page(viewport={'width':1440,'height':1000});errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.add_init_script("window.__historyStrokes=0;const stroke=CanvasRenderingContext2D.prototype.stroke;CanvasRenderingContext2D.prototype.stroke=function(...a){if(this.canvas.id==='map'&&this.strokeStyle.toLowerCase()==='#d8b463')window.__historyStrokes++;return stroke.apply(this,a);};")
        get=lambda query:page.request.get(args.base+'/api/history-map?level=0'+query,timeout=180000).json()['features']
        all_rows=get('');assert len(all_rows)==94
        assert len({f['properties']['sourceRecord']['Name'] for f in all_rows})==17
        assert all(f['properties']['originalGeometryValid'] and f['properties']['displayGeometryValid'] for f in all_rows)
        rows=get('&year=500');assert {f['properties']['sourceRecord']['Name'] for f in rows}=={'Byeonhan','Goguryeo','Silla','Baekje'}
        for suffix in ('&year=500&sources=','&year=500&sources=src-samguksagi','&origin=human','&year=2025'):
            assert not get(suffix),suffix
        assert get('&year=-197') and not get('&year=-198')
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000);page.locator('#enter').click()
        page.locator('#lensSelect').select_option('cliopatria-korea')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('4개')")
        assert page.locator('#historyLevel').input_value()=='0'
        assert page.evaluate('window.__historyStrokes')>0
        page.locator('#historyMapBtn').click();assert page.locator('[data-feature]').count()==4
        assert '건국·멸망' in page.locator('#evi').inner_text()
        target=next(f for f in rows if f['properties']['sourceRecord']['Name']=='Goguryeo')
        page.locator('[data-feature="'+target['id']+'"]').click()
        assert 'CRS84' in page.locator('#evi').inner_text()
        page.locator('[data-history-chunk]').click()
        page.wait_for_function("document.querySelector('#evi').textContent.includes('recordIndex')")
        chunk=page.request.get(args.base+'/api/chunk?id='+target['properties']['citesChunk']).json()['chunk']
        record=json.loads(chunk['text']);assert record['properties']==target['properties']['sourceRecord']
        assert record['geometrySha256']==target['properties']['originalGeometrySha256']
        page.screenshot(path=str(args.out/'record.png'))
        page.locator('#b3d').click();page.wait_for_function('window.__sigong?.world.historyTargets.length===4',timeout=180000)
        ids=page.evaluate('window.__sigong.world.historyTargets.map(x=>x.userData.feature.id)')
        assert set(ids)=={f['id'] for f in rows}
        assert page.evaluate('window.__sigong.world.historyTargets.every(x=>x.geometry.attributes.position.count>0)')
        page.locator('#humanOnly').check();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#humanOnly').uncheck();page.wait_for_function('window.__sigong.world.historyTargets.length===4')
        page.locator('#noSources').click();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#lensSelect').select_option('hgis-1910-1945')
        page.wait_for_function('window.__sigong.world.historyTargets.length===26')
        assert page.locator('#historyLevel').input_value()=='1'
        page.locator('#historyLevel').select_option('2');page.wait_for_function('window.__sigong.world.historyTargets.length===560',timeout=60000)
        page.locator('#lensSelect').select_option('cliopatria-korea');page.wait_for_function('window.__sigong.world.historyTargets.length===4')
        page.locator('#b2d').click();page.screenshot(path=str(args.out/'map.png'))
        page.set_viewport_size({'width':480,'height':900})
        if page.locator('#sourcesBtn').get_attribute('aria-expanded')!='true':page.locator('#sourcesBtn').click()
        page.locator('#historyMapBtn').click();page.locator('[data-feature="'+target['id']+'"]').click()
        assert page.locator('#evi').is_visible() and '고구려' in page.locator('#evi h3').inner_text()
        page.screenshot(path=str(args.out/'mobile.png'))
        assert not errors,errors
        browser.close()
    report={'base':args.base,'records':94,'names':17,'recordsIn500':4,
            'checks':{'published_periods':True,'source_and_ai_filters':True,'raw_record':True,'geometry_hash':True,
                      'canvas_strokes':True,'three_geometry':True,'clears_stale_geometry':True,'switches_admin_level':True,'mobile':True},
            'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':main()
