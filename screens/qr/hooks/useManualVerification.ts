import { decryptQrData } from "@/utils/qrCrypto";
import { useCallback, useState } from "react";
import { QrService } from "../services/qr.service";
import { InputMode, VerifyAccessResponse } from "../types/qr.types";

export function useManualVerification() {
  const [result, setResult] = useState<VerifyAccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = useCallback(async (mode: InputMode, value: string) => {
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
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Error al verificar");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, error, loading, verify, reset };
}
