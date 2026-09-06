"""Exercise source-specific time claims against the running viewer and Fuseki."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    def read(**params):
        with urlopen(args.base+'/api/time?'+urlencode(params),timeout=45) as response:return json.load(response)
    data=read(sources='src-gwanggaeto')
    assert len(data['events'])==10 and sum(len(e['conversions']) for e in data['events'])==10,data
    assert all(e['object']['verbatim'] for e in data['events'])
    assert read(sources='')['events']==[] and read(sources='src-gwanggaeto',origin='human')['events']==[]
    base_sources='src-samguksagi,src-samgukyusa'
    bc=read(sources=base_sources+',src-jawp-hongga-calendar',entity='polity-baekje')
    by_id={e['id']:e for e in bc['events']}
    assert by_id['claim-baekje-founded-hongga3-samguksagi']['conversions'][0]['object']['value']==-18
    assert by_id['claim-baekje-onjo-hongga4-samgukyusa']['conversions'][0]['object']['value']==-17
    assert by_id['claim-baekje-onjo-samgukyusa']['conversions']==[]
    assert all(not e['conversions'] for e in read(sources=base_sources,entity='polity-baekje')['events'])
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS)
        page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000)
        page.locator('#enter').click();page.locator('#timeClaimsBtn').click()
        page.locator('#allSources').click()
        page.locator('.time-projection').first.wait_for()
        first=data['events'][0]['conversions'][0]
        page.locator('.time-projection[data-claim="'+first['id']+'"]').click()
        assert page.locator('#yearV').inner_text()==str(first['object']['value'])
        assert first['quote'] in page.locator('#evi .quote').inner_text()
        page.locator('[data-evidence-action=chunk]').click()
        page.wait_for_function("document.querySelector('#evi h3')?.textContent==='인용한 원문'")
        assert first['quote'] in page.locator('#evi').inner_text()
        page.locator('#humanOnly').check()
        page.wait_for_function("document.querySelector('#timeClaimsBtn').textContent==='연대 주장 0'")
        assert page.locator('.tl-time-claim').count()==0
        page.locator('#humanOnly').uncheck()
        page.wait_for_function("document.querySelectorAll('.tl-time-claim').length>=10")
        page.locator('#bgraph').click()
        assert page.evaluate("document.querySelector('#graph').getBoundingClientRect().bottom<=document.querySelector('.timebar').getBoundingClientRect().top+1")
        page.locator('#bcompare').click();page.locator('#compare select option').first.wait_for(state='attached')
        page.locator('#compare select').select_option('baekje-founding');page.locator('[data-compare-sources]').click()
        page.wait_for_function("document.querySelectorAll('.compare-year').length===2")
        page.locator('.comparison-card[data-claim=claim-baekje-founding-sg-date] .compare-year').click()
        assert page.locator('#yearV').inner_text()=='18' and page.locator('#yearL').inner_text()=='기원전'
        assert '3차 자료' in page.locator('#evi').inner_text()
        page.locator('[data-evidence-action=chunk]').click()
        page.wait_for_function("document.querySelector('#evi h3')?.textContent==='인용한 원문'")
        assert '前18年' in page.locator('#evi').inner_text()
        page.locator('.comparison-card[data-claim=claim-baekje-founding-sy-byeonhan-date] .compare-year').click()
        assert page.locator('#yearV').inner_text()=='17'
        page.screenshot(path=str(args.out/'time-evidence.png'))
        page.locator('[data-source=src-jawp-hongga-calendar]').evaluate('(el)=>el.click()')
        page.wait_for_function("document.querySelectorAll('.comparison-card').length===3 && document.querySelectorAll('.compare-year').length===0")
        assert not errors,errors
        browser.close()
    report={'base':args.base,'events':data,'baekje':bc,'checks':{'rdf_original_and_conversions':True,'empty_sources':True,
            'conversion_moves_timeline_and_opens_citation':True,'human_filter':True,'graph_timeline_layout':True,
            'different_bc_years':True,'unsupported_spelling_withheld':True,'conversion_source_toggle':True},
            'pageErrors':errors,'limits':['홍가 환산 표는 위키백과 3차 자료다. 기관·학술 원서와의 독립 대조는 미완료다.']}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report['checks']))


if __name__=='__main__':main()
