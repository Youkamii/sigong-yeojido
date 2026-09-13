"""Run: python -B -m unittest discover -s scripts/ai_images -p 'test_*.py'."""
import json
from pathlib import Path
import random
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image

from finalize_image import ROOT, finalize, read_json


class FinalizeTests(unittest.TestCase):
    def setUp(self):
        # Keep all test artifacts in this worktree, including temporary originals.
        self.temp = tempfile.TemporaryDirectory(prefix=".ai-images-test-", dir=ROOT)
        self.addCleanup(self.temp.cleanup)
        self.folder = Path(self.temp.name)
        self.src = self.folder / "source.png"
        Image.new("RGBA", (1536, 1024), (80, 110, 150, 0)).save(self.src)
        self.out = self.folder / "out"
        self.metadata = self.folder / "items.json"
        self.row = {"id": "one", "title": "상상도", "year": 1446, "place": "조선",
                    "subjectType": "event", "subjects": ["event-one", "scene-one"], "model": "test-fixture",
                    "stylePrefix": "Watercolor.", "prompt": "Watercolor. An imaginary scene.",
                    "generatedAt": "2026-09-13T15:00:00Z", "basis": "fixture",
                    "caveats": "not a generated deliverable"}
        self.write_metadata([self.row, {**self.row, "id": "two"}])

    def write_metadata(self, rows):
        self.metadata.write_text(json.dumps(rows), encoding="utf-8")

    def run_image(self, image_id="one", overwrite=False):
        return finalize(self.src, image_id, self.out, self.metadata, overwrite)

    def snapshot(self):
        return {path.name: path.read_bytes() for path in self.out.iterdir()}

    def test_sizes_metadata_alpha_and_merge(self):
        result = self.run_image()
        self.assertEqual((result["width"], result["height"]), (1024, 683))
        self.assertEqual((result["previewWidth"], result["previewHeight"]), (512, 341))
        for name, edge, limit in [("one.jpg", 1024, 250_000), ("one-512.jpg", 512, 80_000)]:
            path = self.out / name
            self.assertLessEqual(path.stat().st_size, limit)
            with Image.open(path) as image:
                self.assertEqual((image.format, image.mode, max(image.size)), ("JPEG", "RGB", edge))
                self.assertEqual(image.getpixel((0, 0)), (255, 255, 255))
        first = read_json(self.out / "index.json")["images"][0]
        self.assertEqual(first["bytes"], (self.out / "one.jpg").stat().st_size)
        self.assertEqual(first["prompt"], self.row["prompt"])
        self.assertEqual(first["subjects"], self.row["subjects"])
        self.run_image("two")
        rows = read_json(self.out / "index.json")["images"]
        self.assertEqual(rows[0], first)
        self.assertEqual([row["id"] for row in rows], ["one", "two"])

    def test_overwrite_opt_in_and_no_duplicate(self):
        self.run_image()
        before = self.snapshot()
        with self.assertRaises(FileExistsError):
            self.run_image()
        self.assertEqual(self.snapshot(), before)
        Image.new("RGB", (1024, 1536), "red").save(self.src)
        result = self.run_image(overwrite=True)
        self.assertEqual((result["width"], result["height"]), (683, 1024))
        self.assertEqual(len(read_json(self.out / "index.json")["images"]), 1)

    def test_size_failure_preserves_existing_output(self):
        self.run_image()
        before = self.snapshot()
        noise = random.Random(188).randbytes(1024 * 1024 * 3)
        Image.frombytes("RGB", (1024, 1024), noise).save(self.src)
        with self.assertRaisesRegex(ValueError, "cannot fit 1024px"):
            self.run_image(overwrite=True)
        self.assertEqual(self.snapshot(), before)

    def test_invalid_metadata_and_reserved_id_write_nothing(self):
        self.write_metadata([{**self.row, "generatedAt": "2026-09-13T15:00:00"}])
        with self.assertRaisesRegex(ValueError, "timezone"):
            self.run_image()
        for image_id in ("../escape", "one-512"):
            with self.assertRaises(ValueError):
                self.run_image(image_id)
        self.assertFalse(self.out.exists())

    def test_invalid_subjects_write_nothing(self):
        for subjects in (None, [], "event-one", [""], [" "], [1], [None], [{}],
                         ["event-one", "event-one"]):
            with self.subTest(subjects=subjects):
                self.write_metadata([{**self.row, "subjects": subjects}])
                with self.assertRaisesRegex(ValueError, "subjects"):
                    self.run_image()
                self.assertFalse(self.out.exists())
        row = {key: value for key, value in self.row.items() if key != "subjects"}
        self.write_metadata([row])
        with self.assertRaisesRegex(ValueError, "subjects"):
            self.run_image()
        self.assertFalse(self.out.exists())

    def test_exif_orientation(self):
        image = Image.new("RGB", (1536, 1024), "blue")
        exif = Image.Exif()
        exif[274] = 6
        image.save(self.src, exif=exif)
        result = self.run_image()
        self.assertEqual((result["width"], result["height"]), (683, 1024))
        with Image.open(self.out / "one.jpg") as output:
            self.assertFalse(output.getexif())

    def test_partial_write_rolls_back(self):
        self.run_image()
        before = self.snapshot()
        import os
        real_replace = os.replace
        calls = 0

        def fail_second(source, destination):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise OSError("simulated write failure")
            return real_replace(source, destination)

        Image.new("RGB", (1024, 1536), "red").save(self.src)
        with patch("finalize_image.os.replace", side_effect=fail_second):
            with self.assertRaisesRegex(OSError, "simulated write failure"):
                self.run_image(overwrite=True)
        self.assertEqual(self.snapshot(), before)


if __name__ == "__main__":
    unittest.main()
