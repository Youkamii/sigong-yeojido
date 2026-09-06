#!/usr/bin/env python3
"""Check source-scoped researched places in the real viewer (#18)."""
import argparse
import asyncio
import json
from pathlib import Path
from urllib.parse import urlparse, parse_qs

from playwright.async_api import async_playwright


async def run(url, out):
    out.mkdir(parents=True, exist_ok=True)
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        page = await browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(url, wait_until='load', timeout=90000)
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.length > 0')
        data = await page.evaluate('fetch("/api/places").then(r => r.json())')
        places = data['places']
        assert len({place['id'] for place in places}) == len(places)
        researched = [place for place in places if place.get('sourceId') in ('src-goryeosa', 'src-samgukyusa')]
        assert len(researched) == 80, len(researched)
        for source in ('src-goryeosa', 'src-samgukyusa'):
            group = [place for place in researched if place['sourceId'] == source]
            assert len(group) == 40
            assert all(place['origin'] == 'ai' and place.get('evidence') for place in group)
            assert all(set(place['mentions']).issubset({source}) for place in group)

        for source in ('goryeosa', 'samgukyusa'):
            target = next(place for place in researched if place['id'] == f'place-{source}-001')
            await page.locator('#q').fill(target['labelKo'])
            async with page.expect_response(lambda response: '/api/mentions?' in response.url
                    and parse_qs(urlparse(response.url).query, keep_blank_values=True).get('sources') == [f'src-{source}']) as pending:
                await page.locator(f'#qList button[data-id="{target["id"]}"]').click()
            response = await pending.value
            result = await response.json()
            query = parse_qs(urlparse(response.url).query, keep_blank_values=True)
            assert query['sources'] == [f'src-{source}'], query
            assert result['total'] > 0
            assert set(result['bySource']) == {f'src-{source}'}
            await page.locator('#evi .srcname').first.wait_for()
            assert await page.locator('#evi h3').inner_text() == target['labelKo']
            assert '이 사료 안에서 원문을 찾는다' in await page.locator('#evi').inner_text()
            assert await page.locator('#evi > .badge').first.inner_text() == '좌표 후보'
            await page.screenshot(path=str(out/f'{source}-evidence.png'))
            async with page.expect_response(lambda response: '/api/mentions?' in response.url
                    and parse_qs(urlparse(response.url).query, keep_blank_values=True).get('sources') == ['']) as pending:
                await page.locator(f'.tl-track[data-id="src-{source}"] .tl-label').click()
            response = await pending.value
            result = await response.json()
            assert result['total'] == 0
            assert parse_qs(urlparse(response.url).query, keep_blank_values=True)['sources'] == ['']
            await page.wait_for_function('!document.querySelector("#evi .srcname")')
            await page.screenshot(path=str(out/f'{source}-off.png'))
            async with page.expect_response(lambda response: '/api/mentions?' in response.url
                    and parse_qs(urlparse(response.url).query, keep_blank_values=True).get('sources') == [f'src-{source}']):
                await page.locator(f'.tl-track[data-id="src-{source}"] .tl-label').click()
            await page.locator('#evi .srcname').first.wait_for()

        unlocated = next((place for place in researched if not place['candidates']), None)
        if unlocated:
            await page.locator('#q').fill(unlocated['labelKo'])
            await page.locator(f'#qList button[data-id="{unlocated["id"]}"]').click()
            await page.locator('#evi .unloc').wait_for()
            await page.screenshot(path=str(out/'unlocated.png'))
        assert not errors, errors
        await browser.close()
    result = {'researchedPlaces': len(researched), 'uniqueIds': True, 'sourceScope': True,
              'sourceOffEmpty': True, 'unlocatedPanel': bool(unlocated), 'errors': errors}
    (out/'report.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:8870/?q=low')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    asyncio.run(run(args.url, args.out))
