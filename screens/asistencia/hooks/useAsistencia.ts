// screens/asistencia/hooks/useAsistencia.ts
import { useCallback, useEffect, useRef, useState } from "react";
import {
  batchRegistrarAsistencia,
  getEstudiantesAsistencia,
  getGruposAsignados,
} from "../services/asistencia.service";
import {
  AsistenciaTipo,
  BatchAsistenciaItem,
  EstudiantesResponse,
  GrupoAsignado,
} from "../types/asistencia.types";

export type LocalAttendanceState = Record<
  number,
  { tipo: AsistenciaTipo | null; observacion: string }
>;

export function useAsistencia() {
  const [grupos, setGrupos] = useState<GrupoAsignado[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [errorGrupos, setErrorGrupos] = useState<string | null>(null);

  const [selectedGrupoId, setSelectedGrupoId] = useState<number | null>(null);
  const [estudiantesData, setEstudiantesData] =
    useState<EstudiantesResponse | null>(null);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [errorEstudiantes, setErrorEstudiantes] = useState<string | null>(null);
  const [sinEstudiantesMessage, setSinEstudiantesMessage] = useState<
    string | null
  >(null);

  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(
    null,
  );
  const [localChanges, setLocalChanges] = useState<LocalAttendanceState>({});

  const abortRef = useRef<AbortController | null>(null);

  const fetchGrupos = useCallback(async () => {
    setLoadingGrupos(true);
    setErrorGrupos(null);
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await getGruposAsignados(controller.signal);
      setGrupos(res.data);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setErrorGrupos(err.message || "Error desconocido");
    } finally {
      setLoadingGrupos(false);
    }
  }, []);

  const fetchEstudiantes = useCallback(async (idGrupo: number) => {
    setSelectedGrupoId(idGrupo);
    setLoadingEstudiantes(true);
    setErrorEstudiantes(null);
    setSinEstudiantesMessage(null);
    setLocalChanges({});
    setSelectedHorarioId(null);
    setEstudiantesData(null); // limpiar datos anteriores mientras carga
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await getEstudiantesAsistencia(idGrupo, controller.signal);
      setEstudiantesData(res.data);
      if (res.message) {
        setSinEstudiantesMessage(res.message);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setErrorEstudiantes(err.message || "Error al obtener datos");
    } finally {
      setLoadingEstudiantes(false);
    }
  }, []);

  const updateLocalChange = useCallback(
    (
      idInscripcion: number,
      tipo: AsistenciaTipo | null,
      observacion?: string,
    ) => {
      setLocalChanges((prev) => ({
        ...prev,
        [idInscripcion]: {
          tipo: tipo ?? prev[idInscripcion]?.tipo ?? null,
          observacion: observacion ?? prev[idInscripcion]?.observacion ?? "",
        },
      }));
    },
    [],
  );

  const submitBatch = useCallback(async () => {
    if (
      !estudiantesData ||
      (!selectedHorarioId && estudiantesData.horarios.length > 0)
    )
      return;
    const batchItems: BatchAsistenciaItem[] = [];
    const listaId = estudiantesData.lista_asistencia.id;

    for (const est of estudiantesData.estudiantes) {
      const local = localChanges[est.id_inscripcion];
      const asistenciaActual = est.asistencias_hoy.find(
        (a) =>
          a.idHorario === selectedHorarioId ||
          (!a.idHorario && !selectedHorarioId),
      );
      const tipoFinal =
        local?.tipo ?? asistenciaActual?.asistencia?.tipo ?? null;
      const obsFinal =
        local?.observacion ?? asistenciaActual?.asistencia?.observacion ?? null;

      if (tipoFinal) {
        batchItems.push({
          id_inscripcion: est.id_inscripcion,
          id_lista_asistencia: listaId,
          tipo: tipoFinal,
          observacion: obsFinal,
          idHorario: selectedHorarioId,
        });
      }
    }

    if (batchItems.length === 0) return;
    const res = await batchRegistrarAsistencia({ asistencias: batchItems });
    setLocalChanges({});
    return res;
  }, [estudiantesData, selectedHorarioId, localChanges]);

  const resetToGroupSelection = useCallback(() => {
    setSelectedGrupoId(null);
    setEstudiantesData(null);
    setSelectedHorarioId(null);
    setLocalChanges({});
    setSinEstudiantesMessage(null);
  }, []);

  useEffect(() => {
    fetchGrupos();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchGrupos]);

  return {
    grupos,
    loadingGrupos,
    errorGrupos,
    selectedGrupoId,
    estudiantesData,
    loadingEstudiantes,
    errorEstudiantes,
    sinEstudiantesMessage,
    fetchEstudiantes,
    selectedHorarioId,
    setSelectedHorarioId,
    localChanges,
    updateLocalChange,
    submitBatch,
    resetToGroupSelection,
  };
}
