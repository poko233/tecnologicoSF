import { useCallback, useRef, useState } from "react";
import Toast from "react-native-toast-message";

import {
  actualizarEstudianteAsignacion,
  getCarrerasAsignaciones,
  getDetalleEstudiante,
  getEstudiantesAsignaciones,
  getMateriasSemestreUno,
  inscribirSemestreUno,
} from "../services/asignaciones.services";

import {
  CarreraAsignacion,
  DetalleEstudianteResponse,
  Estudiante,
  EstudianteForm,
  MateriaBloqueadaPrerequisito,
  MateriaPendienteAnterior,
  MateriaSemestreUno,
  TurnoInscripcion,
} from "../types/asignaciones.types";

export function useAsignaciones() {
  const [loading, setLoading] = useState(false);
  const [loadingCarreras, setLoadingCarreras] = useState(false);

  const [carreras, setCarreras] = useState<CarreraAsignacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

  const [estudianteSeleccionado, setEstudianteSeleccionado] =
    useState<Estudiante | null>(null);

  const [detalle, setDetalle] =
    useState<DetalleEstudianteResponse | null>(null);

  const [materias, setMaterias] = useState<MateriaSemestreUno[]>([]);

  const [materiasPendientesAnteriores, setMateriasPendientesAnteriores] =
    useState<MateriaPendienteAnterior[]>([]);

  const [materiasBloqueadasPrerequisito, setMateriasBloqueadasPrerequisito] =
    useState<MateriaBloqueadaPrerequisito[]>([]);

  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [carreraActual, setCarreraActual] = useState<number | null>(null);
  const [nivelActual, setNivelActual] = useState<number | null>(null);

  const carreraActualRef = useRef<number | null>(null);
  const nivelActualRef = useRef<number | null>(null);

  const cargarCarreras = useCallback(async () => {
    try {
      setLoadingCarreras(true);

      const data = await getCarrerasAsignaciones();
      const lista = Array.isArray(data) ? data : [];

      setCarreras(lista);

      return lista;
    } catch (error: any) {
      setCarreras([]);

      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ??
          "No se pudieron cargar las carreras.",
      });

      return [];
    } finally {
      setLoadingCarreras(false);
    }
  }, []);

  const limpiarSeleccion = useCallback((conLoading = false) => {
    setDetalle(null);
    setMaterias([]);
    setMateriasPendientesAnteriores([]);
    setMateriasBloqueadasPrerequisito([]);
    setLoadingDetalle(conLoading);
    setLoadingMaterias(conLoading);
  }, []);

  const limpiarTabla = useCallback(() => {
    carreraActualRef.current = null;
    nivelActualRef.current = null;

    setCarreraActual(null);
    setNivelActual(null);
    setEstudiantes([]);
  }, []);

  const cargarEstudiantes = useCallback(
    async (idCarrera: number, nivel?: number | null) => {
      if (!idCarrera || Number(idCarrera) <= 0) {
        limpiarTabla();
        return [];
      }

      const idCarreraNumber = Number(idCarrera);
      const nivelNumber =
        nivel !== undefined && nivel !== null && Number(nivel) > 0
          ? Number(nivel)
          : null;

      try {
        setLoading(true);

        carreraActualRef.current = idCarreraNumber;
        nivelActualRef.current = nivelNumber;

        setCarreraActual(idCarreraNumber);
        setNivelActual(nivelNumber);

        const data = await getEstudiantesAsignaciones(
          idCarreraNumber,
          nivelNumber,
        );

        const lista = Array.isArray(data) ? data : [];

        setEstudiantes(lista);

        return lista;
      } catch (error: any) {
        setEstudiantes([]);

        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error?.response?.data?.message ??
            "No se pudieron cargar los estudiantes de esta carrera y nivel.",
        });

        return [];
      } finally {
        setLoading(false);
      }
    },
    [limpiarTabla],
  );

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
    async (
      idUsuario: number,
      idCarrera?: number | null,
      nivel?: number | null,
    ) => {
      const idCarreraFinal =
        idCarrera !== undefined && idCarrera !== null
          ? Number(idCarrera)
          : carreraActualRef.current;

      const nivelFinal =
        nivel !== undefined && nivel !== null
          ? Number(nivel)
          : nivelActualRef.current;

      if (!idCarreraFinal || Number(idCarreraFinal) <= 0) {
        Toast.show({
          type: "error",
          text1: "Carrera requerida",
          text2: "Debes seleccionar una carrera antes de cargar materias.",
        });

        setMaterias([]);
        setMateriasPendientesAnteriores([]);
        setMateriasBloqueadasPrerequisito([]);
        return [];
      }

      if (!nivelFinal || Number(nivelFinal) <= 0) {
        Toast.show({
          type: "error",
          text1: "Nivel requerido",
          text2:
            "Debes seleccionar semestre, año o mes antes de cargar materias.",
        });

        setMaterias([]);
        setMateriasPendientesAnteriores([]);
        setMateriasBloqueadasPrerequisito([]);
        return [];
      }

      try {
        setLoadingMaterias(true);
        setMaterias([]);
        setMateriasPendientesAnteriores([]);
        setMateriasBloqueadasPrerequisito([]);

        const data = await getMateriasSemestreUno(
          idUsuario,
          Number(idCarreraFinal),
          Number(nivelFinal),
        );

        const lista = Array.isArray(data.materias) ? data.materias : [];
        const pendientesAnteriores = Array.isArray(
          data.materiasPendientesAnteriores,
        )
          ? data.materiasPendientesAnteriores
          : [];

        const bloqueadasPrerequisito = Array.isArray(
          data.materiasBloqueadasPrerequisito,
        )
          ? data.materiasBloqueadasPrerequisito
          : [];

        setMaterias(lista);
        setMateriasPendientesAnteriores(pendientesAnteriores);
        setMateriasBloqueadasPrerequisito(bloqueadasPrerequisito);

        return lista;
      } catch (error: any) {
        setMaterias([]);
        setMateriasPendientesAnteriores([]);
        setMateriasBloqueadasPrerequisito([]);

        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error?.response?.data?.message ??
            "No se pudieron cargar las materias del nivel seleccionado.",
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
      nivel?: number | null,
    ) => {
      const idCarreraFinal =
        idCarrera !== undefined && idCarrera !== null
          ? Number(idCarrera)
          : carreraActualRef.current;

      const nivelFinal =
        nivel !== undefined && nivel !== null
          ? Number(nivel)
          : nivelActualRef.current;

      if (!idCarreraFinal || Number(idCarreraFinal) <= 0) {
        Toast.show({
          type: "error",
          text1: "Carrera requerida",
          text2: "Debes seleccionar una carrera antes de inscribir.",
        });

        return null;
      }

      if (!nivelFinal || Number(nivelFinal) <= 0) {
        Toast.show({
          type: "error",
          text1: "Nivel requerido",
          text2: "Debes seleccionar semestre, año o mes antes de inscribir.",
        });

        return null;
      }

      try {
        setInscribiendo(true);

        const data = await inscribirSemestreUno(
          idUsuario,
          Number(idCarreraFinal),
          turno,
          Number(nivelFinal),
        );

        Toast.show({
          type: "success",
          text1: "Inscripción realizada",
          text2:
            data?.message ??
            "El estudiante fue inscrito correctamente en las materias.",
        });

        await Promise.all([
          cargarEstudiantes(Number(idCarreraFinal), Number(nivelFinal)),
          cargarDetalle(idUsuario),
          cargarMaterias(
            idUsuario,
            Number(idCarreraFinal),
            Number(nivelFinal),
          ),
        ]);

        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo inscribir",
          text2:
            error?.response?.data?.message ??
            "Verifique los cupos disponibles, el turno y el nivel seleccionado.",
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

        const tareas: Promise<unknown>[] = [cargarDetalle(idUsuario)];

        if (carreraActualRef.current && nivelActualRef.current) {
          tareas.push(
            cargarEstudiantes(
              carreraActualRef.current,
              nivelActualRef.current,
            ),
          );
        } else if (carreraActualRef.current) {
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

  return {
    loading,
    loadingCarreras,

    carreras,
    estudiantes,

    estudianteSeleccionado,
    setEstudianteSeleccionado,

    detalle,
    materias,
    materiasPendientesAnteriores,
    materiasBloqueadasPrerequisito,

    loadingDetalle,
    loadingMaterias,
    inscribiendo,
    guardando,

    carreraActual,
    nivelActual,

    cargarCarreras,
    cargarEstudiantes,
    cargarDetalle,
    cargarMaterias,
    inscribir,
    actualizarEstudiante,
    limpiarSeleccion,
    limpiarTabla,
  };
}