#!/usr/bin/env python3
"""실제 주장·카드 응답에 통제된 지연을 넣어 패널 응답 순서를 검사한다 (#43)."""
import argparse
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright


async def run(url, out):
    out.mkdir(parents=True, exist_ok=True)
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
        page=await browser.new_page(viewport={'width':1440,'height':1000})
        page.on('pageerror',lambda error:errors.append(str(error)))
        await page.goto(url,wait_until='networkidle')
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.length > 0')
        await page.click('#allSources')
        release_mentions=asyncio.Event()

        async def delayed_mentions(route):
            await release_mentions.wait()
            await route.fulfill(status=200,content_type='application/json',body=json.dumps({'chunks':[],'total':0,'bySource':{}}))

        await page.route('**/api/mentions?**',delayed_mentions)
        await page.locator('#q').fill('광개토')
        await page.locator('#qList button[data-id="person-gwanggaeto"]').click()
        await page.wait_for_selector('#evi .claim',timeout=5000)
        assert '찾는 중' in await page.locator('#evi .evidence-results').inner_text()
        await page.screenshot(path=str(out/'claims-before-mentions.png'))

        release_card=asyncio.Event()
        card_held=asyncio.Event()
        card_finished=asyncio.Event()

        async def delayed_card(route):
            response=await route.fetch()
            card_held.set()
            await release_card.wait()
            await route.fulfill(response=response)
            card_finished.set()

        await page.route('**/api/source?id=src-samguksagi',delayed_card)
        await page.locator('.card-btn[data-id="src-samguksagi"]').evaluate(
            "el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}")
        await page.locator('.card-btn[data-id="src-samguksagi"]').click()
        await asyncio.wait_for(card_held.wait(),10)
        await page.locator('.card-btn[data-id="src-samgukyusa"]').evaluate(
            "el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}")
        await page.locator('.card-btn[data-id="src-samgukyusa"]').click()
        await page.wait_for_function('document.querySelector("#evi h3")?.textContent === "삼국유사"')
        release_card.set()
        release_mentions.set()
        await asyncio.wait_for(card_finished.wait(),10)
        await page.wait_for_load_state('networkidle')
        assert await page.locator('#evi h3').first.inner_text()=='삼국유사'
        await page.screenshot(path=str(out/'latest-source-remains.png'))
        assert not errors, errors
        await browser.close()
    result={'claimsBeforeSearch':True,'latestSourceRemains':True,
            'controlledMentionsResponse':True,'realClaimsAndSourceCards':True,'errors':errors}
    (out/'report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result))


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url',default='http://127.0.0.1:8870/?q=low')
    parser.add_argument('--out',type=Path,required=True)
    args=parser.parse_args()
    asyncio.run(run(args.url,args.out))
