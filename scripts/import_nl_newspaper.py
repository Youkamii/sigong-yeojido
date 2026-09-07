"""Extract the original article text from the NL newspaper LOD snapshot (#90)."""
import argparse
from collections import Counter
from datetime import date
import hashlib
import json
from pathlib import Path
import sys
from zipfile import ZipFile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'services'))
import ttl_check as T


KEY = 'nl-dokrip-1896-1899'
SOURCE = 'src-' + KEY
ZIP_SHA256 = '1cb9fa2236907ec78ac2de9a580e7179982aeb1a04bb18fb0d7a5eabfb82458d'
TTL_SHA256 = 'f481d60335861a5e8ffd3ae9a304059ea31b57b61cdcf4229787d125e3be57ab'
D = 'http://purl.org/dc/terms/'
N = 'http://lod.nl.go.kr/ontology/'
BF = 'http://id.loc.gov/ontologies/bibframe/'
DC = 'http://purl.org/dc/elements/1.1/'


def digest(value):
    return hashlib.sha256(value.encode('utf-8') if isinstance(value, str) else value).hexdigest()


def split_article(abstract):
    start = len('원문 :') if abstract.startswith('원문 :') else 0
    remainder = abstract[start:]
    marker = '번역문 :' if '번역문 :' in remainder else '문 :'
    assert remainder.count(marker) == 1, 'Unreviewed article separator'
    end = start + remainder.index(marker)
    original = abstract[start:end]
    modernized = abstract[end + len(marker):]
    assert original.strip() and modernized.strip()
    return original, {'prefix': abstract[:start], 'separator': marker, 'originalStart': start,
                      'originalEnd': end, 'providerAbstractSha256': digest(abstract),
                      'modernizedChars': len(modernized), 'modernizedSha256': digest(modernized)}


def read_articles(archive):
    assert digest(archive.read_bytes()) == ZIP_SHA256, 'The downloaded snapshot changed'
    with ZipFile(archive) as z:
        assert z.namelist() == ['독립신문(서재필).ttl']
        raw = z.read(z.namelist()[0])
    assert digest(raw) == TTL_SHA256
    parsed = T.check_text(raw.decode('utf-8'))
    assert parsed.ok, parsed.errors
    assert parsed.triples == 739883
    graph = T.Index(parsed.graph)
    rows = []
    subjects = sorted({s for s, p, _ in parsed.graph if p == D + 'issued'})
    for subject in subjects:
        def values(predicate):
            return sorted({T.literal_value(value) if T.is_literal(value) else value
                           for value in graph.objects(subject, predicate)})

        def one(predicate):
            found = values(predicate)
            assert len(found) == 1, (subject, predicate, len(found))
            return found[0]

        issued = one(D + 'issued')
        assert len(issued) == 8 and issued.isdigit()
        published = date(int(issued[:4]), int(issued[4:6]), int(issued[6:8]))
        assert one(N + 'titleOfHostItem') == '독립신문(서재필)'
        assert one(D + 'accessRights') == 'http://lod.nl.go.kr/resource/license0'
        abstract = one(D + 'abstract')
        text, separation = split_article(abstract)
        identifier = str(subject).rsplit('/', 1)[-1]
        row = {'id': 'chunk-' + KEY + '-' + identifier.lower(), 'sourceId': SOURCE,
               'text': text, 'charCount': len(text), 'title': one(D + 'title'), 'lang': 'ko',
               'date': published.isoformat(), 'dateKind': 'newspaper-publication',
               'publicationDate': published.isoformat(), 'publicationDateRaw': issued,
               'permalink': 'https://nl.go.kr/newspaper/detail.do?content_id=' + identifier,
               'locator': ' · '.join([published.isoformat(), *values(N + 'relatedParts'), *values(N + 'newsPosition')]),
               'chunkType': 'newspaper-article', 'recordId': identifier,
               'volumeIssueRaw': values(N + 'relatedParts'), 'positionRaw': values(N + 'newsPosition'),
               'extentRaw': values(BF + 'extent'), 'descriptionRaw': values(D + 'description'),
               'publisherRaw': values(DC + 'publisher'), 'holdingInstitutionRaw': values(N + 'holdingInstitution'),
               'providerDataPublishedRaw': values(N + 'datePublished'),
               'accessRightsRaw': one(D + 'accessRights'), 'abstractSeparation': separation,
               'textStatus': 'provider-original-transcription',
               'modernizedTextStatus': 'available-in-provider-file-not-included',
               'imageStatus': 'not-collected-viewer-robots-disallow',
               'containsPrivateUseCharacters': any(0xE000 <= ord(c) <= 0xF8FF for c in text),
               'annotations': [], 'index': []}
        rows.append(row)
    rows.sort(key=lambda row: (row['date'], row['recordId']))
    assert len(rows) == len({r['id'] for r in rows}) == 19635
    assert len({r['date'] for r in rows}) == 776
    assert Counter(r['abstractSeparation']['separator'] for r in rows) == {'번역문 :': 19601, '문 :': 34}
    assert sum(not r['abstractSeparation']['prefix'] for r in rows) == 1
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--zip', type=Path, required=True)
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    rows = read_articles(args.zip)
    args.out.mkdir(parents=True, exist_ok=True)
    chunks = ''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in rows)
    (args.out / 'chunks.jsonl').write_text(chunks, encoding='utf-8', newline='\n')
    report = {'source': SOURCE, 'articles': len(rows), 'publicationDates': len({r['date'] for r in rows}),
              'firstDate': rows[0]['publicationDate'], 'lastDate': rows[-1]['publicationDate'],
              'byYear': dict(Counter(r['date'][:4] for r in rows)),
              'separators': dict(Counter(r['abstractSeparation']['separator'] for r in rows)),
              'privateUseCharacterArticles': sum(r['containsPrivateUseCharacters'] for r in rows),
              'zipSha256': ZIP_SHA256, 'ttlSha256': TTL_SHA256, 'chunksSha256': digest(chunks),
              'newClaims': 0, 'collectedImages': 0, 'includedModernizedTexts': 0}
    (args.out / 'extraction.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
