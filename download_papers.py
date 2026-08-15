"""Download the approved ScholarLens corpus without committing paper files."""

from __future__ import annotations

import json
import os
from pathlib import Path
import shutil
import sys
import urllib.request


REPO_ROOT = Path(__file__).resolve().parent
SOURCE_MANIFEST = REPO_ROOT / "data" / "corpus" / "manifest.json"
DEFAULT_CORPUS_DIR = SOURCE_MANIFEST.parent
DOWNLOAD_URLS = {
    "paper-001": "https://arxiv.org/pdf/2501.09136.pdf",
    "paper-002": "https://arxiv.org/pdf/2506.10408.pdf",
    "paper-003": "https://arxiv.org/pdf/2506.00054.pdf",
    "paper-004": "https://arxiv.org/pdf/2507.18910.pdf",
    "paper-008": "https://arxiv.org/pdf/2502.08826.pdf",
    "paper-009": "https://arxiv.org/pdf/2005.11401.pdf",
}


def corpus_directory() -> Path:
    configured = os.environ.get("SCHOLARLENS_CORPUS_DIR")
    return Path(configured).expanduser().resolve() if configured else DEFAULT_CORPUS_DIR


def load_manifest() -> dict[str, object]:
    with SOURCE_MANIFEST.open(encoding="utf-8") as manifest_file:
        manifest = json.load(manifest_file)

    source_ids = {paper["source_id"] for paper in manifest["papers"]}
    missing_urls = source_ids - DOWNLOAD_URLS.keys()
    stale_urls = DOWNLOAD_URLS.keys() - source_ids
    if missing_urls or stale_urls:
        raise ValueError(
            "The manifest and confirmed download URL list differ: "
            f"missing URLs={sorted(missing_urls)}, stale URLs={sorted(stale_urls)}"
        )
    return manifest


def destination_path(corpus_dir: Path, content_path: str) -> Path:
    destination = (corpus_dir / content_path).resolve()
    if corpus_dir != destination and corpus_dir not in destination.parents:
        raise ValueError(f"Unsafe corpus content path: {content_path}")
    return destination


def download(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + ".part")
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "ScholarLens corpus setup/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response, temporary.open("wb") as output:
            shutil.copyfileobj(response, output)
        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)


def main() -> int:
    corpus_dir = corpus_directory()
    corpus_dir.mkdir(parents=True, exist_ok=True)

    try:
        manifest = load_manifest()
        for paper in manifest["papers"]:
            source_id = paper["source_id"]
            destination = destination_path(corpus_dir, paper["content_path"])
            print(f"Downloading {source_id} to {destination}...")
            download(DOWNLOAD_URLS[source_id], destination)

        if corpus_dir != DEFAULT_CORPUS_DIR:
            shutil.copyfile(SOURCE_MANIFEST, corpus_dir / "manifest.json")
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        print(f"Corpus setup failed: {error}", file=sys.stderr)
        return 1

    print(f"Downloaded {len(manifest['papers'])} approved papers to {corpus_dir}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
