from copy import deepcopy
from pathlib import Path
import sys
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'services'))
from chronicle_query import chronicle, merge_same_entities
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
