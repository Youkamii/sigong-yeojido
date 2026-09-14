"""Mark older scene packets covered by nearby curriculum scenes (#186).

A curriculum scene N (itemId) supersedes an older scene O (no itemId) when both start within a year,
stand within 500 m, share a kind (construction and heritage count as one), and two title words share a
prefix of two or more characters (황룡사/황룡사, 백제의/백제, 광개토왕릉비를/광개토대왕릉비) — so 6·10 만세운동
(1926) is not folded into 신간회 (1927), 인조반정 into 붕당 정치, nor 자격루 into 혼천의.
"""
import math
import re

# Pairs whose titles share no word but describe the same event at the same place (#186):
# 탑골공원 독립선언서 낭독(옛 장면) 은 항목 3·1 운동 이 덮는다 — 260 m, 같은 해, 같은 kind.
MANUAL_PAIRS = {'scene-tapgol-1919': 'scene-c2-samil'}

# Words too generic to prove two titles describe the same event.
GENERIC_WORDS = {'창건', '설립', '건립', '완공', '준공', '조성', '제작', '전투', '해전', '사건', '즉위', '소실', '화재', '이설', '있음',
                 '연대', '경주', '한성', '서울', '개경', '평양', '전개', '시작', '기록', '운동', '싸움'}


def distance_meters(a, b):
    """Great-circle distance using the recorded coordinates, not display offsets."""
    lat1, lat2 = math.radians(a['lat']), math.radians(b['lat'])
    dlat, dlon = lat2 - lat1, math.radians(b['lon'] - a['lon'])
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6371000 * 2 * math.asin(math.sqrt(min(1, max(0, h))))


def valid_position(scene):
    place = scene.get('place') or {}
    return all(isinstance(place.get(key), (int, float)) and math.isfinite(place[key])
               for key in ('lon', 'lat'))


def title_words(title):
    return {word for word in re.split(r'[\s\W_]+', title or '')
            if len(word) >= 2 and not word.isdigit() and word not in GENERIC_WORDS}


def titles_overlap(a, b):
    """Some word of each title starts with the same two or more characters (particles and suffixes tolerated)."""
    return any(wa[:2] == wb[:2] for wa in title_words(a) for wb in title_words(b))


def excluded(scene):
    """Tradition stages and between-records settlements never take part."""
    return scene.get('narrativeType') is not None \
        or ((scene.get('place') or {}).get('settlement') or {}).get('scope') == 'between-records'


def supersede_scenes(scenes):
    items = [s for s in scenes if s.get('itemId') and valid_position(s) and not excluded(s)]
    pairs = []
    for old in sorted(scenes, key=lambda s: s['id']):
        if old.get('itemId'):
            continue
        old.pop('supersededBy', None)
        if not valid_position(old) or excluded(old):
            continue
        candidates = []
        for new in items:
            if abs(new['startYear'] - old['startYear']) > 1:
                continue
            if not (new['kind'] == old['kind'] or {new['kind'], old['kind']} <= {'construction', 'heritage'}):
                continue
            if MANUAL_PAIRS.get(old['id']) != new['id'] and not titles_overlap(old.get('title', ''), new.get('title', '')):
                continue
            distance = distance_meters(old['place'], new['place'])
            # Ignore sub-nanometer floating-point noise at the strict boundary.
            if round(distance, 9) < 500:
                candidates.append((distance, new['id'], new))
        if not candidates:
            continue
        distance, _, new = min(candidates, key=lambda row: row[:2])
        old['supersededBy'] = new['id']
        pairs.append({'id': old['id'], 'title': old['title'], 'startYear': old['startYear'],
                      'supersededBy': new['id'], 'replacementTitle': new['title'],
                      'replacementStartYear': new['startYear'], 'distanceMeters': round(distance, 3)})
    return pairs
