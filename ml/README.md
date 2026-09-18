# ml — dataset, features y entrenamiento del clasificador de letras

Pipeline para pasar de "reglas de angulo fijas" (`legacy/Funciones/condicionales.py`)
a un modelo entrenado que corre on-device en la app, offline.

## Dataset

*Mexican Sign Language Alphabet* (CC-BY 4.0), en Zenodo -- **ver `NOTICE.md`
en la raiz del repo para la atribucion completa, requerida por la licencia**:

- Estatico (usado por el modelo actual) — 21 letras (A-I, L-P, R-U, W, Y),
  279,716 imagenes JPEG, 20 participantes. Ricardo Morfín (2023).
  https://doi.org/10.5281/zenodo.10067509
- Dinamico (no usado todavia, ver "Roadmap" abajo) — 6 letras (J, K, Ñ, Q, X, Z),
  1,200 videos MP4, 20 participantes. Navarrete-López & Lopez-Nava, CICESE (2025).
  https://doi.org/10.5281/zenodo.14689869

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

`mediapipe` esta pinneado a `0.10.21`: las versiones `>=1.0` quitaron la API
legacy `mediapipe.solutions.hands` que usa `extract_landmarks.py`.

## Pasos

Separado en dos etapas a proposito: correr MediaPipe sobre ~280k imagenes
tarda ~70 min, pero una vez que los landmarks crudos estan guardados,
recalcular el vector de features (probar una distancia nueva, quitar un
angulo, etc.) tarda segundos. Asi que `extract_landmarks.py` solo hay que
correrlo una vez; `build_features.py` es el que se vuelve a correr cada vez
que cambia `feature_extraction.py`.

```bash
# 1. Descargar el dataset estatico (~4.8 GB, puede tardar horas segun la conexion)
uv run --python ml/.venv ml/download_dataset.py --which static

# 1b. Descomprimir el .7z descargado. OJO: py7zr (Windows no trae 7z de
# fabrica) tardo ~30h estimadas contra 280k archivos chicos -- terminamos
# instalando 7-Zip nativo (winget install 7zip.7zip) y corriendo
# `7z x MSL-ABC.7z` directo, que lo hizo en un par de minutos.
uv run --python ml/.venv ml/extract_archive.py --which static

# 2. Validar el pipeline con una muestra chica antes de correr todo
uv run --python ml/.venv ml/extract_landmarks.py --limit 500
# revisa el resumen por letra que imprime al final

# 3. Con el pipeline validado, correr MediaPipe sobre el dataset completo
#    (~70 min, solo hace falta una vez -- guarda los 21 landmarks crudos)
uv run --python ml/.venv ml/extract_landmarks.py

# 4. Calcular el vector de features desde los landmarks guardados (segundos).
#    Volver a correr esto (sin repetir el paso 3) cada vez que se ajuste
#    feature_extraction.py.
uv run --python ml/.venv ml/build_features.py

# 5. Entrenar (unos minutos, la red es chica)
uv run --python ml/.venv ml/train.py

# 6. Exportar a JSON (queda copiado directo en apps/mobile/assets/models/)
uv run --python ml/.venv ml/export_web_model.py
```

## Resultado actual

Sobre las 279,716 imagenes (276,153 con mano detectada por MediaPipe,
98.7%), evaluando en un split **por participante** (4 de los 20 firmantes
apartados enteros para test, nunca vistos en entrenamiento):

- **Accuracy global: 88.5%**
- Mejor: C 99.2%, B 97.2%, P 96.1%, W 96.0%, Y 96.0%, D 95.0%
- Peor: R 62.3%, V 73.4%, U 79.0%, H 82.7%

R/V/U/H son las mas confundibles entre si con este vector de 15 features
(dependen mucho de como se cruzan los dedos, algo que angulos+distancias
respecto a la muneca no capturan tan bien). Si hace falta mas precision ahi,
el siguiente paso natural es agregar features de posicion relativa
entre puntas de dedos (no solo cada una contra la muneca), no necesariamente
un modelo mas grande.

Se valido ademas que el forward pass a mano en TypeScript
(`apps/mobile/src/ml/modelClassifier.ts`) reproduce **exactamente** las
predicciones de Keras (mismas etiquetas y confianzas hasta redondeo) sobre
una muestra cruzada -- incluyendo los casos donde el modelo se equivoca.

## Como funcionan los features

`feature_extraction.py::hand_features` toma los 21 landmarks de una mano y
calcula 19 numeros invariantes a escala y traslacion:

- 2 angulos por dedo (nudillo base y nudillo medio) x 5 dedos = 10 angulos.
- 1 distancia normalizada (punta del dedo a la muneca, dividida por el largo
  de la palma) x 5 dedos = 5 distancias.
- 1 distancia normalizada entre puntas de dedos adyacentes (pulgar-indice,
  indice-medio, medio-anular, anular-meñique) = 4 distancias. Se agregaron
  porque el primer modelo (solo angulos + distancia a la muneca) confundia
  mucho R/V/U/H entre si -- letras que se diferencian sobre todo por como
  se cruzan o separan el indice y el medio, algo que una distancia contra
  la muneca no ve.

Es la misma idea de `legacy/Funciones/normalizacionCords.py` (ley de
cosenos sobre 3 puntos) pero generalizada correctamente a los 5 dedos —
el original tenia un bug en el calculo del pulgar interno y no era
reutilizable dedo por dedo. `apps/mobile/src/ml/extractFeatures.ts` es el
port exacto de esta misma funcion a TypeScript, para que la app calcule
las mismas 19 features en tiempo real.

## Como se exporta e integra en la app

`export_web_model.py` no genera un `.tflite`: guarda los pesos de la red
(`Dense.get_weights()`) como JSON plano (`hand_letters_weights.json`, ~47 KB)
junto con la media/desviacion del `StandardScaler` y la lista de labels.
`apps/mobile/src/ml/modelClassifier.ts` hace el forward pass a mano
(multiplicar matrices + ReLU/softmax) en TypeScript -- para una red de
19 -> 32 -> 32 -> 21 no vale la pena cargar un runtime de inferencia
(TFLite/TF.js) entero. El archivo arranca en `"trained": false` (placeholder)
en el repo hasta que se corre este pipeline; `letterClassifier.ts` decide
automaticamente si usar el modelo o el clasificador por reglas segun si el
JSON tiene `trained: true`.

## Roadmap (no implementado todavia)

- **Letras dinamicas (J, K, Ñ, Q, X, Z):** requieren una secuencia de
  landmarks en el tiempo, no una sola pose. El dataset dinamico ya esta
  soportado por `download_dataset.py --which dynamic`; falta el pipeline de
  extraccion de secuencias + un modelo temporal (ej. 1D-CNN o LSTM chico).
- **Mejorar R/V/U/H:** agregar features de posicion relativa entre puntas
  de dedos (no solo respecto a la muneca) antes de pensar en un modelo mas
  grande.
