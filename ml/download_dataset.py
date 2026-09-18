"""Descarga el dataset publico de LSM usado para entrenar el clasificador de letras.

Dataset: "A comprehensive dataset of static and dynamic signs for the
Mexican Sign Language alphabet" (CC-BY 4.0), publicado en Zenodo:
  - Estatico (21 letras: A-I, L-P, R-U, W, Y; imagenes JPEG):
        https://doi.org/10.5281/zenodo.10067509
  - Dinamico (6 letras: J, K, N, Q, X, Z; video MP4):
        https://doi.org/10.5281/zenodo.14689869

Esta primera version del modelo solo usa el subconjunto estatico. El
dinamico se deja descargable para el trabajo futuro de reconocer J/K/N/Q/X/Z
con un modelo temporal (ver ml/README.md).

Uso:
    uv run ml/download_dataset.py --which static
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

import requests
from tqdm import tqdm

ZENODO_API = "https://zenodo.org/api/records/{record_id}"
RECORDS = {
    "static": "10067509",
    "dynamic": "14689869",
}


def fetch_record_files(record_id: str) -> list[dict]:
    resp = requests.get(ZENODO_API.format(record_id=record_id), timeout=30)
    resp.raise_for_status()
    return resp.json()["files"]


def download_file(url: str, dest: Path, expected_checksum: str | None) -> None:
    if dest.exists():
        print(f"  ya existe, se omite: {dest.name}")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_name(dest.name + ".part")
    with requests.get(url, stream=True, timeout=60) as r:
        r.raise_for_status()
        total = int(r.headers.get("content-length", 0))
        with open(tmp, "wb") as f, tqdm(total=total, unit="B", unit_scale=True, desc=dest.name) as bar:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                f.write(chunk)
                bar.update(len(chunk))

    if expected_checksum and ":" in expected_checksum:
        algo, expected = expected_checksum.split(":", 1)
        h = hashlib.new(algo)
        with open(tmp, "rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                h.update(chunk)
        if h.hexdigest() != expected:
            tmp.unlink()
            raise RuntimeError(f"checksum invalido para {dest.name}: se esperaba {expected}")

    tmp.rename(dest)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--which", choices=["static", "dynamic", "both"], default="static",
                         help="que parte del dataset descargar (default: static)")
    parser.add_argument("--out", default=str(Path(__file__).parent / "data" / "raw"),
                         help="carpeta destino")
    args = parser.parse_args()

    targets = ["static", "dynamic"] if args.which == "both" else [args.which]
    out_dir = Path(args.out)

    for name in targets:
        record_id = RECORDS[name]
        print(f"\n== Dataset '{name}' (Zenodo record {record_id}) ==")
        files = fetch_record_files(record_id)
        dest_dir = out_dir / name
        for f in files:
            download_file(f["links"]["self"], dest_dir / f["key"], f.get("checksum"))

    print("\nListo. Si los archivos vienen comprimidos (.7z/.zip), corre:")
    print(f"  uv run ml/extract_archive.py --which {args.which}")
    print("antes de extract_features.py.")


if __name__ == "__main__":
    main()
