"""Compatibility entry point for the current production browser checks."""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
raise SystemExit(subprocess.run(["node", "scripts/verify-delivery.mjs"], cwd=root).returncode)
