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

function guardarEstudianteEnCache(estudiante: EstudianteUsuario) {
  detalleEstudianteCache[estudiante.id] = estudiante;

  if (estudiantesCache) {
    estudiantesCache = estudiantesCache.map((item) =>
      item.id === estudiante.id ? estudiante : item,
    );
  }
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

  const cargarEstudiantes = useCallback(async (forzar = false) => {
    if (!forzar && estudiantesCache && !estudiantesCacheDirty) {
      setEstudiantes(estudiantesCache);
      return estudiantesCache;
    }

    try {
      setLoading(true);

      const data = await obtenerEstudiantes();
      const lista = data.estudiantes ?? [];

      estudiantesCache = lista;
      estudiantesCacheDirty = false;

      setEstudiantes(lista);

      return lista;
    } catch (error: any) {

      if (estudiantesCache) {
        setEstudiantes(estudiantesCache);
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
      if (!forzar && !estudiantesCacheDirty && detalleEstudianteCache[id]) {
        return detalleEstudianteCache[id];
      }

      try {
        setCargandoDetalle(true);

        const data = await obtenerDetalleEstudiante(id);
        const estudiante = data.estudiante ?? null;

        if (estudiante) {
          guardarEstudianteEnCache(estudiante);

          if (estudiantesCache) {
            setEstudiantes(estudiantesCache);
          }
        }

        return estudiante;
      } catch (error: any) {

        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error?.message || "No se pudo cargar el detalle del estudiante.",
        });

        return null;
      } finally {
        setCargandoDetalle(false);
      }
    },
    [],
  );

  const cargarHistorialEstudiante = useCallback(
    async (id: number, forzar = false) => {
      if (!forzar && historialEstudianteCache[id]) {
        return historialEstudianteCache[id];
      }

      try {
        setCargandoHistorialEstudiante(true);

        const data = await obtenerHistorialEstudiante(id);

        historialEstudianteCache[id] = data;

        if (data.estudiante) {
          guardarEstudianteEnCache(data.estudiante);

          if (estudiantesCache) {
            setEstudiantes(estudiantesCache);
          }
        }

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
        const estudiante = data.estudiante;

        guardarEstudianteEnCache(estudiante);
        delete historialEstudianteCache[id];

        if (estudiantesCache) {
          setEstudiantes(estudiantesCache);
        }

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
    [],
  );

  const guardarFotoEstudiante = useCallback(
    async (id: number, archivo: FotoEstudianteArchivo) => {
      try {
        setSubiendoFoto(true);

        const data = await actualizarFotoEstudiante(id, archivo);
        const estudiante = data.estudiante;

        guardarEstudianteEnCache(estudiante);

        if (estudiantesCache) {
          setEstudiantes(estudiantesCache);
        }

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
    [],
  );

  useEffect(() => {
    cargarEstudiantes(false);
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