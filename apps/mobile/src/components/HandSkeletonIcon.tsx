import React from "react";
import Svg, { Circle, Line, G } from "react-native-svg";
import { color } from "../theme/tokens";

/**
 * El motivo visual de la marca: el esqueleto de 21 landmarks que MediaPipe
 * ya calcula, en vez de un icono de mano generico. Mismos puntos que en
 * design/lsm-app-design-exploration.html.
 */
const BONES: [number, number, number, number][] = [
  [100, 180, 70, 165], [70, 165, 50, 145], [50, 145, 35, 120], [35, 120, 25, 100],
  [100, 180, 75, 110], [75, 110, 72, 75], [72, 75, 70, 50], [70, 50, 68, 28],
  [75, 110, 100, 105], [100, 105, 100, 65], [100, 65, 100, 35], [100, 35, 100, 12],
  [100, 105, 125, 110], [125, 110, 128, 72], [128, 72, 130, 45], [130, 45, 131, 22],
  [125, 110, 148, 120], [148, 120, 155, 90], [155, 90, 159, 68], [159, 68, 162, 50],
  [100, 180, 148, 120],
];

const NODES: [number, number, boolean][] = [
  [100, 180, true],
  [70, 165, false], [50, 145, false], [35, 120, false], [25, 100, true],
  [75, 110, false], [72, 75, false], [70, 50, false], [68, 28, true],
  [100, 105, false], [100, 65, false], [100, 35, false], [100, 12, true],
  [125, 110, false], [128, 72, false], [130, 45, false], [131, 22, true],
  [148, 120, false], [155, 90, false], [159, 68, false], [162, 50, true],
];

export function HandSkeletonIcon({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G stroke={color.violet} strokeWidth={1.6} opacity={0.6}>
        {BONES.map(([x1, y1, x2, y2], i) => (
          <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </G>
      <G>
        {NODES.map(([cx, cy, big], i) => (
          <Circle key={i} cx={cx} cy={cy} r={big ? 5 : 4} fill={big ? color.accent : color.violet} />
        ))}
      </G>
    </Svg>
  );
}
