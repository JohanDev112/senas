/**
 * Clasificador v0: mismas reglas de angulo que
 * legacy/Funciones/condicionales.py, pero calculadas sobre el vector de
 * features correcto (extractFeatures.ts) en vez del calculo con el bug del
 * pulgar del prototipo original. Sirve para que la app funcione desde el
 * dia 1, mientras ml/train.py produce un modelo entrenado real -- ver
 * modelClassifier.ts para el reemplazo.
 */
import { FEATURE_NAMES, handFeatures, type HandLandmarks } from "./extractFeatures";
import type { LetterClassifier, LetterPrediction } from "./classifier";

type FingerBits = [thumbSplay: number, thumbCurl: number, pinky: number, ring: number, middle: number, index: number];

const THUMB_SPLAY_DEG = 125;
const THUMB_CURL_DEG = 150;
const FINGER_EXTENDED_DEG = 90;

// dedos == [pulgarSplay, pulgarCurl, meñique, anular, medio, indice] -> letra
// (orden identico al de legacy/Funciones/condicionales.py)
const PATTERNS: Record<string, FingerBits> = {
  A: [1, 1, 0, 0, 0, 0],
  E: [0, 0, 0, 0, 0, 0],
  I: [0, 0, 1, 0, 0, 0],
  O: [1, 0, 1, 0, 0, 0],
  U: [0, 0, 1, 0, 0, 1],
  B: [0, 0, 1, 1, 1, 1],
  D: [0, 0, 0, 0, 0, 1],
  K: [1, 1, 0, 0, 1, 1],
  L: [1, 1, 0, 0, 0, 1],
  W: [0, 1, 0, 1, 1, 1],
  N: [0, 1, 0, 0, 1, 1],
  // V tenia el mismo patron que N en el prototipo original (bug de
  // copy-paste que dejaba a V sin alcanzar nunca su rama) -- se omite
  // aqui en vez de arrastrar el bug; queda pendiente del modelo entrenado.
  Y: [1, 1, 1, 0, 0, 0],
  F: [1, 1, 1, 1, 1, 0],
  P: [0, 1, 1, 1, 1, 1],
  Q: [0, 1, 1, 1, 0, 0],
  G: [1, 1, 1, 1, 0, 0],
  H: [1, 1, 1, 0, 0, 1],
  R: [1, 1, 0, 1, 1, 1],
  S: [1, 1, 1, 0, 1, 1],
  T: [1, 1, 1, 1, 0, 1],
  M: [1, 1, 0, 1, 0, 0],
  J: [1, 0, 0, 0, 0, 0],
  X: [1, 0, 0, 1, 1, 1],
};

const PATTERN_ENTRIES = Object.entries(PATTERNS);

function fingerBits(features: number[]): FingerBits {
  const byName = Object.fromEntries(FEATURE_NAMES.map((name, i) => [name, features[i]]));
  return [
    byName.thumb_cmc_angle > THUMB_SPLAY_DEG ? 1 : 0,
    byName.thumb_mcp_angle > THUMB_CURL_DEG ? 1 : 0,
    byName.pinky_mcp_angle > FINGER_EXTENDED_DEG ? 1 : 0,
    byName.ring_mcp_angle > FINGER_EXTENDED_DEG ? 1 : 0,
    byName.middle_mcp_angle > FINGER_EXTENDED_DEG ? 1 : 0,
    byName.index_mcp_angle > FINGER_EXTENDED_DEG ? 1 : 0,
  ];
}

export const rulesClassifier: LetterClassifier = {
  id: "rules",
  classify(landmarks: HandLandmarks): LetterPrediction | null {
    const features = handFeatures(landmarks);
    const bits = fingerBits(features);

    const match = PATTERN_ENTRIES.find(([, pattern]) => pattern.every((bit, i) => bit === bits[i]));
    if (!match) return null;

    const debug: Record<string, number> = {};
    FEATURE_NAMES.forEach((name, i) => { debug[name] = Math.round(features[i] * 10) / 10; });

    return { letter: match[0], confidence: 1, debug };
  },
};
