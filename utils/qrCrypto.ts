// utils/qrCrypto.ts
import CryptoJS from "crypto-js";
import Constants from "expo-constants";

const QR_KEY =
  process.env.EXPO_PUBLIC_QR_SECRET_KEY ||
  Constants.expoConfig?.extra?.QR_SECRET_KEY;

if (!QR_KEY) {
  console.warn("EXPO_PUBLIC_QR_SECRET_KEY no definida");
}

function hexToWordArray(hex: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Hex.parse(hex);
}

/**
 * Decodifica una cadena Base62 (0-9, A-Z, a-z) a bytes (WordArray).
 */
function base62ToWordArray(str: string): CryptoJS.lib.WordArray {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let number = BigInt(0);
  for (let i = 0; i < str.length; i++) {
    const digit = chars.indexOf(str[i]);
    if (digit === -1) continue;
    number = number * BigInt(62) + BigInt(digit);
  }
  // Convertir BigInt a bytes (big-endian)
  const hex = number.toString(16).padStart(64, "0"); // 32 bytes → 64 hex chars
  return CryptoJS.enc.Hex.parse(hex.substring(hex.length - 64)); // tomar últimos 64 chars (32 bytes)
}

/**
 * Desencripta un dato QR en formato Base62 (solo ciphertext).
 * @returns user_id o null
 */
export function decryptQrData(qrData: string): number | null {
  try {
    // Limpiar caracteres no alfanuméricos
    const cleanData = qrData.trim().replace(/[^0-9A-Za-z]/g, "");
    if (cleanData.length === 0) return null;

    // 1. Base62 → bytes (ciphertext puro)
    const ciphertext = base62ToWordArray(cleanData);

    // 2. IV fijo: primeros 16 bytes de la clave (igual que backend)
    const keyHex = QR_KEY!;
    const ivHex = keyHex.substring(0, 32); // 16 bytes = 32 hex chars
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    // 3. Desencriptar
    const keyWordArray = hexToWordArray(keyHex);
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
