"""Import one published HGIS administrative level; Shapely is needed only here."""
import argparse
from collections import Counter
from contextlib import closing
import gzip
import hashlib
import json
from pathlib import Path
import shutil
import sqlite3
import struct
import tempfile
import zipfile

import shapely
from import_location_research import markdown,write_same

SOURCE='src-hgis-admin-1910-1945'
URL='https://hgis.history.go.kr/pro_g1/dataset.do'
MAP_NAMES={1:'hgis-provinces-1910-1945',2:'hgis-districts-1910-1945',3:'hgis-townships-1883-1945'}


def gpkg_shape(blob):
    assert blob[:3]==b'GP\0'
    flags=blob[3];envelope=(flags>>1)&7
    assert not flags&0b11100000 and envelope in range(5)
    assert struct.unpack('<i' if flags&1 else '>i',blob[4:8])[0]==4326
    offset=8+(0,32,48,48,64)[envelope]
    return shapely.from_wkb(blob[offset:])


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--zip',type=Path,required=True)
    ap.add_argument('--level',type=int,choices=(1,2,3),default=1)
    ap.add_argument('--generated-at',default='2026-09-06')
    ap.add_argument('--research',type=Path,required=True);ap.add_argument('--data',type=Path,default=Path('data'))
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run.get('exitCode')==0 and not run.get('isError') and 'claude-opus-5' in run['modelsObserved']
    data=args.data;features=[];chunks=[];counts={'originalVertices':0,'displayVertices':0};invalid=[]
    map_name=MAP_NAMES[args.level]
    invalid_display=[];type_counts=Counter()
    archive_hash=hashlib.file_digest(args.zip.open('rb'),'sha256').hexdigest()
    with tempfile.TemporaryDirectory(prefix='sigong-hgis-') as temp:
        path=Path(temp)/'source.gpkg'
        with zipfile.ZipFile(args.zip) as archive:
            member=next(n for n in archive.namelist() if n.endswith('.gpkg'))
            with archive.open(member) as incoming,path.open('wb') as target:shutil.copyfileobj(incoming,target)
        gpkg_hash=hashlib.file_digest(path.open('rb'),'sha256').hexdigest()
        with closing(sqlite3.connect(path)) as db:
            db.row_factory=sqlite3.Row
            layer=db.execute("select * from gpkg_geometry_columns where geometry_type_name='MULTIPOLYGON'").fetchone()
            assert layer['srs_id']==4326 and layer['z']==layer['m']==0
            table=layer['table_name'];quoted='"'+table.replace('"','""')+'"'
            for row in db.execute('select * from '+quoted+' where lv=? order by fid',(args.level,)):
                record=dict(row);blob=record.pop('geom');shape=gpkg_shape(blob)
                type_counts[record['type']]+=1
                if not shape.is_valid:invalid.append(record['id'])
                display=shapely.simplify(shape,0.002,preserve_topology=True)
                assert display.geom_type in ('Polygon','MultiPolygon') and not display.is_empty
                if not display.is_valid:invalid_display.append(record['id'])
                counts['originalVertices']+=int(shapely.get_num_coordinates(shape))
                counts['displayVertices']+=int(shapely.get_num_coordinates(display))
                feature_id='hgis-admin-'+str(record['id']);chunk_id='chunk_'+feature_id
                claim_id='claim-'+feature_id+'-boundary';entity_id='place-'+feature_id
                # These are the dataset's fields, including its truncated text and trust codes.
                text=json.dumps(record,ensure_ascii=False,sort_keys=True,indent=2)
                chunk={'id':chunk_id,'sourceId':SOURCE,'text':text,'chunkType':'dataset-record',
                       'locator':f'{member} › {table} › fid={record["fid"]}, id={record["id"]}',
                       'permalink':URL,'lang':'ko','geometrySha256':hashlib.sha256(blob).hexdigest()}
                chunks.append(chunk)
                properties={'id':feature_id,'label':record['fullname'],'kind':'administrative-boundary',
                            'fromSource':SOURCE,'origin':'ai','claimId':claim_id,'citesChunk':chunk_id,
                            'validFrom':int(record['begin'][:4]),'validTo':int(record['end'][:4]),
                            'begin':record['begin'],'end':record['end'],'originalGeometrySha256':chunk['geometrySha256'],
                            'precision':'display-simplification-0.002-degrees','sourceRecord':record}
                if args.level>=2:
                    properties['originalGeometryValid']=bool(shape.is_valid)
                    properties['originalGeometryIssue']=None if shape.is_valid else shapely.is_valid_reason(shape)
                if args.level==3:
                    properties['displayGeometryValid']=bool(display.is_valid)
                    properties['displayGeometryIssue']=None if display.is_valid else shapely.is_valid_reason(display)
                geometry=json.loads(shapely.to_geojson(display))
                features.append({'type':'Feature','id':feature_id,'properties':properties,'geometry':geometry})
                write_same(data/'entities/place'/(entity_id+'.md'),markdown(
                    {'type':'Place','id':entity_id,'label':record['fullname']+' (HGIS '+str(record['id'])+')'},
                    '기관 데이터의 시기별 행정구역 레코드를 가리키는 이름이다. 다른 시대 지명과 합치지 않는다.'))
                claim={'id':claim_id,'subject':entity_id,'predicate':'syj:hasBoundaryRecord',
                       'object':{'kind':'literal','value':map_name+'.geojson#'+feature_id},
                       'fromSource':SOURCE,'citesChunk':chunk_id,'quote':text,'origin':'ai','status':'draft',
                       'validFrom':properties['validFrom'],'validTo':properties['validTo'],
                       'generatedBy':'codex','generatedAt':args.generated_at,
                       'note':'기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다.'}
                write_same(data/'claims'/SOURCE.removeprefix('src-')/(chunk_id+'.md'),markdown(
                    {'type':'Claims','source':SOURCE,'chunk':chunk_id,'status':'draft','generated_by':'codex'},
                    '```claims-json\n'+json.dumps([claim],ensure_ascii=False,indent=2)+'\n```'))
    chunks_path=data/'sources'/SOURCE.removeprefix('src-')/'chunks.jsonl'
    previous=[json.loads(line) for line in chunks_path.read_text(encoding='utf-8').splitlines()] if chunks_path.exists() else []
    combined={chunk['id']:chunk for chunk in previous}
    for chunk in chunks:
        if chunk['id'] in combined and combined[chunk['id']]!=chunk:
            raise ValueError('different source record for existing ID: '+chunk['id'])
        combined[chunk['id']]=chunk
    records=[json.loads(c['text']) for c in combined.values()]
    level_counts={level:sum(r['lv']==level for r in records) for level in (1,2,3)}
    first_year=min(int(r['begin'][:4]) for r in records)
    last_year=max(int(r['end'][:4]) for r in records)
    meta={'type':'Source','id':SOURCE,'label':f'역사지리정보DB · {first_year}~{last_year}년 도·군·부·읍·면 등 경계',
          'sourceKind':'현대 기관 구축 역사 GIS','sourceGroup':'역사 공간 자료','composedYear':None,
          'coversFrom':first_year,'coversTo':last_year,'defaultLens':False,'resource':URL,
          'license':'open-data-catalog-unrestricted','licenseDetail':'공공데이터포털 15080854의 이용허락범위: 제한 없음. 공공누리 유형 번호 미확인.',
          'edition':'개방데이터셋 2025.04.24 표시 · 2026-09-06 다운로드','status':'draft','verified':None,
          'originalLanguage':'ko','narrativeVoice':'modern-institutional-reconstruction','generated_by':'codex'}
    body=f'''# {first_year}~{last_year}년 도·군·부·읍·면 등 경계

국사편찬위원회 역사지리정보DB의 도 단위 {level_counts[1]}개, 군·부 등 단위 {level_counts[2]}개, 읍·면 등 단위 {level_counts[3]}개 시기별 레코드다. 고대 강역이 아니다.
기관의 일반 표제는 1910~1945년이지만 읍·면 등 원 레코드에는 1883년에 시작한 기록도 있다. 기록된 시작일을 그대로 보존한다.
선택한 해와 기간이 겹치는 모든 경계를 표시하므로 같은 해에 바뀐 경계가 함께 보일 수 있다.
경계 변경일·기관이 적은 근거·추정 및 신뢰도 코드·잘린 텍스트를 원문 레코드에서 확인할 수 있다.

[제공처](https://hgis.history.go.kr/pro_g1/dataset.do) · [공공데이터포털 이용조건](https://www.data.go.kr/data/15080854/fileData.do)

기관 개요의 EPSG:5179와 달리 실제 받은 GeoPackage는 EPSG:4326이다. 파일 내부 좌표계를 사용했다.
표시용 도형은 Shapely 2.1.2로 0.002도 허용값에서 단순화했다. 현대 측량 경계나 법적 경계로 확정한 자료가 아니다.
개별 도형의 유효성 상태와 다운로드·원 좌표 해시는 적재 보고서에 남겼다. 수록한 점은 없다.
군·부 등 레코드의 원 호칭에는 郡·府·島·部가 있으며 원값을 그대로 표시한다.
읍·면 등 원 호칭은 面·邑·部·區·居留地·社·坊이며 현대 행정구역 구분으로 바꾸지 않는다.
원 도형이나 표시용 도형에 오류가 있는 경우에는 상세 패널에 표시한다. 원 좌표 해시와 표시용 단순화 결과를 함께 보존한다.

조사 Claude Opus 5 / Max, 파일 대조·좌표 변환과 연결 Codex. 사람의 해석 검토는 아직 없다.
'''
    card=data/'sources'/(SOURCE.removeprefix('src-')+'.md');card.parent.mkdir(parents=True,exist_ok=True)
    card.write_text(markdown(meta,body.rstrip()),encoding='utf-8')
    chunks_path.parent.mkdir(parents=True,exist_ok=True)
    chunks_path.write_text(''.join(json.dumps(c,ensure_ascii=False,sort_keys=True)+'\n' for c in combined.values()),encoding='utf-8')
    collection={'type':'FeatureCollection','name':map_name,'features':features}
    raw=(json.dumps(collection,ensure_ascii=False,separators=(',',':'))+'\n').encode()
    out=data/'maps'/(map_name+'.geojson.gz');out.parent.mkdir(parents=True,exist_ok=True)
    out.write_bytes(gzip.compress(raw,mtime=0))
    research=data/'research'/{1:'hgis-57',2:'hgis-districts-72',3:'hgis-townships-75'}[args.level];research.mkdir(parents=True,exist_ok=True)
    for name in ('result.json','run.json'):shutil.copyfile(args.research/name,research/name)
    report={'source':SOURCE,'zipSha256':archive_hash,'gpkgMember':member,'gpkgSha256':gpkg_hash,
            'level':args.level,'features':len(features),'allLevelCounts':level_counts,'typeCounts':dict(type_counts),'crs':'EPSG:4326 from gpkg_geometry_columns and every binary header',
            'simplification':{'shapely':shapely.__version__,'toleranceDegrees':0.002,'preserveTopology':True},
            **counts,'invalidOriginalGeometryIds':invalid,'invalidDisplayGeometryIds':invalid_display,'displayGeoJsonSha256':hashlib.sha256(raw).hexdigest(),
            'gzipBytes':out.stat().st_size,'rawBytes':len(raw),'humanReviewed':False,
            'limitations':['Published modern-era administrative records only. Level 3 includes records beginning in 1883. No ancient borders or post-road reconstruction.',
                           'Date overlap is evaluated by year; the original day boundaries remain in each record.',
                           'Original reference strings can be truncated and contain replacement characters. They are preserved.']}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':main()
