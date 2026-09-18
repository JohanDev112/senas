"""Calcula el vector de features (feature_extraction.hand_features) a partir
de los landmarks crudos guardados por extract_landmarks.py.

Separado de la extraccion a proposito: correr MediaPipe sobre ~280k
imagenes tarda ~70 min, pero recalcular features desde landmarks ya
guardados tarda segundos. Asi que para iterar sobre que features usar
(agregar una distancia, quitar un angulo, etc.) solo hay que tocar
`feature_extraction.py` y volver a correr este script.

Uso:
    uv run ml/build_features.py
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from tqdm import tqdm

from feature_extraction import FEATURE_NAMES, hand_features
from extract_landmarks import LANDMARK_COLUMNS


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--landmarks", default=str(Path(__file__).parent / "data" / "landmarks.csv"))
    parser.add_argument("--out", default=str(Path(__file__).parent / "data" / "features.csv"))
    args = parser.parse_args()

    landmarks_path = Path(args.landmarks)
    if not landmarks_path.exists():
        raise SystemExit(f"No existe {landmarks_path}. Corre primero ml/extract_landmarks.py.")

    df = pd.read_csv(landmarks_path)

    feature_rows = []
    for _, row in tqdm(df.iterrows(), total=len(df), desc="calculando features"):
        points = np.array([[row[f"x{i}"], row[f"y{i}"]] for i in range(21)])
        feature_rows.append(hand_features(points))

    features_df = pd.DataFrame(feature_rows, columns=FEATURE_NAMES)
    out_df = pd.concat([df[["label", "participant"]].reset_index(drop=True), features_df], axis=1)

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(args.out, index=False)
    print(f"\nGuardado: {args.out} ({len(out_df)} filas, {len(FEATURE_NAMES)} features)")
    print("Siguiente paso: uv run ml/train.py")


if __name__ == "__main__":
    main()
