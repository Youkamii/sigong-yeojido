#!/usr/bin/env python3
"""근거·사료 카드의 HTML 주입 회귀 검사. API 응답만 브라우저 안에서 fixture로 바꾼다."""
import argparse
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright
from verify_viewer import LAUNCH_ARGS


async def run(url, out):
    payload = '<img src=x onerror="window.__xss=1">'
    source = {"id": "src-fixture", "label": "fixture " + payload, "coversFrom": 1, "coversTo": 1000,
              "composedYear": 500, "chunkCount": 1, "licenseDetail": '<a href="javascript:window.__xss=1">link</a>',
              "licenseVerifiedAt": "2026-09-06", "licenseVerifiedVia": "javascript:window.__xss=1"}
    place = {"id": "place-fixture", "label": "fixture", "labelKo": "fixture " + payload, "status": "disputed",
             "note": payload, "aliases": [], "mentions": {"src-fixture": 1},
             "candidates": [{"lat": 37, "lon": 127, "basis": payload, "precision": '" onmouseover="window.__xss=1',
                             "sourceUrl": "javascript:window.__xss=1", "validFrom": payload}]}
    chunk = {"id": "chunk-fixture", "text": "fixture " + payload, "sourceId": "src-fixture",
             "permalink": 'https://example.org/" onclick="window.__xss=1', "locator": payload}
    responses = {
        "places": {"places": [place]}, "sources": {"sources": [source]}, "entities": {"entities": []},
        "density": {"sources": {}}, "year": {"chunks": [], "total": 0, "bySource": {}},
        "mentions": {"chunks": [chunk], "total": 1, "bySource": {"src-fixture": 1}},
        "claims": {"claims": [], "total": 0},
        "source": {"found": True, "file": "fixture", "frontmatter": source, "body": payload},
    }
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=LAUNCH_ARGS)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        for endpoint, response in responses.items():
            async def reply(route, request, response=response):
                await route.fulfill(content_type="application/json", body=json.dumps(response))
            await page.route("**/api/" + endpoint + "?*" if endpoint in ("year", "mentions", "claims", "source") else "**/api/" + endpoint, reply)
        await page.goto(url)
        await page.locator("#enter").click()
        await page.locator("#q").fill("fixture")
        await page.locator("#qList button").first.click()
        await page.locator("#evi .quote").wait_for()
        assert payload in await page.locator("#evi").inner_text()
        await assert_safe(page)
        out.mkdir(parents=True, exist_ok=True)
        await page.screenshot(path=str(out / "html-evidence.png"))
        await page.locator(".card-btn").click()
        await page.locator("#evi .facts").wait_for()
        await assert_safe(page)
        assert not errors, errors
        await page.screenshot(path=str(out / "html-source.png"))
        await browser.close()
    print("PASS: evidence and source cards preserve text without injected nodes, handlers or unsafe links")


async def assert_safe(page):
    assert await page.evaluate("window.__xss || 0") == 0
    assert await page.locator('#app img, #app [onerror], #app [onclick], #app [onmouseover]').count() == 0
    assert await page.locator('#evi a:not([href^="https://"]):not([href^="http://"])').count() == 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:8870/?q=low")
    parser.add_argument("--out", type=Path, default=Path("/tmp/sigong-html"))
    args = parser.parse_args()
    asyncio.run(run(args.url, args.out))
