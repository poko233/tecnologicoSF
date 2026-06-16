import { useCallback, useEffect, useState } from "react";
import { obtenerEmpresa } from "../services/empresa.service";
import { Empresa } from "../types/empresa.types";
import { obtenerMensajeError } from "../types/httpError";

interface UseEmpresaResult {
  empresa: Empresa | null;
  cargando: boolean;
  error: string | null;
  refrescar: () => Promise<void>;
}

export function useEmpresa(): UseEmpresaResult {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const datos = await obtenerEmpresa();
      setEmpresa(datos);
    } catch (err) {
      setError(
        obtenerMensajeError(err, "Error al obtener configuración de empresa."),
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { empresa, cargando, error, refrescar: cargar };
}