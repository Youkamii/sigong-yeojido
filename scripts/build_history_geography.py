"""Build the display geography from the completed Opus collection and stored HGIS coastlines."""
import argparse,gzip,json,shutil
from hashlib import sha256
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def area(ring):
    return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:]))/2)

def contains(point,ring):
    x,y=point;inside=False
    for a,b in zip(ring,ring[1:]):
        if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:inside=not inside
    return inside

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--research',type=Path,required=True);args=ap.parse_args()
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and run['modelsObserved']==['claude-opus-5'] and run['effort']=='max'
    data=json.loads((args.research/'geography.json').read_text(encoding='utf-8'))
    manifest=json.loads((args.research/'manifest.json').read_text(encoding='utf-8'))
    for source in data['sources']:
        files=source['rawFile'] if isinstance(source['rawFile'],list) else [source['rawFile']]
        for name in files:
            path=(args.research/name).resolve();assert path.is_relative_to(args.research.resolve())
            raw=path.read_bytes();digest=sha256(raw).hexdigest()
            expected=source['sha256'][name] if isinstance(source['sha256'],dict) else source['sha256']
            assert digest==expected
            assert any(r.get('sha256')==digest and r.get('httpStatus')==200 and r.get('byteLength')==len(raw) for r in manifest)
    coast_file=ROOT/'data/maps/hgis-districts-1910-1945.geojson.gz'
    feature=next(f for f in json.load(gzip.open(coast_file))['features'] if f['id']=='hgis-admin-157376')
    polygons=feature['geometry']['coordinates']
    source_id='display-hgis-eastern-islands'
    data['sources'].append({'id':source_id,'title':'HGIS 울릉도 행정구역의 해안 윤곽','publisher':'국사편찬위원회 역사시대 행정구역',
        'url':'https://hgis.history.go.kr/pro_g1/dataset.do', 'file':str(coast_file.relative_to(ROOT)).replace('\\','/'),
        'license':'공공데이터포털 15080854: 이용허락범위 제한 없음',
        'sha256':sha256(coast_file.read_bytes()).hexdigest(),'featureId':feature['id'],
        'accuracyNote':'1915–1945 행정구역의 해안선을 고정된 지도 바닥으로 사용. 선택 연도의 국경을 뜻하지 않음.'})
    data['islands']=[i for i in data['islands'] if i['id']!='dokdo-group']
    for island in data['islands']:
        island['label']=island['label'].split(' (')[0]
        if island['id']=='ulleungdo' and (island.get('lon') is None or island.get('lat') is None):
            ring=max(polygons,key=lambda p:area(p[0]))[0]
            island['lon']=(min(p[0] for p in ring)+max(p[0] for p in ring))/2
            island['lat']=(min(p[1] for p in ring)+max(p[1] for p in ring))/2
            island['coordinateBasis']='HGIS 본섬 해안선 범위의 가운데. 공식 측량점이 아닌 화면 이동용 중심.'
        point=[island['lon'],island['lat']]
        candidates=[p for p in polygons if contains(point,p[0])]
        if not candidates:
            candidates=[p for p in polygons if min(((v[0]-point[0])**2+(v[1]-point[1])**2)**.5 for v in p[0])<.015]
        assert candidates,(island['id'],'no stored coastline near cited island position')
        polygon=max(candidates,key=lambda p:area(p[0]))
        island['geometry']={'type':'Polygon','coordinates':polygon}
        island['displayNote']='해안선과 높이를 단순화한 지도입니다. 섬을 고르면 실제 위치로 이동합니다.'
        island['sourceIds']=list(dict.fromkeys([*island.get('sourceIds',[]),source_id]))
        island['accuracyNote']=island.get('coordinateBasis','위치: 인용 자료의 좌표.')+' 윤곽: HGIS 해안선의 표시용 단순화. 지형 높이는 화면 표현용이며 실측 높이가 아닙니다.'
    data['ridges']=[r for r in data['ridges'] if r.get('geometry') and len(r['geometry'].get('coordinates',[]))>=2]
    for ridge in data['ridges']:
        assert ridge['sourceIds'] and ridge['geometry']['type'] in ('LineString','MultiLineString')
        ridge['label']=ridge['label'].split(' (')[0]+(' · 남쪽 구간' if ridge['id']=='baekdudaegan' else '')
        ridge['displayNote']='자료에 나온 주요 봉우리를 이어 산줄기의 방향을 표시했습니다. 정확한 등산로나 산맥 경계가 아닙니다.' if ridge.get('basis')!='published geometry' else '공개 지도에 등록된 백두대간 남쪽 구간입니다. 산줄기의 높이와 굴곡은 화면에 맞춰 단순화했습니다.'
    saved=ROOT/'data/research/geography-97';saved.mkdir(parents=True,exist_ok=True)
    for name in ['run.json','run-initial.json','manifest.json','geography.json','progress.json','report.md']:
        if (args.research/name).exists():shutil.copyfile(args.research/name,saved/name)
    output=ROOT/'services/host/app/history-geography.json'
    output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'ridges':len(data['ridges']),'peaks':len(data['peaks']),'islands':len(data['islands']),'sources':len(data['sources'])}))

if __name__=='__main__':main()
