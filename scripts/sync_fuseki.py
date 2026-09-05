#!/usr/bin/env python3
"""데이터를 검증·빌드한 뒤 Fuseki 기본 그래프를 교체하고 트리플 수를 대조한다.

python3 scripts/sync_fuseki.py          # 한 번
python3 scripts/sync_fuseki.py --watch  # 변경 또는 인메모리 데이터 소실 때 재적재
"""
import argparse
from dataclasses import dataclass
from pathlib import Path
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services"))
import build_ttl
from fuseki_load import DEFAULT_ENDPOINT, count_triples, upload


@dataclass
class SyncState:
    signature: tuple
    triples: int


def signature(data: Path) -> tuple:
    paths = [data / "places.json"]
    for pattern in ("sources/*.md", "sources/*/chunks.jsonl", "entities/**/*.md",
                    "claims/**/*.md", "claims/**/.digests.json"):
        paths.extend(data.glob(pattern))
    result = []
    for path in sorted(set(paths)):
        if path.is_file():
            stat = path.stat()
            result.append((str(path), stat.st_mtime_ns, stat.st_size))
    return tuple(result)


def sync(data: Path, out: Path, endpoint: str, previous: SyncState | None = None) -> SyncState:
    if not data.is_dir():
        raise FileNotFoundError(f"data root does not exist: {data}")
    before = signature(data)
    if previous and previous.signature == before and count_triples(endpoint) == previous.triples:
        return previous
    code, result = build_ttl.build(data, out)
    if code:
        raise RuntimeError("TTL validation/build failed; Fuseki was not changed")
    if signature(data) != before:
        raise RuntimeError("data changed during build; retry with a complete snapshot")
    upload(endpoint, str(out), replace=True)
    count = count_triples(endpoint)
    if count != result.stats["triples"]:
        raise RuntimeError(f"Fuseki has {count} triples; build contains {result.stats['triples']}")
    print(f"SYNC OK: {count} triples, sha256 {result.sha256}", flush=True)
    return SyncState(before, count)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=ROOT / "data")
    parser.add_argument("--out", type=Path)
    parser.add_argument("--endpoint", default=DEFAULT_ENDPOINT)
    parser.add_argument("--watch", action="store_true")
    parser.add_argument("--interval", type=float, default=5)
    args = parser.parse_args(argv)
    if args.interval <= 0:
        parser.error("--interval must be positive")
    data = args.data.resolve()
    out = args.out or data / "build/sigong.ttl"
    previous = None
    while True:
        try:
            previous = sync(data, out, args.endpoint, previous)
        except (OSError, RuntimeError, ValueError, SystemExit) as exc:
            print(f"SYNC FAILED: {exc}", file=sys.stderr, flush=True)
            if not args.watch:
                return 1
        if not args.watch:
            return 0
        time.sleep(args.interval)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        pass
