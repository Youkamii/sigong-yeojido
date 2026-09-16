"""개체 이름 정리 규칙 (#200) — 화면 규칙(tests/display-label.test.mjs)과 같은 답을 내는지."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'services'))
sys.path.insert(0, str(ROOT / 'scripts'))
from entity_labels import clean_label, replace_unknown, split_outside_parens, split_source_refs, strip_label_notes  # noqa: E402
from clean_entity_labels import plan, render, rewrite, scalar  # noqa: E402


class CleanLabelTests(unittest.TestCase):
    def test_matches_the_screen_rule(self):
        """display-label.test.mjs 와 같은 입력·같은 이름."""
        cases = [
            ('성균관 유생 (1742년 당론 금지 대상) · 집단 행위자', 'Polity', '성균관 유생'),
            ('일본군 (임진왜란 침입군, 사료 표기 일본군·왜군·적군) · 집단 행위자', 'Polity', '일본군'),
            ('아관파천 (1896년 2월 11일)', 'Event', '아관파천'),
            ('삼포 개항(1423·1426)', 'Event', '삼포 개항'),
            ('김수환 추기경 (1987년 명동대성당 추모미사 집전)', 'Person', '김수환 추기경'),
            ('안동부 · 지방 행정 중심지', 'Place', '안동부'),
            ('세종 (조선)', 'Person', '세종 (조선)'),
            ('낙화암(타사암)', 'Place', '낙화암(타사암)'),
            ('성리학(주자학) 도입 (연도 미상)', 'Event', '성리학(주자학) 도입'),
            ('(1896년)', 'Event', '(1896년)'),  # 결과가 비면 원본 유지
        ]
        for label, type_, expected in cases:
            with self.subTest(label=label):
                self.assertEqual(clean_label(label, type_)['label'], expected)

    def test_keeps_the_dropped_text_as_a_note(self):
        self.assertEqual(clean_label('안동부 · 지방 행정 중심지', 'Place')['note'], '지방 행정 중심지')
        # 연도·날짜뿐인 설명은 labelNote 로 남기지 않는다 — 검색 줄이 연도를 따로 보여 준다 (#203 감사 2)
        self.assertEqual(clean_label('아관파천 (1896년 2월 11일)', 'Event')['note'], '')
        self.assertEqual(clean_label('한산도 대첩(1592)', 'Event')['note'], '')
        self.assertEqual(clean_label('불국사 창건 (751, 창건 연대 이설 있음)', 'Event')['note'], '751, 창건 연대 이설 있음')
        self.assertEqual(clean_label('효종 (조선 제17대, 민족문화대백과 E0065706)', 'Person'),
                         {'label': '효종 (조선)', 'note': '조선 제17대',
                          'sourceRef': ['민족문화대백과 E0065706'], 'group': False, 'changed': True})

    def test_group_tail_becomes_a_flag_not_a_note(self):
        result = clean_label('처인부곡민 (1232) · 집단 행위자', 'Polity')
        self.assertTrue(result['group'])
        self.assertEqual(result['label'], '처인부곡민')
        self.assertNotIn('집단 행위자', result['note'])

    def test_unknown_becomes_the_plain_word(self):
        self.assertEqual(clean_label('연대 미상 기록', 'Event')['label'], '연대 미확인 기록')

    def test_unknown_only_replaces_a_standalone_word(self):
        """#203 감사 11: 경계를 안 보던 치환이 행정구역 이름 '다미상면'을 망가뜨렸다."""
        self.assertEqual(replace_unknown('연도 미상'), '연도 미확인')
        self.assertEqual(replace_unknown('(미상)'), '(미확인)')
        self.assertEqual(replace_unknown('평안남도/용강군/다미상면'), '평안남도/용강군/다미상면')
        self.assertEqual(replace_unknown('미상면'), '미상면')
        cleaned = clean_label('평안남도/용강군/다미상면 (HGIS 92966)', 'Place')
        self.assertEqual(cleaned['label'], '평안남도/용강군/다미상면 (HGIS 92966)')
        self.assertFalse(cleaned['changed'])

    def test_separator_inside_parentheses_is_part_of_the_name(self):
        """' · ' 는 괄호 밖에서만 자른다 — 괄호 안의 구분자로 이름을 깨뜨리지 않는다 (#200 2차)."""
        result = clean_label('부산대학교 박물관 (발굴 조사 기관 · 집단 행위자)', 'Organization')
        self.assertEqual(result['label'], '부산대학교 박물관')
        self.assertEqual(result['note'], '발굴 조사 기관')
        self.assertTrue(result['group'])
        self.assertTrue(result['changed'])
        self.assertFalse(clean_label(result['label'], 'Organization')['changed'])

    def test_unbalanced_parentheses_keep_the_original(self):
        result = clean_label('이름 (설명이 아주 긴 괄호인데 닫히지 않는다', 'Place')
        self.assertEqual(result['label'], '이름 (설명이 아주 긴 괄호인데 닫히지 않는다')
        self.assertFalse(result['changed'])

    def test_split_outside_parens(self):
        self.assertEqual(split_outside_parens('안동부 · 지방 행정 중심지'), ['안동부', '지방 행정 중심지'])
        self.assertEqual(split_outside_parens('부산대학교 박물관 (발굴 조사 기관 · 집단 행위자)'),
                         ['부산대학교 박물관 (발굴 조사 기관 · 집단 행위자)'])
        self.assertEqual(split_outside_parens('수군 (조선) · 집단 행위자'), ['수군 (조선)', '집단 행위자'])

    def test_source_refs_leave_the_front_matter(self):
        """개발 용어(자료 식별자)는 labelNote 가 아니라 sourceRef 로 간다 (#200 2차)."""
        self.assertEqual(split_source_refs('HGIS 176301'), ('', ['HGIS 176301']))
        self.assertEqual(split_source_refs('조선 제25대, 민족문화대백과 E0056172'),
                         ('조선 제25대', ['민족문화대백과 E0056172']))
        self.assertEqual(split_source_refs('Taebong (Cliopatria 4052)'), ('Taebong', ['Cliopatria 4052']))
        self.assertEqual(split_source_refs('South Hamgyong (GeoNames 1877450)'), ('South Hamgyong', ['GeoNames 1877450']))
        self.assertEqual(split_source_refs('hgis-admin-100027 행정 구역'), ('행정 구역', ['hgis-admin-100027']))
        self.assertEqual(split_source_refs('지방 행정 중심지'), ('지방 행정 중심지', []))

    def test_source_refs_split_is_idempotent(self):
        once = split_source_refs('조선 제25대, 민족문화대백과 E0056172')
        self.assertEqual(split_source_refs(once[0]), (once[0], []))

    def test_strip_label_notes_keeps_short_parentheses(self):
        self.assertEqual(strip_label_notes('불국사 창건 (751, 창건 연대 이설 있음)')[0], '불국사 창건')
        self.assertEqual(strip_label_notes('제포 (웅천)')[0], '제포 (웅천)')

    def test_running_twice_changes_nothing(self):
        once = clean_label('아관파천 (1896년 2월 11일)', 'Event')
        self.assertFalse(clean_label(once['label'], 'Event')['changed'])


class PlanTests(unittest.TestCase):
    def rows(self, *specs):
        return [{'id': i, 'path': Path(i), 'type': t, 'label': label, 'aliases': [],
                 'labelNote': '', 'kind': '', 'sourceRef': []} for i, t, label in specs]

    def test_identifiers_move_out_of_an_existing_note(self):
        """이름이 이미 정리된 개체도 labelNote 의 자료 식별자는 sourceRef 로 옮긴다 (#200 2차)."""
        rows = self.rows(('a', 'Place', '강원도/춘천군/신남면'))
        rows[0].update(labelNote='HGIS 176301', aliases=['강원도/춘천군/신남면 (HGIS 176301)'])
        actions, _ = plan(rows, [])
        self.assertEqual(actions[0]['labelNote'], '')
        self.assertEqual(actions[0]['sourceRef'], ['HGIS 176301'])
        self.assertEqual(actions[0]['label'], '강원도/춘천군/신남면')
        self.assertEqual(actions[0]['aliases'], ['강원도/춘천군/신남면 (HGIS 176301)'])

    def test_a_clean_note_is_left_alone(self):
        rows = self.rows(('a', 'Place', '안동부'))
        rows[0].update(labelNote='지방 행정 중심지')
        self.assertEqual(plan(rows, [])[0], [])

    def test_the_identifier_move_runs_once(self):
        rows = self.rows(('a', 'Place', '강원도/춘천군/신남면'))
        rows[0].update(labelNote='HGIS 176301')
        action = plan(rows, [])[0][0]
        rows[0].update(labelNote=action['labelNote'], sourceRef=action['sourceRef'])
        self.assertEqual(plan(rows, [])[0], [])

    def test_new_collisions_are_left_alone_and_reported(self):
        rows = self.rows(('a', 'Event', '갑오개혁 (1894~1896)'), ('b', 'Event', '갑오개혁'))
        actions, conflicts = plan(rows, [])
        self.assertEqual(actions, [])
        self.assertEqual(conflicts[0]['label'], '갑오개혁')
        self.assertEqual(conflicts[0]['held'], ['a'])

    def test_same_entity_pairs_are_not_a_collision(self):
        rows = self.rows(('a', 'Event', '갑오개혁 (1894~1896)'), ('b', 'Event', '갑오개혁'))
        actions, conflicts = plan(rows, [('a', 'b')])
        self.assertEqual(conflicts, [])
        self.assertEqual(actions[0]['label'], '갑오개혁')
        self.assertEqual(actions[0]['aliases'], ['갑오개혁 (1894~1896)'])

    def test_different_types_do_not_collide(self):
        rows = self.rows(('a', 'Event', '한산도 대첩 (1592년 7월 8일)'), ('b', 'Place', '한산도 대첩'))
        actions, _ = plan(rows, [])
        self.assertEqual([a['id'] for a in actions], ['a'])

    def test_names_that_already_matched_are_still_cleaned(self):
        """정리 전부터 같은 이름이던 개체는 이번 정리가 만든 충돌이 아니다."""
        rows = self.rows(('a', 'Place', '동헌'), ('b', 'Place', '동헌'), ('c', 'Place', '남한산성 (경기도 광주시 남한산성면)'))
        actions, conflicts = plan(rows, [])
        self.assertEqual(conflicts, [])
        self.assertEqual([a['id'] for a in actions], ['c'])

    def test_group_gets_a_kind(self):
        rows = self.rows(('a', 'Polity', '처인부곡민 (1232) · 집단 행위자'))
        actions, _ = plan(rows, [])
        self.assertEqual(actions[0]['kind'], 'group')
        self.assertEqual(actions[0]['label'], '처인부곡민')


class RewriteTests(unittest.TestCase):
    def test_new_keys_go_after_the_name_and_keep_the_rest(self):
        lines = ['id: "e1"', 'type: "Event"', 'label: "옛 이름 (1896년)"']
        out = render(lines, {'label': '옛 이름', 'labelNote': '1896년', 'kind': '', 'aliases': ['옛 이름 (1896년)']})
        self.assertEqual(out, ['id: "e1"', 'type: "Event"', 'label: "옛 이름"', 'labelNote: "1896년"',
                               'aliases:', '  - "옛 이름 (1896년)"'])

    def test_source_ref_is_written_and_replaced(self):
        lines = ['id: "p1"', 'type: "Place"', 'label: "신남면"', 'labelNote: "HGIS 176301"']
        out = render(lines, {'label': '신남면', 'labelNote': '', 'kind': '', 'aliases': [],
                             'sourceRef': ['HGIS 176301']})
        self.assertEqual(out, ['id: "p1"', 'type: "Place"', 'label: "신남면"', 'sourceRef:', '  - "HGIS 176301"'])

    def test_existing_keys_are_replaced_not_doubled(self):
        lines = ['id: "e1"', 'label: "이름"', 'labelNote: "헌 값"', 'aliases:', '  - "헌 이름"', 'type: "Event"']
        out = render(lines, {'label': '이름', 'labelNote': '새 값', 'kind': 'group', 'aliases': ['새 이름']})
        self.assertEqual(out, ['id: "e1"', 'label: "이름"', 'labelNote: "새 값"', 'kind: "group"',
                               'aliases:', '  - "새 이름"', 'type: "Event"'])

    def test_line_endings_and_body_survive(self):
        path = Path(self.enterContext(__import__('tempfile').TemporaryDirectory())) / 'e1.md'
        path.write_bytes('---\r\nid: "e1"\r\ntype: "Event"\r\nlabel: "옛 이름 (1896년)"\r\n---\r\n\r\n본문 한 줄.\r\n'.encode())
        text = rewrite(path, {'label': '옛 이름', 'labelNote': '1896년', 'kind': '', 'aliases': ['옛 이름 (1896년)']})
        self.assertIn('\r\n', text)
        self.assertNotIn('\n\n', text.replace('\r\n', '\n').replace('\n\n본문', '\n본문'))
        self.assertTrue(text.endswith('본문 한 줄.\r\n'))

    def test_quotes_inside_a_name_are_refused_when_they_would_break(self):
        with self.assertRaises(ValueError):
            scalar('가운데 " 따옴표')


if __name__ == '__main__':
    unittest.main()
