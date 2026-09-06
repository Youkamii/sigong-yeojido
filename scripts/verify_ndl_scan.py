"""Verify actual NDL scan records, archived bytes and page navigation on the running viewer."""
import argparse
import hashlib
import json
from pathlib import Path

from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS

KEY = 'ndl-gyeongguk-1934'
SOURCE = 'src-' + KEY


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    ap.add_argument('--base', default='http://127.0.0.1:8870')
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    archive = json.loads((args.root / 'data/research' / KEY / 'image-index.json').read_text(encoding='utf-8'))
    rows = [json.loads(line) for line in (args.root / 'data/sources' / KEY / 'chunks.jsonl').read_text(encoding='utf-8').splitlines()]
    checks = []
    assert len(rows) == archive['imageCount'] == 319 and archive['missingNumbers'] == []
    for image in archive['images']:
        path = args.root / 'data/scans' / KEY / image['file']
        raw = path.read_bytes()
        assert len(raw) == image['bytes'] and hashlib.sha256(raw).hexdigest() == image['sha256'], image['file']
    checks.append({'check': 'all 319 archived images match recorded full-file hashes', 'status': 'PASS', 'bytes': archive['bytes']})
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=LAUNCH_ARGS)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        source = page.request.get(args.base + '/api/source?id=' + SOURCE).json()
        assert source['found'] and source['frontmatter']['chunkCount'] == 319
        assert source['frontmatter']['composedYear'] is None and source['frontmatter']['editionYear'] == 1934
        live = page.request.get(args.base + '/api/chunks?sources=' + SOURCE + '&limit=500').json()
        assert live['total'] == 319 and live['chunks'] == rows
        assert all(r['text'] == '' and r['date'] is None and r['transcriptionStatus'] == 'not-transcribed' for r in rows)
        assert page.request.get(args.base + '/api/chunks?sources=&limit=1').json()['total'] == 0
        checks.append({'check': 'actual API preserves all image records and empty text/date', 'status': 'PASS'})
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#enter').click()
        button = page.locator('[data-source="' + SOURCE + '"]')
        button.wait_for(state='attached', timeout=180000)
        group = page.locator('details.srcgroup').filter(has=button)
        if group.count() and group.get_attribute('open') is None:
            group.locator('summary').click()
        if ' on' not in button.get_attribute('class'):
            button.click()
        page.locator('.card-btn[data-id="' + SOURCE + '"]').click()
        page.locator('[data-scan-open]').click()

        def expect_image(number):
            page.wait_for_function('n => { const image=document.querySelector("#evi .scan-image"); return image && image.src.includes("R"+String(n).padStart(7,"0")+"/") && image.complete && image.naturalWidth===5658; }', arg=number, timeout=90000)
            assert f'원 코마 표기 {number}' in page.locator('#evi').inner_text()

        def jump(number):
            page.locator('[data-scan-jump] input').fill(str(number))
            page.locator('[data-scan-jump] button').click()
            expect_image(number)

        expect_image(1)
        assert page.locator('[data-scan-prev]').is_disabled()
        jump(29)
        page.locator('[data-scan-prev]').click(); expect_image(28)
        page.locator('[data-scan-next]').click(); expect_image(29)
        jump(319)
        assert page.locator('[data-scan-next]').is_disabled()
        checks.append({'check': 'real first, intermediate and last images load; previous/next/jump are correct', 'status': 'PASS', 'originalWidth': 5658})
        page.locator('#noSources').click()
        page.wait_for_function('!document.querySelector("#evi .scan-image") && document.querySelector("#evi").textContent.includes("현재 사료 선택")')
        button.click()
        expect_image(319)
        checks.append({'check': 'clearing sources removes the scan and selecting the source restores the same page', 'status': 'PASS'})
        jump(29)
        page.set_viewport_size({'width': 480, 'height': 800})
        if page.locator('#evidenceBtn').get_attribute('aria-expanded') == 'false':
            page.locator('#evidenceBtn').click()
        page.locator('#evi .scan-image').wait_for(state='visible')
        bounds = page.locator('#evi .scan-image').bounding_box()
        assert bounds and bounds['x'] >= 0 and bounds['x'] + bounds['width'] <= 481, bounds
        assert page.locator('#evi .scan-image').get_attribute('src') == rows[28]['scanImage']['url']
        page.screenshot(path=str(args.out / 'scan-mobile.png'))
        checks.append({'check': '480px screen keeps the scan within the evidence panel', 'status': 'PASS', 'imageBounds': bounds})
        assert not errors, errors
        browser.close()
    report = {'base': args.base, 'source': SOURCE, 'checks': checks, 'passed': len(checks),
              'transcribedPages': 0, 'translatedPages': 0, 'newClaims': 0, 'browserErrors': errors}
    (args.out / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
