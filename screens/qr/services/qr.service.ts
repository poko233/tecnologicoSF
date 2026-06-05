// screens/qr/services/qr.service.ts
import { httpClient } from "@/http/httpClient";
import { VerifyAccessResponse } from "../types/qr.types";

export const QrService = {
  async verifyAccess(
    userId: number,
    puntoControl?: string,
  ): Promise<VerifyAccessResponse> {
    return httpClient.postAuth<VerifyAccessResponse>("/api/qr/verify-access", {
      user_id: userId,
      punto_control: puntoControl ?? "Entrada principal a las instalaciones",
    });
  },
  async verifyAccessByCI(
    ci: string,
    puntoControl?: string,
  ): Promise<VerifyAccessResponse> {
    return httpClient.postAuth<VerifyAccessResponse>(
      "/api/qr/verify-access-ci",
      {
        ci,
        punto_control: puntoControl ?? "Entrada principal a las instalaciones",
      },
    );
  },
};
