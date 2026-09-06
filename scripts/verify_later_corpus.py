#!/usr/bin/env python3
"""대용량 사료의 실제 카드·사료 선택·연도별 원문 응답을 확인한다 (#38)."""
import argparse
import asyncio
import json
from pathlib import Path
import time
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]


async def run(url, out, audits):
    out.mkdir(parents=True, exist_ok=True)
    catalog = json.loads((ROOT/'services/ingestion/later-catalog.json').read_text(encoding='utf-8'))['sources']
    expected = {}
    for path in audits:
        expected.update(json.loads(path.read_text(encoding='utf-8'))['sources'])
    errors, verified = [], {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        page = await browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(url, wait_until='load', timeout=90000)
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.length > 0', timeout=180000)
        sources = {s['id']: s for s in await page.evaluate('window.__timeline.sources')}
        for name, stats in expected.items():
            sid, meta = f'src-{name}', catalog[name]
            actual = sources[sid]
            assert actual['chunkCount'] == stats['chunks'], name
            assert actual['composedYear'] == meta['composedYear'], name
            assert [actual['coversFrom'], actual['coversTo']] == stats['yearRange'], name
            rail = page.locator('.srcgroup').filter(has=page.locator('summary', has_text=meta['sourceGroup']))
            if await rail.get_attribute('open') is None:
                await rail.locator('summary').click()
            await page.locator(f'.card-btn[data-id="{sid}"]').click()
            await page.wait_for_function('(label) => document.querySelector("#evi h3")?.textContent === label', arg=meta['label'])
            assert f"{stats['chunks']:,}" in await page.locator('#evi').inner_text(), name
            await page.screenshot(path=str(out/f'{name}-card.png'))
            group = page.locator(f'.tl-group[data-group="{meta["sourceGroup"]}"]')
            if await group.locator('.tl-group-open').get_attribute('aria-expanded') == 'false':
                await group.locator('.tl-group-open').click()
            toggle = page.locator(f'.tl-track[data-id="{sid}"] .tl-label')
            await toggle.click()
            assert not await page.evaluate('(sid)=>window.__timeline.on.has(sid)', sid)
            await toggle.click()
            assert await page.evaluate('(sid)=>window.__timeline.on.has(sid)', sid)
            year_checks = []
            for year in stats['yearRange']:
                started = time.monotonic()
                data = await page.evaluate('url => fetch(url).then(r=>r.json())', f'/api/year?y={year}&sources={sid}&limit=5')
                assert data['total'] == stats['years'][str(year)], (name, year, data['total'])
                assert all(c['sourceId'] == sid for c in data['chunks']), name
                assert any(c['text'] for c in data['chunks']), (name, year)
                year_checks.append({'year': year, 'total': data['total'], 'seconds': round(time.monotonic()-started, 3)})
            if name == 'seungjeongwon-ilgi':
                data = await page.evaluate('fetch("/api/year?y=1623&sources=src-seungjeongwon-ilgi&limit=10").then(r=>r.json())')
                article = next(c for c in data['chunks'] if c.get('dateInheritedFrom'))
                assert article['date']['raw'].startswith('1623-') and article['dateContext']['forms']
            empty = await page.evaluate('fetch("/api/year?y=1623&sources=").then(r=>r.json())')
            assert empty['total'] == 0
            verified[name] = {'chunks': stats['chunks'], 'sourceCard': True, 'toggle': True, 'years': year_checks}
        assert not errors, errors
        await browser.close()
    result = {'sources': verified, 'errors': errors}
    (out/'report.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:8870/?q=low')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--audit', type=Path, nargs='+', required=True)
    args = parser.parse_args()
    asyncio.run(run(args.url, args.out, args.audit))
