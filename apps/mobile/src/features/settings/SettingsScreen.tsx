import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Pill } from "../../components/Pill";
import { color, font, spacing, type } from "../../theme/tokens";
import { DEFAULT_SETTINGS, getSettings, updateSettings, type Settings } from "../../storage/settings";
import { isModelAvailable } from "../../ml/modelClassifier";
import { getWordReferences } from "../../storage/wordReferences";

function Row({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: color.surface2, true: color.accentSoft }}
        thumbColor={value ? color.accent : color.inkMuted}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [wordRefCount, setWordRefCount] = useState(0);

  useEffect(() => {
    getSettings().then(setSettings);
    getWordReferences().then((refs) => setWordRefCount(refs.length));
  }, []);

  const patch = async (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    await updateSettings(partial);
  };

  return (
    <Screen>
      <Text style={styles.title}>Ajustes</Text>

      <Card style={{ backgroundColor: color.successSoft, borderColor: "rgba(79,174,124,.35)" }}>
        <Pill label="Modo sin conexion" variant="offline" dot />
        <Text style={styles.offlineNote}>
          Letras, historial y lectura en voz alta funcionan sin red. El diccionario de palabras se
          actualiza solo cuando hay conexion.
        </Text>
      </Card>

      <Card style={{ gap: 0 }}>
        <Row
          label="Vibrar al detectar"
          value={settings.vibrateOnDetect}
          onChange={(v) => patch({ vibrateOnDetect: v })}
        />
        <View style={styles.separator} />
        <Row
          label="Sonido al detectar"
          value={settings.soundOnDetect}
          onChange={(v) => patch({ soundOnDetect: v })}
        />
      </Card>

      <Card style={{ gap: 0 }}>
        <InfoRow label="Modelo de letras" value={isModelAvailable ? "v1 · entrenado · on-device" : "reglas (v0, sin entrenar aun)"} />
        <View style={styles.separator} />
        <InfoRow label="Vocabulario de palabras" value={`${wordRefCount} referencia${wordRefCount === 1 ? "" : "s"}`} />
        <View style={styles.separator} />
        <InfoRow label="Version de la app" value="1.0.0 (beta)" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: type.title, color: color.ink, marginBottom: spacing.xs },
  offlineNote: { fontFamily: font.bodyRegular, fontSize: type.caption, color: color.inkMuted, marginTop: spacing.xs, lineHeight: 17 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm },
  rowLabel: { fontFamily: font.bodyBold, fontSize: type.body + 1, color: color.ink },
  rowSub: { fontFamily: font.bodyRegular, fontSize: type.label, color: color.inkMuted, marginTop: 1 },
  rowValue: { fontFamily: font.bodyBold, fontSize: type.body, color: color.inkMuted },
  separator: { height: 1, backgroundColor: color.border },
});
