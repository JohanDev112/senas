# ml — dataset, features y entrenamiento del clasificador de letras

Pipeline para pasar de "reglas de angulo fijas" (`legacy/Funciones/condicionales.py`)
a un modelo entrenado que corre on-device en la app, offline.

## Dataset

*A comprehensive dataset of static and dynamic signs for the Mexican Sign
Language alphabet* (CC-BY 4.0), en Zenodo:

- Estatico — 21 letras (A-I, L-P, R-U, W, Y), 279,716 imagenes JPEG, 20 participantes.
  https://doi.org/10.5281/zenodo.10067509
- Dinamico — 6 letras (J, K, Ñ, Q, X, Z), 1,200 videos MP4, 20 participantes.
  https://doi.org/10.5281/zenodo.14689869 *(no usado todavia, ver "Roadmap" abajo)*

El dataset trae solo imagenes/video con etiqueta por carpeta y nombre de
archivo — no trae landmarks. Este pipeline corre MediaPipe nosotros mismos
para generarlos.

## Setup

TensorFlow no soporta aun Python 3.14 (el interprete global de esta
maquina), asi que el pipeline usa su propio venv con Python 3.11 via `uv`:

```bash
uv venv --python 3.11 ml/.venv
uv pip install --python ml/.venv -r ml/requirements.txt
```

## Pasos

```bash
# 1. Descargar el dataset estatico (~4.8 GB, puede tardar horas segun la conexion)
uv run --python ml/.venv ml/download_dataset.py --which static

# 1b. Descomprimir el .7z descargado (Windows no trae 7z; usamos py7zr)
uv run --python ml/.venv ml/extract_archive.py --which static

# 2. Validar el pipeline con una muestra chica antes de correr todo
uv run --python ml/.venv ml/extract_features.py --limit 500
# revisa el resumen por letra que imprime al final

# 3. Con el pipeline validado, correr sobre el dataset completo
uv run --python ml/.venv ml/extract_features.py

# 4. Entrenar
uv run --python ml/.venv ml/train.py

# 5. Exportar a TFLite (queda copiado directo en apps/mobile/assets/models/)
uv run --python ml/.venv ml/export_tflite.py
```

## Como funcionan los features

`feature_extraction.py::hand_features` toma los 21 landmarks de una mano y
calcula 15 numeros invariantes a escala y traslacion:

- 2 angulos por dedo (nudillo base y nudillo medio) x 5 dedos = 10 angulos.
- 1 distancia normalizada (punta del dedo a la muneca, dividida por el largo
  de la palma) x 5 dedos = 5 distancias.

Es la misma idea de `legacy/Funciones/normalizacionCords.py` (ley de
cosenos sobre 3 puntos) pero generalizada correctamente a los 5 dedos —
el original tenia un bug en el calculo del pulgar interno y no era
reutilizable dedo por dedo. `apps/mobile/src/ml/extractFeatures.ts` es el
port exacto de esta misma funcion a TypeScript, para que la app calcule
las mismas 15 features en tiempo real y se las pase al modelo `.tflite`.

## Roadmap (no implementado todavia)

- **Letras dinamicas (J, K, Ñ, Q, X, Z):** requieren una secuencia de
  landmarks en el tiempo, no una sola pose. El dataset dinamico ya esta
  soportado por `download_dataset.py --which dynamic`; falta el pipeline de
  extraccion de secuencias + un modelo temporal (ej. 1D-CNN o LSTM chico).
- **Cuantizacion mas agresiva** del `.tflite` (int8) si el tamano o la
  latencia en dispositivos gama baja lo requieren.
