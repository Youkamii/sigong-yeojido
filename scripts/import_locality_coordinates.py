"""Merge the four reviewed #128 location links from the completed Opus job."""
import argparse
from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path
import shutil
from import_pyongyang_identity import Text

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--research',type=Path,required=True)
p.add_argument('--check-only',action='store_true')
a=p.parse_args()
root=Path(__file__).resolve().parents[1]
run=json.loads((a.research/'run.json').read_text(encoding='utf8'))
assert run.get('exitCode')==0 and not run['isError'] and run['modelsObserved']==['claude-opus-5'] and run['effort']=='max'
original=json.loads((a.research/'positions.json').read_text(encoding='utf8'))
draft=deepcopy(original)
accepted={
 'place-encykorea-gobu':('rc-gobu-myeon','고부 지역 (현재 고부면의 대표점 참고)'),
 'place-encykorea-namyeongdong':('rc-namyeongdong-daegongbunsil','남영동 대공분실'),
 'place-shanghai':('rc-shanghai-city','상하이'),
 'place-encykorea-shanghai-hongkou-park':('rc-shanghai-hongkou-park','상하이 훙커우공원'),
}
rejected={
 'place-encykorea-gungjeongdong':'청운효자동 전체의 좌표를 궁정동의 좌표로 사용하지 않는다.',
 'place-yinav-jangmunpo':'같은 장목리에 있다는 사실만으로 장목항 좌표를 장문포 해역과 연결하지 않는다.',
}
draft['missing'].extend({'eventId':row['eventId'],'placeId':row['placeId'],'reason':rejected[row['placeId']]} for row in draft['locations'] if row['placeId'] in rejected)
draft['locations']=[row for row in draft['locations'] if row['placeId'] in accepted]
used={sid for row in draft['locations'] for sid in row['sourceIds']}
draft['sources']=[source for source in draft['sources'] if source['id'] in used]
for source in draft['sources']:
 for excerpt in source['excerpts']:
  if excerpt['id']=='ex-kowiki-namyeong-lede':
   excerpt['text']=excerpt['text'].removesuffix(' 2005년까지 보안분실로 사용되었다가')
manifest=json.loads((a.research/'manifest.json').read_text(encoding='utf8'))
for source in draft['sources']:
 raw=(a.research/source['rawFile']).read_bytes();digest=sha256(raw).hexdigest()
 assert digest==source['sha256']
 assert any(row.get('sha256')==digest and row.get('byteLength')==len(raw) and row.get('httpStatus')==200 for row in manifest)
 parser=Text();parser.feed(raw.decode('utf8'))
 views=[''.join(parser.parts),' '.join(''.join(parser.parts).split()),' '.join(' '.join(parser.parts).split())]
 assert sum(len(e['text'].split()) for e in source['excerpts'])<=25,source['id']
 assert all(any(e['text'] in view for view in views) for e in source['excerpts']),source['id']
path=root/'services/host/app/history-coordinates.json'
registry=json.loads(path.read_text(encoding='utf8'))
sources={s['id']:s for s in registry['sources']}
places={row['id']:row for row in registry['places']}
for source in draft['sources']:
 if source['id'] in sources:assert sources[source['id']]['url']==source['url']
 sources[source['id']]={key:source[key] for key in ['id','title','publisher','url','license']}
for row in draft['locations']:
 id,label=accepted[row['placeId']]
 places[id]={key:row[key] for key in ['lon','lat','precision','medium','sourceIds','coordinateNote']}
 places[id].update(id=id,label=label,aliases=[],anchorPlaceIds=[],entityIds=[row['placeId']])
registry.update(sources=list(sources.values()),places=list(places.values()))
registry['missing']=[m for m in registry.get('missing',[]) if m.get('researchJob')!='missing_positions']
registry['missing'].extend({**m,'researchJob':'missing_positions'} for m in draft['missing'])
report={'model':run['modelsObserved'][0],'effort':run['effort'],'sessionId':run['sessionId'],
 'accepted':list(accepted),'sources':len(draft['sources']),'missing':draft['missing'],
 'review':'Codex checked existing entity identities, coordinates and stored quotations. Candidate sites in other areas are excluded.'}
if not a.check_only:
 path.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 saved=root/'data/research/scenes-128/missing_positions';saved.mkdir(parents=True,exist_ok=True)
 for name in ['run.json','manifest.json']:
  shutil.copyfile(a.research/name,saved/name)
 (saved/'positions.json').write_text(json.dumps(draft,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 (saved/'integration-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 (root/'docs/research/locality-coordinates-128.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'accepted':len(accepted),'sources':len(draft['sources']),'missing':len(draft['missing']),'checkOnly':a.check_only}))
