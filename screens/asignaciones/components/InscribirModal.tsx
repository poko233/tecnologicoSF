import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
  CarreraEstudiante,
  Estudiante,
  GrupoDisponible,
  InscripcionDetalle,
  MateriaPendienteAnterior,
  MateriaSemestreUno,
  SeleccionMateriaInscripcion,
  TurnoInscripcion,
} from "../types/asignaciones.types";
import ConfirmarInscripcionModal from "./ConfirmarInscripcionModal";
import SelectDropdown, { SelectOption } from "./SelectDropdown";

type Props = {
  visible: boolean;
  estudiante: Estudiante | null;
  carreras: CarreraEstudiante[];
  inscripcionesActuales: InscripcionDetalle[];
  materias: MateriaSemestreUno[];
  materiasPendientesAnteriores: MateriaPendienteAnterior[];
  loading: boolean;
  loadingMaterias: boolean;
  guardando: boolean;
  carreraInicialId?: number | null;
  nivelInicial?: number | null;
  notaAprobacion?: number | null;
  onClose: () => void;
  onLoadMaterias: (
    idCarrera: number,
    nivel: number,
  ) => void | Promise<void>;
  onConfirm: (
    idCarrera: number,
    agregar: SeleccionMateriaInscripcion[],
    quitar: SeleccionMateriaInscripcion[],
  ) => void | Promise<void>;
};

type MateriaVisual = MateriaSemestreUno & {
  inscripcionActual: SeleccionMateriaInscripcion | null;
  adicion: SeleccionMateriaInscripcion | null;
  retiro: SeleccionMateriaInscripcion | null;
  grupoDisponible: GrupoDisponible;
  seleccionFinal: SeleccionMateriaInscripcion | null;
  marcada: boolean;
  puedeAlternar: boolean;
};

const TURNOS: TurnoInscripcion[] = ["Mañana", "Tarde", "Noche"];

function toNumber(value: unknown, fallback = 0): number {
  const numero = Number(value);
  return Number.isFinite(numero) ? numero : fallback;
}

function nombreCompleto(estudiante: Estudiante | null): string {
  if (!estudiante) return "";

  return `${estudiante.nombres ?? ""} ${estudiante.apellidoPaterno ?? ""} ${
    estudiante.apellidoMaterno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();
}

function obtenerNiveles(carrera?: CarreraEstudiante | null): number[] {
  const source = Array.isArray(carrera?.nivelesAcademicos)
    ? carrera.nivelesAcademicos
    : [];

  return Array.from(
    new Set(
      source
        .map((nivel) => Number(nivel))
        .filter((nivel) => Number.isFinite(nivel) && nivel > 0),
    ),
  ).sort((a, b) => a - b);
}

function textoNivel(
  carrera: CarreraEstudiante | null,
  nivel: number | null,
): string {
  if (!nivel) return "Nivel";

  const tipoNivel = String(carrera?.tipoNivel ?? "").trim();
  if (tipoNivel) return `${tipoNivel} ${nivel}`;

  const regimen = String(carrera?.regimen ?? "").toUpperCase();

  if (regimen.includes("ANUAL")) return `Año ${nivel}`;
  if (regimen.includes("MENSUAL")) return `Mes ${nivel}`;

  return `Semestre ${nivel}`;
}

function esTurno(value: unknown): value is TurnoInscripcion {
  return TURNOS.includes(value as TurnoInscripcion);
}

function formatearFechaMateria(value?: string | null): string {
  if (!value) return "Sin fecha";

  const limpia = String(value).split("T")[0].split(" ")[0];
  const partes = limpia.split("-");

  if (partes.length !== 3) return limpia;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function normalizarParalelo(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

function elegirGrupo(
  materia: MateriaSemestreUno,
  turno: TurnoInscripcion | null,
  paralelo: string | null,
): GrupoDisponible | null {
  if (!turno || !paralelo) return null;

  const paraleloNormalizado = normalizarParalelo(paralelo);
  const grupos = Array.isArray(materia.gruposDisponibles)
    ? materia.gruposDisponibles
    : [];

  return (
    grupos
      .filter(
        (grupo) =>
          grupo.turno === turno &&
          normalizarParalelo(grupo.paralelo) === paraleloNormalizado &&
          (toNumber(grupo.cupos) > 0 || Boolean(grupo.estudianteYaEnGrupo)),
      )
      .sort((a, b) => {
        if (
          Boolean(a.estudianteYaEnGrupo) !==
          Boolean(b.estudianteYaEnGrupo)
        ) {
          return a.estudianteYaEnGrupo ? -1 : 1;
        }

        return toNumber(a.idGrupo) - toNumber(b.idGrupo);
      })[0] ?? null
  );
}

function notaPendiente(materia: MateriaPendienteAnterior): string {
  const nota =
    materia.notaEfectivaHistorial ??
    materia.segundaInstanciaNotaHistorial ??
    materia.notaFinalHistorial;

  return nota === null || nota === undefined
    ? "Sin nota final"
    : `Nota ${Number(nota)}`;
}

function inscripcionASeleccion(
  inscripcion: InscripcionDetalle,
  carrera: CarreraEstudiante | null,
): SeleccionMateriaInscripcion | null {
  if (!esTurno(inscripcion.turno)) return null;

  return {
    idMateria: Number(inscripcion.idMateria),
    idGrupoMateriaDocente: Number(inscripcion.idGrupoMateriaDocente),
    idGrupo: Number(inscripcion.idGrupo),
    nombreMateria: inscripcion.nombreMateria,
    codigoMateria: inscripcion.codigoMateria,
    nivel: Number(inscripcion.semestre),
    nivelLabel: textoNivel(carrera, Number(inscripcion.semestre)),
    turno: inscripcion.turno,
    nombreGrupo: inscripcion.nombreGrupo,
    codigoGrupo: inscripcion.codigoGrupo,
    paralelo: inscripcion.paralelo,
    cupos: 0,
    fechaInicio: inscripcion.fechaInicio ?? null,
    fechaFin: inscripcion.fechaFin ?? null,
  };
}

function crearSeleccion(
  materia: MateriaSemestreUno,
  grupo: GrupoDisponible,
  carrera: CarreraEstudiante | null,
  nivel: number,
  turno: TurnoInscripcion,
): SeleccionMateriaInscripcion {
  return {
    idMateria: Number(materia.idMateria),
    idGrupoMateriaDocente: Number(grupo.idGrupoMateriaDocente),
    idGrupo: Number(grupo.idGrupo),
    nombreMateria: materia.nombreMateria,
    codigoMateria: materia.codigoMateria,
    nivel,
    nivelLabel: textoNivel(carrera, nivel),
    turno,
    nombreGrupo: grupo.nombreGrupo,
    codigoGrupo: grupo.codigoGrupo,
    paralelo: grupo.paralelo,
    cupos: Number(grupo.cupos),
    fechaInicio: materia.fechaInicio ?? null,
    fechaFin: materia.fechaFin ?? null,
  };
}

export default function InscribirModal({
  visible,
  estudiante,
  carreras,
  inscripcionesActuales,
  materias,
  materiasPendientesAnteriores,
  loading,
  loadingMaterias,
  guardando,
  carreraInicialId,
  nivelInicial,
  notaAprobacion,
  onClose,
  onLoadMaterias,
  onConfirm,
}: Props) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  const isMobile = width < 720;
  const isTablet = width < 1120;
  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const modalBackground = isDark ? "#111827" : theme.colors.card;
  const panelBackground = isDark
    ? "rgba(255,255,255,0.045)"
    : "rgba(15,23,42,0.035)";
  const panelStrong = isDark
    ? "rgba(255,255,255,0.075)"
    : "rgba(15,23,42,0.06)";
  const borderColor = isDark
    ? "rgba(255,255,255,0.11)"
    : "rgba(15,23,42,0.11)";

  const initializedRef = useRef(false);

  const [carreraSeleccionadaId, setCarreraSeleccionadaId] = useState<
    number | null
  >(null);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number | null>(
    null,
  );
  const [turnoSeleccionado, setTurnoSeleccionado] =
    useState<TurnoInscripcion | null>(null);
  const [paraleloSeleccionado, setParaleloSeleccionado] = useState<
    string | null
  >(null);
  const [agregar, setAgregar] = useState<SeleccionMateriaInscripcion[]>([]);
  const [quitar, setQuitar] = useState<SeleccionMateriaInscripcion[]>([]);
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      initializedRef.current = false;
      setCarreraSeleccionadaId(null);
      setNivelSeleccionado(null);
      setTurnoSeleccionado(null);
      setParaleloSeleccionado(null);
      setAgregar([]);
      setQuitar([]);
      setConfirmacionVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    if (
      !visible ||
      loading ||
      !estudiante ||
      carreras.length === 0 ||
      initializedRef.current
    ) {
      return;
    }

    const carreraInicial =
      carreras.find(
        (carrera) => Number(carrera.idCarrera) === Number(carreraInicialId),
      ) ?? carreras[0];

    const niveles = obtenerNiveles(carreraInicial);
    const preferido = Number(nivelInicial);
    const primerNivel = niveles.includes(preferido)
      ? preferido
      : (niveles[0] ?? null);

    const turnoPreferido = esTurno(carreraInicial.turnoPreferido)
      ? carreraInicial.turnoPreferido
      : null;

    initializedRef.current = true;
    setCarreraSeleccionadaId(Number(carreraInicial.idCarrera));
    setNivelSeleccionado(primerNivel);
    setTurnoSeleccionado(turnoPreferido);
    setParaleloSeleccionado(null);
    setAgregar([]);
    setQuitar([]);

    if (primerNivel) {
      void onLoadMaterias(Number(carreraInicial.idCarrera), primerNivel);
    }
  }, [
    visible,
    loading,
    estudiante,
    carreras,
    carreraInicialId,
    nivelInicial,
    onLoadMaterias,
  ]);

  const carreraSeleccionada = useMemo(
    () =>
      carreras.find(
        (carrera) =>
          Number(carrera.idCarrera) === Number(carreraSeleccionadaId),
      ) ?? null,
    [carreras, carreraSeleccionadaId],
  );

  const niveles = useMemo(
    () => obtenerNiveles(carreraSeleccionada),
    [carreraSeleccionada],
  );

  const notaMinima = toNumber(
    carreraSeleccionada?.notaAprobacion ?? notaAprobacion,
    51,
  );

  const carreraOptions = useMemo<SelectOption<number>[]>(
    () =>
      carreras.map((carrera) => ({
        label: carrera.nombreCarrera,
        value: Number(carrera.idCarrera),
        description: carrera.codigo || carrera.regimen || undefined,
        icon: "school-outline",
      })),
    [carreras],
  );

  const nivelOptions = useMemo<SelectOption<number>[]>(
    () =>
      niveles.map((nivel) => ({
        label: textoNivel(carreraSeleccionada, nivel),
        value: nivel,
        description: `Materias correspondientes al nivel ${nivel}`,
        icon: "layers-outline",
      })),
    [niveles, carreraSeleccionada],
  );

  const turnoOptions = useMemo<SelectOption<TurnoInscripcion>[]>(
    () =>
      TURNOS.map((turno) => ({
        label: turno,
        value: turno,
        description: `Mostrar grupos del turno ${turno}`,
        icon:
          turno === "Mañana"
            ? "sunny-outline"
            : turno === "Tarde"
              ? "partly-sunny-outline"
              : "moon-outline",
      })),
    [],
  );

  const paralelosDisponibles = useMemo<string[]>(() => {
    if (!turnoSeleccionado) return [];

    const paralelos = materias.flatMap((materia) =>
      (Array.isArray(materia.gruposDisponibles)
        ? materia.gruposDisponibles
        : []
      )
        .filter(
          (grupo) =>
            grupo.turno === turnoSeleccionado &&
            (toNumber(grupo.cupos) > 0 ||
              Boolean(grupo.estudianteYaEnGrupo)),
        )
        .map((grupo) => normalizarParalelo(grupo.paralelo))
        .filter(Boolean),
    );

    return Array.from(new Set(paralelos)).sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );
  }, [materias, turnoSeleccionado]);

  const paraleloOptions = useMemo<SelectOption<string>[]>(
    () =>
      paralelosDisponibles.map((paralelo) => ({
        label: `Paralelo ${paralelo}`,
        value: paralelo,
        description: `Mostrar materias disponibles del paralelo ${paralelo}`,
        icon: "git-branch-outline",
      })),
    [paralelosDisponibles],
  );

  useEffect(() => {
    if (
      paraleloSeleccionado &&
      !paralelosDisponibles.includes(paraleloSeleccionado)
    ) {
      setParaleloSeleccionado(null);
    }
  }, [paraleloSeleccionado, paralelosDisponibles]);

  const actualesPorMateria = useMemo(() => {
    const map = new Map<number, SeleccionMateriaInscripcion>();

    inscripcionesActuales
      .filter(
        (inscripcion) =>
          !carreraSeleccionadaId ||
          !inscripcion.idCarrera ||
          Number(inscripcion.idCarrera) === Number(carreraSeleccionadaId),
      )
      .forEach((inscripcion) => {
        const seleccion = inscripcionASeleccion(
          inscripcion,
          carreraSeleccionada,
        );

        if (seleccion) map.set(seleccion.idMateria, seleccion);
      });

    return map;
  }, [inscripcionesActuales, carreraSeleccionadaId, carreraSeleccionada]);

  const agregarPorMateria = useMemo(
    () => new Map(agregar.map((item) => [item.idMateria, item])),
    [agregar],
  );

  const quitarPorMateria = useMemo(
    () => new Map(quitar.map((item) => [item.idMateria, item])),
    [quitar],
  );

  const materiasVisuales = useMemo<MateriaVisual[]>(() => {
    if (!turnoSeleccionado || !paraleloSeleccionado) {
      return [];
    }

    const resultado: MateriaVisual[] = [];

    materias.forEach((materia) => {
      const idMateria = Number(materia.idMateria);
      const inscripcionActual = actualesPorMateria.get(idMateria) ?? null;
      const adicion = agregarPorMateria.get(idMateria) ?? null;
      const retiro = quitarPorMateria.get(idMateria) ?? null;
      const grupoDisponible = elegirGrupo(
        materia,
        turnoSeleccionado,
        paraleloSeleccionado,
      );

      /*
       * Solo se agregan materias que tienen un grupo real para el turno y
       * paralelo seleccionados. Al llegar a resultado.push(), TypeScript ya
       * sabe que grupoDisponible no es null.
       */
      if (!grupoDisponible) {
        return;
      }

      const seleccionFinal =
        adicion ?? (inscripcionActual && !retiro ? inscripcionActual : null);

      resultado.push({
        ...materia,
        inscripcionActual,
        adicion,
        retiro,
        grupoDisponible,
        seleccionFinal,
        marcada: Boolean(seleccionFinal),
        puedeAlternar:
          Boolean(inscripcionActual) ||
          Boolean(adicion) ||
          Boolean(retiro) ||
          Boolean(materia.seleccionable ?? true),
      });
    });

    return resultado;
  }, [
    materias,
    actualesPorMateria,
    agregarPorMateria,
    quitarPorMateria,
    turnoSeleccionado,
    paraleloSeleccionado,
  ]);

  const pendientes = Array.isArray(materiasPendientesAnteriores)
    ? materiasPendientesAnteriores
    : [];

  const cambiarCarrera = async (idCarrera: number) => {
    if (loadingMaterias || guardando) return;

    const carrera = carreras.find(
      (item) => Number(item.idCarrera) === Number(idCarrera),
    );
    if (!carrera) return;

    const nivelesCarrera = obtenerNiveles(carrera);
    const nuevoNivel = nivelesCarrera[0] ?? null;

    const turnoPreferido = esTurno(carrera.turnoPreferido)
      ? carrera.turnoPreferido
      : null;

    setCarreraSeleccionadaId(Number(idCarrera));
    setNivelSeleccionado(nuevoNivel);
    setTurnoSeleccionado(turnoPreferido);
    setParaleloSeleccionado(null);
    setAgregar([]);
    setQuitar([]);

    if (nuevoNivel) await onLoadMaterias(Number(idCarrera), nuevoNivel);
  };

  const cambiarNivel = async (nivel: number) => {
    if (
      !carreraSeleccionadaId ||
      loadingMaterias ||
      guardando ||
      Number(nivelSeleccionado) === Number(nivel)
    ) {
      return;
    }

    setNivelSeleccionado(Number(nivel));
    setParaleloSeleccionado(null);
    setAgregar([]);
    setQuitar([]);
    await onLoadMaterias(carreraSeleccionadaId, Number(nivel));
  };

  const cambiarTurno = (turno: TurnoInscripcion) => {
    if (guardando || loadingMaterias) return;

    setTurnoSeleccionado(turno);
    setParaleloSeleccionado(null);
    setAgregar([]);
    setQuitar([]);
  };

  const cambiarParalelo = (paralelo: string) => {
    if (guardando || loadingMaterias) return;

    setParaleloSeleccionado(normalizarParalelo(paralelo));
    setAgregar([]);
    setQuitar([]);
  };

  const alternarMateria = (materia: MateriaVisual) => {
    if (guardando || !materia.puedeAlternar) return;

    const idMateria = Number(materia.idMateria);

    if (materia.adicion) {
      setAgregar((actuales) =>
        actuales.filter((item) => item.idMateria !== idMateria),
      );
      return;
    }

    if (materia.inscripcionActual && !materia.retiro) {
      setQuitar((actuales) => [...actuales, materia.inscripcionActual!]);
      return;
    }

    if (materia.inscripcionActual && materia.retiro) {
      const mismoGrupo =
        materia.grupoDisponible &&
        Number(materia.grupoDisponible.idGrupoMateriaDocente) ===
          Number(materia.inscripcionActual.idGrupoMateriaDocente);

      if (!materia.grupoDisponible || mismoGrupo || !turnoSeleccionado) {
        setQuitar((actuales) =>
          actuales.filter((item) => item.idMateria !== idMateria),
        );
        return;
      }
    }

    if (
      !materia.grupoDisponible ||
      !turnoSeleccionado ||
      !nivelSeleccionado
    ) {
      return;
    }

    const seleccion = crearSeleccion(
      materia,
      materia.grupoDisponible,
      carreraSeleccionada,
      Number(nivelSeleccionado),
      turnoSeleccionado,
    );

    setAgregar((actuales) => [
      ...actuales.filter((item) => item.idMateria !== idMateria),
      seleccion,
    ]);
  };

  const totalCambios = agregar.length + quitar.length;
  const totalFinalNivel = materiasVisuales.filter((materia) => materia.marcada)
    .length;

  const abrirConfirmacion = () => {
    if (totalCambios === 0 || guardando) return;
    setConfirmacionVisible(true);
  };

  const confirmarDefinitivamente = async () => {
    if (!carreraSeleccionadaId || totalCambios === 0) return;
    await onConfirm(carreraSeleccionadaId, agregar, quitar);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={guardando ? undefined : onClose}
      >
        <View style={styles.backdrop}>
          <View
            style={[
              styles.modal,
              isMobile && styles.modalMobile,
              {
                height: Math.min(height * 0.94, 900),
                backgroundColor: modalBackground,
                borderColor,
              },
            ]}
          >
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
              <View style={styles.headerIdentity}>
                <View
                  style={[
                    styles.headerIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(239,68,68,0.16)"
                        : "#FEE2E2",
                    },
                  ]}
                >
                  <Ionicons
                    name="create-outline"
                    size={27}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.headerTextBox}>
                  <ThemedText style={[styles.title, { color: strongText }]}>
                    Editar inscripción
                  </ThemedText>
                  <ThemedText
                    numberOfLines={1}
                    style={[styles.studentName, { color: mutedText }]}
                  >
                    {nombreCompleto(estudiante)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.headerRight}>
                <View
                  style={[
                    styles.headerCounter,
                    {
                      backgroundColor: isDark
                        ? "rgba(59,130,246,0.16)"
                        : "#EFF6FF",
                    },
                  ]}
                >
                  <Ionicons
                    name="swap-horizontal-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <ThemedText
                    style={[
                      styles.headerCounterText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {totalCambios} cambio{totalCambios === 1 ? "" : "s"}
                  </ThemedText>
                </View>

                <Pressable
                  disabled={guardando}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    {
                      backgroundColor: panelStrong,
                      opacity: pressed || guardando ? 0.6 : 1,
                    },
                  ]}
                >
                  <Ionicons name="close" size={26} color={strongText} />
                </Pressable>
              </View>
            </View>

            {loading ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <ThemedText style={[styles.loadingTitle, { color: strongText }]}>
                  Cargando inscripción
                </ThemedText>
                <ThemedText style={[styles.loadingText, { color: mutedText }]}>
                  Revisando materias registradas y grupos disponibles.
                </ThemedText>
              </View>
            ) : (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator
              >
                <View
                  style={[
                    styles.configurationCard,
                    { backgroundColor: panelBackground, borderColor },
                  ]}
                >
                  <View style={styles.configurationHeader}>
                    <View style={styles.sectionHeading}>
                      <ThemedText
                        style={[styles.sectionTitle, { color: strongText }]}
                      >
                        Carrera, nivel, turno y paralelo
                      </ThemedText>
                      <ThemedText
                        style={[styles.sectionDescription, { color: mutedText }]}
                      >
                        Las materias inscritas permanecen marcadas. Desmárcalas
                        para retirarlas o marca nuevas para agregarlas.
                      </ThemedText>
                    </View>

                    <View
                      style={[
                        styles.minimumBadge,
                        {
                          backgroundColor: isDark
                            ? "rgba(245,158,11,0.13)"
                            : "#FFFBEB",
                        },
                      ]}
                    >
                      <Ionicons name="ribbon-outline" size={16} color="#D97706" />
                      <ThemedText style={styles.minimumBadgeText}>
                        Nota mínima {notaMinima}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.selectorsRow}>
                    <SelectDropdown<number>
                      label="Carrera"
                      value={carreraSeleccionadaId}
                      options={carreraOptions}
                      placeholder="Selecciona una carrera"
                      disabled={loadingMaterias || guardando}
                      icon="school-outline"
                      onChange={(value: number) => void cambiarCarrera(value)}
                    />

                    <SelectDropdown<number>
                      label="Nivel académico"
                      value={nivelSeleccionado}
                      options={nivelOptions}
                      placeholder="Selecciona un nivel"
                      disabled={
                        !carreraSeleccionadaId || loadingMaterias || guardando
                      }
                      icon="layers-outline"
                      onChange={(value: number) => void cambiarNivel(value)}
                    />

                    <SelectDropdown<TurnoInscripcion>
                      label="Turno"
                      value={turnoSeleccionado}
                      options={turnoOptions}
                      placeholder="Selecciona un turno"
                      disabled={loadingMaterias || guardando}
                      icon="time-outline"
                      onChange={cambiarTurno}
                    />

                    <SelectDropdown<string>
                      label="Paralelo"
                      value={paraleloSeleccionado}
                      options={paraleloOptions}
                      placeholder={
                        turnoSeleccionado
                          ? "Selecciona un paralelo"
                          : "Primero selecciona un turno"
                      }
                      disabled={
                        !turnoSeleccionado ||
                        paraleloOptions.length === 0 ||
                        loadingMaterias ||
                        guardando
                      }
                      icon="git-branch-outline"
                      onChange={cambiarParalelo}
                    />
                  </View>
                </View>

                {totalCambios > 0 && (
                  <View
                    style={[
                      styles.changesPanel,
                      { backgroundColor: panelBackground, borderColor },
                    ]}
                  >
                    <View style={styles.changesHeader}>
                      <View style={styles.sectionHeading}>
                        <ThemedText
                          style={[styles.sectionTitle, { color: strongText }]}
                        >
                          Cambios pendientes
                        </ThemedText>
                        <ThemedText
                          style={[styles.sectionDescription, { color: mutedText }]}
                        >
                          Se aplicarán únicamente después de confirmar.
                        </ThemedText>
                      </View>

                      <Pressable
                        disabled={guardando}
                        onPress={() => {
                          setAgregar([]);
                          setQuitar([]);
                        }}
                        style={({ pressed }) => [
                          styles.clearButton,
                          {
                            borderColor,
                            backgroundColor: panelStrong,
                            opacity: pressed ? 0.72 : 1,
                          },
                        ]}
                      >
                        <Ionicons name="refresh-outline" size={16} color="#EF4444" />
                        <ThemedText style={styles.clearText}>Deshacer</ThemedText>
                      </Pressable>
                    </View>

                    <View style={styles.changeCounters}>
                      <ChangeCounter
                        icon="add-circle-outline"
                        value={agregar.length}
                        label="Por agregar"
                        color="#16A34A"
                        isDark={isDark}
                      />
                      <ChangeCounter
                        icon="remove-circle-outline"
                        value={quitar.length}
                        label="Por retirar"
                        color="#DC2626"
                        isDark={isDark}
                      />
                    </View>
                  </View>
                )}

                {!loadingMaterias && pendientes.length > 0 && (
                  <View
                    style={[
                      styles.warningCard,
                      {
                        backgroundColor: isDark
                          ? "rgba(245,158,11,0.10)"
                          : "#FFFBEB",
                        borderColor: isDark
                          ? "rgba(245,158,11,0.34)"
                          : "#FDE68A",
                      },
                    ]}
                  >
                    <View style={styles.warningHeader}>
                      <Ionicons name="warning-outline" size={23} color="#F59E0B" />
                      <View style={styles.warningTextBox}>
                        <ThemedText
                          style={[styles.warningTitle, { color: strongText }]}
                        >
                          Pendientes de niveles anteriores
                        </ThemedText>
                        <ThemedText
                          style={[styles.warningDescription, { color: mutedText }]}
                        >
                          No bloquean la edición, pero aún no alcanzaron la nota
                          mínima.
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.pendingList}>
                      {pendientes.map((materia) => (
                        <View key={materia.idMateria} style={styles.pendingItem}>
                          <View style={styles.pendingDot} />
                          <View style={styles.pendingTextBox}>
                            <ThemedText
                              numberOfLines={1}
                              style={[styles.pendingName, { color: strongText }]}
                            >
                              {materia.nombreMateria}
                            </ThemedText>
                            <ThemedText
                              style={[styles.pendingMeta, { color: mutedText }]}
                            >
                              {textoNivel(
                                carreraSeleccionada,
                                Number(materia.semestre),
                              )} · {notaPendiente(materia)}
                            </ThemedText>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.subjectsHeader}>
                  <View style={styles.sectionHeading}>
                    <ThemedText
                      style={[styles.subjectsTitle, { color: strongText }]}
                    >
                      Materias de {textoNivel(carreraSeleccionada, nivelSeleccionado)}
                    </ThemedText>
                    <ThemedText
                      style={[styles.sectionDescription, { color: mutedText }]}
                    >
                      Selecciona turno y paralelo para mostrar únicamente las
                      materias disponibles de ese paralelo. Las inscritas pueden
                      retirarse o cambiarse de grupo.
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.levelCount,
                      {
                        backgroundColor: isDark
                          ? "rgba(59,130,246,0.14)"
                          : "#EFF6FF",
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.levelCountText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {totalFinalNivel} activa{totalFinalNivel === 1 ? "" : "s"}
                    </ThemedText>
                  </View>
                </View>

                {loadingMaterias ? (
                  <StateCard
                    icon="sync-outline"
                    color={theme.colors.primary}
                    title="Cargando materias"
                    description="Revisando grupos, cupos e inscripciones registradas."
                    backgroundColor={panelBackground}
                    borderColor={borderColor}
                    strongText={strongText}
                    mutedText={mutedText}
                    loading
                  />
                ) : !turnoSeleccionado ? (
                  <StateCard
                    icon="time-outline"
                    color={theme.colors.primary}
                    title="Selecciona un turno"
                    description="Elige Mañana, Tarde o Noche para consultar sus paralelos disponibles."
                    backgroundColor={panelBackground}
                    borderColor={borderColor}
                    strongText={strongText}
                    mutedText={mutedText}
                  />
                ) : !paraleloSeleccionado ? (
                  <StateCard
                    icon="git-branch-outline"
                    color={theme.colors.primary}
                    title="Selecciona un paralelo"
                    description={
                      paraleloOptions.length > 0
                        ? "Elige el paralelo al que se inscribirá el estudiante."
                        : "No existen paralelos con cupos para el turno seleccionado."
                    }
                    backgroundColor={panelBackground}
                    borderColor={borderColor}
                    strongText={strongText}
                    mutedText={mutedText}
                  />
                ) : materiasVisuales.length === 0 ? (
                  <StateCard
                    icon="file-tray-outline"
                    color={mutedText}
                    title="No hay materias en este paralelo"
                    description={`No existen materias disponibles para el turno ${turnoSeleccionado} y paralelo ${paraleloSeleccionado}.`}
                    backgroundColor={panelBackground}
                    borderColor={borderColor}
                    strongText={strongText}
                    mutedText={mutedText}
                  />
                ) : (
                  <View
                    style={[
                      styles.subjectGrid,
                      isTablet && styles.subjectGridTablet,
                      isMobile && styles.subjectGridMobile,
                    ]}
                  >
                    {materiasVisuales.map((materia) => {
                      const retirada = Boolean(materia.retiro && !materia.adicion);
                      const cambiada = Boolean(materia.retiro && materia.adicion);
                      const agregada = Boolean(materia.adicion && !materia.inscripcionActual);
                      const inscrita = Boolean(
                        materia.inscripcionActual &&
                          !materia.retiro &&
                          !materia.adicion,
                      );

                      const estado = cambiada
                        ? "Cambiará de grupo"
                        : retirada
                          ? "Se retirará"
                          : agregada
                            ? "Se agregará"
                            : inscrita
                              ? "Inscrita"
                              : "Disponible";

                      const estadoColor = cambiada
                        ? "#7C3AED"
                        : retirada
                          ? "#DC2626"
                          : agregada
                            ? "#16A34A"
                            : inscrita
                              ? "#059669"
                              : theme.colors.primary;

                      const seleccionMostrada =
                        materia.adicion ??
                        materia.inscripcionActual ??
                        (materia.grupoDisponible && turnoSeleccionado && nivelSeleccionado
                          ? crearSeleccion(
                              materia,
                              materia.grupoDisponible,
                              carreraSeleccionada,
                              Number(nivelSeleccionado),
                              turnoSeleccionado,
                            )
                          : null);

                      return (
                        <Pressable
                          key={materia.idMateria}
                          disabled={!materia.puedeAlternar || guardando}
                          onPress={() => alternarMateria(materia)}
                          style={({ pressed }) => [
                            styles.subjectCard,
                            isTablet && styles.subjectCardTablet,
                            isMobile && styles.subjectCardMobile,
                            {
                              backgroundColor: materia.marcada
                                ? isDark
                                  ? "rgba(5,150,105,0.12)"
                                  : "#ECFDF5"
                                : retirada
                                  ? isDark
                                    ? "rgba(220,38,38,0.10)"
                                    : "#FEF2F2"
                                  : panelBackground,
                              borderColor: materia.marcada
                                ? "#10B981"
                                : retirada
                                  ? "#EF4444"
                                  : borderColor,
                              opacity:
                                !materia.puedeAlternar || guardando
                                  ? 0.55
                                  : pressed
                                    ? 0.78
                                    : 1,
                            },
                          ]}
                        >
                          <View style={styles.subjectTop}>
                            <View
                              style={[
                                styles.subjectIcon,
                                { backgroundColor: `${estadoColor}20` },
                              ]}
                            >
                              <Ionicons
                                name={
                                  retirada
                                    ? "remove-outline"
                                    : materia.marcada
                                      ? "checkmark-done-outline"
                                      : "book-outline"
                                }
                                size={22}
                                color={estadoColor}
                              />
                            </View>

                            <View style={styles.subjectTitleBox}>
                              <ThemedText
                                numberOfLines={2}
                                style={[styles.subjectName, { color: strongText }]}
                              >
                                {materia.nombreMateria}
                              </ThemedText>
                              <ThemedText
                                style={[styles.subjectCode, { color: mutedText }]}
                              >
                                {materia.codigoMateria}
                              </ThemedText>
                            </View>

                            <View
                              style={[
                                styles.checkBox,
                                {
                                  backgroundColor: materia.marcada
                                    ? "#10B981"
                                    : "transparent",
                                  borderColor: retirada
                                    ? "#EF4444"
                                    : materia.marcada
                                      ? "#10B981"
                                      : borderColor,
                                },
                              ]}
                            >
                              {materia.marcada && (
                                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                              )}
                            </View>
                          </View>

                          <View
                            style={[
                              styles.statusPill,
                              { backgroundColor: `${estadoColor}18` },
                            ]}
                          >
                            <ThemedText
                              style={[styles.statusPillText, { color: estadoColor }]}
                            >
                              {estado}
                            </ThemedText>
                          </View>

                          {seleccionMostrada ? (
                            <View style={styles.groupMeta}>
                              <MetaItem
                                icon="layers-outline"
                                text={seleccionMostrada.nivelLabel}
                                color={mutedText}
                              />
                              <MetaItem
                                icon="time-outline"
                                text={seleccionMostrada.turno}
                                color={mutedText}
                              />
                              <MetaItem
                                icon="people-outline"
                                text={`${seleccionMostrada.nombreGrupo} · Paralelo ${seleccionMostrada.paralelo}`}
                                color={mutedText}
                              />
                              <MetaItem
                                icon="calendar-outline"
                                text={`Inicio materia: ${formatearFechaMateria(
                                  seleccionMostrada.fechaInicio,
                                )}`}
                                color={mutedText}
                              />
                              <MetaItem
                                icon="calendar-number-outline"
                                text={`Fin materia: ${formatearFechaMateria(
                                  seleccionMostrada.fechaFin,
                                )}`}
                                color={mutedText}
                              />
                            </View>
                          ) : (
                            <ThemedText
                              style={[styles.noGroupText, { color: mutedText }]}
                            >
                              {turnoSeleccionado && paraleloSeleccionado
                                ? materia.motivoNoSeleccionable ??
                                  "No existe un grupo utilizable para este turno y paralelo."
                                : "Selecciona turno y paralelo para agregar esta materia."}
                            </ThemedText>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            )}

            <View
              style={[
                styles.footer,
                isMobile && styles.footerMobile,
                { borderTopColor: borderColor },
              ]}
            >
              <View style={styles.footerInfo}>
                <ThemedText style={[styles.footerTitle, { color: strongText }]}>
                  {totalCambios === 0
                    ? "La inscripción está sin cambios"
                    : `${totalCambios} cambio${totalCambios === 1 ? "" : "s"} pendiente${
                        totalCambios === 1 ? "" : "s"
                      }`}
                </ThemedText>
                <ThemedText
                  style={[styles.footerDescription, { color: mutedText }]}
                >
                  Puedes volver a editarla después de guardar.
                </ThemedText>
              </View>

              <View style={styles.footerActions}>
                <Pressable
                  disabled={guardando}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    {
                      backgroundColor: panelStrong,
                      borderColor,
                      opacity: pressed || guardando ? 0.62 : 1,
                    },
                  ]}
                >
                  <ThemedText
                    style={[styles.cancelButtonText, { color: strongText }]}
                  >
                    Cancelar
                  </ThemedText>
                </Pressable>

                <Pressable
                  disabled={totalCambios === 0 || guardando}
                  onPress={abrirConfirmacion}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity:
                        totalCambios === 0 || guardando
                          ? 0.5
                          : pressed
                            ? 0.8
                            : 1,
                    },
                  ]}
                >
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.confirmButtonText}>
                    Revisar cambios ({totalCambios})
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmarInscripcionModal
        visible={confirmacionVisible}
        estudiante={estudiante}
        nombreCarrera={carreraSeleccionada?.nombreCarrera ?? ""}
        agregar={agregar}
        quitar={quitar}
        guardando={guardando}
        onClose={() => setConfirmacionVisible(false)}
        onConfirm={confirmarDefinitivamente}
      />
    </>
  );
}

function ChangeCounter({
  icon,
  value,
  label,
  color,
  isDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  color: string;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.changeCounter,
        { backgroundColor: isDark ? `${color}1C` : `${color}10` },
      ]}
    >
      <Ionicons name={icon} size={18} color={color} />
      <ThemedText style={[styles.changeCounterValue, { color }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.changeCounterLabel, { color }]}>
        {label}
      </ThemedText>
    </View>
  );
}

function MetaItem({
  icon,
  text,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={color} />
      <ThemedText numberOfLines={1} style={[styles.metaText, { color }]}>
        {text}
      </ThemedText>
    </View>
  );
}

function StateCard({
  icon,
  color,
  title,
  description,
  backgroundColor,
  borderColor,
  strongText,
  mutedText,
  loading = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  description: string;
  backgroundColor: string;
  borderColor: string;
  strongText: string;
  mutedText: string;
  loading?: boolean;
}) {
  return (
    <View style={[styles.stateCard, { backgroundColor, borderColor }]}>
      <View style={[styles.stateIcon, { backgroundColor: `${color}20` }]}>
        {loading ? (
          <ActivityIndicator color={color} size="small" />
        ) : (
          <Ionicons name={icon} size={28} color={color} />
        )}
      </View>
      <ThemedText style={[styles.stateTitle, { color: strongText }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.stateDescription, { color: mutedText }]}>
        {description}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.80)",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  modal: {
    width: "96%",
    maxWidth: 1500,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 20,
  },
  modalMobile: {
    width: "100%",
    borderRadius: 20,
  },
  header: {
    minHeight: 100,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headerIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBox: { flex: 1, minWidth: 0 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  studentName: { marginTop: 4, fontSize: 14, fontWeight: "900" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerCounter: {
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerCounterText: { fontSize: 13, fontWeight: "900" },
  closeButton: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingTitle: { marginTop: 16, fontSize: 20, fontWeight: "900" },
  loadingText: { marginTop: 6, fontSize: 13, fontWeight: "700", textAlign: "center" },
  scroll: { flex: 1 },
  scrollContent: { padding: 22, gap: 18 },
  configurationCard: { borderWidth: 1, borderRadius: 22, padding: 18 },
  configurationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 16,
  },
  sectionHeading: { flex: 1, minWidth: 0 },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  sectionDescription: { marginTop: 4, fontSize: 12.5, lineHeight: 18, fontWeight: "700" },
  minimumBadge: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  minimumBadgeText: { color: "#D97706", fontSize: 11.5, fontWeight: "900" },
  selectorsRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  changesPanel: { borderWidth: 1, borderRadius: 20, padding: 16 },
  changesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  clearButton: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clearText: { color: "#EF4444", fontSize: 11.5, fontWeight: "900" },
  changeCounters: { marginTop: 14, flexDirection: "row", gap: 10, flexWrap: "wrap" },
  changeCounter: {
    minHeight: 42,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  changeCounterValue: { fontSize: 16, fontWeight: "900" },
  changeCounterLabel: { fontSize: 11.5, fontWeight: "900" },
  warningCard: { borderWidth: 1, borderRadius: 20, padding: 16 },
  warningHeader: { flexDirection: "row", alignItems: "flex-start", gap: 11 },
  warningTextBox: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: "900" },
  warningDescription: { marginTop: 3, fontSize: 11.5, lineHeight: 16, fontWeight: "700" },
  pendingList: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pendingItem: {
    minWidth: 220,
    flexGrow: 1,
    flexBasis: 260,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "rgba(245,158,11,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  pendingDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "#F59E0B" },
  pendingTextBox: { flex: 1, minWidth: 0 },
  pendingName: { fontSize: 11.5, fontWeight: "900" },
  pendingMeta: { marginTop: 2, fontSize: 10.5, fontWeight: "700" },
  subjectsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  subjectsTitle: { fontSize: 20, fontWeight: "900" },
  levelCount: { borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9 },
  levelCountText: { fontSize: 11.5, fontWeight: "900" },
  subjectGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  subjectGridTablet: {},
  subjectGridMobile: { flexDirection: "column" },
  subjectCard: {
    width: "32.35%",
    minHeight: 205,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  subjectCardTablet: { width: "48.8%" },
  subjectCardMobile: { width: "100%" },
  subjectTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectTitleBox: { flex: 1, minWidth: 0 },
  subjectName: { fontSize: 15, lineHeight: 20, fontWeight: "900" },
  subjectCode: { marginTop: 3, fontSize: 11.5, fontWeight: "800" },
  checkBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    alignSelf: "flex-start",
    marginTop: 20,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusPillText: { fontSize: 10.5, fontWeight: "900" },
  groupMeta: { marginTop: 13, gap: 7 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { flex: 1, fontSize: 10.5, fontWeight: "800" },
  noGroupText: { marginTop: 14, fontSize: 10.5, lineHeight: 15, fontWeight: "700" },
  stateCard: {
    minHeight: 230,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  stateIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: { marginTop: 14, fontSize: 18, fontWeight: "900" },
  stateDescription: { marginTop: 5, fontSize: 12.5, fontWeight: "700", textAlign: "center" },
  footer: {
    minHeight: 94,
    borderTopWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  footerMobile: { flexDirection: "column", alignItems: "stretch" },
  footerInfo: { flex: 1, minWidth: 0 },
  footerTitle: { fontSize: 13.5, fontWeight: "900" },
  footerDescription: { marginTop: 3, fontSize: 11, fontWeight: "700" },
  footerActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelButton: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: { fontSize: 13, fontWeight: "900" },
  confirmButton: {
    minHeight: 50,
    borderRadius: 15,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
});