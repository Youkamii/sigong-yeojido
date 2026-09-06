"""Download the NDL 1934 Gyeongguk Daejeon scan in the provider's canvas order."""
import argparse
import hashlib
import json
from pathlib import Path
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from PIL import Image

MANIFEST = 'https://dl.ndl.go.jp/api/iiif/1232807/manifest.json'
PREFIX = 'https://dl.ndl.go.jp/api/iiif/1232807/'


def download(url, path):
    if not path.exists():
        with urlopen(Request(url, headers={'User-Agent': 'SigongYeojido/1.0 (public historical source archive)'}), timeout=90) as response:
            data = response.read()
        path.write_bytes(data)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--cache', type=Path, required=True)
    ap.add_argument('--images', type=Path, required=True)
    ap.add_argument('--retry-missing', action='store_true', help='Retry missing images after the provider asks to visit later; same original URLs only')
    args = ap.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    args.images.mkdir(parents=True, exist_ok=True)
    manifest_path = args.cache / 'manifest.json'
    download(MANIFEST, manifest_path)
    raw = manifest_path.read_bytes()
    manifest = json.loads(raw)
    metadata = {m['label']: m['value'] for m in manifest['metadata']}
    assert metadata['Persistent ID'] == 'info:ndljp/pid/1232807'
    assert metadata['Access Restrictions'] == 'PDM'
    canvases = manifest['sequences'][0]['canvases']
    assert len(canvases) == 319 and len({c['@id'] for c in canvases}) == 319
    previous_path = args.cache / 'download-failures.json'
    failures = json.loads(previous_path.read_text(encoding='utf-8')) if previous_path.exists() else []
    denied = {f['url'] for f in failures if f['status'] == 403}
    images = []
    consecutive_denials = 0
    for number, canvas in enumerate(canvases, 1):
        assert canvas['@id'] == PREFIX + f'canvas/{number}'
        assert len(canvas['images']) == 1
        resource = canvas['images'][0]['resource']
        url = resource['@id']
        assert url == PREFIX + f'R{number:07}/full/full/0/default.jpg'
        path = args.images / f'R{number:07}.jpg'
        if url in denied and not path.exists() and not args.retry_missing:
            continue
        new = not path.exists()
        for attempt in range(3):
            try:
                download(url, path)
                break
            except HTTPError as exc:
                body = exc.read(4096).decode('utf-8', errors='replace')
                failures.append({'number': number, 'url': url, 'status': exc.code,
                                 'retryAfter': exc.headers.get('Retry-After'), 'responseText': body})
                previous_path.write_text(json.dumps(failures, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
                if exc.code == 403 and 'Please visit later.' in body and attempt < 2:
                    print(json.dumps({'providerTemporaryError': number, 'waitSeconds': 60}), flush=True)
                    time.sleep(60)
                    continue
                if exc.code != 403:
                    raise
                break
        if not path.exists():
            consecutive_denials += 1
            if consecutive_denials >= 2:
                break
            continue
        consecutive_denials = 0
        with Image.open(path) as image:
            image.load()
            assert image.format == 'JPEG'
            assert image.size == (resource['width'], resource['height'])
        content = path.read_bytes()
        images.append({'number': number, 'canvas': canvas['@id'], 'label': canvas['label'],
                       'file': path.name, 'url': url, 'width': resource['width'], 'height': resource['height'],
                       'bytes': len(content), 'sha256': hashlib.sha256(content).hexdigest()})
        if number % 20 == 0 or number == len(canvases):
            print(json.dumps({'downloaded': len(images), 'providerNumber': number, 'total': len(canvases), 'bytes': sum(i['bytes'] for i in images)}), flush=True)
        if new:
            time.sleep(1)
    report = {'manifestUrl': MANIFEST, 'manifestSha256': hashlib.sha256(raw).hexdigest(),
              'imageCount': len(images), 'bytes': sum(i['bytes'] for i in images),
              'representation': 'original IIIF full/full JPEG, no local resize or OCR', 'images': images,
              'expectedImages': len(canvases), 'missingNumbers': sorted(set(range(1, len(canvases)+1)) - {i['number'] for i in images}),
              'failures': failures}
    (args.cache / 'image-index.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    if report['missingNumbers']:
        raise SystemExit(f'Incomplete archive: missing {report["missingNumbers"]}. See download-failures.json before resuming.')


if __name__ == '__main__':
    main()
