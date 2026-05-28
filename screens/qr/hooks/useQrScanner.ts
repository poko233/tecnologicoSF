// screens/qr/hooks/useQrScanner.ts
import { decryptQrData } from "@/utils/qrCrypto";
import {
  BarcodeScanningResult,
  useCameraPermissions
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { useCallback, useRef, useState } from "react";
import { QrService } from "../services/qr.service";
import { ScanMode } from "../types/qr.types";

export function useQrScanner(mode: ScanMode) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);

  // Referencia que siempre tendrá el modo actual
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const handleBarCodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (isProcessing) return;
      setIsProcessing(true);
      setIsCameraActive(false);
      setError(null);
      setScanResult(null);

      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );

        const userId = decryptQrData(result.data);
        if (!userId) {
          throw new Error("Código QR inválido o corrupto");
        }

        // Usar la referencia para obtener el modo más reciente
        const currentMode = modeRef.current;
        if (currentMode === "asistencia") {
          const asistencia = await QrService.registrarAsistencia(userId);
          setScanResult(asistencia);
        } else {
          const access = await QrService.verifyAccess(userId);
          setScanResult(access);
        }
      } catch (err: any) {
        const message = err?.message || "Error al procesar el código QR";
        setError(message);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing], // Ahora solo depende de isProcessing; mode se lee desde la ref
  );

  const resetScan = useCallback(() => {
    setScanResult(null);
    setError(null);
    setIsCameraActive(true);
  }, []);

  return {
    permission,
    requestPermission,
    isCameraActive,
    isProcessing,
    scanResult,
    error,
    handleBarCodeScanned,
    resetScan,
  };
}
