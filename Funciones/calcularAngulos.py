#calcular angulos

import mediapipe as mp
from math import degrees, acos
import numpy as np
from Funciones.normalizacionCords import normalizacionCords


# actualizacion
mp_hands = mp.solutions.hands


def obtenerAngulos(results, width, height):
    for hand_landmarks in results.multi_hand_landmarks:
        
        normalizacionCords(hand_landmarks, width, height)

        p1 = np.array([x1, y1])
        p2 = np.array([x2, y2])
        p3 = np.array([x3, y3])

        p4 = np.array([x4, y4])
        p5 = np.array([x5, y5])
        p6 = np.array([x6, y6])

        p7 = np.array([x7, y7])
        p8 = np.array([x8, y8])
        p9 = np.array([x9, y9])

        p10 = np.array([x10, y10])
        p11 = np.array([x11, y11])
        p12 = np.array([x12, y12])

        p13 = np.array([x13, y13])
        p14 = np.array([x14, y14])
        p15 = np.array([x15, y15])

        p16 = np.array([x16, y16])
        p17 = np.array([x17, y17])
        p18 = np.array([x18, y18])

        l1 = np.linalg.norm(p2 - p3)
        l2 = np.linalg.norm(p1 - p3)
        l3 = np.linalg.norm(p1 - p2)

        l4 = np.linalg.norm(p5 - p6)
        l5 = np.linalg.norm(p4 - p6)
        l6 = np.linalg.norm(p4 - p5)

        l7 = np.linalg.norm(p8 - p9)
        l8 = np.linalg.norm(p7 - p9)
        l9 = np.linalg.norm(p7 - p8)

        l10 = np.linalg.norm(p11 - p12)
        l11 = np.linalg.norm(p10 - p12)
        l12 = np.linalg.norm(p10 - p11)

        l13 = np.linalg.norm(p14 - p15)
        l14 = np.linalg.norm(p13 - p15)
        l15 = np.linalg.norm(p13 - p14)

        l16 = np.linalg.norm(p17 - p18)
        l17 = np.linalg.norm(p16 - p18)
        l18 = np.linalg.norm(p16 - p17)

        # despejar y quitar indeterminaciones con numeradores menores al denominador

        num_den1 = (l1**2 + l3**2 - l2**2) / (2 * l1 * l3)

        num_den2 = (l4**2 + l6**2 - l5**2) / (2 * l4 * l6)

        num_den3 = (l7**2 + l9**2 - l8**2) / (2 * l7 * l9)

        num_den4 = (l10**2 + l12**2 - l11**2) / (2 * l10 * l12)

        num_den5 = (l13**2 + l15**2 - l14**2) / (2 * l13 * l15)

        num_den6 = (l16**2 + l18**2 - l17**2) / (2 * l16 * l18)

        # Calcular el ángulo

        if l1 and l3 != 0 and -1 < num_den1 < 1:
            angle1 = round(degrees(abs(acos(num_den1))))
        else:
            angle1 = 0

        if l4 and l6 != 0 and -1 < num_den2 < 1:
            angle2 = round(degrees(abs(acos(num_den2))))
        else:
            angle2 = 0

        if l7 and l9 != 0 and -1 < num_den3 < 1:
            angle3 = round(degrees(abs(acos(num_den3))))
        else:
            angle3 = 0

        if l10 and l12 != 0 and -1 < num_den4 < 1:
            angle4 = round(degrees(abs(acos(num_den4))))
        else:
            angle4 = 0

        if l13 and l15 != 0 and -1 < num_den5 < 1:
            angle5 = round(degrees(abs(acos(num_den5))))
        else:
            angle5 = 0

        if l16 and l18 != 0 and -1 < num_den6 < 1:
            angle6 = round(degrees(abs(acos(num_den6))))
        else:
            angle6 = 0

        angulosid = [angle1, angle2, angle3, angle4, angle5, angle6]
        coordenadasYAngulos = {"meñique":
                               {
                                   "x": [x1, x2, x3],
                                   "y": [y1, y2, y3],
                                   "angulo": angulosid[0]
                               },
                               "anular": {
                                   "x": [x4, x5, x6],
                                   "y": [y4, y5, y6],
                                   "angulo": angulosid[1]
                               },
                               "medio": {
                                   "x": [x7, x8, x9],
                                   "y": [y7, y8, y9],
                                   "angulo": angulosid[2]
                               },
                               "indice": {
                                   "x": [x10, x11, x12],
                                   "y": [y10, y11, y12],
                                   "angulo": angulosid[3]
                               },
                               "pulgar externo": {
                                   "x": [x13, x14, x15],
                                   "y": [y13, y14, y15],
                                   "angulo": angulosid[4]
                               },
                               "pulgar interno": {
                                   "x": [x16, x17, x18],
                                   "y": [y16, y17, y18],
                                   "angulo": angulosid[5]
                               }
                               }

                        #testing--------------------------------------
                # print(dedos)
                # print("meñique:", angle1, "anular:", angle2, "medio:", angle3,
                #       "indice:", angle4, "pulgar 1:", angle5, "pulgar 2:", angle6)
                # print (angle1, angle2, angle3, angle4, angle5, angle6)
    return [angulosid, coordenadasYAngulos]

#%%
