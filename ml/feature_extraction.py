"""Extraccion de features geometricos a partir de los 21 landmarks de una mano.

Esta es la misma idea que legacy/Funciones/normalizacionCords.py (angulos de
los dedos via ley de cosenos) pero generalizada correctamente a los 5 dedos,
con nombres de landmarks explicitos, y agregando distancias normalizadas:
de cada punta de dedo a la muneca, y entre puntas de dedos adyacentes. El
resultado es un vector de 19 numeros que no depende de la escala de la mano
en la imagen ni (para los angulos) de su rotacion en el plano.

Las distancias entre puntas vecinas se agregaron porque el primer modelo
(solo angulos + distancia a la muneca) confundia mucho R/V/U/H entre si --
letras que se diferencian sobre todo por como se cruzan o separan el indice
y el medio, algo que un angulo respecto a la muneca no ve.

Esta funcion es la fuente de verdad: `ml/build_features.py` la usa para
construir el dataset de entrenamiento a partir de los landmarks guardados
por `ml/extract_landmarks.py`, y `apps/mobile/src/ml/extractFeatures.ts` es
su port a TypeScript para correr exactamente el mismo calculo dentro de la
app.
"""
from __future__ import annotations

import numpy as np

WRIST = 0
THUMB = (1, 2, 3, 4)  # CMC, MCP, IP, TIP
INDEX = (5, 6, 7, 8)  # MCP, PIP, DIP, TIP
MIDDLE = (9, 10, 11, 12)
RING = (13, 14, 15, 16)
PINKY = (17, 18, 19, 20)
FINGERS = (THUMB, INDEX, MIDDLE, RING, PINKY)

# pares de puntas de dedos adyacentes, para distinguir letras que se
# diferencian por como se juntan/cruzan/separan los dedos entre si
ADJACENT_TIP_PAIRS = (
    ("thumb_index", THUMB[-1], INDEX[-1]),
    ("index_middle", INDEX[-1], MIDDLE[-1]),
    ("middle_ring", MIDDLE[-1], RING[-1]),
    ("ring_pinky", RING[-1], PINKY[-1]),
)

FEATURE_NAMES = [
    "thumb_cmc_angle", "thumb_mcp_angle",
    "index_mcp_angle", "index_pip_angle",
    "middle_mcp_angle", "middle_pip_angle",
    "ring_mcp_angle", "ring_pip_angle",
    "pinky_mcp_angle", "pinky_pip_angle",
    "thumb_tip_dist", "index_tip_dist", "middle_tip_dist",
    "ring_tip_dist", "pinky_tip_dist",
    *[f"{name}_tip_gap" for name, _, _ in ADJACENT_TIP_PAIRS],
]

NUM_FEATURES = len(FEATURE_NAMES)


def _angle_at(points: np.ndarray, a: int, b: int, c: int) -> float:
    """Angulo en grados en el vertice B, formado por A-B-C."""
    ba = points[a] - points[b]
    bc = points[c] - points[b]
    norm = np.linalg.norm(ba) * np.linalg.norm(bc)
    if norm < 1e-9:
        return 0.0
    cos_angle = np.clip(np.dot(ba, bc) / norm, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_angle)))


def hand_features(points: np.ndarray) -> np.ndarray:
    """Calcula el vector de 19 features a partir de 21 landmarks (x, y).

    `points` debe ser un array (21, 2) — o (21, 3), se ignora Z — en
    cualquier unidad consistente (pixeles o coordenadas normalizadas de
    MediaPipe): el resultado no depende de la escala ni el origen.
    """
    points = np.asarray(points, dtype=np.float64)[:, :2]
    if points.shape != (21, 2):
        raise ValueError(f"se esperaban 21 landmarks (x, y), se recibio shape={points.shape}")

    wrist = points[WRIST]
    # escala de referencia: largo de la palma (muneca -> nudillo del medio)
    scale = np.linalg.norm(points[MIDDLE[0]] - wrist)
    if scale < 1e-9:
        scale = 1e-9

    angles: list[float] = []
    for cmc_or_mcp, mcp_or_pip, ip_or_dip, tip in FINGERS:
        # primer nudillo (base del dedo)
        angles.append(_angle_at(points, WRIST, cmc_or_mcp, mcp_or_pip))
        # segundo nudillo (mitad del dedo)
        angles.append(_angle_at(points, cmc_or_mcp, mcp_or_pip, ip_or_dip))

    tip_distances = [
        float(np.linalg.norm(points[finger[-1]] - wrist) / scale)
        for finger in FINGERS
    ]

    tip_gaps = [
        float(np.linalg.norm(points[a] - points[b]) / scale)
        for _, a, b in ADJACENT_TIP_PAIRS
    ]

    return np.array(angles + tip_distances + tip_gaps, dtype=np.float32)
