#!/usr/bin/env python3
"""Open actual records, source cards and search at desktop and narrow widths (#58)."""
import argparse
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from verify_viewer import LAUNCH_ARGS


async def run(args):
    args.out.mkdir(parents=True, exist_ok=True)
    reports, errors = [], []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=LAUNCH_ARGS)
        for width in (1440, 1000, 480):
            page = await browser.new_page(viewport={'width':width, 'height':1000})
            page.on('pageerror', lambda error: errors.append(str(error)))
            await page.goto(args.url, wait_until='networkidle')
            await page.click('#enter')
            await page.wait_for_function('window.__timeline?.sources.length > 0')
            await page.click('#yearBtn')
            await page.locator('#evi .quote').first.wait_for(state='visible')
            assert await page.locator('#evi').is_visible()
            await page.screenshot(path=str(args.out/f'{width}-records.png'))
            if width <= 1080:
                await page.click('#evidenceBtn')
                assert not await page.locator('#evi').is_visible()
            if width <= 720:
                await page.click('#sourcesBtn')
            assert await page.locator('#q').is_visible()
            await page.fill('#q', '광개토')
            assert await page.locator('#qList button').count() > 0
            group = page.locator('#srcList details').first
            await group.locator('summary').click()
            await group.locator('.card-btn').first.click()
            await page.locator('#evi table.facts').wait_for(state='visible')
            assert await page.locator('#evi .card').is_visible()
            overflow = await page.evaluate('document.documentElement.scrollWidth > innerWidth')
            assert not overflow, width
            await page.screenshot(path=str(args.out/f'{width}-source.png'))
            reports.append({'width':width,'recordsVisible':True,'searchAccessible':True,'sourceCardVisible':True,'overflow':False})
            await page.close()
        await browser.close()
    assert not errors, errors
    result = {'screens':reports,'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result))


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--url',default='http://127.0.0.1:8872/?q=low')
    parser.add_argument('--out',type=Path,required=True)
    asyncio.run(run(parser.parse_args()))
