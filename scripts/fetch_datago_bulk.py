#!/usr/bin/env python3
"""공공데이터포털(data.go.kr)에서 국사편찬위 원문 XML 벌크를 받는다.

표준 배치: scripts/fetch_datago_bulk.py
실행:      python3 scripts/fetch_datago_bulk.py --dataset 15053635

왜 이 경로인가
--------------
db.history.go.kr의 robots.txt는 검색봇 4종 외 전면 Disallow다(2026-09 확인).
사이트를 직접 긁는 것은 규약 위반이므로, 국편이 공공데이터포털에 개방한
벌크 파일을 받는다. 데이터셋마다 이용허락범위가 다르므로 **반드시 개별 확인**한다.

다운로드 흐름 (사이트 JS `script_fileDetail.js`에서 역추적, 2026-09-05 확인)
---------------------------------------------------------------------------
1. 상세 페이지에서 `fn_fileDataDown('{publicDataPk}', '{publicDataDetailPk}', ...)` 파싱
2. POST /tcs/dss/selectFileDataDownload.do  → JSON으로 atchFileId·fileDetailSn 수신
3. GET  /cmm/cmm/fileDownload.do?atchFileId=…&fileDetailSn=…  → 실제 zip

주의: 과다 요청 시 캡차가 붙는 경로가 있다(사이트 JS의 check-reset.json).
필요한 것만 받고 재실행을 남발하지 않는다.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data" / "bulk"

BASE = "https://www.data.go.kr"
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0 Safari/537.36"
)

# 2026-09-05 확인. 이용허락범위는 데이터셋마다 다르다 — 반드시 상세 페이지에서 재확인할 것.
KNOWN = {
    "15053635": "삼국사기 원문",
    "15053634": "삼국유사 원문",
    "15053637": "고려사 원문",
    "15053647": "조선왕조실록 실록원문(태조~철종)",
    "15053646": "고순종실록 원문",
    "15053636": "비변사등록 원문",
    "15053630": "한국고대금석문",
    "15053631": "한국고대사료집성 원문",
    "15064218": "승정원일기 정보(원문 XML)",
}


def _get(url: str, referer: str | None = None) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    if referer:
        req.add_header("Referer", referer)
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read()


def _post(url: str, data: dict, referer: str) -> bytes:
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "User-Agent": UA,
            "Referer": referer,
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def fetch(dataset: str) -> Path:
    page_url = f"{BASE}/data/{dataset}/fileData.do"
    html = _get(page_url).decode("utf-8", "replace")

    m = re.search(
        r"fn_fileDataDown\(\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'",
        html,
    )
    if not m:
        raise SystemExit(f"[{dataset}] 다운로드 호출을 페이지에서 찾지 못했다")
    pk, detail_pk, atch, sn = m.groups()

    flat = re.sub(r"<[^>]+>", "\n", html)
    flat = re.sub(r"[ \t]+", " ", flat)
    lic = re.search(r"이용허락범위\s*\n\s*(\S[^\n]{0,60})", flat)
    title = re.search(r"<title>(.*?)</title>", html, re.S)
    print(f"제목        : {title.group(1).strip() if title else '?'}")
    print(f"이용허락범위: {lic.group(1).strip() if lic else '(페이지에서 못 찾음)'}")

    info = json.loads(
        _post(
            f"{BASE}/tcs/dss/selectFileDataDownload.do",
            {
                "publicDataPk": pk,
                "publicDataDetailPk": detail_pk,
                "atchFileId": atch,
                "fileDetailSn": sn,
                "publicDataTyCode": "PR0051",
            },
            page_url,
        ).decode("utf-8", "replace")
    )
    if not info.get("status"):
        raise SystemExit(f"[{dataset}] 다운로드 거부: {info.get('error')}")

    atch_id, file_sn = info["atchFileId"], info["fileDetailSn"]
    blob = _get(
        f"{BASE}/cmm/cmm/fileDownload.do"
        f"?atchFileId={atch_id}&fileDetailSn={file_sn}&dataNm={dataset}",
        referer=page_url,
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{dataset}.zip"
    out.write_bytes(blob)

    meta = {
        "dataset": dataset,
        "name": KNOWN.get(dataset, ""),
        "pageUrl": page_url,
        "licenseOnPage": lic.group(1).strip() if lic else "못 찾음",
        "atchFileId": atch_id,
        "fileDetailSn": file_sn,
        "bytes": len(blob),
    }
    (OUT_DIR / f"{dataset}.meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"저장        : {out.relative_to(ROOT)}  ({len(blob):,} bytes)")
    return out


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="15053635", help=f"알려진 것: {sorted(KNOWN)}")
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args(argv)
    if a.list:
        for k, v in sorted(KNOWN.items()):
            print(f"{k}  {v}")
        return 0
    fetch(a.dataset)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
