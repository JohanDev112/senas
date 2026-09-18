import type { HandLandmarks } from "./extractFeatures";

export type LetterPrediction = {
  letter: string;
  confidence: number; // 0..1
  /** Datos crudos usados para la pantalla de "Detalle de letra". */
  debug: Record<string, number>;
};

export interface LetterClassifier {
  readonly id: "rules" | "model";
  classify(landmarks: HandLandmarks): LetterPrediction | null;
}

/**
 * Letras que puede producir el clasificador por reglas (rulesClassifier.ts),
 * portado del prototipo de escritorio original. OJO: ese prototipo mezclaba
 * formas de manos al estilo ASL, no necesariamente LSM autentica -- es un
 * v0 de arranque, no la fuente de verdad.
 *
 * El modelo entrenado (ml/train.py), en cambio, aprende directo del dataset
 * real de LSM y cubrira las letras estaticas que el dataset define (A-I,
 * L-P, R-U, W, Y aprox. 21 letras) -- ese es el conjunto que hay que tratar
 * como autoritativo una vez que exista hand_letters.tflite. J/K/Ñ/Q/X/Z son
 * dinamicas en LSM real y quedan en el roadmap (ver ml/README.md).
 */
export const SUPPORTED_LETTERS = [
  "A", "B", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N",
  "O", "P", "Q", "R", "S", "T", "U", "W", "X", "Y",
] as const;
