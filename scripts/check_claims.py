#!/usr/bin/env python3
"""기존 F3 진입점. 검증과 digest 기록은 services/validate.py 한 곳에서 한다.

일반 실행은 읽기 전용이다. 검토한 digest 기록은 --write-digests 로 명시한다.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "services"))
from validate import main


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.exit(main(sys.argv[1:]))
