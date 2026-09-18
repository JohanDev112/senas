const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Copia assets/mediapipe/* (el bundle WASM + el modelo .task de MediaPipe)
 * tal cual, sin pasar por el pipeline de hashing de Metro, dentro de
 * android/app/src/main/assets/mediapipe/.
 *
 * El WebView headless de src/ml/handLandmarker carga
 * file:///android_asset/mediapipe/inference.html, y ese HTML hace fetch()
 * relativo de sus archivos hermanos (vision_wasm_internal.wasm,
 * hand_landmarker.task) -- eso solo funciona con los nombres de archivo
 * originales intactos y sirviendolos desde la carpeta real de assets de
 * Android, no con URIs de assets de Expo/Metro (que van con hash).
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
