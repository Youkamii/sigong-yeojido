"""Verify #187 entry preferences and rebuilds against the local viewer."""
import argparse
import json
from pathlib import Path

from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:8876')
    parser.add_argument('--chrome', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    report = {'checks': [], 'pageErrors': []}

    def check(name, actual, expected):
        report['checks'].append({'name': name, 'actual': actual, 'expected': expected, 'pass': actual == expected})

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, **({'executable_path': str(args.chrome)} if args.chrome else {'channel': 'chrome'}))

        def page_for(saved=None, query=''):
            context = browser.new_context(viewport={'width': 1280, 'height': 800})
            page = context.new_page()
            page.set_default_timeout(180000)
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.add_init_script("Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});Object.defineProperty(navigator,'deviceMemory',{get:()=>16});")
            if saved is not None:
                page.add_init_script('localStorage.setItem("fantology.quality.v1",' + json.dumps(json.dumps(saved)) + ');')
            page.goto(args.url + query, wait_until='domcontentloaded')
            page.wait_for_function("typeof document.getElementById('enter').onclick==='function'")
            return context, page

        def stored(page):
            return page.evaluate('JSON.parse(localStorage.getItem("fantology.quality.v1"))')

        def ready(page):
            page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly')

        try:
            context, page = page_for()
            for width, height in [(820, 1180), (1180, 820), (390, 844)]:
                page.set_viewport_size({'width': width, 'height': height})
                page.screenshot(path=str(args.out / f'gate-{width}.png'))
                check(f'gate-{width}: no horizontal overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth'), True)
            page.set_viewport_size({'width': 1280, 'height': 800})
            page.locator('#enter').click()
            check('no saved preference: automatic recommendation', stored(page), {'name': 'medium', 'manual': False})
            context.close()

            context, page = page_for({'name': 'low', 'manual': False})
            page.locator('#enter').click()
            check('saved automatic result remains automatic', stored(page), {'name': 'low', 'manual': False})
            ready(page)
            check('engine restores automatic adaptation', page.evaluate('__sigong.engine._qualityLocked'), False)
            context.close()

            context, page = page_for()
            page.locator('[data-gate-quality="low"]').click()
            page.locator('#enter').click()
            check('button selection is manual', stored(page), {'name': 'low', 'manual': True})
            context.close()

            saved = {'name': 'high', 'manual': False}
            context, page = page_for(saved, '?q=low')
            raw = page.evaluate('localStorage.getItem("fantology.quality.v1")')
            check('query disables all three buttons', page.locator('[data-gate-quality]:disabled').count(), 3)
            check('query message', page.locator('#qualityRecommendation').inner_text(), '검증용 화질(q=낮음)이 적용됩니다')
            page.locator('#enter').click()
            ready(page)
            check('query applies low', page.evaluate('__sigong.engine.quality'), 'low')
            check('query never writes preference', page.evaluate('localStorage.getItem("fantology.quality.v1")'), raw)
            page.screenshot(path=str(args.out / 'scene-low.png'))
            report['lowScene'] = page.evaluate('''async()=>{
              const s=__sigong.chronicleScene.assets.scenery;
              const {selectEstimatedSites}=await import('./app/chronicle-scenery.js');
              const {sitePeriod}=await import('./app/scenery-period.js');
              const sites=s.activeSites(),normal=selectEstimatedSites(sites.filter(x=>x.estimated),sites.filter(x=>x.documented&&x.kind!=='urban'),sites.filter(x=>x.kind==='urban'),x=>sitePeriod(x,s.stats.year).id,x=>s.available(x),{year:s.stats.year,world:s.world,scale:1});
              const low=s.sites.filter(x=>s.estimatedIds.has(x.id)),normalIds=new Set(normal.map(x=>x.id));
              return {villages:s.stats.villages,houses:s.stats.houses,fields:s.stats.fields,estimated:low.length,normalEstimated:normal.length,
                subset:low.every(x=>normalIds.has(x.id)),layouts:low.reduce((n,x)=>(n[x.layout]=(n[x.layout]||0)+1,n),{})};
            }''')
            check('live estimated sites are a medium subset', report['lowScene']['subset'], True)
            check('live low layouts include 0 through 3', sorted(report['lowScene']['layouts']), ['0', '1', '2', '3'])
            context.close()

            context, page = page_for({'name': 'medium', 'manual': True})
            page.locator('#enter').click()
            ready(page)
            page.wait_for_timeout(1500)
            page.locator('#atlasSettingsButton').click()
            page.locator('#atlasQuality').select_option('medium')
            report['beforeSwitch'] = page.evaluate('''()=>{
              const a=__sigong.chronicleScene.assets,s=a.scenery;
              window.qualityRebuilds={refreshPeriod:0,buildForest:0};
              for(const [o,k] of [[s,'refreshPeriod'],[a,'buildForest']]){const f=o[k];o[k]=function(...args){qualityRebuilds[k]++;return f.apply(this,args);};}
              return {modelBuilds:s.stats.modelBuilds,villages:s.stats.villages,houses:s.stats.houses,fields:s.stats.fields};
            }''')
            page.locator('#atlasQuality').select_option('high')
            page.wait_for_timeout(1000)
            report['afterSwitch'] = page.evaluate('({quality:__sigong.engine.quality,modelBuilds:__sigong.chronicleScene.assets.scenery.stats.modelBuilds,...qualityRebuilds})')
            check('settings switches to high', report['afterSwitch']['quality'], 'high')
            check('medium to high modelBuilds unchanged', report['afterSwitch']['modelBuilds'], report['beforeSwitch']['modelBuilds'])
            check('medium to high refreshPeriod calls', report['afterSwitch']['refreshPeriod'], 0)
            check('medium to high buildForest calls', report['afterSwitch']['buildForest'], 0)
            check('medium scenery unchanged', [report['beforeSwitch'][k] for k in ('villages', 'houses', 'fields')], [58, 1619, 427])
            selected = page.locator('[data-gate-quality][aria-pressed="true"]').get_attribute('data-gate-quality')
            page.evaluate("window.dispatchEvent(new CustomEvent('fan:quality',{detail:{quality:'low',manual:false}}))")
            check('automatic event does not change gate selection', page.locator('[data-gate-quality][aria-pressed="true"]').get_attribute('data-gate-quality'), selected)
            page.evaluate("window.dispatchEvent(new CustomEvent('fan:quality'))")
            page.evaluate("async()=>{document.getElementById('qualityRecommendation').remove();(await import('./app/quality-gate.js')).mountQualityChoice();}")
            check('missing recommendation and detail do not throw', len(report['pageErrors']), 0)
            context.close()
        finally:
            browser.close()
            (args.out / 'ui.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    passed = sum(row['pass'] for row in report['checks'])
    print(f"checks: {passed}/{len(report['checks'])}; pageErrors: {len(report['pageErrors'])}")
    return 0 if passed == len(report['checks']) and not report['pageErrors'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
