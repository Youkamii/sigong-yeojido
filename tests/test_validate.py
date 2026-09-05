import copy
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services"))
import validate as V


class DigestPolicyTests(unittest.TestCase):
    def test_missing_and_new_digests_require_explicit_write(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            sd = V.SourceDigests(recorded=None, computed={"new": "a" * 64})
            report = V.Report(digests={"source": sd})
            self.assertEqual(V.write_digest_files(directory, report, False), [])
            self.assertEqual(list(directory.iterdir()), [])
            V.write_digest_files(directory, report, True)
            path = directory / "source/.digests.json"
            original = path.read_bytes()
            sd.recorded = dict(sd.computed)
            sd.computed["later"] = "b" * 64
            self.assertEqual(V.write_digest_files(directory, report, False), [])
            self.assertEqual(path.read_bytes(), original)

    def test_both_commands_leave_fixture_data_unchanged(self):
        from test_build_ttl import assemble
        with tempfile.TemporaryDirectory() as tmp:
            data = assemble(Path(tmp) / "data")
            for path in (data / "claims").glob("*/.digests.json"):
                path.unlink()
            before = {p.relative_to(data): p.read_bytes() for p in data.rglob("*") if p.is_file()}
            for command in ("services/validate.py", "scripts/check_claims.py"):
                result = subprocess.run([sys.executable, "-X", "utf8", str(ROOT / command), "--data", str(data)], capture_output=True, text=True, encoding="utf-8")
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertEqual(before, {p.relative_to(data): p.read_bytes() for p in data.rglob("*") if p.is_file()})


class ConflictRulesTests(unittest.TestCase):
    def test_multiple_values_are_allowed_but_reading_conflicts_remain(self):
        chunks, failures = {}, []
        V.load_chunks_file(ROOT / "tests/fixtures/chunks.jsonl", chunks, failures)
        meta, claims = V.parse_claims_text((ROOT / "tests/fixtures/valid-conflict.md").read_text(encoding="utf-8"))
        doc = V.ClaimsDoc(Path("fixture.md"), "fixture", "test", meta, claims)
        report = V.validate(chunks, {}, [doc], {"test": None})
        self.assertEqual(len(report.conflicts), 1)
        self.assertFalse(report.failures)
        for predicate in V.MULTI_VALUED_PREDICATES:
            changed = copy.deepcopy(doc)
            for claim in changed.claims:
                claim["predicate"] = predicate
            report = V.validate(chunks, {}, [changed], {"test": None})
            self.assertEqual(report.conflicts, [], predicate)
            self.assertFalse(report.failures)


class ReadingCalendarTests(unittest.TestCase):
    def test_editor_note_reading_and_calendar_mismatch(self):
        from test_build_ttl import assemble
        with tempfile.TemporaryDirectory() as tmp:
            data = assemble(Path(tmp) / "data")
            inputs = V.load_inputs(data)
            report = V.validate(inputs.chunks, inputs.entities, inputs.docs, inputs.digests)
            self.assertFalse(report.failures, report.failures)
            docs = copy.deepcopy(inputs.docs)
            for doc in docs:
                for claim in doc.claims:
                    if claim["predicate"] == "syj:readsCharacterAs":
                        claim["object"]["value"] = "錯"
                    if claim["predicate"] == "syj:convertsTo":
                        claim["object"]["value"] += 1
            report = V.validate(inputs.chunks, inputs.entities, docs, inputs.digests, refresh_digests=True)
            codes = {f.code for f in report.failures}
            self.assertIn("reading", codes)
            self.assertIn("calendar", codes)


if __name__ == "__main__":
    unittest.main()
