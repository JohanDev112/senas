import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { color, font, type } from "../theme/tokens";

type PillVariant = "beta" | "offline" | "neutral";

const VARIANT_STYLES: Record<PillVariant, { bg: string; fg: string }> = {
  beta: { bg: color.violetSoft, fg: color.violet },
  offline: { bg: color.successSoft, fg: color.success },
  neutral: { bg: color.surface2, fg: color.inkMuted },
};

export function Pill({ label, variant = "neutral", dot }: { label: string; variant?: PillVariant; dot?: boolean }) {
  const styles = VARIANT_STYLES[variant];
  return (
    <View style={[pillStyles.base, { backgroundColor: styles.bg }]}>
      {dot ? <View style={[pillStyles.dot, { backgroundColor: styles.fg }]} /> : null}
      <Text style={[pillStyles.label, { color: styles.fg }]}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: {
    fontFamily: font.bodyExtraBold,
    fontSize: type.label,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
