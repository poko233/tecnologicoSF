import { useCallback, useState } from "react";
import { PagosFiltersState, PagosReportType } from "../types/reportes.types";

export function usePagosFilters() {
  const [filters, setFilters] = useState<PagosFiltersState>({
    tipo: "estudiante",
    estudianteId: null,
    estudianteNombre: null,
    grupoId: null,
    grupoNombre: null,
    gestionId: null,
    soloUltimoPago: false,
    incluirObservaciones: true,
  });

  const setTipo = useCallback((tipo: PagosReportType) => {
    setFilters((prev) => ({
      ...prev,
      tipo,
      // Limpiar el otro tipo al cambiar
      estudianteId: tipo === "estudiante" ? prev.estudianteId : null,
      estudianteNombre: tipo === "estudiante" ? prev.estudianteNombre : null,
      grupoId: tipo === "grupo" ? prev.grupoId : null,
      grupoNombre: tipo === "grupo" ? prev.grupoNombre : null,
    }));
  }, []);

  const setEstudiante = useCallback(
    (id: number | null, nombre: string | null) => {
      setFilters((prev) => ({
        ...prev,
        estudianteId: id,
        estudianteNombre: nombre,
      }));
    },
    [],
  );

  const setGrupo = useCallback((id: number | null, nombre: string | null) => {
    setFilters((prev) => ({ ...prev, grupoId: id, grupoNombre: nombre }));
  }, []);

  const setGestion = useCallback((id: number | null) => {
    setFilters((prev) => ({ ...prev, gestionId: id }));
  }, []);

  const toggleSoloUltimoPago = useCallback(() => {
    setFilters((prev) => ({ ...prev, soloUltimoPago: !prev.soloUltimoPago }));
  }, []);

  const toggleIncluirObservaciones = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      incluirObservaciones: !prev.incluirObservaciones,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      tipo: "estudiante",
      estudianteId: null,
      estudianteNombre: null,
      grupoId: null,
      grupoNombre: null,
      gestionId: null,
      soloUltimoPago: false,
      incluirObservaciones: true,
    });
  }, []);

  return {
    filters,
    setTipo,
    setEstudiante,
    setGrupo,
    setGestion,
    toggleSoloUltimoPago,
    toggleIncluirObservaciones,
    resetFilters,
  };
}
