"""Exercise the person/period/polity query against actual RDF and the browser."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen
from urllib.error import HTTPError
from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    sources=','.join('src-encykorea-'+p for p in ('jijeung','beopheung','jinheung'))
    def read(path='/api/people',**params):
        with urlopen(args.base+path+'?'+urlencode(params),timeout=60) as r:return json.load(r)
    result=read(sources=sources)
    expected={'person-encykorea-'+p for p in ('jijeung','beopheung','jinheung')}
    assert {p['id'] for p in result['people']}==expected,result
    assert not result['hasMore'] and not result['evidenceTruncated']
    for person in result['people']:
        assert person['evidence']
        for e in person['evidence']:
            assert e['activity']['earliest']<=600 and e['activity']['latest']>=501
            for field in ('membership','activity'):
                chunk=read('/api/chunk',id=e[field]['citesChunk'],sources=sources)['chunk']
                assert e[field]['quote'] in chunk['text'] and chunk['sourceId']==e['fromSource']
    pages=[read(sources=sources,limit=1,offset=i) for i in range(3)]
    assert {p['people'][0]['id'] for p in pages}==expected
    assert [p['hasMore'] for p in pages]==[True,True,False]
    for options in ({'sources':''},{'sources':sources,'origin':'human'},{'sources':sources,'polity':'polity-baekje'},
                    {'sources':sources,'from':601,'to':700}):
        assert read(**options)['people']==[],options
    assert len(read(sources='src-encykorea-jinheung')['people'])==1
    try:read(**{'from':0})
    except HTTPError as e:assert e.code==400
    else:raise AssertionError('year zero accepted')
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS);page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000);page.locator('#enter').click()
        page.locator('#lensSelect').select_option('silla-sixth-century')
        page.locator('#peopleSearch summary').click();page.locator('#peopleSearch [type=submit]').click()
        page.wait_for_function("document.querySelectorAll('[data-person]').length===3")
        page.locator('[data-person=person-encykorea-jinheung]').click()
        page.locator('#evi .claim').first.wait_for()
        assert '540~576' in page.locator('#evi').inner_text()
        page.locator('#evi [data-claim-chunk]').first.click()
        page.wait_for_function("document.querySelector('#evi h3')?.textContent==='인용한 원문'")
        assert '진흥왕은' in page.locator('#evi').inner_text()
        page.locator('#humanOnly').check();page.wait_for_function("document.querySelectorAll('[data-person]').length===0")
        page.locator('#humanOnly').uncheck();page.wait_for_function("document.querySelectorAll('[data-person]').length===3")
        page.set_viewport_size({'width':480,'height':900})
        if page.locator('#evidenceBtn').get_attribute('aria-expanded')=='true':page.locator('#evidenceBtn').click()
        page.locator('#sourcesBtn').click();page.locator('#peopleSearch').scroll_into_view_if_needed()
        page.screenshot(path=str(args.out/'people-480.png'))
        page.locator('[data-person=person-encykorea-jijeung]').click()
        page.wait_for_function("document.querySelector('#evi')?.textContent.includes('500년~514년')")
        assert page.locator('#evidenceBtn').get_attribute('aria-expanded')=='true'
        assert not errors,errors;browser.close()
    report={'base':args.base,'result':result,'pageErrors':errors,'checks':{'three_cited_people':True,'pagination':True,
        'empty_period_and_polity':True,'source_and_author_filters':True,'raw_citations':True,'browser_1440_and_480':True},
        'limits':['수록된 세 왕의 재위 근거를 검증했다. 당시 모든 인물을 수집했다는 뜻이 아니다.']}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report['checks']))


if __name__=='__main__':main()
