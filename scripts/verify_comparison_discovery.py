"""Find differing event years from RDF, independently of the curated comparison list."""
import argparse,json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen
from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    def read(**params):
        with urlopen(args.base+'/api/comparison-differences?'+urlencode(params),timeout=90) as r:return json.load(r)
    result=read();assert len(result['comparisons'])==2 and not result['hasMore'],result
    pages=[read(limit=1,offset=i) for i in range(2)]
    assert [p['hasMore'] for p in pages]==[True,False]
    assert len({p['comparisons'][0]['case']['id'] for p in pages})==2
    focused=read(sourceA='src-samguksagi',sourceB='src-web-seisaku-nihonshoki-10')
    assert len(focused['comparisons'])==1
    assert {p['earliest'] for r in focused['comparisons'][0]['rows'] for p in r['projections']}=={285,405}
    for params in ({'sources':''},{'origin':'human'},{'sources':'src-samguksagi,src-web-seisaku-nihonshoki-10'},
                   {'sourceA':'src-samguksagi','sourceB':'src-goryeosa'}):
        assert read(**params)['comparisons']==[],params
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS);page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000);page.locator('#enter').click()
        page.locator('#allSources').click();page.locator('#bcompare').click();page.locator('[data-find-differences]').click()
        page.wait_for_function("document.querySelectorAll('[data-difference]').length===2")
        assert '서기 285년' in page.locator('#compare').inner_text()
        page.locator('[data-difference]').nth(1).click();assert '기원전 18년' in page.locator('#compare').inner_text()
        page.screenshot(path=str(args.out/'comparison-discovery.png'))
        page.locator('#humanOnly').check()
        page.wait_for_function("document.querySelector('[data-discovery-status]').textContent.includes('사건 연결이 없다')")
        assert page.locator('[data-difference]').count()==0 and page.locator('.comparison-card').count()==0
        page.locator('#humanOnly').uncheck();page.wait_for_function("document.querySelectorAll('[data-difference]').length===2")
        page.locator('#noSources').click();page.wait_for_function("document.querySelector('[data-discovery-status]').textContent.includes('사건 연결이 없다')")
        assert page.locator('.comparison-card').count()==0
        assert not errors,errors;browser.close()
    report={'base':args.base,'result':result,'pageErrors':errors,'checks':{'rdf_discovery_two_pairs':True,
        'source_pair':True,'all_pages':True,'no_conversion_no_difference':True,'source_and_origin_filters':True,
        'browser_discovery_and_stale_results_removed':True},'limits':['직접 연결된 사건과 숫자로 확인한 연도만 비교한다. 전 사료에 대한 역사 해석의 완전성을 뜻하지 않는다.']}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report['checks']))


if __name__=='__main__':main()
