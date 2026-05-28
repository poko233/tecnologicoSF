// utils/qrCrypto.ts
import CryptoJS from "crypto-js";

const QR_KEY = process.env.EXPO_PUBLIC_QR_SECRET_KEY;

if (!QR_KEY) {
  console.warn("EXPO_PUBLIC_QR_SECRET_KEY no definida");
}

/**
 * Convierte string hexadecimal a WordArray (formato de crypto-js)
 */
function hexToWordArray(hex: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Hex.parse(hex);
}

/**
 * Desencripta el dato QR recibido del escaneo.
 * Formato esperado: base64(iv) + ":" + base64(ciphertext)
 * @returns El user_id como número, o null si falla.
 */
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

    const keyWordArray = hexToWordArray(QR_KEY!);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any, // crypto-js espera un objeto CipherParams
      keyWordArray,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonString) {
      return null;
    }

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
