// screens/qr/hooks/useManualVerification.ts
import { decryptQrData } from "@/utils/qrCrypto";
import * as Speech from "expo-speech";
import { useCallback, useState } from "react";
import { QrService } from "../services/qr.service";
import { InputMode, VerifyAccessResponse } from "../types/qr.types";

export function useManualVerification() {
  const [result, setResult] = useState<VerifyAccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = useCallback(async (mode: InputMode, value: string) => {
    // Detener cualquier habla anterior antes de empezar
    Speech.stop();

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let data: VerifyAccessResponse;
      if (mode === "qr") {
        const userId = decryptQrData(value);
        if (!userId) throw new Error("Código QR inválido o corrupto");
        data = await QrService.verifyAccess(userId);
      } else {
        data = await QrService.verifyAccessByCI(value);
      }

      const texto = `${data.usuario.nombres}${data.usuario.apellido_paterno}, ${data.alerta.mensaje}`;
      Speech.speak(texto, {
        language: "es-AR",
        pitch: 0.7,
        rate: 1.3,
      });

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Error al verificar");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    Speech.stop(); // Detener habla al cerrar el panel
    setResult(null);
    setError(null);
  }, []);

  return { result, error, loading, verify, reset };
}
