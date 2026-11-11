// screens/asistencia/hooks/useAsistencia.ts
import { useCallback, useEffect, useRef, useState } from "react";
import {
  actualizarFechasMateria,
  cambiarEstadoSesion,
  getGrupoEstudiantes,
  getGruposAsignados,
  limpiarSesion,
  reabrirSesion,
  tomarSesion,
} from "../services/asistencia.service";
import {
  AsistenciaTipo,
  CambiarEstadoSesionPayload,
  EstudianteAsistencia,
  GrupoAsignado,
  GrupoData,
  Sesion,
} from "../types/asistencia.types";

export type { LocalAttendanceState } from "../types/asistencia.types";

/**
 * Sanitiza la respuesta del backend:
 * - Elimina nulls en `sesiones[]` y `estudiantes[]`.
 * - Garantiza que `sesiones` y `estudiantes` son arrays.
 * - Garantiza que `grupo_materia_docente` existe (sino, mantiene el raw pero no rompe).
 */
function sanitizeGrupoData(
  raw: GrupoData | null | undefined,
): GrupoData | null {
  if (!raw) return null;
  const sesiones: Sesion[] = Array.isArray(raw.sesiones)
    ? raw.sesiones.filter(
        (s): s is Sesion =>
          !!s && typeof s === "object" && typeof s.id === "number",
      )
    : [];
  const estudiantes: EstudianteAsistencia[] = Array.isArray(raw.estudiantes)
    ? raw.estudiantes.filter(
        (e): e is EstudianteAsistencia =>
          !!e && typeof e === "object" && typeof e.id_inscripcion === "number",
      )
    : [];
  return { ...raw, sesiones, estudiantes };
}

export function useAsistencia() {
  const [grupos, setGrupos] = useState<GrupoAsignado[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [errorGrupos, setErrorGrupos] = useState<string | null>(null);
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | null>(null);
  const [grupoData, setGrupoData] = useState<GrupoData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [errorData, setErrorData] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchGrupos = useCallback(async () => {
    setLoadingGrupos(true);
    setErrorGrupos(null);
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await getGruposAsignados(controller.signal);
      setGrupos(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setErrorGrupos(err?.message ?? "Error desconocido");
    } finally {
      setLoadingGrupos(false);
    }
  }, []);

  const fetchGrupoData = useCallback(async (idGrupo: number) => {
    setSelectedGrupoId(idGrupo);
    setLoadingData(true);
    setErrorData(null);
    setGrupoData(null);
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await getGrupoEstudiantes(idGrupo, controller.signal);
      setGrupoData(sanitizeGrupoData(res.data));
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setErrorData(err?.message ?? "Error al cargar el grupo");
    } finally {
      setLoadingData(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (selectedGrupoId == null) return;
    try {
      const res = await getGrupoEstudiantes(selectedGrupoId);
      const sanitized = sanitizeGrupoData(res.data);
      if (sanitized) setGrupoData(sanitized);
    } catch {
      /* silencio */
    }
  }, [selectedGrupoId]);

  const saveSesion = useCallback(
    async (
      idSesion: number,
      asistencias: {
        id_inscripcion: number;
        tipo: AsistenciaTipo;
        observacion?: string | null;
      }[],
    ) => {
      const res = await tomarSesion(idSesion, { asistencias });
      return res;
    },
    [],
  );

  const updateSesionEstado = useCallback(
    async (idSesion: number, payload: CambiarEstadoSesionPayload) => {
      const res = await cambiarEstadoSesion(idSesion, payload);
      await refresh();
      return res;
    },
    [refresh],
  );

  const reopenSesionById = useCallback(
    async (idSesion: number) => {
      const res = await reabrirSesion(idSesion);
      await refresh();
      return res;
    },
    [refresh],
  );

  const cleanSesionById = useCallback(
    async (idSesion: number) => {
      const res = await limpiarSesion(idSesion);
      await refresh();
      return res;
    },
    [refresh],
  );

  const saveMateriaFechas = useCallback(
    async (fechaInicio: string, fechaFin: string) => {
      if (!grupoData) throw new Error("Sin datos de grupo");
      const res = await actualizarFechasMateria(
        grupoData.grupo_materia_docente.id_materia,
        {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        },
      );
      await refresh();
      return res;
    },
    [grupoData, refresh],
  );

  /**
   * BLINDAJE: sanitiza `prev.sesiones` antes de mapear para evitar
   * que un `null` (por race condition o backend malformed) rompa el reducer.
   */
  const updateLocalCell = useCallback(
    async (idSesion: number, idInscripcion: number, tipo: AsistenciaTipo) => {
      setGrupoData((prev) => {
        if (!prev) return prev;
        const estudiantes = (prev.estudiantes ?? [])
          .filter(
            (e): e is EstudianteAsistencia =>
              !!e && typeof e.id_inscripcion === "number",
          )
          .map((e) => {
            if (e.id_inscripcion !== idInscripcion) return e;
            return {
              ...e,
              asistencias: {
                ...(e.asistencias ?? {}),
                [String(idSesion)]: {
                  tipo,
                  observacion:
                    e.asistencias?.[String(idSesion)]?.observacion ?? null,
                },
              },
            };
          });
        return { ...prev, estudiantes };
      });

      const res = await tomarSesion(idSesion, {
        asistencias: [{ id_inscripcion: idInscripcion, tipo }],
      });

      setGrupoData((prev) => {
        if (!prev) return prev;
        const sesiones = (prev.sesiones ?? [])
          .filter((s): s is Sesion => !!s && typeof s.id === "number")
          .map((s) => (s.id === idSesion ? { ...s, ...res.data } : s));
        return { ...prev, sesiones };
      });

      return res;
    },
    [],
  );

  const resetToGroupSelection = useCallback(() => {
    setSelectedGrupoId(null);
    setGrupoData(null);
    setErrorData(null);
  }, []);

  useEffect(() => {
    fetchGrupos();
    return () => abortRef.current?.abort();
  }, [fetchGrupos]);

  return {
    grupos,
    loadingGrupos,
    errorGrupos,
    selectedGrupoId,
    grupoData,
    loadingData,
    errorData,
    fetchGrupoData,
    refresh,
    saveSesion,
    updateSesionEstado,
    reopenSesionById,
    cleanSesionById,
    saveMateriaFechas,
    updateLocalCell,
    resetToGroupSelection,
  };
}
