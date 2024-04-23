import cv2

def condicionalesLetras(dedos, frame):
    font = cv2.FONT_HERSHEY_SIMPLEX
    if dedos == [1, 1, 0, 0, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
            cv2.putText(frame, 'A', (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)
        #     print("A")

    if dedos == [0, 0, 0, 0, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'E', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("E")

    if dedos == [0, 0, 1, 0, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'I', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("I")

    if dedos == [1, 0, 1, 0, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'O', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("O")

    if dedos == [0, 0, 1, 0, 0, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'U', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("U")

    # abecedario
    if dedos == [0, 0, 1, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'B', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("B")
        # if dedos ==[1,0,1,0,0,0]:
        #     cv2.rectangle(frame,(0,0),(100,100),(255,255,255), -1)
        #     cv2.putText(frame,'C',(20,80),font,3,(0,0,0),2,cv2.LINE_AA)
        # #     print("C")
    if dedos == [0, 0, 0, 0, 0, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'D', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("D")
    if dedos == [1, 1, 0, 0, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'K', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("K")
    if dedos == [1, 1, 0, 0, 0, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'L', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("L")
    if dedos == [0, 1, 0, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'W', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("W")
    if dedos == [0, 1, 0, 0, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'N', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("N")
    if dedos == [1, 1, 1, 0, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'Y', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("Y")
    if dedos == [1, 1, 1, 1, 1, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'F', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("F")
    if dedos == [0, 1, 1, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'P', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("P")
    if dedos == [0, 1, 0, 0, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'V', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("V")
    if dedos == [0, 1, 1, 1, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'Q', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("Q")
    if dedos == [1, 1, 1, 1, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'G', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("G")
    if dedos == [1, 1, 1, 0, 0, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'H', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("H")
    if dedos == [1, 1, 0, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'R', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("R")
    if dedos == [1, 1, 1, 0, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'S', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("S")
    if dedos == [1, 1, 1, 1, 0, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'T', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("T")
    if dedos == [1, 1, 1, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'Z', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("Z")
    if dedos == [1, 1, 0, 1, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'M', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("M")
    if dedos == [1, 0, 0, 0, 0, 0]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'J', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("J")
    if dedos == [1, 0, 0, 1, 1, 1]:
            cv2.rectangle(frame, (0, 0), (100, 100), (255, 255,255), -1)
            cv2.putText(frame, 'X', (20, 80), font, 3, (0,0,0),2,cv2.LINE_AA)
        #     print("X")

    return dedos