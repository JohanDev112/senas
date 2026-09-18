# Manos LSM — app móvil

Expo + TypeScript + Expo Router. Reconoce el abecedario dactilológico de LSM
con la cámara, 100% on-device y offline, con un modo Beta de palabras.

## Por qué no corre en Expo Go

La detección de manos usa un WebView headless con el WASM oficial de
MediaPipe cargado desde `file:///android_asset/...` (ver
`src/ml/handLandmarker.tsx` y `plugins/withMediapipeAssets.js`). Eso solo
existe despues de `expo prebuild`, así que este proyecto necesita un
**Dev Client** (o un build de EAS), no Expo Go.

## Correr en desarrollo

```bash
npm install
npx expo prebuild --platform android   # genera android/ y copia los assets de MediaPipe
npx expo run:android                   # o: eas build --profile development
```

## Generar el APK

```bash
eas build --profile preview --platform android
```

El perfil `preview` de `eas.json` genera un `.apk` instalable directo (no
`.aab`), listo para repartir sin pasar por Play Store.

## Permisos

- **Cámara** (`android.permission.CAMERA`): para los modos "Traducir letras"
  y "Traducir palabras". No se graba ni se sube ningún video — todo el
  procesamiento pasa en el teléfono, incluso sin conexión.

## Cómo se conecta con `ml/`

- `src/ml/extractFeatures.ts` es el port exacto de `ml/feature_extraction.py`.
- `assets/models/hand_letters_weights.json` es el destino de
  `ml/export_web_model.py`. Ya trae el modelo entrenado (92.0% de accuracy
  en test por participante, ver `ml/README.md` para el detalle por letra);
  si algún día se regenera vacío (`"trained": false`), la app cae sola al
  clasificador por reglas (`src/ml/rulesClassifier.ts`) — ver
  `src/ml/letterClassifier.ts`.
- `assets/mediapipe/` trae el bundle WASM de `@mediapipe/tasks-vision` más
  el modelo `hand_landmarker.task` de Google, para que la detección de
  landmarks funcione sin red. `plugins/withMediapipeAssets.js` los copia
  a `android/app/src/main/assets/mediapipe/` en cada `expo prebuild`.

## Pendiente / roadmap

- Letras dinámicas (J, K, Ñ, Q, X, Z) — necesitan un modelo temporal, ver
  `ml/README.md`.
- Mejorar T/S/A (las más confundibles con el modelo actual, ver
  `ml/README.md`).
- Build de iOS (el plugin de assets de MediaPipe solo copia para Android
  por ahora).
