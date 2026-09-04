"""위키문헌에서 광개토왕비 원문 위키텍스트를 받아 저장한다.

c2에서 실행: python3 fetch_gwanggaeto.py
저장 위치: ~/sigong-yeojido/data/sources/gwanggaeto/
"""
import io
import json
import os
import re
import urllib.parse
import urllib.request

PAGE = "국강상광개토경평안호태왕 비문"
API = "https://ko.wikisource.org/w/api.php"
OUT_DIR = os.path.expanduser("~/sigong-yeojido/data/sources/gwanggaeto")

params = {
    "action": "parse",
    "page": PAGE,
    "prop": "wikitext|revid",
    "format": "json",
    "formatversion": "2",
}
url = API + "?" + urllib.parse.urlencode(params)
req = urllib.request.Request(url, headers={"User-Agent": "sigong-yeojido/0.1 (research)"})
with urllib.request.urlopen(req, timeout=30) as r:
    data = json.loads(r.read().decode("utf-8"))

if "error" in data:
    raise SystemExit("API error: " + str(data["error"]))

parse = data["parse"]
wikitext = parse["wikitext"]

os.makedirs(OUT_DIR, exist_ok=True)
raw_path = os.path.join(OUT_DIR, "raw.wikitext")
io.open(raw_path, "w", encoding="utf-8", newline="\n").write(wikitext)

meta = {
    "title": parse["title"],
    "revid": parse.get("revid"),
    "sourceUrl": "https://ko.wikisource.org/wiki/"
    + urllib.parse.quote(PAGE.replace(" ", "_")),
    "apiUrl": url,
    "license": "CC BY-SA 4.0",
    "licenseNote": "위키문헌 기본 라이선스. 재배포 시 출처 표기 + 동일조건 유지 필요",
    "wikitextChars": len(wikitext),
}
meta_path = os.path.join(OUT_DIR, "fetch-meta.json")
io.open(meta_path, "w", encoding="utf-8", newline="\n").write(
    json.dumps(meta, ensure_ascii=False, indent=2) + "\n"
)

# --- 통계 ---
faces = re.findall(r"==\s*(\S+?)\s*==", wikitext)
missing = wikitext.count("{{?}}")

# 한자만 남겨 글자 수 대략 계산 (템플릿·태그·마크업·괄호주석 제거)
stripped = re.sub(r"\{\{[^{}]*\}\}", "", wikitext)
stripped = re.sub(r"<[^>]+>", "", stripped)
stripped = re.sub(r"\([^()]*\)", "", stripped)
hanja = re.sub(r"[^㐀-鿿]", "", stripped)

print("revid:", parse.get("revid"))
print("wikitext 길이:", len(wikitext))
print("면 헤더:", faces)
print("결자 {{?}} 개수:", missing)
print("한자 글자 수(괄호주석 제외):", len(hanja))
print("결자 포함 추정 총자수:", len(hanja) + missing)
print("저장:", raw_path)
print("저장:", meta_path)
