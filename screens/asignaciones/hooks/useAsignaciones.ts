import { useCallback, useRef, useState } from "react";
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
  TurnoInscripcion,
} from "../types/asignaciones.types";

export function useAsignaciones() {
  /*
   * Ya no inicia en true porque los estudiantes no deben cargarse
   * hasta que el usuario elija una carrera en la tabla.
   */
  const [loading, setLoading] = useState(false);

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

  const [estudianteSeleccionado, setEstudianteSeleccionado] =
    useState<Estudiante | null>(null);

  const [detalle, setDetalle] =
    useState<DetalleEstudianteResponse | null>(null);

  const [materias, setMaterias] = useState<MateriaSemestreUno[]>([]);

  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  /*
   * Guarda la carrera que se está mostrando actualmente en la tabla.
   * Esto permite refrescar correctamente después de inscribir o editar,
   * sin volver a cargar estudiantes de todas las carreras.
   */
  const carreraActualRef = useRef<number | null>(null);

  const limpiarSeleccion = useCallback((conLoading = false) => {
    setDetalle(null);
    setMaterias([]);
    setLoadingDetalle(conLoading);
    setLoadingMaterias(conLoading);
  }, []);

  /*
   * Ahora idCarrera es obligatorio.
   * La tabla solamente cargará estudiantes pertenecientes a la carrera
   * que el usuario haya seleccionado.
   */
  const cargarEstudiantes = useCallback(async (idCarrera: number) => {
    if (!idCarrera || Number(idCarrera) <= 0) {
      carreraActualRef.current = null;
      setEstudiantes([]);
      return [];
    }

    try {
      setLoading(true);

      carreraActualRef.current = Number(idCarrera);

      /*
       * IMPORTANTE:
       * getEstudiantesAsignaciones debe recibir idCarrera y enviarlo
       * al endpoint como query parameter.
       */
      const data = await getEstudiantesAsignaciones(Number(idCarrera));

      setEstudiantes(Array.isArray(data) ? data : []);

      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      setEstudiantes([]);

      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ??
          "No se pudieron cargar los estudiantes de esta carrera.",
      });

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDetalle = useCallback(async (idUsuario: number) => {
    try {
      setLoadingDetalle(true);
      setDetalle(null);

      const data = await getDetalleEstudiante(idUsuario);

      setDetalle(data);

      return data;
    } catch (error: any) {
      setDetalle(null);

      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ??
          "No se pudo cargar el detalle del estudiante.",
      });

      return null;
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  const cargarMaterias = useCallback(
    async (idUsuario: number, idCarrera?: number | null) => {
      try {
        setLoadingMaterias(true);
        setMaterias([]);

        const data = await getMateriasSemestreUno(
          idUsuario,
          idCarrera ?? undefined,
        );

        setMaterias(Array.isArray(data) ? data : []);

        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        setMaterias([]);

        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error?.response?.data?.message ??
            "No se pudieron cargar las materias.",
        });

        return [];
      } finally {
        setLoadingMaterias(false);
      }
    },
    [],
  );

  const inscribir = useCallback(
    async (
      idUsuario: number,
      idCarrera: number | null | undefined,
      turno: TurnoInscripcion,
    ) => {
      if (!idCarrera || Number(idCarrera) <= 0) {
        Toast.show({
          type: "error",
          text1: "Carrera requerida",
          text2: "Debes seleccionar una carrera antes de inscribir.",
        });

        return null;
      }

      try {
        setInscribiendo(true);

        const data = await inscribirSemestreUno(
          idUsuario,
          Number(idCarrera),
          turno,
        );

        Toast.show({
          type: "success",
          text1: "Inscripción realizada",
          text2:
            data?.message ??
            "El estudiante fue inscrito correctamente en las materias.",
        });

        /*
         * Se vuelve a cargar la carrera que estaba visible en la tabla.
         * Así el alumno aparecerá inmediatamente resaltado en verde,
         * porque el backend debe devolver yaInscrito: true.
         */
        const carreraParaRecargar =
          carreraActualRef.current ?? Number(idCarrera);

        await Promise.all([
          cargarEstudiantes(carreraParaRecargar),
          cargarDetalle(idUsuario),
          cargarMaterias(idUsuario, Number(idCarrera)),
        ]);

        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo inscribir",
          text2:
            error?.response?.data?.message ??
            "Verifique los cupos disponibles y el turno seleccionado.",
        });

        return null;
      } finally {
        setInscribiendo(false);
      }
    },
    [cargarDetalle, cargarEstudiantes, cargarMaterias],
  );

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

        /*
         * Solo recarga la tabla si ya existe una carrera seleccionada.
         * No debe cargar todos los estudiantes automáticamente.
         */
        const tareas: Promise<unknown>[] = [cargarDetalle(idUsuario)];

        if (carreraActualRef.current) {
          tareas.push(cargarEstudiantes(carreraActualRef.current));
        }

        await Promise.all(tareas);

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
    [cargarDetalle, cargarEstudiantes],
  );

  /*
   * Ya no usamos useEffect para cargar estudiantes al abrir esta pantalla.
   * La carga se ejecuta recién al llamar:
   *
   * cargarEstudiantes(idCarrera)
   *
   * desde el selector de carrera.
   */

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
    limpiarSeleccion,
  };
}