#!/usr/bin/env python3
"""Verify the source lens and both ends of the identity claim in the real viewer (#35)."""
import argparse
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright


async def run(url, out):
    out.mkdir(parents=True,exist_ok=True)
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
        page=await browser.new_page(viewport={'width':1440,'height':1000})
        page.on('pageerror',lambda error:errors.append(str(error)))
        await page.goto(url,wait_until='load',timeout=90000)
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.some(s=>s.id==="src-encykorea-dangun")',timeout=90000)
        await page.locator('#q').fill('단군')
        for entity,other in [('person-dangun-samgukyusa','단군(檀君)'),('person-dangun','단군(삼국유사)')]:
            await page.locator(f'#qList button[data-id="{entity}"]').click()
            await page.wait_for_function('document.querySelector("#evi .claim .pred")?.textContent === "같은 대상으로 보는 주장"')
            text=await page.locator('#evi .claim').inner_text()
            assert other in text and 'AI 추출' in text,text
            await page.screenshot(path=str(out/f'{entity}.png'))
        await page.locator('.tl-group[data-group="연구·해설"] .tl-group-open').click()
        await page.locator('.tl-track[data-id="src-encykorea-dangun"] .tl-label').click()
        await page.wait_for_function('!document.querySelector("#evi .claim")')
        await page.screenshot(path=str(out/'source-off.png'))
        assert not errors,errors
        await browser.close()
    result={'bothEndsReadable':True,'sourceOffHidesClaim':True,'autoMerge':False,'errors':errors}
    (out/'report.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result))


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url',default='http://127.0.0.1:8870/?q=low')
    parser.add_argument('--out',type=Path,required=True)
    args=parser.parse_args()
    asyncio.run(run(args.url,args.out))
