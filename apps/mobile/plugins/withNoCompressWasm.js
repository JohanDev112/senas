const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Android comprime por default los assets dentro del APK, incluido
 * vision_wasm_internal.wasm (~11.7 MB). Este plugin los marca como
 * "noCompress" para que queden guardados tal cual en el APK -- mas rapidos
 * de copiar/leer, sin gastar CPU descomprimiendo cada vez.
 *
 * OJO: esta NO es la causa de "RuntimeError: Aborted(both async and sync
 * fetching of the wasm failed)". Esa la causa Chromium/WebView, que bloquea
 * `fetch()` para el esquema file:// sin excepcion (documentado, no depende
 * de compresion ni de permisos de WebView) -- por eso ahora los archivos se
 * sirven por HTTP local en vez de file://, ver src/ml/localAssetServer.ts.
 * Este plugin se queda solo como optimizacion de tamano/velocidad.
 */
function withNoCompressWasm(config) {
  return withAppBuildGradle(config, (config) => {
    const marker = "// withNoCompressWasm";
    if (config.modResults.contents.includes(marker)) {
      return config;
    }

    const snippet = `
${marker}
android {
    androidResources {
        noCompress += ["wasm", "task"]
    }
}
`;

    config.modResults.contents += snippet;
    return config;
  });
}

module.exports = withNoCompressWasm;
