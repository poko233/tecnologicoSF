export function formatDateToDDMMYYYY(
  isoString: string | null | undefined,
): string {
  if (!isoString) return "—";
  const [year, month, day] = isoString.split("-");
  return `${day}/${month}/${year}`;
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
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
