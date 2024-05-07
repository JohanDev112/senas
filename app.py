import sys
import time
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel, QVBoxLayout, QWidget, QPushButton
from PyQt5.QtGui import QPixmap, QImage
import cv2
import mediapipe as mp
from Funciones.condicionales import condicionalesLetras
from Funciones.normalizacionCords import obtenerAngulos
from Funciones.dtw import dtw

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Reconocimiento de Gestos de Mano")
        self.setGeometry(100, 100, 800, 600)

        # Crear un widget central
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)

        # Crear un layout vertical
        layout = QVBoxLayout(central_widget)

        # Crear una etiqueta para mostrar la imagen de la cámara
        self.image_label = QLabel()
        self.image_label.setStyleSheet("background-color: black;")
        layout.addWidget(self.image_label)

        # Crear una etiqueta para mostrar información adicional
        self.info_label = QLabel()
        self.info_label.setStyleSheet("font-weight: bold; color: white; background-color: #333333; padding: 5px;")
        layout.addWidget(self.info_label)

        # Crear un botón para limpiar las letras detectadas
        self.boton_limpiar = QPushButton("Limpiar letras")
        self.boton_limpiar.clicked.connect(self.limpiar_letras_detectadas)
        layout.addWidget(self.boton_limpiar)

        # Iniciar la cámara
        self.cap = cv2.VideoCapture(0)
        self.wCam, self.hCam = 1280, 720
        self.cap.set(3, self.wCam)
        self.cap.set(4, self.hCam)

        # Configurar MediaPipe Hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_hands = mp.solutions.hands
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.75
        )

        # Inicializar variables para almacenar letras detectadas
        self.letras_detectadas = ""
        self.ultima_actualizacion = 0.0

        # Iniciar el temporizador para actualizar la imagen de la cámara
        self.timer = self.startTimer(30)

    def timerEvent(self, event):
        ret, frame = self.cap.read()
        if ret:
            height, width, _ = frame.shape
            frame = cv2.flip(frame, 1)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(frame_rgb)

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    datosAngulosYCoordenadas = obtenerAngulos(results, width, height)
                    dtw(datosAngulosYCoordenadas[1])
                    angulosid = datosAngulosYCoordenadas[0]

                    dedos = []
                    # pulgar externo angle
                    if angulosid[5] > 125:
                        dedos.append(1)
                    else:
                        dedos.append(0)

                    # pulgar interno
                    if angulosid[4] > 150:
                        dedos.append(1)
                    else:
                        dedos.append(0)

                    # 4 dedos
                    for id in range(0, 4):
                        if angulosid[id] > 90:
                            dedos.append(1)
                        else:
                            dedos.append(0)
                    letra_detectada = condicionalesLetras(dedos, frame)
                    self.actualizar_letras_detectadas(letra_detectada)

                    self.mp_drawing.draw_landmarks(
                        frame,
                        hand_landmarks,
                        self.mp_hands.HAND_CONNECTIONS,
                        self.mp_drawing_styles.get_default_hand_landmarks_style(),
                        self.mp_drawing_styles.get_default_hand_connections_style()
                    )

            # Convertir el fotograma a un formato compatible con PyQt
            rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            qt_image = QImage(rgb_image.data, rgb_image.shape[1], rgb_image.shape[0], QImage.Format_RGB888)
            pixmap = QPixmap.fromImage(qt_image)

            # Establecer la imagen en la etiqueta
            self.image_label.setPixmap(pixmap)

    def actualizar_letras_detectadas(self, nueva_letra):
        tiempo_actual = time.time()
        if (tiempo_actual - self.ultima_actualizacion) >= 1.0:  # Verificar si han pasado 2 segundos
            self.letras_detectadas += nueva_letra
            self.info_label.setText(f"Letras detectadas: {self.letras_detectadas}")
            self.ultima_actualizacion = tiempo_actual

    def limpiar_letras_detectadas(self):
        self.letras_detectadas = ""
        self.info_label.setText("Letras detectadas: ")

    def closeEvent(self, event):
        self.cap.release()
        self.hands.close()
        event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    main_window = MainWindow()
    main_window.show()
    sys.exit(app.exec_())
#%%
