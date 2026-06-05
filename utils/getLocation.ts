// utils/getLocation.ts
export async function getLocationString(): Promise<string> {
  console.log("📍 Iniciando obtención de ubicación...");

  // Verificar el estado del permiso antes de solicitar la posición
  const permissionStatus = await checkGeolocationPermission();
  if (permissionStatus === "denied") {
    console.warn("⚠️ Permiso de ubicación denegado por el usuario.");
    // Lanzar un error descriptivo que el UI pueda capturar
    throw new Error(
      "Permiso de ubicación denegado. Actívalo manualmente en la configuración del navegador.",
    );
  }

  if (permissionStatus === "unavailable") {
    console.warn(
      "⚠️ La API de geolocalización no está disponible en este navegador.",
    );
    // Fallback silencioso
    return "Entrada principal a las instalaciones";
  }

  // Aquí el estado es 'prompt' o 'granted'
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    console.log(`📍 Posición obtenida: lat ${latitude}, lon ${longitude}`);

    const address = await reverseGeocode(latitude, longitude);
    console.log(`📍 Dirección obtenida: ${address}`);
    return address;
  } catch (error: any) {
    // Si falla la obtención (timeout, posición no disponible), usar fallback
    console.warn(
      "⚠️ Falló la obtención de la posición:",
      error?.message || error,
    );
    return "Entrada principal a las instalaciones";
  }
}

/**
 * Verifica el estado del permiso de geolocalización usando la API de Permissions.
 * @returns 'granted', 'denied', 'prompt' o 'unavailable'
 */
async function checkGeolocationPermission(): Promise<string> {
  if (!navigator.permissions) {
    // Navegador no soporta la API de Permissions; intentaremos directamente
    return "unknown";
  }
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    console.log("📍 Estado del permiso de ubicación:", result.state);
    return result.state; // 'granted', 'denied', 'prompt'
  } catch {
    return "unavailable";
  }
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  console.log("📍 Solicitando posición actual...");

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error("❌ navigator.geolocation no disponible");
      reject(new Error("Geolocalización no soportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0,
    });
  });
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  console.log(`📍 Consultando Nominatim: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "es",
        "User-Agent": "TecnologicoSF/1.0",
      },
    });
    if (!response.ok) throw new Error("Error en la geocodificación");

    const data = await response.json();
    if (data && data.address) {
      const { city, town, village, state, country } = data.address;
      const locality = city || town || village || "";
      const region = state || "";
      const countryName = country || "";
      const result = [locality, region, countryName].filter(Boolean).join(", ");
      return result;
    }
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    // Si falla la geocodificación, devolvemos coordenadas crudas
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}
