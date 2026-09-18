/**
 * Dynamic Time Warping real, en reemplazo del stub de
 * legacy/Funciones/dtw.py (que nunca llego a comparar nada, solo imprimia
 * coordenadas). Se usa en el modo "Camara -> palabra" para comparar la
 * secuencia de features de la mano en vivo contra secuencias de referencia
 * grabadas con el mismo vector de 15 features de extractFeatures.ts.
 */
export type FeatureSequence = number[][]; // cada elemento: vector de 15 features de un frame

function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** Costo acumulado del mejor alineamiento entre dos secuencias (DTW clasico). */
export function dtwDistance(seqA: FeatureSequence, seqB: FeatureSequence): number {
  const n = seqA.length;
  const m = seqB.length;
  if (n === 0 || m === 0) return Infinity;

  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(Infinity));
  cost[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const d = euclidean(seqA[i - 1], seqB[j - 1]);
      cost[i][j] = d + Math.min(cost[i - 1][j], cost[i][j - 1], cost[i - 1][j - 1]);
    }
  }
  return cost[n][m];
}

/** Similitud en 0..1 (1 = identico), normalizada por el largo del camino. */
export function dtwSimilarity(seqA: FeatureSequence, seqB: FeatureSequence): number {
  const distance = dtwDistance(seqA, seqB);
  if (!Number.isFinite(distance)) return 0;
  const normalized = distance / (seqA.length + seqB.length);
  return 1 / (1 + normalized);
}

export type WordReference = { word: string; sequence: FeatureSequence };
export type WordMatch = { word: string; similarity: number };

/** Compara una secuencia en vivo contra el vocabulario de referencias guardado. */
export function matchWord(live: FeatureSequence, references: WordReference[]): WordMatch | null {
  if (live.length < 5 || references.length === 0) return null;

  let best: WordMatch | null = null;
  for (const ref of references) {
    const similarity = dtwSimilarity(live, ref.sequence);
    if (!best || similarity > best.similarity) {
      best = { word: ref.word, similarity };
    }
  }
  return best;
}
