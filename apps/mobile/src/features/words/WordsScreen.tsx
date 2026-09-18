import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/Screen";
import { Pill } from "../../components/Pill";
import { color, font, spacing, type } from "../../theme/tokens";
import { TextToSign } from "./TextToSign";
import { CameraToWord } from "./CameraToWord";

type Tab = "text" | "camera";

export function WordsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("text");

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={color.ink} />
        </Pressable>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Traducir palabras</Text>
          <Pill label="Beta" variant="beta" />
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.tabRow}>
        <Pressable style={[styles.tab, tab === "text" && styles.tabActive]} onPress={() => setTab("text")}>
          <Text style={[styles.tabText, tab === "text" && styles.tabTextActive]}>Texto → Seña</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === "camera" && styles.tabActive]} onPress={() => setTab("camera")}>
          <Text style={[styles.tabText, tab === "camera" && styles.tabTextActive]}>Cámara → Palabra</Text>
        </Pressable>
      </View>

      {tab === "text" ? <TextToSign /> : <CameraToWord />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontFamily: font.display, fontSize: type.subtitle, color: color.ink },
  tabRow: { flexDirection: "row", gap: 6, backgroundColor: color.surface2, padding: 4, borderRadius: 12 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 9 },
  tabActive: { backgroundColor: color.accent },
  tabText: { fontFamily: font.bodyExtraBold, fontSize: type.caption, color: color.inkMuted },
  tabTextActive: { color: color.accentInk },
});
