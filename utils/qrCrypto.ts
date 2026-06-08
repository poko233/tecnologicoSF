// utils/qrCrypto.ts
import CryptoJS from "crypto-js";
import Constants from "expo-constants";

const QR_KEY =
  process.env.EXPO_PUBLIC_QR_SECRET_KEY ||
  Constants.expoConfig?.extra?.QR_SECRET_KEY;

if (!QR_KEY) {
  console.error(
    "🚨 [CRYPTO_FATAL] EXPO_PUBLIC_QR_SECRET_KEY no definida en el entorno.",
  );
}

function hexToWordArray(hex: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Hex.parse(hex);
}

/**
 * Decodifica una cadena Base62 a bytes (WordArray).
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
  const hex = number.toString(16).padStart(64, "0");
  return CryptoJS.enc.Hex.parse(hex.substring(hex.length - 64));
}

/**
 * Desencripta un dato QR en formato Base62 con instrumentación para depuración.
 */
export function decryptQrData(qrData: string): number | null {
  console.log("--------------------------------------------------");
  console.log("🔐 [CRYPTO_DEBUG] Iniciando desencriptación...");
  console.log(
    `🔐 [CRYPTO_DEBUG] QR Original (Longitud: ${qrData?.length}):`,
    qrData,
  );

  try {
    // 1. Limpieza de entrada
    const cleanData = qrData.trim().replace(/[^0-9A-Za-z]/g, "");
    if (cleanData.length === 0) {
      console.warn(
        "⚠️ [CRYPTO_DEBUG] El QR quedó vacío tras la limpieza de caracteres.",
      );
      return null;
    }
    console.log("🔐 [CRYPTO_DEBUG] Datos Limpios (Base62):", cleanData);

    // 2. Decodificación Base62 a Hexadecimal
    const ciphertext = base62ToWordArray(cleanData);
    console.log(
      "🔐 [CRYPTO_DEBUG] Ciphertext (Hex):",
      ciphertext.toString(CryptoJS.enc.Hex),
    );

    // 3. Preparación de Clave y Vector de Inicialización (IV)
    const keyHex = QR_KEY!;
    console.log(
      `🔐 [CRYPTO_DEBUG] Clave configurada (Longitud: ${keyHex?.length} chars)`,
    );

    // Validación de seguridad: Asegurar que la clave tiene al menos 32 caracteres para extraer el IV
    if (keyHex.length < 32) {
      console.error(
        "🚨 [CRYPTO_DEBUG] La clave configurada es demasiado corta para extraer un IV de 16 bytes.",
      );
      return null;
    }

    const ivHex = keyHex.substring(0, 32);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const keyWordArray = hexToWordArray(keyHex);

    console.log(
      "🔐 [CRYPTO_DEBUG] IV extraído (Hex):",
      iv.toString(CryptoJS.enc.Hex),
    );

    // 4. Ejecución del algoritmo AES
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any,
      keyWordArray,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    // 5. Validación previa a la conversión UTF-8 (Prevención del error Malformed UTF-8)
    const decryptedHex = decrypted.toString(CryptoJS.enc.Hex);
    console.log(
      "🔐 [CRYPTO_DEBUG] Resultado Crudo Desencriptado (Hex):",
      decryptedHex || "[VACÍO]",
    );

    if (!decryptedHex) {
      console.error(
        "🚨 [CRYPTO_DEBUG] AES falló silenciosamente. La combinación de Clave/IV/Ciphertext es incorrecta.",
      );
      return null;
    }

    // 6. Conversión final a cadena JSON
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    console.log("🔐 [CRYPTO_DEBUG] Payload descifrado como texto:", jsonString);

    if (!jsonString) return null;

    const payload = JSON.parse(jsonString);
    if (payload.user_id && typeof payload.user_id === "number") {
      console.log(
        "✅ [CRYPTO_DEBUG] Desencriptación exitosa. User ID:",
        payload.user_id,
      );
      console.log("--------------------------------------------------");
      return payload.user_id;
    }

    console.warn(
      "⚠️ [CRYPTO_DEBUG] El JSON es válido, pero no contiene un 'user_id' numérico.",
    );
    return null;
  } catch (error) {
    // Al atrapar el error aquí, evitamos que la aplicación colapse por fallas de padding o UTF-8
    console.error(
      "❌ [CRYPTO_ERROR] Excepción durante el ciclo criptográfico:",
      error,
    );
    console.log("--------------------------------------------------");
    return null;
  }
}
