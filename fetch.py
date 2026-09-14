import sys, json, hashlib, datetime, urllib.request, urllib.parse, pathlib
ROOT = pathlib.Path(r"C:/Users/gkfkd/Git/sigong-curriculum/data/research/curriculum-joseon-late/joseon-late-5")
RAW = ROOT / "raw"
RAW.mkdir(parents=True, exist_ok=True)
MAN = ROOT / "manifest.json"

def fetch(url, slug):
    req = urllib.request.Request(url, headers={
        "User-Agent": "sigong-curriculum-research/1.0 (education mapping; contact gkfkd747@gmail.com)",
        "Accept-Language": "ko,en;q=0.8",
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
        status = r.status
    p = RAW / (slug + ".html")
    p.write_bytes(data)
    rec = {
        "url": url,
        "fetchedUtc": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "httpStatus": status,
        "byteLength": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "rawFile": "raw/" + slug + ".html",
    }
    return rec

if __name__ == "__main__":
    pairs = json.loads(sys.argv[1])
    out = []
    if MAN.exists():
        out = json.loads(MAN.read_text(encoding="utf-8"))
    seen = {r["url"] for r in out}
    for url, slug in pairs:
        try:
            rec = fetch(url, slug)
        except Exception as e:
            print("FAIL", slug, url, repr(e)[:200]); continue
        if rec["url"] in seen:
            out = [r for r in out if r["url"] != rec["url"]]
        out.append(rec); seen.add(rec["url"])
        print("OK", slug, rec["byteLength"], rec["httpStatus"])
    MAN.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
