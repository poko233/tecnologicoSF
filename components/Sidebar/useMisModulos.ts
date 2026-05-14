import { modulosEventBus } from "@/screens/admin/events/modulosEventBus";
import { getToken } from "@/storage/secureStorage";
import { BASE_URL } from "@http";
import { useCallback, useEffect, useState } from "react";

export interface MiFormulario {
  id: number;
  nombre: string;
  ruta: string;
  icono: string | null;
  descripcion: string;
}

export interface MiModulo {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  formularios: MiFormulario[];
}

interface MisModulosResponse {
  success: boolean;
  id_rol: number;
  modulos: MiModulo[];
}

export function useMisModulos() {
  const [modulos, setModulos] = useState<MiModulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchModulos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) { setError("Sin sesión"); return; }

      const res = await fetch(`${BASE_URL}/api/mis-modulos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json: MisModulosResponse = await res.json();
      setModulos(json.modulos ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar módulos");
      setModulos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchModulos(); }, [fetchModulos]);

  useEffect(() => {
    const unsubscribe = modulosEventBus.subscribe(fetchModulos);
    return () => { unsubscribe(); };
  }, [fetchModulos]);

  return { modulos, loading, error, refetch: fetchModulos };
}