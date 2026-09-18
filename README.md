# Manos LSM

Traductor de Lengua de Señas Mexicana (LSM) desde la cámara: reconocimiento de letras (dactilológico) con un modelo entrenado on-device, y un modo Beta de palabras (cámara → palabra y texto → seña). App móvil offline-first en React Native/Expo, con un backend opcional en FastAPI para contenido actualizable.

## Estructura del repo

```
senas/
  apps/
    mobile/    # App Expo (TypeScript) — el traductor
    backend/   # API FastAPI (Python) — diccionario de palabras, historial, modelos
  ml/          # Descarga de dataset, extracción de features y entrenamiento del clasificador
  design/      # Exploración visual y tokens de diseño de la app
  legacy/      # Prototipo original de escritorio (PyQt5), archivado como referencia
```

## Construido con

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) — app móvil (Android, con Dev Client/EAS Build)
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands) — landmarks de la mano
- [react-native-fast-tflite](https://github.com/mrousavy/react-native-fast-tflite) — inferencia on-device del modelo entrenado
- [FastAPI](https://fastapi.tiangolo.com/) — backend
- [TensorFlow](https://www.tensorflow.org/) / [NumPy](https://numpy.org/) — entrenamiento del clasificador en `ml/`

Ver `legacy/README.md` para el prototipo de escritorio original en el que se basó este proyecto.
