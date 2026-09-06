"""Small verbatim copies of cited chunks from corpora kept outside Git."""
import json


def citation_samples(sources_dir):
    samples={}
    for path in sorted(sources_dir.glob('*/citation-chunks.jsonl')):
        with path.open('rb') as stream:
            while True:
                offset=stream.tell();line=stream.readline()
                if not line:break
                if not line.strip():continue
                row=json.loads(line);cid=row.get('id')
                if not isinstance(cid,str) or not cid or not isinstance(row.get('text'),str):
                    raise ValueError(f'{path}: citation sample requires id and text')
                if row.get('sourceId')!='src-'+path.parent.name:
                    raise ValueError(f'{path}: citation sample source does not match its folder')
                if cid in samples:raise ValueError(f'duplicate citation sample {cid}')
                samples[cid]=(path,offset,row)
    return samples
