import CryptoJS from "crypto-js";

// Obtener la clave y LIMPIARLA de caracteres invisibles
let QR_KEY = process.env.EXPO_PUBLIC_QR_SECRET_KEY ?? "";

// Eliminar TODOS los caracteres que no sean hexadecimales (0-9, a-f, A-F)
QR_KEY = QR_KEY.replace(/[^0-9a-fA-F]/g, "");

if (!QR_KEY || QR_KEY.length === 0) {
  console.warn("EXPO_PUBLIC_QR_SECRET_KEY no definida o vacía");
} else {
  console.log(
    `🔐 Clave QR configurada (${QR_KEY.length} chars): ${QR_KEY.substring(0, 4)}...${QR_KEY.substring(QR_KEY.length - 4)}`,
  );
}

const BASE62_CHARS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/* ─── Conversión BigInt ↔ bytes (big‑endian) ─── */
function bigIntToBytes(bi: bigint): Uint8Array {
  if (bi === 0n) return new Uint8Array([0]);
  const hex = bi.toString(16);
  const len = Math.ceil(hex.length / 2);
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2) || "0", 16);
  }
  return bytes;
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let hex = "";
  bytes.forEach((b) => (hex += b.toString(16).padStart(2, "0")));
  return BigInt("0x" + hex);
}

/* ─── Base62 ↔ bytes (preservando longitud exacta) ─── */
function bytesToBase62(bytes: Uint8Array): string {
  const length = bytes.length;
  const prefixed = new Uint8Array(bytes.length + 1);
  prefixed[0] = length;
  prefixed.set(bytes, 1);

  const bi = bytesToBigInt(prefixed);
  if (bi === 0n) return "0";

  let result = "";
  let num = bi;
  while (num > 0n) {
    const rem = Number(num % 62n);
    result = BASE62_CHARS[rem] + result;
    num = num / 62n;
  }
  return result;
}

function base62ToBytes(str: string): Uint8Array {
  // Eliminar caracteres no alfanuméricos y espacios
  str = str.replace(/[^0-9A-Za-z]/g, "");
  if (str.length === 0) throw new Error("Base62 vacío");

  let bi = 0n;
  for (const ch of str) {
    const idx = BASE62_CHARS.indexOf(ch);
    if (idx === -1) continue;
    bi = bi * 62n + BigInt(idx);
  }

  const prefixed = bigIntToBytes(bi);
  const length = prefixed[0];
  return prefixed.slice(1, 1 + length);
}

/* ─── Desencriptación del QR ─── */
export function decryptQrData(qrData: string): number | null {
  try {
    console.log("🔐 [CRYPTO_DEBUG] Iniciando desencriptación...");
    console.log(
      `🔐 [CRYPTO_DEBUG] QR Original (Longitud: ${qrData.length}): ${qrData}`,
    );

    // 1. Decodificar Base62 → bytes (IV + ciphertext)
    const rawBytes = base62ToBytes(qrData);
    console.log(
      `🔐 [CRYPTO_DEBUG] Bytes decodificados: ${rawBytes.length} bytes`,
    );

    // 2. Extraer IV (primeros 16 bytes) y ciphertext (resto)
    if (rawBytes.length < 16) {
      console.error("❌ Datos demasiado cortos para extraer IV");
      return null;
    }
    const iv = CryptoJS.lib.WordArray.create(rawBytes.slice(0, 16));
    const ciphertext = CryptoJS.lib.WordArray.create(rawBytes.slice(16));

    console.log(`🔐 [CRYPTO_DEBUG] IV (Hex): ${iv.toString()}`);
    console.log(`🔐 [CRYPTO_DEBUG] Ciphertext (Hex): ${ciphertext.toString()}`);
    console.log(
      `🔐 [CRYPTO_DEBUG] Clave (Longitud limpia: ${QR_KEY.length} chars)`,
    );

    // 3. Clave AES
    const keyWordArray = CryptoJS.enc.Hex.parse(QR_KEY);

    // 4. Desencriptar
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext } as any,
      keyWordArray,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
    );

    const resultHex = decrypted.toString();
    console.log(
      `🔐 [CRYPTO_DEBUG] Resultado Crudo Desencriptado (Hex): ${resultHex}`,
    );

    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonString) {
      console.error("🔐 [CRYPTO_DEBUG] No se pudo convertir a UTF-8");
      return null;
    }

    console.log(
      `🔐 [CRYPTO_DEBUG] Payload descifrado como texto: ${jsonString}`,
    );

    const payload = JSON.parse(jsonString);
    if (payload.user_id && typeof payload.user_id === "number") {
      console.log(
        `✅ [CRYPTO_DEBUG] Desencriptación exitosa. User ID: ${payload.user_id}`,
      );
      return payload.user_id;
    }
    return null;
  } catch (error) {
    console.error("❌ Error al desencriptar QR:", error);
    return null;
  }
}
