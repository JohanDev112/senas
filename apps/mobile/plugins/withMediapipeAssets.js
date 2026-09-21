const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Copia assets/mediapipe/* (el bundle WASM + el modelo .task de MediaPipe)
 * tal cual, sin pasar por el pipeline de hashing de Metro, dentro de
 * android/app/src/main/assets/mediapipe/.
 *
 * De ahi, src/ml/localAssetServer.ts los copia otra vez (via
 * `copyFileAssets` de @dr.pogodin/react-native-fs) a un directorio real en
 * disco y los sirve por HTTP local para que el WebView headless de
 * src/ml/handLandmarker.tsx los cargue -- ese doble paso hace falta porque
 * los assets de un APK viven empacados, no como archivos sueltos, y porque
 * Chromium/WebView bloquea `fetch()` para file:// (el WASM de MediaPipe usa
 * fetch() internamente). Los nombres de archivo originales tienen que
 * quedar intactos (no las URIs con hash de Expo/Metro) porque
 * inference.html hace fetch() relativo de sus archivos hermanos
 * (vision_wasm_internal.wasm, hand_landmarker.task).
 */
function copyRecursiveSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function withMediapipeAssets(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const src = path.join(config.modRequest.projectRoot, "assets", "mediapipe");
      const dest = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "assets",
        "mediapipe"
      );
      copyRecursiveSync(src, dest);
      return config;
    },
  ]);
}

module.exports = withMediapipeAssets;
