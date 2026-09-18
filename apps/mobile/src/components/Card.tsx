import React from "react";
import { View, type StyleProp, type ViewStyle, StyleSheet } from "react-native";
import { color, radius, spacing } from "../theme/tokens";

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
