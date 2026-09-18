/**
 * Port exacto de ml/feature_extraction.py: toma los 21 landmarks de una mano
 * (los que devuelve src/ml/handLandmarker.ts) y calcula el mismo vector de
 * 15 numeros invariantes a escala/traslacion con el que se entrena el
 * clasificador en ml/train.py. Si cambia uno, cambia el otro.
 */
export type Point = { x: number; y: number };
export type HandLandmarks = Point[]; // 21 puntos, orden de MediaPipe Hands

const WRIST = 0;
const THUMB = [1, 2, 3, 4] as const;
const INDEX = [5, 6, 7, 8] as const;
const MIDDLE = [9, 10, 11, 12] as const;
const RING = [13, 14, 15, 16] as const;
const PINKY = [17, 18, 19, 20] as const;
const FINGERS = [THUMB, INDEX, MIDDLE, RING, PINKY] as const;

export const FEATURE_NAMES = [
  "thumb_cmc_angle", "thumb_mcp_angle",
  "index_mcp_angle", "index_pip_angle",
  "middle_mcp_angle", "middle_pip_angle",
  "ring_mcp_angle", "ring_pip_angle",
  "pinky_mcp_angle", "pinky_pip_angle",
  "thumb_tip_dist", "index_tip_dist", "middle_tip_dist",
  "ring_tip_dist", "pinky_tip_dist",
] as const;

export const NUM_FEATURES = FEATURE_NAMES.length;

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

function norm(v: Point): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function angleAt(points: HandLandmarks, a: number, b: number, c: number): number {
  const ba = sub(points[a], points[b]);
  const bc = sub(points[c], points[b]);
  const denom = norm(ba) * norm(bc);
  if (denom < 1e-9) return 0;
  const cos = Math.max(-1, Math.min(1, (ba.x * bc.x + ba.y * bc.y) / denom));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Calcula el vector de 15 features a partir de 21 landmarks (x, y). */
export function handFeatures(points: HandLandmarks): number[] {
  if (points.length !== 21) {
    throw new Error(`se esperaban 21 landmarks, se recibieron ${points.length}`);
  }

  const wrist = points[WRIST];
  let scale = norm(sub(points[MIDDLE[0]], wrist));
  if (scale < 1e-9) scale = 1e-9;

  const angles: number[] = [];
  for (const [baseJoint, midJoint, distalJoint] of FINGERS) {
    angles.push(angleAt(points, WRIST, baseJoint, midJoint));
    angles.push(angleAt(points, baseJoint, midJoint, distalJoint));
  }

  const tipDistances = FINGERS.map((finger) => norm(sub(points[finger[finger.length - 1]], wrist)) / scale);

  return [...angles, ...tipDistances];
}
