"""Integrate actual Opus-collected people/event excerpts for time exploration (#92)."""
import argparse
from collections import defaultdict
from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path
import shutil
import sys

from import_location_research import markdown
from import_pyongyang_identity import Text

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'services'))
from frontmatter import parse_front_matter


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text(encoding='utf-8') == text:
        return
    path.write_text(text, encoding='utf-8', newline='\n')


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--research', type=Path, required=True)
    ap.add_argument('--data', type=Path, default=Path('data'))
    ap.add_argument('--out', type=Path, required=True)
    ap.add_argument('--check-only', action='store_true')
    args = ap.parse_args()
    job = args.research.name
    run = json.loads((args.research / 'run.json').read_text(encoding='utf-8'))
    assert run['exitCode'] == 0 and not run['isError']
    assert run['modelsObserved'] == ['claude-opus-5'] and run['effort'] == 'max'
    draft = json.loads((args.research / 'result.json').read_text(encoding='utf-8'))
    # The unpublished collector IDs refer to these already named AKS entities.
    ids = {'person-encykorea-yi-seonggye-e0059033': 'person-encykorea-yi-seonggye',
           'event-encykorea-joseon-founding-1392': 'event-joseon-founding-1392',
           'event-samil-movement-1919': 'event-encykorea-samil-movement-1919',
           'place-taehwagwan': 'place-encykorea-taehwagwan',
           'event-encykorea-haengju-daecheop-1593': 'event-khs-haengju'}
    for entity in draft['entities']:
        entity['id'] = ids.get(entity['id'], entity['id'])
    for claim in draft['claims']:
        claim['subject'] = ids.get(claim['subject'], claim['subject'])
        if claim['object']['kind'] == 'entity':
            target = claim['object']['id']
            claim['object']['id'] = ids.get(target, target)
        if claim['id'] in ('claim-joseonfounding-part-taejong', 'claim-joseonfounding-part-gongyang'):
            claim['predicate'] = 'syj:relatedTo'
    manifest = json.loads((args.research / 'manifest.json').read_text(encoding='utf-8'))
    downloads = {r['url']: r for r in manifest if r.get('httpStatus') == 200}
    chunks, sources, by_source = {}, {}, defaultdict(list)
    files, checks = {}, []
    for source in draft['sources']:
        sid, url = source['id'], source['url']
        record = downloads[url]
        raw_path = (args.research / source['rawFile']).resolve()
        assert raw_path.is_relative_to(args.research.resolve())
        raw = raw_path.read_bytes()
        digest = sha256(raw).hexdigest()
        assert digest == source['sha256'] == record['sha256']
        assert len(raw) == record['byteLength']
        parser = Text(); parser.feed(raw.decode('utf-8'))
        text = ''.join(parser.parts)
        spaced_text = ' '.join(' '.join(parser.parts).split())
        assert sum(len(e['text'].split()) for e in source['excerpts']) <= 25, sid
        rows = []
        for excerpt in source['excerpts']:
            assert excerpt['text'] and (excerpt['text'] in text or excerpt['text'] in spaced_text), (sid, excerpt['id'], 'raw quotation mismatch')
            cid = 'chunk_period92_' + job + '_' + excerpt['id'].removeprefix('ex-')
            row = {'id': cid, 'sourceId': sid, 'text': excerpt['text'], 'locator': excerpt['locator'],
                   'permalink': url, 'sourceUrl': url, 'lang': 'ko', 'date': None,
                   'chunkType': 'excerpt', 'pageSha256': digest, 'collectedBy': 'claude-opus-5',
                   'collectionSession': run['sessionId'], 'fetchedAt': record['fetchedUtc']}
            assert excerpt['id'] not in chunks, excerpt['id']
            chunks[excerpt['id']] = row
            rows.append(row)
        key = sid.removeprefix('src-')
        path = args.data / 'sources' / key / 'chunks.jsonl'
        existing = [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()] if path.exists() else []
        old = {r['id']: r for r in existing}
        for row in rows:
            if row['id'] in old:
                assert old[row['id']] == row
            else:
                existing.append(row)
        files[path] = ''.join(json.dumps(r, ensure_ascii=False, sort_keys=True) + '\n' for r in existing)
        card = args.data / 'sources' / (key + '.md')
        if card.exists():
            meta, _ = parse_front_matter(card.read_text(encoding='utf-8'))
            assert meta['id'] == sid
            assert meta.get('resource', url).rstrip('/') == url.rstrip('/'), (sid, 'source URL mismatch')
        else:
            files[card] = markdown({'type':'Source', 'id':sid, 'label':source['title'],
                'sourceKind':'백과사전 항목의 짧은 발췌', 'sourceGroup':'한국민족문화대백과사전',
                'compiler':source['publisher'], 'composedYear':None, 'coversFrom':None, 'coversTo':None,
                'defaultLens':True, 'resource':url, 'originalLanguage':'ko',
                'edition':'2026-09-07 제공 페이지', 'license':'short-excerpt-only', 'status':'draft', 'verified':None},
                f"[출처: {source['title']}]({url})\n\n" + source['license'] +
                '\n\n시간 탐색에 필요한 짧은 인용만 수록했다. 원 HTML은 별도 수집 폴더에 보관한다. '
                '조사·다운로드·추출은 Claude Opus 5 / Max, 코드 통합·원문 대조는 Codex가 수행했다. '
                '생몰년·재위·활동·사건 연대는 각 인용에 따르며 미상값과 자료 안의 다른 연대를 보존한다.')
        sources[sid] = source
        checks.append({'source':sid, 'url':url, 'sha256':digest, 'rawBytes':len(raw),
                       'excerpts':len(rows), 'quotedWords':sum(len(r['text'].split()) for r in rows)})
    for original in draft['claims']:
        claim = deepcopy(original)
        row = chunks[claim.pop('citesExcerpt')]
        sid = claim.pop('sourceId')
        assert row['sourceId'] == sid
        claim['id'] = 'claim-period92-' + job + '-' + claim['id'].removeprefix('claim-')
        obj = claim['object']
        if obj['kind'] == 'time':
            assert obj['verbatim'] in row['text'], claim['id']
            obj['id'] = 'ts-period92-' + job + '-' + obj['id'].removeprefix('ts-')
        for value in ([obj['value']] if obj['kind'] == 'year' else [obj[k] for k in ('earliest','latest','year') if k in obj]):
            assert str(value) in row['text'], (claim['id'], 'numeric year absent from quotation', value)
        claim.update(fromSource=sid, citesChunk=row['id'], quote=row['text'], origin='ai', status='draft',
                     generatedBy='claude-opus-5', generatedAt='2026-09-07')
        by_source[sid].append(claim)
    for entity in draft['entities']:
        path = args.data / 'entities' / entity['type'].lower() / (entity['id'] + '.md')
        if path.exists():
            meta, _ = parse_front_matter(path.read_text(encoding='utf-8'))
            assert meta['type'] == entity['type'] and meta['id'] == entity['id']
        else:
            files[path] = markdown({k:entity[k] for k in ('id','type','label')}, entity.get('ambiguity','')).rstrip() + '\n'
    for sid, claims in by_source.items():
        for cid in dict.fromkeys(c['citesChunk'] for c in claims):
            path = args.data / 'claims' / sid.removeprefix('src-') / 'period92' / (cid + '.md')
            files[path] = markdown({'type':'Claims', 'source':sid, 'chunk':cid, 'generated':'claude-opus-5', 'status':'draft'},
                '```claims-json\n' + json.dumps([c for c in claims if c['citesChunk'] == cid], ensure_ascii=False, indent=2) + '\n```')
    report = {'job':job, 'sources':len(sources), 'excerpts':len(chunks),
              'claims':sum(map(len,by_source.values())), 'entities':len(draft['entities']),
              'rawFilesChecked':checks, 'missing':draft.get('missing',[]), 'collection':run,
              'downloadPerformedBy':'claude-opus-5 via its Bash tool', 'integrationPerformedBy':'Codex',
              'reviewedEntityIds':ids,
              'checkOnly':args.check_only}
    if not args.check_only:
        for path, text in files.items():
            write(path, text)
        saved = args.data / 'research' / 'periods-92' / job
        saved.mkdir(parents=True, exist_ok=True)
        for name in ('run.json','manifest.json','progress.json','result.json','report.md'):
            if (args.research / name).exists():
                shutil.copyfile(args.research / name, saved / name)
    write(args.out, json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ('rawFilesChecked','missing','collection')},ensure_ascii=False))


if __name__ == '__main__':
    main()
