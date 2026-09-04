#!/usr/bin/env python3
"""대동여지도 스캔본을 위키미디어 공용에서 받는다 (진입 화면용).

표준 배치: scripts/fetch_daedong.py
실행:      python3 scripts/fetch_daedong.py

대동여지도(1861, 김정호)는 저작권이 소멸했다. 위키미디어 공용의 스캔본을
라이선스 정보와 함께 받아 `services/host/assets/`에 둔다.
라이선스·출처는 같은 이름의 .meta.json에 남긴다 — 화면에 표기해야 하므로.
"""
from __future__ import annotations

import io
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "services" / "host" / "assets"
UA = "sigong-yeojido/0.1 (historical ontology research)"
API = "https://commons.wikimedia.org/w/api.php"

WANT = ["File:Daedongyeojido-full.jpg", "File:Daedongyeojido-small.png"]


def api(params: dict) -> dict:
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def strip(v) -> str:
    return re.sub(r"<[^>]+>", "", str(v)).strip()


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for title in WANT:
        r = api(
            {
                "action": "query",
                "titles": title,
                "prop": "imageinfo",
                "iiprop": "url|size|mime|extmetadata",
                "format": "json",
                "formatversion": "2",
            }
        )
        page = r["query"]["pages"][0]
        if "imageinfo" not in page:
            print(f"{title} → 없음")
            continue
        ii = page["imageinfo"][0]
        em = ii.get("extmetadata", {})

        name = title.split(":", 1)[1].replace(" ", "_")
        print(f"=== {title}")
        print(f"  {ii['width']}x{ii['height']}  {ii['size']/1024/1024:.2f} MB  {ii['mime']}")
        for k in ("LicenseShortName", "UsageTerms", "Artist", "Credit", "DateTimeOriginal"):
            if em.get(k, {}).get("value"):
                print(f"  {k}: {strip(em[k]['value'])[:120]}")

        req = urllib.request.Request(ii["url"], headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=300) as resp:
            blob = resp.read()
        (OUT / name).write_bytes(blob)

        meta = {
            "file": name,
            "commonsTitle": title,
            "descriptionUrl": ii.get("descriptionurl", ""),
            "sourceUrl": ii["url"],
            "width": ii["width"],
            "height": ii["height"],
            "bytes": len(blob),
            "license": strip(em.get("LicenseShortName", {}).get("value", "못 찾음")),
            "usageTerms": strip(em.get("UsageTerms", {}).get("value", "못 찾음")),
            "artist": strip(em.get("Artist", {}).get("value", "")),
            "credit": strip(em.get("Credit", {}).get("value", "")),
        }
        (OUT / f"{name}.meta.json").write_text(
            json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"  저장: services/host/assets/{name}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
