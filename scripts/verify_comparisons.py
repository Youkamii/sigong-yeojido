"""Check real Baekje founding and Sabi transfer passages across two sources."""
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
    def read(case,**params):
        with urlopen(args.base+'/api/compare?'+urlencode({'id':case,**params}),timeout=60) as response:return json.load(response)
    sources='src-samguksagi,src-samgukyusa'
    founding=read('baekje-founding',sources=sources)
    assert len(founding['rows'])==3 and founding['sourceCount']==2 and len(founding['links'])==2,founding
    assert {r['object']['verbatim'] for r in founding['rows']}=={'前漢 成帝鴻嘉三年','漢成帝鴻佳三年','鴻嘉四年甲辰'}
    sabi=read('sabi-transfer',sources=sources)
    assert len(sabi['rows'])==2 and len(sabi['links'])==1,sabi
    assert {r['object']['verbatim'] for r in sabi['rows']}=={'十六年, 春','百濟聖王二十六年戊午春'}
    assert read('baekje-founding',sources='')['rows']==[]
    assert read('baekje-founding',sources=sources,origin='human')['rows']==[]
    death_sources='src-samguksagi,src-web-seisaku-nihonshoki-10,src-web-encykorea-asinwang,src-web-jawikipedia-asinwang,src-jawp-285nen'
    death=read('asin-ahwa-death',sources=death_sources)
    assert len(death['rows'])==2 and len(death['links'])==2 and death['differentProjectedYears'],death
    assert [r['projections'][0]['earliest'] for r in death['rows']]==[405,285]
    assert {r['object']['verbatim'] for r in death['rows']}=={'秋九月','十六年'}
    assert read('asin-ahwa-death',sources=death_sources,origin='human')['rows']==[]
    raw=read('asin-ahwa-death',sources='src-samguksagi,src-web-seisaku-nihonshoki-10')
    assert all(not r['projections'] for r in raw['rows']) and not raw['links']
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS);page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000);page.locator('#enter').click()
        page.locator('#bcompare').click();page.locator('#compare select option').first.wait_for(state='attached')
        page.locator('[data-compare-sources]').click();page.wait_for_function("document.querySelectorAll('.comparison-card').length===3")
        assert '鴻嘉四年甲辰' in page.locator('#compare').inner_text()
        card=page.locator('.comparison-card').first;first=founding['rows'][0]
        card.locator('[data-action=claim]').click();assert first['quote'] in page.locator('#evi .quote').inner_text()
        page.locator('#evi [data-evidence-action=chunk]').click();page.wait_for_function("document.querySelector('#evi h3')?.textContent==='인용한 원문'")
        assert first['quote'] in page.locator('#evi').inner_text()
        page.locator('#compare select').select_option('sabi-transfer')
        page.wait_for_function("document.querySelectorAll('.comparison-card').length===2")
        assert '二十六年戊午' in page.locator('#compare').inner_text()
        page.locator('.compare-link button').click();assert '按三國史記' in page.locator('#evi .quote').inner_text()
        page.locator('[data-source="src-samgukyusa"]').evaluate('(el)=>el.click()')
        page.wait_for_function("document.querySelectorAll('.comparison-card').length===1")
        assert page.locator('.compare-link').count()==0
        page.locator('#humanOnly').check();page.wait_for_function("document.querySelectorAll('.comparison-card').length===0")
        page.locator('#humanOnly').uncheck()
        page.locator('#compare select').select_option('asin-ahwa-death');page.locator('[data-compare-sources]').click()
        page.wait_for_function("document.querySelectorAll('.compare-year').length===2 && document.querySelector('.compare-description').textContent.includes('120년')")
        assert '현대 해설' in page.locator('#compare').inner_text() and '전통 기년' in page.locator('#compare').inner_text()
        page.locator('.comparison-card[data-claim=claim-ahwa-death-ns-date] [data-action=chunk]').click()
        page.wait_for_function("document.querySelector('#evi h3')?.textContent==='인용한 원문'")
        assert '是歲、百濟阿花王薨。' in page.locator('#evi').inner_text()
        page.screenshot(path=str(args.out/'nihonshoki-comparison.png'))
        page.set_viewport_size({'width':480,'height':900})
        if page.locator('#evidenceBtn').get_attribute('aria-expanded')=='true':page.locator('#evidenceBtn').click()
        assert page.evaluate("document.querySelector('#compare').getBoundingClientRect().bottom<=document.querySelector('.timebar').getBoundingClientRect().top+1")
        assert page.evaluate("document.querySelector('.compare-rows').scrollWidth<=document.querySelector('.compare-rows').clientWidth+1")
        page.screenshot(path=str(args.out/'comparison-480.png'))
        assert not errors,errors;browser.close()
    report={'base':args.base,'cases':[founding,sabi,death],'pageErrors':errors,'checks':{'real_cross_source_quotes':True,
            'explicit_link_evidence':True,'distinct_dates_preserved':True,'quote_original_navigation':True,
            'source_and_ai_filters':True,'narrow_layout':True,'samguksagi_nihonshoki':True,'chronology_conventions_separate':True},
            'limits':['일본서기 전사본의 저본 미확정. 285는 위키백과 전통 기년표의 대응값이며 현대 추정 실연대가 아니다.']}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report['checks']))


if __name__=='__main__':main()
