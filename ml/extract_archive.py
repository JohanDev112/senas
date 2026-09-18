"""Descomprime los archivos .7z/.zip descargados por download_dataset.py.

Windows no trae 7z de fabrica, asi que usamos py7zr en vez de depender de
una instalacion externa de 7-Zip.

Uso:
    uv run ml/extract_archive.py --which static
"""
from __future__ import annotations

import argparse
import zipfile
from pathlib import Path

import py7zr
from tqdm import tqdm


def extract_one(archive: Path, dest_dir: Path) -> None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    print(f"Descomprimiendo {archive.name} -> {dest_dir}")
    if archive.suffix.lower() == ".7z":
        with py7zr.SevenZipFile(archive, mode="r") as z:
            z.extractall(path=dest_dir)
    elif archive.suffix.lower() == ".zip":
        with zipfile.ZipFile(archive) as z:
            for member in tqdm(z.infolist(), desc="extrayendo"):
                z.extract(member, dest_dir)
    else:
        print(f"  (se omite, no es .7z ni .zip: {archive.name})")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--which", choices=["static", "dynamic", "both"], default="static")
    parser.add_argument("--raw", default=str(Path(__file__).parent / "data" / "raw"))
    args = parser.parse_args()

    targets = ["static", "dynamic"] if args.which == "both" else [args.which]
    raw_dir = Path(args.raw)

    for name in targets:
        src_dir = raw_dir / name
        if not src_dir.exists():
            print(f"  no existe {src_dir}, corre antes download_dataset.py --which {name}")
            continue
        archives = [p for p in src_dir.iterdir() if p.suffix.lower() in (".7z", ".zip")]
        if not archives:
            print(f"  no hay .7z/.zip en {src_dir} (¿ya estaba descomprimido?)")
            continue
        for archive in archives:
            extract_one(archive, src_dir)


if __name__ == "__main__":
    main()
