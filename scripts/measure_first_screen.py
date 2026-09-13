"""Measure gate entry to scene readiness in a fresh Chrome context per run.

Example: python scripts/measure_first_screen.py --url http://127.0.0.1:8876 --quality low --cpu 6 --runs 3 --out result.json
Requires Playwright and installed Chrome. No browser downloads are needed.
"""
import argparse
import json
import hashlib
import ipaddress
import math
import statistics
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from playwright.sync_api import sync_playwright


PROFILE = """async () => {
  window.__firstScreenProfile = [];
  const wrap = (proto, method, stage) => {
    const original = proto[method];
    proto[method] = function(...args) {
      const start = performance.now();
      try { return original.apply(this, args); }
      finally { window.__firstScreenProfile.push({stage, start, ms:performance.now()-start}); }
    };
  };
  const {ChronicleWorld} = await import('./app/chronicle-world.js');
  const {ChronicleAssets} = await import('./app/chronicle-assets.js');
  const {ChronicleScenery} = await import('./app/chronicle-scenery.js');
  const {ChronicleScene} = await import('./app/chronicle-scene.js');
  const {Engine} = await import('./app/engine.js');
  const startEngine = Engine.prototype.start;
  Engine.prototype.start = function(...args) {
    const render = this.composer.render.bind(this.composer);
    this.composer.render = (...values) => {
      const start = performance.now();
      try { return render(...values); }
      finally {
        window.__firstScreenProfile.push({stage:'firstRender', start, ms:performance.now()-start});
        this.composer.render = render;
      }
    };
    return startEngine.apply(this,args);
  };
  wrap(ChronicleWorld.prototype, 'buildLand', 'terrain');
  wrap(ChronicleAssets.prototype, 'rebuild', 'sceneAssemblyInclusive');
  wrap(ChronicleAssets.prototype, 'buildForest', 'forest');
  wrap(ChronicleScenery.prototype, 'refreshPeriod', 'estimatedBackground');
  wrap(ChronicleScene.prototype, 'refresh', 'sceneRefreshInclusive');
  document.getElementById('enter').addEventListener('click', () => {
    window.__firstScreenStart = performance.now();
    const check = () => {
      const r = window.__sigong;
      if(r?.chronicleScene.assets?.scenery.stats.ready && !r.chronicleScene.chronicle.loading && !r.engine.fly) {
        window.__firstScreenReady = performance.now();
      } else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }, {capture:true, once:true});
}"""


def array_summary(values):
    encoded = json.dumps(values, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    return {'count': len(values), 'sha256': hashlib.sha256(encoded).hexdigest()}


def compact_row(row):
    for key in ('historyRows', 'estimatedIds'):
        if isinstance(row.get(key), list):
            row[key] = array_summary(row[key])
    stats = row.get('stats') or {}
    if isinstance(stats.get('zoneIds'), list):
        stats['zoneIds'] = array_summary(stats['zoneIds'])
    if isinstance(row.get('data'), list):
        data = row['data']
        endpoints = {}
        for resource in data:
            key = urlsplit(resource['url']).path
            group = endpoints.setdefault(key, {'count': 0, 'totalMs': 0, 'maxMs': 0, 'lastEndMs': 0})
            group['count'] += 1
            group['totalMs'] += resource['ms']
            group['maxMs'] = max(group['maxMs'], resource['ms'])
            group['lastEndMs'] = max(group['lastEndMs'], resource['start'] + resource['ms'])
        row['data'] = {**array_summary(data), 'endpoints': endpoints}
    return row


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', required=True)
    parser.add_argument('--allow-remote', action='store_true')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--quality', choices=['low', 'medium', 'high'], required=True)
    parser.add_argument('--cpu', type=float, default=6)
    parser.add_argument('--runs', type=int, default=3)
    parser.add_argument('--preference', choices=['query', 'storage', 'both'], default='both')
    parser.add_argument('--chrome', type=Path)
    parser.add_argument('--timeout', type=int, default=600000)
    args = parser.parse_args()
    if not math.isfinite(args.cpu) or args.cpu < 1 or args.runs < 1 or args.timeout <= 0:
        parser.error('--cpu and --runs must be at least 1; --timeout must be positive')
    parts = urlsplit(args.url)
    try:
        local = parts.hostname == 'localhost' or ipaddress.ip_address(parts.hostname).is_loopback
    except ValueError:
        local = False
    if parts.scheme not in ('http', 'https') or not parts.hostname or (not local and not args.allow_remote):
        parser.error('--url must be a localhost HTTP(S) URL unless --allow-remote is supplied')
    if args.chrome and not args.chrome.is_file():
        parser.error('--chrome must point to an installed Chrome executable')
    query = [(k, v) for k, v in parse_qsl(parts.query) if k != 'q']
    if args.preference != 'storage':
        query.append(('q', args.quality))
    url = urlunsplit(parts._replace(query=urlencode(query)))
    report = {'url': url, 'quality': args.quality, 'cpu': args.cpu, 'preference': args.preference,
              'viewport': {'width': 1280, 'height': 800}, 'runs': []}
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, **({'executable_path': str(args.chrome)} if args.chrome else {'channel': 'chrome'}))
        report['browserVersion'] = browser.version
        try:
            for run in range(args.runs):
                context = browser.new_context(viewport=report['viewport'])
                row = {'run': run + 1, 'pageErrors': []}
                report['runs'].append(row)
                try:
                    page = context.new_page()
                    page.set_default_timeout(args.timeout)
                    page.on('pageerror', lambda error: row['pageErrors'].append(str(error)))
                    context.new_cdp_session(page).send('Emulation.setCPUThrottlingRate', {'rate': args.cpu})
                    if args.preference != 'query':
                        page.add_init_script('localStorage.setItem("fantology.quality.v1", ' + json.dumps(json.dumps({'name': args.quality, 'manual': True})) + ');')
                    page.goto(url, wait_until='domcontentloaded')
                    print(f'run {run + 1}: page loaded', file=sys.stderr, flush=True)
                    page.wait_for_function("typeof document.getElementById('enter').onclick === 'function'")
                    # Only import already used modules and wrap synchronous methods; no scene is built here.
                    page.evaluate(PROFILE)
                    print(f'run {run + 1}: profile installed', file=sys.stderr, flush=True)
                    page.locator('#enter').click()
                    print(f'run {run + 1}: entered', file=sys.stderr, flush=True)
                    page.wait_for_function('window.__firstScreenReady || window.__sigongErr || window.__sigong?.chronicleScene.error || window.__sigong?.chronicleScene.assets?.scenery.stats.error')
                    row.update(page.evaluate("""() => {
                      const r=window.__sigong, start=window.__firstScreenStart;
                      return {readyMs:window.__firstScreenReady ? window.__firstScreenReady-start : null,
                        error:window.__sigongErr || r?.chronicleScene.error || r?.chronicleScene.chronicle.error || r?.chronicleScene.assets?.scenery.stats.error || null,
                        actualQuality:r?.engine.quality, stats:r?.chronicleScene.assets?.scenery.stats,
                        historyRows:r?.chronicleScene.assets?.rows.map(x=>x.id).sort(),
                        estimatedIds:[...r.chronicleScene.assets.scenery.estimatedIds].sort(),
                        estimatedLayouts:r.chronicleScene.assets.scenery.sites.filter(s=>r.chronicleScene.assets.scenery.estimatedIds.has(s.id)).reduce((counts,s)=>(counts[s.layout]=(counts[s.layout]||0)+1,counts),{}),
                        trees:r?.chronicleScene.assets?.forestPositions?.length,
                        stages:window.__firstScreenProfile.map(x=>({...x, start:x.start-start})),
                        marks:performance.getEntriesByType('mark').map(x=>({name:x.name, ms:x.startTime-start})),
                        data:performance.getEntriesByType('resource').filter(x=>x.name.includes('/api/')).map(x=>({url:x.name, start:x.startTime-start, ms:x.duration}))};
                    }"""))
                except Exception as error:
                    row['error'] = str(error)
                finally:
                    compact_row(row)
                    context.close()
                    print(json.dumps({'run': run + 1, 'readyMs': row.get('readyMs'), 'error': row.get('error')}, ensure_ascii=False), file=sys.stderr, flush=True)
        finally:
            browser.close()
    times = [r['readyMs'] for r in report['runs'] if r.get('readyMs') is not None]
    report['medianReadyMs'] = statistics.median(times) if times else None
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return 0 if len(times) == args.runs and all(not r.get('error') and not r['pageErrors'] for r in report['runs']) else 1


if __name__ == '__main__':
    raise SystemExit(main())
