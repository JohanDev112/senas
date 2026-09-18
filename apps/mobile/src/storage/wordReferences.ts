import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WordReference } from "../ml/dtw";

const STORAGE_KEY = "manoslsm:word-references";

export async function getWordReferences(): Promise<WordReference[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WordReference[];
  } catch {
    return [];
  }
}

export async function addWordReference(reference: WordReference): Promise<WordReference[]> {
  const current = await getWordReferences();
  const withoutSameWord = current.filter((r) => r.word.toLowerCase() !== reference.word.toLowerCase());
  const updated = [...withoutSameWord, reference];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeWordReference(word: string): Promise<WordReference[]> {
  const current = await getWordReferences();
  const updated = current.filter((r) => r.word.toLowerCase() !== word.toLowerCase());
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
