#!/usr/bin/env python3
"""Install and enable the c2 user services without starting a second viewer."""
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def main():
    cloudflared = shutil.which("cloudflared")
    if sys.platform != "linux" or not cloudflared:
        raise SystemExit("Run on the Linux host after installing cloudflared and Fuseki.")
    config = Path.home() / ".config/sigong-yeojido"
    credentials = config / "tunnel.json"
    for path in (credentials, ROOT / ".fuseki/jre/bin/java",
                 ROOT / ".fuseki/fuseki/fuseki-server.jar"):
        if not path.is_file():
            raise SystemExit(f"Required file is missing: {path}")
    expected_id = "2af4bef7-a71e-4515-8409-5f4c6868dab4"
    if json.loads(credentials.read_text())["TunnelID"] != expected_id:
        raise SystemExit("The credentials belong to a different tunnel.")

    subprocess.run(["loginctl", "--no-ask-password", "enable-linger"], check=True)
    config.chmod(0o700)
    credentials.chmod(0o600)
    tunnel_config = config / "tunnel.yml"
    tunnel_config.write_text(
        (ROOT / "deploy/cloudflared.yml").read_text().replace(
            "@CREDENTIALS@", json.dumps(str(credentials))), encoding="utf-8")
    subprocess.run([cloudflared, "tunnel", "--config", str(tunnel_config),
                    "ingress", "validate"], check=True)

    units = Path.home() / ".config/systemd/user"
    units.mkdir(parents=True, exist_ok=True)
    substitutions = {"@ROOT@": str(ROOT), "@PYTHON@": sys.executable,
                     "@CLOUDFLARED@": cloudflared, "@CONFIG@": str(tunnel_config)}
    names = []
    for template in sorted((ROOT / "deploy/systemd").glob("sigong-*.service")):
        body = template.read_text()
        for key, value in substitutions.items():
            body = body.replace(key, value)
        (units / template.name).write_text(body, encoding="utf-8")
        names.append(template.name)
    subprocess.run(["systemd-analyze", "--user", "verify",
                    *(str(units / name) for name in names)], check=True)
    subprocess.run(["systemctl", "--user", "daemon-reload"], check=True)
    subprocess.run(["systemctl", "--user", "enable", *names], check=True)
    print("Installed and enabled:", ", ".join(names))
    print("After stopping any old manual processes, start with:")
    print("systemctl --user start sigong-tunnel.service")


if __name__ == "__main__":
    main()
