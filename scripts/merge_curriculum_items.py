"""고등 한국사 항목 목록(#186) 병합·검사.

docs/research/curriculum-186/items/<era>.json 을 읽어 형식·범위·중복을 검사하고
items.merged.json(연도순)·README.md(집계·문제 목록)·table.md(시대별 검토용 표)를 만든다.
교과서 본문은 어디에도 넣지 않는다 — 항목명·연도·장소·한 줄 의미·근거 출처만 다룬다.
"""
import argparse
import json
import re
from collections import Counter, OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'docs/research/curriculum-186'
ERA_ORDER = ['prehistoric-gojoseon', 'samguk', 'nambukguk', 'goryeo-early', 'goryeo-late',
             'joseon-early', 'joseon-late', 'modern-transition', 'colonial', 'contemporary']
ERA_LABEL = {
    'prehistoric-gojoseon': '선사·고조선·여러 나라', 'samguk': '삼국·가야', 'nambukguk': '남북국·후삼국',
    'goryeo-early': '고려 전기', 'goryeo-late': '고려 후기', 'joseon-early': '조선 전기',
    'joseon-late': '조선 후기', 'modern-transition': '개항·근대 개혁', 'colonial': '일제강점기',
    'contemporary': '현대'}
TYPES = {'event', 'person', 'institution', 'heritage', 'culture', 'economy', 'society', 'foreign', 'war', 'place'}
TYPE_LABEL = {'event': '사건', 'person': '인물', 'institution': '제도', 'heritage': '문화재·유적', 'culture': '문화',
              'economy': '경제', 'society': '사회', 'foreign': '대외', 'war': '전쟁', 'place': '장소'}
SCENE_TYPES = {'settlement', 'construction', 'battle', 'siege', 'naval', 'fire', 'court', 'assembly', 'publication',
               'excavation', 'tradition', 'disaster', 'relief', 'market', 'ritual', 'migration', 'survey',
               'portrait', 'heritage'}
PRIORITY = {'core', 'standard', 'extended'}
REQUIRED = ['id', 'era', 'title', 'type', 'year', 'place', 'sceneType', 'meaning', 'curriculum', 'evidence', 'priority']
MUST_HAVE = ['단군', '위만', '주몽', '온조', '박혁거세', '김수로', '진대법', '소수림왕', '광개토', '장수왕', '근초고왕', '무령왕',
             '성왕', '법흥왕', '이차돈', '진흥왕', '을지문덕', '살수', '연개소문', '안시성', '김춘추', '김유신', '계백', '황산벌',
             '문무왕', '신문왕', '원효', '의상', '혜초', '장보고', '최치원', '대조영', '견훤', '궁예', '왕건', '훈요', '광종',
             '최승로', '서희', '강감찬', '귀주', '윤관', '묘청', '김부식', '삼국사기', '무신정변', '최충헌', '만적', '삼별초',
             '팔만대장경', '일연', '삼국유사', '공민왕', '신돈', '문익점', '최영', '이성계', '위화도', '정도전', '과전법', '태종',
             '세종', '훈민정음', '집현전', '장영실', '측우기', '4군', '세조', '경국대전', '조광조', '기묘사화', '서원', '향약',
             '이황', '이이', '임진왜란', '이순신', '한산', '행주', '권율', '곽재우', '광해군', '대동법', '인조반정', '병자호란',
             '북벌', '탕평', '정조', '규장각', '화성', '정약용', '박지원', '박제가', '유형원', '이익', '김정호', '대동여지도',
             '세도', '홍경래', '임술', '동학', '최제우', '흥선대원군', '경복궁', '병인양요', '신미양요', '강화도 조약', '임오군란',
             '갑신정변', '동학 농민', '전봉준', '갑오개혁', '을미사변', '아관파천', '독립협회', '서재필', '독립신문', '대한제국',
             '광무', '을사', '헤이그', '의병', '안중근', '국채', '신민회', '병합', '토지 조사', '3·1', '유관순', '임시정부',
             '봉오동', '청산리', '김좌진', '홍범도', '물산', '6·10', '신간회', '광주 학생', '애국단', '윤봉길', '이봉창',
             '광복군', '조선어 학회', '광복', '모스크바', '좌우 합작', '4·3', '5·10', '정부 수립', '6·25', '인천 상륙', '휴전',
             '4·19', '5·16', '경제 개발', '새마을', '유신', '전태일', '5·18', '6월 민주', '6·29', '올림픽', '외환 위기',
             '정상회담']


def load(items_dir):
    files = sorted(items_dir.glob('*.json'), key=lambda p: ERA_ORDER.index(p.stem) if p.stem in ERA_ORDER else 99)
    jobs = OrderedDict()
    for path in files:
        if path.name.endswith('.meta.json'):
            continue
        jobs[path.stem] = json.loads(path.read_text(encoding='utf-8'))
    return jobs


def norm(text):
    return re.sub(r'[\s·ㆍ・,.()\-]', '', str(text or ''))


def normalize(item):
    """조사 파일의 표기 차이를 흡수한다: sceneType 이 {kind, sceneFunction} 객체로 온 경우 문자열로 편다."""
    scene = item.get('sceneType')
    if isinstance(scene, dict):
        item['sceneType'] = scene.get('kind')
        if scene.get('sceneFunction') and not item.get('sceneFunction'):
            item['sceneFunction'] = scene.get('sceneFunction')
    return item


def check(jobs):
    issues, seen_ids, titles = [], {}, Counter()
    for job_id, job in jobs.items():
        rng = job.get('range') or [None, None]
        for item in job.get('items', []):
            normalize(item)
            iid = item.get('id', '?')
            for key in REQUIRED:
                if key not in item:
                    issues.append((job_id, iid, f'필수 키 없음: {key}'))
            if iid in seen_ids:
                issues.append((job_id, iid, f'id 중복 ({seen_ids[iid]})'))
            seen_ids[iid] = job_id
            if item.get('type') not in TYPES:
                issues.append((job_id, iid, f'type 허용 밖: {item.get("type")}'))
            if item.get('sceneType') not in SCENE_TYPES:
                issues.append((job_id, iid, f'sceneType 허용 밖: {item.get("sceneType")}'))
            if item.get('priority') not in PRIORITY:
                issues.append((job_id, iid, f'priority 허용 밖: {item.get("priority")}'))
            year = item.get('year')
            if not isinstance(year, int) or year == 0:
                issues.append((job_id, iid, f'year 정수 아님: {year!r}'))
            elif rng[0] is not None and not (rng[0] - 5 <= year <= rng[1] + 5):
                issues.append((job_id, iid, f'year {year} 가 시대 범위 {rng} 밖'))
            meaning = item.get('meaning') or ''
            if len(meaning) < 8:
                issues.append((job_id, iid, '한 줄 의미가 비었거나 너무 짧음'))
            elif len(meaning) > 70:
                issues.append((job_id, iid, f'한 줄 의미 {len(meaning)}자 (70자 초과)'))
            if not item.get('evidence'):
                issues.append((job_id, iid, '근거(evidence) 없음'))
            cur = item.get('curriculum') or {}
            if not re.match(r'^\[\d{2}한사[\d\-]*\]$', str(cur.get('standard', ''))):
                issues.append((job_id, iid, f'성취기준 코드 형식: {cur.get("standard")!r}'))
            place = item.get('place') or {}
            if not place.get('overseas') and (place.get('lon') is None or place.get('lat') is None):
                issues.append((job_id, iid, '좌표 없음'))
            elif place.get('lon') is not None:
                lon, lat = place['lon'], place['lat']
                if not place.get('overseas') and not (124 <= lon <= 132 and 33 <= lat <= 43.5):
                    issues.append((job_id, iid, f'좌표 한반도 밖인데 overseas 표시 없음 ({lon},{lat})'))
            titles[norm(item.get('title'))] += 1
    dup_titles = [t for t, n in titles.items() if n > 1 and t]
    return issues, dup_titles


def must_have(all_items):
    text = ' | '.join(norm(i.get('title')) + ' ' + norm(' '.join(i.get('textbookTerms') or [])) for i in all_items)
    return [m for m in MUST_HAVE if norm(m) not in text]


def write_outputs(jobs, issues, dup_titles, missing):
    all_items = [dict(i, _era=job_id) for job_id, job in jobs.items() for i in job.get('items', [])]
    all_items.sort(key=lambda i: (i.get('year') if isinstance(i.get('year'), int) else 10**6, i.get('id', '')))
    merged = {'issue': 186, 'source': 'docs/research/curriculum-186/items/*.json', 'count': len(all_items),
              'eras': [{'id': k, 'label': ERA_LABEL.get(k, k), 'range': v.get('range'), 'count': len(v.get('items', [])),
                        'revision': v.get('revision')} for k, v in jobs.items()],
              'items': [{k: v for k, v in i.items() if k != '_era'} for i in all_items]}
    (BASE / 'items.merged.json').write_text(json.dumps(merged, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')

    lines = ['# 고등 한국사 항목 목록 (#186) — 집계와 검사', '',
             f'항목 {len(all_items)}건, 시대 {len(jobs)}칸. 교육과정 성취기준·교과서 목차·용어로 고른 목록이며 교과서 본문은 넣지 않았다.', '',
             '| 시대 | 범위 | 건수 | 핵심 | 인물 | 사건 | 문화재 | 좌표 없음 | 성취기준 확인 |', '|---|---|---|---|---|---|---|---|---|']
    for job_id, job in jobs.items():
        items = job.get('items', [])
        n = len(items) or 1
        core = sum(i.get('priority') == 'core' for i in items)
        per = sum(i.get('type') == 'person' for i in items)
        ev = sum(i.get('type') == 'event' for i in items)
        her = sum(i.get('type') == 'heritage' for i in items)
        nocoord = sum(1 for i in items if not (i.get('place') or {}).get('overseas') and (i.get('place') or {}).get('lon') is None)
        ver = sum(1 for i in items if (i.get('curriculum') or {}).get('verified'))
        rng = job.get('range') or ['', '']
        lines.append(f'| {ERA_LABEL.get(job_id, job_id)} | {rng[0]}~{rng[1]} | {len(items)} | {core} | {per} | {ev} | {her} | {nocoord} | {ver}/{len(items)} ({ver*100//n}%) |')
    lines += ['', f'## 필수 항목 점검 ({len(MUST_HAVE)}개 기준)', '',
              ('빠진 것 없음' if not missing else '빠짐: ' + ', '.join(missing)), '',
              f'## 형식·범위 문제 {len(issues)}건', '']
    lines += [f'- {j} / {i}: {msg}' for j, i, msg in issues[:400]]
    if len(issues) > 400:
        lines.append(f'- … 외 {len(issues) - 400}건')
    lines += ['', f'## 제목 중복 {len(dup_titles)}건', ''] + [f'- {t}' for t in dup_titles[:100]]
    (BASE / 'README.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')

    tbl = ['# 고등 한국사 항목 목록 (#186) — 검토용 표', '',
           '연도순. 종류: ' + ', '.join(f'{k}={v}' for k, v in TYPE_LABEL.items()) + '. 우선: core=핵심, standard=기본, extended=심화.', '']
    for job_id, job in jobs.items():
        items = sorted(job.get('items', []), key=lambda i: (i.get('year') if isinstance(i.get('year'), int) else 10**6))
        rng = job.get('range') or ['', '']
        tbl += [f'## {ERA_LABEL.get(job_id, job_id)} ({rng[0]}~{rng[1]}) — {len(items)}건', '',
                '| 연도 | 항목 | 종류 | 우선 | 장소 | 장면 | 한 줄 의미 | 성취기준 | 근거 |', '|---|---|---|---|---|---|---|---|---|']
        for i in items:
            p = i.get('place') or {}
            place = (p.get('label') or '') + (f' ({p.get("modern")})' if p.get('modern') else '') + ('' if p.get('lon') is not None or p.get('overseas') else ' ⚠좌표없음')
            ev = '; '.join(f'{e.get("kind")}' for e in (i.get('evidence') or [])[:3])
            year = i.get('year')
            ys = f'{year}' + (f'~{i.get("yearEnd")}' if i.get('yearEnd') else '') + ('?' if i.get('approx') else '')
            tbl.append(f'| {ys} | {i.get("title")} | {TYPE_LABEL.get(i.get("type"), i.get("type"))} | {i.get("priority")} | {place} | {i.get("sceneType")} | {i.get("meaning")} | {(i.get("curriculum") or {}).get("standard", "")} | {ev} |')
        tbl.append('')
    (BASE / 'table.md').write_text('\n'.join(tbl) + '\n', encoding='utf-8')
    return merged


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--items', type=Path, default=BASE / 'items')
    args = ap.parse_args()
    jobs = load(args.items)
    issues, dup_titles = check(jobs)
    all_items = [i for job in jobs.values() for i in job.get('items', [])]
    missing = must_have(all_items)
    merged = write_outputs(jobs, issues, dup_titles, missing)
    print(json.dumps({'eras': len(jobs), 'items': merged['count'], 'issues': len(issues), 'dupTitles': len(dup_titles),
                      'mustHaveMissing': missing}, ensure_ascii=False))


if __name__ == '__main__':
    main()
