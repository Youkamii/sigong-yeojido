import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from scene_vocabulary import normalize_group


class SceneVocabularyTests(unittest.TestCase):
    def setUp(self):
        self.scene = {'title': '고구려와 백제의 장면', 'dateClaimIds': ['date'],
                      'actionClaimIds': ['action'], 'relatedClaimIds': ['related'],
                      'participants': [{'entityId': 'known', 'claimIds': ['actor']}],
                      'participantGroups': []}

    def normalize(self, **group):
        return normalize_group(group, self.scene)

    def test_role_samples(self):
        samples = {
            'monk': ['승려', '주지', '강경 법사', 'monk', '출가자'],
            'worker': ['인부', '역부', '노동', '부역', '축성 인력', 'builder', 'worker', '기술 인력', '수축'],
            'soldier': ['군사', 'garrison', '병', 'soldier', '주둔'],
            'scholar': ['관인', 'official', '공사 감독', '통치', '주체', 'state', '사절', 'host'],
            'ruler': ['왕', '천도 주체'],
            'civilian': ['피해자', 'victim', '수급자', 'recipient', 'beneficiary', '유민', '이재민'],
            'commoner': ['이주민', 'migrant', '정착민', '주민', '거주자', '상인', 'trader', '행상', 'guest', '참석', '미상'],
        }
        for expected, values in samples.items():
            for value in values:
                with self.subTest(role=value):
                    self.assertEqual(self.normalize(role=value)['role'], expected)
        for role in ('militia', 'police', 'printer', 'commander', 'civilian', 'commoner'):
            self.assertEqual(self.normalize(role=role)['role'], role)

    def test_stance_samples(self):
        samples = {
            'victim': ['피해', '피동', '유망', 'victim'],
            'marching': ['이주', '정착', '이탈', '항해', 'marching', '귀부', '도래'],
            'worker': ['동원', '부역', '시공', '노동', '징발', '수축', '축성', 'worker'],
            'defender': ['방어', '주둔', 'defend', 'defensive', '항복', 'defender'],
            'attacker': ['hostile', 'attacker', '공격'],
            'bystander': ['neutral', '미상', '주도', '의례', '참석', 'friendly'],
        }
        for expected, values in samples.items():
            for value in values:
                with self.subTest(stance=value):
                    self.assertEqual(self.normalize(stance=value)['stance'], expected)

    def test_side_consistency_and_aliases(self):
        self.scene['title'] = '신라와 백제의 교역'
        sides = ['신라', 'silla', '백제', 'baekje', 'state', '당', '왜', 'attacker', 'civilian', '피해 주민', '수급자']
        expected = ['a', 'a', 'b', 'b', 'a', 'b', 'b', 'b', 'c', 'c', 'c']
        groups = [{'side': side, 'role': '이주민'} for side in sides]
        self.scene['participantGroups'] = groups
        self.assertEqual([normalize_group(g, self.scene)['side'] for g in groups], expected)
        self.scene['participantGroups'].reverse()
        for side, code in zip(sides, expected):
            for role in ('soldier', 'victim'):
                self.assertEqual(self.normalize(side=side, role=role)['side'], code)

    def test_primary_polity_uses_text_order_then_participants_then_groups(self):
        self.scene['title'] = '백제에서 고구려로'
        self.assertEqual(self.normalize(side='백제')['side'], 'a')
        self.scene['title'] = '중초사 당간지주 건립'
        self.scene['participants'][0]['entityId'] = 'polity-silla'
        self.assertEqual(self.normalize(side='silla')['side'], 'a')
        self.assertEqual(self.normalize(side='당')['side'], 'b')
        self.scene['participants'] = []
        self.scene['participantGroups'] = [{'side': 'civilian'}, {'side': '발해'}, {'side': '고구려'}]
        self.assertEqual(self.normalize(side='balhae')['side'], 'a')
        self.assertEqual(self.normalize(side='고구려')['side'], 'b')
        for side in ('가락', '가야', 'gaya', '아유타', '동진', '전진'):
            self.scene['title'] = side + ' 장면'
            self.assertEqual(self.normalize(side=side)['side'], 'a')

    def test_count_correction(self):
        for value, expected in [(None, 1), (0, 1), (-2, 1), (3.8, 3), ('4', 4), ('?', 1),
                                (float('inf'), 1), (float('nan'), 1), (14140, 14140)]:
            with self.subTest(count=value):
                self.assertEqual(self.normalize(count=value)['count'], expected)
        self.assertEqual(self.normalize()['count'], 1)

    def test_basis_label_and_sources(self):
        group = {'role': '이주민', 'stance': '이주', 'side': '고구려'}
        before = copy.deepcopy((group, self.scene))
        result = normalize_group(group, self.scene)
        self.assertEqual(result['label'], '고구려 이주민')
        self.assertEqual(result['basis'], '조사 장면의 집단(원문 역할: 이주민, 자세: 이주, 편: 고구려) — count 는 표현값')
        self.assertEqual([result[k] for k in ('sourceRole', 'sourceStance', 'sourceSide')], ['이주민', '이주', '고구려'])
        self.assertEqual((group, self.scene), before)
        self.assertEqual(normalize_group(result, self.scene), result)
        self.assertEqual(self.normalize(**group, label='옮겨온 주민', basis='원래 근거')['label'], '옮겨온 주민')
        self.assertEqual(self.normalize(**group, basis='원래 근거')['basis'], '원래 근거')

    def test_claim_union_fallback_and_entity_membership(self):
        claims = ['date', 'action', 'related', 'actor', 'outside']
        self.assertEqual(self.normalize(claimIds=claims)['claimIds'], claims[:-1])
        for value in ([], ['outside']):
            self.assertEqual(self.normalize(claimIds=value)['claimIds'], ['action'])
        self.assertEqual(self.normalize()['claimIds'], ['action'])
        self.assertEqual(self.normalize(entityId='known')['entityId'], 'known')
        self.assertIsNone(self.normalize(entityId='outside')['entityId'])
        self.assertIsNone(self.normalize()['entityId'])


if __name__ == '__main__':
    unittest.main()
