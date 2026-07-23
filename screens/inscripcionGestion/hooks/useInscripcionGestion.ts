import { useCallback, useMemo, useState } from "react";
import Toast from "react-native-toast-message";

import {
  getDatosInscripcionGestion,
  getGruposCarreraGestion,
  postAsignarCarrerasGestion,
} from "../services/inscripcionGestion.services";

import {
  AsignarCarrerasIGResponse,
  CarreraIG,
  DetalleGruposCarreraIGResponse,
  GestionIG,
  ResumenDatosIG,
} from "../types/inscripcionGestion.types";

import {
  carreraDisponibleParaAsignarIG,
  carreraPerteneceGestionIG,
  motivoBloqueoCarreraIG,
} from "../utils/inscripcionGestion.utils";

const RESUMEN_VACIO: ResumenDatosIG = {
  totalCarreras: 0,
  totalCarrerasAsignadas: 0,
  totalCarrerasDisponibles: 0,
  totalCarrerasNoDisponibles: 0,
  totalGruposEnGestion: 0,
  totalGruposParaMover: 0,
};

export function useInscripcionGestion() {
  const [loadingDatos, setLoadingDatos] = useState(false);
  const [cargandoGestion, setCargandoGestion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [gestiones, setGestiones] = useState<GestionIG[]>([]);
  const [carreras, setCarreras] = useState<CarreraIG[]>([]);
  const [resumen, setResumen] = useState<ResumenDatosIG>(RESUMEN_VACIO);

  const [idGestion, setIdGestion] = useState<number | null>(null);
  const [carrerasSeleccionadas, setCarrerasSeleccionadas] = useState<number[]>(
    [],
  );

  const [resultado, setResultado] =
    useState<AsignarCarrerasIGResponse | null>(null);

  const [gruposModalVisible, setGruposModalVisible] = useState(false);
  const [loadingGruposCarrera, setLoadingGruposCarrera] = useState(false);
  const [carreraDetalle, setCarreraDetalle] = useState<CarreraIG | null>(null);
  const [detalleGruposCarrera, setDetalleGruposCarrera] =
    useState<DetalleGruposCarreraIGResponse | null>(null);

  const gestionSeleccionada = useMemo(() => {
    if (!idGestion) return null;

    return (
      gestiones.find((gestion) => Number(gestion.id) === Number(idGestion)) ??
      null
    );
  }, [gestiones, idGestion]);

  const carrerasAsignadas = useMemo(() => {
    return carreras.filter(carreraPerteneceGestionIG);
  }, [carreras]);

  const carrerasDisponibles = useMemo(() => {
    return carreras.filter(carreraDisponibleParaAsignarIG);
  }, [carreras]);

  const carrerasNoDisponibles = useMemo(() => {
    return carreras.filter(
      (carrera) =>
        !carreraPerteneceGestionIG(carrera) &&
        !carreraDisponibleParaAsignarIG(carrera),
    );
  }, [carreras]);

  const carrerasElegidas = useMemo(() => {
    return carreras.filter((carrera) =>
      carrerasSeleccionadas.includes(Number(carrera.idCarrera)),
    );
  }, [carreras, carrerasSeleccionadas]);

  const carrerasParaAsignar = useMemo(() => {
    return carrerasElegidas.filter(
      (carrera) =>
        carreraDisponibleParaAsignarIG(carrera) &&
        Number(carrera.gruposParaMover ?? 0) > 0,
    );
  }, [carrerasElegidas]);

  const totalGruposParaAsignar = useMemo(() => {
    return carrerasParaAsignar.reduce(
      (total, carrera) => total + Number(carrera.gruposParaMover ?? 0),
      0,
    );
  }, [carrerasParaAsignar]);

  const cerrarGruposCarrera = useCallback(() => {
    if (loadingGruposCarrera) return;

    setGruposModalVisible(false);
    setDetalleGruposCarrera(null);
    setCarreraDetalle(null);
  }, [loadingGruposCarrera]);

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

      const gestionFinal =
        idGestionParam ??
        data.idGestionSeleccionada ??
        listaGestiones.find(
          (gestion) => String(gestion.estado).toLowerCase() === "activo",
        )?.id ??
        null;

      setGestiones(listaGestiones);
      setCarreras(listaCarreras);
      setResumen(data.resumen ?? RESUMEN_VACIO);
      setIdGestion(gestionFinal ? Number(gestionFinal) : null);

      const idsYaAsignados = listaCarreras
        .filter(carreraPerteneceGestionIG)
        .map((carrera) => Number(carrera.idCarrera));

      setCarrerasSeleccionadas((prev) => {
        const prevValidos = prev.filter((idCarrera) => {
          const carrera = listaCarreras.find(
            (item) => Number(item.idCarrera) === Number(idCarrera),
          );

          return carrera ? carreraDisponibleParaAsignarIG(carrera) : false;
        });

        return Array.from(new Set([...idsYaAsignados, ...prevValidos]));
      });

      return data;
    } catch (error: any) {
      setGestiones([]);
      setCarreras([]);
      setResumen(RESUMEN_VACIO);
      setCarrerasSeleccionadas([]);

      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ??
          error?.message ??
          "No se pudieron cargar las gestiones y carreras.",
      });

      return null;
    } finally {
      setLoadingDatos(false);
    }
  }, []);

  const seleccionarGestion = useCallback(
    async (gestion: GestionIG) => {
      const nuevoId = Number(gestion.id);

      if (String(gestion.estado).toLowerCase() !== "activo") {
        Toast.show({
          type: "error",
          text1: "Gestión no disponible",
          text2: "Solo se pueden modificar gestiones activas.",
        });
        return;
      }

      setIdGestion(nuevoId);
      setCarreras([]);
      setResumen(RESUMEN_VACIO);
      setCarrerasSeleccionadas([]);
      setResultado(null);
      setGruposModalVisible(false);
      setDetalleGruposCarrera(null);
      setCarreraDetalle(null);
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
    if (carreraPerteneceGestionIG(carrera)) {
      Toast.show({
        type: "info",
        text1: carrera.asignacionCompleta
          ? "Carrera ya asignada"
          : "Asignación parcial",
        text2: carrera.asignacionCompleta
          ? "Esta carrera ya pertenece completamente a la gestión."
          : "Los grupos pendientes se completarán al guardar.",
      });
      return;
    }

    if (!carreraDisponibleParaAsignarIG(carrera)) {
      Toast.show({
        type: "error",
        text1: "Carrera no disponible",
        text2: motivoBloqueoCarreraIG(carrera),
      });
      return;
    }

    const idCarrera = Number(carrera.idCarrera);

    setResultado(null);
    setCarrerasSeleccionadas((prev) => {
      if (prev.includes(idCarrera)) {
        return prev.filter((item) => item !== idCarrera);
      }

      return [...prev, idCarrera];
    });
  }, []);

  const abrirGruposCarrera = useCallback(
    async (carrera: CarreraIG) => {
      if (!idGestion || Number(idGestion) <= 0) {
        Toast.show({
          type: "error",
          text1: "Gestión requerida",
          text2: "Selecciona una gestión antes de revisar los grupos.",
        });
        return null;
      }

      setCarreraDetalle(carrera);
      setDetalleGruposCarrera(null);
      setGruposModalVisible(true);
      setLoadingGruposCarrera(true);

      try {
        const data = await getGruposCarreraGestion(
          Number(idGestion),
          Number(carrera.idCarrera),
        );

        setDetalleGruposCarrera(data);
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudieron cargar los grupos",
          text2:
            error?.response?.data?.message ??
            error?.response?.data?.errors?.idGestion?.[0] ??
            error?.message ??
            "Revisa la carrera y la gestión seleccionada.",
        });

        return null;
      } finally {
        setLoadingGruposCarrera(false);
      }
    },
    [idGestion],
  );

  const seleccionarTodasCarreras = useCallback(() => {
    const idsAsignadas = carreras
      .filter(carreraPerteneceGestionIG)
      .map((carrera) => Number(carrera.idCarrera));

    const idsDisponibles = carreras
      .filter(carreraDisponibleParaAsignarIG)
      .map((carrera) => Number(carrera.idCarrera));

    if (idsDisponibles.length === 0) {
      Toast.show({
        type: "info",
        text1: "Sin carreras pendientes",
        text2: "No hay carreras libres o parciales para asignar.",
      });
    }

    setResultado(null);
    setCarrerasSeleccionadas(
      Array.from(new Set([...idsAsignadas, ...idsDisponibles])),
    );
  }, [carreras]);

  const limpiarCarreras = useCallback(() => {
    const idsAsignadas = carreras
      .filter(carreraPerteneceGestionIG)
      .map((carrera) => Number(carrera.idCarrera));

    setResultado(null);
    setCarrerasSeleccionadas(idsAsignadas);
  }, [carreras]);

  const asignarCarreras = useCallback(async () => {
    if (!idGestion || Number(idGestion) <= 0 || !gestionSeleccionada) {
      Toast.show({
        type: "error",
        text1: "Gestión requerida",
        text2: "Selecciona una gestión activa.",
      });
      return null;
    }

    if (String(gestionSeleccionada.estado).toLowerCase() !== "activo") {
      Toast.show({
        type: "error",
        text1: "Gestión no disponible",
        text2: "No se pueden asignar carreras a una gestión cerrada o inactiva.",
      });
      return null;
    }

    const idsCarrerasParaAsignar = carrerasParaAsignar.map((carrera) =>
      Number(carrera.idCarrera),
    );

    if (idsCarrerasParaAsignar.length === 0) {
      Toast.show({
        type: "info",
        text1: "Sin cambios pendientes",
        text2: "Selecciona al menos una carrera disponible.",
      });
      return null;
    }

    try {
      setGuardando(true);

      const data = await postAsignarCarrerasGestion({
        idGestion: Number(idGestion),
        carreras: idsCarrerasParaAsignar,
      });

      setResultado(data);

      Toast.show({
        type: "success",
        text1: "Asignación completada",
        text2: data.message ?? "Las carreras fueron asignadas correctamente.",
      });

      await cargarDatos(Number(idGestion));

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
        text1: "No se pudo asignar",
        text2:
          backendMessage ??
          "Revisa la gestión y los grupos vinculados a las carreras.",
      });

      return null;
    } finally {
      setGuardando(false);
    }
  }, [
    cargarDatos,
    carrerasParaAsignar,
    gestionSeleccionada,
    idGestion,
  ]);

  return {
    loadingDatos,
    cargandoGestion,
    guardando,
    loadingGruposCarrera,

    gestiones,
    carreras,
    carrerasAsignadas,
    carrerasDisponibles,
    carrerasNoDisponibles,
    resumen,

    idGestion,
    carrerasSeleccionadas,
    gestionSeleccionada,
    carrerasElegidas,
    carrerasParaAsignar,
    resultado,

    gruposModalVisible,
    carreraDetalle,
    detalleGruposCarrera,

    totalGruposParaAsignar,

    cargarDatos,
    seleccionarGestion,
    toggleCarrera,
    abrirGruposCarrera,
    cerrarGruposCarrera,
    seleccionarTodasCarreras,
    limpiarCarreras,
    asignarCarreras,
  };
}
