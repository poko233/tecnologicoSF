// utils/qrCrypto.ts
import CryptoJS from "crypto-js";
import Constants from "expo-constants";

const QR_KEY =
  process.env.EXPO_PUBLIC_QR_SECRET_KEY ||
  Constants.expoConfig?.extra?.QR_SECRET_KEY;

if (!QR_KEY) {
  console.warn("EXPO_PUBLIC_QR_SECRET_KEY no definida");
} else {
  console.log("🔑 QR_KEY definida, longitud:", QR_KEY.length);
}

function hexToWordArray(hex: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Hex.parse(hex);
}

function base64UrlToWordArray(str: string): CryptoJS.lib.WordArray {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return CryptoJS.enc.Base64.parse(base64);
}

export function decryptQrData(qrData: string): number | null {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📥 QR recibido:", qrData);
    const cleanData = qrData.trim().replace(/[^A-Za-z0-9\-_]/g, "");
    console.log("📥 QR limpio:", cleanData);
    if (cleanData.length === 0) {
      console.error("❌ QR vacío o caracteres inválidos");
      return null;
    }

    // 1. Base64URL → bytes (como WordArray)
    const combined = base64UrlToWordArray(cleanData);
    const hex = CryptoJS.enc.Hex.stringify(combined);
    console.log("🔸 Hex combinado:", hex);

    // Verificar longitud mínima (16 bytes = 32 caracteres hex)
    if (hex.length < 32) {
      console.error("❌ Datos QR demasiado cortos");
      return null;
    }

    // 2. Separar IV y ciphertext usando subcadenas hex
    const ivHex = hex.substring(0, 32); // primeros 16 bytes
    const ciphertextHex = hex.substring(32); // resto
    console.log("🔸 IV (hex):", ivHex);
    console.log("🔸 Ciphertext (hex):", ciphertextHex);

    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const ciphertext = CryptoJS.enc.Hex.parse(ciphertextHex);

    // 3. Desencriptar
    const keyWordArray = hexToWordArray(QR_KEY!);
    console.log("🔑 Clave (hex):", QR_KEY!.substring(0, 10) + "...");
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
    console.log("🔸 JSON desencriptado:", jsonString);
    if (!jsonString) {
      console.error(
        "❌ No se pudo obtener texto UTF-8 (posible clave incorrecta)",
      );
      return null;
    }

    // 4. Parsear JSON
    const payload = JSON.parse(jsonString);
    console.log("🔸 Payload:", payload);
    if (payload.user_id && typeof payload.user_id === "number") {
      console.log("✅ QR desencriptado, user_id:", payload.user_id);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━");
      return payload.user_id;
    }

    console.warn("⚠️ Payload sin user_id válido");
    return null;
  } catch (error) {
    console.error("❌ Error al desencriptar QR:", error);
    return null;
  }
}
