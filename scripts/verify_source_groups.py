#!/usr/bin/env python3
"""실제 많은 사료에서 시간축 접기·전체 선택·부분 선택·카드를 확인한다 (#31)."""
import argparse
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright


async def run(url, out):
    out.mkdir(parents=True, exist_ok=True)
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        page = await browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(url, wait_until='networkidle')
        await page.click('#enter')
        await page.wait_for_function('window.__timeline && window.__timeline.groups')
        group = page.locator('.tl-group').filter(has=page.locator('[aria-label="조선왕조실록 전체 선택"]'))
        toggle = group.locator('.tl-group-toggle')
        open_button = group.locator('.tl-group-open')
        assert await open_button.get_attribute('aria-expanded') == 'false'
        before = await page.evaluate('({ids:[...window.__timeline.on], domain:[window.__timeline._geom.d0,window.__timeline._geom.d1]})')
        group_ids = await page.evaluate('window.__timeline.groups.find(g=>g.label==="조선왕조실록").sources.map(s=>s.id)')
        await toggle.click()
        assert await toggle.get_attribute('aria-checked') == 'false'
        assert await page.evaluate('(ids)=>ids.every(id=>!window.__timeline.on.has(id))', group_ids)
        await open_button.click()
        assert await page.locator('.tl-track[data-id^="src-sillok-"]').count() == 30
        await page.locator('.tl-track[data-id="src-sillok-waa"] .tl-label').click()
        assert await toggle.get_attribute('aria-checked') == 'mixed'
        await open_button.click()
        assert await page.evaluate('window.__timeline.on.has("src-sillok-waa")')
        assert await page.evaluate('[window.__timeline._geom.d0,window.__timeline._geom.d1]') == before['domain']
        await toggle.click()
        assert await page.evaluate('[...window.__timeline.on].sort()') == sorted(before['ids'])
        await page.screenshot(path=str(out / 'collapsed.png'))
        rail = page.locator('.srcgroup').filter(has=page.locator('summary', has_text='조선왕조실록'))
        await rail.locator('summary').click()
        await rail.locator('.card-btn[data-id="src-sillok-waa"]').click()
        await page.wait_for_function('document.querySelector("#evi h3")?.textContent === "태조실록"')
        assert '2,477' in await page.locator('#evi').inner_text()
        assert '1413' in await page.locator('#evi').inner_text()
        await page.screenshot(path=str(out / 'source-card.png'))
        assert not errors, errors
        await browser.close()
    result = {'groupCollapse': True, 'allOff': True, 'partialSelection': True, 'domainPreserved': True,
              'allRestored': True, 'sourceCard': True, 'errors': errors}
    (out / 'report.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:8870/?q=low')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    asyncio.run(run(args.url, args.out))
