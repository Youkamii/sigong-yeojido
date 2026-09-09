"""Apply the integration review to completed #135 research, preserving originals."""
import argparse, json, shutil
from hashlib import sha256
from pathlib import Path

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--research',type=Path,required=True)
p.add_argument('--out',type=Path,required=True)
a=p.parse_args()
root=Path(__file__).resolve().parents[1]
geography=json.loads((root/'services/host/app/history-geography.json').read_text(encoding='utf8'))

for job in ['forts_settlements','local_conflicts']:
    source=a.research/job; target=a.out/job
    target.mkdir(parents=True,exist_ok=True)
    for name in ['raw','run.json','manifest.json','report.md']:
        path=source/name
        if path.is_dir():shutil.copytree(path,target/name,dirs_exist_ok=True)
        elif path.exists():shutil.copyfile(path,target/name)
    raw=(source/'result.json').read_bytes(); d=json.loads(raw)
    notes=[]
    for scene in d['scenes']:
        sid=scene['id']; place=scene['place']
        if job=='forts_settlements':
            place['displayBasis']='유적의 참조점에 놓은 설명용 장면입니다. 성벽·집자리의 실제 윤곽이나 배치를 복원한 것은 아닙니다.'
            if scene['kind']=='settlement':
                scene['kind']='excavation'
                scene['integrationNote']='현대 발굴 조사 시기이며 선사 취락의 거주 연도가 아니다. 조사 구역과 작업 도구로 표현한다.'
            elif scene['kind'] in ['construction','court']:
                scene['visualActions']={'fortress':True,'construction':scene['kind']=='construction'}
            if 'bidam-647' in sid:
                scene['effects']['attack']={'enabled':False,'claimIds':[]}
                scene['visualActions']={'fortress':True,'occupation':True}
                scene['integrationNote']='점거 기록만으로 공성 공격 동작을 추가하지 않는다.'
        else:
            place['displayBasis']='사료에 적힌 지역의 기준점에 놓은 설명용 장면입니다. 군·고을의 참조 위치이며 정확한 성터나 전장 배치가 아닙니다.'
            if 'daeyaseong' in sid:
                scene['kind']='siege'
                scene['visualActions']={'fireTargets':['rural_store']}
                scene['integrationNote']='성 안 창고의 화재만 표현한다. 전체 마을 화재로 확대하지 않는다.'
            if 'baekjeok' in sid:
                scene['effects']['attack']={'enabled':False,'claimIds':[]}
                scene['integrationNote']='담양 봉기에 나주에서 벌어진 공격 동작을 옮기지 않는다.'
            if 'gongsan' in sid:
                peak=next(row for row in geography['peaks'] if row['label']=='팔공산')
                place.update(lon=peak['lon'],lat=peak['lat'],coordinateSourceIds=peak['sourceIds'],
                    displayBasis='기존에 확인한 팔공산 참조점에 공산전투를 설명하는 장면을 놓았습니다. 산 정상에서 싸웠다는 뜻이 아니며 정확한 전장 위치는 미상입니다.')
                place.pop('anchorPlaceId',None)
            if 'sherman' in sid:
                place.update(lon=None,lat=None,coordinateSourceIds=[],displayBasis='평양 대동강의 사건 기록입니다. 수집한 고을 중심점은 강의 위치가 아니므로 지도의 점을 확정하지 않았습니다.')
                place.pop('anchorPlaceId',None)
                scene['integrationNote']='배를 평양의 육지 중심점에 놓지 않는다. 사건과 인물·원문은 연표에서 탐색할 수 있다.'
        if scene.get('integrationNote'):notes.append({'sceneId':sid,'reason':scene['integrationNote']})
    if job=='forts_settlements':
        claim=next(c for c in d['claims'] if c['id']=='claim-syj135-gochang-dispute')
        claim['object']['value']='단종 1년(1453) 축조설과 숙종 때 축조설이 함께 전한다.'
        claim['note']=claim.get('note','')+' 인용문이 직접 밝힌 두 견해로 문장을 한정했다. 1393년 견해는 항목 본문을 설명하는 장면 요약에 남긴다.'
        for e in d['entities']:
            if e['id'] in ['syj135-polity-gungnip-jungang-bakmulgwan','syj135-polity-busan-univ-museum']:e['type']='Organization'
    for claim in d['claims']:
        if claim['predicate']=='syj:occurredIn' and claim['object']['kind']=='literal':
            claim['predicate']='syj:describedAs'
            claim['note']=claim.get('note','')+' 월일 원문이다. 연도는 별도 occurredIn 근거에 따르며 이 문구를 숫자 날짜로 바꾸지 않는다.'
    d['integrationReview']={'originalResultSha256':sha256(raw).hexdigest(),'reviewer':'Codex','notes':notes,
        'coordinateReview':'Named sites use source reference points; administrative areas are labelled display assumptions. Unlocated sea/river events remain in the timeline.'}
    (target/'result.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(job,len(d['scenes']),len(d['claims']))
