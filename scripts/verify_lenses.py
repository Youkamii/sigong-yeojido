"""Use actual location opinions to check default and comparison rendering."""
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
        page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.add_init_script('''window.__pointPaint=[];
            const arc=CanvasRenderingContext2D.prototype.arc;
            CanvasRenderingContext2D.prototype.arc=function(x,y,r,...rest){
              if(this.canvas.id==='map'&&(r===5||r===6))window.__pointPaint.push({x,y,alpha:this.globalAlpha});
              return arc.call(this,x,y,r,...rest);
            };''')
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000)
        page.locator('#enter').click()
        assert page.locator('#lensSelect').input_value()=='modern-excerpts'
        assert page.locator('.src.on').count()==8
        page.locator('#lensSelect').select_option('nahf-map')
        assert page.locator('.src.on').count()==2
        page.locator('#q').fill('국내성');page.locator('#qList [data-id="place-gungnae"]').click()
        page.locator('.cand').first.wait_for()
        assert '41.1256' in page.locator('#evi').inner_text(),page.locator('#evi').inner_text()
        page.locator('[data-source="src-kci-bok-2020-gungnae"]').evaluate('(el)=>el.click()')
        assert page.locator('[data-source="src-geonames"]').get_attribute('class').endswith(' on')
        page.wait_for_function("document.querySelector('#evi')?.textContent.includes('철령')")
        paints=page.evaluate('window.__pointPaint.slice(-30)')
        assert any(abs(v['alpha']-.32)<.001 for v in paints),paints
        page.locator('#b3d').click()
        page.wait_for_function('window.__sigong?.world?.byPlace.has("place-gungnae")',timeout=120000)
        columns=page.evaluate('''()=>window.__sigong.world.byPlace.get('place-gungnae').filter(o=>o.userData.cand&&o.visible).map(o=>({id:o.userData.cand.id,strength:o.userData.lensStrength,grounded:o.userData.cand.grounded,basis:o.userData.cand.basis}))''')
        direct=next(c for c in columns if c['id']=='loc-claim-gungnae-jian-nahf-site')
        compared=next(c for c in columns if 'tieling-bok' in c['id'])
        assert direct['strength']==1 and compared['strength']==.32,columns
        assert direct['grounded'] and not compared['grounded']
        page.locator('#lensSelect').select_option('bok-2020')
        assert page.locator('.src.on').count()==2
        columns_bok=page.evaluate('''()=>window.__sigong.world.byPlace.get('place-gungnae').filter(o=>o.userData.cand&&o.visible).map(o=>({id:o.userData.cand.id,strength:o.userData.lensStrength}))''')
        assert all('tieling-bok' in c['id'] and c['strength']==1 for c in columns_bok),columns_bok
        assert len(columns_bok)==1
        page.locator('#noSources').click()
        assert page.evaluate('window.__sigong.engine.pickTargets.length')==0
        page.locator('#lensSelect').select_option('lee-2017')
        assert page.locator('#outside3d').is_visible()
        page.locator('#outside3d summary').click()
        assert '기준' in page.locator('#outside3d').inner_text()
        page.locator('#b2d').click()
        page.screenshot(path=str(args.out/'lenses.png'))
        assert not errors,errors
        browser.close()
    report={'base':args.base,'defaultSourceCount':8,'directAndComparedColumns':columns,'bokColumns':columns_bok,
            'checks':{'default_modern_sources':True,'citation_matches_selected_lens':True,'required_coordinate_source':True,
                      'map_alpha':True,'three_alpha':True,'all_off_no_picks':True,'direction_reference_outside_diorama':True},
            'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report['checks']))


if __name__=='__main__':main()
