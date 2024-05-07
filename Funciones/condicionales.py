#condicionales

import cv2

def condicionalesLetras(dedos, frame):
    font = cv2.FONT_HERSHEY_SIMPLEX
    font = cv2.FONT_HERSHEY_SIMPLEX
    letra_detectada = ""  # Inicializar la variable para almacenar la letra detectada

    if dedos == [1, 1, 0, 0, 0, 0]:
        letra_detectada = "A"
        cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
        cv2.putText(frame, 'A', (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)

    elif dedos == [0, 0, 0, 0, 0, 0]:
        letra_detectada = "E"
        cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
        cv2.putText(frame, 'E', (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)

    elif dedos == [0, 0, 1, 0, 0, 0]:
        letra_detectada = "I"
        cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
        cv2.putText(frame, 'I', (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)

    elif dedos == [1, 0, 1, 0, 0, 0]:
        letra_detectada = "O"
        cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
        cv2.putText(frame, 'O', (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)

    elif dedos == [0, 0, 1, 0, 0, 1]:
        letra_detectada = "U"
        cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
        cv2.putText(frame, 'U', (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)

    elif dedos == [0, 0, 1, 1, 1, 1]:
        letra_detectada = "B"
        cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
        cv2.putText(frame, 'B', (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)

    elif dedos == [0, 0, 0, 0, 0, 1]:
        letra_detectada = "D"
        cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
        cv2.putText(frame, 'D', (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)

    elif dedos == [1, 1, 0, 0, 1, 1]:
        letra_detectada = "K"
        cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
        cv2.putText(frame, 'K', (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)
        #     print("K")
    elif dedos == [1, 1, 0, 0, 0, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'L', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("L")
    elif dedos == [0, 1, 0, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'W', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("W")
    elif dedos == [0, 1, 0, 0, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'N', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("N")
    elif dedos == [1, 1, 1, 0, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'Y', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("Y")
    elif dedos == [1, 1, 1, 1, 1, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'F', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("F")
    elif dedos == [0, 1, 1, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'P', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("P")
    elif dedos == [0, 1, 0, 0, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'V', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("V")
    elif dedos == [0, 1, 1, 1, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'Q', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("Q")
    elif dedos == [1, 1, 1, 1, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'G', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("G")
    elif dedos == [1, 1, 1, 0, 0, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'H', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("H")
    elif dedos == [1, 1, 0, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'R', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("R")
    elif dedos == [1, 1, 1, 0, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'S', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("S")
    elif dedos == [1, 1, 1, 1, 0, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'T', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("T")
        #     print("Z")
    elif dedos == [1, 1, 0, 1, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'M', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("M")
    elif dedos == [1, 0, 0, 0, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'J', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("J")
    elif dedos == [1, 0, 0, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'X', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("X")

    else:
        letra_detectada = ""  # Si no se detectó ninguna letra, asignar una cadena vacía

    return letra_detectada

    return dedos