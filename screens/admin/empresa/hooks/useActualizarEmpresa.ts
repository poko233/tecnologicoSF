import { useCallback, useState } from "react";
import { actualizarEmpresa } from "../services/empresa.service";
import {
    ArchivoImagen,
    CampoImagenEmpresa,
    Empresa,
    EmpresaFormData,
} from "../types/empresa.types";
import { HttpClientError, obtenerMensajeError } from "../types/httpError";

interface UseActualizarEmpresaResult {
  actualizar: (
    datos: EmpresaFormData,
    imagenes?: Partial<Record<CampoImagenEmpresa, ArchivoImagen>>,
  ) => Promise<Empresa | null>;
  guardando: boolean;
  error: string | null;
  /** Errores de validación 422 por campo (Laravel: { CAMPO: ["mensaje"] }). */
  erroresCampo: Record<string, string[]> | null;
  exito: boolean;
  limpiarEstado: () => void;
}

/**
 * Guarda cambios de empresa (texto + imágenes opcionales).
 *
 * - Sin imágenes -> PATCH JSON (actualizarSoloDatos en el service).
 * - Con imágenes -> POST + _method=PATCH con FormData (patchFormData).
 *
 * httpClient lanza `{ status, message, errors }`:
 *  - status 422 + errors -> errores de validación por campo (UpdateEmpresaRequest).
 *  - cualquier otro -> error general (mostrar `error`).
 */
export function useActualizarEmpresa(): UseActualizarEmpresaResult {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [exito, setExito] = useState(false);

  const actualizar = useCallback(
    async (
      datos: EmpresaFormData,
      imagenes?: Partial<Record<CampoImagenEmpresa, ArchivoImagen>>,
    ): Promise<Empresa | null> => {
      setGuardando(true);
      setError(null);
      setErroresCampo(null);
      setExito(false);

      try {
        const empresaActualizada = await actualizarEmpresa(datos, imagenes);
        setExito(true);
        return empresaActualizada;
      } catch (err) {
        const httpError = err as Partial<HttpClientError>;

        if (httpError?.status === 422 && httpError.errors) {
          setErroresCampo(httpError.errors);
          setError(
            obtenerMensajeError(
              err,
              "Algunos datos no son válidos. Revisa los campos marcados.",
            ),
          );
        } else {
          setError(
            obtenerMensajeError(err, "Error al actualizar la configuración."),
          );
        }

        return null;
      } finally {
        setGuardando(false);
      }
    },
    [],
  );

  const limpiarEstado = useCallback(() => {
    setError(null);
    setErroresCampo(null);
    setExito(false);
  }, []);

  return { actualizar, guardando, error, erroresCampo, exito, limpiarEstado };
}