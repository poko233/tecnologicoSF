import { useCallback, useMemo, useState } from "react";
import Toast from "react-native-toast-message";

import {
    getDatosInscripcionGestion,
    postInscribirGestion,
} from "../services/inscripcionGestion.services";

import {
    CarreraIG,
    GestionIG,
    InscribirIGResponse,
} from "../types/inscripcionGestion.types";

import {
    carreraDisponibleParaInscribirIG,
    motivoBloqueoCarreraIG,
} from "../utils/inscripcionGestion.utils";

export function useInscripcionGestion() {
  const [loadingDatos, setLoadingDatos] = useState(false);
  const [cargandoGestion, setCargandoGestion] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(false);

  const [gestiones, setGestiones] = useState<GestionIG[]>([]);
  const [carreras, setCarreras] = useState<CarreraIG[]>([]);
  const [carrerasNoDisponibles, setCarrerasNoDisponibles] = useState<
    CarreraIG[]
  >([]);

  const [idGestion, setIdGestion] = useState<number | null>(null);

  const [carrerasSeleccionadas, setCarrerasSeleccionadas] = useState<number[]>(
    [],
  );

  const [resultado, setResultado] = useState<InscribirIGResponse | null>(null);

  const gestionSeleccionada = useMemo(() => {
    if (!idGestion) return null;

    return (
      gestiones.find((gestion) => Number(gestion.id) === Number(idGestion)) ??
      null
    );
  }, [gestiones, idGestion]);

  const carrerasElegidas = useMemo(() => {
    return carreras.filter((carrera) =>
      carrerasSeleccionadas.includes(Number(carrera.idCarrera)),
    );
  }, [carreras, carrerasSeleccionadas]);

  const totalEstudiantesSeleccionados = useMemo(() => {
    return carrerasElegidas.reduce(
      (total, carrera) => total + Number(carrera.totalEstudiantes || 0),
      0,
    );
  }, [carrerasElegidas]);

  const totalMateriasSeleccionadas = useMemo(() => {
    return carrerasElegidas.reduce(
      (total, carrera) =>
        total + Number(carrera.materiasDisponiblesGestion || 0),
      0,
    );
  }, [carrerasElegidas]);

  const cargarDatos = useCallback(async (idGestionParam?: number | null) => {
    try {
      setLoadingDatos(true);

      const data = await getDatosInscripcionGestion(idGestionParam);

      const listaGestiones = Array.isArray(data.gestiones)
        ? data.gestiones
        : [];

      const listaCarreras = Array.isArray(data.carreras)
        ? data.carreras
        : [];

      const listaNoDisponibles = Array.isArray(data.carrerasNoDisponibles)
        ? data.carrerasNoDisponibles
        : [];

      setGestiones(listaGestiones);
      setCarreras(listaCarreras);
      setCarrerasNoDisponibles(listaNoDisponibles);

      const gestionFinal =
        idGestionParam ??
        data.idGestionSeleccionada ??
        listaGestiones.find(
          (gestion) => String(gestion.estado).toLowerCase() === "activo",
        )?.id ??
        null;

      setIdGestion(gestionFinal);

      setCarrerasSeleccionadas((prev) =>
        prev.filter((idCarrera) => {
          const carrera = listaCarreras.find(
            (item) => Number(item.idCarrera) === Number(idCarrera),
          );

          return carrera ? carreraDisponibleParaInscribirIG(carrera) : false;
        }),
      );

      return data;
    } catch (error: any) {
      setGestiones([]);
      setCarreras([]);
      setCarrerasNoDisponibles([]);
      setCarrerasSeleccionadas([]);

      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ??
          error?.message ??
          "No se pudieron cargar gestiones y carreras.",
      });

      return null;
    } finally {
      setLoadingDatos(false);
    }
  }, []);

  const seleccionarGestion = useCallback(
    async (gestion: GestionIG) => {
      const nuevoId = Number(gestion.id);

      setIdGestion(nuevoId);
      setCarreras([]);
      setCarrerasNoDisponibles([]);
      setCarrerasSeleccionadas([]);
      setResultado(null);
      setCargandoGestion(true);

      try {
        await cargarDatos(nuevoId);
      } finally {
        setCargandoGestion(false);
      }
    },
    [cargarDatos],
  );

  const toggleCarrera = useCallback((carrera: CarreraIG) => {
    if (!carreraDisponibleParaInscribirIG(carrera)) {
      Toast.show({
        type: "error",
        text1: "Carrera no disponible",
        text2: motivoBloqueoCarreraIG(carrera),
      });

      return;
    }

    const id = Number(carrera.idCarrera);

    setResultado(null);

    setCarrerasSeleccionadas((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  }, []);

  const seleccionarTodasCarreras = useCallback(() => {
    const disponibles = carreras
      .filter(carreraDisponibleParaInscribirIG)
      .map((carrera) => Number(carrera.idCarrera));

    if (disponibles.length === 0) {
      Toast.show({
        type: "error",
        text1: "Sin carreras disponibles",
        text2: "No hay carreras libres con grupos y materias disponibles.",
      });

      return;
    }

    setResultado(null);
    setCarrerasSeleccionadas(disponibles);
  }, [carreras]);

  const limpiarCarreras = useCallback(() => {
    setResultado(null);
    setCarrerasSeleccionadas([]);
  }, []);

  const inscribirCarreras = useCallback(async () => {
    if (!idGestion || Number(idGestion) <= 0) {
      Toast.show({
        type: "error",
        text1: "Gestión requerida",
        text2: "Selecciona una gestión.",
      });

      return null;
    }

    if (!gestionSeleccionada) {
      Toast.show({
        type: "error",
        text1: "Gestión requerida",
        text2: "Selecciona una gestión.",
      });

      return null;
    }

    if (String(gestionSeleccionada.estado).toLowerCase() === "cerrado") {
      Toast.show({
        type: "error",
        text1: "Gestión cerrada",
        text2: "No se puede inscribir en una gestión cerrada.",
      });

      return null;
    }

    if (carrerasSeleccionadas.length === 0) {
      Toast.show({
        type: "error",
        text1: "Carreras requeridas",
        text2: "Selecciona al menos una carrera.",
      });

      return null;
    }

    try {
      setInscribiendo(true);

      const data = await postInscribirGestion({
        idGestion,
        carreras: carrerasSeleccionadas,
      });

      setResultado(data);

      Toast.show({
        type: "success",
        text1: "Proceso finalizado",
        text2: data.message ?? "Inscripción realizada.",
      });

      await cargarDatos(idGestion);

      return data;
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ??
        error?.response?.data?.errors?.carreras?.[0] ??
        error?.response?.data?.errors?.idGestion?.[0] ??
        error?.data?.message ??
        error?.message;

      Toast.show({
        type: "error",
        text1: "No se pudo inscribir",
        text2:
          backendMessage ??
          "Verifica gestión, grupos, cupos y carreras seleccionadas.",
      });

      return null;
    } finally {
      setInscribiendo(false);
    }
  }, [
    cargarDatos,
    carrerasSeleccionadas,
    gestionSeleccionada,
    idGestion,
  ]);

  return {
    loadingDatos,
    cargandoGestion,
    inscribiendo,

    gestiones,
    carreras,
    carrerasNoDisponibles,

    idGestion,
    carrerasSeleccionadas,
    gestionSeleccionada,
    carrerasElegidas,
    resultado,

    totalEstudiantesSeleccionados,
    totalMateriasSeleccionadas,

    cargarDatos,
    seleccionarGestion,
    toggleCarrera,
    seleccionarTodasCarreras,
    limpiarCarreras,
    inscribirCarreras,
  };
}