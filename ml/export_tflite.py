"""Exporta el modelo entrenado a TFLite, listo para react-native-fast-tflite.

Envuelve el modelo con la normalizacion (mean/scale de StandardScaler) para
que el .tflite reciba directamente el vector de 15 features "crudo" que
produce extractFeatures.ts en la app -- sin tener que reimplementar el
escalado en TypeScript.

Uso:
    uv run ml/export_tflite.py
"""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

import numpy as np
import tensorflow as tf


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", default=str(Path(__file__).parent / "models"))
    parser.add_argument("--mobile-assets",
                         default=str(Path(__file__).parent.parent / "apps" / "mobile" / "assets" / "models"))
    args = parser.parse_args()

    model_dir = Path(args.model_dir)
    base_model = tf.keras.models.load_model(model_dir / "hand_letters.keras")
    scaler = np.load(model_dir / "scaler.npz")
    labels = json.loads((model_dir / "labels.json").read_text(encoding="utf-8"))

    mean = tf.constant(scaler["mean"], dtype=tf.float32)
    scale = tf.constant(scaler["scale"], dtype=tf.float32)

    inputs = tf.keras.Input(shape=(len(mean),), name="hand_features")
    normalized = tf.keras.layers.Lambda(lambda x: (x - mean) / scale, name="normalize")(inputs)
    outputs = base_model(normalized)
    export_model = tf.keras.Model(inputs, outputs, name="hand_letters_export")

    converter = tf.lite.TFLiteConverter.from_keras_model(export_model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_bytes = converter.convert()

    tflite_path = model_dir / "hand_letters.tflite"
    tflite_path.write_bytes(tflite_bytes)
    print(f"Modelo TFLite: {tflite_path} ({len(tflite_bytes) / 1024:.0f} KB)")

    mobile_dir = Path(args.mobile_assets)
    mobile_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy(tflite_path, mobile_dir / "hand_letters.tflite")
    (mobile_dir / "hand_letters_labels.json").write_text(
        json.dumps(labels, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Copiado a {mobile_dir} (hand_letters.tflite + hand_letters_labels.json)")


if __name__ == "__main__":
    main()
