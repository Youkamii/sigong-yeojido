"""Keep narrative settings and literary record dates separate from historical events."""
import argparse,json,shutil
from copy import deepcopy
from hashlib import sha256
from pathlib import Path

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--research',type=Path,required=True)
p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
root=Path(__file__).resolve().parents[1]
for name in ['raw','run.json','manifest.json','report.md']:
    source=a.research/name
    if source.is_dir():shutil.copytree(source,a.out/name,dirs_exist_ok=True)
    elif source.exists():shutil.copyfile(source,a.out/name)
raw=(a.research/'result.json').read_bytes();d=json.loads(raw)
claims={c['id']:c for c in d['claims']}
scenes={s['narrativeId']:s for s in d['scenes']}
anchors={p['id']:p for p in json.loads((root/'services/host/app/history-place-anchors.json').read_text(encoding='utf8'))['places']}
labels=['구지봉 · 김해','개운포 · 울산','신라 왕경 · 경주','삼성혈 · 제주','낙화암 · 부여','온달산성 · 단양','성덕산 관음사 · 곡성','망부석 전승 · 정읍','아랑 전승 · 밀양']
ids=set()
for n,label in zip(d['narratives'],labels,strict=True):
    sid=claims[n['claimIds'][0]]['subject'];n['entityId']=sid;ids.add(sid)
    scene=scenes.get(n['id'])
    if scene:place=deepcopy(scene['place'])
    else:
        anchor=anchors[n['place']['anchorPlaceId']]['candidates'][0]
        place={**n['place'],'medium':'land','lon':anchor['lon'],'lat':anchor['lat'],
            'coordinateSourceIds':['src-existing-anchors-hgis'],'claimIds':[c['id'] for c in d['claims'] if c['subject']==sid and c['predicate']=='syj:tookPlaceAt']}
    place.update(label=label,placementType='tradition-setting',precision='area',
        displayBasis='전승이 무대로 삼는 지역의 참조점입니다. 정확한 전승지 좌표나 문헌을 쓴 장소가 아니며, 선택한 연도에 이 이야기가 실제로 일어났다는 뜻도 아닙니다.')
    n['place']=place
    n['claimIds']=list(dict.fromkeys(n['claimIds']+n['storyTime']['claimIds']+n['recordingTime']['claimIds']))
    if n['id']=='nar-syj136-ondal':
        n['recordingTime']['label']='이 지역 전설의 기록 시기 미상. 관련 온달 기사를 실은 『삼국사기』는 1145년경 편찬되었다.'
        n['recordingTime']['known']=False
    elif n['id']=='nar-syj136-arang':n['recordingTime'].update(label='채록·간행 시기 미상',known=False)
    else:n['recordingTime']['known']=True
    if n['id']=='nar-syj136-seodong':n['storyTime']['label']='백제 무왕의 소년 시절로 이야기되는 때 · 연도 미상'
    if scene:
        scene['kind']='tradition';scene['place']=deepcopy(place)
        scene['storyTime']=deepcopy(n['storyTime']);scene['recordingTime']=deepcopy(n['recordingTime'])
        scene['integrationNote']='문헌의 편찬·간행 시기에 연결한 전승 소개다. 최초 채록 연도나 이야기 속 사건의 연도를 확정하지 않는다.'
for e in d['entities']:
    if e['id'] in ids:e['type']='Narrative'
for c in d['claims']:
    if c['subject'] not in ids:continue
    c['predicate']={'syj:tookPlaceAt':'syj:hasSetting','syj:hasParticipant':'syj:hasCharacter'}.get(c['predicate'],c['predicate'])
    c['note']=c.get('note','')+' 전승의 내용·무대·등장인물을 연결한 Claim이며 실제 사건이나 현장 출석의 확인이 아니다.'
# A related Ondal article does not date the modern place-name legend.
d['scenes']=[s for s in d['scenes'] if s['narrativeId']!='nar-syj136-ondal']
d['integrationReview']={'reviewer':'Codex','originalResultSha256':sha256(raw).hexdigest(),
    'notes':['Nine Narrative entities, hasSetting and hasCharacter retain story scope.',
             'Seven timeline entries refer to related document dates, not occurrence or first recording.',
             'Ondal and Arang recording dates remain unknown; both remain available in the story layer.']}
(a.out/'result.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

def normalize(value):
    if isinstance(value,list):return [normalize(v) for v in value]
    if not isinstance(value,dict):return value
    return {k:['claim-scenes-136-oral_traditions-'+v.removeprefix('claim-') for v in vs] if k=='claimIds' else normalize(vs) for k,vs in value.items()}
packet={'narratives':normalize(d['narratives']),
        'sources':[{k:s[k] for k in ['id','title','publisher','url']} for s in d['sources']],
        'note':'설화·전승의 무대는 연도별 실제 사건과 구분하여 표시합니다.'}
(root/'services/host/app/history-traditions.json').write_text(json.dumps(packet,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'narratives':len(ids),'datedIntroductions':len(d['scenes']),'claims':len(d['claims'])}))
