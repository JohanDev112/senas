/**
 * Puente headless hacia el WebView que corre MediaPipe HandLandmarker (ver
 * assets/mediapipe/inference.html). El WebView vive oculto (1x1, opacidad 0)
 * en el arbol de la pantalla de camara; este componente solo expone
 * `detect(base64Jpeg)` por ref, con una tabla de promesas pendientes
 * indexadas por id de mensaje.
 *
 * Requiere un dev client / build con `expo prebuild` -- el archivo
 * file:///android_asset/... no existe corriendo en Expo Go, y tampoco
 * existe en iOS (el plugin de assets solo empaqueta para Android por ahora).
 *
 * Si la inicializacion falla o tarda demasiado (WebView de sistema
 * desactualizado, poca RAM para el WASM, etc.) se avisa por `onError` en
 * vez de quedarse pegado en silencio -- antes de esto, cualquier falla
 * dejaba la pantalla mostrando "cargando" para siempre sin pista de que
 * paso.
 */
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { WebViewErrorEvent } from "react-native-webview/lib/WebViewTypes";
import type { HandLandmarks } from "./extractFeatures";

export type HandLandmarkerHandle = {
  detect: (base64Jpeg: string) => Promise<HandLandmarks | null>;
  ready: boolean;
  /** Vuelve a cargar el WebView desde cero (para un boton "Reintentar"). */
  reload: () => void;
};

type Props = {
  onReadyChange?: (ready: boolean) => void;
  onError?: (message: string) => void;
};

type PendingEntry = {
  resolve: (value: HandLandmarks | null) => void;
  timeout: ReturnType<typeof setTimeout>;
};

const INFERENCE_URL = "file:///android_asset/mediapipe/inference.html";
const DETECT_TIMEOUT_MS = 1500;
const INIT_TIMEOUT_MS = 20000;

export const HandLandmarkerBridge = forwardRef<HandLandmarkerHandle, Props>(
  ({ onReadyChange, onError }, ref) => {
    const webviewRef = useRef<WebView>(null);
    const pending = useRef(new Map<string, PendingEntry>());
    const nextId = useRef(0);
    const [ready, setReady] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const reportedError = useRef(false);

    const setReadyState = useCallback(
      (value: boolean) => {
        setReady(value);
        onReadyChange?.(value);
      },
      [onReadyChange]
    );

    const reportError = useCallback(
      (message: string) => {
        if (reportedError.current) return; // solo el primer error, para no saturar
        reportedError.current = true;
        onError?.(message);
      },
      [onError]
    );

    const reload = useCallback(() => {
      reportedError.current = false;
      setReadyState(false);
      setReloadKey((k) => k + 1);
    }, [setReadyState]);

    // si nunca llega "ready" (ni tampoco un error explicito), no dejar la
    // pantalla pegada en "cargando" sin explicacion
    useEffect(() => {
      if (ready) return;
      const timeout = setTimeout(() => {
        reportError(
          "El reconocimiento de manos tardo demasiado en cargar. Puede ser el WebView del sistema " +
            "desactualizado o poca memoria disponible -- prueba cerrar otras apps, actualizar " +
            "\"Android System WebView\" desde Play Store, o reiniciar el telefono."
        );
      }, INIT_TIMEOUT_MS);
      return () => clearTimeout(timeout);
    }, [ready, reloadKey, reportError]);

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

    useImperativeHandle(ref, () => ({ detect, ready, reload }), [detect, ready, reload]);

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
        reportError(data.message ?? "Error desconocido inicializando el reconocimiento de manos.");
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
    }, [setReadyState, reportError]);

    const handleNativeError = useCallback(
      (event: WebViewErrorEvent) => {
        setReadyState(false);
        const { description, code } = event.nativeEvent;
        reportError(`No se pudo cargar el motor de reconocimiento (codigo ${code}): ${description}`);
      },
      [setReadyState, reportError]
    );

    return (
      <WebView
        key={reloadKey}
        ref={webviewRef}
        source={{ uri: INFERENCE_URL }}
        onMessage={handleMessage}
        onError={handleNativeError}
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
