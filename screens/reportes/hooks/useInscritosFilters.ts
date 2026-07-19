import { useCallback, useState } from "react";

export interface InscritosFilters {
  carreras: number[];
  turno: string | null;
  idGestion: number | null;
  semestre: number | null;
  anio: number | null;
  periodoActivo: "semestre" | "anio";
}

export function useInscritosFilters() {
  const [filters, setFilters] = useState<InscritosFilters>({
    carreras: [],
    turno: null,
    idGestion: null,
    semestre: null,
    anio: null,
    periodoActivo: "semestre",
  });

  const toggleCarrera = useCallback((id: number) => {
    setFilters((prev) => ({
      ...prev,
      carreras: prev.carreras.includes(id)
        ? prev.carreras.filter((c) => c !== id)
        : [...prev.carreras, id],
    }));
  }, []);

  // Seleccionar o deseleccionar todas las carreras
  const toggleAllCarreras = useCallback((allIds: number[]) => {
    setFilters((prev) => ({
      ...prev,
      carreras: prev.carreras.length === allIds.length ? [] : allIds,
    }));
  }, []);

  const setTurno = useCallback((turno: string | null) => {
    setFilters((prev) => ({ ...prev, turno }));
  }, []);

  const setGestion = useCallback((id: number | null) => {
    setFilters((prev) => ({ ...prev, idGestion: id }));
  }, []);

  const setSemestre = useCallback((value: number | null) => {
    setFilters((prev) => ({
      ...prev,
      semestre: value,
      periodoActivo: "semestre",
    }));
  }, []);

  const setAnio = useCallback((value: number | null) => {
    setFilters((prev) => ({ ...prev, anio: value, periodoActivo: "anio" }));
  }, []);

  const setPeriodoActivo = useCallback((tipo: "semestre" | "anio") => {
    setFilters((prev) => ({ ...prev, periodoActivo: tipo }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      carreras: [],
      turno: null,
      idGestion: null,
      semestre: null,
      anio: null,
      periodoActivo: "semestre",
    });
  }, []);

  return {
    filters,
    toggleCarrera,
    toggleAllCarreras,
    setTurno,
    setGestion,
    setSemestre,
    setAnio,
    setPeriodoActivo,
    resetFilters,
  };
}
