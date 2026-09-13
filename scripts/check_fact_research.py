#!/usr/bin/env python3
"""사실 조사 묶음의 구조, 근거, 연도와 커버리지를 검사한다 (#180)."""
import argparse
from collections import Counter, defaultdict
from datetime import datetime
from hashlib import sha256
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlparse

from scene_vocabulary import HERITAGE_TYPES
from search_chunks import ROOT, SOURCES, iter_chunks, year_of

CATEGORIES = ('settlement', 'administration', 'facility', 'economy', 'disaster',
              'culture', 'transport', 'foreign', 'person', 'war')
REGIONS = ('capital', 'north', 'central', 'south', 'island')
KINDS = ('settlement', 'construction', 'battle', 'siege', 'naval', 'fire', 'court',
         'assembly', 'publication', 'excavation', 'tradition', 'disaster', 'relief',
         'market', 'ritual', 'migration', 'survey', 'portrait', 'heritage')
FUNCTIONS = ('rail_station', 'temple', 'print_workshop', 'migration', 'persecution',
             'naval_expedition', 'civil_conflict', 'uprising_battle', 'market', 'relief',
             'construction_site', 'fortress', 'harbor', 'kiln', 'irrigation', 'portrait', 'heritage')
WEB_HOSTS = ('encykorea.aks.ac.kr', 'ko.wikipedia.org', 'en.wikipedia.org',
             'heritage.go.kr', 'museum.go.kr', 'nrich.go.kr')


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def norm(value):
    return re.sub(r'\s+', '', value)


def normalized_url(value):
    return unquote(value).rstrip('/')


class Text(HTMLParser):
    # import_pyongyang_identity.Text와 같은 HTML 텍스트 추출.
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, value):
        self.parts.append(value)


def web_year_supported(value, obj, quoted):
    """import_period_research의 BCE/세기/이듬해 예외까지 복제한다."""
    supported = str(value) in quoted if value >= 0 else (
        str(abs(value)) in quoted and any(marker in quoted for marker in ('기원전', '서기전', 'B.C.', 'BCE', 'BC')))
    if not supported and obj.get('precision') == 'century' and value < 0:
        century = re.search(r'(?:기원전|서기전)\s*(\d+)세기', quoted)
        supported = bool(century and value == -int(century[1]) * 100 and value == obj.get('earliest'))
    if not supported and obj.get('kind') == 'time' and value == obj.get('latest'):
        earliest = obj.get('earliest')
        supported = (type(earliest) is int and '이듬해' in obj.get('verbatim', '')
                     and value == earliest + 1 and str(earliest) in quoted)
    return supported


class Check:
    def __init__(self, folder, predicates, chunks):
        self.folder = folder
        self.predicates = predicates
        self.chunks = chunks
        self.failures = []
        self.warnings = []
        self.claims = {}
        self.sources = {}
        self.excerpts = {}

    def fail(self, item, reason, file='result.json'):
        self.failures.append(f'{self.folder.name}/{file}/{item}/{reason}')

    def shape(self, value, fields, item, file='result.json'):
        if not isinstance(value, dict):
            self.fail(item, '객체가 필요합니다', file)
            return False
        valid = True
        for key, kind in fields.items():
            child = value.get(key)
            ok = key in value
            if kind == 'str':
                ok = ok and nonempty(child)
            elif kind == 'int':
                ok = ok and type(child) is int
            elif kind == 'number':
                ok = ok and number(child)
            elif kind == 'text':
                ok = ok and isinstance(child, str)
            elif kind in (dict, list):
                ok = ok and isinstance(child, kind)
            if not ok:
                self.fail(f'{item}.{key}', '필수 필드 누락 또는 잘못된 자료형', file)
                valid = False
        return valid

    def read(self, name):
        try:
            value = json.loads((self.folder / name).read_text(encoding='utf-8'))
            if value is None:
                self.fail('$', 'null은 허용하지 않습니다', name)
            return value
        except (OSError, ValueError) as exc:
            self.fail('$', str(exc), name)
            return None

    def rows(self, rows, name, fields):
        result = {}
        for index, row in enumerate(rows):
            where = f'{name}[{index}]'
            if not self.shape(row, {'id': 'str', **fields}, where):
                continue
            if row['id'] in result:
                self.fail(where, f'중복 id: {row["id"]}')
                continue
            result[row['id']] = row
        return result

    def enum(self, value, allowed, item):
        if value not in allowed:
            self.fail(item, f'허용 밖 값: {value!r}')

    def refs(self, values, index, item, required=False):
        if not isinstance(values, list) or (required and not values):
            self.fail(item, '비지 않은 참조 목록이 필요합니다' if required else '참조 목록이 필요합니다')
            return []
        valid = []
        for value in values:
            if not isinstance(value, str) or value not in index:
                self.fail(item, f'참조 없음: {value!r}')
            else:
                valid.append(value)
        return valid

    def run(self, run):
        fields = dict(task='str', runner='str', modelRequested='str', effort='str',
                      modelsObserved=list, started='number', exitCode='int', isError=None, sessionId='str')
        if not self.shape(run, fields, '$', 'run.json'):
            return
        conditions = {
            'task': run['task'] == self.folder.name,
            'modelRequested': run['modelRequested'] == 'claude-opus-5',
            'modelsObserved': run['modelsObserved'] == ['claude-opus-5'],
            'effort': run['effort'] in (('high', 'max') if run['runner'] == 'workflow' else ('max',)),
            'started': run['started'] >= 0,
            'exitCode': run['exitCode'] == 0,
            'isError': run['isError'] is False,
        }
        for key, ok in conditions.items():
            if not ok:
                self.fail(key, 'run 조건 위반', 'run.json')

    def raw_record(self, row, item, file):
        fields = dict(url='str', fetchedUtc='str', httpStatus='int', byteLength='int', sha256='str', rawFile='str')
        if not self.shape(row, fields, item, file):
            return None
        try:
            parsed = urlparse(row['url'])
            if parsed.scheme not in ('http', 'https') or not parsed.hostname:
                raise ValueError('올바른 웹 URL이 필요합니다')
            host = parsed.hostname.lower()
            if host == 'db.history.go.kr' or host.endswith('.db.history.go.kr'):
                raise ValueError('db.history.go.kr 웹 수집 금지: 로컬 chunk를 인용하세요')
            fetched = datetime.fromisoformat(row['fetchedUtc'].replace('Z', '+00:00'))
            if fetched.utcoffset() is None or fetched.utcoffset().total_seconds() != 0:
                raise ValueError('fetchedUtc는 UTC 시각이어야 합니다')
            path = (self.folder / row['rawFile']).resolve()
            if not path.is_relative_to((self.folder / 'raw').resolve()) or path.suffix.lower() != '.html':
                raise ValueError('rawFile은 job 안의 raw/*.html이어야 합니다')
            raw = path.read_bytes()
            if row['httpStatus'] != 200:
                self.fail(item, 'httpStatus는 200이어야 합니다', file)
            if len(raw) != row['byteLength']:
                self.fail(item, 'byteLength 불일치', file)
            if sha256(raw).hexdigest() != row['sha256']:
                self.fail(item, 'sha256 불일치', file)
            return raw
        except (OSError, ValueError, OverflowError) as exc:
            self.fail(item, str(exc), file)
            return None

    def web(self, sources, manifest):
        records = {}
        if not isinstance(manifest, list):
            if manifest is not None:
                self.fail('$', '배열이 필요합니다', 'manifest.json')
            manifest = []
        for i, record in enumerate(manifest):
            raw = self.raw_record(record, f'[{i}]', 'manifest.json')
            if not isinstance(record, dict) or not nonempty(record.get('url')):
                continue
            key = normalized_url(record['url'])
            if key in records:
                self.fail(f'[{i}]', '중복 URL', 'manifest.json')
            records[key] = (record, raw)
        self.sources = self.rows(sources, 'sources', dict(title='str', publisher='str', url='str',
            rawFile='str', sha256='str', httpStatus='int', byteLength='int', fetchedUtc='str', excerpts=list))
        for sid, source in self.sources.items():
            item = f'sources[{sid}]'
            if not nonempty(source.get('license')):
                self.warnings.append(f'{self.folder.name}/result.json/{item}.license/license 문자열 없음')
            try:
                host = urlparse(source['url']).hostname or ''
            except ValueError:
                host = ''
            allowed = any(host == domain or host.endswith('.' + domain) for domain in WEB_HOSTS)
            record, raw = records.get(normalized_url(source['url']), ({}, None))
            if not record:
                self.fail(item, 'manifest에 URL 없음')
            else:
                for key in ('rawFile', 'sha256', 'httpStatus', 'byteLength', 'fetchedUtc'):
                    if source[key] != record.get(key):
                        self.fail(f'{item}.{key}', 'manifest와 불일치')
            if not allowed:
                license_text = source.get('license')
                kogl = isinstance(license_text, str) and ('공공누리' in license_text or 'KOGL' in license_text)
                marked = raw is not None and ('공공누리'.encode() in raw or b'kogl.or.kr' in raw)
                if not (kogl and marked):
                    self.fail(item, '허용 출처가 아니며 원본의 공공누리 표시도 없음')
            excerpts = self.rows(source['excerpts'], item + '.excerpts', dict(text='str', locator='str'))
            if sum(len(e['text'].split()) for e in excerpts.values()) > 25:
                self.fail(item, '발췌 25단어 초과')
            views = None
            if raw is not None:
                try:
                    parser = Text()
                    parser.feed(raw.decode('utf-8'))
                    text = ''.join(parser.parts)
                    views = (text, ' '.join(text.split()), ' '.join(' '.join(parser.parts).split()))
                except UnicodeError as exc:
                    self.fail(item, str(exc))
            for eid, excerpt in excerpts.items():
                if eid in self.excerpts:
                    self.fail(item + '.excerpts', f'중복 excerpt id: {eid}')
                self.excerpts[eid] = (sid, excerpt['text'])
                if views is not None and not any(excerpt['text'] in view for view in views):
                    self.fail(f'{item}.excerpts[{eid}]', 'HTML 인용 불일치')

    def coordinates(self, obj, item):
        ok = True
        for key, limit in (('lon', 180), ('lat', 90)):
            if not number(obj.get(key)) or abs(obj[key]) > limit:
                self.fail(f'{item}.{key}', '좌표 범위 또는 자료형 오류')
                ok = False
        return ok

    def claim(self, claim):
        item = f'claims[{claim["id"]}]'
        obj = claim['object']
        kind = obj.get('kind')
        rule = self.predicates.get(claim['predicate'])
        if rule is None:
            self.fail(item + '.predicate', '허용 밖 predicate')
        elif kind not in rule['object']:
            self.fail(item + '.object.kind', 'predicate에 허용되지 않는 object.kind')
        values = []
        if kind == 'year':
            if self.shape(obj, dict(value='int'), item + '.object'):
                values = [obj['value']]
        elif kind == 'time':
            if self.shape(obj, dict(verbatim='str', year='int', precision='str', earliest='int', latest='int'), item + '.object'):
                self.enum(obj['precision'], ('year', 'month', 'day', 'decade', 'century'), item + '.object.precision')
                values = [obj[k] for k in ('year', 'earliest', 'latest')]
        elif kind == 'entity':
            self.shape(obj, dict(id='str'), item + '.object')
        elif kind == 'literal':
            if self.shape(obj, dict(value=None), item + '.object'):
                if not (nonempty(obj['value']) or number(obj['value'])):
                    self.fail(item + '.object.value', '문자열 또는 수가 필요합니다')
                if rule and rule.get('numeric') and (not number(obj['value']) or obj['value'] < 0):
                    self.fail(item + '.object.value', '0 이상의 수가 필요합니다')
                if rule and 'unit' in rule and obj.get('unit') != rule['unit']:
                    self.fail(item + '.object.unit', f'단위는 {rule["unit"]}이어야 합니다')
                if 'unit' in obj and not nonempty(obj['unit']):
                    self.fail(item + '.object.unit', '문자열이 필요합니다')
        elif kind == 'location':
            self.coordinates(obj, item + '.object')
            self.enum(obj.get('precision'), ('site', 'area', 'region'), item + '.object.precision')
            for holder, path in ((obj, item + '.object'), (claim, item)):
                for key in ('validFrom', 'validTo'):
                    if key in holder and type(holder[key]) is not int:
                        self.fail(path + '.' + key, '정수 연도가 필요합니다')
                if all(type(holder.get(k)) is int for k in ('validFrom', 'validTo')) and holder['validFrom'] > holder['validTo']:
                    self.fail(path, 'validFrom > validTo')
        else:
            self.fail(item + '.object.kind', '허용 밖 object.kind')
        if 0 in values:
            self.fail(item + '.object', '서기 0년은 허용하지 않습니다')
        local = 'citesChunk' in claim
        web = 'citesExcerpt' in claim
        if local == web:
            self.fail(item, 'citesChunk 또는 citesExcerpt 중 하나가 필요합니다')
            return
        citation = claim.get('citesChunk' if local else 'citesExcerpt')
        if not nonempty(citation):
            self.fail(item, '비지 않은 인용 id가 필요합니다')
            return
        year_mismatch = False
        if local:
            chunk = self.chunks.get(citation)
            if chunk is None:
                self.fail(item + '.citesChunk', 'chunk 없음: ' + citation)
                return
            if claim['sourceId'] != chunk.get('sourceId'):
                self.fail(item + '.sourceId', 'chunk의 sourceId와 불일치')
            quote = claim.get('quote')
            quote_ok = nonempty(quote) and norm(quote) in norm(chunk.get('text', ''))
            if not quote_ok:
                self.fail(item + '.quote', '인용 불일치: quote가 chunk text에 없음')
            if kind == 'time' and nonempty(obj.get('verbatim')) and quote_ok:
                if norm(obj['verbatim']) not in norm(chunk['text']) or norm(obj['verbatim']) not in norm(quote):
                    self.fail(item + '.object.verbatim', 'verbatim이 chunk text와 quote 양쪽에 있어야 합니다')
            date = chunk.get('date')
            raw = date.get('raw') if isinstance(date, dict) else date
            year = year_of(raw)
            if year is not None and values and any(value != year for value in values):
                self.fail(item + '.object', f'연도 불일치: date.raw 서기연 {year}')
                year_mismatch = True
        else:
            excerpt = self.excerpts.get(citation)
            if excerpt is None:
                self.fail(item + '.citesExcerpt', 'excerpt 없음: ' + citation)
                return
            sid, quoted = excerpt
            if claim['sourceId'] != sid:
                self.fail(item + '.sourceId', 'excerpt의 sourceId와 불일치')
            if kind == 'time' and nonempty(obj.get('verbatim')) and obj['verbatim'] not in quoted:
                self.fail(item + '.object.verbatim', 'verbatim이 발췌에 없음')
            if values and any(not web_year_supported(value, obj, quoted) for value in values):
                self.fail(item + '.object', '연도 숫자가 발췌에 없음')
                year_mismatch = True
        if kind == 'time' and values and not year_mismatch and not obj['earliest'] <= obj['year'] <= obj['latest']:
            self.fail(item + '.object', 'earliest <= year <= latest 위반')

    def category_decade(self, row, year_key, item):
        self.enum(row['category'], CATEGORIES, item + '.category')
        self.enum(row['region'], REGIONS, item + '.region')
        if row['decade'] != row[year_key] // 10 * 10:
            self.fail(item + '.decade', f'{year_key}를 10으로 내린 값과 불일치')

    def persistence(self, value, item, scene=False):
        fields = dict(kind='str', **{'from': 'int', 'to': None})
        if scene:
            fields['basisClaimIds'] = list
        if not self.shape(value, fields, item):
            return
        self.enum(value['kind'], ('city', 'facility', 'institution', 'none'), item + '.kind')
        end = value['to']
        if end is not None and (type(end) is not int or end < value['from']):
            self.fail(item, 'persistence.to는 null 또는 from 이상의 정수')
        if scene:
            self.refs(value['basisClaimIds'], self.claims, item + '.basisClaimIds', value['kind'] != 'none')

    def location_basis(self, lon, lat, claim_ids=(), source_ids=(), excerpt_ids=None):
        for cid in claim_ids:
            obj = self.claims[cid]['object']
            if obj.get('kind') == 'location' and obj.get('lon') == lon and obj.get('lat') == lat:
                return True
        for eid, (sid, text) in self.excerpts.items():
            if sid not in source_ids or (excerpt_ids is not None and eid not in excerpt_ids):
                continue
            # 십진 좌표 두 수가 같은 발췌에 실제로 존재해야 한다.
            numbers = [float(n) for n in re.findall(r'(?<![\w.])-?\d+(?:\.\d+)?(?![\w.])', text)]
            if lon in numbers and lat in numbers:
                return True
        return False

    def scene(self, scene):
        item = f'scenes[{scene["id"]}]'
        self.category_decade(scene, 'startYear', item)
        self.enum(scene['kind'], KINDS, item + '.kind')
        if scene['kind'] == 'heritage' or 'heritageType' in scene:
            self.enum(scene.get('heritageType'), HERITAGE_TYPES, item + '.heritageType')
        if 'heritageFloors' in scene and (type(scene['heritageFloors']) is not int or scene['heritageFloors'] not in (3, 5)):
            self.fail(item + '.heritageFloors', '3 또는 5가 필요합니다')
        if scene['startYear'] > scene['endYear']:
            self.fail(item, 'startYear > endYear')
        for key in ('dateClaimIds', 'actionClaimIds'):
            self.refs(scene[key], self.claims, item + '.' + key, True)
        if 'relatedClaimIds' in scene:
            self.refs(scene['relatedClaimIds'], self.claims, item + '.relatedClaimIds')
        if 'sceneFunction' in scene:
            self.enum(scene['sceneFunction'], FUNCTIONS + (('palace', 'office', 'battle', 'village') if scene['kind'] == 'portrait' else ()), item + '.sceneFunction')
        for i, actor in enumerate(scene['participants']):
            path = f'{item}.participants[{i}]'
            if self.shape(actor, dict(entityId='str', claimIds=list), path):
                self.refs(actor['claimIds'], self.claims, path + '.claimIds', True)
        for name, effect in scene['effects'].items():
            path = f'{item}.effects.{name}'
            if self.shape(effect, dict(enabled=None, claimIds=list), path):
                if type(effect['enabled']) is not bool:
                    self.fail(path + '.enabled', '불리언이 필요합니다')
                self.refs(effect['claimIds'], self.claims, path + '.claimIds', effect['enabled'] is True)
        place = scene['place']
        if place is not None and self.shape(place, dict(label='str', medium='str', precision='str',
                lon='number', lat='number', claimIds=list, coordinateSourceIds=list, coordinateNote='str'), item + '.place'):
            self.enum(place['medium'], ('land', 'sea'), item + '.place.medium')
            self.enum(place['precision'], ('site', 'area'), item + '.place.precision')
            self.coordinates(place, item + '.place')
            cids = self.refs(place['claimIds'], self.claims, item + '.place.claimIds')
            sids = self.refs(place['coordinateSourceIds'], self.sources, item + '.place.coordinateSourceIds')
            if not self.location_basis(place['lon'], place['lat'], cids, sids):
                self.fail(item + '.place', '좌표 근거 없음: 동일 좌표의 location 주장 또는 웹 발췌 필요')
        groups = scene.get('participantGroups', [])
        if not isinstance(groups, list):
            self.fail(item + '.participantGroups', '배열이 필요합니다')
        else:
            for i, group in enumerate(groups):
                path = f'{item}.participantGroups[{i}]'
                if self.shape(group, dict(label='str', role='str', stance='str', side='str', count=None, claimIds=list), path):
                    if 'entityId' in group and not nonempty(group['entityId']):
                        self.fail(path + '.entityId', '문자열이 필요합니다')
                    if group['count'] is not None and (not number(group['count']) or group['count'] < 0):
                        self.fail(path + '.count', 'null 또는 0 이상의 수가 필요합니다')
                    self.refs(group['claimIds'], self.claims, path + '.claimIds', True)
        if 'persistence' in scene:
            self.persistence(scene['persistence'], item + '.persistence', True)

    def fact(self, fact, scenes):
        item = f'facts[{fact["id"]}]'
        self.category_decade(fact, 'year', item)
        self.refs(fact['claimIds'], self.claims, item + '.claimIds', True)
        self.enum(fact['confidence'], ('high', 'medium', 'low'), item + '.confidence')
        if fact.get('sceneId') is not None:
            self.refs([fact['sceneId']], scenes, item + '.sceneId')
        if fact.get('lon') is not None or fact.get('lat') is not None:
            if self.coordinates(fact, item):
                basis = fact.get('coordinateBasis')
                if not nonempty(basis):
                    self.fail(item + '.coordinateBasis', '좌표 근거 없음')
                else:
                    tokens = basis.split()
                    cids = [cid for cid in tokens if cid in self.claims]
                    sids = [sid for sid in tokens if sid in self.sources]
                    eids = [eid for eid in tokens if eid in self.excerpts]
                    if not self.location_basis(fact['lon'], fact['lat'], cids, sids, eids):
                        self.fail(item + '.coordinateBasis', '좌표 근거 없음: sourceId excerptId 또는 location claimId 필요')
        if fact.get('persistence') is not None:
            self.persistence(fact['persistence'], item + '.persistence')
        density = fact.get('density')
        if density is not None and self.shape(density, dict(claimIds=list), item + '.density'):
            self.refs(density['claimIds'], self.claims, item + '.density.claimIds', True)
            for key in ('households', 'population'):
                if key in density and (not number(density[key]) or density[key] < 0):
                    self.fail(item + '.density.' + key, '0 이상의 수가 필요합니다')
            if 'unit' in density and not nonempty(density['unit']):
                self.fail(item + '.density.unit', '문자열이 필요합니다')

    def document(self, result, run, manifest):
        if run is not None:
            self.run(run)
        fields = dict(collection='str', job='str', cell=dict, sources=list, entities=list,
                      claims=list, scenes=list, facts=list, missing=list)
        if not self.shape(result, fields, '$'):
            return [], [], []
        if result['job'] != self.folder.name:
            self.fail('job', '작업 폴더 이름과 불일치')
        if result['collection'] != self.folder.parent.name:
            self.fail('collection', 'collection 폴더 이름과 불일치')
        cell = result['cell']
        if self.shape(cell, {'polity': 'str', 'from': 'int', 'to': 'int', 'regions': list, 'categories': dict}, 'cell'):
            if cell['from'] > cell['to']:
                self.fail('cell', 'from > to')
            for region in cell['regions']:
                self.enum(region, REGIONS, 'cell.regions')
            for category, target in cell['categories'].items():
                self.enum(category, CATEGORIES, 'cell.categories')
                if type(target) is not int or target < 0:
                    self.fail('cell.categories.' + category, '0 이상의 정수 목표가 필요합니다')
        self.web(result['sources'], manifest)
        self.rows(result['entities'], 'entities', dict(type='str', label='str'))
        self.rows(result['missing'], 'missing', dict(topic='str', detail='str', neededSource='str'))
        self.claims = self.rows(result['claims'], 'claims', dict(subject='str', predicate='str', object=dict, sourceId='str'))
        for claim in self.claims.values():
            self.claim(claim)
        scenes = self.rows(result['scenes'], 'scenes', dict(eventId='str', title='str', startYear='int', endYear='int',
            kind='str', summary='str', dateClaimIds=list, actionClaimIds=list, place=None, participants=list,
            effects=dict, category='str', region='str', decade='int'))
        for scene in scenes.values():
            self.scene(scene)
        facts = self.rows(result['facts'], 'facts', dict(category='str', region='str', decade='int', year='int',
            yearVerbatim='str', placeLabel='text', modernPlace='text', what='str', claimIds=list, confidence='str', note='text'))
        for fact in facts.values():
            self.fact(fact, scenes)
        return list(facts.values()), list(scenes.values()), list(self.claims.values())


def check_collection(collection, job=None, source_root=SOURCES):
    collection = Path(collection)
    predicates = json.loads((ROOT / 'scripts' / 'fact_predicates.json').read_text(encoding='utf-8'))
    failures, warnings, jobs = [], [], []
    categories, regions = defaultdict(Counter), defaultdict(Counter)
    totals = dict.fromkeys(('facts', 'scenes', 'claims', 'chunkClaims', 'excerptClaims'), 0)
    folders = [collection / job] if job else sorted(p for p in collection.glob('*') if p.is_dir())
    if not folders:
        failures.append(f'{collection.name}/result.json/$/작업 폴더 없음')
    packets, wanted = [], set()
    for folder in folders:
        check = Check(folder, predicates, {})
        result, run, manifest = (check.read(name) for name in ('result.json', 'run.json', 'manifest.json'))
        packets.append((check, result, run, manifest))
        if isinstance(result, dict) and isinstance(result.get('claims'), list):
            for claim in result['claims']:
                if isinstance(claim, dict) and nonempty(claim.get('citesChunk')):
                    wanted.add(claim['citesChunk'])
    chunks = {}
    if wanted:
        try:
            for chunk in iter_chunks(root=source_root):
                if chunk.get('id') in wanted:
                    chunks[chunk['id']] = chunk
                    if len(chunks) == len(wanted):
                        break
        except (OSError, ValueError) as exc:
            failures.append(f'collection/chunks.jsonl/$/{exc}')
    for check, result, run, manifest in packets:
        check.chunks = chunks
        facts, scenes, claims = check.document(result, run, manifest) if result is not None else ([], [], [])
        counts = dict(facts=len(facts), scenes=len(scenes), claims=len(claims),
                      chunkClaims=sum('citesChunk' in c for c in claims), excerptClaims=sum('citesExcerpt' in c for c in claims))
        jobs.append(dict(job=check.folder.name, **counts, failures=len(check.failures)))
        failures.extend(check.failures)
        warnings.extend(check.warnings)
        for key in totals:
            totals[key] += counts[key]
        for fact in facts:
            categories[fact['category']][str(fact['decade'])] += 1
            regions[fact['region']][str(fact['decade'])] += 1
    return dict(jobs=jobs, failures=failures, warnings=warnings, coverage=dict(
        byCategoryDecade=dict(categories), byRegionDecade=dict(regions), totals=totals))


def print_table(headers, rows):
    rows = [[str(value) for value in row] for row in [headers, *rows]]
    widths = [max(len(row[i]) for row in rows) for i in range(len(headers))]
    for i, row in enumerate(rows):
        print(' | '.join(value.ljust(widths[j]) for j, value in enumerate(row)).rstrip())
        if i == 0:
            print('-+-'.join('-' * width for width in widths))


def print_report(report):
    for failure in report['failures']:
        print(failure)
    for warning in report['warnings']:
        print('WARNING ' + warning)
    coverage = report['coverage']
    for title, key, labels in (('category × 10년', 'byCategoryDecade', CATEGORIES), ('region × 10년', 'byRegionDecade', REGIONS)):
        print('\n' + title)
        matrix = coverage[key]
        decades = sorted({decade for counts in matrix.values() for decade in counts}, key=int)
        labels = (*labels, *sorted(set(matrix) - set(labels)))
        print_table([key, *decades, 'total'], [[label, *[matrix.get(label, {}).get(d, 0) for d in decades],
                    sum(matrix.get(label, {}).values())] for label in labels])
    print('\njob 별 집계')
    print_table(['job', 'facts', 'scenes', 'claims', 'chunkClaims', 'excerptClaims'],
                [[row[key] for key in ('job', 'facts', 'scenes', 'claims', 'chunkClaims', 'excerptClaims')] for row in report['jobs']])
    print(f'\n{"FAIL" if report["failures"] else "PASS"}: failures={len(report["failures"])} warnings={len(report["warnings"])}')


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('collection', type=Path)
    parser.add_argument('--job', help='검사할 작업 폴더 이름')
    parser.add_argument('--json', type=Path, help='동일 집계를 JSON으로 저장')
    args = parser.parse_args(argv)
    if args.job and (Path(args.job).name != args.job or args.job in ('.', '..')):
        parser.error('--job은 단일 폴더 이름이어야 합니다')
    report = check_collection(args.collection, args.job)
    print_report(report)
    if args.json:
        args.json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return int(bool(report['failures']))


if __name__ == '__main__':
    raise SystemExit(main())
