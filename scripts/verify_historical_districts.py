"""Check the published district records, level switching, evidence and mobile controls."""
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
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.add_init_script("window.__historyStrokes=0;const stroke=CanvasRenderingContext2D.prototype.stroke;CanvasRenderingContext2D.prototype.stroke=function(...a){if(this.canvas.id==='map'&&this.strokeStyle.toLowerCase()==='#d8b463')window.__historyStrokes++;return stroke.apply(this,a);};")
        get=lambda suffix:page.request.get(args.base+'/api/history-map'+suffix)
        all_rows=get('?level=2').json()['features'];assert len(all_rows)==726
        assert len(get('').json()['features'])==32
        assert {f['properties']['sourceRecord']['lv'] for f in all_rows}=={2}
        invalid=[f for f in all_rows if not f['properties']['originalGeometryValid']]
        assert len(invalid)==4
        assert get('?level=3').status==400
        for suffix in ('&sources=','&sources=src-samguksagi','&origin=human','&year=1909','&year=1946'):
            assert get('?level=2'+suffix).json()['features']==[],suffix
        rows=get('?level=2&year=1914&sources=src-hgis-admin-1910-1945').json()['features'];assert len(rows)==560
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000);page.locator('#enter').click()
        page.locator('#lensSelect').select_option('hgis-1910-1945')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('26개')")
        page.locator('#historyLevel').select_option('2')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('560개')",timeout=60000)
        assert page.evaluate('window.__historyStrokes')>0
        page.locator('#historyMapBtn').click();assert page.locator('[data-feature]').count()==560
        label=rows[0]['properties']['label']
        page.get_by_role('textbox',name='역사 경계 이름 찾기').fill(label)
        matching=[f for f in rows if label in f['properties']['label']]
        assert page.locator('[data-feature]').count()==len(matching)<560
        page.locator('[data-feature]').first.click()
        assert '원 호칭' in page.locator('#evi').inner_text()
        page.locator('[data-history-chunk]').click()
        page.wait_for_function("document.querySelector('#evi').textContent.includes('up_key')")
        sample=matching[0];chunk=page.request.get(args.base+'/api/chunk?id='+sample['properties']['citesChunk']).json()['chunk']
        assert json.loads(chunk['text'])==sample['properties']['sourceRecord']
        page.screenshot(path=str(args.out/'district-record.png'))
        bad=next(f for f in rows if not f['properties']['originalGeometryValid'])
        page.locator('#historyMapBtn').click()
        page.locator('[data-feature="'+bad['id']+'"]').click()
        assert '원 도형에 자기 교차' in page.locator('#evi').inner_text()
        page.locator('#b3d').click()
        page.wait_for_function('window.__sigong?.world.historyTargets.length===560',timeout=120000)
        ids=page.evaluate('window.__sigong.world.historyTargets.map(x=>x.userData.feature.id)')
        assert set(ids)=={f['id'] for f in rows}
        page.locator('#historyLevel').select_option('1')
        page.wait_for_function('window.__sigong.world.historyTargets.length===26')
        assert not set(ids)&set(page.evaluate('window.__sigong.world.historyTargets.map(x=>x.userData.feature.id)'))
        page.locator('#historyLevel').select_option('2');page.wait_for_function('window.__sigong.world.historyTargets.length===560')
        page.locator('#humanOnly').check();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        assert page.evaluate('window.__sigong.engine.pickTargets.length')==0
        page.locator('#humanOnly').uncheck();page.wait_for_function('window.__sigong.world.historyTargets.length===560')
        page.locator('#noSources').click();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#lensSelect').select_option('hgis-1910-1945');page.wait_for_function('window.__sigong.world.historyTargets.length===560')
        page.locator('#b2d').click();page.locator('#historyMapBtn').click()
        page.screenshot(path=str(args.out/'district-map.png'))
        page.set_viewport_size({'width':480,'height':900})
        if page.locator('#sourcesBtn').get_attribute('aria-expanded')!='true':page.locator('#sourcesBtn').click()
        page.locator('#historyLevel').select_option('1');page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('26개')")
        page.locator('#historyLevel').select_option('2');page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('560개')")
        page.locator('#historyMapBtn').click();assert page.locator('#evi').is_visible()
        page.get_by_role('textbox',name='역사 경계 이름 찾기').fill(label);page.locator('[data-feature]').first.click()
        assert label in page.locator('#evi h3').inner_text()
        page.screenshot(path=str(args.out/'district-480.png'));assert not errors,errors
        browser.close()
    report={'base':args.base,'totalDistrictRecords':726,'districtRecordsIn1914':560,'originalInvalidGeometryIds':[f['id'] for f in invalid],
        'checks':{'levels':True,'filters':True,'year_overlap':True,'map_strokes':True,'name_search':True,'original_record':True,
            'three_geometry_ids':True,'no_stale_picks':True,'mobile_level_control':True},'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(report['checks']))


if __name__=='__main__':main()
