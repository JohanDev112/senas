/**
 * Clasificador entrenado (ver ml/train.py + ml/export_web_model.py). Carga
 * los pesos de una red densa chiquita (15 -> 32 -> 32 -> N letras) como JSON
 * y corre el forward pass a mano -- no hace falta un runtime de inferencia
 * (TFLite/TF.js) para una red de este tamano.
 *
 * assets/models/hand_letters_weights.json arranca en `"trained": false`
 * (placeholder) para que el bundler siempre tenga algo que importar; una
 * vez que ml/export_web_model.py corre de verdad, isModelAvailable pasa a
 * true y letterClassifier.ts (el registry) empieza a preferir este
 * clasificador sobre rulesClassifier.
 */
import weightsData from "../../assets/models/hand_letters_weights.json";
import { handFeatures, type HandLandmarks } from "./extractFeatures";
import type { LetterClassifier, LetterPrediction } from "./classifier";

type Layer = { w: number[][]; b: number[]; activation: "relu" | "softmax" | "linear" };
type WeightsFile = {
  trained: boolean;
  labels: string[];
  mean: number[];
  scale: number[];
  layers: Layer[];
};

const weights = weightsData as WeightsFile;

function denseForward(input: number[], layer: Layer): number[] {
  const out = layer.b.map((biasValue, j) => {
    let sum = biasValue;
    for (let i = 0; i < input.length; i++) sum += input[i] * layer.w[i][j];
    return sum;
  });

  if (layer.activation === "relu") return out.map((v) => Math.max(0, v));
  if (layer.activation === "softmax") {
    const max = Math.max(...out);
    const exps = out.map((v) => Math.exp(v - max));
    const total = exps.reduce((a, b) => a + b, 0);
    return exps.map((v) => v / total);
  }
  return out;
}

export const isModelAvailable = weights.trained && weights.labels.length > 0;

export const modelClassifier: LetterClassifier | null = isModelAvailable
  ? {
      id: "model",
      classify(landmarks: HandLandmarks): LetterPrediction | null {
        const raw = handFeatures(landmarks);
        let activations = raw.map((v, i) => (v - weights.mean[i]) / weights.scale[i]);
        for (const layer of weights.layers) activations = denseForward(activations, layer);

        let bestIndex = 0;
        for (let i = 1; i < activations.length; i++) {
          if (activations[i] > activations[bestIndex]) bestIndex = i;
        }

        return {
          letter: weights.labels[bestIndex],
          confidence: activations[bestIndex],
          debug: { confidence: activations[bestIndex] },
        };
      },
    }
  : null;
