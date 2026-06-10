// screens/qr/services/qr.service.ts
import { httpClient } from "@/http/httpClient";
import { VerifyAccessResponse } from "../types/qr.types";

export const QrService = {
  async verifyAccess(userId: number): Promise<VerifyAccessResponse> {
    return httpClient.postAuth<VerifyAccessResponse>("/api/qr/verify-access", {
      user_id: userId,
    });
  },
  async verifyAccessByCI(ci: string): Promise<VerifyAccessResponse> {
    return httpClient.postAuth<VerifyAccessResponse>(
      "/api/qr/verify-access-ci",
      {
        ci,
      },
    );
  },
};
