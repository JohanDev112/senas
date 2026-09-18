"""Exporta el modelo entrenado a JSON plano para correrlo a mano en TypeScript.

Cambio de arquitectura respecto al plan inicial: en vez de TFLite +
react-native-fast-tflite (que en la version actual de Vision Camera/Expo
SDK 57 depende de una capa nativa Nitro demasiado nueva para verificar sin
un dispositivo real), la deteccion de landmarks corre en un WebView oculto
con el WASM oficial de MediaPipe (ver apps/mobile/src/ml/handLandmarker.ts)
y la clasificacion final corre directo en TypeScript. Como la red es
chiquita (15 -> 32 -> 32 -> N clases), exportar los pesos crudos como JSON y
hacer el forward pass a mano evita cargar un runtime de inferencia entero
(TFLite o TF.js) solo para esto.

Uso:
    uv run ml/export_web_model.py
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import tensorflow as tf


def dense_layers(model: tf.keras.Model) -> list[dict]:
    layers = []
    for layer in model.layers:
        if not isinstance(layer, tf.keras.layers.Dense):
            continue
        w, b = layer.get_weights()
        activation = layer.get_config()["activation"]
        if activation not in ("relu", "softmax", "linear"):
            raise ValueError(f"activacion no soportada por el forward pass a mano: {activation}")
        layers.append({"w": w.tolist(), "b": b.tolist(), "activation": activation})
    return layers


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", default=str(Path(__file__).parent / "models"))
    parser.add_argument("--mobile-assets",
                         default=str(Path(__file__).parent.parent / "apps" / "mobile" / "assets" / "models"))
    args = parser.parse_args()

    model_dir = Path(args.model_dir)
    model = tf.keras.models.load_model(model_dir / "hand_letters.keras")
    scaler = np.load(model_dir / "scaler.npz")
    labels = json.loads((model_dir / "labels.json").read_text(encoding="utf-8"))

    payload = {
        "trained": True,
        "labels": labels,
        "mean": scaler["mean"].tolist(),
        "scale": scaler["scale"].tolist(),
        "layers": dense_layers(model),
    }

    mobile_dir = Path(args.mobile_assets)
    mobile_dir.mkdir(parents=True, exist_ok=True)
    out_path = mobile_dir / "hand_letters_weights.json"
    out_path.write_text(json.dumps(payload), encoding="utf-8")
    print(f"Escrito {out_path} ({out_path.stat().st_size / 1024:.0f} KB, {len(labels)} letras)")


if __name__ == "__main__":
    main()
