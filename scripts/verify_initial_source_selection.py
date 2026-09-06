"""Delay the real source response and preserve the user's initial bulk selection."""
import argparse
import asyncio
import json
from pathlib import Path
from urllib.parse import urlencode
from playwright.async_api import async_playwright
from verify_viewer import LAUNCH_ARGS


async def verify(args):
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=LAUNCH_ARGS)
        for name, clicks in [('default', []), ('all', ['allSources']), ('none', ['noSources']),
                             ('last_choice', ['allSources', 'noSources', 'allSources'])]:
            page = await browser.new_page(viewport={'width': 1440, 'height': 1000})
            held, release = asyncio.Event(), asyncio.Event()
            errors = []; page.on('pageerror', lambda error: errors.append(str(error)))
            async def delay(route):
                response = await route.fetch(timeout=180000)
                held.set(); await release.wait(); await route.fulfill(response=response)
            await page.route('**/api/sources', delay)
            await page.goto(args.base + '/?q=low', wait_until='domcontentloaded', timeout=180000)
            await asyncio.wait_for(held.wait(), timeout=180)
            await page.locator('#enter').click()
            for button in clicks: await page.locator('#' + button).click()
            assert await page.locator('#srcList .src').count() == 0
            release.set()
            await page.locator('#srcList .src').first.wait_for(state='attached', timeout=180000)
            sources = (await (await page.request.get(args.base + '/api/sources')).json())['sources']
            lenses = await (await page.request.get(args.base + '/api/lenses')).json()
            default = next(lens for lens in lenses['lenses'] if lens['id'] == lenses['default'])
            expected = {s['id'] for s in sources} if clicks and clicks[-1] == 'allSources' else set() if clicks else set(default['sources'])
            selected = await page.locator('#srcList .src.on').evaluate_all('(rows)=>rows.map(row=>row.dataset.source)')
            assert set(selected) == expected, (name, len(selected), len(expected))
            query = urlencode({'y': 414, 'sources': ','.join(sorted(expected)), 'limit': 0})
            count = (await (await page.request.get(args.base + '/api/year?' + query)).json())['total']
            await page.wait_for_function('(n)=>document.querySelector("#yearBtn").textContent==="이 해의 기록 "+n', arg=count, timeout=30000)
            assert not errors, errors
            results.append({'case': name, 'selected': len(selected), 'expected': len(expected),
                            'yearRecordCount': count, 'pageErrors': errors})
            await page.close()
        await browser.close()
    report = {'base': args.base, 'realSourceResponseDelayed': True, 'cases': results, 'passed': len(results)}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--base', default='http://127.0.0.1:8870'); ap.add_argument('--out', type=Path, required=True)
    asyncio.run(verify(ap.parse_args()))
