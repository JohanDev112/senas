import AsyncStorage from "@react-native-async-storage/async-storage";

export type Settings = {
  vibrateOnDetect: boolean;
  soundOnDetect: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  vibrateOnDetect: true,
  soundOnDetect: false,
};

const STORAGE_KEY = "manoslsm:settings";

export async function getSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const updated = { ...current, ...patch };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
