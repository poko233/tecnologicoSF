import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import {
  actualizarEstudiante,
  actualizarFotoEstudiante,
  obtenerDetalleEstudiante,
  obtenerEstudiantes,
  obtenerHistorialEstudiante,
} from "../services/estudiante.service";
import {
  EstudianteForm,
  EstudianteUsuario,
  FotoEstudianteArchivo,
  HistorialEstudianteResponse,
} from "../types/estudiante.types";

let estudiantesCache: EstudianteUsuario[] | null = null;
let detalleEstudianteCache: Record<number, EstudianteUsuario> = {};
let historialEstudianteCache: Record<number, HistorialEstudianteResponse> = {};
let estudiantesCacheDirty = true;

export function invalidarCacheEstudiantes() {
  estudiantesCacheDirty = true;
  detalleEstudianteCache = {};
  historialEstudianteCache = {};
}

/**
 * Combina dos respuestas del mismo estudiante sin borrar información completa
 * cuando una API devuelve solamente un resumen parcial.
 */
function fusionarEstudiante(
  anterior: EstudianteUsuario | null | undefined,
  nuevo: EstudianteUsuario,
): EstudianteUsuario {
  if (!anterior) return nuevo;

  const resultado: EstudianteUsuario = {
    ...anterior,
    ...nuevo,
  };

  const conservarSiNoVino = <K extends keyof EstudianteUsuario>(campo: K) => {
    if (nuevo[campo] === undefined) {
      resultado[campo] = anterior[campo] as EstudianteUsuario[K];
    }
  };

  conservarSiNoVino("documentos");
  conservarSiNoVino("roles");
  conservarSiNoVino("carreras");
  conservarSiNoVino("promociones");
  conservarSiNoVino("numeroReferencias");
  conservarSiNoVino("numero_referencias");
  conservarSiNoVino("foto");
  conservarSiNoVino("fotoUrl");
  conservarSiNoVino("codigo_qr");
  conservarSiNoVino("qrUrl");

  return resultado;
}

function buscarEstudianteCache(id: number): EstudianteUsuario | null {
  return (
    detalleEstudianteCache[id] ??
    estudiantesCache?.find((item) => Number(item.id) === Number(id)) ??
    null
  );
}

function guardarEstudianteEnCache(estudiante: EstudianteUsuario) {
  const anterior = buscarEstudianteCache(estudiante.id);
  const completo = fusionarEstudiante(anterior, estudiante);

  detalleEstudianteCache[estudiante.id] = completo;

  if (estudiantesCache) {
    estudiantesCache = estudiantesCache.map((item) =>
      Number(item.id) === Number(estudiante.id)
        ? fusionarEstudiante(item, completo)
        : item,
    );
  }

  return completo;
}

export function useEstudiantes() {
  const [estudiantes, setEstudiantes] = useState<EstudianteUsuario[]>(
    estudiantesCache ?? [],
  );

  const [loading, setLoading] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cargandoHistorialEstudiante, setCargandoHistorialEstudiante] =
    useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const sincronizarListado = useCallback(() => {
    if (estudiantesCache) {
      setEstudiantes([...estudiantesCache]);
    }
  }, []);

  const cargarEstudiantes = useCallback(async (forzar = false) => {
    if (!forzar && estudiantesCache && !estudiantesCacheDirty) {
      setEstudiantes([...estudiantesCache]);
      return estudiantesCache;
    }

    try {
      setLoading(true);

      const data = await obtenerEstudiantes();
      const lista = Array.isArray(data.estudiantes) ? data.estudiantes : [];

      estudiantesCache = lista.map((item) =>
        fusionarEstudiante(detalleEstudianteCache[item.id], item),
      );
      estudiantesCacheDirty = false;

      setEstudiantes([...estudiantesCache]);

      return estudiantesCache;
    } catch (error: any) {
      if (estudiantesCache) {
        setEstudiantes([...estudiantesCache]);
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudieron cargar los estudiantes.",
      });

      return estudiantesCache ?? [];
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDetalleEstudiante = useCallback(
    async (id: number, forzar = false) => {
      const idUsuario = Number(id);

      if (
        !forzar &&
        !estudiantesCacheDirty &&
        detalleEstudianteCache[idUsuario]
      ) {
        return detalleEstudianteCache[idUsuario];
      }

      try {
        setCargandoDetalle(true);

        const data = await obtenerDetalleEstudiante(idUsuario);
        const estudiante = data.estudiante ?? null;

        if (!estudiante) {
          return buscarEstudianteCache(idUsuario);
        }

        const completo = guardarEstudianteEnCache(estudiante);
        sincronizarListado();

        return completo;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error?.message || "No se pudo cargar el detalle del estudiante.",
        });

        return buscarEstudianteCache(idUsuario);
      } finally {
        setCargandoDetalle(false);
      }
    },
    [sincronizarListado],
  );

  const cargarHistorialEstudiante = useCallback(
    async (id: number, forzar = false) => {
      const idUsuario = Number(id);

      if (!forzar && historialEstudianteCache[idUsuario]) {
        return historialEstudianteCache[idUsuario];
      }

      try {
        setCargandoHistorialEstudiante(true);

        const data = await obtenerHistorialEstudiante(idUsuario);
        historialEstudianteCache[idUsuario] = data;

        /*
         * IMPORTANTE:
         * El endpoint de historial puede devolver un estudiante resumido.
         * No se guarda ese resumen en detalleEstudianteCache porque podría
         * borrar documentos, fotoUrl y qrUrl del detalle completo.
         */

        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error?.message || "No se pudo cargar el historial del estudiante.",
        });

        return null;
      } finally {
        setCargandoHistorialEstudiante(false);
      }
    },
    [],
  );

  const guardarDatosEstudiante = useCallback(
    async (id: number, form: EstudianteForm) => {
      try {
        setGuardando(true);

        const data = await actualizarEstudiante(id, form);
        const estudiante = guardarEstudianteEnCache(data.estudiante);

        delete historialEstudianteCache[id];
        sincronizarListado();

        Toast.show({
          type: "success",
          text1: "Estudiante actualizado",
        });

        return estudiante;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message || "No se pudo actualizar el estudiante.",
        });

        return null;
      } finally {
        setGuardando(false);
      }
    },
    [sincronizarListado],
  );

  const guardarFotoEstudiante = useCallback(
    async (id: number, archivo: FotoEstudianteArchivo) => {
      try {
        setSubiendoFoto(true);

        const data = await actualizarFotoEstudiante(id, archivo);
        const estudiante = guardarEstudianteEnCache(data.estudiante);

        sincronizarListado();

        Toast.show({
          type: "success",
          text1: "Foto actualizada",
        });

        return estudiante;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message || "No se pudo actualizar la foto.",
        });

        return null;
      } finally {
        setSubiendoFoto(false);
      }
    },
    [sincronizarListado],
  );

  useEffect(() => {
    void cargarEstudiantes(false);
  }, [cargarEstudiantes]);

  return {
    estudiantes,
    loading,
    cargandoDetalle,
    cargandoHistorialEstudiante,
    guardando,
    subiendoFoto,
    cargarEstudiantes,
    cargarDetalleEstudiante,
    cargarHistorialEstudiante,
    guardarDatosEstudiante,
    guardarFotoEstudiante,
  };
}
