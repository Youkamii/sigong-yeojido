"""Synthetic conditions only; these fixtures make no claims about real history."""
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'services'))
import build_ttl as B
import geography_rules as G
import graph_query as Q
import history_rules as H
import ttl_check as T
import validate as V


def fixture():
    def claim(cid,predicate,obj):
        return dict(id=cid,subject='person-test',predicate=predicate,object=obj,fromSource='src-test',
                    citesChunk='chunk-test',quote='Synthetic test input.',origin='ai',status='draft')
    def at(cid,lat,earliest,latest):
        return claim(cid,G.PRESENCE,{'kind':'location','lat':lat,'lon':127,'presence':
            {'earliest':earliest,'latest':latest,'radiusKm':1}})
    return [at('claim-first',37,'1900-01-01T08:00:00+09:00','1900-01-01T09:00:00+09:00'),
            at('claim-second',38,'1900-01-01T10:00:00+09:00','1900-01-01T11:00:00+09:00'),
            claim('claim-travel',G.TRAVEL,{'kind':'literal','value':'At least 4 hours between these bounded presences.',
                'fromPresence':'claim-first','toPresence':'claim-second','hours':4,'uncertaintyIncluded':True})]


class GeographyTests(unittest.TestCase):
    def test_uses_maximum_available_time_and_exact_threshold(self):
        records=fixture();result=G.assess(records)
        self.assertEqual(result['assessed'],1)
        self.assertEqual(result['checks'][0]['availableHours'],3)
        self.assertEqual([f[0] for f in H.check(records)],['history-geography'])
        records[-1]['object']['hours']=3
        self.assertEqual(H.check(records),[])
        self.assertEqual(G.assess(records)['checks'][0]['status'],'PASS')

    def test_timezone_offsets_are_not_treated_as_elapsed_time(self):
        records=fixture()
        records[1]['object']['presence'].update(earliest='1900-01-01T01:00:00Z',latest='1900-01-01T02:00:00Z')
        self.assertEqual(G.assess(records)['checks'][0]['availableHours'],3)

    def test_unknown_overlapping_and_different_sources_are_unassessed(self):
        mutations=[lambda r:r[0]['object'].pop('presence'),
            lambda r:r[0]['object']['presence'].update(latest='1900-01-01T10:00:00+09:00'),
            lambda r:r[0]['object']['presence'].update(radiusKm=200),
            lambda r:r[0].update(fromSource='src-other'),
            lambda r:r[1].update(subject='person-other'),
            lambda r:r[0].update(status='deprecated'),
            lambda r:r[2]['object'].pop('uncertaintyIncluded')]
        for mutate in mutations:
            with self.subTest(mutation=mutate):
                records=fixture();mutate(records)
                self.assertEqual(H.check(records),[])
                self.assertEqual(G.assess(records)['checks'][0]['status'],'UNASSESSED')

    def test_ordinary_location_mentions_and_years_do_not_trigger(self):
        records=fixture()[:2]
        for record in records:
            record['predicate']='syj:locatedAt';record.update(validFrom=1900,validTo=1900)
            record['object'].pop('presence')
        self.assertEqual(G.assess(records),{'presenceClaims':0,'travelClaims':0,'assessed':0,'checks':[]})
        self.assertEqual(H.check(records),[])

    def test_malformed_refs_units_numbers_and_times_are_reported(self):
        mutations=[lambda r:r[2]['object'].update(fromPresence='missing'),
            lambda r:r[2]['object'].update(toPresence='claim-first'),
            lambda r:r[2]['object'].update(hours=True),
            lambda r:r[2]['object'].update(hours=float('inf')),
            lambda r:r[2]['object'].update(hours=10**1000),
            lambda r:r[0]['object']['presence'].update(radiusKm=-1),
            lambda r:r[0]['object']['presence'].update(earliest='1900-01-01T08:00:00'),
            lambda r:r[0]['object']['presence'].update(earliest='1901'),
            lambda r:r[0]['object'].update(lat=float('nan'))]
        for mutate in mutations:
            with self.subTest(mutation=mutate):
                records=fixture();mutate(records)
                self.assertIn('history-geography-shape',{f[0] for f in H.check(records)})

    def test_real_validator_rejects_contradiction_and_citation_mismatch(self):
        records=fixture()
        records.append({**records[-1],'id':'claim-travel-second',
                        'object':{**records[-1]['object'],'hours':3,'value':'Another explicit travel bound.'}})
        doc=V.ClaimsDoc(Path('test.md'),'test','test',{},records)
        chunks={'chunk-test':{'id':'chunk-test','text':'Synthetic test input.','norm':'Synthetictestinput.','sourceId':'src-test'}}
        report=V.validate(chunks,{'person-test':'test'},[doc],{})
        self.assertEqual({f.code for f in report.failures},{'history-geography'})
        self.assertEqual(report.conflicts,[])
        records[-1]['quote']='Not the cited text.'
        self.assertIn('quote-mismatch',{f.code for f in V.validate(chunks,{'person-test':'test'},[doc],{}).failures})

    def test_build_and_graph_preserve_conditions_and_digest(self):
        records=fixture();records[-1]['object']['hours']=3
        old=V.claim_digest(records[-1]);records[-1]['object']['hours']=2
        self.assertNotEqual(old,V.claim_digest(records[-1]))
        with tempfile.TemporaryDirectory() as temp:
            data=Path(temp);(data/'sources/test').mkdir(parents=True);(data/'claims/test').mkdir(parents=True)
            (data/'entities/person').mkdir(parents=True)
            (data/'sources/test.md').write_text('---\ntype: Source\nid: src-test\nlabel: Synthetic test\n---\n',encoding='utf-8')
            (data/'entities/person/person-test.md').write_text('---\ntype: Person\nid: person-test\nlabel: Test person\n---\n',encoding='utf-8')
            (data/'sources/test/chunks.jsonl').write_text(json.dumps({'id':'chunk-test','sourceId':'src-test','text':'Synthetic test input.'})+'\n',encoding='utf-8')
            (data/'claims/test/chunk-test.md').write_text('---\ntype: Claims\nsource: src-test\nchunk: chunk-test\n---\n```claims-json\n'+json.dumps(records)+'\n```\n',encoding='utf-8')
            code,result=B.build(data,None,io.StringIO());self.assertEqual(code,0,result.failures)
            parsed=T.check_text(result.text);self.assertEqual(parsed.errors,[])
            idx=T.Index(parsed.graph)
            for record in records:
                stored=idx.value(B.NS+record['id'],B.NS+'geographyObject')
                self.assertEqual(json.loads(stored),record['object'])
                row={'claim':B.NS+record['id'],'subject':B.NS+'person-test','predicate':B.NS+record['predicate'].split(':')[1],
                    'objectKind':B.NS+'objectLiteral','object':'fixture','source':B.NS+'src-test','chunk':B.NS+'chunk-test',
                    'quote':record['quote'],'origin':'ai','status':'draft','geographyObject':stored}
                with patch.object(Q,'query_rows',side_effect=[[row],[]]):
                    response=Q.neighborhood('person-test')
                self.assertEqual(response['claims'][0]['object'],record['object'])


if __name__=='__main__':unittest.main()
