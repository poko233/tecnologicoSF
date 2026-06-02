import CryptoJS from "crypto-js";
import Constants from "expo-constants";

// Primero intenta leer la variable de entorno (útil en desarrollo),
// si no existe, toma la clave desde app.json -> expo.extra.QR_SECRET_KEY
const QR_KEY =
  process.env.EXPO_PUBLIC_QR_SECRET_KEY ||
  Constants.expoConfig?.extra?.QR_SECRET_KEY;

if (!QR_KEY) {
  console.warn(
    "EXPO_PUBLIC_QR_SECRET_KEY no definida ni en .env ni en app.json extra",
  );
}

function hexToWordArray(hex: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Hex.parse(hex);
}

export function decryptQrData(qrData: string): number | null {
  try {
    const parts = qrData.split(":");
    if (parts.length !== 2) {
      console.error("Formato QR inválido");
      return null;
    }

    const ivBase64 = parts[0];
    const ciphertextBase64 = parts[1];

    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const ciphertext = CryptoJS.enc.Base64.parse(ciphertextBase64);

    if (!QR_KEY) return null;

    const keyWordArray = hexToWordArray(QR_KEY);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any,
      keyWordArray,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonString) return null;

    const payload = JSON.parse(jsonString);
    if (payload.user_id && typeof payload.user_id === "number") {
      return payload.user_id;
    }
    return null;
  } catch (error) {
    console.error("Error al desencriptar QR:", error);
    return null;
  }
}
