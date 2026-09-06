import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'services'))
import history_rules as H
import validate as V


def claim(cid,subject,predicate,obj,source='src-a'):
    return dict(id=cid,subject=subject,predicate='syj:'+predicate,object=obj,fromSource=source,
                citesChunk='chunk-a',quote='original',origin='ai',status='draft')


def entity(eid):return {'kind':'entity','id':eid}
def year(value):return {'kind':'year','value':value}


class HistoryRulesTests(unittest.TestCase):
    def test_ancestry_and_order_cycles_are_scoped_by_source(self):
        for first,second in (('hasParent','hasParent'),('descendantOf','descendantOf'),('before','before')):
            claims=[claim('a','p-a',first,entity('p-b')),claim('b','p-b',second,entity('p-a'))]
            self.assertEqual({cid for _,cid,_ in H.check(claims)},{'a','b'})
            claims[1]['fromSource']='src-b'
            self.assertEqual(H.check(claims),[])
        # Parent direction is inverted, so these two claims agree.
        self.assertEqual(H.check([claim('a','parent','fatherOf',entity('child')),
                                 claim('b','child','hasParent',entity('parent'))]),[])

    def test_death_and_birth_checks_only_definite_living_appearances(self):
        base=[claim('death','p','diedIn',year(400)),claim('appearance','p','appearsIn',year(401))]
        self.assertEqual(H.check(base)[0][0],'history-after-death')
        base[1]['fromSource']='src-b'
        self.assertEqual(H.check(base),[])
        base[1]['fromSource']='src-a'
        base[0]['object']={'kind':'time','id':'ts-death','verbatim':'unknown','precision':'unknown'}
        self.assertEqual(H.check(base),[])
        base[0]['object'].update(earliest=390,latest=410)
        self.assertEqual(H.check(base),[])
        base.append(claim('birth','p','bornIn',year(420)))
        self.assertEqual({x[0] for x in H.check(base)},{'history-life-order','history-before-birth'})

    def test_relative_order_and_conversions_keep_uncertainty(self):
        claims=[claim('earlier','event-a','occurredAt',{'kind':'time','id':'ts-a','verbatim':'date','precision':'year'}),
                claim('later','event-b','occurredAt',year(410)),
                claim('before','event-a','before',entity('event-b')),
                claim('convert','ts-a','convertsTo',year(420))]
        self.assertEqual([x[0] for x in H.check(claims)],['history-order'])
        claims.append(claim('alternate','ts-a','convertsTo',year(400)))
        self.assertEqual(H.check(claims),[])
        claims[-1]['fromSource']='src-b'
        self.assertEqual([x[0] for x in H.check(claims)],['history-order'])

    def test_long_chain_does_not_hit_recursion_limit(self):
        edges=[(str(i),str(i+1),str(i)) for i in range(3000)]
        self.assertEqual(H.cycles(edges),set())
        edges.append(('3000','2999','back'))
        self.assertEqual(H.cycles(edges),{'2999','back'})

    def test_real_validator_reports_history_failures(self):
        claims=[claim('a','p-a','descendantOf',entity('p-b')),claim('b','p-b','descendantOf',entity('p-a'))]
        doc=V.ClaimsDoc(Path('test.md'),'test','test',{},claims)
        chunk={'id':'chunk-a','text':'original','norm':'original','sourceId':'src-a'}
        report=V.validate({'chunk-a':chunk},{'p-a':'test','p-b':'test'},[doc],{})
        self.assertEqual({f.code for f in report.failures},{'history-genealogy-cycle'})


if __name__=='__main__':unittest.main()
