#!/usr/bin/env python3
"""Record narrow-screen evidence visibility and source selection persistence (#45)."""
import argparse
import asyncio
import json
from pathlib import Path
import sys

from playwright.async_api import async_playwright


async def run(args):
    sys.path.insert(0,str(args.root/'scripts'))
    from verify_viewer import LAUNCH_ARGS
    args.out.mkdir(parents=True,exist_ok=True)
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=LAUNCH_ARGS)
        page=await browser.new_page(viewport={'width':1440,'height':1000})
        page.on('pageerror',lambda error:errors.append(str(error)))
        await page.goto(args.url,wait_until='networkidle')
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.length > 0')
        await page.click('#yearBtn')
        await page.wait_for_selector('#evi h3')
        sizes=[]
        for width in [1440,1000,480]:
            await page.set_viewport_size({'width':width,'height':1000})
            await page.wait_for_timeout(150)
            sizes.append(await page.evaluate('''() => ({width:innerWidth,
              evidenceDisplay:getComputedStyle(document.querySelector('#evi')).display,
              evidenceTextLength:document.querySelector('#evi').textContent.length,
              railDisplay:getComputedStyle(document.querySelector('.rail')).display,
              timelineWidth:document.querySelector('.tl-host').getBoundingClientRect().width})'''))
        await page.screenshot(path=str(args.out/'480-evidence-hidden.png'))
        await page.set_viewport_size({'width':1440,'height':1000})
        await page.locator('.tl-track[data-id="src-goryeosa"] .tl-label').click()
        before=await page.evaluate('({count:window.__timeline.on.size,goryeosa:window.__timeline.on.has("src-goryeosa")})')
        await page.reload(wait_until='networkidle')
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.length > 0')
        after=await page.evaluate('({count:window.__timeline.on.size,goryeosa:window.__timeline.on.has("src-goryeosa")})')
        await page.set_viewport_size({'width':480,'height':1000})
        await page.goto(args.url.split('?')[0].rstrip('/')+'/timeline-demo.html',wait_until='networkidle')
        demo=await page.evaluate('''() => ({width:innerWidth, svg:document.querySelectorAll('svg').length,
          tracks:document.querySelectorAll('.tl-track').length, documentWidth:document.documentElement.scrollWidth})''')
        await page.screenshot(path=str(args.out/'480-timeline-demo.png'))
        await browser.close()
    result={'responsiveEvidence':sizes,'sourceSelectionReload':{'before':before,'after':after,'action':'Clicked the real Goryeosa source checkbox, then reloaded.'},'timelineDemo480':demo,'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument('--url',default='http://127.0.0.1:8870/?q=low')
    parser.add_argument('--out',type=Path,required=True)
    asyncio.run(run(parser.parse_args()))
