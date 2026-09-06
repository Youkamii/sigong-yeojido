#!/usr/bin/env python3
"""Navigate the actual RDF graph to a claim, full chunk and source card (#46)."""
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
        await page.goto(args.url,wait_until='networkidle',timeout=90000)
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.length > 0')
        await page.click('#bgraph')
        await page.locator('#graph .graph-node').first.wait_for(state='visible')
        base=args.url.split('?')[0].rstrip('/')
        graph=await (await page.request.get(base+'/api/graph?entity=person-gwanggaeto&limit=12')).json()
        assert graph['hasMore'] and len(graph['claims'])==12,graph
        claim=graph['claims'][0]
        await page.locator(f'#graph [data-node="{claim["id"]}"]').click()
        assert await page.locator('#evi .quote').inner_text()==claim['quote']
        await page.click('#evi [data-evidence-action=chunk]')
        await page.locator('#evi .quote').wait_for(state='visible')
        assert claim['quote'] in await page.locator('#evi .quote').inner_text()
        await page.locator(f'#graph [data-node="{claim["fromSource"]}"]').click()
        await page.locator('#evi table.facts').wait_for(state='visible')
        assert claim['sourceLabel'] in await page.locator('#evi h3').first.inner_text()
        await page.click('#graph [data-page="1"]')
        await page.wait_for_function('document.querySelector("#graph [data-page=\\"1\\"]").disabled')
        await page.click('#graph [data-page="-1"]')
        await page.locator(f'#graph [data-node="{claim["id"]}"]').wait_for(state='visible')
        await page.screenshot(path=str(args.out/'graph-evidence.png'))
        await page.check('#humanOnly')
        await page.locator('#graph [role=status]').filter(has_text='맞는 연결이 없다').wait_for()
        assert await page.locator('#graph .graph-node').count()==0
        await page.uncheck('#humanOnly')
        await page.locator('#graph .graph-node').first.wait_for(state='visible')
        source=page.locator(f'#srcList .card-btn[data-id="{claim["fromSource"]}"]').locator('..').locator('.src')
        if await source.count():
            await source.click()
            await page.locator('#graph [role=status]').filter(has_text='맞는 연결이 없다').wait_for()
        else:
            raise AssertionError('Actual source toggle was not found')
        await browser.close()
    assert not errors,errors
    result={'claim':claim['id'],'chunk':claim['citesChunk'],'source':claim['fromSource'],
            'quoteAndFullTextMatch':True,'sourceCardReached':True,'pagination':True,
            'aiFilter':True,'sourceFilter':True,'pageErrors':errors}
    (args.out/'report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result))


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--url',default='http://127.0.0.1:8873/?q=low')
    parser.add_argument('--out',type=Path,required=True)
    asyncio.run(run(parser.parse_args()))
