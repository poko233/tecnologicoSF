// utils/getLocation.ts

/**
 * Obtiene una cadena descriptiva de la ubicación a partir de la IP pública.
 * No requiere permisos del navegador, funciona en HTTP y HTTPS.
 * @returns "Ciudad, Región, País" o fallback si falla.
 */
export async function getLocationString(): Promise<string> {
  console.log("📍 Obteniendo ubicación por IP...");

  try {
    const response = await fetch(
      "http://ip-api.com/json/?fields=city,country,lat,lon,isp,query",
    );
    if (!response.ok)
      throw new Error("Servicio de geolocalización no disponible");

    const data = await response.json();
    console.log("📍 Respuesta de ip-api:", data);

    if (data && data.city) {
      const parts = [
        data.city,
        data.country,
        data.lat,
        data.lon,
        data.isp,
        data.query,
      ].filter(Boolean);
      const location = parts.join(", ");
      console.log("📍 Ubicación por IP:", location);
      return location;
    }
  } catch (error) {
    console.warn("⚠️ No se pudo obtener ubicación por IP:", error);
  }

  // Fallback silencioso
  return "Entrada principal a las instalaciones";
}
