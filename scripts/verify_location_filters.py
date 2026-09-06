"""Compare real Fuseki candidates with the shared 2D/3D selection rules."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=LAUNCH_ARGS)
        page=browser.new_page()
        page.goto(args.base+'/?q=low',wait_until='networkidle',timeout=180000)
        report=page.evaluate('''async()=>{
          const state=await import('/app/place-state.js');
          const get=async path=>{const r=await fetch(path);if(!r.ok)throw Error(path+' '+r.status);return r.json();};
          const places=(await get('/api/places')).places;
          const cases=[
            {name:'all',sources:null,year:null,origin:'all'},
            {name:'samguksagi-500',sources:['src-samguksagi'],year:500,origin:'all'},
            {name:'samgukyusa-100',sources:['src-samgukyusa'],year:100,origin:'all'},
            {name:'goryeo-918',sources:['src-goryeosa'],year:918,origin:'all'},
            {name:'modern-without-coordinate',sources:['src-kci-bok-2020-gungnae'],year:100,origin:'all'},
            {name:'modern-with-coordinate',sources:['src-kci-bok-2020-gungnae','src-geonames'],year:100,origin:'all'},
            {name:'imdun-without-coordinate',sources:['src-encykorea-imdungun'],year:-100,origin:'all'},
            {name:'imdun-with-coordinate',sources:['src-encykorea-imdungun','src-geonames-hamgyongnamdo'],year:-100,origin:'all'},
            {name:'jinbeon-no-invented-point',sources:['src-encykorea-jinbeongun'],year:-100,origin:'all'},
            {name:'none',sources:[],year:100,origin:'all'},
            {name:'human-only',sources:null,year:100,origin:'human'}];
          const results=[];
          for(const c of cases){
            const sources=c.sources===null?null:new Set(c.sources);
            const expected=new Map(places.flatMap(p=>(p.candidates||[])
              .filter(v=>(c.year===null||state.candActive(v,c.year,p))&&state.originMatches(v,c.origin,p)&&state.sourceMatches(v,p,sources))
              .map(v=>[v.id,{place:p,candidate:v}])));
            const params=new URLSearchParams({origin:c.origin});
            if(c.sources!==null)params.set('sources',c.sources.join(','));
            if(c.year!==null)params.set('year',c.year);
            const actual=await get('/api/locations?'+params);
            const ids=new Set(actual.locations.map(v=>v.id));
            const missing=[...expected.keys()].filter(id=>!ids.has(id)),extra=[...ids].filter(id=>!expected.has(id));
            if(missing.length||extra.length||actual.hasMore)throw Error(JSON.stringify({case:c.name,missing,extra,hasMore:actual.hasMore}));
            for(const row of actual.locations){const e=expected.get(row.id);
              if(row.place!==e.place.id||Math.abs(row.lat-e.candidate.lat)>1e-8||Math.abs(row.lon-e.candidate.lon)>1e-8)throw Error('metadata '+row.id);
            }
            if(['imdun-without-coordinate','jinbeon-no-invented-point'].includes(c.name)&&ids.size)throw Error('unsupported ancient coordinate');
            if(c.name==='imdun-with-coordinate'){
              const derived=actual.locations.find(v=>v.place==='place-encykorea-imdungun');
              if(ids.size!==2||!derived||derived.grounded||derived.precision!=='region-representative-point')throw Error('regional point promoted to ancient seat');
              if(derived.fromFile)throw Error('claim-derived point incorrectly attributed to legacy places file');
              if(!expected.get(derived.id).candidate.requiredSources?.includes('src-geonames-hamgyongnamdo'))throw Error('coordinate source missing');
            }
            if(c.name==='samguksagi-500'&&ids.size>10){
              params.set('limit','5');
              const a=await get('/api/locations?'+params);params.set('offset','5');
              const b=await get('/api/locations?'+params);
              if(a.locations.length!==5||b.locations.length!==5||!a.hasMore||!b.hasMore||new Set([...a.locations,...b.locations].map(v=>v.id)).size!==10)throw Error('filtered pagination');
            }
            results.push({name:c.name,candidateCount:ids.size,exactIds:true,metadata:true});
          }
          const empty=await get('/api/graph?entity=place-pyongyang&sources=');
          if(empty.locations?.length||empty.nodes.length)throw Error('empty graph');
          return {cases:results,sharedRules:'2D/3D place-state.js',filteredPagination:true,emptyGraph:true};
        }''')
        browser.close()
    report['base']=args.base
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':main()
