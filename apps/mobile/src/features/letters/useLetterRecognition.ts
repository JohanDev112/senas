import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraView } from "expo-camera";
import type { HandLandmarkerHandle } from "../../ml/handLandmarker";
import { activeLetterClassifier } from "../../ml/letterClassifier";
import type { LetterPrediction } from "../../ml/classifier";

const CAPTURE_INTERVAL_MS = 280;
// misma regla que legacy/app.py: mientras se sostiene una letra, se va
// agregando al texto cada segundo (sostener "A" 3s produce "AAA").
const APPEND_COOLDOWN_MS = 1000;

export function useLetterRecognition() {
  const cameraRef = useRef<CameraView | null>(null);
  const bridgeRef = useRef<HandLandmarkerHandle | null>(null);
  const busyRef = useRef(false);
  const lastAppendAtRef = useRef(0);

  const [bridgeReady, setBridgeReady] = useState(false);
  const [prediction, setPrediction] = useState<LetterPrediction | null>(null);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      if (busyRef.current || !bridgeReady) return;
      const camera = cameraRef.current;
      const bridge = bridgeRef.current;
      if (!camera || !bridge) return;

      busyRef.current = true;
      try {
        const photo = await camera.takePictureAsync({ base64: true, quality: 0.3, skipProcessing: true });
        if (!photo?.base64) return;

        const landmarks = await bridge.detect(photo.base64);
        if (!landmarks) {
          setPrediction(null);
          return;
        }

        const result = activeLetterClassifier.classify(landmarks);
        setPrediction(result);

        if (result) {
          const now = Date.now();
          if (now - lastAppendAtRef.current >= APPEND_COOLDOWN_MS) {
            setTranscript((prev) => prev + result.letter);
            lastAppendAtRef.current = now;
          }
        }
      } catch (error) {
        console.warn("[useLetterRecognition] fallo capturando/clasificando frame:", error);
      } finally {
        busyRef.current = false;
      }
    }, CAPTURE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [bridgeReady]);

  const clear = useCallback(() => {
    setTranscript("");
    lastAppendAtRef.current = 0;
  }, []);

  return {
    cameraRef,
    bridgeRef,
    bridgeReady,
    onBridgeReadyChange: setBridgeReady,
    prediction,
    transcript,
    clear,
  };
}
