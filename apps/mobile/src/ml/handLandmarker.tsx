/**
 * Puente headless hacia el WebView que corre MediaPipe HandLandmarker (ver
 * assets/mediapipe/inference.html). El WebView vive oculto (1x1, opacidad 0)
 * en el arbol de la pantalla de camara; este componente solo expone
 * `detect(base64Jpeg)` por ref, con una tabla de promesas pendientes
 * indexadas por id de mensaje.
 *
 * La pagina se sirve por HTTP local (ver localAssetServer.ts), NO por
 * file:///android_asset/... como en un primer intento: Chromium/WebView
 * bloquea `fetch()` para el esquema file:// sin excepcion, y el WASM de
 * MediaPipe usa `fetch()` para cargar su binario -- de ahi el error real en
 * produccion "both async and sync fetching of the wasm failed". Servir los
 * mismos archivos por http://127.0.0.1:<puerto>/ evita esa restriccion sin
 * salir del telefono (el servidor corre embebido en la app).
 *
 * Requiere un dev client / build con `expo prebuild` -- no corre en Expo Go,
 * y por ahora solo en Android (el plugin de assets y localAssetServer.ts
 * solo cubren esa plataforma).
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
import { getMediapipeServerOrigin } from "./localAssetServer";

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

const DETECT_TIMEOUT_MS = 1500;
const INIT_TIMEOUT_MS = 20000;

export const HandLandmarkerBridge = forwardRef<HandLandmarkerHandle, Props>(
  ({ onReadyChange, onError }, ref) => {
    const webviewRef = useRef<WebView>(null);
    const pending = useRef(new Map<string, PendingEntry>());
    const nextId = useRef(0);
    const [ready, setReady] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [pageUrl, setPageUrl] = useState<string | null>(null);
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
      setPageUrl(null);
      setReloadKey((k) => k + 1);
    }, [setReadyState]);

    // arranca el servidor local y resuelve la URL de la pagina antes de
    // montar el WebView
    useEffect(() => {
      let cancelled = false;
      getMediapipeServerOrigin()
        .then((origin) => {
          if (!cancelled) setPageUrl(`${origin}/inference.html`);
        })
        .catch((error) => {
          if (!cancelled) {
            reportError(`No se pudo arrancar el servidor local de assets: ${String(error)}`);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [reloadKey, reportError]);

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

    if (!pageUrl) return null;

    return (
      <WebView
        key={reloadKey}
        ref={webviewRef}
        source={{ uri: pageUrl }}
        onMessage={handleMessage}
        onError={handleNativeError}
        originWhitelist={["*"]}
        javaScriptEnabled
        style={{ width: 1, height: 1, position: "absolute", top: 0, left: 0, opacity: 0 }}
        pointerEvents="none"
      />
    );
  }
);

HandLandmarkerBridge.displayName = "HandLandmarkerBridge";
