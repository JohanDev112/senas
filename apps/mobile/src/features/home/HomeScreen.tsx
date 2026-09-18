import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/Screen";
import { Pill } from "../../components/Pill";
import { color, font, radius, spacing, type } from "../../theme/tokens";
import { getHistory, type HistoryEntry } from "../../storage/history";
import { isModelAvailable } from "../../ml/modelClassifier";

function MenuCard({
  icon,
  tone,
  title,
  description,
  beta,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: "primary" | "secondary";
  title: string;
  description: string;
  beta?: boolean;
  onPress: () => void;
}) {
  const isPrimary = tone === "primary";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuCard,
        { borderColor: isPrimary ? "rgba(228,115,46,0.35)" : "rgba(152,133,214,0.35)" },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: isPrimary ? color.accent : color.violet }]}>
        <Ionicons name={icon} size={18} color={isPrimary ? color.accentInk : "#1A1330"} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle}>{title}</Text>
          {beta ? <Pill label="Beta" variant="beta" /> : null}
        </View>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={color.inkMuted} />
    </Pressable>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  const today = history.filter((h) => Date.now() - h.at < 24 * 60 * 60 * 1000).length;

  return (
    <Screen>
      <Pill label="Sin internet · listo" variant="offline" dot />

      <View>
        <Text style={styles.greeting}>Hola</Text>
        <Text style={styles.greetingName}>¿Qué quieres traducir hoy? 👋</Text>
      </View>

      <MenuCard
        icon="hand-left"
        tone="primary"
        title="Traducir letras"
        description="Cámara en vivo, reconoce el abecedario dactilológico"
        onPress={() => router.push("/letters")}
      />
      <MenuCard
        icon="chatbubbles"
        tone="secondary"
        title="Traducir palabras"
        description="Cámara → palabra, y texto → seña"
        beta
        onPress={() => router.push("/words")}
      />

      <View style={styles.tileRow}>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{today}</Text>
          <Text style={styles.tileLabel}>Hoy</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{isModelAvailable ? "modelo" : "reglas"}</Text>
          <Text style={styles.tileLabel}>Clasificador activo</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { fontFamily: font.body, fontSize: type.caption, color: color.inkMuted, marginBottom: 2 },
  greetingName: { fontFamily: font.display, fontSize: type.title, color: color.ink },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: color.surface,
  },
  pressed: { opacity: 0.85 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  menuTitle: { fontFamily: font.display, fontSize: type.subtitle, color: color.ink },
  menuDescription: { fontFamily: font.bodyRegular, fontSize: type.caption, color: color.inkMuted, lineHeight: 16 },
  tileRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  tile: { flex: 1, borderWidth: 1, borderColor: color.border, borderRadius: radius.sm, padding: spacing.sm, alignItems: "center" },
  tileNumber: { fontFamily: font.display, fontSize: type.subtitle, color: color.ink },
  tileLabel: { fontFamily: font.bodyRegular, fontSize: type.label, color: color.inkMuted, marginTop: 2 },
});
