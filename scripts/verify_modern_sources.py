"""Read modern source cards and originals, keeping author, edition and dates separate."""
import argparse,json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen
from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    def read(path,**params):
        with urlopen(args.base+path+'?'+urlencode(params),timeout=60) as r:return json.load(r)
    ids=['src-treaty-annexation-1910','src-3-1-declaration-1919','src-imsi-heonjang-1919',
        'src-rok-constitution-1948','src-armistice-1953','src-rok-constitution-1987',
        'src-inter-korean-basic-agreement-1991','src-panmunjom-declaration-2018','src-pa-speech-records',
        'src-dprk-socialist-constitution','src-dprk-upr3-national-report-2019',
        'src-archives-koreaofrecord-constitution','src-encykorea-everready']
    cards={sid:read('/api/source',id=sid) for sid in ids};raw={}
    for sid,card in cards.items():
        assert card['found'] and card['frontmatter']['chunkCount']>0
        raw[sid]=read('/api/chunks',sources=sid,limit=100)['chunks']
        assert len(raw[sid])==card['frontmatter']['chunkCount']
        assert all(r['sourceId']==sid and r['text'] for r in raw[sid])
    constitution=cards['src-dprk-socialist-constitution']['frontmatter']
    assert all(constitution[key] is None for key in ('composedYear','coversFrom','coversTo'))
    assert '미확정' in constitution['edition']
    upr=cards['src-dprk-upr3-national-report-2019'];meta=upr['frontmatter']
    assert meta['compiler']=='조선민주주의인민공화국' and meta['distributor']=='유엔' and meta['originalLanguage']=='en'
    assert '동의하거나' in upr['body'] and '2019-02-20' in upr['body']
    pa=raw['src-pa-speech-records']
    assert len(pa)==7 and sum(r['chunkType']=='editorial-metadata' for r in pa)==3
    assert any('8월 16일' in r['text'] and '1948' not in r['text'] for r in pa if r['chunkType']=='excerpt')
    assert any('1948.09.04' in r['text'] for r in pa if r['chunkType']=='editorial-metadata')
    assert any('\uff0c' in r['text'] for r in raw['src-encykorea-everready'])
    checked=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS);page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000);page.locator('#enter').click()
        for sid in ('src-rok-constitution-1948','src-pa-speech-records','src-dprk-socialist-constitution',
                    'src-dprk-upr3-national-report-2019','src-archives-koreaofrecord-constitution','src-encykorea-everready'):
            button=page.locator('#srcList .card-btn[data-id="'+sid+'"]')
            button.evaluate("el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}")
            button.click();label=cards[sid]['frontmatter']['label']
            page.wait_for_function('(label)=>document.querySelector("#evi h3")?.textContent===label',arg=label)
            assert page.locator('#evi table.facts').is_visible();checked.append(sid)
        sid='src-dprk-upr3-national-report-2019';page.locator('#srcList .card-btn[data-id="'+sid+'"]').click()
        page.wait_for_function("document.querySelector('#evi').textContent.includes('유엔 배포 2019-02-20')")
        page.screenshot(path=str(args.out/'modern-source.png'))
        page.set_viewport_size({'width':480,'height':900})
        if page.locator('#evidenceBtn').get_attribute('aria-expanded')!='true':page.locator('#evidenceBtn').click()
        assert page.locator('#evi').is_visible()
        assert page.locator('#evidenceBtn').get_attribute('aria-expanded')=='true'
        page.screenshot(path=str(args.out/'modern-source-480.png'));assert not errors,errors;browser.close()
    report={'base':args.base,'sourceCards':len(cards),'rawChunks':sum(map(len,raw.values())),'browserCards':checked,
        'checks':{'raw_source_match':True,'dprk_edition_unknown':True,'dprk_author_vs_un_distributor':True,
            'speech_text_vs_editorial_dates':True,'original_unicode':True,'browser_cards_and_480':True},'pageErrors':errors,
        'limits':['짧은 발췌·메타데이터의 수록·표시 검사다. 원 문서 전문 수집·역사적 사실 판정과 구별한다.']}
    (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report['checks']))


if __name__=='__main__':main()
