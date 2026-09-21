/**
 * Sirve assets/mediapipe/* por HTTP local (loopback), en vez de file://.
 *
 * Motivo: Chromium/WebView bloquea `fetch()` para el esquema file:// por
 * completo, sin excepcion y sin importar los permisos de WebView
 * configurados (`allowFileAccess`, etc. no aplican a `fetch`, solo a otras
 * APIs). El WASM de MediaPipe usa `fetch()` internamente para cargar el
 * binario -- de ahi el error real en produccion:
 *   "RuntimeError: Aborted(both async and sync fetching of the wasm failed)"
 * Cargar los mismos archivos desde http://127.0.0.1:<puerto>/ en vez de
 * file:///android_asset/... evita esa restriccion sin perder nada de
 * "offline": el servidor corre embebido en la app, nunca sale del propio
 * telefono.
 *
 * En Android los assets del APK viven empacados (no son archivos sueltos en
 * disco), asi que primero hay que copiarlos a un directorio real
 * (`copyFileAssets` de @dr.pogodin/react-native-fs) antes de poder
 * servirlos con @dr.pogodin/react-native-static-server.
 */
import { Platform } from "react-native";
import { DocumentDirectoryPath, exists, copyFileAssets, writeFile } from "@dr.pogodin/react-native-fs";
import Server from "@dr.pogodin/react-native-static-server";

const ASSET_DIR_NAME = "mediapipe";
const TARGET_DIR = `${DocumentDirectoryPath}/${ASSET_DIR_NAME}`;

let serverInstance: Server | null = null;
let originPromise: Promise<string> | null = null;

async function ensureAssetsExtracted(): Promise<void> {
  // marcador propio en vez de checar cada archivo -- si existe, asumimos que
  // la extraccion previa termino bien.
  const marker = `${TARGET_DIR}/.extracted`;
  if (await exists(marker)) return;

  if (Platform.OS === "android") {
    await copyFileAssets(ASSET_DIR_NAME, TARGET_DIR);
  } else {
    throw new Error(`localAssetServer: plataforma no soportada (${Platform.OS})`);
  }
  await writeFile(marker, "1", "utf8");
}

/** Arranca (o reutiliza) el servidor local y devuelve su origin, ej. "http://127.0.0.1:8080". */
export async function getMediapipeServerOrigin(): Promise<string> {
  if (originPromise) return originPromise;

  originPromise = (async () => {
    await ensureAssetsExtracted();
    serverInstance = new Server({ fileDir: TARGET_DIR });
    return serverInstance.start();
  })();

  return originPromise;
}
