import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { SpeakButton } from "../../components/SpeakButton";
import { Card } from "../../components/Card";
import { color, font, radius, spacing, type } from "../../theme/tokens";
import { HandLandmarkerBridge } from "../../ml/handLandmarker";
import { useLetterRecognition } from "./useLetterRecognition";
import { addHistoryEntry } from "../../storage/history";

export function LettersScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { cameraRef, bridgeRef, bridgeReady, onBridgeReadyChange, prediction, transcript, clear } =
    useLetterRecognition();
  const [detailOpen, setDetailOpen] = useState(false);
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    return () => {
      if (transcriptRef.current.trim()) addHistoryEntry("letter", transcriptRef.current);
    };
  }, []);

  if (!permission) {
    return <Screen scroll={false}><View /></Screen>;
  }

  if (!permission.granted) {
    return (
      <Screen>
        <Text style={styles.title}>Traducir letras</Text>
        <Card>
          <Text style={styles.permissionText}>
            Manos LSM necesita permiso de camara para reconocer letras en tiempo real. No se guarda ni
            se envia ningun video, todo el procesamiento pasa en el telefono.
          </Text>
          <Button label="Dar permiso" onPress={requestPermission} style={{ marginTop: spacing.sm }} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={color.ink} />
        </Pressable>
        <Text style={styles.title}>Traducir letras</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.viewfinder}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
        <HandLandmarkerBridge ref={bridgeRef} onReadyChange={onBridgeReadyChange} />

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{bridgeReady ? "EN VIVO" : "CARGANDO…"}</Text>
        </View>

        {prediction ? (
          <Pressable style={styles.letterChip} onPress={() => setDetailOpen(true)}>
            <Text style={styles.letterChipText}>{prediction.letter}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.transcript}>
        {transcript ? (
          <Text style={styles.transcriptText}>{transcript}</Text>
        ) : (
          <Text style={styles.placeholder}>Muestra una letra frente a la camara…</Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Button label="Limpiar" variant="ghost" onPress={clear} style={{ flex: 1 }} />
        <SpeakButton text={transcript} style={{ flex: 1 }} />
      </View>

      <Modal visible={detailOpen} transparent animationType="fade" onRequestClose={() => setDetailOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setDetailOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalLetterCircle}>
              <Text style={styles.modalLetter}>{prediction?.letter ?? "?"}</Text>
            </View>
            <Text style={styles.modalCaption}>
              {prediction ? "Letra detectada" : "Sin deteccion"}
            </Text>
            <View style={styles.debugCard}>
              {prediction && Object.keys(prediction.debug).length > 0 ? (
                Object.entries(prediction.debug).map(([key, value]) => (
                  <View key={key} style={styles.debugRow}>
                    <Text style={styles.debugKey}>{key}</Text>
                    <Text style={styles.debugValue}>{value}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.debugKey}>Sin datos de depuracion para este clasificador.</Text>
              )}
            </View>
            <SpeakButton text={prediction?.letter ?? ""} label={`Escuchar "${prediction?.letter ?? ""}"`} style={{ marginTop: spacing.sm }} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: font.display, fontSize: type.subtitle, color: color.ink },
  permissionText: { fontFamily: font.bodyRegular, fontSize: type.body, color: color.inkMuted, lineHeight: 19 },
  viewfinder: {
    flex: 1,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#0c0a12",
    borderWidth: 1,
    borderColor: color.border,
  },
  liveBadge: {
    position: "absolute", top: 10, left: 10,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ff5a5f" },
  liveText: { color: "#fff", fontFamily: font.bodyExtraBold, fontSize: 9.5, letterSpacing: 0.5 },
  letterChip: {
    position: "absolute", right: 12, bottom: 12, width: 52, height: 52, borderRadius: 14,
    backgroundColor: color.accent, alignItems: "center", justifyContent: "center",
  },
  letterChipText: { fontFamily: font.displayBold, fontSize: 24, color: color.accentInk },
  transcript: {
    marginTop: spacing.sm, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface,
    borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, minHeight: 48, justifyContent: "center",
  },
  transcriptText: { fontFamily: font.displayBold, fontSize: type.title, color: color.ink },
  placeholder: { fontFamily: font.bodyRegular, fontSize: type.caption, color: color.inkMuted },
  buttonRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
  modalCard: { width: "100%", backgroundColor: color.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center", borderWidth: 1, borderColor: color.border },
  modalLetterCircle: { width: 96, height: 96, borderRadius: 26, backgroundColor: color.accentSoft, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  modalLetter: { fontFamily: font.displayBold, fontSize: 44, color: color.accent },
  modalCaption: { fontFamily: font.bodyRegular, fontSize: type.caption, color: color.inkMuted, marginBottom: spacing.sm },
  debugCard: { width: "100%", borderWidth: 1, borderColor: color.border, borderRadius: radius.sm, padding: spacing.sm, gap: 4 },
  debugRow: { flexDirection: "row", justifyContent: "space-between" },
  debugKey: { fontFamily: font.bodyRegular, fontSize: type.caption, color: color.inkMuted },
  debugValue: { fontFamily: font.bodyBold, fontSize: type.caption, color: color.ink },
});
