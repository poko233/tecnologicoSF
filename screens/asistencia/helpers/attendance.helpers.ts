// screens/asistencia/helpers/attendance.helpers.ts
import {
  AsistenciaTipo,
  EstudianteAsistencia,
  Sesion,
} from '../types/asistencia.types';

const PESOS: Record<AsistenciaTipo, number> = {
  Presente: 1.0,
  Permiso: 1.0,
  Atraso: 0.5,
  Falta: 0.0,
};

export interface StudentScore {
  pts: number;
  pct: number;
  attended: number;
  total: number;
}

export function calcularScoreEstudiante(
  estudiante: EstudianteAsistencia,
  sesiones: Sesion[],
): StudentScore {
  let weightedSum = 0;
  let counted = 0;
  for (const sesion of sesiones) {
    if (sesion.estado !== 'tomada') continue;
    const reg = estudiante.asistencias[String(sesion.id)];
    if (!reg) continue;
    counted++;
    weightedSum += PESOS[reg.tipo] ?? 0;
  }
  if (counted === 0) return { pts: 0, pct: 0, attended: 0, total: 0 };
  const pts = Math.min(10, Math.round((weightedSum / counted) * 10 * 10) / 10);
  const pct = Math.round((weightedSum / counted) * 1000) / 10;
  return { pts, pct, attended: counted, total: counted };
}

export function calcularPctSesion(sesion: Sesion): number | null {
  if (sesion.estado !== 'tomada') return null;
  const { presentes, faltas, atrasos, permisos } = sesion.resumen;
  const total = presentes + faltas + atrasos + permisos;
  if (total === 0) return null;
  const asistidos = presentes + permisos + atrasos * 0.5;
  return Math.round((asistidos / total) * 100);
}

export type CellVisual =
  | { kind: 'asistencia'; tipo: AsistenciaTipo; observacion: string | null }
  | { kind: 'feriado' }
  | { kind: 'cancelada' }
  | { kind: 'programada' }
  | { kind: 'sin_registro' };

export function getCellVisual(
  estudiante: EstudianteAsistencia,
  sesion: Sesion,
): CellVisual {
  if (sesion.estado === 'feriado') return { kind: 'feriado' };
  if (sesion.estado === 'cancelada') return { kind: 'cancelada' };
  if (sesion.estado === 'programada') return { kind: 'programada' };
  const reg = estudiante.asistencias[String(sesion.id)];
  if (!reg) return { kind: 'sin_registro' };
  return { kind: 'asistencia', tipo: reg.tipo, observacion: reg.observacion };
}

const CYCLE: AsistenciaTipo[] = ['Presente', 'Atraso', 'Falta', 'Permiso'];
export function nextTipo(current: AsistenciaTipo | null): AsistenciaTipo {
  if (!current) return 'Presente';
  const i = CYCLE.indexOf(current);
  return CYCLE[(i + 1) % CYCLE.length];
}

export const TIPO_LABEL: Record<AsistenciaTipo, string> = {
  Presente: 'P',
  Atraso: 'A',
  Falta: 'F',
  Permiso: 'L',
};

export function getInitials(nombres: string, apellidoPaterno: string): string {
  return ((nombres.charAt(0) || '') + (apellidoPaterno.charAt(0) || '')).toUpperCase();
}

export function formatFullName(e: EstudianteAsistencia): string {
  return `${e.apellidoPaterno} ${e.apellidoMaterno} ${e.nombres}`.trim();
}

export function formatFechaCorta(fecha: string): string {
  const [, m, d] = fecha.split('T')[0].split('-');
  const y = fecha.slice(2, 4);
  return `${d}/${m}/${y}`;
}
