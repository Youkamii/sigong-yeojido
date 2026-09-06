"""Actual subscription response -> citation -> original, and missing evidence (#47)."""
import argparse
import json
from pathlib import Path
import sys
import time

from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    report={'base':args.base,'checks':{},'responses':[]}
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS)
        page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000)
        page.locator('#enter').click()
        page.locator('#bchat').click()
        page.locator('#chatQuestion').fill('광개토왕의 이름과 즉위에 대해 비문은 어떻게 서술하나?')
        started=time.monotonic()
        with page.expect_response(lambda r:r.url.endswith('/api/chat'),timeout=360000) as response:
            page.locator('#chat button[type=submit]').click()
        answer=response.value.json()
        assert response.value.status==200,answer
        assert answer['status']=='answered' and answer['sentences'],answer
        assert 'claude-opus-5' in answer['models'],answer['models']
        report['responses'].append(answer)
        report['answerSeconds']=round(time.monotonic()-started,2)
        first=answer['sentences'][0]['citations'][0]
        page.locator('.chat-citation').first.click()
        assert first['quote'] in page.locator('#evi .quote').inner_text()
        page.locator('[data-evidence-action=chunk]').click()
        page.wait_for_function("document.querySelector('#evi h3')?.textContent==='인용한 원문'")
        assert first['quote'] in page.locator('#evi').inner_text()
        report['checks']['answer_citation_original']=True
        page.screenshot(path=str(args.out/'chat-evidence.png'))
        page.locator('#chatQuestion').fill('광개토왕이 사용한 스마트폰의 제조사와 기종은 무엇인가?')
        with page.expect_response(lambda r:r.url.endswith('/api/chat'),timeout=360000) as response:
            page.locator('#chat button[type=submit]').click()
        missing=response.value.json()
        assert response.value.status==200 and missing['status']=='no_evidence' and not missing['sentences'],missing
        assert missing['models'] and missing['unanswered'],missing
        report['responses'].append(missing)
        report['checks']['model_reports_missing_evidence']=True
        page.locator('#humanOnly').check()
        assert page.locator('.chat-sentence').count()==0
        page.locator('#chatQuestion').fill('광개토왕의 이름은?')
        with page.expect_response(lambda r:r.url.endswith('/api/chat'),timeout=45000) as response:
            page.locator('#chat button[type=submit]').click()
        human=response.value.json()
        assert human['status']=='no_evidence' and human['evidenceCount']==0 and human['models']==[],human
        report['checks']['human_filter_and_no_model_without_evidence']=True
        empty=page.request.post(args.base+'/api/chat',data={'question':'광개토왕의 이름은?','sources':[]}).json()
        assert empty['status']=='no_evidence' and empty['evidenceCount']==0,empty
        report['checks']['empty_sources']=True
        page.set_viewport_size({'width':480,'height':900})
        page.locator('#bchat').click()
        assert page.locator('#chatQuestion').is_visible()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        report['checks']['narrow_screen']=True
        report['pageErrors']=errors
        assert not errors,errors
        browser.close()
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'checks':report['checks'],'answerSeconds':report['answerSeconds']},ensure_ascii=False))


if __name__=='__main__':
    main()
