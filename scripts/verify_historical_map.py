"""Verify the published HGIS geometry in the actual API, 2D and 3D viewer."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS);page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.add_init_script("window.__historyStrokes=0;const stroke=CanvasRenderingContext2D.prototype.stroke;CanvasRenderingContext2D.prototype.stroke=function(...args){if(this.canvas.id==='map'&&this.strokeStyle.toLowerCase()==='#d8b463')window.__historyStrokes++;return stroke.apply(this,args);};")
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000);page.locator('#enter').click()
        all_rows=page.request.get(args.base+'/api/history-map').json()['features'];assert len(all_rows)==32
        for suffix in ('?sources=','?origin=human','?year=500','?year=1946'):
            assert page.request.get(args.base+'/api/history-map'+suffix).json()['features']==[],suffix
        page.locator('#lensSelect').select_option('hgis-1910-1945')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.match(/역사 경계 [1-9]/)")
        assert page.locator('#yearV').inner_text()=='1914'
        rows=page.request.get(args.base+'/api/history-map?year=1914&sources=src-hgis-admin-1910-1945').json()['features']
        assert all(f['properties']['validFrom']<=1914<=f['properties']['validTo'] for f in rows)
        assert page.evaluate('window.__historyStrokes')>0
        assert page.locator('#map').bounding_box()['y']+page.locator('#map').bounding_box()['height']<=page.locator('.timebar').bounding_box()['y']+1
        page.locator('#historyMapBtn').click();assert page.locator('[data-feature]').count()==len(rows)
        page.locator('[data-feature]').first.click();assert '기관 표기' in page.locator('#evi').inner_text()
        page.locator('[data-history-chunk]').click();page.wait_for_function("document.querySelector('#evi').textContent.includes('geom_ref')")
        assert '추정' in page.locator('#evi').inner_text() or '신뢰' in page.locator('#evi').inner_text() or 'trust' in page.locator('#evi').inner_text()
        page.locator('#b3d').click();page.wait_for_function('window.__sigong?.world.historyTargets.length>0',timeout=120000)
        lines=page.evaluate("window.__sigong.world.historyTargets.map(line=>({id:line.userData.feature.id,opacity:line.material.opacity,vertices:line.geometry.attributes.position.count}))")
        assert {v['id'] for v in lines}=={f['id'] for f in rows}
        assert all(v['opacity']==1 and v['vertices']>0 for v in lines)
        page.locator('#humanOnly').check();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        assert page.evaluate('window.__sigong.engine.pickTargets.length')==0
        page.locator('#humanOnly').uncheck();page.wait_for_function('window.__sigong.world.historyTargets.length>0')
        page.locator('#noSources').click();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#lensSelect').select_option('hgis-1910-1945');page.wait_for_function('window.__sigong.world.historyTargets.length>0')
        page.locator('#b2d').click();page.locator('#historyMapBtn').click();page.screenshot(path=str(args.out/'historical-boundaries.png'))
        page.set_viewport_size({'width':480,'height':900});page.locator('#historyMapBtn').evaluate('(el)=>el.click()')
        assert page.locator('#evi').is_visible();page.locator('[data-feature]').first.click()
        page.screenshot(path=str(args.out/'historical-boundary-480.png'));assert not errors,errors;browser.close()
    report={'base':args.base,'totalRecords':32,'recordsIn1914':len(rows),'threeLines':lines,
            'checks':{'year_range':True,'source_and_ai_filters':True,'actual_map_strokes':True,'raw_record':True,'three_geometry':True,'three_no_stale_picks':True,'narrow_evidence':True},'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(report['checks']))


if __name__=='__main__':main()
