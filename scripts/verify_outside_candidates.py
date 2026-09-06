#!/usr/bin/env python3
"""Follow an actual out-of-diorama candidate into the map and evidence panel (#59)."""
import argparse
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from verify_viewer import LAUNCH_ARGS, canvas_png


async def run(args):
    args.out.mkdir(parents=True,exist_ok=True)
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=LAUNCH_ARGS)
        page=await browser.new_page(viewport={'width':1440,'height':1000})
        page.on('pageerror',lambda error:errors.append(str(error)))
        await page.goto(args.url,wait_until='networkidle')
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.length > 0')
        cursor=page.locator('.tl-cursor')
        await cursor.press('PageDown')
        await cursor.press('Shift+ArrowLeft')
        for _ in range(4): await cursor.press('ArrowLeft')
        assert await page.locator('#yearV').inner_text()=='300'
        await page.click('#b3d')
        await page.wait_for_function('window.__sigong?.world',timeout=60000)
        await page.locator('#outside3d').wait_for(state='visible')
        await page.click('#outside3d summary')
        rows=await page.locator('#outside3d button').evaluate_all('(rows)=>rows.map(b=>({id:b.dataset.place,label:b.textContent}))')
        nangnang=page.locator('#outside3d button[data-place="place-nangnang"]').first
        assert await nangnang.is_visible(),rows
        (args.out/'outside-3d.png').write_bytes(await canvas_png(page,'#three canvas'))
        await page.screenshot(path=str(args.out/'outside-list.png'))
        target=await nangnang.inner_text()
        await nangnang.click()
        assert not await page.locator('body').evaluate('(el)=>el.classList.contains("mode3d")')
        await page.locator('#evi .cand.focused').wait_for(state='visible')
        assert await page.locator('#resetMap').is_visible()
        await page.screenshot(path=str(args.out/'candidate-map.png'))
        await page.click('#resetMap')
        assert not await page.locator('#evi .cand.focused').count()
        await page.click('#b3d')
        await page.check('#humanOnly')
        assert not await page.locator('#outside3d').is_visible()
        await browser.close()
    assert not errors,errors
    result={'year':300,'outsideCandidates':rows,'followed':target,'mapAndEvidenceReached':True,'humanFilterRemovesAiCandidates':True,'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False))


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--url',default='http://127.0.0.1:8872/?q=low')
    parser.add_argument('--out',type=Path,required=True)
    asyncio.run(run(parser.parse_args()))
