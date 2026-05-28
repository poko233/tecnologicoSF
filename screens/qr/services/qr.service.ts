// screens/qr/services/qr.service.ts
import { httpClient } from "@/http/httpClient";
import { AsistenciaResponse, VerifyAccessResponse } from "../types/qr.types";

export const QrService = {
  async registrarAsistencia(userId: number): Promise<AsistenciaResponse> {
    return httpClient.postAuth<AsistenciaResponse>("/api/qr/asistencia", {
      user_id: userId,
    });
  },

  async verifyAccess(
    userId: number,
    puntoControl?: string,
  ): Promise<VerifyAccessResponse> {
    return httpClient.postAuth<VerifyAccessResponse>("/api/qr/verify-access", {
      user_id: userId,
      punto_control: puntoControl ?? "App Móvil",
    });
  },
};
