"""Test open and disconnected lines in the actual viewer using browser-only synthetic records."""
import argparse
import json
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--base',default='http://127.0.0.1:8873')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    source={'id':'src-synthetic-routes','label':'인공 역로 시험 자료','chunkCount':1,'composedYear':414,
            'coversFrom':414,'coversTo':415,'sourceGroup':'시험 자료','license':'synthetic fixture'}
    features=[]
    for key,geometry in [('open',{'type':'LineString','coordinates':[[124,33.2],[124.5,33.2],[124.5,33.7]]}),
                         ('disconnected',{'type':'MultiLineString','coordinates':[[[128,38],[128.5,38]],[[129,39],[129.5,39]]]})]:
        features.append({'type':'Feature','id':'synthetic-route-'+key,'geometry':geometry,'properties':{
            'kind':'historical-route','label':'인공 시험선 '+key,'fromSource':source['id'],'origin':'ai',
            'validFrom':414,'validTo':415,'begin':'414 (시험값)','end':'415 (시험값)',
            'citesChunk':'chunk-synthetic-routes','basis':'실제 역사 자료가 아닌 시험용 선이다.',
            'periodNote':'시험용 기간이며 실제 옛길의 존속 기간이 아니다.'}})
    errors=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS)
        page=browser.new_page(viewport={'width':1440,'height':1000})
        page.on('pageerror',lambda error:errors.append(str(error)))
        def sources(route):
            response=route.fetch(timeout=180000);data=response.json();data['sources'].append(source)
            route.fulfill(response=response,json=data)
        def history(route):
            params=parse_qs(urlparse(route.request.url).query,keep_blank_values=True)
            if params.get('level')!=['5']:return route.continue_()
            visible=(source['id'] in params.get('sources',[''])[0].split(',') and
                     params.get('origin')!=['human'] and 414<=int(params['year'][0])<=415)
            route.fulfill(json={'type':'FeatureCollection','features':features if visible else [],'level':5})
        def chunk(route):
            if parse_qs(urlparse(route.request.url).query).get('id')!=['chunk-synthetic-routes']:return route.continue_()
            route.fulfill(json={'found':True,'chunk':{'id':'chunk-synthetic-routes','sourceId':source['id'],
                'text':'synthetic-route-record: 실제 역사 원문이 아닌 시험용 원 레코드',
                'locator':'시험 레코드','lang':'ko','permalink':None}})
        page.route('**/api/sources',sources);page.route('**/api/history-map?*',history);page.route('**/api/chunk?*',chunk)
        page.add_init_script('''(()=>{
          for(const [method,op] of [['moveTo','M'],['lineTo','L']]){
            const original=Path2D.prototype[method];
            Path2D.prototype[method]=function(x,y){(this.points??=[]).push({op,x,y});return original.call(this,x,y);};
          }
          const stroke=CanvasRenderingContext2D.prototype.stroke;
          CanvasRenderingContext2D.prototype.stroke=function(path){
            if(this.canvas.id==='map'&&this.strokeStyle.toLowerCase()==='#d8b463'&&path?.points){
              window.routePaths??=[];window.routePaths.push(path);window.routePaths=window.routePaths.slice(-8);
            }
            return stroke.apply(this,arguments);
          };
        })();''')
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000)
        page.locator('#enter').click();page.locator('#allSources').click();page.locator('#historyLevel').select_option('5')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('2개')")
        measured=page.evaluate('''()=>{
          const paths=window.routePaths.slice(-2),ctx=document.querySelector('#map').getContext('2d');
          const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
          ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.lineWidth=9;
          const closing=midpoint(paths[0].points[0],paths[0].points[2]);
          const gap=midpoint(paths[1].points[1],paths[1].points[2]);
          const result={commands:paths.map(p=>p.points.map(v=>v.op)),
            closingHit:ctx.isPointInStroke(paths[0],closing.x,closing.y),
            gapHit:ctx.isPointInStroke(paths[1],gap.x,gap.y),click:midpoint(paths[0].points[0],paths[0].points[1])};
          ctx.restore();return result;
        }''')
        assert measured['commands']==[['M','L','L'],['M','L','M','L']]
        assert not measured['closingHit'] and not measured['gapHit']
        bounds=page.locator('#map').bounding_box();point=measured['click']
        page.mouse.click(bounds['x']+point['x'],bounds['y']+point['y'])
        heading=page.locator('#evi h3').inner_text()
        if '인공 시험선 open' not in heading:
            (args.out/'pick-failure.json').write_text(json.dumps({'heading':heading,'measured':measured},ensure_ascii=False,indent=2),encoding='utf-8')
        assert '인공 시험선 open' in heading,{'heading':heading,'measured':measured}
        assert '실제 역사 자료가 아닌' in page.locator('#evi').inner_text()
        page.locator('[data-history-chunk]').click()
        page.wait_for_function("document.querySelector('#evi').textContent.includes('synthetic-route-record')")
        page.locator('#b3d').click()
        page.wait_for_function('window.__sigong?.world.historyTargets.length===2',timeout=180000)
        geometry=page.evaluate('window.__sigong.world.historyTargets.map(o=>({id:o.userData.feature.id,vertices:o.geometry.attributes.position.count}))')
        assert all(row['vertices']==4 for row in geometry),geometry
        page.locator('#humanOnly').check();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#humanOnly').uncheck();page.wait_for_function('window.__sigong.world.historyTargets.length===2')
        page.locator('#noSources').click();page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#allSources').click();page.wait_for_function('window.__sigong.world.historyTargets.length===2')
        cursor=page.locator('#tl .tl-cursor');cursor.focus();cursor.press('ArrowRight');cursor.press('ArrowRight')
        page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        cursor.press('ArrowLeft');page.wait_for_function('window.__sigong.world.historyTargets.length===2')
        page.set_viewport_size({'width':480,'height':900})
        if page.locator('#sourcesBtn').get_attribute('aria-expanded')!='true':page.locator('#sourcesBtn').click()
        page.locator('#historyMapBtn').click();page.locator('[data-feature="synthetic-route-open"]').click()
        assert page.locator('#evi').is_visible() and '인공 시험선' in page.locator('#evi h3').inner_text()
        page.screenshot(path=str(args.out/'synthetic-mobile.png'))
        assert not errors,errors;browser.close()
    report={'base':args.base,'mode':'synthetic browser responses; no production records written',
            'historicalDataAcceptance':'NOT_RUN','measuredCanvas':measured,'threeGeometry':geometry,
            'checks':{'open_line_stays_open':True,'gap_stays_empty':True,'real_canvas_pick':True,
                      'source_record_button':True,'three_segments':True,'source_year_origin_filters':True,'mobile':True},
            'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':main()
