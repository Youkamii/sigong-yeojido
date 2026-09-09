import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'services'))
from chronicle_query import chronicle
from graph_query import NS

class ChronicleLocationTests(unittest.TestCase):
    def test_physical_presence_retains_coordinates_time_and_evidence(self):
        obj={'kind':'location','lon':128.4,'lat':34.8,'presence':{
            'earliest':'1593-07-01T00:00:00+09:00','latest':'1593-07-01T23:59:59+09:00','radiusKm':2}}
        row={'claim':NS+'claim-presence','subject':NS+'person-example','subjectType':NS+'Person',
             'subjectLabel':'검사 인물','predicate':NS+'physicallyPresentAt','objectKind':NS+'objectLocation',
             'object':NS+'loc-example','lat':'34.8','lon':'128.4','validFrom':'1593','validTo':'1593',
             'source':NS+'src-example','sourceLabel':'검사 출처','chunk':NS+'chunk-example','quote':'검사 발췌',
             'origin':'human','status':'verified','geographyObject':json.dumps(obj)}
        with patch('chronicle_query.query_rows',return_value=[row]) as query:
            result=chronicle({'src-example'})
        self.assertIn('syj:objectLocation',query.call_args.args[0])
        self.assertIn('syj:Place',query.call_args.args[0])
        claim=result['claims'][0]
        self.assertEqual(claim['object'],obj)
        self.assertEqual((claim['validFrom'],claim['validTo']),(1593,1593))
        self.assertEqual(claim['fromSource'],'src-example')
        self.assertEqual(claim['citesChunk'],'chunk-example')

    def test_no_sources_do_not_fetch_presence(self):
        with patch('chronicle_query.query_rows') as query:
            self.assertEqual(chronicle(set())['claims'],[])
            query.assert_not_called()

    def test_narrative_setting_preserves_its_type_and_claim(self):
        row={'claim':NS+'claim-story','subject':NS+'story','subjectType':NS+'Narrative',
             'subjectLabel':'전승','predicate':NS+'hasSetting','objectKind':NS+'objectEntity',
             'object':NS+'place','objectType':NS+'Place','objectLabel':'전승의 무대',
             'source':NS+'src-story','sourceLabel':'전승 기록','chunk':NS+'chunk-story',
             'quote':'전승의 무대를 설명하는 검사 인용','origin':'ai','status':'draft'}
        with patch('chronicle_query.query_rows',return_value=[row]) as query:
            result=chronicle({'src-story'})
        self.assertIn('syj:Narrative',query.call_args.args[0])
        self.assertEqual(result['entities'][0]['type'],'Narrative')
        self.assertEqual(result['claims'][0]['predicate'],'syj:hasSetting')
        self.assertEqual(result['claims'][0]['citesChunk'],'chunk-story')

if __name__=='__main__':unittest.main()
