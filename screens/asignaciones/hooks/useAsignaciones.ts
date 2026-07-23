import { useCallback, useRef, useState } from "react";
import Toast from "react-native-toast-message";

import {
  actualizarEstudianteAsignacion,
  actualizarMateriasInscripcion,
  getCarrerasAsignaciones,
  getDetalleEstudiante,
  getEstudiantesAsignaciones,
  getMateriasSemestreUno,
} from "../services/asignaciones.services";

import {
  ActualizarInscripcionResponse,
  CarreraAsignacion,
  DetalleEstudianteResponse,
  Estudiante,
  EstudianteForm,
  MateriaBloqueadaPrerequisito,
  MateriaPendienteAnterior,
  MateriaSemestreUno,
  SeleccionMateriaInscripcion,
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
  const [guardandoInscripcion, setGuardandoInscripcion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [carreraActual, setCarreraActual] = useState<number | null>(null);
  const [nivelActual, setNivelActual] = useState<number | null>(null);
  const [nivelMateriasActual, setNivelMateriasActual] = useState<number | null>(
    null,
  );
  const [notaAprobacionActual, setNotaAprobacionActual] = useState<
    number | null
  >(null);

  const carreraActualRef = useRef<number | null>(null);
  const nivelActualRef = useRef<number | null>(null);
  const materiasRequestIdRef = useRef(0);

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
    materiasRequestIdRef.current += 1;
    setDetalle(null);
    setMaterias([]);
    setMateriasPendientesAnteriores([]);
    setMateriasBloqueadasPrerequisito([]);
    setNivelMateriasActual(null);
    setNotaAprobacionActual(null);
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

      if (!idCarreraFinal || idCarreraFinal <= 0) {
        Toast.show({
          type: "error",
          text1: "Carrera requerida",
          text2: "Debes seleccionar una carrera antes de cargar materias.",
        });
        return [];
      }

      if (!nivelFinal || nivelFinal <= 0) {
        Toast.show({
          type: "error",
          text1: "Nivel requerido",
          text2:
            "Debes seleccionar semestre, año o mes antes de cargar materias.",
        });
        return [];
      }

      const requestId = materiasRequestIdRef.current + 1;
      materiasRequestIdRef.current = requestId;

      try {
        setLoadingMaterias(true);
        setMaterias([]);
        setMateriasPendientesAnteriores([]);
        setMateriasBloqueadasPrerequisito([]);
        setNivelMateriasActual(nivelFinal);

        const data = await getMateriasSemestreUno(
          idUsuario,
          idCarreraFinal,
          nivelFinal,
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

        if (materiasRequestIdRef.current !== requestId) {
          return lista;
        }

        setMaterias(lista);
        setMateriasPendientesAnteriores(pendientesAnteriores);
        setMateriasBloqueadasPrerequisito(bloqueadasPrerequisito);
        setNivelMateriasActual(data.nivelSeleccionado ?? nivelFinal);
        setNotaAprobacionActual(
          data.notaAprobacion !== undefined && data.notaAprobacion !== null
            ? Number(data.notaAprobacion)
            : null,
        );

        return lista;
      } catch (error: any) {
        if (materiasRequestIdRef.current !== requestId) {
          return [];
        }

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
        if (materiasRequestIdRef.current === requestId) {
          setLoadingMaterias(false);
        }
      }
    },
    [],
  );

  const actualizarInscripcion = useCallback(
    async (
      idUsuario: number,
      idCarrera: number | null | undefined,
      agregar: SeleccionMateriaInscripcion[],
      quitar: SeleccionMateriaInscripcion[],
    ) => {
      const idCarreraFinal =
        idCarrera !== undefined && idCarrera !== null
          ? Number(idCarrera)
          : carreraActualRef.current;

      if (!idCarreraFinal || idCarreraFinal <= 0) {
        Toast.show({
          type: "error",
          text1: "Carrera requerida",
          text2: "Debes seleccionar una carrera antes de guardar cambios.",
        });
        return null;
      }

      if (agregar.length === 0 && quitar.length === 0) {
        Toast.show({
          type: "info",
          text1: "Sin cambios",
          text2: "No agregaste ni retiraste materias.",
        });
        return null;
      }

      try {
        setGuardandoInscripcion(true);

        const data = await actualizarMateriasInscripcion(
          idUsuario,
          idCarreraFinal,
          agregar,
          quitar,
        );

        Toast.show({
          type: "success",
          text1: "Inscripción actualizada",
          text2: data?.message ?? "Los cambios fueron guardados correctamente.",
        });

        const nivelParaRecargar =
          nivelMateriasActual ??
          agregar[0]?.nivel ??
          quitar[0]?.nivel ??
          nivelActualRef.current;

        const tareas: Promise<unknown>[] = [cargarDetalle(idUsuario)];

        if (carreraActualRef.current) {
          tareas.push(
            cargarEstudiantes(
              carreraActualRef.current,
              nivelActualRef.current,
            ),
          );
        }

        if (nivelParaRecargar) {
          tareas.push(
            cargarMaterias(
              idUsuario,
              idCarreraFinal,
              Number(nivelParaRecargar),
            ),
          );
        }

        await Promise.all(tareas);
        return data;
      } catch (error: any) {
        const backend = error?.response?.data;

        if (
          backend?.code === "CUOTAS_GESTION_REQUERIDAS" ||
          backend?.requiereCuotas === true
        ) {
          return {
            message:
              backend?.message ??
              "El estudiante debe registrar cuotas para la gestión activa.",
            code: "CUOTAS_GESTION_REQUERIDAS",
            requiereCuotas: true,
            cuotasGestion: backend?.cuotasGestion ?? null,
            gestionActiva: backend?.gestionActiva ?? null,
            agregadas: [],
            retiradas: [],
          } satisfies ActualizarInscripcionResponse;
        }

        const errores = backend?.errors;
        const primerError =
          errores && typeof errores === "object"
            ? Object.values(errores).flat().find(Boolean)
            : null;

        Toast.show({
          type: "error",
          text1: "No se pudo actualizar",
          text2: String(
            primerError ??
              backend?.message ??
              "Verifica las materias, los grupos, los turnos y los cupos.",
          ),
        });

        return null;
      } finally {
        setGuardandoInscripcion(false);
      }
    },
    [
      cargarDetalle,
      cargarEstudiantes,
      cargarMaterias,
      nivelMateriasActual,
    ],
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

        if (carreraActualRef.current) {
          tareas.push(
            cargarEstudiantes(
              carreraActualRef.current,
              nivelActualRef.current,
            ),
          );
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
    guardandoInscripcion,
    guardando,
    carreraActual,
    nivelActual,
    nivelMateriasActual,
    notaAprobacionActual,
    cargarCarreras,
    cargarEstudiantes,
    cargarDetalle,
    cargarMaterias,
    actualizarInscripcion,
    actualizarEstudiante,
    limpiarSeleccion,
    limpiarTabla,
  };
}