"""Cited people, events and polities for one time-driven 3D view (#91)."""
import json
import re
from collections import Counter
from copy import deepcopy
from graph_query import NS, query_rows
from time_query import selected_filter, _claim


def build_same_entity_map(result, identity_rows=None):
    entities = {}
    identities = []
    for row in identity_rows or []:
        if row['predicate'] != NS + 'sameEntityAs':
            continue
        subject, target = (row[key].removeprefix(NS) for key in ('subject', 'object'))
        for entity_id, prefix in ((subject, 'subject'), (target, 'object')):
            entities[entity_id] = {
                'id': entity_id, 'type': row.get(prefix + 'Type', '').removeprefix(NS),
                'label': row.get(prefix + 'Label', entity_id),
            }
        identities.append({'subject': subject, 'predicate': 'syj:sameEntityAs',
                           'object': {'kind': 'entity', 'id': target}})
    entities.update((entity['id'], deepcopy(entity)) for entity in result['entities'])
    parents = {entity_id: entity_id for entity_id in entities}

    def find(entity_id):
        while parents[entity_id] != entity_id:
            parents[entity_id] = parents[parents[entity_id]]
            entity_id = parents[entity_id]
        return entity_id

    for claim in identities + result['claims']:
        obj = claim['object']
        if claim['predicate'] != 'syj:sameEntityAs' or obj.get('kind') != 'entity':
            continue
        subject, target = claim['subject'], obj.get('id')
        if subject in entities and target in entities and entities[subject].get('type') \
                and entities[subject]['type'] == entities[target].get('type'):
            parents[find(subject)] = find(target)

    counts = Counter(claim['subject'] for claim in result['claims'])

    def priority(entity_id):
        if re.fullmatch(r'person-encykorea-.+-e0\d+', entity_id):
            rank = 0
        elif entity_id.startswith(('person-encykorea-', 'place-encykorea-')):
            rank = 1
        elif '-hs-' in entity_id:
            rank = 2
        else:
            rank = 3
        return rank, -counts[entity_id], entity_id

    groups = {}
    for entity_id in entities:
        groups.setdefault(find(entity_id), []).append(entity_id)
    canonical_ids = {}
    for members in groups.values():
        canonical = entities[min(members, key=priority)]
        if len(members) < 2:
            continue
        canonical_ids.update((entity_id, canonical['id']) for entity_id in members)
        canonical['mergedIds'] = sorted(entity_id for entity_id in members if entity_id != canonical['id'])
        aliases = list(canonical.get('aliases', []))
        for entity_id in sorted(members):
            entity = entities[entity_id]
            aliases.extend([entity.get('label'), entity.get('labelHanja'), *entity.get('aliases', [])])
            if entity_id != canonical['id']:
                entity['mergedInto'] = canonical['id']
        canonical['aliases'] = list(dict.fromkeys(label for label in aliases if label and label != canonical.get('label')))
    return canonical_ids, entities


def apply_same_entity_map(result, canonical_ids, entities):
    # 응답 밖의 정본도 넣어야 나뉜 응답의 참조가 같은 개체로 모인다.
    result = deepcopy(result)
    present = {entity['id']: entity for entity in result['entities']}
    for entity_id in list(present):
        if entity_id in canonical_ids:
            canonical = canonical_ids[entity_id]
            present[entity_id] = deepcopy(entities[entity_id])
            present[canonical] = deepcopy(entities[canonical])
    result['entities'] = list(present.values())

    claims = {}
    for claim in result['claims']:
        if claim['predicate'] != 'syj:sameEntityAs':
            subject = canonical_ids.get(claim['subject'])
            if subject:
                claim['subject'] = subject
                claim['subjectLabel'] = entities[subject]['label']
            if 'id' in claim['object']:
                target = claim['object']['id']
                claim['object']['id'] = canonical_ids.get(target, target)
        source = claim.get('sourceId', claim.get('fromSource', claim.get('chunk', {}).get('sourceId')))
        key = (claim['subject'], claim['predicate'], json.dumps(claim['object'], sort_keys=True), source)
        if key not in claims or claim['id'] < claims[key]['id']:
            claims[key] = claim
    result['claims'] = sorted(claims.values(), key=lambda claim: claim['id'])
    return result


def merge_same_entities(result, identity_rows=None):
    identity_rows = list(identity_rows or [])
    canonical_ids, entities = build_same_entity_map(result, identity_rows)
    result = apply_same_entity_map(result, canonical_ids, entities)
    present = {entity['id'] for entity in result['entities']}
    claim_ids = {claim['id'] for claim in result['claims']}
    # 한도 밖의 동일성 주장도 카드에서 근거를 열 수 있도록 보충한다.
    for row in identity_rows:
        if row['predicate'] != NS + 'sameEntityAs':
            continue
        subject, target = (row[key].removeprefix(NS) for key in ('subject', 'object'))
        if subject not in present and target not in present:
            continue
        claim = _claim(row, subject, 'syj:sameEntityAs', {'kind': 'entity', 'id': target})
        claim['subjectLabel'] = row.get('subjectLabel', subject)
        if claim['id'] not in claim_ids:
            result['claims'].append(claim)
            claim_ids.add(claim['id'])
    result['claims'].sort(key=lambda claim: claim['id'])
    return result


def apply_shell_names(result, shells):
    """개체 껍데기(data/entities)의 다른 이름·이름 설명·집단 표시를 응답에 붙인다 (#200).

    이름을 정리하면서 원래 이름을 aliases 로 옮겼으므로, 이것을 붙여야 찾기가 옛 이름도 계속 잡는다.
    Fuseki 가 아니라 서버가 이미 읽어 둔 껍데기 목록에서 가져온다 — 질의를 늘리지 않는다.
    """
    if not shells:
        return result
    for entity in result['entities']:
        shell = shells.get(entity['id'])
        if not shell:
            continue
        aliases = [*entity.get('aliases', []), *(shell.get('aliases') or [])]
        aliases = list(dict.fromkeys(name for name in aliases if name and name != entity.get('label')))
        if aliases:
            entity['aliases'] = aliases
        for key in ('labelNote', 'kind'):
            if shell.get(key) and not entity.get(key):
                entity[key] = shell[key]
        # sourceRef 는 자료 식별자다 — 화면에 쓰지 않고 응답에만 둔다 (#200 2차).
        source_ref = list(dict.fromkeys([*entity.get('sourceRef', []), *(shell.get('sourceRef') or [])]))
        if source_ref:
            entity['sourceRef'] = source_ref
    return result


def chronicle(sources=None, origin='all', *, query=None, shells=None):
    if origin not in ('all', 'ai', 'human'):
        raise ValueError('origin must be all, human or ai')
    result = {'entities': [], 'claims': [], 'hasMore': False}
    if sources is not None and not sources:
        return result
    query = query or query_rows
    # 본 응답의 한도에 밀린 연결도 선택 사료 안에서는 정본 지도에 포함한다.
    identity_rows = query(f'''
SELECT DISTINCT ?claim ?subject ?subjectType ?subjectLabel ?predicate ?object ?objectType ?objectLabel
       ?source ?sourceLabel ?chunk ?quote ?origin ?status ?locator ?permalink ?note
WHERE {{
  ?claim a syj:Claim; syj:subject ?subject; syj:predicate syj:sameEntityAs; syj:objectEntity ?object;
         syj:fromSource ?source; syj:citesChunk ?chunk; syj:quote ?quote;
         syj:origin ?origin; syj:status ?status.
  BIND(syj:sameEntityAs AS ?predicate)
  ?subject a ?subjectType. ?object a ?objectType.
  {selected_filter(sources, origin)}
  OPTIONAL {{?subject rdfs:label ?subjectLabel}} OPTIONAL {{?object rdfs:label ?objectLabel}}
  OPTIONAL {{?source rdfs:label ?sourceLabel}} OPTIONAL {{?chunk syj:locator ?locator}}
  OPTIONAL {{?chunk syj:permalink ?permalink}} OPTIONAL {{?claim syj:note ?note}}
}} ORDER BY ?claim
''')
    rows = query(f'''
SELECT DISTINCT ?claim ?subject ?subjectType ?subjectLabel ?predicate ?objectKind ?object
       ?objectType ?objectLabel ?verbatim ?precision ?year ?earliest ?latest
       ?source ?sourceLabel ?chunk ?quote ?origin ?status ?locator ?permalink ?note
       ?lat ?lon ?validFrom ?validTo ?geographyObject
WHERE {{
  VALUES ?subjectType {{syj:Person syj:Event syj:Narrative syj:Polity syj:Place syj:TimeSpan
                       syj:Organization syj:Office syj:Work syj:Thing syj:Institution syj:Group syj:Facility syj:Heritage syj:Artifact syj:Document}}
  ?subject a ?subjectType.
  ?claim a syj:Claim; syj:subject ?subject; syj:predicate ?predicate; ?objectKind ?object;
         syj:fromSource ?source; syj:citesChunk ?chunk; syj:quote ?quote;
         syj:origin ?origin; syj:status ?status.
  VALUES ?objectKind {{syj:objectEntity syj:objectLiteral syj:objectYear syj:objectTime syj:objectLocation}}
  {selected_filter(sources, origin)}
  OPTIONAL {{?subject rdfs:label ?subjectLabel}}
  OPTIONAL {{?object a ?objectType}} OPTIONAL {{?object rdfs:label ?objectLabel}}
  OPTIONAL {{?object syj:verbatim ?verbatim}} OPTIONAL {{?object syj:precision ?precision}}
  OPTIONAL {{?object syj:year ?year}} OPTIONAL {{?object syj:earliest ?earliest}}
  OPTIONAL {{?object syj:latest ?latest}}
  OPTIONAL {{?source rdfs:label ?sourceLabel}} OPTIONAL {{?chunk syj:locator ?locator}}
  OPTIONAL {{?chunk syj:permalink ?permalink}} OPTIONAL {{?claim syj:note ?note}}
  OPTIONAL {{?object syj:lat ?lat; syj:lon ?lon}}
  OPTIONAL {{?claim syj:validFrom ?validFrom}} OPTIONAL {{?claim syj:validTo ?validTo}}
  OPTIONAL {{?claim syj:geographyObject ?geographyObject}}
}} ORDER BY ?claim LIMIT 2001
''')
    result['hasMore'] = len(rows) > 2000
    entities = {}
    local = lambda value: value.removeprefix(NS)
    for row in rows[:2000]:
        subject, kind = local(row['subject']), local(row['objectKind']).removeprefix('object').lower()
        entities[subject] = {'id': subject, 'type': local(row['subjectType']),
                             'label': row.get('subjectLabel', subject)}
        obj = {'kind': kind}
        if kind == 'year':
            obj['value'] = int(row['object'])
        elif kind == 'literal':
            obj['value'] = row['object']
        elif kind == 'location':
            obj.update(lat=float(row['lat']), lon=float(row['lon']), precision=row.get('precision'))
        else:
            target = local(row['object'])
            obj['id'] = target
            entities[target] = {'id': target, 'type': local(row.get('objectType', NS + 'Entity')),
                                'label': row.get('objectLabel', target)}
            if kind == 'time':
                obj.update(verbatim=row.get('verbatim', ''), precision=row.get('precision', 'unknown'))
                for key in ('year', 'earliest', 'latest'):
                    if key in row:
                        obj[key] = int(row[key])
        if 'geographyObject' in row:
            obj = json.loads(row['geographyObject'])
        claim = _claim(row, subject, 'syj:' + local(row['predicate']), obj)
        for key in ('validFrom', 'validTo'):
            if key in row:
                claim[key] = int(row[key])
        claim['subjectLabel'] = entities[subject]['label']
        result['claims'].append(claim)
    result['entities'] = list(entities.values())
    # 병합보다 먼저 붙여야 합쳐지는 개체의 옛 이름도 정본의 다른 이름으로 모인다.
    return merge_same_entities(apply_shell_names(result, shells), identity_rows)
