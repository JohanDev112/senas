import json
import cv2
import mediapipe as mp
from Funciones.normalizacionCords import obtenerAngulos

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands
mp_drawing_styles = mp.solutions.drawing_styles

#importar video
cap = cv2.VideoCapture('/home/jose/Videos/video.mp4')
# cap = cv2.VideoCapture(0)

wCam, hCam = 640, 480
cap.set(3, wCam)
cap.set(4, hCam)

jsonCords = {"x": [], "y": []}

with mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.75) as hands:

    while True:
        ret, frame = cap.read()
        if ret == False:
            break
        height, width, _ = frame.shape
        frame = cv2.flip(frame, 1)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)
        if results.multi_hand_landmarks is not None:
                datosAngulosYCoordenadas = obtenerAngulos(results, width, height)
                coordenadasYAngulos = datosAngulosYCoordenadas[1]
                #guardar json cords
                for key in coordenadasYAngulos:
                    X = coordenadasYAngulos["indice"]["x"][0]
                    Y = coordenadasYAngulos["indice"]["y"][0]
                    jsonCords["x"].append(X)
                    jsonCords["y"].append(Y)
                    print(X, Y)

                if results.multi_hand_landmarks:
                    for hand_landmarks in results.multi_hand_landmarks:
                        mp_drawing.draw_landmarks(
                            frame,
                            hand_landmarks,
                            mp_hands.HAND_CONNECTIONS,
                            mp_drawing_styles.get_default_hand_landmarks_style(),
                            mp_drawing_styles.get_default_hand_connections_style())
        cv2.imshow('Frame', frame)
        
        if cv2.waitKey(1) & 0xFF == 27:
            #exportar la variable jsonCords a un archivo json
            with open('Traductor-de-lengua-de-se-as-al-espa-ol/Json/jsonCords.json', 'w') as outfile:
                json.dump(jsonCords, outfile)
            break

cap.release()
cv2.destroyAllWindows()
