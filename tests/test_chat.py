import sys
from pathlib import Path
import unittest
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'services'))
import chat


class ChatTests(unittest.TestCase):
    def setUp(self):
        self.claim={'id':'cl-a','fromSource':'src-a','citesChunk':'ch-a','quote':'原文','origin':'ai'}
        self.reader=lambda cid:{'id':cid,'sourceId':'src-a','text':'前 原文 後'}

    def test_no_evidence_does_not_call_model(self):
        with patch.object(chat,'collect_evidence',return_value=([],False)), patch.object(chat,'invoke_claude') as model:
            result=chat.answer('기록?',[],self.reader,sources=set(),origin='human')
        self.assertEqual(result['status'],'no_evidence')
        model.assert_not_called()

    def test_foreign_or_missing_sentence_citation_is_rejected(self):
        for ids in ([],['not-retrieved'],[{}]):
            output={'sentences':[{'text':'설명','claimIds':ids}],'unanswered':''}
            with self.subTest(ids=ids),patch.object(chat,'collect_evidence',return_value=([self.claim],False)), \
                    patch.object(chat,'invoke_claude',return_value=(output,[chat.MODEL])):
                with self.assertRaises(chat.ChatUnavailable):
                    chat.answer('기록?',[],self.reader)

    def test_current_original_must_match_before_model_call(self):
        with patch.object(chat,'collect_evidence',return_value=([self.claim],False)),patch.object(chat,'invoke_claude') as model:
            with self.assertRaises(chat.ChatUnavailable):
                chat.answer('기록?',[],lambda cid:{'sourceId':'src-a','text':'changed'})
        model.assert_not_called()

    def test_sentence_keeps_the_retrieved_quote_and_source(self):
        output={'sentences':[{'text':'사료는 이렇게 말한다.','claimIds':['cl-a','cl-a']}],'unanswered':''}
        with patch.object(chat,'collect_evidence',return_value=([self.claim],False)), \
                patch.object(chat,'invoke_claude',return_value=(output,[chat.MODEL])):
            result=chat.answer('기록?',[],self.reader)
        self.assertEqual(result['sentences'][0]['citations'],[self.claim])
        self.assertEqual(result['models'],[chat.MODEL])

    def test_single_character_name_does_not_match_arbitrary_question(self):
        entities=[{'id':'p-a','label':'陳'},{'id':'p-b','label':'광개토왕'}]
        with patch.object(chat,'neighborhood',return_value={'claims':[],'hasMore':False}) as graph:
            chat.collect_evidence('陳設이 무엇인가?',entities,{'src-a'},'human')
            graph.assert_not_called()
            chat.collect_evidence('광개토왕의 이름은?',entities,{'src-a'},'human')
            graph.assert_called_once_with('p-b',{'src-a'},'human',limit=30)


if __name__=='__main__':
    unittest.main()
