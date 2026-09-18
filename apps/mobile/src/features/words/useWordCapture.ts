import { useCallback, useRef, useState } from "react";
import type { CameraView } from "expo-camera";
import type { HandLandmarkerHandle } from "../../ml/handLandmarker";
import { handFeatures } from "../../ml/extractFeatures";
import type { FeatureSequence } from "../../ml/dtw";

const CAPTURE_INTERVAL_MS = 220;
const RECORD_DURATION_MS = 2500;

/** Graba ~2.5s de features de mano, para comparar (DTW) o guardar como referencia. */
export function useWordCapture() {
  const cameraRef = useRef<CameraView | null>(null);
  const bridgeRef = useRef<HandLandmarkerHandle | null>(null);
  const [bridgeReady, setBridgeReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const sequenceRef = useRef<FeatureSequence>([]);

  const record = useCallback((): Promise<FeatureSequence> => {
    return new Promise((resolve) => {
      sequenceRef.current = [];
      setIsRecording(true);

      const intervalId = setInterval(async () => {
        const camera = cameraRef.current;
        const bridge = bridgeRef.current;
        if (!camera || !bridge?.ready) return;
        try {
          const photo = await camera.takePictureAsync({ base64: true, quality: 0.3, skipProcessing: true });
          if (!photo?.base64) return;
          const landmarks = await bridge.detect(photo.base64);
          if (landmarks) sequenceRef.current.push(handFeatures(landmarks));
        } catch {
          // frame perdido, se ignora y se sigue grabando
        }
      }, CAPTURE_INTERVAL_MS);

      setTimeout(() => {
        clearInterval(intervalId);
        setIsRecording(false);
        resolve(sequenceRef.current);
      }, RECORD_DURATION_MS);
    });
  }, []);

  return { cameraRef, bridgeRef, bridgeReady, setBridgeReady, isRecording, record };
}
