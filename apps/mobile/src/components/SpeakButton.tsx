import React from "react";
import * as Speech from "expo-speech";
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { color, font, radius, type } from "../theme/tokens";

export function SpeakButton({
  text,
  label = "Leer",
  style,
}: {
  text: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const disabled = !text.trim();
  return (
    <Pressable
      onPress={() => Speech.speak(text, { language: "es-MX" })}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.label}>🔊 {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: color.surface2,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 999,
    paddingVertical: 12,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  label: { fontFamily: font.bodyExtraBold, fontSize: type.body, color: color.ink },
});
