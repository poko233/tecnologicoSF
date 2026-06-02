import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import {
    actualizarEstudianteAsignacion,
    getDetalleEstudiante,
    getEstudiantesAsignaciones,
    getMateriasSemestreUno,
    inscribirSemestreUno,
} from "../services/asignaciones.services";

import {
    DetalleEstudianteResponse,
    Estudiante,
    EstudianteForm,
    MateriaSemestreUno,
} from "../types/asignaciones.types";

export function useAsignaciones() {
  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] =
    useState<Estudiante | null>(null);

  const [detalle, setDetalle] = useState<DetalleEstudianteResponse | null>(null);
  const [materias, setMaterias] = useState<MateriaSemestreUno[]>([]);

  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargarEstudiantes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEstudiantesAsignaciones();
      setEstudiantes(data);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message ?? "No se pudieron cargar estudiantes.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDetalle = useCallback(async (idUsuario: number) => {
    try {
      setLoadingDetalle(true);
      const data = await getDetalleEstudiante(idUsuario);
      setDetalle(data);
      return data;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message ?? "No se pudo cargar el detalle.",
      });
      return null;
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  const cargarMaterias = useCallback(async (idUsuario: number, idCarrera?: number) => {
    try {
      setLoadingMaterias(true);
      const data = await getMateriasSemestreUno(idUsuario, idCarrera);
      setMaterias(data);
      return data;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message ?? "No se pudieron cargar materias.",
      });
      return [];
    } finally {
      setLoadingMaterias(false);
    }
  }, []);

  const inscribir = useCallback(async (idUsuario: number, idCarrera?: number) => {
    try {
      setInscribiendo(true);
      const data = await inscribirSemestreUno(idUsuario, idCarrera);

      Toast.show({
        type: "success",
        text1: "Correcto",
        text2: data.message,
      });

      await cargarDetalle(idUsuario);
      await cargarMaterias(idUsuario, idCarrera);

      return data;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ??
          "No se pudo realizar la inscripción automática.",
      });
      return null;
    } finally {
      setInscribiendo(false);
    }
  }, [cargarDetalle, cargarMaterias]);

  const actualizarEstudiante = useCallback(
    async (idUsuario: number, form: EstudianteForm) => {
      try {
        setGuardando(true);
        await actualizarEstudianteAsignacion(idUsuario, form);

        Toast.show({
          type: "success",
          text1: "Correcto",
          text2: "Estudiante actualizado correctamente.",
        });

        await cargarEstudiantes();
        await cargarDetalle(idUsuario);

        return true;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error?.response?.data?.message ??
            "No se pudo actualizar el estudiante.",
        });
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [cargarDetalle, cargarEstudiantes]
  );

  useEffect(() => {
    cargarEstudiantes();
  }, [cargarEstudiantes]);

  return {
    loading,
    estudiantes,
    estudianteSeleccionado,
    setEstudianteSeleccionado,

    detalle,
    materias,

    loadingDetalle,
    loadingMaterias,
    inscribiendo,
    guardando,

    cargarEstudiantes,
    cargarDetalle,
    cargarMaterias,
    inscribir,
    actualizarEstudiante,
  };
}