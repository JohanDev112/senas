import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { color, spacing } from "../theme/tokens";

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
      ) : (
        <View style={styles.flexContent}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  scrollContent: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  flexContent: { flex: 1, padding: spacing.lg, gap: spacing.md },
});
