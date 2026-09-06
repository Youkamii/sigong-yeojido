import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'services'))
import validate as V
import build_ttl as B


class TimeContractTests(unittest.TestCase):
    def setUp(self):
        self.claim={'id':'cl-time','subject':'event-a','predicate':'syj:occurredAt',
                    'object':{'kind':'time','id':'ts-a','verbatim':'甲子年','precision':'year'},
                    'fromSource':'src-a','citesChunk':'chunk-a','quote':'甲子年', 'origin':'ai','status':'draft'}

    def test_invalid_ranges_are_rejected_but_unknown_end_is_preserved(self):
        for extra in ({'earliest':500,'latest':400},{'year':0},{'earliest':True},{'year':550,'latest':500}):
            claim=copy.deepcopy(self.claim);claim['object'].update(extra)
            with self.subTest(extra=extra):
                errors=[]
                self.assertFalse(V.check_shape(claim,0,'test',errors))
        self.claim['object'].update(earliest=None,latest=500)
        self.assertTrue(V.check_shape(self.claim,0,'test',[]))

    def test_build_keeps_all_bounds_and_rejects_conflicting_redefinition(self):
        self.claim['object'].update(year=424,earliest=420,latest=430,calendar='source-stated')
        graph=B.Graph();stats=B.ClaimStats()
        doc=V.ClaimsDoc(Path('test.md'),'test','test',{},[self.claim])
        B.add_claim(graph,self.claim,doc,{}, {},stats)
        # Inspect the serialized graph, not the Python source object.
        text=B.render(graph,[])[0]
        for key,value in (('year',424),('earliest',420),('latest',430)):
            self.assertIn(f'syj:{key} {value}',text)
        self.assertIn('source-stated',text)
        changed=copy.deepcopy(self.claim);changed['id']='cl-redefinition';changed['object']['latest']=431
        with self.assertRaises(B.BuildError):
            B.add_claim(graph,changed,doc,{}, {},stats)

    def test_bc_uses_no_year_zero_and_day_ganji_is_not_year_ganji(self):
        for raw,precision,year in (('甲子年','year',-57),('元年 夏六月 丙辰','day',918)):
            claim=copy.deepcopy(self.claim)
            claim.update(subject='ts-a',predicate='syj:convertsTo',object={'kind':'year','value':year})
            errors=[]
            V.check_reading_and_calendar(claim,None,{'ts-a':{'verbatim':raw,'precision':precision}},'test',errors)
            self.assertEqual(errors,[])


if __name__=='__main__':
    unittest.main()
