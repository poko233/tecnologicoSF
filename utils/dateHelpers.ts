// Extrae solo la parte de fecha (YYYY-MM-DD) de un ISO string completo
function extractDatePart(isoString: string): string {
  if (!isoString) return "";
  // Si contiene "T", extrae la parte antes de la T
  return isoString.split("T")[0];
}

// Formato DIA/MES/AÑO (sin hora)
export function formatDateToDDMMYYYY(
  isoString: string | null | undefined,
): string {
  if (!isoString) return "—";
  const datePart = extractDatePart(isoString);
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
}

// Formato DIA/MES/AÑO HH:MM (con hora)
export function formatDateTimeToDD_MM_YYYY_HH_MM(
  isoString: string | null | undefined,
): string {
  if (!isoString) return "—";
  const [datePart, timePart] = isoString.split("T");
  const [year, month, day] = datePart.split("-");

  if (!timePart) return `${day}/${month}/${year}`;

  // Extrae HH:MM de timePart (por si viene con Z o con segundos)
  const timeWithoutZ = timePart.replace("Z", "");
  const [hours, minutes] = timeWithoutZ.split(":");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Versión que acepta también Date o timestamp, pero prefiere ISO string
export function formatDisplayDate(
  date: string | Date | null | undefined,
): string {
  if (!date) return "—";
  let iso = "";
  if (typeof date === "string") {
    iso = date;
  } else if (date instanceof Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    iso = `${y}-${m}-${d}`;
  }
  if (!iso) return "—";
  const datePart = extractDatePart(iso);
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
export const formatDateTime = formatDateTimeToDD_MM_YYYY_HH_MM;
/**
 * Formatea una fecha con hora en el formato "2 jul 2026 14:12"
 * Acepta ISO string con o sin hora.
 */
export function formatDateTimeNatural(
  isoString: string | null | undefined,
): string {
  if (!isoString) return "—";

  const [datePart, timePart] = isoString.split("T");
  const [year, month, day] = datePart.split("-");

  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const mesAbreviado = meses[parseInt(month, 10) - 1] ?? month;

  if (!timePart) return `${parseInt(day, 10)} ${mesAbreviado} ${year}`;

  // Extraer solo HH:MM (ignora segundos, milisegundos y zona)
  const timeClean = timePart.split(".")[0].replace("Z", "");
  const [hours, minutes] = timeClean.split(":");

  return `${parseInt(day, 10)} ${mesAbreviado} ${year} ${hours}:${minutes}`;
}
