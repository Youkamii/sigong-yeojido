"""Check every published township ID and its actual 2D/3D evidence flow."""
import argparse
import json
from pathlib import Path
import time
from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS)
        page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];requests=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.on('request',lambda request:requests.append(request.url) if '/api/history-map' in request.url else None)
        page.add_init_script("window.__historyStrokes=0;const stroke=CanvasRenderingContext2D.prototype.stroke;CanvasRenderingContext2D.prototype.stroke=function(...a){if(this.canvas.id==='map'&&this.strokeStyle.toLowerCase()==='#d8b463')window.__historyStrokes++;return stroke.apply(this,a);};")
        get=lambda suffix:page.request.get(args.base+'/api/history-map'+suffix,timeout=180000)
        all_rows=get('?level=3').json()['features'];assert len(all_rows)==8176
        assert {f['properties']['sourceRecord']['lv'] for f in all_rows}=={3}
        original_bad=[f['id'] for f in all_rows if not f['properties']['originalGeometryValid']]
        display_bad=[f['id'] for f in all_rows if not f['properties']['displayGeometryValid']]
        assert len(original_bad)==14 and set(display_bad)=={'hgis-admin-55177','hgis-admin-142965'}
        early=get('?level=3&year=1883').json()['features'];assert early
        assert all(f['properties']['begin'].startswith('1883') for f in early)
        for suffix in ('&sources=','&sources=src-samguksagi','&origin=human','&year=1882','&year=1946'):
            assert get('?level=3'+suffix).json()['features']==[],suffix
        assert get('?level=5').status==400
        rows=[f for f in all_rows if f['properties']['validFrom']<=1914<=f['properties']['validTo']]
        assert len(rows)==6882
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000);page.locator('#enter').click()
        page.locator('#lensSelect').select_option('hgis-1910-1945')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('26개')")
        assert all('level=3' not in url for url in requests),requests
        started=time.monotonic();page.locator('#historyLevel').select_option('3')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('6882개')",timeout=180000)
        layer_seconds=round(time.monotonic()-started,3)
        assert page.evaluate('window.__historyStrokes')>0
        page.locator('#historyMapBtn').click();assert page.locator('[data-feature]').count()==6882
        label=rows[0]['properties']['label']
        page.get_by_role('textbox',name='역사 경계 이름 찾기').fill(label)
        matching=[f for f in rows if label in f['properties']['label']]
        assert page.locator('[data-feature]').count()==len(matching)<6882
        page.locator('[data-feature]').first.click();assert '원 호칭' in page.locator('#evi').inner_text()
        page.locator('[data-history-chunk]').click()
        page.wait_for_function("document.querySelector('#evi').textContent.includes('up_key')")
        sample=matching[0]
        chunk=page.request.get(args.base+'/api/chunk?id='+sample['properties']['citesChunk']).json()['chunk']
        assert json.loads(chunk['text'])==sample['properties']['sourceRecord']
        page.screenshot(path=str(args.out/'township-record.png'))
        bad=next(f for f in rows if not f['properties']['displayGeometryValid'])
        page.locator('#historyMapBtn').click();page.locator('[data-feature="'+bad['id']+'"]').click()
        assert '표시용 도형에도 오류' in page.locator('#evi').inner_text()
        started=time.monotonic();page.locator('#b3d').click()
        page.wait_for_function('window.__sigong?.world.historyTargets.length===6882',timeout=180000)
        three_seconds=round(time.monotonic()-started,3)
        ids=page.evaluate('window.__sigong.world.historyTargets.map(x=>x.userData.feature.id)')
        assert set(ids)=={f['id'] for f in rows}
        page.locator('#historyLevel').select_option('2')
        page.wait_for_function('window.__sigong.world.historyTargets.length===560',timeout=60000)
        assert not set(ids)&set(page.evaluate('window.__sigong.world.historyTargets.map(x=>x.userData.feature.id)'))
        page.locator('#historyLevel').select_option('3')
        page.wait_for_function('window.__sigong.world.historyTargets.length===6882',timeout=180000)
        page.locator('#humanOnly').check();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        assert page.evaluate('window.__sigong.engine.pickTargets.length')==0
        page.locator('#humanOnly').uncheck();page.wait_for_function('window.__sigong.world.historyTargets.length===6882',timeout=180000)
        page.locator('#noSources').click();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#lensSelect').select_option('hgis-1910-1945')
        page.wait_for_function('window.__sigong.world.historyTargets.length===6882',timeout=180000)
        page.locator('#b2d').click();page.locator('#historyMapBtn').click()
        page.screenshot(path=str(args.out/'township-map.png'))
        page.set_viewport_size({'width':480,'height':900})
        if page.locator('#sourcesBtn').get_attribute('aria-expanded')!='true':page.locator('#sourcesBtn').click()
        page.locator('#historyLevel').select_option('1')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('26개')")
        page.locator('#historyLevel').select_option('3')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('6882개')",timeout=180000)
        page.locator('#historyMapBtn').click();assert page.locator('#evi').is_visible()
        page.get_by_role('textbox',name='역사 경계 이름 찾기').fill(label);page.locator('[data-feature]').first.click()
        assert label in page.locator('#evi h3').inner_text()
        page.screenshot(path=str(args.out/'township-480.png'));assert not errors,errors
        browser.close()
    report={'base':args.base,'totalTownshipRecords':8176,'recordsIn1914':6882,'recordsIn1883':len(early),
        'originalInvalidGeometryIds':original_bad,'displayInvalidGeometryIds':display_bad,
        'layerSeconds':layer_seconds,'threeBuildSeconds':three_seconds,
        'checks':{'lazy_level_fetch':True,'levels':True,'filters':True,'year_overlap':True,'map_strokes':True,
            'name_search':True,'original_record':True,'invalid_geometry_notice':True,'three_geometry_ids':True,
            'no_stale_picks':True,'mobile_level_control':True},'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report['checks']))


if __name__=='__main__':main()
