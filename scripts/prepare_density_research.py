"""Apply the recorded date/place review to the actual Opus #122 output copies."""
import argparse,copy,json,re,shutil
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--research',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
for job in ['early_localities','joseon_localities','modern_localities']:
 source=a.research/job;run=json.loads((source/'run.json').read_text(encoding='utf8'))
 assert run.get('exitCode')==0 and not run['isError'] and run['modelsObserved']==['claude-opus-5']
 folder=a.out/job;shutil.copytree(source,folder,dirs_exist_ok=True)
 draft=json.loads((source/'result.json').read_text(encoding='utf8'));original=copy.deepcopy(draft);notes=[]
 def scene(id):return next(s for s in draft['scenes'] if s['id']==id)
 def bound(s,participant,start,end):
  for actor in s['participants']:
   if actor['entityId']!=participant:continue
   actor.update(startYear=start,endYear=end)
   for cid in actor['claimIds']:
    claim=next(c for c in draft['claims'] if c['id']==cid)
    if claim['predicate'] in ['syj:hasParticipant','syj:participatedIn','syj:ledBy']:
     claim.update(validFrom=start,validTo=end)
 def point(s,year,title,date_ids,action_ids):
  s.update(startYear=year,endYear=year,title=title,dateClaimIds=date_ids,actionClaimIds=action_ids)
 if job=='early_localities':
  removed=scene('scene-syj122-buinsa-chojo-1011-1087');draft['scenes'].remove(removed)
  draft['claims']=[c for c in draft['claims'] if c['subject']!=removed['eventId'] and c['object'].get('id')!=removed['eventId']]
  notes.append('부인사 1011~1087 판각 장면 제외: 원문은 흥왕사 보관 뒤 부인사로 옮겼다고 하며 부인사 전체기간 판각을 뒷받침하지 않는다.')
  s=scene('scene-syj122-iseoguk-297');s['place']=None
  invalid='claim-syj122-iseoguk-place';draft['claims']=[c for c in draft['claims'] if c['id']!=invalid]
  s['actionClaimIds']=[c for c in s['actionClaimIds'] if c!=invalid]
  notes.append('이서국297: 청도는 침공국 소재지이며 전투 장소 근거가 아니므로 사건 좌표와 잘못된 장소 Claim 제외.')
  s=scene('scene-syj122-buinsa-1232');s['place']['precision']='area'
  s['place']['coordinateNote']='현재 부인사는 원터에서 서북쪽 약 400m 옮겨졌다. 이 좌표는 사찰 일대의 참고점이며 1232년 화재 현장 좌표가 아니다.'
  s['visualActions']='대장경판이 불탄 기록을 책판 보관 장면으로 표현한다. 건물 전체의 화재로 확대하지 않는다.'
  s=scene('scene-syj122-hangpaduri-1271-1273');bound(s,'polity-syj122-yeomong-force-1273',1273,1273)
  s['effects']['attack'].update(startYear=1273,endYear=1273)
  notes.append('항파두리의 여몽연합군과 공격 효과는1273년에만 표시. 거점 기간과 분리.')
  s=scene('scene-syj122-byeokgolje-330-790');s['kind']='court'
  s['visualActions']={'activity':'제방·저수와 관개 이용','constructionYears':[330,790]}
  notes.append('벽골제 장기 이용은 유지하되 공사 동작은330·790년에 한정.')
  s=scene('scene-syj122-heunghwajin-995-1030');s['kind']='siege';s['visualActions']='흥화진의 성곽과 방어 거점 운영. 공격군이나 공사 중인 인부를 추정하지 않는다.'
  s=scene('scene-syj122-suseonsa-1200-1205');ceremony=copy.deepcopy(s);ceremony['id']='scene-syj122-suseonsa-1205'
  point(ceremony,1205,'길상사 중수 완료와 경찬법회 (1205)',['claim-syj122-suseonsa-1205'],['claim-syj122-suseonsa-beophoe','claim-syj122-suseonsa-place'])
  for actor in ceremony['participants']:actor.update(startYear=1205,endYear=1205)
  s['id']='scene-syj122-suseonsa-1200';point(s,1200,'지눌 결사의 길상사 이전 (1200)',['claim-syj122-suseonsa-1200'],['claim-syj122-suseonsa-place','claim-syj122-suseonsa-jinul'])
  s['kind']='court';s['summary']='1200년 지눌의 결사가 송광산 길상사로 근거지를 옮겼다.';s['visualActions']='길상사로 옮긴 결사의 장면.'
  draft['scenes'].append(ceremony);notes.append('1200년 결사 이전과1205년 경찬법회를 두 단년 장면으로 분리.')
 elif job=='joseon_localities':
  source=next(s for s in draft['sources'] if s['id']=='src-jl2-aks-oegyujanggak')
  source['excerpts'][0]['text']='1782년 2월 정조가 왕실 관련 서적을 보관할 목적으로 강화도에 설치한'
  source['excerpts'].append({'id':'ex-jl2-ogj-fire-year','text':'병인양요 (1866년) 당시,','locator':'본문 내용: 외규장각 소실 연도'})
  next(c for c in draft['claims'] if c['id']=='claim-jl2-ogjf-year')['citesExcerpt']='ex-jl2-ogj-fire-year'
  s=scene('scene-jl2-tongjeyeong-duryongpo-1603-1895');bound(s,'person-jl2-yi-gyeongjun',1603,1603)
  s['visualActions']='조선 수군 지휘 관청의 운영. 배가 있었던 구체 장면이나 출항은 새로 만들지 않는다.'
  notes.append('통제영 존속기간은 유지하되 이경준의 자리선정 참여는1603년에 한정.')
  s=scene('scene-jl2-choryang-waegwan-1675-1678');bound(s,'polity-jl2-tsushima-residents-choryang',1678,1678)
  s['summary']='초량 왜관 신축 공사는1675년에 시작해1678년4월 완공되었다. 두모포에서 용두산 일대로 옮기는 건설 사업이다.'
  s['visualActions']='왜관 건물 신축과 이전 준비. 입주자는 완공된1678년에만 표시한다.'
  s['actionClaimIds']=[c for c in s['actionClaimIds'] if c!='claim-jl2-choryang-trade']
  notes.append('초량왜관 입주자를 완공 전1675~1677년에서 제외.')
  s=scene('scene-jl2-hwayangdong-seowon-1695-1871')
  point(s,1695,'화양동서원 창건 — 괴산 화양동 (1695)',['claim-jl2-hys-year'],['claim-jl2-hys-act'])
  s['visualActions']='1695년의 서원 창건과 참여 유생.'
  draft['claims']=[c for c in draft['claims'] if c['id']!='claim-jl2-hys-span']
  notes.append('화양동서원은 확인된1695년 창건 장면만 표시. 장기 건설·독서 활동을 덧붙이지 않는다.')
  # Retain the institutional date claim, but do not date the founding group by its duration.
  bound(s,'polity-jl2-hwayang-yusaeng-1695',1695,1695)
  s=scene('scene-jl2-mandongmyo-1703-1844');rite=copy.deepcopy(s);rite['id']='scene-jl2-mandongmyo-1844'
  point(rite,1844,'만동묘 관찰사의 봄·가을 제향 (1844)',['claim-jl2-mandong-rite-year'],['claim-jl2-mandong-rite'])
  rite['participants']=[];rite['summary']='1844년에 관찰사가 봄과 가을 한 번씩 정식 제사를 지내게 하였다.';rite['visualActions']='1844년 제향.1703년 창건 인물을 배치하지 않는다.'
  s['id']='scene-jl2-mandongmyo-1703';point(s,1703,'만동묘 창건 — 괴산 화양동 (1703)',['claim-jl2-mandong-year'],['claim-jl2-mandong-act'])
  s['summary']='1703년 권상하 등이 부근 유생들의 협력을 얻어 화양동에 만동묘를 창건했다.';s['kind']='construction';s['visualActions']='1703년 창건.'
  for actor in s['participants']:bound(s,actor['entityId'],1703,1703)
  draft['scenes'].append(rite);notes.append('만동묘1703창건·1844제향을 단년 장면으로 분리하고 창건 인물의 참여도1703으로 한정.')
  for sid in ['scene-jl2-jepo-waegwan-1423-1510','scene-jl2-yeompo-waegwan-1426-1512']:
   s=scene(sid);s['kind']='court';s['visualActions']='왜관의 거주·교역. 주민과 수레, 상거래 장면.'
  scene('scene-jl2-bunwonri-1752-1883')['visualActions']='백자 관요의 제작·운영: 가마와 도자기 작업대, 옮겨 쌓는 백자.'
 else:
  s=scene('scene-mod-wonsanhaksa-1883');bound(s,'group-mod-wonsanhaksa-gwanmin-1883',1883,1883)
  s['kind']='court';s['visualActions']='학교 운영과 교육. 설립 관민은1883년에만 배치.'
  notes.append('원산학사 설립 집단은1883년에 한정. 학교 운영기간을 설립자의 현장 기간으로 쓰지 않는다.')
  s=scene('scene-mod-dongnip-sinmun-1896');bound(s,'person-mod-seo-jaepil',1896,1898)
  notes.append('독립신문 발행은1899까지 유지하되 서재필 참여는1898년 인계·출국 연도까지로 한정(연 단위).')
  s=scene('scene-mod-daegu-october-1946')
  for actor in s['participants']:
   if actor['entityId']=='group-mod-daegu-citizens-1946':actor['presence']='related'
  notes.append('대구부청·경찰서 포위 시민을 대구역 현장에 배치하지 않고 관련 집단으로 표시.')
  s=scene('scene-mod-seoul-station-1925');s['place']['precision']='area'
  for actor in s['participants']:actor['presence']='related'
  notes.append('서울역 시공 담당을 준공 현장 참석으로 바꾸지 않으며 현재역 좌표는 지역 참고점으로 표시.')
 excerpts={e['id']:e['text'] for source in draft['sources'] for e in source['excerpts']}
 for claim in draft['claims']:
  obj=claim['object']
  if obj['kind']!='time':continue
  quote=excerpts[claim['citesExcerpt']]
  if all(str(obj[k]) in quote for k in ['earliest','latest']):
   if obj['verbatim'] not in quote:obj['verbatim']=quote
   continue
  years=[obj[k] for k in ['earliest','latest'] if str(obj[k]) in quote]
  if years:claim['object']={'kind':'year','value':years[-1]}
  else:
   claim['object']={'kind':'literal','value':quote};claim['predicate']='syj:describedAs'
   for s in draft['scenes']:
    if claim['id'] in s['dateClaimIds']:
     s['dateClaimIds'].remove(claim['id'])
     if claim['id'] not in s['actionClaimIds']:s['actionClaimIds'].append(claim['id'])
  claim['note']=claim.get('note','')+' 원문 대조: 이 발췌에 실제 적힌 끝점 또는 서술만 Claim으로 남기고 장면의 기간 근거는 각 날짜 Claim을 함께 연결한다.'
 notes.append('서로 다른 발췌를 합친 time.verbatim을 없애고 각 발췌가 실제 입증하는 날짜만 Claim으로 기록. 검토된 장면 기간은 시작·끝 Claim을 함께 연결한다.')
 for s in draft['scenes']:
  place=s.get('place')
  if not place:continue
  label=place['label'];short=re.sub(r'\s+\([^)]*\)','',label)
  if 'suseonsa' in s['id']:short='송광산 길상사'
  if 'hwayangdong' in s['id']:short='화양동서원'
  if 'mandongmyo' in s['id']:short='만동묘'
  if 'bunwonri' in s['id']:short='광주 분원리 관요'
  if 'hwangnyongsa' in s['id']:short='경주 황룡사'
  if s['id']=='scene-mod-seoul-station-1925':
   short='경성역';s['title']='경성역사 준공 (1925)'
  if short!=label:place['label']=short;place['coordinateNote']=place.get('coordinateNote','')+' 위치 참고 표기: '+label
 draft.setdefault('missing',[]).extend(notes)
 (folder/'original-result.json').write_text(json.dumps(original,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 (folder/'result.json').write_text(json.dumps(draft,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 (folder/'integration-review.json').write_text(json.dumps({'reviewer':'Codex','changes':notes},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({'job':job,'scenes':len(draft['scenes']),'reviewedChanges':len(notes)},ensure_ascii=False))
