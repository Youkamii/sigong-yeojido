import test from 'node:test';
import assert from 'node:assert/strict';
import {displayLabel,stripLabelNotes,labelNote,isGroupEntity,predicateLabel,precisionLabel,typeWord,splitOutsideParens,visibleAliases,replaceUnknown} from '../services/host/app/chronicle.js';
import {withComparisonParticle} from '../services/host/app/atlas-chat.js';
import {typeName} from '../services/host/app/atlas-data.js';
import {shortLabel,sourceName,mergeEvents} from '../services/host/app/atlas-story.js';

test('displayLabel 은 설명 꼬리·연도 괄호·긴 설명 괄호를 떼고 짧은 구분 괄호는 남긴다 (#197)',()=>{
  const label=(text,type='Polity')=>displayLabel({label:text,type});
  assert.equal(label('성균관 유생 (1742년 당론 금지 대상) · 집단 행위자'),'성균관 유생');
  assert.equal(label('일본군 (임진왜란 침입군, 사료 표기 일본군·왜군·적군) · 집단 행위자'),'일본군');
  assert.equal(label('아관파천 (1896년 2월 11일)','Event'),'아관파천');
  assert.equal(label('삼포 개항(1423·1426)','Event'),'삼포 개항');
  assert.equal(label('김수환 추기경 (1987년 명동대성당 추모미사 집전)','Person'),'김수환 추기경');
  assert.equal(label('안동부 · 지방 행정 중심지','Place'),'안동부');
  assert.equal(label('세종 (조선)','Person'),'세종 (조선)');
  assert.equal(label('낙화암(타사암)','Place'),'낙화암(타사암)');
  assert.equal(label('성리학(주자학) 도입 (연도 미상)','Event'),'성리학(주자학) 도입');
  assert.equal(label('(1896년)','Event'),'(1896년)');  // 비면 원본 유지
});

test('labelNote 와 isGroupEntity, typeName 집단',()=>{
  assert.equal(labelNote({label:'안동부 · 지방 행정 중심지'}),'지방 행정 중심지');
  assert.equal(labelNote({label:'일본군 (침입군) · 집단 행위자'}),'');
  assert.equal(labelNote({label:'세종'}),'');
  const group={label:'처인부곡민 (1232) · 집단 행위자',type:'Polity'};
  assert.ok(isGroupEntity(group));
  assert.equal(typeName('Polity',group),'집단');
  assert.equal(typeName('Polity',{label:'조선',type:'Polity'}),'나라');
  assert.equal(typeName('Person'),'인물');
});

test('괄호 안의 " · " 로는 이름을 자르지 않는다 (#200)',()=>{
  assert.deepEqual(splitOutsideParens('부산대학교 박물관 (발굴 조사 기관 · 집단 행위자)'),['부산대학교 박물관 (발굴 조사 기관 · 집단 행위자)']);
  assert.deepEqual(splitOutsideParens('수군 (조선) · 집단 행위자'),['수군 (조선)','집단 행위자']);
  assert.equal(displayLabel({label:'부산대학교 박물관 (발굴 조사 기관 · 집단 행위자)',type:'Organization'}),'부산대학교 박물관');
  assert.equal(displayLabel({label:'국립중앙박물관 (발굴 조사 기관 · 집단 행위자)',type:'Organization'}),'국립중앙박물관');
  assert.equal(labelNote({label:'부산대학교 박물관 (발굴 조사 기관 · 집단 행위자)'}),'');
});

test('카드의 다른 이름 줄은 정리 전 표기를 숨기고 진짜 다른 이름만 남긴다 (#200)',()=>{
  assert.deepEqual(visibleAliases({label:'광개토왕',type:'Person',
    aliases:['광개토왕 (민족문화대백과)','광개토대왕','광개토왕']}),['광개토대왕']);
  assert.deepEqual(visibleAliases({label:'강원도/춘천군/신남면',type:'Place',
    aliases:['강원도/춘천군/신남면 (HGIS 176301)']}),[]);
  assert.deepEqual(visibleAliases({label:'태봉',type:'Place',aliases:['태봉 · Taebong (Cliopatria 4052)']}),[]);
  assert.deepEqual(visibleAliases({label:'효종 (조선)',type:'Person',
    aliases:['효종 (조선 제17대, 민족문화대백과 E0065706)','효종대왕']}),['효종대왕']);
  assert.deepEqual(visibleAliases({label:'세종',type:'Person'}),[]);
});

test('stripLabelNotes 는 연도만 있는 괄호와 11자 이상 설명을 뗀다',()=>{
  assert.equal(stripLabelNotes('불국사 창건 (751, 창건 연대 이설 있음)'),'불국사 창건');
  assert.equal(stripLabelNotes('부산의 임시수도 기능 (1950년 8월 18일 ~ 1953년 8월 15일)'),'부산의 임시수도 기능');
  assert.equal(stripLabelNotes('제포 (웅천)'),'제포 (웅천)');
});

test('shortLabel 은 연도 괄호를 떼고 sourceName 은 대시를 「」로 바꾼다',()=>{
  assert.equal(shortLabel('삼포 개항(1423·1426)'),'삼포 개항');
  assert.equal(shortLabel('만민공동회 (1898년 종로 민중 대회)'),'만민공동회');
  assert.equal(shortLabel('수군 (조선) · 집단 행위자'),'수군 (조선)');
  assert.equal(sourceName('거북선 — 한국민족문화대백과사전'),'한국민족문화대백과사전 「거북선」');
  assert.equal(sourceName('한국사데이터베이스'),'한국사데이터베이스');
  assert.equal(sourceName(''),'원문 보기');
});

test('연도 없는 같은 제목의 행은 연도 있는 행에 흡수되고 출처는 합쳐진다 (#197)',()=>{
  const rows=[{id:'e1',title:'주화론과 척화론',lo:1636,sceneId:'s1',placeLabel:'남한산성 행궁 일대',basis:[{id:'c1'}]},
    {id:'e2',title:'주화론과 척화론',basis:[{id:'c2'}]},
    {id:'e3',title:'다른 사건',basis:[]}];
  const merged=mergeEvents(rows);
  assert.equal(merged.length,2);
  const main=merged.find(e=>e.id==='e1');
  assert.deepEqual(new Set(main.basis.map(c=>c.id)),new Set(['c1','c2']));
  assert.ok(merged.some(e=>e.id==='e3'));
});

// ── #198 적대 리뷰 반영(C-7·C-9·C-11·C-12·C-18): 화면에 나가는 코드값 대조표 ──
test('유형 이름은 서버가 주는 17가지를 모두 우리말로 옮긴다 (#198 C-18)',()=>{
  const expected={Person:'인물',Event:'사건',Place:'장소',Polity:'나라',Narrative:'전승',Group:'집단',
    Organization:'단체',Institution:'제도',Office:'관직',Work:'기록물',Thing:'물건',Facility:'시설',
    Heritage:'문화유산',Artifact:'유물',Document:'문서',Concept:'개념',Period:'시대'};
  for(const [type,word] of Object.entries(expected))assert.equal(typeName(type),word,type);
  // data/entities 의 유형 가운데 '기록' 으로 뭉개지는 것이 없다
  assert.equal(Object.keys(expected).filter(type=>typeName(type)==='기록').length,0);
  assert.equal(typeName('Unknown'),'기록');
  assert.equal(typeWord('Chunk'),'원문 대목');
  assert.equal(typeWord('Source'),'사료');
  assert.equal(typeWord('Claim'),'기록');
});

test('집단 판정은 라벨 꼬리가 사라져도 유형으로 살아남는다 (#198 C-18)',()=>{
  assert.ok(isGroupEntity({type:'Group',label:'처인부곡민'}));            // 꼬리를 뗀 뒤
  assert.ok(isGroupEntity({type:'Polity',label:'수군 · 집단 행위자'}));  // 꼬리가 남은 동안
  assert.ok(!isGroupEntity({type:'Polity',label:'조선'}));
  assert.ok(isGroupEntity({kind:'group',label:'수군',type:'Polity'}));     // #200 뒤로는 서버가 kind 를 준다
  assert.ok(!isGroupEntity({kind:'',label:'조선',type:'Polity'}));
  assert.equal(typeName('Group',{type:'Group',label:'처인부곡민'}),'집단');
  assert.equal(typeName('Organization',{type:'Organization',label:'국립중앙박물관 · 집단 행위자'}),'집단');
});

test('술어와 정밀도는 대조표를 거치고 없는 값은 흘리지 않는다 (#198 C-7·C-9·C-11·C-12)',()=>{
  assert.equal(predicateLabel('syj:hasBoundaryRecord'),'경계 기록');
  assert.equal(predicateLabel('syj:tookPlaceAt'),'장소');
  assert.equal(predicateLabel('locatedAt'),'위치');
  assert.equal(predicateLabel('syj:describedAs'),'설명');
  assert.equal(predicateLabel('syj:foundedIn'),'건국');
  assert.equal(predicateLabel('syj:sameEntityAs'),'같다고 보는 이름');
  assert.equal(predicateLabel('syj:statesTerritoryAs'),'관련 기록');  // 표에 없으면 기본값
  assert.equal(predicateLabel(''),'관련 기록');
  for(const predicate of ['syj:hasBoundaryRecord','syj:relatedTo','syj:occurredIn','syj:locatedAt','syj:describedAs',
    'syj:tookPlaceAt','syj:hasParticipant','syj:participatedIn','syj:endedIn','syj:bornIn','syj:diedIn',
    'syj:establishedIn','syj:builtIn','syj:reignedIn','syj:activeIn','syj:administeredAs','syj:isKingOf',
    'syj:foundedIn','syj:sameEntityAs','syj:reignedFrom','syj:reignedTo','syj:memberOf','syj:capitalMovedTo',
    'syj:householdCount','syj:mentionedIn','syj:hasTitle','syj:producedAt','syj:destroyedIn','syj:appearsIn','syj:locatedIn'])
    assert.doesNotMatch(predicateLabel(predicate),/[A-Za-z]/,predicate);
  assert.equal(precisionLabel('approx'),'대략 위치');
  assert.equal(precisionLabel('region'),'일대 기준');
  assert.equal(precisionLabel('area'),'일대 기준');
  assert.equal(precisionLabel('site'),'유적 지점');
  assert.equal(precisionLabel('year'),'연 단위');
  assert.equal(precisionLabel('month'),'월 단위');
  assert.equal(precisionLabel('day'),'일 단위');
  assert.equal(precisionLabel('mixed'),'');      // 표에 없으면 아무것도 표시하지 않는다
  assert.equal(precisionLabel(undefined),'');
});

// ── #203 합류본 재감사 ──
test("'미상'은 홀로 설 때만 '미확인'으로 바꾼다 — '다미상면'은 그대로 (#203 감사 11)",()=>{
  assert.equal(replaceUnknown('연도 미상'),'연도 미확인');
  assert.equal(replaceUnknown('미상'),'미확인');
  assert.equal(replaceUnknown('(미상)'),'(미확인)');
  assert.equal(replaceUnknown('저자 미상, 편년 미상'),'저자 미확인, 편년 미확인');
  assert.equal(replaceUnknown('평안남도/용강군/다미상면'),'평안남도/용강군/다미상면');
  assert.equal(replaceUnknown('미상면'),'미상면');
  assert.equal(replaceUnknown('다미상'),'다미상');
  assert.equal(displayLabel({label:'평안남도/용강군/다미상면 (HGIS 92966)',type:'Place'}),'평안남도/용강군/다미상면 (HGIS 92966)');
  assert.equal(displayLabel({label:'성리학(주자학) 도입 (연도 미상)',type:'Event'}),'성리학(주자학) 도입');
});

test("추천 질문의 조사는 받침에 따라 '와/과'를 고른다 (#203 감사 7)",()=>{
  for(const name of ['장보고','최제우','노태우','온조','이성계','김구'])assert.equal(withComparisonParticle(name),name+'와',name);
  for(const name of ['이순신','안중근','전태일','세종','김유신'])assert.equal(withComparisonParticle(name),name+'과',name);
  assert.equal(withComparisonParticle(''),'과');       // 이름이 비어도 터지지 않는다
  assert.equal(withComparisonParticle('Cliopatria'),'Cliopatria과');  // 한글이 아니면 읽는 법을 모르므로 그대로
});
