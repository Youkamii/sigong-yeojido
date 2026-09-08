"""Publish the geographic registry collected by Claude Opus, with its actual provenance."""
import argparse
import gzip
from hashlib import sha256
import json
from pathlib import Path
import shutil

ROOT=Path(__file__).resolve().parents[1]

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--research',type=Path,required=True)
    parser.add_argument('--check-only',action='store_true')
    parser.add_argument('--snapshot',action='store_true',help='Publish a verified saved registry while collection continues')
    args=parser.parse_args();folder=args.research.resolve()
    run=json.loads((folder/'run.json').read_text(encoding='utf-8'))
    complete=run.get('exitCode')==0 and not run.get('isError')
    assert complete or ((args.check_only or args.snapshot) and 'exitCode' not in run)
    assert run['modelsObserved']==['claude-opus-5'] and run['effort']=='max'
    draft=json.loads((folder/'coordinates.json').read_text(encoding='utf-8'))
    manifest=json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
    sources={}
    stored={
        'existing-place-anchors.json':((ROOT/'services/host/app/history-place-anchors.json').read_bytes(),
            'https://hgis.history.go.kr/pro_g1/dataset.do'),
        'existing-sites.json':(gzip.decompress((ROOT/'data/maps/khs-events.geojson.gz').read_bytes()),
            'https://github.com/Youkamii/sigong-yeojido/blob/main/data/maps/khs-events.geojson.gz'),
        'coastline.json':((ROOT/'services/host/app/korea-outline.json').read_bytes(),
            'https://hgis.history.go.kr/pro_g1/dataset.do'),
    }
    for source in draft['sources']:
        assert source['id'] not in sources,source['id']
        files=source['rawFile'] if isinstance(source['rawFile'],list) else [source['rawFile']]
        for name in files:
            path=(folder/name).resolve();assert path.is_relative_to(folder)
            raw=path.read_bytes();digest=sha256(raw).hexdigest()
            expected=source['sha256'][name] if isinstance(source['sha256'],dict) else source['sha256']
            assert digest==expected,(source['id'],'hash mismatch')
            if name in stored:
                assert json.loads(raw)==json.loads(stored[name][0]),(source['id'],'stored input mismatch')
            else:
                assert any(r.get('sha256')==digest and r.get('httpStatus')==200 and r.get('byteLength')==len(raw) for r in manifest),source['id']
        sources[source['id']]={key:source[key] for key in ('id','title','publisher','url','license') if key in source}
        if not source.get('url'):
            assert len(files)==1 and files[0] in stored,source['id']
            sources[source['id']]['url']=stored[files[0]][1]
            sources[source['id']]['reusedStoredInput']=True
    ids=set()
    for place in draft['places']:
        assert place['id'] not in ids,place['id'];ids.add(place['id'])
        assert isinstance(place['lon'],(int,float)) and isinstance(place['lat'],(int,float))
        assert -180<=place['lon']<=180 and -90<=place['lat']<=90,place['id']
        assert place['sourceIds'] and all(s in sources for s in place['sourceIds']),place['id']
        assert place['precision'] in ('site','area') and place['coordinateNote'],place['id']
    # Older HGIS display references stay available alongside the collected registry.
    sources.setdefault('src-hgis-admin-1910-1945',{'id':'src-hgis-admin-1910-1945','title':'역사지리정보DB 행정구역 좌표',
        'publisher':'국사편찬위원회','url':'https://hgis.history.go.kr/pro_g1/dataset.do'})
    output={**draft,'sources':list(sources.values()),
        'collection':{'sessionId':run['sessionId'],'model':run['modelsObserved'][0],'effort':run['effort'],
                      'complete':complete,'snapshotSha256':sha256(json.dumps(draft,ensure_ascii=False,sort_keys=True).encode()).hexdigest()},
        'note':'위치 자료의 지역 대표점과 사건의 활동 근거를 따로 연결합니다. 38선은 북위 38도이며 현재의 군사분계선과 다릅니다.'}
    if not args.check_only:
        (ROOT/'services/host/app/history-coordinates.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        saved=ROOT/'data/research/coordinates-105';saved.mkdir(parents=True,exist_ok=True)
        for name in ('coordinates.json','run.json','manifest.json','progress.json','report.md'):
            if (folder/name).exists():shutil.copyfile(folder/name,saved/name)
    print(json.dumps({'places':len(ids),'sources':len(sources),'checkOnly':args.check_only,'collectionComplete':complete}))

if __name__=='__main__':main()
