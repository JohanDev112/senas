import React from "react";
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { color, font, radius, type } from "../theme/tokens";

type ButtonVariant = "primary" | "ghost";

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, { color: isPrimary ? color.accentInk : color.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: radius.md - 2,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: color.accent },
  ghost: { backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { fontFamily: font.bodyExtraBold, fontSize: type.body + 0.5 },
});
