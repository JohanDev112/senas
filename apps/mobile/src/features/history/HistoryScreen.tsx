import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { useFocusEffect } from "expo-router";
import * as Speech from "expo-speech";
import { Screen } from "../../components/Screen";
import { color, font, radius, spacing, type } from "../../theme/tokens";
import { getHistory, clearHistory, type HistoryEntry } from "../../storage/history";

function timeAgo(at: number): string {
  const diffMs = Date.now() - at;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return new Date(at).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function HistoryScreen() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const load = useCallback(() => {
    getHistory().then(setEntries);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleClear = async () => {
    await clearHistory();
    setEntries([]);
  };

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        {entries.length > 0 ? (
          <Pressable onPress={handleClear}>
            <Text style={styles.clear}>Vaciar</Text>
          </Pressable>
        ) : null}
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Todavia no hay traducciones. Cuando reconozcas una letra o palabra, aparecera aqui.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.text.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>&ldquo;{item.text}&rdquo;</Text>
                <Text style={styles.rowSubtitle}>{item.kind === "letter" ? "Letras" : "Palabras"} · {timeAgo(item.at)}</Text>
              </View>
              <Pressable onPress={() => Speech.speak(item.text, { language: "es-MX" })} hitSlop={10}>
                <Text style={{ fontSize: 18 }}>🔊</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  title: { fontFamily: font.display, fontSize: type.title, color: color.ink },
  clear: { fontFamily: font.bodyBold, fontSize: type.body, color: color.accent },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  emptyText: { fontFamily: font.bodyRegular, fontSize: type.body, color: color.inkMuted, textAlign: "center", lineHeight: 20 },
  separator: { height: 1, backgroundColor: color.border },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  badge: { width: 32, height: 32, borderRadius: 10, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
  badgeText: { fontFamily: font.display, fontSize: type.subtitle, color: color.ink },
  rowTitle: { fontFamily: font.bodyBold, fontSize: type.body + 1, color: color.ink },
  rowSubtitle: { fontFamily: font.bodyRegular, fontSize: type.label, color: color.inkMuted, marginTop: 1 },
});
