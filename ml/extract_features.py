"""Corre MediaPipe Hands sobre el dataset estatico y arma el CSV de entrenamiento.

El dataset de Zenodo trae solo imagenes + etiqueta por carpeta/nombre de
archivo (sin landmarks). Este script:

  1. Recorre las imagenes descargadas por download_dataset.py.
  2. Detecta la letra (carpeta) y, si es posible, el participante (para
     poder partir train/test por persona y no por foto suelta).
  3. Corre MediaPipe Hands sobre cada imagen para obtener los 21 landmarks.
  4. Calcula el vector de 15 features con ml/feature_extraction.py.
  5. Guarda todo en un CSV: label, participant, f0..f14.

Uso:
    uv run ml/extract_features.py --limit 500   # validar el pipeline rapido
    uv run ml/extract_features.py                # dataset completo
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

import cv2
import mediapipe as mp
import pandas as pd
from tqdm import tqdm

from feature_extraction import FEATURE_NAMES, hand_features

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}

# Letras estaticas cubiertas por el dataset (las dinamicas J/K/N/Q/X/Z
# requieren video + un modelo temporal, ver ml/README.md)
VALID_LABELS = set("ABCDEFGHILMNOPRSTUVWY")

PARTICIPANT_PATTERNS = [
    re.compile(r"(?:^|[_\-])(?:p|sujeto|participant|signer)[_\-]?(\d+)", re.IGNORECASE),
]


def guess_label(path: Path) -> str | None:
    parent = path.parent.name.strip().upper()
    if len(parent) == 1 and parent in VALID_LABELS:
        return parent
    m = re.match(r"^([A-ZÑ])[_\-]", path.name.upper())
    if m and m.group(1) in VALID_LABELS:
        return m.group(1)
    return None


def guess_participant(path: Path) -> str | None:
    haystack = str(path)
    for pattern in PARTICIPANT_PATTERNS:
        m = pattern.search(haystack)
        if m:
            return m.group(1)
    return None


def iter_images(root: Path):
    for path in root.rglob("*"):
        if path.suffix.lower() in IMAGE_EXTS:
            yield path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", default=str(Path(__file__).parent / "data" / "raw" / "static"),
                         help="carpeta con las imagenes descargadas (ya descomprimidas)")
    parser.add_argument("--out", default=str(Path(__file__).parent / "data" / "features.csv"))
    parser.add_argument("--limit", type=int, default=None,
                         help="procesar solo N imagenes (para validar el pipeline antes del dataset completo)")
    parser.add_argument("--min-confidence", type=float, default=0.5)
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists():
        raise SystemExit(f"No existe {root}. Corre primero download_dataset.py y descomprime el dataset ahi.")

    images = list(iter_images(root))
    if not images:
        raise SystemExit(f"No se encontraron imagenes (.jpg/.png) dentro de {root}.")
    if args.limit:
        images = images[: args.limit]

    mp_hands = mp.solutions.hands
    rows: list[dict] = []
    no_label = 0
    no_hand = 0

    with mp_hands.Hands(static_image_mode=True, max_num_hands=1,
                         min_detection_confidence=args.min_confidence) as hands:
        for path in tqdm(images, desc="extrayendo landmarks"):
            label = guess_label(path)
            if label is None:
                no_label += 1
                continue

            image = cv2.imread(str(path))
            if image is None:
                no_hand += 1
                continue
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            result = hands.process(image_rgb)
            if not result.multi_hand_landmarks:
                no_hand += 1
                continue

            landmarks = result.multi_hand_landmarks[0].landmark
            points = [(lm.x, lm.y) for lm in landmarks]
            features = hand_features(points)

            row = {"label": label, "participant": guess_participant(path) or "unknown", "path": str(path)}
            row.update(dict(zip(FEATURE_NAMES, features)))
            rows.append(row)

    if not rows:
        raise SystemExit("No se extrajo ninguna fila. Revisa --root y el formato de las carpetas/nombres.")

    df = pd.DataFrame(rows)
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(args.out, index=False)

    print(f"\nGuardado: {args.out}")
    print(f"Filas: {len(df)}  |  sin etiqueta reconocible: {no_label}  |  sin mano detectada: {no_hand}")
    print("\nEjemplos por letra:")
    print(df["label"].value_counts().sort_index().to_string())
    if df["participant"].nunique() <= 1:
        print("\nAVISO: no se pudo inferir el participante de la ruta/nombre de archivo.")
        print("train.py hara un split aleatorio en vez de un split por persona (menos riguroso).")


if __name__ == "__main__":
    main()
