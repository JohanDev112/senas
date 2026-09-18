"""Entrena un clasificador pequeno de letras a partir de ml/data/features.csv.

Red densa simple (15 -> 32 -> 32 -> N clases) sobre el vector de angulos y
distancias de feature_extraction.py. Si el CSV trae participantes reales
(ver extract_features.py), se separa train/test por persona para medir que
tan bien generaliza el modelo a una mano que nunca vio, no solo a una foto
que nunca vio.

Uso:
    uv run ml/train.py
    uv run ml/train.py --epochs 60 --csv ml/data/features.csv
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

from feature_extraction import FEATURE_NAMES


def split_train_test(df: pd.DataFrame, test_size: float, seed: int):
    if df["participant"].nunique() > 1:
        splitter = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=seed)
        train_idx, test_idx = next(splitter.split(df, groups=df["participant"]))
        return df.iloc[train_idx], df.iloc[test_idx]
    return train_test_split(df, test_size=test_size, random_state=seed, stratify=df["label"])


def build_model(input_dim: int, num_classes: int) -> tf.keras.Model:
    return tf.keras.Sequential([
        tf.keras.layers.Input(shape=(input_dim,)),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.Dense(num_classes, activation="softmax"),
    ])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", default=str(Path(__file__).parent / "data" / "features.csv"))
    parser.add_argument("--out-dir", default=str(Path(__file__).parent / "models"))
    parser.add_argument("--epochs", type=int, default=40)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    df = pd.read_csv(args.csv)
    train_df, test_df = split_train_test(df, args.test_size, args.seed)

    label_encoder = LabelEncoder().fit(df["label"])
    scaler = StandardScaler().fit(train_df[FEATURE_NAMES])

    x_train = scaler.transform(train_df[FEATURE_NAMES])
    x_test = scaler.transform(test_df[FEATURE_NAMES])
    y_train = label_encoder.transform(train_df["label"])
    y_test = label_encoder.transform(test_df["label"])

    model = build_model(len(FEATURE_NAMES), len(label_encoder.classes_))
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

    early_stop = tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=6, restore_best_weights=True)
    model.fit(
        x_train, y_train,
        validation_data=(x_test, y_test),
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=[early_stop],
        verbose=2,
    )

    loss, accuracy = model.evaluate(x_test, y_test, verbose=0)
    print(f"\nAccuracy en test ({len(test_df)} muestras, split por "
          f"{'participante' if df['participant'].nunique() > 1 else 'foto (aleatorio)'}): {accuracy:.3f}")

    preds = model.predict(x_test, verbose=0).argmax(axis=1)
    per_class = pd.DataFrame({"real": label_encoder.inverse_transform(y_test),
                               "pred": label_encoder.inverse_transform(preds)})
    accuracy_per_letter = (per_class["real"] == per_class["pred"]).groupby(per_class["real"]).mean()
    print("\nAccuracy por letra:")
    print(accuracy_per_letter.sort_values().to_string())

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    model.save(out_dir / "hand_letters.keras")

    np.savez(out_dir / "scaler.npz", mean=scaler.mean_, scale=scaler.scale_)
    (out_dir / "labels.json").write_text(
        json.dumps(list(label_encoder.classes_), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nModelo guardado en {out_dir}/hand_letters.keras (+ scaler.npz, labels.json)")
    print("Siguiente paso: uv run ml/export_tflite.py")


if __name__ == "__main__":
    main()
