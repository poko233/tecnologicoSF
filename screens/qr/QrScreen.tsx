import { useTheme } from "@/theme/useTheme";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessResultCard } from "./components/AccessResultCard";
import { ModeTabs } from "./components/ModeTabs";
import { QrCameraView } from "./components/QrCameraView";
import { ScanResultAlert } from "./components/ScanResultAlert";
import { useQrScanner } from "./hooks/useQrScanner";
import { AsistenciaResponse, ScanMode, VerifyAccessResponse } from "./types/qr.types";

import { Camera } from "lucide-react-native";

export const QrScreen: React.FC = () => {
  const [mode, setMode] = useState<ScanMode>("asistencia");
  const { theme } = useTheme();
  const {
    permission,
    requestPermission,
    isCameraActive,
    isProcessing,
    scanResult,
    error,
    handleBarCodeScanned,
    resetScan,
  } = useQrScanner(mode);

  const onBarcodeScanned = useCallback(
    (result: any) => {
      handleBarCodeScanned(result);
    },
    [handleBarCodeScanned],
  );

  if (!permission) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <Camera size={64} color={theme.colors.textSecondary} />
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          Necesitamos acceso a la cámara para escanear códigos QR
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.colors.primaryForeground },
            ]}
          >
            Conceder permiso
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: "#000" }]}>
      <QrCameraView
        key={isCameraActive ? "camera-active" : "camera-inactive"}
        onBarcodeScanned={onBarcodeScanned}
        isActive={isCameraActive && !scanResult && !error}
      />

      <SafeAreaView style={styles.overlay} edges={["top"]}>
        <ModeTabs mode={mode} onModeChange={setMode} />

        {isProcessing && (
          <View style={styles.processing}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Verificando...</Text>
          </View>
        )}
      </SafeAreaView>

      {scanResult && mode === "asistencia" && !error && (
        <ScanResultAlert
          visible
          type="success"
          title="Asistencia registrada"
          subtitle={`${(scanResult as AsistenciaResponse).asistencia.estudiante} · ${(scanResult as AsistenciaResponse).asistencia.materia}`}
          onDismiss={resetScan}
        />
      )}

      {scanResult && mode === "acceso" && !error && (
        <AccessResultCard
          data={scanResult as VerifyAccessResponse}
          onDismiss={resetScan}
        />
      )}

      {error && (
        <ScanResultAlert
          visible
          type="error"
          title="Error"
          subtitle={error}
          onDismiss={resetScan}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  processing: {
    marginTop: 20,
    alignItems: "center",
  },
  processingText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
  },
});
