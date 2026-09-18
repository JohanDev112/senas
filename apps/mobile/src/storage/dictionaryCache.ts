import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchDictionaryWords } from "../services/api";
import { SUGGESTED_WORDS } from "../data/words";

const CACHE_KEY = "manoslsm:dictionary-cache";

/**
 * Lista de palabras sugeridas para "Texto -> seña": arranca con la copia
 * local (SUGGESTED_WORDS, siempre disponible sin red), y si el backend
 * responde la reemplaza y la cachea para la siguiente vez que se abra la
 * app sin conexion.
 */
export function useDictionaryWords(): string[] {
  const [words, setWords] = useState<string[]>(SUGGESTED_WORDS);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(CACHE_KEY).then((cached) => {
      if (cached && !cancelled) {
        try {
          setWords(JSON.parse(cached));
        } catch {
          // cache corrupta, se ignora y se queda con SUGGESTED_WORDS
        }
      }
    });

    fetchDictionaryWords().then((remote) => {
      if (cancelled || !remote || remote.length === 0) return;
      const remoteWords = remote.map((entry) => entry.word);
      setWords(remoteWords);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remoteWords));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return words;
}
