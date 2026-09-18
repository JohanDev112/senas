/**
 * Puente headless hacia el WebView que corre MediaPipe HandLandmarker (ver
 * assets/mediapipe/inference.html). El WebView vive oculto (1x1, opacidad 0)
 * en el arbol de la pantalla de camara; este componente solo expone
 * `detect(base64Jpeg)` por ref, con una tabla de promesas pendientes
 * indexadas por id de mensaje.
 *
 * Requiere un dev client / build con `expo prebuild` -- el archivo
 * file:///android_asset/... no existe corriendo en Expo Go.
 */
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { HandLandmarks } from "./extractFeatures";

export type HandLandmarkerHandle = {
  detect: (base64Jpeg: string) => Promise<HandLandmarks | null>;
  ready: boolean;
};

type PendingEntry = {
  resolve: (value: HandLandmarks | null) => void;
  timeout: ReturnType<typeof setTimeout>;
};

const INFERENCE_URL = "file:///android_asset/mediapipe/inference.html";
const DETECT_TIMEOUT_MS = 1500;

export const HandLandmarkerBridge = forwardRef<HandLandmarkerHandle, { onReadyChange?: (ready: boolean) => void }>(
  ({ onReadyChange }, ref) => {
    const webviewRef = useRef<WebView>(null);
    const pending = useRef(new Map<string, PendingEntry>());
    const nextId = useRef(0);
    const [ready, setReady] = useState(false);

    const setReadyState = useCallback(
      (value: boolean) => {
        setReady(value);
        onReadyChange?.(value);
      },
      [onReadyChange]
    );

    const detect = useCallback(
      (base64Jpeg: string) =>
        new Promise<HandLandmarks | null>((resolve) => {
          if (!webviewRef.current || !ready) {
            resolve(null);
            return;
          }
          const id = String(nextId.current++);
          const timeout = setTimeout(() => {
            pending.current.delete(id);
            resolve(null);
          }, DETECT_TIMEOUT_MS);
          pending.current.set(id, { resolve, timeout });
          webviewRef.current.postMessage(JSON.stringify({ type: "frame", id, base64: base64Jpeg }));
        }),
      [ready]
    );

    useImperativeHandle(ref, () => ({ detect, ready }), [detect, ready]);

    const handleMessage = useCallback((event: WebViewMessageEvent) => {
      let data: { type: string; id?: string; landmarks?: [number, number, number][] | null; message?: string };
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (data.type === "ready") {
        setReadyState(true);
        return;
      }
      if (data.type === "error") {
        console.warn("[HandLandmarker] error en el WebView:", data.message);
        return;
      }
      if (data.type === "result" && data.id !== undefined) {
        const entry = pending.current.get(data.id);
        if (!entry) return;
        clearTimeout(entry.timeout);
        pending.current.delete(data.id);
        const landmarks = data.landmarks ? data.landmarks.map(([x, y]) => ({ x, y })) : null;
        entry.resolve(landmarks);
      }
    }, [setReadyState]);

    return (
      <WebView
        ref={webviewRef}
        source={{ uri: INFERENCE_URL }}
        onMessage={handleMessage}
        onError={() => setReadyState(false)}
        originWhitelist={["*"]}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        style={{ width: 1, height: 1, position: "absolute", top: 0, left: 0, opacity: 0 }}
        pointerEvents="none"
      />
    );
  }
);

HandLandmarkerBridge.displayName = "HandLandmarkerBridge";
