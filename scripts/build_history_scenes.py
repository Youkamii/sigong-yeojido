"""Build event compositions from completed, imported Opus research packets."""
import argparse
from copy import deepcopy
from hashlib import sha256
import json
import math
from pathlib import Path
from shapely.geometry import shape,Point

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--research',type=Path,required=True)
args=parser.parse_args()
scenes=[];sources={};missing=[]
for job in ['invasion_events','yi_naval']:
    folder=args.research/job
    run=json.loads((folder/'run.json').read_text(encoding='utf-8'))
    assert run.get('exitCode')==0 and not run['isError'] and run['modelsObserved']==['claude-opus-5'] and run['effort']=='max'
    result=json.loads((folder/'result.json').read_text(encoding='utf-8'))
    claims={c['id']:c for c in result['claims']}
    ids=lambda values:['claim-scenes-101-'+job+'-'+value.removeprefix('claim-') for value in values]
    for source in result['sources']:
        assert sha256((folder/source['rawFile']).read_bytes()).hexdigest()==source['sha256']
        sources[source['id']]={k:source[k] for k in ['id','title','publisher','url']}
    for original in result['scenes']:
        scene=deepcopy(original)
        for key in ['dateClaimIds','actionClaimIds']:
            assert scene[key] and all(c in claims for c in scene[key]),(scene['id'],key)
            scene[key]=ids(scene[key])
        assert scene['startYear']<=scene['endYear']
        place=scene.get('place')
        if place:
            assert place['claimIds'] and all(c in claims for c in place['claimIds'])
            place['claimIds']=ids(place['claimIds'])
            # A land administrative center cannot locate a named sea battle.
            if (place['medium']=='sea' or scene['id']=='scene-gohado-jin-1597') and place.get('lon') is None:
                place.pop('anchorPlaceId',None)
        for actor in scene['participants']:
            assert actor['claimIds'] and all(c in claims for c in actor['claimIds'])
            actor['claimIds']=ids(actor['claimIds'])
            if actor['entityId']=='polity-imjin-fortress-people':
                actor['entityId']='polity-residents-'+scene['eventId'].removeprefix('event-')
            if scene['id']=='scene-danghangpo-2-1594' and actor['entityId']=='person-yinav-eo-yeongdam':
                actor['presence']='related'
        for effect in scene['effects'].values():
            assert not effect['enabled'] or effect['claimIds']
            assert all(c in claims for c in effect['claimIds'])
            effect['claimIds']=ids(effect['claimIds'])
        if scene['id']=='scene-myeongnyang-1597':
            scene['effects']['fire']['enabled']=False
            scene['integrationNote']='불화살 사용 근거를 선박 화재로 표현하지 않는다. 해당 활동은 본문 근거로 유지한다.'
        scene['researchJob']=job
        scenes.append(scene)
    missing.extend({'job':job,'detail':item} for item in result.get('missing',[]))

position_folder=args.research/'naval_positions'
if (position_folder/'run.json').exists():
    run=json.loads((position_folder/'run.json').read_text(encoding='utf-8'))
    if run.get('exitCode')==0 and not run.get('isError'):
        assert run['modelsObserved']==['claude-opus-5'] and run['effort']=='max'
        result=json.loads((position_folder/'positions.json').read_text(encoding='utf-8'))
        for source in result['sources']:
            assert sha256((position_folder/source['rawFile']).read_bytes()).hexdigest()==source['sha256']
            sources[source['id']]={k:source[k] for k in ['id','title','publisher','url']}
        for position in result['positions']:
            scene=next(s for s in scenes if s['id']==position['sceneId'])
            assert position['coordinateSourceIds'] and all(s in sources for s in position['coordinateSourceIds'])
            scene['place'].update({k:position[k] for k in ['lon','lat','precision','coordinateSourceIds','coordinateNote']})
            if position.get('geometry'):scene['place']['geometry']=position['geometry']
        missing.extend({'job':'naval_positions','detail':item} for item in result.get('missing',[]))

outline=json.loads((root/'services/host/app/korea-outline.json').read_text(encoding='utf-8'))
coast=shape(outline['geometry'])
for scene in scenes:
    place=scene.get('place')
    if not place or place['medium']!='land' or place['precision']!='area' or place.get('lon') is None:continue
    point=Point(place['lon'],place['lat'])
    polygon=min(coast.geoms,key=lambda p:p.distance(point))
    if polygon.distance(point)>.01 or polygon.area>.1:continue
    center=polygon.representative_point()
    place['displayCoordinates']=[center.x,center.y]
    b=polygon.bounds
    merc=lambda lat:math.log(math.tan(math.pi/4+math.radians(lat)/2))
    world_scale=1600/(merc(43.5)-merc(33))
    width=math.radians(b[2]-b[0])*world_scale;height=(merc(b[3])-merc(b[1]))*world_scale
    place['displayScale']=max(.1,min(1,min(width,height)/65))
    place['displayBasis']='지명 자료의 섬 대표 좌표 가까이에 있는 HGIS 해안 윤곽 안에 설명용 장면을 배치. 원문의 좌표는 보존하며 본영 건물의 실측 위치를 뜻하지 않음.'
    place['displaySource']=outline['properties']['source']

output={'scenes':scenes,'sources':list(sources.values()),'missing':missing,
        'renderingNote':'해당 연도에 있었던 사건을 각각 표현합니다. 모형의 간격·수량은 실제 진형이나 병력 수가 아닙니다.'}
(root/'services/host/app/history-scenes.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'scenes':len(scenes),'sources':len(sources),'missing':len(missing)},ensure_ascii=False))
