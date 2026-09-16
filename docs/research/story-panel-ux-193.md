# 이야기 패널 UX 조사와 설계 근거 (#193, 2026-09-16)

조사: Opus 5(high) 웹 조사 + 리더 종합. 공개 화면 실측(이순신 카드, 1440×900): 본문 2,727px, 보이는 영역 505px(5.4화면), 행 45개 + 접힘 블록 4개.

## 문제 (실측)
- 한 줄 나열: 초상 → 고지문 → 접힘 블록 → 생몰 → 역할 → 관계 6 → 연표 15(8+더보기) → 장소 21(8+더보기) → 시대 2 → 큰 버튼 → 출처 접힘 → 위치 접힘 → 채팅 버튼.
- 같은 것이 두 번: 한산도 대첩/한산도대첩, 녹둔도/녹둔도 (두만강 하류), 임진왜란 ×2(장소만 다름).
- 장소 행 아래 사건 제목을 전부 이어 붙여 두세 줄.
- 데이터 라벨 그대로: "일본군 (임진왜란 침입군, 사료 표기 일본군·왜군·적군) · 집단 행위자".
- 제목의 대시 부제와 끝 괄호 연도: "한산도 본영 운영 — 전함 제작과 수리 (1593~1597)".

## 레퍼런스 (확인된 것만)
| 제품 | 구조 | 우리에게 가져올 점 |
|---|---|---|
| Google Places UI Kit 상세 카드 | Full/Compact 두 단, 필드 고정 순서, 권장 폭 250~400px | 폭은 그대로 두고 내용을 줄인다 |
| Google 지식 패널(인물) | 제목 → 짧은 요약 → 사진 → 핵심 사실 → 관련 인물은 하단 가로 캐러셀 | 요약 먼저, 관계는 칩 |
| Apple Maps 장소 카드 | 요약 카드 → 밀어올리면 상세 | 2단계 공개 |
| Wikipedia 모바일 | 리드만 펼침, 나머지 섹션 접힘 | 좁은 폭에서 접힘 |
| Google Arts & Culture 인물 | 단일 스크롤, 섹션 제목에 "329 items" 개수 | 탭·섹션 라벨에 개수 |
| 한국민족문화대백과 | 섹션 접기 + 목차 점프 | 섹션 점프(탭) |
| Neo4j Bloom / Obsidian | 관계를 유형별 그룹 + 개수로 압축 | 관계 탭의 그룹 |
| NN/g 점진적 공개 | 2단계 초과는 사용성 하락 | 접힘은 한 겹만 |
| NN/g 스크롤과 주의 | 첫 화면 57%, 상단 20% 에 42% | 첫 화면에 핵심만 |
| NN/g 탭 | 동시 비교 불필요한 내용의 청킹에 적합, 라벨 1~2어 | 요약/연표/관계/장소 |
| NN/g 아코디언 | 데스크톱 다중 접힘은 역효과, 모바일 기본 접힘은 유효 | 데스크톱은 탭, 접힘은 '자세히' 하나 |
| NN/g 중복 링크 | 같은 대상 중복은 비용 증가·재방문 유발 | 정규화 병합 |
| NN/g 리스트 행 | 좌상단 최다 주시, 속성 2~3종 이내 | 행 = 핵심 1 + 속성 2 |
| NN/g 캐러셀 | 5개 이하, 개수 표시 | 요약 탭 칩 5개 + "모두 보기" |

## 채택한 원칙
1. 첫 화면 = 이름·생몰·역할·초상(작게)·설명 3줄. 고지문·생성 정보 블록 삭제, 배지만.
2. 탭 4개(요약/연표 N/관계 N/장소 N), 합계 6건 이하면 탭 없음.
3. 요약 탭: 관계 칩 5 + 연표 3 + '출처와 지도 위치' 접힘 하나.
4. 연표는 연도 레일(같은 연도 한 번), 관계는 유형별 그룹, 장소는 사건 수 순.
5. 정규화 병합(공백·기호·괄호 제거 후 같으면 하나), 제목 부제·괄호 연도 제거, 라벨 꼬리(" · 집단 행위자", 긴 괄호) 제거.
6. 행은 핵심 1 + 속성 2 이내, 터치 44px.
7. "관계 따라 보기" 버튼과 전체 나열 모드 삭제(탭이 대체).

## 미확인
Google Maps 데스크톱 좌측 탭 정식 출시 여부, Apple Maps 시트 디텐트 수치, "연도 레일 + 5개 후 펼치기"의 공식 디자인시스템 스펙.

## 출처
NN/g: progressive-disclosure, scrolling-and-attention, tabs-used-right, accordions-on-desktop, mobile-accordions, chunking, list-entries, duplicate-links, designing-effective-carousels (nngroup.com/articles/…). Google Places UI Kit place-details 문서. blog.google 지식 패널 설명. MediaWiki Extension:MobileFrontend. artsandculture.google.com/entity/vincent-van-gogh. encykorea.aks.ac.kr/Article/E0044903. neo4j.com Bloom scene interactions. obsidian.md/help/plugins/graph. nearmedia.co Apple Maps 카드 분석.
