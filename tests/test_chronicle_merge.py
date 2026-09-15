from copy import deepcopy
from pathlib import Path
import sys
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'services'))
from chronicle_query import chronicle, merge_same_entities, build_same_entity_map, apply_same_entity_map
from graph_query import NS


def entity(entity_id, label=None, kind='Person', **extra):
    return {'id': entity_id, 'label': label or entity_id, 'type': kind, **extra}


def claim(claim_id, subject, target, predicate='syj:sameEntityAs', **extra):
    obj = target if isinstance(target, dict) else {'kind': 'entity', 'id': target}
    return {'id': claim_id, 'subject': subject, 'subjectLabel': subject,
            'predicate': predicate, 'object': obj, 'fromSource': 'src-test',
            'origin': 'ai', 'status': 'draft', **extra}


def merge(entities, claims):
    return merge_same_entities({'entities': entities, 'claims': claims, 'hasMore': False})


def test_dangun_aliases_references_and_original_identity_are_preserved():
    old, canonical = 'person-dangun-samgukyusa', 'person-dangun'
    identity = claim('identity', old, canonical)
    source = {'entities': [entity(old, '단군왕검', labelHanja='檀君王儉'),
                           entity(canonical, '단군', labelHanja='檀君', aliases=['단군왕검']),
                           entity('event', '건국', 'Event')],
              'claims': [identity, claim('a', canonical, 'event', 'syj:participatedIn'),
                         claim('b', canonical, {'kind': 'literal', 'value': '고조선 시조'}, 'syj:describedAs'),
                         claim('c', old, 'event', 'syj:participatedIn'),
                         claim('d', 'event', old, 'syj:hasParticipant')], 'hasMore': True}
    original = deepcopy(source)
    result = merge_same_entities(source)
    assert source == original
    assert result['hasMore'] is True
    entities = {e['id']: e for e in result['entities']}
    assert entities[old]['mergedInto'] == canonical
    assert entities[canonical]['mergedIds'] == [old]
    assert set(entities[canonical]['aliases']) == {'단군왕검', '檀君王儉', '檀君'}
    assert len(entities[canonical]['aliases']) == 3
    assert 'mergedInto' not in entities[canonical]
    claims = {c['id']: c for c in result['claims']}
    assert claims['identity'] == identity
    assert claims['a']['subjectLabel'] == '단군'
    assert claims['d']['object']['id'] == canonical
    assert 'c' not in claims


def test_three_sejong_spellings_merge_transitively_despite_direction_and_cycle():
    canonical = 'person-encykorea-sejong-e0029857'
    others = ['person-joseon-sejong', 'ent-wea-sejong', 'ent-wga-sejong']
    entities = [entity(canonical, '세종'), entity(others[0], '세종'),
                entity(others[1], '세종장헌왕', labelHanja='世宗莊憲王'),
                entity(others[2], '세종장헌대왕', labelHanja='世宗莊憲王')]
    claims = [claim('i1', others[0], canonical), claim('i2', others[0], others[1]),
              claim('i3', others[2], others[1]), claim('i4', others[2], canonical),
              claim('description', others[2], {'kind': 'literal', 'value': '조선의 왕'}, 'syj:describedAs')]
    result = merge(entities, claims)
    reversed_result = merge(list(reversed(entities)), list(reversed(claims)))
    assert result['claims'] == reversed_result['claims']
    assert sorted(result['entities'], key=lambda e: e['id']) == sorted(reversed_result['entities'], key=lambda e: e['id'])
    by_id = {e['id']: e for e in result['entities']}
    assert by_id[canonical]['mergedIds'] == sorted(others)
    assert by_id[canonical]['aliases'] == ['세종장헌왕', '世宗莊憲王', '세종장헌대왕']
    assert all(by_id[e]['mergedInto'] == canonical for e in others)
    description = next(c for c in result['claims'] if c['id'] == 'description')
    assert (description['subject'], description['subjectLabel']) == (canonical, '세종')
    assert [c for c in result['claims'] if c['id'].startswith('i')] == claims[:4]


@pytest.mark.parametrize('canonical,other,kind', [
    ('person-encykorea-sejong-e0029857', 'person-encykorea-sejong', 'Person'),
    ('person-encykorea-sejong', 'person-hs-sejong', 'Person'),
    ('place-encykorea-hanseong', 'place-hs-hanseong', 'Place'),
    ('person-hs-sejong', 'person-sejong', 'Person'),
    ('person-b', 'person-a', 'Person'),
])
def test_canonical_priority(canonical, other, kind):
    claims = [claim('identity', other, canonical)]
    frequent = canonical if canonical == 'person-b' else other
    claims += [claim(f'c{i}', frequent, {'kind': 'literal', 'value': str(i)}, 'syj:describedAs') for i in range(4)]
    result = merge([entity(other, kind=kind), entity(canonical, kind=kind)], claims)
    assert result['entities'][0]['mergedInto'] == canonical


def test_equal_priority_and_claim_counts_use_lexical_id():
    result = merge([entity('person-b'), entity('person-a')],
                   [claim('b', 'person-b', 'person-a'), claim('a', 'person-a', 'person-b')])
    assert result['entities'][0]['mergedInto'] == 'person-a'


def test_only_present_same_type_entity_pairs_merge():
    entities = [entity('person'), entity('place', kind='Place'), entity('other')]
    claims = [claim('wrong-type', 'person', 'place'), claim('missing-object', 'person', 'missing'),
              claim('missing-subject', 'missing', 'other'),
              claim('literal', 'person', {'kind': 'literal', 'value': 'other'}),
              claim('different-predicate', 'person', 'other', 'syj:relatedTo'),
              claim('self', 'other', 'other')]
    assert merge(entities, claims)['entities'] == entities
    assert merge(entities, [])['entities'] == entities
    assert merge([], []) == {'entities': [], 'claims': [], 'hasMore': False}


@pytest.mark.parametrize('source_key', ['sourceId', 'fromSource', 'chunk'])
def test_deduplication_keeps_smallest_id_and_different_sources(source_key):
    def source(value):
        return {source_key: {'sourceId': value} if source_key == 'chunk' else value}

    claims = [claim('identity', 'person-b', 'person-encykorea-a'),
              claim('z', 'person-b', {'kind': 'literal', 'value': '왕'}, 'syj:describedAs', **source('src-a')),
              claim('a', 'person-encykorea-a', {'value': '왕', 'kind': 'literal'}, 'syj:describedAs', **source('src-a')),
              claim('b', 'person-b', {'kind': 'literal', 'value': '왕'}, 'syj:describedAs', **source('src-b')),
              claim('different', 'person-b', {'kind': 'literal', 'value': '학자'}, 'syj:describedAs', **source('src-a'))]
    if source_key == 'chunk':
        for c in claims:
            c.pop('fromSource')
    result = merge([entity('person-b'), entity('person-encykorea-a')], claims)
    assert [c['id'] for c in result['claims']] == ['a', 'b', 'different', 'identity']


def test_chronicle_applies_merge_without_fuseki():
    row = {'claim': NS + 'identity', 'subject': NS + 'person-joseon-sejong',
           'subjectType': NS + 'Person', 'subjectLabel': '세종장헌왕',
           'predicate': NS + 'sameEntityAs', 'objectKind': NS + 'objectEntity',
           'object': NS + 'person-encykorea-sejong-e0029857', 'objectType': NS + 'Person',
           'objectLabel': '세종', 'source': NS + 'src-test', 'chunk': NS + 'chunk-test',
           'quote': '세종장헌왕', 'origin': 'ai', 'status': 'draft'}
    with patch('chronicle_query.query_rows', return_value=[row]):
        result = chronicle({'src-test'})
    assert result['entities'][0]['mergedInto'] == 'person-encykorea-sejong-e0029857'
    with patch('chronicle_query.query_rows') as query:
        assert chronicle(set())['entities'] == []
        query.assert_not_called()


def identity_row(subject='ent-wga-sejong', target='person-encykorea-sejong-e0029857',
                 subject_label='세종장헌대왕', target_label='세종', **extra):
    return {'claim': NS + 'claim-identity-192-' + subject, 'subject': NS + subject,
            'subjectType': NS + 'Person', 'subjectLabel': subject_label,
            'predicate': NS + 'sameEntityAs', 'objectKind': NS + 'objectEntity',
            'object': NS + target, 'objectType': NS + 'Person', 'objectLabel': target_label,
            'source': NS + 'src-test', 'sourceLabel': '검사 사료', 'chunk': NS + 'chunk-test',
            'quote': '같은 인물', 'origin': 'ai', 'status': 'draft',
            'locator': '1쪽', 'permalink': 'https://example.org/source', 'note': '동일성 근거', **extra}


def test_external_identity_adds_missing_canonical_and_rewrites_references():
    old, canonical = 'ent-wga-sejong', 'person-encykorea-sejong-e0029857'
    source = {'entities': [entity(old, '세종장헌대왕'), entity('event', '즉위', 'Event')],
              'claims': [claim('description', old, {'kind': 'literal', 'value': '왕'}, 'syj:describedAs'),
                         claim('participant', 'event', old, 'syj:hasParticipant')], 'hasMore': True}
    original = deepcopy(source)
    rows = [identity_row(), identity_row('ent-wea-sejong', old, '세종장헌왕', '세종장헌대왕'),
            identity_row('unrelated-old', 'person-encykorea-unrelated')]
    original_rows = deepcopy(rows)
    result = merge_same_entities(source, identity_rows=rows)
    assert source == original and rows == original_rows
    entities = {e['id']: e for e in result['entities']}
    assert entities[old]['mergedInto'] == canonical
    assert entities[canonical] == entity(canonical, '세종',
        mergedIds=['ent-wea-sejong', old], aliases=['세종장헌왕', '세종장헌대왕'])
    assert set(entities) == {old, canonical, 'event'}
    claims = {c['id']: c for c in result['claims']}
    assert claims['description']['subject'] == canonical
    assert claims['description']['subjectLabel'] == '세종'
    assert claims['participant']['object']['id'] == canonical
    identity = claims['claim-identity-192-' + old]
    assert (identity['subject'], identity['object']['id']) == (old, canonical)
    assert (identity['fromSource'], identity['citesChunk'], identity['quote']) == ('src-test', 'chunk-test', '같은 인물')
    assert identity['chunk']['locator'] == '1쪽'
    assert identity['chunk']['permalink'] == 'https://example.org/source'
    assert identity['note'] == '동일성 근거'
    assert len(claims) == 4
    assert result['hasMore'] is True


def test_map_alone_merges_without_identity_claims_and_keeps_unknown_entities():
    old, canonical = 'ent-wga-sejong', 'person-encykorea-sejong-e0029857'
    mapping, entities = build_same_entity_map({'entities': [], 'claims': []}, [identity_row()])
    unknown = entity('unmapped', '그대로', aliases=['다른 표기'])
    untouched = claim('unknown', 'unmapped', 'unmapped', 'syj:relatedTo')
    result = apply_same_entity_map({
        'entities': [entity(old, '세종장헌대왕'), unknown],
        'claims': [claim('description', old, {'kind': 'literal', 'value': '왕'}, 'syj:describedAs'), untouched],
        'hasMore': False}, mapping, entities)
    assert all(c['predicate'] != 'syj:sameEntityAs' for c in result['claims'])
    assert result['claims'][0]['subject'] == canonical
    assert next(e for e in result['entities'] if e['id'] == 'unmapped') == unknown
    assert result['claims'][1] == untouched
    assert next(e for e in result['entities'] if e['id'] == canonical)['label'] == '세종'


def test_external_and_response_identities_form_one_transitive_map():
    old, middle, canonical = 'ent-wga-sejong', 'person-hs-sejong', 'person-encykorea-sejong-e0029857'
    result = merge_same_entities({
        'entities': [entity(old, '세종장헌대왕'), entity(middle, '세종장헌왕')],
        'claims': [claim('identity', old, middle)], 'hasMore': False},
        [identity_row(middle, canonical, '세종장헌왕')])
    by_id = {e['id']: e for e in result['entities']}
    assert by_id[old]['mergedInto'] == by_id[middle]['mergedInto'] == canonical
    assert by_id[canonical]['mergedIds'] == [old, middle]
    assert next(c for c in result['claims'] if c['id'] == 'identity')['object']['id'] == middle


def test_external_identity_does_not_merge_different_types():
    source = {'entities': [entity('ent-wga-sejong', '세종장헌대왕')], 'claims': [], 'hasMore': False}
    result = merge_same_entities(source, [identity_row(objectType=NS + 'Place')])
    assert result['entities'] == source['entities']
    assert result['claims'][0]['predicate'] == 'syj:sameEntityAs'


def test_map_rewrites_time_object_id_without_changing_original_date():
    rows = [identity_row('time-old', 'time-hs-canonical', subjectType=NS + 'TimeSpan', objectType=NS + 'TimeSpan')]
    obj = {'kind': 'time', 'id': 'time-old', 'year': 1418, 'verbatim': '즉위년', 'precision': 'year'}
    result = merge_same_entities({'entities': [entity('event', kind='Event'), entity('time-old', kind='TimeSpan')],
                                 'claims': [claim('date', 'event', obj, 'syj:occurredAt')], 'hasMore': False}, rows)
    assert next(c for c in result['claims'] if c['id'] == 'date')['object'] == dict(obj, id='time-hs-canonical')


def test_canonical_metadata_is_shared_by_responses_with_different_members():
    rows = [identity_row(), identity_row('ent-wea-sejong', subject_label='세종장헌왕')]
    results = [merge_same_entities({'entities': [entity(row['subject'].removeprefix(NS), row['subjectLabel'])],
                                   'claims': [], 'hasMore': False}, rows) for row in rows]
    canonical = 'person-encykorea-sejong-e0029857'
    assert next(e for e in results[0]['entities'] if e['id'] == canonical) == next(
        e for e in results[1]['entities'] if e['id'] == canonical)


@pytest.mark.parametrize('row_count', [1, 2000, 2001])
def test_chronicle_queries_unbounded_selected_identities_separately(row_count):
    identity = identity_row()
    rows = [dict(identity, claim=NS + f'claim-description-{i:04}', predicate=NS + 'describedAs',
                 objectKind=NS + 'objectLiteral', object=f'설명 {i}') for i in range(row_count)]
    queries = []

    def query(sparql):
        queries.append(sparql)
        return rows if 'LIMIT 2001' in sparql else [identity]

    result = chronicle({'src-test'}, 'ai', query=query)
    assert len(queries) == 2
    identity_query, main_query = queries
    assert 'LIMIT' not in identity_query
    assert 'syj:predicate syj:sameEntityAs' in identity_query
    assert '?subject a ?subjectType' in identity_query and '?object a ?objectType' in identity_query
    assert '?subject rdfs:label ?subjectLabel' in identity_query
    assert '?object rdfs:label ?objectLabel' in identity_query
    for sparql in (identity_query, main_query):
        assert f'FILTER(?source IN (<{NS}src-test>))' in sparql
        assert 'FILTER(?origin = "ai")' in sparql
    assert result['hasMore'] is (row_count > 2000)
    assert len(result['claims']) == min(row_count, 2000) + 1
    descriptions = [c for c in result['claims'] if c['predicate'] == 'syj:describedAs']
    assert all(c['subject'] == 'person-encykorea-sejong-e0029857' for c in descriptions)
    assert sum(c['id'] == 'claim-identity-192-ent-wga-sejong' for c in result['claims']) == 1
