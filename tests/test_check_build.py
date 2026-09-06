import json
from pathlib import Path
import tempfile
import unittest
import check_build as C


class BuildAcceptanceTests(unittest.TestCase):
    def test_quote_is_allowed_but_chunk_body_and_disguised_body_are_rejected(self):
        node=C.syj('chunk-one');text='원문 전체를 인용한 작은 조각'
        chunks={'chunk-one':{'id':'chunk-one','text':text,'locator':'본문 1'}}
        graph={(node,C.T.RDF_TYPE,C.syj('Chunk')),(node,C.RDFS_LABEL,'"chunk-one"'),
               (node,C.syj('locator'),'"본문 1"'),(C.syj('claim-one'),C.syj('quote'),json.dumps(text,ensure_ascii=False))}
        self.assertEqual(C.chunk_metadata_errors(graph,chunks),[])
        for predicate in (C.syj('text'),C.syj('locator')):
            self.assertTrue(C.chunk_metadata_errors(graph|{(node,predicate,json.dumps(text,ensure_ascii=False))},chunks))

    def test_owl_literal_is_allowed_but_owl_iris_and_datatypes_are_rejected(self):
        prefix=(C.syj('claim-one'),C.syj('note'))
        self.assertFalse(C.uses_owl({(*prefix,'"owl:sameAs로 합치지 않는다."')}))
        owl='http://www.w3.org/2002/07/owl#Thing'
        for graph in ({(*prefix,owl)},{(C.syj('one'),owl,C.syj('two'))},{(*prefix,'"one"^^<'+owl+'>')}):
            self.assertTrue(C.uses_owl(graph))

    def test_saved_citation_objects_are_loaded_once_and_mismatch_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder=Path(tmp)/'sources/one';folder.mkdir(parents=True)
            row={'id':'chunk-one','sourceId':'src-one','text':'원문','locator':'1','lang':'ko'}
            sample=folder/'citation-chunks.jsonl';sample.write_text(json.dumps(row)+'\n',encoding='utf-8')
            self.assertEqual(C.load_chunks(Path(tmp)).raw('chunk-one'),row)
            (folder/'chunks.jsonl').write_text(sample.read_text(encoding='utf-8'),encoding='utf-8')
            self.assertEqual(len(C.load_chunks(Path(tmp))),1)
            sample.write_text(json.dumps(dict(row,text='변경'))+'\n',encoding='utf-8')
            with self.assertRaises(ValueError):C.load_chunks(Path(tmp))

    def test_multiple_participants_are_not_reading_conflicts(self):
        graph=set()
        for predicate in ('hasParticipant','readsCharacterAs'):
            for i,value in enumerate(('해','매')):
                claim=C.syj(predicate+str(i))
                graph.update({(claim,C.T.RDF_TYPE,C.syj('Claim')),(claim,C.syj('subject'),C.syj('subject')),
                    (claim,C.syj('predicate'),C.syj(predicate)),(claim,C.syj('objectLiteral'),json.dumps(value,ensure_ascii=False))})
        idx=C.T.Index(graph);expected=C.expected_conflicts(idx,idx.of_type(C.syj('Claim')))
        self.assertEqual(set(expected),{(C.syj('subject'),C.syj('readsCharacterAs'))})
        self.assertEqual(len(next(iter(expected.values()))),2)


if __name__=='__main__':unittest.main()
