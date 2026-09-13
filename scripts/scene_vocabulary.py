"""Display vocabulary for facts collections; source wording is retained."""
import re


PARTICIPANT_GROUPS_NOTE = 'count 는 화면 표현값이며 사료의 인원수가 아니다'
ROLE_KEYWORDS = {
    'monk': ('승려', '주지', '법사', 'monk', '출가'),
    'ruler': ('천도 주체', '왕', '군주', '추장', 'ruler'),
    'scholar': ('관인', 'official', '감독', '통치', '사절', 'host', 'scholar'),
    'worker': ('인부', '역부', '노동', '부역', '축성', 'builder', 'worker', '기술 인력', '수축'),
    'soldier': ('군사', 'garrison', '병', 'soldier', '주둔'),
    'civilian': ('피해', 'victim', '수급자', 'recipient', 'beneficiary', '유민', '이재민', '수혜', '구휼 대상', '진휼 대상'),
    'commoner': ('이주민', 'migrant', '정착민', '주민', '거주자', '상인', 'trader', '행상', 'guest', '참석'),
}
ROLES = set(ROLE_KEYWORDS) | {'militia', 'police', 'printer', 'commander'}
STANCE_KEYWORDS = {
    'victim': ('피해', '피동', '유망', 'victim'),
    'marching': ('이주', '정착', '이탈', '항해', 'marching', '귀부', '도래'),
    'worker': ('동원', '부역', '시공', '노동', '징발', '수축', '축성', 'worker'),
    'defender': ('방어', '주둔', 'defend', 'defensive', '항복'),
    'attacker': ('hostile', 'attacker', '공격'),
}
POLITY_ALIASES = {
    '고구려': ('고구려', 'goguryeo'), '백제': ('백제', 'baekje'),
    '신라': ('신라', 'silla', '사로국'), '가락': ('가락', '가야', 'gaya', 'garak'),
    '발해': ('발해', 'balhae'), '당': ('당', 'tang'), '왜': ('왜', 'wa'),
    '전진': ('전진',), '동진': ('동진',), '아유타': ('아유타', 'ayuta'),
    '부여': ('부여', 'buyeo'), '진한': ('진한',), '변진': ('변진',),
    '한·예': ('한·예',), '태봉': ('태봉', 'taebong'), '거란': ('거란', 'georan', 'khitan'),
}
CIVILIAN_SIDES = ('civilian', '피해', '수급', '주민', '민간', '백성', '유민', '이재민', 'recipient', 'beneficiary')


def _text(value):
    return value.strip().lower() if isinstance(value, str) else ''


def _keyword(value, table, default):
    return next((code for code, words in table.items() if any(word in value for word in words)), default)


def _polity(value):
    text = _text(value)
    matches = []
    for polity, aliases in POLITY_ALIASES.items():
        for alias in aliases:
            # Do not read 당 in 당간지주 or wa in worker as a polity.
            pattern = re.escape(alias)
            if alias.isascii():
                pattern = r'(?<![a-z])' + pattern + r'(?![a-z])'
            elif len(alias) == 1:
                pattern = r'(?<![가-힣])' + pattern + r'(?=$|[^가-힣]|나라|의|이|은|과|에|으로)'
            match = re.search(pattern, text)
            if match:
                matches.append((match.start(), polity))
    return min(matches)[1] if matches else None


def _primary_polity(scene):
    texts = [scene.get('title'), scene.get('summary')]
    for actor in scene.get('participants', []):
        texts.extend(actor.get(key) for key in ('entityId', 'label', 'role', 'side'))
    for group in scene.get('participantGroups', []):
        texts.append(group.get('sourceSide', group.get('side')))
    return next((polity for text in texts if (polity := _polity(text))), None)


def normalize_group(group, scene):
    """Return a new group. Side assignment depends on the whole, unmodified scene."""
    source = {key: group.get('source' + key.title(), group.get(key)) for key in ('role', 'stance', 'side')}
    role, stance, side = (_text(source[key]) for key in ('role', 'stance', 'side'))
    normalized_role = role if role in ROLES else _keyword(role, ROLE_KEYWORDS, 'commoner')
    if normalized_role == 'commoner' and ('주체' in role or role == 'state'):
        normalized_role = 'scholar'
    if side in ('a', 'b', 'c'):
        normalized_side = side
    elif any(word in side for word in CIVILIAN_SIDES):
        normalized_side = 'c'
    elif side in ('state', 'defender'):
        normalized_side = 'a'
    else:
        polity = _polity(side)
        normalized_side = 'a' if polity and polity == _primary_polity(scene) else 'b'
    try:
        count = max(1, int(group.get('count')))
    except (TypeError, ValueError, OverflowError):
        count = 1
    known = set(scene.get('dateClaimIds', [])) | set(scene.get('actionClaimIds', [])) | set(scene.get('relatedClaimIds', []))
    participants = scene.get('participants', [])
    known.update(c for actor in participants for c in actor.get('claimIds', []))
    claim_ids = [c for c in group.get('claimIds', []) if c in known]
    entity_id = group.get('entityId')
    label = group.get('label')
    if not isinstance(label, str) or not label.strip():
        label = ' '.join(str(source[key]) for key in ('side', 'role') if source[key]) or '조사 집단'
    basis = group.get('basis')
    if not isinstance(basis, str) or not basis.strip():
        basis = f"조사 장면의 집단(원문 역할: {source['role']}, 자세: {source['stance']}, 편: {source['side']}) — count 는 표현값"
    return {
        **group, 'role': normalized_role, 'stance': _keyword(stance, STANCE_KEYWORDS, 'bystander'),
        'side': normalized_side, 'label': label, 'basis': basis, 'count': count,
        'claimIds': claim_ids or list(scene.get('actionClaimIds', [])),
        'entityId': entity_id if entity_id in {actor.get('entityId') for actor in participants} else None,
        **{'source' + key.title(): value for key, value in source.items()},
    }
