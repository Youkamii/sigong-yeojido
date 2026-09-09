"""Integrate four reviewed place references from the actual Opus #132 collection."""
import argparse,json,math,shutil
from copy import deepcopy
from hashlib import sha256
from pathlib import Path
from shapely.geometry import shape,Point
from shapely.ops import nearest_points
from import_pyongyang_identity import Text

p=argparse.ArgumentParser(description=__doc__);p.add_argument('--research',type=Path,required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[1];app=root/'services/host/app'
run=json.loads((a.research/'run.json').read_text(encoding='utf8'))
assert run.get('exitCode')==0 and not run['isError'] and run['modelsObserved']==['claude-opus-5'] and run['effort']=='max'
draft=json.loads((a.research/'positions.json').read_text(encoding='utf8'))
used={id for row in draft['locations'] for id in row['sourceIds']}
sources=[s for s in draft['sources'] if s['id'] in used]
manifest=json.loads((a.research/'manifest.json').read_text(encoding='utf8'))
for source in sources:
 raw=(a.research/source['rawFile']).read_bytes();digest=sha256(raw).hexdigest();assert digest==source['sha256']
 assert any(m.get('httpStatus')==200 and m.get('sha256')==digest and m.get('byteLength')==len(raw) for m in manifest)
 parser=Text();parser.feed(raw.decode('utf8'));views=[''.join(parser.parts),' '.join(''.join(parser.parts).split()),' '.join(' '.join(parser.parts).split())]
 assert sum(len(e['text'].split()) for e in source['excerpts'])<=25
 assert all(any(e['text'] in v for v in views) for e in source['excerpts']),source['id']

scenes=json.loads((app/'history-scenes.json').read_text(encoding='utf8'))
registry=json.loads((app/'history-coordinates.json').read_text(encoding='utf8'))
outline=json.loads((app/'korea-outline.json').read_text(encoding='utf8'));coast=shape(outline['geometry'])
accepted=[]
for original in draft['locations']:
 row=deepcopy(original);sid=row.get('sceneId','scene-jangmunpo-1594')
 if sid=='scene-jangmunpo-1594':
  existing=next((s for s in scenes['scenes'] if s['id']==sid),None)
  if existing is None:
   existing={'id':sid,'eventId':row['eventId'],'title':'장문포해전 — 이순신과 선거이의 참전 (1594)',
    'startYear':1594,'endYear':1594,'kind':'naval',
    'summary':'1594년 9월 선거이가 이순신과 함께 장문포 해전에 참전해 공을 세웠다. 전투 일람표에는 서로 다른 날짜의 장문포 항목이 있어 단일 교전일로 합치지 않는다.',
    'dateClaimIds':['claim-scenes-101-yi_naval-jm-year','claim-scenes-101-yi_naval-jm-datetext'],
    'actionClaimIds':['claim-scenes-101-yi_naval-jm-seon','claim-scenes-101-yi_naval-jm-yi'],
    'place':{'label':'장문포 해역','claimIds':['claim-scenes-101-yi_naval-jm-place']},
    'participants':[{'entityId':id,'role':role,'presence':'on-site','side':'naval','claimIds':['claim-scenes-101-yi_naval-jm-'+claim]} for id,role,claim in [
     ('person-encykorea-yi-sunsin','장문포 해전에 함께 참전한 수군 지휘관','yi'),('person-yinav-seon-geoi','이순신과 함께 참전해 공을 세운 장수','seon')]],
    'effects':{key:{'enabled':False,'claimIds':[]} for key in ['fire','ships','attack']},
    'researchJob':'remaining_positions','researchCollection':'place-references-132'}
   scenes['scenes'].append(existing)
 else:existing=next(s for s in scenes['scenes'] if s['id']==sid)
 place=existing['place']
 place.update({k:row[k] for k in ['lon','lat','medium','coordinateNote']})
 place['precision']='area';place['coordinateSourceIds']=row['sourceIds']
 point=Point(row['lon'],row['lat'])
 if row['medium']=='sea':
  display=point
  if coast.covers(point):
   shore=nearest_points(coast.boundary,point)[0]
   candidates=[Point(shore.x+math.cos(i*math.pi/16)*.008,shore.y+math.sin(i*math.pi/16)*.008) for i in range(32)]
   candidates=[c for c in candidates if not coast.covers(c) and c.distance(point)<.03]
   assert candidates,(sid,'No nearby sea display point')
   display=max(candidates,key=lambda p:p.distance(coast))
  place['displayCoordinates']=[display.x,display.y]
  place['displayBasis']='출처의 섬·왜성 기준점 가까운 바다에 설명용 장면을 배치했습니다. 원자료 좌표는 육상 기준점이며 이 표시점은 실제 함대 위치·교전 지점이 아닙니다.'
  place['displaySource']=outline['properties']['source']
 else:
  polygon=min(coast.geoms,key=lambda p:p.distance(point));assert polygon.distance(point)<.02
  if not polygon.covers(point):
   interior=polygon.buffer(-.0001);display=nearest_points(point,interior)[1] if not interior.is_empty else polygon.representative_point()
   place['displayCoordinates']=[display.x,display.y]
  if polygon.area<.1:
   b=polygon.bounds;merc=lambda lat:math.log(math.tan(math.pi/4+math.radians(lat)/2));scale=1600/(merc(43.5)-merc(33))
   place['displayScale']=max(.002,min(1,min(math.radians(b[2]-b[0])*scale,(merc(b[3])-merc(b[1]))*scale)/65))
  place['displayBasis']='청제비 부근에 청못 축조를 설명하는 장면입니다. 비석의 좌표이며 제방 전체나 공사 현장의 정확한 점은 아닙니다.' if 'cheongje' in sid else '사량도 전체의 기준점에 사량진 사건을 설명하는 장면입니다. 사량진성·진촌마을의 정확한 지점은 아닙니다.'
 if 'cheongje' in sid:
  existing['title']=existing['title'].replace(', 좌표 미확보','');existing['visualActions']={'constructionYears':[536]}
 reference={k:place[k] for k in ['lon','lat','medium','precision','coordinateNote','coordinateSourceIds','displayBasis']}
 reference['sourceIds']=reference.pop('coordinateSourceIds');reference.update(id='rc-place132-'+row['placeId'].removeprefix('place-'),label=place['label'],entityIds=[row['placeId']],aliases=[],anchorPlaceIds=[])
 registry['places']=[p for p in registry['places'] if p['id']!=reference['id']]+[reference]
 accepted.append({'sceneId':sid,'placeId':row['placeId'],'sourceCoordinates':[row['lon'],row['lat']], 'displayCoordinates':place.get('displayCoordinates',[row['lon'],row['lat']]),'precision':place['precision'],'displayBasis':place['displayBasis']})

for document in [registry,scenes]:
 by_id={s['id']:s for s in document['sources']}
 for source in sources:
  if source['id'] in by_id:assert by_id[source['id']]['url']==source['url']
  by_id[source['id']]={k:source[k] for k in ['id','title','publisher','url','license']}
 document['sources']=list(by_id.values())
 restored={r['placeId'] for r in accepted}
 document['missing']=[m for m in document.get('missing',[]) if m.get('placeId') not in restored]
registry['missing']=[m for m in registry['missing'] if m.get('researchJob')!='remaining_positions']+[{**m,'researchJob':'remaining_positions'} for m in draft['missing']]
for name,document in [('history-scenes.json',scenes),('history-coordinates.json',registry)]:
 (app/name).write_text(json.dumps(document,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
saved=root/'data/research/place-references-132';saved.mkdir(parents=True,exist_ok=True)
for name in ['run.json','manifest.json','positions.json','report.md']:shutil.copyfile(a.research/name,saved/name)
review={'model':run['modelsObserved'][0],'effort':run['effort'],'sessionId':run['sessionId'],'accepted':accepted,'missing':draft['missing'],
 'review':'All four are area references. Cheongje stele is not an exact reservoir point. Sea display positions are separately recorded, not source coordinates. Existing Jangmunpo claims establish the year and named joint participation.'}
(saved/'integration-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'accepted':len(accepted),'missing':len(draft['missing']),'scenes':len(scenes['scenes'])}))
