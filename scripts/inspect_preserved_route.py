"""Read the supplied course legend and original GPX without inferring a historic route."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile


def inspect(path):
    expected = '53cd9e503b5f4d564516bfd8d39c0c9b0d9dc62d56ecb5d4ca015efc554a9950'
    raw = path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != expected:
        raise ValueError('The supplied 15108080 ZIP has changed; review the new file before importing it.')
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        if archive.testzip() is not None:
            raise ValueError('Invalid ZIP member checksum')
        files = [i for i in archive.infolist() if not i.is_dir()]
        legend_name = next(i.filename for i in files if i.filename.endswith('.xlsx'))
        with zipfile.ZipFile(io.BytesIO(archive.read(legend_name))) as legend:
            ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            shared = [''.join(item.itertext()) for item in ET.fromstring(legend.read('xl/sharedStrings.xml')).findall('s:si', ns)]
            courses, group = [], None
            for row in ET.fromstring(legend.read('xl/worksheets/sheet1.xml')).findall('.//s:row', ns):
                values = {}
                for cell in row.findall('s:c', ns):
                    value = cell.find('s:v', ns)
                    values[''.join(c for c in cell.attrib['r'] if c.isalpha())] = (
                        shared[int(value.text)] if value is not None and cell.get('t') == 's'
                        else value.text if value is not None else '')
                if values.get('A') == '국가숲길명':
                    continue
                group = values.get('A') or group
                if values.get('B'):
                    courses.append({'forest': group, 'course': values['B'], 'id': values.get('C')})
        selected = [c for c in courses if c['forest'] == '대관령숲길' and c['course'] == '대관령옛길']
        assert selected == [{'forest': '대관령숲길', 'course': '대관령옛길', 'id': '0000000008'}]
        name = '9900000003_대관령숲길/대관령숲길_0000000008.gpx'
        gpx = archive.read(name)
    ns = {'g': 'http://www.topografix.com/GPX/1/1'}
    root = ET.fromstring(gpx)
    assert root.tag == '{http://www.topografix.com/GPX/1/1}gpx' and root.get('version') == '1.1'
    segments = root.findall('g:trk/g:trkseg', ns)
    coordinates = [[[float(p.get('lon')), float(p.get('lat'))] for p in segment.findall('g:trkpt', ns)] for segment in segments]
    assert len(coordinates) == 1 and len(coordinates[0]) == 932
    assert all(-180 <= lon <= 180 and -90 <= lat <= 90 for segment in coordinates for lon, lat in segment)
    points = [p for segment in segments for p in segment.findall('g:trkpt', ns)]
    values = lambda tag: sorted({p.findtext('g:' + tag, namespaces=ns) for p in points})
    return {
        'dataset': '15108080', 'zipBytes': len(raw), 'zipSha256': expected,
        'files': len(files), 'gpxFiles': sum(i.filename.endswith('.gpx') for i in files),
        'legendFile': legend_name, 'legendCourses': courses, 'selectedCourse': selected[0],
        'file': name, 'fileBytes': len(gpx), 'fileSha256': hashlib.sha256(gpx).hexdigest(),
        'gpxVersion': root.get('version'), 'segments': len(segments), 'points': len(points),
        'first': coordinates[0][0], 'last': coordinates[0][-1],
        'coordinatesSha256': hashlib.sha256(json.dumps(coordinates, separators=(',', ':')).encode()).hexdigest(),
        'allElevationsAsWritten': values('ele'), 'allPointTimesAsWritten': values('time'),
        'metadataTimeAsWritten': root.findtext('g:metadata/g:time', namespaces=ns),
        'historicalGeometryInferred': False, 'addedConnections': 0, 'alteredCoordinates': 0,
        'note': '원 범례와 순서 있는 좌표의 파일 대조다. 역사적 노면·기간의 동일성, 고도·이동 시각의 정확성을 판정하지 않는다.',
    }


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--zip', type=Path, default=Path('data/research/preserved-routes-57/15108080.zip'))
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    record = inspect(args.zip)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in record.items() if k != 'legendCourses'}, ensure_ascii=False))
