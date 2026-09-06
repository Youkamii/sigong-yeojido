#!/usr/bin/env python3
"""Check real author filtering, including invisible 3D pick targets (#50)."""
import argparse
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from verify_viewer import LAUNCH_ARGS


async def run(args):
    args.out.mkdir(parents=True,exist_ok=True)
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=LAUNCH_ARGS)
        page=await browser.new_page(viewport={'width':1440,'height':1000})
        page.on('pageerror',lambda error:errors.append(str(error)))
        await page.goto(args.url,wait_until='networkidle')
        base=args.url.split('?')[0].rstrip('/')
        full=await (await page.request.get(base+'/api/claims?subject=person-gwanggaeto&about=1')).json()
        human=await (await page.request.get(base+'/api/claims?subject=person-gwanggaeto&about=1&origin=human')).json()
        assert full['total']>0 and human['total']==0,(full,human)
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.length > 0')
        await page.fill('#q','광개토')
        await page.click('#qList button[data-id="person-gwanggaeto"]')
        await page.wait_for_function('n=>document.querySelectorAll("#evi .claim").length===n',arg=full['total'])
        await page.check('#humanOnly')
        await page.locator('#evi .empty').filter(has_text='사람이 작성한 것으로 기록된 주장이 없다').wait_for()
        assert await page.locator('#evi .claim').count()==0
        await page.click('#b3d')
        await page.wait_for_function('window.__sigong?.world',timeout=60000)
        state=await page.evaluate('''() => ({visible:[...window.__sigong.world.byPlace.values()].flat().filter(o=>o.visible).length,
          pickTargets:window.__sigong.engine.pickTargets.length})''')
        assert state=={'visible':0,'pickTargets':0},state
        await page.uncheck('#humanOnly')
        await page.wait_for_function('window.__sigong.engine.pickTargets.length > 0')
        restored=await page.evaluate('window.__sigong.engine.pickTargets.length')
        await browser.close()
    assert not errors,errors
    result={'actualClaims':full['total'],'humanClaims':human['total'],'filtered3d':state,'restoredPickTargets':restored,'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result))


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--url',default='http://127.0.0.1:8872/?q=low')
    parser.add_argument('--out',type=Path,required=True)
    asyncio.run(run(parser.parse_args()))
