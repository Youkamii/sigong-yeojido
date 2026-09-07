"""Cited people, events and polities for one time-driven 3D view (#91)."""
import json
from graph_query import NS, query_rows
from time_query import selected_filter, _claim


def chronicle(sources=None, origin='all'):
    if origin not in ('all', 'ai', 'human'):
        raise ValueError('origin must be all, human or ai')
    result = {'entities': [], 'claims': [], 'hasMore': False}
    if sources is not None and not sources:
        return result
    rows = query_rows(f'''
SELECT DISTINCT ?claim ?subject ?subjectType ?subjectLabel ?predicate ?objectKind ?object
       ?objectType ?objectLabel ?verbatim ?precision ?year ?earliest ?latest
       ?source ?sourceLabel ?chunk ?quote ?origin ?status ?locator ?permalink ?note
       ?lat ?lon ?validFrom ?validTo ?geographyObject
WHERE {{
  VALUES ?subjectType {{syj:Person syj:Event syj:Polity syj:Place syj:TimeSpan}}
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
    return result
