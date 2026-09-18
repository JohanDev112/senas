# Prototipo de escritorio (archivado)

Este es el prototipo original del proyecto: una app de escritorio en Python (PyQt5 + OpenCV + MediaPipe) que reconoce el alfabeto dactilológico de LSM usando reglas fijas sobre los ángulos de los dedos.

Queda aquí como referencia histórica y **ya no es el foco de desarrollo activo**: el proyecto continúa como una app móvil (`apps/mobile`) con reconocimiento en base a un modelo entrenado. La lógica de extracción de ángulos/landmarks de `Funciones/normalizacionCords.py` fue el punto de partida para el pipeline de features en `ml/`.

## Cómo correrlo (si lo necesitas)

```bash
pip install -r requirements.txt
python app.py
```

## Contenido

- `app.py` — ventana principal (PyQt5), captura de cámara y detección en vivo.
- `letra en movimiento.py` — script experimental suelto para detectar letras dinámicas (J) por movimiento; nunca se integró a `app.py`.
- `Funciones/normalizacionCords.py` — extrae landmarks de MediaPipe y calcula los 6 ángulos por mano. Es el módulo realmente usado.
- `Funciones/calcularAngulos.py` — versión duplicada y rota de lo anterior (importa una función que no existe); se conserva tal cual, sin arreglar, como parte del archivo histórico.
- `Funciones/condicionales.py` — mapea el vector de dedos extendidos/doblados a una letra.
- `Funciones/dtw.py` — stub sin terminar (nunca implementó Dynamic Time Warping de verdad).
- `Herramientas/grabarYGuardarCords.py` — utilidad para grabar coordenadas desde un video a JSON; tiene rutas hardcodeadas de otra máquina.
