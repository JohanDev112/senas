import AsyncStorage from "@react-native-async-storage/async-storage";

export type HistoryKind = "letter" | "word";

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  text: string;
  at: number; // epoch ms
};

const STORAGE_KEY = "manoslsm:history";
const MAX_ENTRIES = 200;

export async function getHistory(): Promise<HistoryEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export async function addHistoryEntry(kind: HistoryKind, text: string): Promise<HistoryEntry[]> {
  const trimmed = text.trim();
  if (!trimmed) return getHistory();

  const current = await getHistory();
  const entry: HistoryEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind, text: trimmed, at: Date.now() };
  const updated = [entry, ...current].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
