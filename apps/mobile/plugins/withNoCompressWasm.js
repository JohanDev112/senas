const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Android comprime por default los assets dentro del APK, incluido
 * vision_wasm_internal.wasm (~11.7 MB). El WebView a veces no puede leer
 * bien un archivo grande comprimido directo desde el zip del APK via
 * file:///android_asset/... -- falla con:
 *   "RuntimeError: Aborted(both async and sync fetching of the wasm failed)"
 * y es intermitente (a veces carga, a veces no), lo que explicaba por que
 * "ayer funciono, hoy no" sin haber cambiado nada.
 *
 * La solucion estandar de Android es marcar esas extensiones como
 * "noCompress" para que se guarden sin comprimir en el APK y el WebView
 * las pueda mapear directo.
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
