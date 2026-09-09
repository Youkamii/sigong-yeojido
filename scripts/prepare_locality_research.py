"""Keep actual Opus output unchanged and apply the recorded #128 source review to copies."""
import argparse,copy,json,re,shutil
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--research',type=Path,required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--job',action='append',required=True);a=p.parse_args()
for job in a.job:
 source=a.research/job;run=json.loads((source/'run.json').read_text(encoding='utf8'))
 assert run.get('exitCode')==0 and not run['isError'] and run['modelsObserved']==['claude-opus-5']
 folder=a.out/job;shutil.copytree(source,folder,dirs_exist_ok=True)
 draft=json.loads((source/'result.json').read_text(encoding='utf8'));original=copy.deepcopy(draft);notes=[]
 def scene(id):return next(s for s in draft['scenes'] if s['id']==id)
 def claim(id):return next(c for c in draft['claims'] if c['id']==id)
 def bound(actor,start,end):
  actor.update(startYear=start,endYear=end)
  for cid in actor['claimIds']:
   c=claim(cid)
   if c['predicate'] in ['syj:hasParticipant','syj:participatedIn','syj:ledBy']:c.update(validFrom=start,validTo=end)
 if job=='ancient_settlements':
  for cid,sid,dates,title in [
   ('claim-syj128-ns-time','scene-syj128-pohang-naengsuri-503',['claim-syj128-ns-year'],'냉수리 재물 결정과 신라비 — 503년 설로 표시 · 443년 설도 있음'),
   ('claim-syj128-oj-time','scene-syj128-daegu-ojak',['claim-syj128-oj-year','claim-syj128-oj-inscr-date'],'영동리촌 저수지 축조와 오작비 — 518년 설 · 578년 설도 있음')]:
   c=claim(cid);c['object']={'kind':'literal','value':c['object']['verbatim']};c['predicate']='syj:describedAs'
   s=scene(sid);s['dateClaimIds']=dates;s['title']=title;s['actionClaimIds'].append(cid)
  notes.append('냉수리443년·503년과 오작비518년·578년은 대안 연대다. 중간 해에 계속된 사건으로 표시하지 않고 대표 후보와 다른 설을 함께 표시.')
  for sid,cid,basis in [
   ('scene-syj128-pohang-naengsuri-503','claim-syj128-ns-place','비석 발견 지역을 참고한 배치 · 원래 위치 미상'),
   ('scene-syj128-daegu-ojak','claim-syj128-oj-place','오가 대구에 있었다는 설에 따른 지역 배치')]:
   s=scene(sid);claim(cid)['predicate']='syj:relatedTo';s['place'].update(displayBasis=basis,placementType='reference-region')
   for actor in s['participants']:actor['presence']='related'
  notes.append('발견지와 조건부 비정은 사건의 확정 현장과 구분하고 지도 설명에도 배치 근거를 표시.')
 if job=='middle_kingdoms':
  for actor in scene('scene-syj128-haeinsa-802')['participants']:
   if actor['entityId']=='person-syj128-ijeong':actor['presence']='related'
  for sid,cid,basis in [
   ('scene-syj128-borimsa-birojana-858','claim-syj128-borimsa-place','현존 불상 소재 지역을 참고한 배치 · 주성 장소 미상'),
   ('scene-syj128-tamna-mallo-938','claim-syj128-tamna-place','탐라 지역 기준 배치 · 사신 출발지 미상')]:
   s=scene(sid);claim(cid)['predicate']='syj:relatedTo';s['place'].update(displayBasis=basis,placementType='reference-region')
   for actor in s['participants']:actor['presence']='related'
  notes.append('해인사 이정의 완성 연도는 미상. 현재 불상 소재지와 사절 파견 국가를 사건의 확정 현장으로 바꾸지 않는다.')
 if job=='late_goryeo':
  s=scene('scene-lg128-jowichong-seogyeong-1174')
  for actor in s['participants']:bound(actor,1174 if actor['entityId']=='person-lg128-jo-wichong' else 1176,1174 if actor['entityId']=='person-lg128-jo-wichong' else 1176)
  s['effects']['attack'].update(startYear=1176,endYear=1176)
  notes.append('서경 거병 인물은1174년, 통양문·대동문 공격자와 공격 효과는1176년으로 한정.')
  s=scene('scene-lg128-jukjuseong-1236');s['effects']['fire']['enabled']=False
  notes.append('죽주성의 불탄 대상은 철수하는 몽골군 공성 기구다. 성·가옥을 태우는 일반 화재 효과는 제외.')
  s=scene('scene-lg128-jewangungi-samcheok-1287');s['place']=None;s['title']='『제왕운기』 출간 (1287)';s['participants']=[{**actor,'presence':'related'} for actor in s['participants']]
  claim('claim-lg128-jwu-place')['predicate']='syj:relatedTo'
  notes.append('1287년 출간일과 삼척의 저술 장소를 출간 현장으로 결합하지 않는다. 출간 기록은 연표에 유지하고 현장 좌표·출석 배치는 제외.')
 if job=='later_joseon':
  s=scene('scene-syj128-jeonju-sillok-naejangsan-1592')
  for actor in s['participants']:
   if actor['entityId'] in ['person-syj128-yu-sin','person-syj128-an-ui']:actor['presence']='related'
  notes.append('전주사고 실록 이안의 공로만 확인된 유신·안의는 직접 운반 현장 인물로 확정하지 않는다.')
  s=scene('scene-syj128-junggang-gaesi-1646')
  for actor in s['participants']:
   actor['presence']='related'
   for cid in actor['claimIds']:
    c=claim(cid)
    if c['predicate']=='syj:hasParticipant':c['predicate']='syj:relatedTo'
  notes.append('중강개시 상인232명의 활동 연도는 원문에 없어1646년 현장 출석으로 표시하지 않는다.')
  s=scene('scene-syj128-kim-mandeok-jeju-1795');s['effects']['ships']['enabled']=False
  notes.append('김만덕 구휼 장소에 별도 구휼선 난파를 합치지 않는다. 포구·난파 위치 미상으로 배 효과 제외.')
 if job=='early_joseon':
  for source in draft['sources']:
   for excerpt in source['excerpts']:
    if excerpt['id']=='ex-ej-bg-survey':excerpt['text']='1415년 8월 '+excerpt['text']
  s=scene('scene-ej-byeokgolje-1415');s['visualActions']={'constructionYears':[1415]}
  for actor in s['participants']:
   if actor['entityId']=='person-ej-bak-seup':actor['role']='1415년 8월 수축할 곳을 직접 살펴보고 건의'
  notes.append('벽골제는1415년8월 답사와10월 착공이 같은 해임을 원문에서 확인.1415년 공사 모형을 연결하고1416년 완공 추정은 추가하지 않음.')
  s=scene('scene-ej-saryangjin-waebyeon-1544');s['place'].update(lon=None,lat=None,coordinateSourceIds=[]);s['place'].pop('anchorPlaceId',None)
  s['place']['coordinateNote']='사량진의 좌표 미확보. 기존 통영 행정구역 중심점은 서쪽 바다의 사량진을 나타내지 않아 사용하지 않는다.'
  notes.append('섬의 사량진을 통영 행정구역 중심에 배치하던 잘못된 좌표 제거. 장소와 사건 기록은 보존.')
  for s in draft['scenes']:
   if s.get('place'):
    s['place']['label']=re.sub(r'\s*\([^)]*(?:강원도|경상남도|전라남도)[^)]*\)','',s['place']['label'])
    if s['place']['precision']=='site':s['place']['precision']='area'
 if job=='modern_localities':
  s=scene('scene-mod128-joseoneohakhoe-1942');s['actionClaimIds'].remove('claim-mod128-joseo-action')
  s['place']['claimIds']=['claim-mod128-joseo-place']
  claim('claim-mod128-joseo-action')['note']+=' 재판은1944~1945년 함흥이다.1942년 홍원 압송·취조 장면의 행동 근거로 합치지 않는다.'
  s=scene('scene-mod128-sorokdo-jahyeuiwon-1916');s['visualActions']='소록도에 병원이 문을 여는 장면. 출처의100여 명은 수용 정원이며 실제 환자 인원이나 건물 수·배치를 뜻하지 않는다.'
  notes.append('조선어학회 재판과1942년 홍원 취조를 분리. 소록도 수용 정원을 실제 수용 인원으로 바꾸지 않음.')
  notes.append('홍원 취조 서술은 행동 근거에만 연결해 장소 좌표의 참고 설명으로 분류·제거되지 않게 함.')
 excerpts={e['id']:e['text'] for source in draft['sources'] for e in source['excerpts']}
 for c in draft['claims']:
  obj=c['object']
  if obj['kind']!='time':continue
  quote=excerpts[c['citesExcerpt']]
  if all(str(obj[k]) in quote for k in ['earliest','latest']):
   if obj['verbatim'] not in quote:obj['verbatim']=quote
   continue
  years=[obj[k] for k in ['earliest','latest'] if str(obj[k]) in quote]
  if years and c['predicate']!='syj:describedAs':c['object']={'kind':'year','value':years[-1]}
  else:
   c['object']={'kind':'literal','value':quote};c['predicate']='syj:describedAs'
   for s in draft['scenes']:
    if c['id'] in s['dateClaimIds']:
     s['dateClaimIds'].remove(c['id'])
     if c['id'] not in s['actionClaimIds']:s['actionClaimIds'].append(c['id'])
  c['note']=c.get('note','')+' 원문 대조: 발췌에 없는 날짜 범위는 제거하고 실제 날짜 또는 서술만 남겼다. 장면의 검토된 기간은 별도 시작·끝 날짜 근거를 따른다.'
 notes.append('발췌를 이어 만든 time.verbatim은 원문에 실제 있는 날짜·서술로 정리.')
 for s in draft['scenes']:
  place=s.get('place')
  if not place:continue
  if place.get('anchorPlaceId','').startswith('hgis-admin-') and place.get('lon') is not None and not place.get('coordinateSourceIds'):
   place['coordinateSourceIds']=['src-existing-anchors-hgis']
  label=place['label'];short=re.sub(r'\s*\([^)]*(?:지금|현재|특별시|광역시|특별자치)[^)]*\)','',label)
  if short!=label:place['label']=short;place['coordinateNote']=place.get('coordinateNote','')+' 위치 참고 표기: '+label
 draft.setdefault('missing',[]).extend(notes)
 for name,value in [('original-result.json',original),('result.json',draft),('integration-review.json',{'reviewer':'Codex','changes':notes})]:
  (folder/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({'job':job,'scenes':len(draft['scenes']),'reviewedChanges':len(notes)},ensure_ascii=False))
