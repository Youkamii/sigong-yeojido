"""Convert a generated image to bounded JPEGs and merge its recorded metadata."""
import argparse
from datetime import datetime
from io import BytesIO
import json
import os
from pathlib import Path
import re
import tempfile

from PIL import Image, ImageOps


LABEL = "AI 상상도"
# index.json 호환용 상수 — 화면에 쓰이는 경로는 없다 (#198 Q5=a, 고지 문장 삭제).
NOTICE = "실제 사료·유물 사진이 아니라 AI 가 만든 상상도입니다."
GENERATOR = "codex gpt-6-astra"
ROOT = Path(__file__).resolve().parents[2]
DEFAULT_METADATA = Path(__file__).with_name("pilot-items.json")
TEXT_FIELDS = ("id", "title", "place", "subjectType", "model", "prompt",
               "stylePrefix", "generatedAt", "basis", "caveats")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def select_metadata(path, image_id):
    data = read_json(path)
    rows = data if isinstance(data, list) else [data]
    matches = [row for row in rows if isinstance(row, dict) and row.get("id") == image_id]
    if len(matches) != 1:
        raise ValueError(f"metadata must contain exactly one entry for {image_id}")
    row = matches[0]
    for field in TEXT_FIELDS:
        if not isinstance(row.get(field), str) or not row[field].strip():
            raise ValueError(f"metadata field {field} must be a nonempty string")
    subjects = row.get("subjects")
    if (not isinstance(subjects, list) or not subjects
            or any(not isinstance(subject, str) or not subject.strip() for subject in subjects)
            or len(set(subjects)) != len(subjects)):
        raise ValueError("metadata subjects must be a nonempty array of unique nonempty strings")
    if type(row.get("year")) is not int:
        raise ValueError("metadata year must be an integer (portrait: depicted year)")
    if row["subjectType"] not in ("event", "person"):
        raise ValueError("subjectType must be event or person")
    if not row["prompt"].startswith(row["stylePrefix"]):
        raise ValueError("prompt must start with the exact stylePrefix")
    generated_at = datetime.fromisoformat(row["generatedAt"].replace("Z", "+00:00"))
    if generated_at.tzinfo is None:
        raise ValueError("generatedAt must include an ISO timezone")
    return {key: row[key] for key in (*TEXT_FIELDS, "year", "subjects")}


def encode_jpeg(image, edge, limit):
    scale = edge / max(image.size)
    size = tuple(max(1, round(value * scale)) for value in image.size)
    resized = image.resize(size, Image.Resampling.LANCZOS)
    for quality in range(85, 79, -1):
        buffer = BytesIO()
        resized.save(buffer, format="JPEG", quality=quality, optimize=True,
                     progressive=True, subsampling=2)
        payload = buffer.getvalue()
        if len(payload) <= limit:
            with Image.open(BytesIO(payload)) as check:
                check.load()
                if check.format != "JPEG" or check.size != size or check.mode != "RGB":
                    raise ValueError("encoded JPEG failed validation")
            return payload, size, quality
    raise ValueError(f"cannot fit {edge}px JPEG in {limit} bytes at quality 80–85")


def finalize(src, image_id, out, metadata, overwrite=False):
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", image_id) or image_id.endswith("-512"):
        raise ValueError("id must be a lowercase hyphenated slug, without reserved -512 suffix")
    row = select_metadata(metadata, image_id)
    index_path = out / "index.json"
    index = read_json(index_path) if index_path.exists() else {"images": []}
    if not isinstance(index, dict) or not isinstance(index.get("images"), list):
        raise ValueError("index.json must be an object containing an images array")
    rows = index["images"]
    if any(not isinstance(entry, dict) or not isinstance(entry.get("id"), str) for entry in rows):
        raise ValueError("existing index contains an invalid entry")
    if len({entry["id"] for entry in rows}) != len(rows):
        raise ValueError("existing index contains duplicate ids")
    full_path, preview_path = out / f"{image_id}.jpg", out / f"{image_id}-512.jpg"
    if src.resolve() in (full_path.resolve(), preview_path.resolve(), index_path.resolve()):
        raise ValueError("src must be a separate generated original")
    if not overwrite and (full_path.exists() or preview_path.exists()
                          or any(entry["id"] == image_id for entry in rows)):
        raise FileExistsError(f"{image_id} already exists; pass --overwrite to replace")
    with Image.open(src) as original:
        oriented = ImageOps.exif_transpose(original)
        rgba = oriented.convert("RGBA")
        image = Image.new("RGB", rgba.size, "white")
        image.paste(rgba, mask=rgba.getchannel("A"))
        # Discard source EXIF, PNG text and other embedded metadata.
        full, size, quality = encode_jpeg(image, 1024, 250_000)
        preview, preview_size, preview_quality = encode_jpeg(image, 512, 80_000)
    entry = {"id": image_id, "title": row["title"], "year": row["year"],
             "place": row["place"], "subjectType": row["subjectType"], "subjects": row["subjects"],
             "file": full_path.name, "preview": preview_path.name,
             "width": size[0], "height": size[1], "bytes": len(full),
             "previewBytes": len(preview), "model": row["model"],
             "prompt": row["prompt"], "stylePrefix": row["stylePrefix"],
             "generatedAt": row["generatedAt"], "generator": GENERATOR,
             "basis": row["basis"], "caveats": row["caveats"]}
    merged = [entry if old["id"] == image_id else old for old in rows]
    if not any(old["id"] == image_id for old in rows):
        merged.append(entry)
    index.update(label=LABEL, notice=NOTICE, images=merged)
    payloads = {full_path: full, preview_path: preview,
                index_path: (json.dumps(index, ensure_ascii=False, indent=2) + "\n").encode("utf-8")}
    out.mkdir(parents=True, exist_ok=True)
    # Prepare all files before replacing any; restore prior files on a write error.
    backups = {path: path.read_bytes() if path.exists() else None for path in payloads}
    replaced = []
    with tempfile.TemporaryDirectory(prefix=".finalize-", dir=out) as staging:
        for path, payload in payloads.items():
            (Path(staging) / path.name).write_bytes(payload)
        try:
            for path in payloads:
                os.replace(Path(staging) / path.name, path)
                replaced.append(path)
        except OSError:
            for path in reversed(replaced):
                if backups[path] is None:
                    path.unlink(missing_ok=True)
                else:
                    path.write_bytes(backups[path])
            raise
    return {"id": image_id, "file": full_path.name, "width": size[0], "height": size[1],
            "bytes": len(full), "quality": quality, "preview": preview_path.name,
            "previewWidth": preview_size[0], "previewHeight": preview_size[1],
            "previewBytes": len(preview), "previewQuality": preview_quality}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--src", type=Path, required=True)
    parser.add_argument("--id", required=True)
    parser.add_argument("--out", type=Path, default=ROOT / "services/host/assets/ai-images")
    parser.add_argument("--metadata", type=Path, default=DEFAULT_METADATA,
                        help="recorded generation metadata object or array; defaults to pilot-items.json")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    try:
        result = finalize(args.src, args.id, args.out, args.metadata, args.overwrite)
    except (ValueError, OSError) as error:
        parser.exit(1, f"error: {error}\n")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
