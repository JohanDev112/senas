import numpy as np
import math


def dtw(coordenadasYAngulos):
    # print(resultado.multi_hand_landmarks)
    # print(coordenadasYAngulos)
    #recorrer todas las llaves del diccionario
    for key in coordenadasYAngulos:
        X = coordenadasYAngulos["indice"]["x"][0]
        Y = coordenadasYAngulos["indice"]["y"][0]
        print(X, Y)
    return