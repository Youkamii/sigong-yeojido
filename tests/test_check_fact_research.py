import copy
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import check_fact_research as C
from scene_vocabulary import HERITAGE_TYPES
import search_chunks as S

FIXTURES = ROOT / 'tests' / 'fixtures' / 'facts'
JOB = FIXTURES / 'facts-ancient' / 'silla_551'


class FactResearchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = json.loads((JOB / 'result.json').read_text(encoding='utf-8'))
        cls.run_record = json.loads((JOB / 'run.json').read_text(encoding='utf-8'))
        cls.manifest = json.loads((JOB / 'manifest.json').read_text(encoding='utf-8'))
        cls.predicates = json.loads((ROOT / 'scripts' / 'fact_predicates.json').read_text(encoding='utf-8'))
        wanted = {c['citesChunk'] for c in cls.original['claims'] if 'citesChunk' in c}
        cls.chunks = {c['id']: c for c in S.iter_chunks(['src-samguksagi']) if c['id'] in wanted}

    def check(self, result=None, run=None, manifest=None):
        check = C.Check(JOB, self.predicates, self.chunks)
        check.document(copy.deepcopy(self.original) if result is None else result,
                       copy.deepcopy(self.run_record) if run is None else run,
                       copy.deepcopy(self.manifest) if manifest is None else manifest)
        return check

    def test_valid_fixture(self):
        self.assertEqual(self.check().failures, [])

    def test_portrait_and_heritage_kinds(self):
        for kind in ('portrait', 'heritage'):
            for heritage_type in HERITAGE_TYPES:
                result = copy.deepcopy(self.original)
                scene = result['scenes'][0]
                scene['kind'] = kind
                if kind == 'heritage':
                    scene['heritageType'] = heritage_type
                self.assertEqual(self.check(result).failures, [], (kind, heritage_type))

    def test_heritage_requires_valid_type_and_optional_floors(self):
        for value in (None, '', 'castle', [], 3):
            result = copy.deepcopy(self.original)
            scene = result['scenes'][0]
            scene['kind'] = 'heritage'
            if value is not None:
                scene['heritageType'] = value
            self.assertIn('heritageType', '\n'.join(self.check(result).failures))
        for floors in (3, 5, 4, True, '5'):
            result = copy.deepcopy(self.original)
            result['scenes'][0].update(kind='heritage', heritageType='pagoda', heritageFloors=floors)
            failures = self.check(result).failures
            self.assertEqual(bool(failures), floors not in (3, 5), failures)

    def test_five_single_failures(self):
        cases = [('quote', '인용 불일치'), ('chunk', 'chunk 없음'), ('year', '연도 불일치'),
                 ('predicate', '허용 밖 predicate'), ('reference', '참조 없음')]
        for mutation, message in cases:
            with self.subTest(mutation=mutation):
                result = copy.deepcopy(self.original)
                claim = result['claims'][0]
                if mutation == 'quote':
                    claim['quote'] = '없는 인용'
                elif mutation == 'chunk':
                    claim['citesChunk'] = 'chunk-absent'
                elif mutation == 'year':
                    claim['object']['year'] = 552
                elif mutation == 'predicate':
                    claim['predicate'] = 'syj:unsupported'
                else:
                    result['facts'][0]['claimIds'] = ['claim-absent']
                failures = self.check(result).failures
                self.assertEqual(len(failures), 1, failures)
                self.assertIn(message, failures[0])

    def test_unicode_whitespace_and_verbatim(self):
        result = copy.deepcopy(self.original)
        result['claims'][0]['quote'] = '十二\u2003年,\t春正月,\n改元開國.'
        self.assertEqual(self.check(result).failures, [])
        result['claims'][0]['object']['verbatim'] = '不存在'
        self.assertIn('verbatim', '\n'.join(self.check(result).failures))

    def test_web_rules(self):
        for mutation, message in [('words', '25단어'), ('html', 'HTML 인용'), ('sha', 'sha256'),
                                  ('length', 'byteLength'), ('source', 'sourceId'), ('year', '연도 숫자')]:
            with self.subTest(mutation=mutation):
                result = copy.deepcopy(self.original)
                source = result['sources'][0]
                if mutation == 'words':
                    source['excerpts'][1]['text'] = ' '.join(['말'] * 26)
                elif mutation == 'html':
                    source['excerpts'][1]['text'] = '551년 원본에 없는 문장'
                elif mutation == 'sha':
                    source['sha256'] = '0' * 64
                elif mutation == 'length':
                    source['byteLength'] += 1
                elif mutation == 'source':
                    result['claims'][-1]['sourceId'] = 'src-wrong'
                else:
                    result['claims'][-1]['object']['value'] = 552
                self.assertIn(message, '\n'.join(self.check(result).failures))

    def test_scene_and_nested_fields(self):
        mutations = [(['scenes', 0, 'kind'], 'wrong'), (['scenes', 0, 'sceneFunction'], 'wrong'),
                     (['facts', 0, 'category'], 'wrong'), (['facts', 0, 'region'], 'wrong'),
                     (['facts', 2, 'decade'], -50), (['facts', 0, 'confidence'], 'wrong'),
                     (['scenes', 0, 'dateClaimIds'], []), (['scenes', 0, 'participantGroups'], {}),
                     (['facts', 0, 'density'], {'population': -1, 'claimIds': ['claim-absent']}),
                     (['scenes', 0, 'participants'], [{'entityId': 'polity-silla', 'claimIds': ['claim-absent']}]),
                     (['scenes', 0, 'effects'], {'fire': {'enabled': True, 'claimIds': []}}),
                     (['scenes', 0, 'persistence'], {'kind': 'city', 'from': 551, 'to': 550, 'basisClaimIds': []})]
        for path, value in mutations:
            with self.subTest(path=path):
                result = copy.deepcopy(self.original)
                obj = result
                for key in path[:-1]:
                    obj = obj[key]
                obj[path[-1]] = value
                self.assertTrue(self.check(result).failures)

    def test_coordinates_need_real_matching_evidence(self):
        result = copy.deepcopy(self.original)
        result['scenes'][0]['place'] = dict(label='표시 테스트', medium='land', precision='site', lon=126.19,
            lat=41.13, claimIds=[], coordinateSourceIds=['src-wiki-fixture'], coordinateNote='십진수 좌표')
        self.assertEqual(self.check(result).failures, [])
        result['scenes'][0]['place']['lon'] = 125
        self.assertIn('좌표 근거 없음', '\n'.join(self.check(result).failures))
        result = copy.deepcopy(self.original)
        result['facts'][3]['coordinateBasis'] = '출처라는 말만 있음'
        self.assertIn('좌표 근거 없음', '\n'.join(self.check(result).failures))

    def test_run_conditions_and_warning(self):
        for field, value in [('effort', 'low'), ('exitCode', 1), ('isError', True), ('isError', 0),
                             ('modelsObserved', ['other']), ('task', 'other'), ('started', True),
                             ('modelRequested', 'other'), ('sessionId', '')]:
            with self.subTest(field=field):
                run = copy.deepcopy(self.run_record)
                run[field] = value
                self.assertTrue(self.check(run=run).failures)
        run = {**self.run_record, 'runner': 'cli', 'effort': 'max'}
        self.assertEqual(self.check(run=run).failures, [])
        run['effort'] = 'high'
        self.assertTrue(self.check(run=run).failures)
        result = copy.deepcopy(self.original)
        del result['sources'][0]['license']
        check = self.check(result)
        self.assertEqual(check.failures, [])
        self.assertEqual(len(check.warnings), 1)

    def test_required_shapes_do_not_crash(self):
        for key in self.original:
            with self.subTest(key=key):
                result = copy.deepcopy(self.original)
                del result[key]
                self.assertTrue(self.check(result).failures)
        for section in ('claims', 'sources', 'facts', 'scenes', 'missing', 'entities'):
            with self.subTest(section=section):
                result = copy.deepcopy(self.original)
                result[section] = [None, [], {'id': []}]
                self.assertTrue(self.check(result).failures)

    def test_missing_null_and_malformed_files(self):
        with tempfile.TemporaryDirectory(dir=FIXTURES) as temporary:
            folder = Path(temporary) / 'facts-ancient' / JOB.name
            shutil.copytree(JOB, folder)
            for name in ('result.json', 'run.json', 'manifest.json'):
                path = folder / name
                original = path.read_bytes()
                for content in ('null', '{'):
                    with self.subTest(name=name, content=content):
                        path.write_text(content, encoding='utf-8')
                        check = C.Check(folder, self.predicates, self.chunks)
                        self.assertIsNone(check.read(name))
                        self.assertEqual(len(check.failures), 1)
                path.unlink()
                check = C.Check(folder, self.predicates, self.chunks)
                self.assertIsNone(check.read(name))
                self.assertEqual(len(check.failures), 1)
                path.write_bytes(original)

    def test_web_source_policy_and_year_exceptions(self):
        record = {**self.manifest[0], 'url': 'https://db.history.go.kr/item'}
        self.assertIn('수집 금지', '\n'.join(self.check(manifest=[record]).failures))
        result = copy.deepcopy(self.original)
        result['sources'][0]['url'] = 'https://unlisted.example/page'
        self.assertIn('허용 출처', '\n'.join(self.check(result).failures))
        self.assertTrue(C.web_year_supported(-57, {}, '기원전 57년'))
        self.assertFalse(C.web_year_supported(-57, {}, '57년'))
        self.assertTrue(C.web_year_supported(-300, {'precision': 'century', 'earliest': -300}, '기원전 3세기'))
        self.assertTrue(C.web_year_supported(552, {'kind': 'time', 'earliest': 551, 'latest': 552,
                                                 'verbatim': '이듬해'}, '551년 이후 이듬해'))

    def test_predicate_object_contract_and_location_basis(self):
        result = copy.deepcopy(self.original)
        claim = result['claims'][-1]
        claim.update(predicate='syj:locatedAt', citesExcerpt='ex-coordinates',
                     object=dict(kind='location', lon=126.19, lat=41.13, precision='site'))
        result['facts'][-1]['coordinateBasis'] = claim['id']
        self.assertEqual(self.check(result).failures, [])
        claim['object']['lat'] = 100
        self.assertIn('좌표 범위', '\n'.join(self.check(result).failures))
        for predicate, unit in [('syj:householdCount', '戶'), ('syj:populationCount', '口')]:
            result = copy.deepcopy(self.original)
            claim = result['claims'][-1]
            claim.update(predicate=predicate, object={'kind': 'literal', 'value': 5, 'unit': unit})
            self.assertEqual(self.check(result).failures, [])
            claim['object']['unit'] = 'wrong'
            self.assertIn('단위', '\n'.join(self.check(result).failures))

    def test_multiple_jobs_aggregate_without_id_leakage(self):
        with tempfile.TemporaryDirectory(dir=FIXTURES) as temporary:
            collection = Path(temporary) / 'facts-ancient'
            shutil.copytree(JOB, collection / JOB.name)
            second = collection / 'second'
            shutil.copytree(JOB, second)
            result = copy.deepcopy(self.original)
            result['job'] = 'second'
            (second / 'result.json').write_text(json.dumps(result), encoding='utf-8')
            (second / 'run.json').write_text(json.dumps({**self.run_record, 'task': 'second'}), encoding='utf-8')
            report = C.check_collection(collection)
            self.assertEqual(report['failures'], [])
            self.assertEqual(report['coverage']['totals']['facts'], 8)
            self.assertEqual(report['coverage']['byRegionDecade']['capital']['550'], 2)
    def test_portrait_setting_and_scene_function_vocabulary(self):
        result = copy.deepcopy(self.original)
        scene = result['scenes'][0]
        scene['kind'] = 'portrait'
        scene['place'] = dict(label='표시 테스트', medium='land', precision='site', lon=126.19,
                              lat=41.13, claimIds=[], coordinateSourceIds=['src-wiki-fixture'], coordinateNote='십진수 좌표')
        for setting in ('palace', 'office', 'temple', 'battle', 'village', 'academy'):
            scene['place']['setting'] = setting
            self.assertEqual(self.check(result).failures, [])
        for setting in ('court', '사찰', '', None, 3):
            scene['place']['setting'] = setting
            self.assertIn('place.setting', '\n'.join(self.check(result).failures))
        del scene['place']['setting']
        for function in ('portrait', 'heritage', 'palace', 'office', 'battle', 'village'):
            scene['sceneFunction'] = function
            self.assertIn('sceneFunction', '\n'.join(self.check(result).failures))

    def test_cli_report_and_raw_tampering(self):
        with tempfile.TemporaryDirectory(dir=FIXTURES) as temporary:
            collection = Path(temporary) / 'facts-ancient'
            folder = collection / JOB.name
            shutil.copytree(JOB, folder)
            report_file = Path(temporary) / 'report.json'
            command = [sys.executable, str(ROOT / 'scripts' / 'check_fact_research.py'), str(collection),
                       '--job', JOB.name, '--json', str(report_file)]
            output = subprocess.run(command, capture_output=True, encoding='utf-8')
            self.assertEqual(output.returncode, 0, output.stderr + output.stdout)
            report = json.loads(report_file.read_text(encoding='utf-8'))
            self.assertEqual(report['coverage']['totals'], dict(facts=4, scenes=1, claims=5, chunkClaims=4, excerptClaims=1))
            self.assertEqual(report['coverage']['byCategoryDecade']['settlement'], {'-60': 1})
            self.assertIn('PASS: failures=0 warnings=0', output.stdout)
            with (folder / 'raw' / 'coordinates.html').open('ab') as stream:
                stream.write(b'!')
            output = subprocess.run(command, capture_output=True, encoding='utf-8')
            self.assertEqual(output.returncode, 1)
            self.assertIn('sha256', output.stdout)


if __name__ == '__main__':
    unittest.main()
