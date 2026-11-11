// screens/asistencia/helpers/month.helpers.ts
import { Sesion } from "../types/asistencia.types";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MESES_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export interface MonthGroup {
  key: string;
  label: string;
  shortLabel: string;
  sesiones: Sesion[];
}

export function groupSessionsByMonth(sesiones: Sesion[]): MonthGroup[] {
  const map = new Map<string, Sesion[]>();
  const safe = (sesiones ?? []).filter(
    (s): s is Sesion => !!s && typeof s.fecha === "string",
  );
  for (const s of safe) {
    const [y, m] = s.fecha.split("-");
    const key = `${y}-${m}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => {
      const [y, m] = key.split("-");
      const monthIdx = parseInt(m, 10) - 1;
      return {
        key,
        label: `${MESES[monthIdx]} ${y}`,
        shortLabel: `${MESES_SHORT[monthIdx]} ${y.slice(2)}`,
        sesiones: list,
      };
    });
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthKeyFromFecha(fecha: string): string {
  return (fecha ?? "").split("T")[0].slice(0, 7);
}

export function applyMonthVisibilityPolicy(
  sesiones: Sesion[],
  programadasVisibles = 2,
): { visible: Sesion[]; ocultas: number } {
  const safe = (sesiones ?? []).filter(
    (s): s is Sesion => !!s && typeof s.id === "number",
  );
  const noProgramadas = safe.filter((s) => s.estado !== "programada");
  const programadas = safe.filter((s) => s.estado === "programada");
  const visiblesProg = programadas.slice(0, programadasVisibles);
  const ocultas = programadas.length - visiblesProg.length;
  const allVisibleIds = new Set(
    [...noProgramadas, ...visiblesProg].map((s) => s.id),
  );
  const visible = safe.filter((s) => allVisibleIds.has(s.id));
  return { visible, ocultas: Math.max(0, ocultas) };
}
