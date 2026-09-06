"""Exercise the actual CHGIS lens, source records and 3D candidate objects."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870');ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS);page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        url=args.base+'/api/locations?sources=src-chgis-hansagun'
        data=page.request.get(url).json();rows=[r for r in data['locations'] if r.get('fromSource')=='src-chgis-hansagun']
        assert len(rows)==4 and not data['hasMore']
        assert all(not r.get('fromSource') or r['fromSource']=='src-chgis-hansagun' for r in data['locations'])
        legacy=len(data['locations'])-len(rows)
        for row in rows:
            assert row['precision']=='historical-gis-reconstruction-point' and row['grounded']
            assert row.get('validFrom') is None and row.get('validTo') is None
            graph=page.request.get(args.base+'/api/graph?entity='+row['place']+'&sources=src-chgis-hansagun').json()
            claim=next(c for c in graph['claims'] if c['predicate']=='syj:locatedAt')
            raw=page.request.get(args.base+'/api/chunk?id='+claim['citesChunk']).json()['chunk'];record=json.loads(raw['text'])
            assert row['lat']==float(record['latitude']) and row['lon']==float(record['longitude'])
            assert record['license']=='CC BY-NC 4.0' and record['temporal']['begin rule']=='3'
        assert page.request.get(url+'&origin=human').json()['locations']==[]
        other=page.request.get(args.base+'/api/locations?sources=src-aks-nangnang-toseong,src-fushun-gov-history').json()['locations']
        assert not [r for r in other if r.get('fromSource')]
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000);page.locator('#enter').click()
        page.locator('#lensSelect').select_option('hansagun-chgis');page.locator('#b3d').click()
        page.wait_for_function('window.__sigong?.world?.byPlace.has("place-chgis-hvd-112638")',timeout=120000)
        visible=page.evaluate('''()=>[...new Set([...window.__sigong.world.byPlace.values()].flatMap(a=>a.filter(o=>o.visible&&o.userData.cand?.fromSource==='src-chgis-hansagun').map(o=>o.userData.cand.id)))].sort()''')
        assert set(visible)=={r['id'] for r in rows},visible
        page.locator('#humanOnly').check();page.wait_for_function('window.__sigong.engine.pickTargets.length===0')
        page.locator('#humanOnly').uncheck();page.locator('#noSources').click()
        page.wait_for_function('window.__sigong.engine.pickTargets.length===0')
        page.locator('#lensSelect').select_option('hansagun-chgis');page.locator('#b2d').click()
        page.screenshot(path=str(args.out/'hansagun-map.png'))
        assert not errors,errors;browser.close()
    result={'base':args.base,'reconstructionPoints':len(rows),'checks':{'rawCoordinatesAndPeriodCodes':True,'sourceSeparation':True,
        'actual3dCandidateIds':True,'humanAndEmptyFilters':True},'candidateIds':visible,'legacyUnattributedLocationsInApi':legacy,'pageErrors':errors,
        'priorAttempt':'Initial harness assumed source filters remove every unattributed legacy candidate; the established shared rule retains those without source or mentions.'}
    (args.out/'report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result))


if __name__=='__main__':main()
