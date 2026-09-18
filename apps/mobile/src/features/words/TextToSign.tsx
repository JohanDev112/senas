import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { color, font, radius, spacing, type } from "../../theme/tokens";
import { SpeakButton } from "../../components/SpeakButton";
import { SUGGESTED_WORDS } from "../../data/words";

function normalizeLetters(word: string): string[] {
  return word
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos, deja la letra base
    .split("")
    .filter((ch) => /[A-ZÑ]/.test(ch));
}

export function TextToSign() {
  const [word, setWord] = useState("gracias");
  const letters = useMemo(() => normalizeLetters(word), [word]);

  return (
    <View style={{ gap: spacing.sm }}>
      <TextInput
        value={word}
        onChangeText={setWord}
        placeholder="Ejemplo: hola, gracias, casa…"
        placeholderTextColor={color.inkMuted}
        style={styles.input}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {SUGGESTED_WORDS.map((suggestion) => (
          <Pressable key={suggestion} style={styles.chip} onPress={() => setWord(suggestion)}>
            <Text style={styles.chipText}>{suggestion}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.caption}>Deletreo LSM</Text>

      {letters.length === 0 ? (
        <Text style={styles.emptyHint}>Escribe una palabra para ver su deletreo.</Text>
      ) : (
        <View style={styles.signRow}>
          {letters.map((letter, i) => (
            <View key={`${letter}-${i}`} style={styles.signTile}>
              <Text style={styles.signLetter}>{letter}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.footnote}>
        Por ahora se deletrea letra por letra con el abecedario de LSM. Mas adelante, palabras
        frecuentes podran mostrar directamente su seña completa en video.
      </Text>

      <SpeakButton text={word} label="Reproducir secuencia" />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: color.border, backgroundColor: color.surface, borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 11, color: color.ink, fontFamily: font.bodyBold, fontSize: type.body + 1,
  },
  chip: {
    backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
  },
  chipText: { fontFamily: font.bodyBold, fontSize: type.caption, color: color.inkMuted },
  caption: { fontFamily: font.bodyRegular, fontSize: type.label, color: color.inkMuted, marginTop: spacing.xs },
  emptyHint: { fontFamily: font.bodyRegular, fontSize: type.caption, color: color.inkMuted },
  signRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  signTile: {
    width: 52, height: 56, borderRadius: 10, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border,
    alignItems: "center", justifyContent: "center",
  },
  signLetter: { fontFamily: font.displayBold, fontSize: type.title, color: color.ink },
  footnote: { fontFamily: font.bodyRegular, fontSize: type.label, color: color.inkMuted, lineHeight: 15 },
});
