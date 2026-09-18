import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { color, font, radius, spacing, type } from "../../theme/tokens";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { HandLandmarkerBridge } from "../../ml/handLandmarker";
import { useWordCapture } from "./useWordCapture";
import { matchWord, type WordMatch } from "../../ml/dtw";
import { addWordReference, getWordReferences } from "../../storage/wordReferences";
import { addHistoryEntry } from "../../storage/history";

export function CameraToWord() {
  const [permission, requestPermission] = useCameraPermissions();
  const { cameraRef, bridgeRef, bridgeReady, setBridgeReady, isRecording, record } = useWordCapture();
  const [match, setMatch] = useState<WordMatch | null>(null);
  const [referenceCount, setReferenceCount] = useState<number | null>(null);
  const [newWordName, setNewWordName] = useState("");
  const [mode, setMode] = useState<"recognize" | "add">("recognize");

  React.useEffect(() => {
    getWordReferences().then((refs) => setReferenceCount(refs.length));
  }, []);

  if (!permission) return null;
  if (!permission.granted) {
    return (
      <Card>
        <Text style={styles.permissionText}>
          Necesitamos la camara para comparar tu seña contra el vocabulario guardado.
        </Text>
        <Button label="Dar permiso" onPress={requestPermission} style={{ marginTop: spacing.sm }} />
      </Card>
    );
  }

  const handleRecognize = async () => {
    setMatch(null);
    const sequence = await record();
    const references = await getWordReferences();
    if (references.length === 0) {
      setMatch(null);
      return;
    }
    const result = matchWord(sequence, references);
    setMatch(result);
    if (result && result.similarity > 0.5) {
      addHistoryEntry("word", result.word);
    }
  };

  const handleAddReference = async () => {
    const word = newWordName.trim();
    if (!word) return;
    const sequence = await record();
    if (sequence.length < 5) return;
    const updated = await addWordReference({ word, sequence });
    setReferenceCount(updated.length);
    setNewWordName("");
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.viewfinder}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
        <HandLandmarkerBridge ref={bridgeRef} onReadyChange={setBridgeReady} />
        <View style={styles.liveBadge}>
          <View style={[styles.liveDot, { backgroundColor: isRecording ? "#ff5a5f" : color.inkMuted }]} />
          <Text style={styles.liveText}>{isRecording ? "GRABANDO" : bridgeReady ? "LISTO" : "CARGANDO…"}</Text>
        </View>
      </View>

      <View style={styles.modeRow}>
        <Pressable style={[styles.modeTab, mode === "recognize" && styles.modeTabActive]} onPress={() => setMode("recognize")}>
          <Text style={[styles.modeText, mode === "recognize" && styles.modeTextActive]}>Reconocer</Text>
        </Pressable>
        <Pressable style={[styles.modeTab, mode === "add" && styles.modeTabActive]} onPress={() => setMode("add")}>
          <Text style={[styles.modeText, mode === "add" && styles.modeTextActive]}>Agregar referencia</Text>
        </Pressable>
      </View>

      {mode === "recognize" ? (
        <>
          <Text style={styles.hint}>
            Comparando contra {referenceCount ?? 0} palabra{referenceCount === 1 ? "" : "s"} de referencia
          </Text>
          {match ? (
            <>
              <View style={styles.meter}>
                <View style={[styles.meterFill, { width: `${Math.round(match.similarity * 100)}%` }]} />
              </View>
              <Text style={styles.result}>
                &ldquo;{match.word}&rdquo; <Text style={styles.resultSub}>· {Math.round(match.similarity * 100)}% similitud (DTW)</Text>
              </Text>
            </>
          ) : null}
          <Button
            label={isRecording ? "Grabando…" : "Grabar y reconocer (2.5s)"}
            onPress={handleRecognize}
            disabled={isRecording || !bridgeReady || (referenceCount ?? 0) === 0}
          />
          {(referenceCount ?? 0) === 0 ? (
            <Text style={styles.hint}>Todavia no hay referencias guardadas. Ve a &ldquo;Agregar referencia&rdquo;.</Text>
          ) : null}
        </>
      ) : (
        <>
          <TextInput
            value={newWordName}
            onChangeText={setNewWordName}
            placeholder="¿Que palabra vas a grabar?"
            placeholderTextColor={color.inkMuted}
            style={styles.input}
          />
          <Button
            label={isRecording ? "Grabando…" : "Grabar referencia (2.5s)"}
            onPress={handleAddReference}
            disabled={isRecording || !bridgeReady || !newWordName.trim()}
          />
          <Text style={styles.hint}>
            Haz la seña completa mientras se graba. Se guarda en este telefono, sin conexion.
          </Text>
        </>
      )}

      <Text style={styles.footnote}>
        Vocabulario limitado mientras crece el set de referencias -- este es el modo mas
        experimental de la app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionText: { fontFamily: font.bodyRegular, fontSize: type.body, color: color.inkMuted, lineHeight: 19 },
  viewfinder: {
    height: 220, borderRadius: radius.md, overflow: "hidden", backgroundColor: "#0c0a12",
    borderWidth: 1, borderColor: color.border,
  },
  liveBadge: {
    position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { color: "#fff", fontFamily: font.bodyExtraBold, fontSize: 9.5, letterSpacing: 0.5 },
  modeRow: { flexDirection: "row", gap: 6, backgroundColor: color.surface2, padding: 4, borderRadius: 12 },
  modeTab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 9 },
  modeTabActive: { backgroundColor: color.accent },
  modeText: { fontFamily: font.bodyExtraBold, fontSize: type.label + 0.5, color: color.inkMuted },
  modeTextActive: { color: color.accentInk },
  hint: { fontFamily: font.bodyRegular, fontSize: type.caption, color: color.inkMuted },
  meter: { height: 8, borderRadius: 6, backgroundColor: color.surface2, overflow: "hidden" },
  meterFill: { height: "100%", backgroundColor: color.accent },
  result: { fontFamily: font.displayBold, fontSize: type.subtitle, color: color.ink },
  resultSub: { fontFamily: font.bodyRegular, fontSize: type.caption, color: color.inkMuted },
  input: {
    borderWidth: 1, borderColor: color.border, backgroundColor: color.surface, borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 11, color: color.ink, fontFamily: font.bodyBold, fontSize: type.body + 1,
  },
  footnote: { fontFamily: font.bodyRegular, fontSize: type.label, color: color.inkMuted, lineHeight: 15 },
});
