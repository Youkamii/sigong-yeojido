from contextlib import redirect_stdout
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import io
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import sync_fuseki as S
import ttl_check
from test_build_ttl import assemble


class GraphHandler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_PUT(self):
        self.server.uploads += 1
        payload = self.rfile.read(int(self.headers["Content-Length"]))
        parsed = ttl_check.check_text(payload.decode("utf-8"))
        assert not parsed.errors
        self.server.triples = len(parsed.graph)
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        body = json.dumps({"results": {"bindings": [{"n": {"value": str(self.server.triples)}}]}}).encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


class SyncTests(unittest.TestCase):
    def test_change_restart_and_validation_failure_with_http_fixture(self):
        with tempfile.TemporaryDirectory() as tmp, ThreadingHTTPServer(("127.0.0.1", 0), GraphHandler) as httpd:
            httpd.uploads = httpd.triples = 0
            thread = threading.Thread(target=httpd.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True)
            thread.start()
            data = assemble(Path(tmp) / "data")
            out = data / "build/sigong.ttl"
            endpoint = f"http://127.0.0.1:{httpd.server_port}"
            try:
                with redirect_stdout(io.StringIO()):
                    state = S.sync(data, out, endpoint)
                    self.assertEqual(httpd.uploads, 1)
                    self.assertIs(S.sync(data, out, endpoint, state), state)
                    self.assertEqual(httpd.uploads, 1)
                    card = data / "sources/gwanggaeto.md"
                    card.write_text(card.read_text(encoding="utf-8").replace("composedYear: 414", "composedYear: 415"), encoding="utf-8")
                    state = S.sync(data, out, endpoint, state)
                    self.assertEqual(httpd.uploads, 2)
                    httpd.triples = 0
                    state = S.sync(data, out, endpoint, state)
                    self.assertEqual(httpd.uploads, 3)
                    claim = data / "claims/gwanggaeto/chunk_gwanggaeto_1-07.md"
                    claim.write_text(claim.read_text(encoding="utf-8").replace('"value": 395', '"value": 396'), encoding="utf-8")
                    with self.assertRaises(RuntimeError):
                        S.sync(data, out, endpoint, state)
                    self.assertEqual(httpd.uploads, 3)
                    self.assertEqual(httpd.triples, state.triples)
            finally:
                httpd.shutdown()
                thread.join()


if __name__ == "__main__":
    unittest.main()
