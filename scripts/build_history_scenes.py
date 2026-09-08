"""Build event compositions from completed, imported Opus research packets."""
import argparse
from copy import deepcopy
from hashlib import sha256
import json
import math
from pathlib import Path
from shapely.geometry import shape,Point
from shapely.ops import nearest_points
from import_period_research import ENTITY_ID_ALIASES,source_id_aliases

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--research',type=Path,required=True)
parser.add_argument('--collection',default='scenes-101')
parser.add_argument('--job',action='append',help='Completed job names; defaults to the original naval and invasion collection')
parser.add_argument('--merge',action='store_true',help='Keep existing scenes and replace only matching scene IDs')
parser.add_argument('--out',type=Path,default=root/'services/host/app/history-scenes.json')
args=parser.parse_args()
scenes=[];sources={};missing=[]
if args.merge:
    previous=json.loads(args.out.read_text(encoding='utf-8'))
    scenes=previous['scenes'];sources={s['id']:s for s in previous['sources']};missing=previous.get('missing',[])
for job in args.job or ['invasion_events','yi_naval']:
    folder=args.research/job
    run=json.loads((folder/'run.json').read_text(encoding='utf-8'))
    assert run.get('exitCode')==0 and not run['isError'] and run['modelsObserved']==['claude-opus-5'] and run['effort']=='max'
    result=json.loads((folder/'result.json').read_text(encoding='utf-8'))
    source_aliases=source_id_aliases(result,root/'data',args.collection,job)
    claims={c['id']:c for c in result['claims']}
    prefix=args.collection.replace('periods-','period')
    ids=lambda values:['claim-'+prefix+'-'+job+'-'+value.removeprefix('claim-') for value in values]
    for source in result['sources']:
        assert sha256((folder/source['rawFile']).read_bytes()).hexdigest()==source['sha256']
        sid=source_aliases.get(source['id'],source['id'])
        sources[sid]={**{k:source[k] for k in ['id','title','publisher','url']},'id':sid}
    for original in result['scenes']:
        scene=deepcopy(original)
        scene['eventId']=ENTITY_ID_ALIASES.get(scene['eventId'],scene['eventId'])
        for key in ['dateClaimIds','actionClaimIds']:
            assert scene[key] and all(c in claims for c in scene[key]),(scene['id'],key)
            scene[key]=ids(scene[key])
        if scene.get('relatedClaimIds'):
            assert all(c in claims for c in scene['relatedClaimIds'])
            scene['relatedClaimIds']=ids(scene['relatedClaimIds'])
        assert scene['startYear']<=scene['endYear']
        place=scene.get('place')
        if place:
            assert all(c in claims for c in place['claimIds'])
            if not place['claimIds']:
                if place.get('lon') is not None:
                    # These reviewed court episodes explicitly use a capital-context assumption.
                    assert job=='joseon_early_scenes' and scene['id'] in (
                        'scene-je-hunminjeongeum-changje-1443','scene-je-hunminjeongeum-haerye-1446',
                        'scene-je-gyeongguk-daejeon-1485','scene-je-muo-sahwa-1498','scene-je-gimyo-sahwa-1519')
                    place['placementType']='context-region'
                    place['displayBasis']='조정의 활동을 도읍에 놓은 지역 기준 추정 배치입니다. 이 사건의 실제 장소를 밝힌 기록은 없으며, 관련 인물의 현장 출석을 뜻하지 않습니다.'
                else:
                    assert place.get('lat') is None and not place.get('featureId') and not place.get('anchorPlaceId')
            activity_places=[c for c in place['claimIds'] if claims[c]['predicate'] in ('syj:tookPlaceAt','syj:occurredAt') and claims[c]['subject']==original['eventId']]
            if activity_places:
                place['coordinateClaimIds']=ids([c for c in place['claimIds'] if c not in activity_places])
                place['claimIds']=activity_places
            place['claimIds']=ids(place['claimIds'])
            place['coordinateSourceIds']=[source_aliases.get(s,s) for s in place.get('coordinateSourceIds',[])]
            if place.get('coordinateClaimIds'):
                scene['actionClaimIds']=[c for c in scene['actionClaimIds'] if c not in place['coordinateClaimIds']]
            # A land administrative center cannot locate a named sea battle.
            if (place['medium']=='sea' or scene['id']=='scene-gohado-jin-1597') and place.get('lon') is None:
                place.pop('anchorPlaceId',None)
        for actor in scene['participants']:
            actor['entityId']=ENTITY_ID_ALIASES.get(actor['entityId'],actor['entityId'])
            assert actor['claimIds'] and all(c in claims for c in actor['claimIds'])
            actor['claimIds']=ids(actor['claimIds'])
            if scene['id']=='scene-anc-gibeolpo-676' and actor['entityId'] in ('person-encykorea-seorinwi','polity-encykorea-dang'):
                actor['side']='invader'
            if actor['entityId']=='polity-imjin-fortress-people':
                actor['entityId']='polity-residents-'+scene['eventId'].removeprefix('event-')
            if args.collection=='scenes-101' and scene['id']=='scene-danghangpo-2-1594' and actor['entityId']=='person-yinav-eo-yeongdam':
                actor['presence']='related'
        for effect in scene['effects'].values():
            assert not effect['enabled'] or effect['claimIds']
            assert all(c in claims for c in effect['claimIds'])
            effect['claimIds']=ids(effect['claimIds'])
        if args.collection=='scenes-101' and scene['id']=='scene-myeongnyang-1597':
            scene['effects']['fire']['enabled']=False
            scene['integrationNote']='불화살 사용 근거를 선박 화재로 표현하지 않는다. 해당 활동은 본문 근거로 유지한다.'
        scene['researchJob']=job
        scene['researchCollection']=args.collection
        scenes=[s for s in scenes if s['id']!=scene['id']]
        scenes.append(scene)
    missing=[m for m in missing if m.get('job')!=job]
    missing.extend({'job':job,'collection':args.collection,'detail':item} for item in result.get('missing',[]))

position_folder=args.research/'naval_positions'
if args.collection=='scenes-101' and (position_folder/'run.json').exists():
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
        missing=[m for m in missing if m.get('job')!='naval_positions']
        missing.extend({'job':'naval_positions','detail':item} for item in result.get('missing',[]))

outline=json.loads((root/'services/host/app/korea-outline.json').read_text(encoding='utf-8'))
coast=shape(outline['geometry'])
for scene in scenes:
    if scene['id']=='scene-myeongnyang-1597':
        scene['sides']=[{'side':'invader','label':'일본 수군','claimIds':['claim-scenes-101-yi_naval-my-ships-enemy']}]
    place=scene.get('place')
    if place and place['medium']=='sea' and place['precision']=='area' and place.get('lon') is not None:
        point=Point(place['lon'],place['lat'])
        if coast.covers(point):
            shore=nearest_points(coast.boundary,point)[0]
            candidates=[Point(shore.x+math.cos(i*math.pi/16)*.008,shore.y+math.sin(i*math.pi/16)*.008) for i in range(32)]
            candidates=[p for p in candidates if not coast.covers(p) and p.distance(point)<.03]
            if candidates:
                display=max(candidates,key=lambda p:p.distance(coast))
                place['displayCoordinates']=[display.x,display.y]
                place['displayBasis']='원자료의 섬·해안 지역점 가까운 바다에 설명용 장면을 배치. HGIS 해안 윤곽에서 바다로 확인한 표시점이며 실제 함대 위치나 상륙 경로가 아닙니다.'
                place['displaySource']=outline['properties']['source']
    if not place or place['medium']!='land' or place['precision']!='area' or place.get('lon') is None:continue
    point=Point(place['lon'],place['lat'])
    polygon=min(coast.geoms,key=lambda p:p.distance(point))
    if polygon.distance(point)>.01 or polygon.area>.1:continue
    center=point if polygon.covers(point) else polygon.representative_point()
    place['displayCoordinates']=[center.x,center.y]
    b=polygon.bounds
    merc=lambda lat:math.log(math.tan(math.pi/4+math.radians(lat)/2))
    world_scale=1600/(merc(43.5)-merc(33))
    width=math.radians(b[2]-b[0])*world_scale;height=(merc(b[3])-merc(b[1]))*world_scale
    place['displayScale']=max(.1,min(1,min(width,height)/65))
    place['displayBasis']='원자료의 지역점에 설명용 장면을 배치하며 모형의 간격·수량은 실제 배치가 아닙니다.' if polygon.covers(point) else '지명 자료의 섬 대표 좌표 가까이에 있는 HGIS 해안 윤곽 안에 설명용 장면을 배치. 원문의 좌표는 보존하며 본영 건물의 실측 위치를 뜻하지 않음.'
    place['displaySource']=outline['properties']['source']

output={'scenes':scenes,'sources':list(sources.values()),'missing':missing,
        'renderingNote':'해당 연도에 있었던 사건을 각각 표현합니다. 모형의 간격·수량은 실제 진형이나 병력 수가 아닙니다.'}
args.out.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'scenes':len(scenes),'sources':len(sources),'missing':len(missing)},ensure_ascii=False))
