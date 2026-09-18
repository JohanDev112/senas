# Créditos y atribuciones

## Dataset de entrenamiento

El clasificador de letras (`ml/`, `apps/mobile/assets/models/hand_letters_weights.json`)
se entrenó con el dataset **"Mexican Sign Language Alphabet"**, licenciado bajo
[Creative Commons Attribution 4.0 International (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/):

- **Señas estáticas** (usadas por el modelo actual): Ricardo Morfín (2023).
  *Mexican Sign Language Alphabet (static signs only)*. Zenodo.
  https://doi.org/10.5281/zenodo.10067509
- **Señas dinámicas** (reservadas para el roadmap de J/K/Ñ/Q/X/Z, ver `ml/README.md`):
  Navarrete-López, Jesús Antonio; Lopez-Nava, Irvin Hussein (2025).
  *Mexican Sign Language Alphabet (dynamic signs only)*. Centro de
  Investigación Científica y de Educación Superior de Ensenada (CICESE).
  Zenodo. https://doi.org/10.5281/zenodo.14689869

No se modificó ni redistribuye el dataset en sí — el repo solo contiene el
código para descargarlo (`ml/download_dataset.py`) y los pesos ya
entrenados derivados de él.

## Detección de manos

- [Google MediaPipe](https://ai.google.dev/edge/mediapipe) (HandLandmarker,
  Apache 2.0) — landmarks de la mano, corre localmente vía WASM en la app
  (`apps/mobile/assets/mediapipe/`) y vía la librería `mediapipe` de Python
  en `ml/`.
