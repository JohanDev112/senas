import { rulesClassifier } from "./rulesClassifier";
import { modelClassifier, isModelAvailable } from "./modelClassifier";
import type { LetterClassifier } from "./classifier";

/**
 * Punto unico que usa la UI. Prefiere el modelo entrenado en cuanto
 * assets/models/hand_letters_weights.json deje de ser el placeholder sin
 * entrenar; mientras tanto usa el clasificador por reglas para que la app
 * funcione desde el dia 1.
 */
export const activeLetterClassifier: LetterClassifier = isModelAvailable && modelClassifier
  ? modelClassifier
  : rulesClassifier;
