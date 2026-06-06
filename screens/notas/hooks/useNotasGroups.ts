import { useCallback, useEffect, useState } from "react";
import { fetchMisGrupos } from "../services/notas.service";
import { GrupoMateriaDocente } from "../types/notas.types";

export function useNotasGroups() {
  const [grupos, setGrupos] = useState<GrupoMateriaDocente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarGrupos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMisGrupos();
      setGrupos(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar grupos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarGrupos();
  }, [cargarGrupos]);

  return { grupos, loading, error, recargar: cargarGrupos };
}
