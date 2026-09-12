"""Capture every year's actual renderer. This does not certify historical accuracy."""
import argparse
import base64
import hashlib
import json
import mimetypes
import shutil
import subprocess
import time
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

from playwright.sync_api import sync_playwright


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def app_hashes(app):
    return {p.relative_to(app).as_posix(): digest(p) for p in sorted(app.rglob('*')) if p.is_file()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True, help='New TEMP or ignored output directory')
    parser.add_argument('--base', default='https://sigong.rabbion.info/')
    parser.add_argument('--browser', default=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
    parser.add_argument('--start', type=int, default=-2500)
    parser.add_argument('--end', type=int, default=2100)
    parser.add_argument('--current-year', type=int, default=2026)
    args = parser.parse_args()
    if not -2500 <= args.start <= args.end <= 2100:
        parser.error('Year bounds must stay within -2500..2100')
    repo, out = args.repo.resolve(), args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    frozen, frames = out / 'frozen-app', out / 'frames'
    if frozen.exists() or frames.exists():
        parser.error('Use a new output directory; existing run evidence is not overwritten')
    app = repo / 'services' / 'host' / 'app'
    head = subprocess.check_output(['git', '-C', str(repo), 'rev-parse', 'HEAD'], text=True).strip()
    dirty = subprocess.check_output(['git', '-C', str(repo), 'status', '--porcelain'], text=True).strip()
    before = app_hashes(app)
    shutil.copytree(app, frozen)
    hashes = app_hashes(frozen)
    final_head = subprocess.check_output(['git', '-C', str(repo), 'rev-parse', 'HEAD'], text=True).strip()
    if before != hashes or hashes != app_hashes(app) or head != final_head:
        raise RuntimeError('App changed while freezing; retry after integration finishes')
    frames.mkdir()
    report = {'base': args.base, 'head': head, 'worktreeStatus': dirty,
              'appSha256': hashlib.sha256(json.dumps(hashes, sort_keys=True).encode()).hexdigest(),
              'appFiles': hashes, 'start': args.start, 'end': args.end, 'currentYear': args.current_year,
              'scope': 'Frozen local app with live remote HTML, vendor files, and APIs; renderer execution only',
              'historicalAcceptance': 'NOT_AUDITED', 'visualAcceptance': 'NOT_AUDITED',
              'years': [], 'pageErrors': [], 'resourceFailures': [], 'consoleErrors': []}

    def save():
        report['summary'] = {'rows': len(report['years']),
                             'rendererPass': sum(r.get('rendererStatus') == 'PASS' for r in report['years']),
                             'rendererFail': sum(r.get('rendererStatus') == 'FAIL' for r in report['years']),
                             'historicalAcceptancePass': 0}
        (out / 'manifest.json').write_text(json.dumps(report, ensure_ascii=False), encoding='utf-8')

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=args.browser)
        page = browser.new_page(viewport={'width': 960, 'height': 720})
        page.set_default_timeout(90000)

        def route_app(route):
            relative = unquote(urlparse(route.request.url).path.split('/app/', 1)[1])
            target = (frozen / relative).resolve()
            if target.is_relative_to(frozen) and target.is_file():
                mime = {'.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json'}.get(target.suffix)
                route.fulfill(path=str(target), content_type=mime or mimetypes.guess_type(target.name)[0] or 'application/octet-stream')
            else:
                report['resourceFailures'].append({'url': route.request.url, 'error': 'missing-frozen-app-resource'})
                route.abort()

        page.route('**/app/**', route_app)
        page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
        page.on('requestfailed', lambda request: report['resourceFailures'].append({'url': request.url, 'error': request.failure}))
        page.on('console', lambda message: report['consoleErrors'].append(message.text) if message.type == 'error' else None)
        try:
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#enter').click()
            page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
            page.evaluate('__sigong.engine.setQuality("medium",{manual:true,persist:false})')
            report['styles'] = page.evaluate('''()=>({links:[...document.querySelectorAll('link[rel="stylesheet"]')].map(l=>{
                let rules=0;try{rules=l.sheet?.cssRules.length||0}catch{}return {href:l.href,rules};}),
                body:{font:getComputedStyle(document.body).fontFamily,margin:getComputedStyle(document.body).margin},
                atlas:(()=>{const e=document.querySelector('#atlas, .atlas, #chronicle');return e?{id:e.id,display:getComputedStyle(e).display,position:getComputedStyle(e).position,width:e.getBoundingClientRect().width}:null})()})''')
            if not report['styles']['links'] or any(not s['rules'] for s in report['styles']['links']):
                raise RuntimeError('Linked stylesheet missing readable CSS rules; UI capture is invalid')
            if report['pageErrors'] or any('MIME' in e or 'stylesheet' in e.lower() for e in report['consoleErrors']):
                raise RuntimeError('Startup page or stylesheet errors; UI capture is invalid')
            if any('ERR_ABORTED' not in (r['error'] or '') for r in report['resourceFailures']):
                raise RuntimeError('Startup resources failed; UI capture is invalid')
            (out / 'startup.png').write_bytes(page.screenshot())
            # Ensure even a probe beginning on the initial year triggers a fresh API request.
            if page.evaluate('__sigong.chronicleScene.chronicle.year') == args.start:
                alternate = args.start + 1 if args.start != 2100 else 2099
                if alternate == 0:
                    alternate = 1
                page.evaluate('y=>__sigong.chronicleScene.chronicle.chooseYear(y)', alternate)
                page.wait_for_function('y=>__sigong.chronicleScene.assets.plan.year===y', arg=alternate)
            for year in range(args.start, args.end + 1):
                if year == 0:
                    report['years'].append({'year': 0, 'support': 'INVALID_YEAR', 'rendererStatus': 'NOT_RUN'})
                    continue
                started = time.monotonic()
                errors_before, resources_before, console_before = len(report['pageErrors']), len(report['resourceFailures']), len(report['consoleErrors'])
                row = {'year': year, 'support': 'FUTURE_UNSUPPORTED' if year > args.current_year else 'SUPPORTED',
                       'rendererStatus': 'FAIL', 'historicalAcceptance': 'NOT_AUDITED'}
                try:
                    def is_year_response(response):
                        url = urlparse(response.url)
                        return url.path == '/api/history-map' and parse_qs(url.query).get('year') == [str(year)]

                    with page.expect_response(is_year_response, timeout=30000) as received:
                        control = page.locator('#historyTime [type=number]')
                        control.fill(str(year))
                        control.press('Enter')
                    response = received.value
                    body = response.body()  # Consume bytes; Response.finished() leaves task warnings in some Playwright builds.
                    api = json.loads(body)
                    row['historyApi'] = {'status': response.status, 'sha256': hashlib.sha256(body).hexdigest(), 'features': len(api.get('features', []))}
                    if not response.ok or not isinstance(api.get('features'), list):
                        raise RuntimeError('History API failed or returned an invalid feature collection')
                    page.wait_for_function('y=>{const c=__sigong.chronicleScene;return c.chronicle.year===y&&c.assets.plan.year===y&&!c.chronicle.loading&&c.assets.scenery.stats.ready&&c.assets.scenery.stats.year===y}', arg=year)
                    state = page.evaluate('''async y=>{
                        const {world:w,engine:e,chronicleScene:c}=__sigong,s=c.assets.scenery;
                        e.fly=null;const [x,z]=w.toWorld(127.7,37.5);e.controls.target.set(x,w.surfaceAt(x,z),z);
                        e.camera.position.copy(e.controls.target).add(e.camera.position.clone().set(0,1050,1050));e.controls.update();
                        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));e.composer.render();
                        const cells=(s.landscapeCells||[]).map(c=>({id:c.site.id,kind:c.site.kind,region:c.site.profile?.id||c.site.regionId||c.site.profileId,houses:c.layout.houses.length,fields:c.layout.fields.length}));
                        return {planYear:c.assets.plan.year,sceneryYear:s.stats.year,period:s.period.id,ready:s.stats.ready,
                            sceneIds:c.assets.plan.events.map(e=>e.id),rows:c.assets.rows.length,cells,
                            renderer:{calls:e.renderer.info.render.calls,triangles:e.renderer.info.render.triangles,contextLost:e.renderer.getContext().isContextLost()},
                            sceneryError:s.stats.error||null,frame:e.renderer.domElement.toDataURL('image/jpeg',.65)};
                    }''', year)
                    frame = base64.b64decode(state.pop('frame').split(',')[1])
                    filename = f'{year}.jpg'
                    (frames / filename).write_bytes(frame)
                    row.update(state, file='frames/' + filename, frameSha256=hashlib.sha256(frame).hexdigest())
                    row['pageErrors'] = report['pageErrors'][errors_before:]
                    row['resourceFailures'] = report['resourceFailures'][resources_before:]
                    row['consoleErrors'] = report['consoleErrors'][console_before:]
                    blocking_resources = [r for r in row['resourceFailures'] if 'ERR_ABORTED' not in (r['error'] or '')]
                    if row['sceneryError'] or row['pageErrors'] or blocking_resources or row['consoleErrors'] or row['renderer']['contextLost'] or row['renderer']['triangles'] <= 0 or len(frame) < 1000:
                        raise RuntimeError('Renderer, resource, console, or frame validation failed')
                    row['rendererStatus'] = 'PASS'
                except Exception as error:
                    row['error'] = str(error)
                row['seconds'] = round(time.monotonic() - started, 3)
                report['years'].append(row)
                if year % 100 == 0 or year == args.end:
                    save()
                    print(json.dumps({'through': year, **report['summary']}), flush=True)
        except Exception as error:
            report['fatalError'] = str(error)
        finally:
            save()
            browser.close()
    return 1 if report.get('fatalError') or report['summary']['rendererFail'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
