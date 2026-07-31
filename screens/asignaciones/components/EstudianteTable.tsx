import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
  CarreraAsignacion,
  Estudiante,
  TurnoInscripcion,
} from "../types/asignaciones.types";

type Props = {
  estudiantes: Estudiante[];
  carreras: CarreraAsignacion[];
  carreraSeleccionadaId: number | null;
  nivelSeleccionadoId: number | null;
  loading: boolean;
  loadingCarreras: boolean;
  onSeleccionarCarrera: (
    idCarrera: number,
    nivel?: number | null,
  ) => Promise<void> | void;
  onInscribir: (estudiante: Estudiante) => void;
  onVerPdf: (estudiante: Estudiante) => void;
};

type FiltroCuotas = "todos" | "sinCuotas" | "conCuotas" | "condonadas";
type FiltroTurno = "todos" | TurnoInscripcion;

const TURNOS: TurnoInscripcion[] = ["Mañana", "Tarde", "Noche"];

type EstadoVisual = {
  key: "completo" | "agregar" | "pendientes" | "listo" | "revision";
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  border: string;
  avatarBg: string;
};

const ITEMS_PER_PAGE = 10;

function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function tienePlanCuotasGestion(estudiante: Estudiante): boolean {
  if (toBoolean(estudiante.requiereCuotasGestion)) return false;
  return toBoolean(estudiante.tieneCuotasGestion);
}

function totalCondonadasGestion(estudiante: Estudiante): number {
  return Math.max(Number(estudiante.totalCuotasCondonadasGestion ?? 0), 0);
}

function obtenerTurnoEstudiante(
  estudiante: Estudiante,
): TurnoInscripcion | null {
  const turno = estudiante.turnoEstudiante ?? estudiante.turnoPreferido;

  return TURNOS.includes(turno as TurnoInscripcion)
    ? (turno as TurnoInscripcion)
    : null;
}

function nombreCompleto(estudiante: Estudiante): string {
  return `${estudiante.nombres ?? ""} ${estudiante.apellidoPaterno ?? ""} ${
    estudiante.apellidoMaterno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();
}

function iniciales(nombre: string): string {
  const partes = nombre.split(" ").filter(Boolean);
  if (partes.length === 0) return "E";
  if (partes.length === 1) return partes[0].slice(0, 1).toUpperCase();
  return `${partes[0].slice(0, 1)}${partes[1].slice(0, 1)}`.toUpperCase();
}

function formatearFecha(fecha?: string | null): string {
  if (!fecha) return "Sin fecha";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) return fecha;

  const limpia = String(fecha).split("T")[0].split(" ")[0];
  const partes = limpia.split("-");

  if (partes.length !== 3) return limpia;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function nivelesCarrera(carrera: CarreraAsignacion | null): number[] {
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

function labelNivel(
  carrera: CarreraAsignacion | null,
  nivel: number | null,
): string {
  if (!nivel) return "Seleccionar nivel";

  const tipoNivel = String(carrera?.tipoNivel ?? "").trim();
  if (tipoNivel) return `${tipoNivel} ${nivel}`;

  const regimen = String(carrera?.regimen ?? "").toUpperCase();
  if (regimen.includes("ANUAL")) return `Año ${nivel}`;
  if (regimen.includes("MENSUAL")) return `Mes ${nivel}`;

  return `Semestre ${nivel}`;
}

function estadoVisual(
  estudiante: Estudiante,
  isDark: boolean,
  primary: string,
): EstadoVisual {
  const completo = toBoolean(estudiante.inscripcionCompletaNivel);
  const inscrito = toBoolean(estudiante.yaInscrito);
  const puede = toBoolean(estudiante.puedeInscribir);
  const pendientes = Number(estudiante.materiasPendientesAnterioresCount ?? 0);
  const inscritas = Number(estudiante.totalMateriasInscritasNivel ?? 0);
  const disponibles = Number(estudiante.totalMateriasDisponiblesNivel ?? 0);

  if (completo) {
    return {
      key: "completo",
      label: "Nivel completo",
      description: `${inscritas} materia${inscritas === 1 ? "" : "s"} inscrita${
        inscritas === 1 ? "" : "s"} · inscripción editable`,
      icon: "checkmark-done-circle",
      color: isDark ? "#86EFAC" : "#15803D",
      background: isDark ? "rgba(22,163,74,0.17)" : "#DCFCE7",
      border: isDark ? "rgba(74,222,128,0.42)" : "#86EFAC",
      avatarBg: isDark ? "rgba(74,222,128,0.22)" : "#BBF7D0",
    };
  }

  if (inscrito && puede) {
    return {
      key: "agregar",
      label: "Puede agregar materias",
      description: `${inscritas} inscrita${inscritas === 1 ? "" : "s"} · ${
        disponibles
      } disponible${disponibles === 1 ? "" : "s"}`,
      icon: "checkbox-outline",
      color: isDark ? "#C4B5FD" : "#6D28D9",
      background: isDark ? "rgba(124,58,237,0.16)" : "#EDE9FE",
      border: isDark ? "rgba(196,181,253,0.42)" : "#C4B5FD",
      avatarBg: isDark ? "rgba(124,58,237,0.23)" : "#DDD6FE",
    };
  }

  if (puede && pendientes > 0) {
    return {
      key: "pendientes",
      label: "Con pendientes anteriores",
      description: `${pendientes} materia${pendientes === 1 ? "" : "s"} sin nota aprobatoria`,
      icon: "warning",
      color: isDark ? "#FBBF24" : "#B45309",
      background: isDark ? "rgba(245,158,11,0.18)" : "#FEF3C7",
      border: isDark ? "rgba(251,191,36,0.48)" : "#FCD34D",
      avatarBg: isDark ? "rgba(245,158,11,0.23)" : "#FDE68A",
    };
  }

  if (puede) {
    return {
      key: "listo",
      label: "Listo para inscribirse",
      description: `${disponibles} materia${disponibles === 1 ? "" : "s"} disponible${
        disponibles === 1 ? "" : "s"
      }`,
      icon: "school",
      color: primary,
      background: isDark ? "rgba(59,130,246,0.18)" : "#DBEAFE",
      border: isDark ? "rgba(96,165,250,0.45)" : "#93C5FD",
      avatarBg: isDark ? "rgba(59,130,246,0.22)" : "#BFDBFE",
    };
  }

  return {
    key: "revision",
    label: "Sin materias disponibles",
    description: "Revise grupos, cupos o gestión activa",
    icon: "alert-circle-outline",
    color: isDark ? "#CBD5E1" : "#64748B",
    background: isDark ? "rgba(255,255,255,0.055)" : "#F1F5F9",
    border: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1",
    avatarBg: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
  };
}

export default function EstudiantesTable({
  estudiantes,
  carreras,
  carreraSeleccionadaId,
  nivelSeleccionadoId,
  loading,
  loadingCarreras,
  onSeleccionarCarrera,
  onInscribir,
  onVerPdf,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const isCompact = width < 1120;

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");
  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const softCard = isDark
    ? "rgba(255,255,255,0.045)"
    : "rgba(15,23,42,0.035)";
  const softHeader = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(15,23,42,0.06)";
  const border = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(15,23,42,0.10)";

  const [search, setSearch] = useState("");
  const [filtroCuotas, setFiltroCuotas] = useState<FiltroCuotas>("todos");
  const [filtroTurno, setFiltroTurno] = useState<FiltroTurno>("todos");
  const [page, setPage] = useState(1);
  const [modalCarreraVisible, setModalCarreraVisible] = useState(false);
  const [modalNivelVisible, setModalNivelVisible] = useState(false);
  const [modalTurnoVisible, setModalTurnoVisible] = useState(false);
  const [seleccionandoCarreraId, setSeleccionandoCarreraId] = useState<
    number | null
  >(null);

  const carreraSeleccionada = useMemo(() => {
    return (
      carreras.find(
        (carrera) =>
          Number(carrera.idCarrera) === Number(carreraSeleccionadaId),
      ) ?? null
    );
  }, [carreras, carreraSeleccionadaId]);

  const niveles = useMemo(
    () => nivelesCarrera(carreraSeleccionada),
    [carreraSeleccionada],
  );

  useEffect(() => {
    setSearch("");
    setFiltroCuotas("todos");
    setFiltroTurno("todos");
    setPage(1);
  }, [carreraSeleccionadaId, nivelSeleccionadoId]);

  const resumen = useMemo(() => {
    return estudiantes.reduce(
      (acc, estudiante) => {
        const visual = estadoVisual(
          estudiante,
          isDark,
          theme.colors.primary,
        );
        const tieneCuotas = tienePlanCuotasGestion(estudiante);
        const condonadas = totalCondonadasGestion(estudiante);

        acc[visual.key] += 1;
        acc[tieneCuotas ? "conCuotas" : "sinCuotas"] += 1;

        if (condonadas > 0) {
          acc.condonadas += 1;
        }

        const turno = obtenerTurnoEstudiante(estudiante);

        if (turno === "Mañana") acc.manana += 1;
        if (turno === "Tarde") acc.tarde += 1;
        if (turno === "Noche") acc.noche += 1;
        if (!turno) acc.sinTurno += 1;

        return acc;
      },
      {
        completo: 0,
        agregar: 0,
        pendientes: 0,
        listo: 0,
        revision: 0,
        conCuotas: 0,
        sinCuotas: 0,
        condonadas: 0,
        manana: 0,
        tarde: 0,
        noche: 0,
        sinTurno: 0,
      },
    );
  }, [estudiantes, isDark, theme.colors.primary]);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    return estudiantes.filter((estudiante) => {
      const visual = estadoVisual(
        estudiante,
        isDark,
        theme.colors.primary,
      );
      const tieneCuotas = tienePlanCuotasGestion(estudiante);
      const condonadas = totalCondonadasGestion(estudiante);
      const turno = obtenerTurnoEstudiante(estudiante);

      const coincideTurno =
        filtroTurno === "todos" || turno === filtroTurno;

      const coincideFiltro =
        filtroCuotas === "todos" ||
        (filtroCuotas === "sinCuotas" && !tieneCuotas) ||
        (filtroCuotas === "conCuotas" && tieneCuotas) ||
        (filtroCuotas === "condonadas" && condonadas > 0);

      if (!coincideFiltro || !coincideTurno) return false;
      if (!q) return true;

      const estadoCuotas = !tieneCuotas
        ? "sin cuotas de gestión"
        : condonadas > 0
          ? `cuotas registradas ${condonadas} condonadas`
          : "cuotas registradas";

      return [
        nombreCompleto(estudiante),
        estudiante.ci,
        estudiante.matricula,
        estudiante.email,
        estudiante.celular,
        visual.label,
        visual.description,
        estadoCuotas,
        turno ?? "sin turno",
      ].some((value) => String(value ?? "").toLowerCase().includes(q));
    });
  }, [
    estudiantes,
    search,
    filtroCuotas,
    filtroTurno,
    isDark,
    theme.colors.primary,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const estudiantesPagina = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtrados.slice(start, start + ITEMS_PER_PAGE);
  }, [filtrados, currentPage]);

  const seleccionarCarrera = async (idCarrera: number) => {
    const carrera = carreras.find(
      (item) => Number(item.idCarrera) === Number(idCarrera),
    );
    const nivel = nivelesCarrera(carrera ?? null)[0] ?? null;

    try {
      setSeleccionandoCarreraId(idCarrera);
      await onSeleccionarCarrera(idCarrera, nivel);
      setModalCarreraVisible(false);
    } finally {
      setSeleccionandoCarreraId(null);
    }
  };

  const seleccionarNivel = async (nivel: number) => {
    if (!carreraSeleccionadaId) return;

    await onSeleccionarCarrera(carreraSeleccionadaId, nivel);
    setModalNivelVisible(false);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: border,
        },
      ]}
    >
      <View style={styles.toolbar}>
        <View style={styles.toolbarTitleBox}>
          <View
            style={[
              styles.toolbarIcon,
              {
                backgroundColor: isDark
                  ? "rgba(59,130,246,0.18)"
                  : "#DBEAFE",
              },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={23}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.toolbarTitleText}>
            <ThemedText style={[styles.title, { color: strongText }]}>
              Estudiantes por nivel
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: mutedText }]}>
              Los estudiantes que todavía pueden agregar materias se mantienen
              disponibles en la lista.
            </ThemedText>
          </View>
        </View>

        <View style={styles.filterActions}>
          <Pressable
            onPress={() => setModalCarreraVisible(true)}
            style={({ pressed }) => [
              styles.filterButton,
              {
                backgroundColor: softCard,
                borderColor: carreraSeleccionada
                  ? theme.colors.primary
                  : border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons
              name="school-outline"
              size={18}
              color={carreraSeleccionada ? theme.colors.primary : mutedText}
            />
            <View style={styles.filterTextBox}>
              <ThemedText style={[styles.filterLabel, { color: mutedText }]}>
                Carrera
              </ThemedText>
              <ThemedText
                numberOfLines={1}
                style={[styles.filterValue, { color: strongText }]}
              >
                {carreraSeleccionada?.nombreCarrera ?? "Seleccionar carrera"}
              </ThemedText>
            </View>
            <Ionicons name="chevron-down" size={18} color={mutedText} />
          </Pressable>

          <Pressable
            disabled={!carreraSeleccionada || niveles.length === 0}
            onPress={() => setModalNivelVisible(true)}
            style={({ pressed }) => [
              styles.filterButton,
              {
                backgroundColor: softCard,
                borderColor: nivelSeleccionadoId
                  ? theme.colors.primary
                  : border,
                opacity:
                  !carreraSeleccionada || niveles.length === 0
                    ? 0.5
                    : pressed
                      ? 0.8
                      : 1,
              },
            ]}
          >
            <Ionicons
              name="layers-outline"
              size={18}
              color={nivelSeleccionadoId ? theme.colors.primary : mutedText}
            />
            <View style={styles.filterTextBox}>
              <ThemedText style={[styles.filterLabel, { color: mutedText }]}>
                Nivel
              </ThemedText>
              <ThemedText
                numberOfLines={1}
                style={[styles.filterValue, { color: strongText }]}
              >
                {labelNivel(carreraSeleccionada, nivelSeleccionadoId)}
              </ThemedText>
            </View>
            <Ionicons name="chevron-down" size={18} color={mutedText} />
          </Pressable>

          <Pressable
            disabled={!carreraSeleccionadaId || !nivelSeleccionadoId}
            onPress={() => setModalTurnoVisible(true)}
            style={({ pressed }) => [
              styles.filterButton,
              {
                backgroundColor: softCard,
                borderColor:
                  filtroTurno !== "todos" ? theme.colors.primary : border,
                opacity:
                  !carreraSeleccionadaId || !nivelSeleccionadoId
                    ? 0.5
                    : pressed
                      ? 0.8
                      : 1,
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={
                filtroTurno !== "todos" ? theme.colors.primary : mutedText
              }
            />
            <View style={styles.filterTextBox}>
              <ThemedText style={[styles.filterLabel, { color: mutedText }]}>
                Turno
              </ThemedText>
              <ThemedText
                numberOfLines={1}
                style={[styles.filterValue, { color: strongText }]}
              >
                {filtroTurno === "todos" ? "Todos los turnos" : filtroTurno}
              </ThemedText>
            </View>
            <Ionicons name="chevron-down" size={18} color={mutedText} />
          </Pressable>
        </View>
      </View>

      {carreraSeleccionada && nivelSeleccionadoId && (
        <View style={styles.summaryRow}>
          <SummaryChip
            icon="checkmark-done-circle"
            label="Completos"
            value={resumen.completo}
            color={isDark ? "#86EFAC" : "#15803D"}
            backgroundColor={isDark ? "rgba(22,163,74,0.15)" : "#DCFCE7"}
          />
          <SummaryChip
            icon="warning"
            label="Con pendientes"
            value={resumen.pendientes}
            color={isDark ? "#FBBF24" : "#B45309"}
            backgroundColor={isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7"}
          />
          <SummaryChip
            icon="school"
            label="Listos"
            value={resumen.listo}
            color={theme.colors.primary}
            backgroundColor={isDark ? "rgba(59,130,246,0.15)" : "#DBEAFE"}
          />
          <SummaryChip
            icon="wallet-outline"
            label="Sin cuotas"
            value={resumen.sinCuotas}
            color={isDark ? "#FCA5A5" : "#B91C1C"}
            backgroundColor={isDark ? "rgba(239,68,68,0.16)" : "#FEE2E2"}
          />
        </View>
      )}

      {carreraSeleccionada && nivelSeleccionadoId && (
        <View style={styles.quotaFilterSection}>
          <View style={styles.quotaFilterHeading}>
            <Ionicons name="wallet-outline" size={18} color={mutedText} />
            <ThemedText style={[styles.quotaFilterTitle, { color: strongText }]}> 
              Estado de cuotas de la gestión
            </ThemedText>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quotaFilterScroll}
          >
            <QuotaFilterButton
              active={filtroCuotas === "todos"}
              label="Todos"
              value={estudiantes.length}
              icon="people-outline"
              color={theme.colors.primary}
              backgroundColor={softCard}
              borderColor={border}
              onPress={() => {
                setFiltroCuotas("todos");
                setPage(1);
              }}
            />
            <QuotaFilterButton
              active={filtroCuotas === "sinCuotas"}
              label="Sin cuotas"
              value={resumen.sinCuotas}
              icon="alert-circle-outline"
              color="#DC2626"
              backgroundColor={softCard}
              borderColor={border}
              onPress={() => {
                setFiltroCuotas("sinCuotas");
                setPage(1);
              }}
            />
            <QuotaFilterButton
              active={filtroCuotas === "conCuotas"}
              label="Con cuotas"
              value={resumen.conCuotas}
              icon="checkmark-circle-outline"
              color="#16A34A"
              backgroundColor={softCard}
              borderColor={border}
              onPress={() => {
                setFiltroCuotas("conCuotas");
                setPage(1);
              }}
            />
            <QuotaFilterButton
              active={filtroCuotas === "condonadas"}
              label="Con condonación"
              value={resumen.condonadas}
              icon="gift-outline"
              color="#D97706"
              backgroundColor={softCard}
              borderColor={border}
              onPress={() => {
                setFiltroCuotas("condonadas");
                setPage(1);
              }}
            />
          </ScrollView>
        </View>
      )}

      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: softCard, borderColor: border },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={mutedText} />
          <TextInput
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Buscar por nombre, CI, matrícula, turno, estado o cuotas..."
            placeholderTextColor={mutedText}
            style={[styles.searchInput, { color: strongText }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={mutedText} />
            </Pressable>
          )}
        </View>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: softCard,
              borderColor: border,
            },
          ]}
        >
          <ThemedText style={[styles.countText, { color: strongText }]}>
            {filtrados.length}
          </ThemedText>
          <ThemedText style={[styles.countLabel, { color: mutedText }]}>
            resultado{filtrados.length === 1 ? "" : "s"}
          </ThemedText>
        </View>
      </View>

      {!carreraSeleccionadaId || !nivelSeleccionadoId ? (
        <EmptyState
          icon="options-outline"
          title="Selecciona carrera y nivel"
          text="Usa los filtros superiores para cargar los estudiantes del semestre, año o mes que deseas gestionar."
          color={theme.colors.primary}
          backgroundColor={softCard}
          borderColor={border}
          strongText={strongText}
          mutedText={mutedText}
        />
      ) : loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={[styles.loadingTitle, { color: strongText }]}>
            Cargando estudiantes
          </ThemedText>
          <ThemedText style={[styles.loadingText, { color: mutedText }]}>
            Revisando inscripciones y materias pendientes del nivel.
          </ThemedText>
        </View>
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No hay estudiantes"
          text={
            search
              ? "No existen coincidencias con la búsqueda realizada."
              : "No existen estudiantes con materias inscritas o disponibles en este nivel."
          }
          color="#F59E0B"
          backgroundColor={softCard}
          borderColor={border}
          strongText={strongText}
          mutedText={mutedText}
        />
      ) : (
        <>
          <View
            style={[
              styles.tableShell,
              {
                borderColor: border,
                backgroundColor: isDark
                  ? "rgba(15,23,42,0.42)"
                  : "rgba(248,250,252,0.65)",
              },
            ]}
          >
            {!isMobile && (
              <View
                style={[
                  styles.tableHeader,
                  { backgroundColor: softHeader, borderColor: border },
                ]}
              >
                {isCompact ? (
                  <>
                    <ThemedText
                      style={[
                        styles.th,
                        styles.thStudentCompact,
                        { color: mutedText },
                      ]}
                    >
                      Estudiante
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.th,
                        styles.thDataCompact,
                        { color: mutedText },
                      ]}
                    >
                      Registro y estado
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.th,
                        styles.thActionsCompact,
                        { color: mutedText },
                      ]}
                    >
                      Acciones
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <ThemedText
                      style={[styles.th, styles.thCi, { color: mutedText }]}
                    >
                      CI
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.th,
                        styles.thMatricula,
                        { color: mutedText },
                      ]}
                    >
                      Matrícula
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.th,
                        styles.thStudent,
                        { color: mutedText },
                      ]}
                    >
                      Estudiante
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.th,
                        styles.thStatus,
                        { color: mutedText },
                      ]}
                    >
                      Estado académico
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.th,
                        styles.thDate,
                        { color: mutedText },
                      ]}
                    >
                      Turno / fecha
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.th,
                        styles.thActions,
                        { color: mutedText },
                      ]}
                    >
                      Acciones
                    </ThemedText>
                  </>
                )}
              </View>
            )}

            <View style={styles.rowsBox}>
              {estudiantesPagina.map((estudiante) => {
                const visual = estadoVisual(
                  estudiante,
                  isDark,
                  theme.colors.primary,
                );
                const puedeGestionar = true;

                if (isMobile) {
                  return (
                    <MobileCard
                      key={estudiante.id}
                      estudiante={estudiante}
                      visual={visual}
                      strongText={strongText}
                      mutedText={mutedText}
                      isDark={isDark}
                      puedeGestionar={puedeGestionar}
                      onInscribir={() => onInscribir(estudiante)}
                      onVerPdf={() => onVerPdf(estudiante)}
                    />
                  );
                }

                return (
                  <View
                    key={estudiante.id}
                    style={[
                      styles.bodyRow,
                      {
                        backgroundColor: visual.background,
                        borderColor: visual.border,
                      },
                    ]}
                  >
                    {isCompact ? (
                      <>
                        <View style={styles.studentCompactCell}>
                          <StudentIdentity
                            estudiante={estudiante}
                            visual={visual}
                            strongText={strongText}
                            mutedText={mutedText}
                          />
                        </View>

                        <View style={styles.dataCompactCell}>
                          <ThemedText
                            numberOfLines={1}
                            style={[
                              styles.compactPrimary,
                              { color: strongText },
                            ]}
                          >
                            CI: {estudiante.ci || "—"}
                            {estudiante.expedido
                              ? ` · ${estudiante.expedido}`
                              : ""}
                          </ThemedText>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.compactText, { color: mutedText }]}
                          >
                            Matrícula: {estudiante.matricula || "Sin matrícula"}
                          </ThemedText>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.compactText, { color: mutedText }]}
                          >
                            Turno: {obtenerTurnoEstudiante(estudiante) ?? "Sin turno"}
                          </ThemedText>
                          <StatusBadge visual={visual} />
                        </View>

                        <View style={styles.actionsCompactCell}>
                          <ActionButton
                            label={
                              tienePlanCuotasGestion(estudiante)
                                ? "Editar"
                                : "Crear cuotas"
                            }
                            icon={
                              tienePlanCuotasGestion(estudiante)
                                ? "create-outline"
                                : "wallet-outline"
                            }
                            color={
                              tienePlanCuotasGestion(estudiante)
                                ? theme.colors.primary
                                : "#DC2626"
                            }
                            disabled={false}
                            onPress={() => onInscribir(estudiante)}
                            isDark={isDark}
                          />
                          <ActionButton
                            label="PDF"
                            icon="document-text-outline"
                            color="#16A34A"
                            onPress={() => onVerPdf(estudiante)}
                            isDark={isDark}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.ciCell}>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.cellStrong, { color: strongText }]}
                          >
                            {estudiante.ci || "—"}
                          </ThemedText>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.cellSmall, { color: mutedText }]}
                          >
                            {estudiante.expedido || "Sin expedido"}
                          </ThemedText>
                        </View>

                        <View style={styles.matriculaCell}>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.cellStrong, { color: strongText }]}
                          >
                            {estudiante.matricula || "Sin matrícula"}
                          </ThemedText>
                        </View>

                        <View style={styles.studentCell}>
                          <StudentIdentity
                            estudiante={estudiante}
                            visual={visual}
                            strongText={strongText}
                            mutedText={mutedText}
                          />
                        </View>

                        <View style={styles.statusCell}>
                          <StatusBadge visual={visual} />
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.cellSmall, { color: mutedText }]}
                          >
                            {visual.description}
                          </ThemedText>
                        </View>

                        <View style={styles.dateCell}>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.cellStrong, { color: strongText }]}
                          >
                            {obtenerTurnoEstudiante(estudiante) ?? "Sin turno"}
                          </ThemedText>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.cellSmall, { color: mutedText }]}
                          >
                            {formatearFecha(estudiante.fechaInscripcion)}
                          </ThemedText>
                        </View>

                        <View style={styles.actionsCell}>
                          <ActionButton
                            label={
                              tienePlanCuotasGestion(estudiante)
                                ? "Editar"
                                : "Crear cuotas"
                            }
                            icon={
                              tienePlanCuotasGestion(estudiante)
                                ? "create-outline"
                                : "wallet-outline"
                            }
                            color={
                              tienePlanCuotasGestion(estudiante)
                                ? theme.colors.primary
                                : "#DC2626"
                            }
                            disabled={false}
                            onPress={() => onInscribir(estudiante)}
                            isDark={isDark}
                          />
                          <ActionButton
                            label="PDF"
                            icon="document-text-outline"
                            color="#16A34A"
                            onPress={() => onVerPdf(estudiante)}
                            isDark={isDark}
                          />
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.pagination}>
            <ThemedText style={[styles.paginationText, { color: mutedText }]}>
              Página {currentPage} de {totalPages}
            </ThemedText>

            <View style={styles.paginationActions}>
              <PaginationButton
                icon="chevron-back"
                disabled={currentPage <= 1}
                onPress={() => setPage((actual) => Math.max(1, actual - 1))}
                backgroundColor={softCard}
                borderColor={border}
                color={strongText}
              />
              <PaginationButton
                icon="chevron-forward"
                disabled={currentPage >= totalPages}
                onPress={() =>
                  setPage((actual) => Math.min(totalPages, actual + 1))
                }
                backgroundColor={softCard}
                borderColor={border}
                color={strongText}
              />
            </View>
          </View>
        </>
      )}

      <SelectorModal
        visible={modalCarreraVisible}
        title="Seleccionar carrera"
        subtitle="Elige la carrera cuyos estudiantes deseas consultar."
        onClose={() => setModalCarreraVisible(false)}
        backgroundColor={theme.colors.card}
        borderColor={border}
        strongText={strongText}
        mutedText={mutedText}
      >
        {loadingCarreras ? (
          <View style={styles.modalLoading}>
            <ActivityIndicator color={theme.colors.primary} />
            <ThemedText style={[styles.modalLoadingText, { color: mutedText }]}>
              Cargando carreras...
            </ThemedText>
          </View>
        ) : (
          carreras.map((carrera) => {
            const seleccionada =
              Number(carrera.idCarrera) === Number(carreraSeleccionadaId);
            const cargando =
              Number(seleccionandoCarreraId) === Number(carrera.idCarrera);

            return (
              <SelectorOption
                key={carrera.idCarrera}
                title={carrera.nombreCarrera}
                subtitle={`${carrera.codigo ?? "Sin código"} · ${
                  carrera.regimen ?? "Sin régimen"
                } · Nota mínima ${Number(carrera.notaAprobacion ?? 51)}`}
                selected={seleccionada}
                loading={cargando}
                icon="school-outline"
                primary={theme.colors.primary}
                strongText={strongText}
                mutedText={mutedText}
                backgroundColor={softCard}
                selectedBackground={
                  isDark ? "rgba(59,130,246,0.20)" : "#EFF6FF"
                }
                borderColor={border}
                onPress={() => void seleccionarCarrera(carrera.idCarrera)}
              />
            );
          })
        )}
      </SelectorModal>

      <SelectorModal
        visible={modalNivelVisible}
        title="Seleccionar nivel"
        subtitle="Puede consultar e inscribir materias del nivel que necesite."
        onClose={() => setModalNivelVisible(false)}
        backgroundColor={theme.colors.card}
        borderColor={border}
        strongText={strongText}
        mutedText={mutedText}
      >
        {niveles.map((nivel) => (
          <SelectorOption
            key={nivel}
            title={labelNivel(carreraSeleccionada, nivel)}
            subtitle="Nivel registrado en las materias activas de la carrera"
            selected={Number(nivelSeleccionadoId) === Number(nivel)}
            icon="layers-outline"
            primary={theme.colors.primary}
            strongText={strongText}
            mutedText={mutedText}
            backgroundColor={softCard}
            selectedBackground={
              isDark ? "rgba(59,130,246,0.20)" : "#EFF6FF"
            }
            borderColor={border}
            onPress={() => void seleccionarNivel(nivel)}
          />
        ))}
      </SelectorModal>

      <SelectorModal
        visible={modalTurnoVisible}
        title="Filtrar por turno"
        subtitle="Muestra únicamente estudiantes del turno seleccionado."
        onClose={() => setModalTurnoVisible(false)}
        backgroundColor={theme.colors.card}
        borderColor={border}
        strongText={strongText}
        mutedText={mutedText}
      >
        <SelectorOption
          title="Todos los turnos"
          subtitle={`Mañana ${resumen.manana} · Tarde ${resumen.tarde} · Noche ${resumen.noche}`}
          selected={filtroTurno === "todos"}
          icon="people-outline"
          primary={theme.colors.primary}
          strongText={strongText}
          mutedText={mutedText}
          backgroundColor={softCard}
          selectedBackground={
            isDark ? "rgba(59,130,246,0.20)" : "#EFF6FF"
          }
          borderColor={border}
          onPress={() => {
            setFiltroTurno("todos");
            setPage(1);
            setModalTurnoVisible(false);
          }}
        />

        {TURNOS.map((turno) => (
          <SelectorOption
            key={turno}
            title={turno}
            subtitle={`${estudiantes.filter(
              (item) => obtenerTurnoEstudiante(item) === turno,
            ).length} estudiante(s)`}
            selected={filtroTurno === turno}
            icon={
              turno === "Mañana"
                ? "sunny-outline"
                : turno === "Tarde"
                  ? "partly-sunny-outline"
                  : "moon-outline"
            }
            primary={theme.colors.primary}
            strongText={strongText}
            mutedText={mutedText}
            backgroundColor={softCard}
            selectedBackground={
              isDark ? "rgba(59,130,246,0.20)" : "#EFF6FF"
            }
            borderColor={border}
            onPress={() => {
              setFiltroTurno(turno);
              setPage(1);
              setModalTurnoVisible(false);
            }}
          />
        ))}
      </SelectorModal>
    </View>
  );
}

function StudentIdentity({
  estudiante,
  visual,
  strongText,
  mutedText,
}: {
  estudiante: Estudiante;
  visual: EstadoVisual;
  strongText: string;
  mutedText: string;
}) {
  const nombre = nombreCompleto(estudiante);

  return (
    <View style={styles.identity}>
      <View style={[styles.avatar, { backgroundColor: visual.avatarBg }]}>
        <ThemedText style={[styles.avatarText, { color: visual.color }]}>
          {iniciales(nombre)}
        </ThemedText>
      </View>
      <View style={styles.identityText}>
        <ThemedText
          numberOfLines={1}
          style={[styles.nameText, { color: strongText }]}
        >
          {nombre || "Sin nombre"}
        </ThemedText>
        <ThemedText
          numberOfLines={1}
          style={[styles.cellSmall, { color: mutedText }]}
        >
          {estudiante.email || estudiante.celular || "Sin contacto"}
        </ThemedText>
        <QuotaStatusBadge estudiante={estudiante} />
      </View>
    </View>
  );
}

function StatusBadge({ visual }: { visual: EstadoVisual }) {
  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: `${visual.color}20` },
      ]}
    >
      <Ionicons name={visual.icon} size={14} color={visual.color} />
      <ThemedText
        numberOfLines={1}
        style={[styles.statusBadgeText, { color: visual.color }]}
      >
        {visual.label}
      </ThemedText>
    </View>
  );
}

function QuotaStatusBadge({ estudiante }: { estudiante: Estudiante }) {
  const tieneCuotas = tienePlanCuotasGestion(estudiante);
  const condonadas = totalCondonadasGestion(estudiante);

  const color = !tieneCuotas
    ? "#DC2626"
    : condonadas > 0
      ? "#D97706"
      : "#16A34A";

  const label = !tieneCuotas
    ? "Sin cuotas de gestión"
    : condonadas > 0
      ? `${condonadas} cuota${condonadas === 1 ? "" : "s"} condonada${
          condonadas === 1 ? "" : "s"
        }`
      : "Cuotas registradas";

  const icon: keyof typeof Ionicons.glyphMap = !tieneCuotas
    ? "alert-circle-outline"
    : condonadas > 0
      ? "gift-outline"
      : "checkmark-circle-outline";

  return (
    <View
      style={[
        styles.quotaStatusBadge,
        {
          backgroundColor: `${color}16`,
          borderColor: `${color}55`,
        },
      ]}
    >
      <Ionicons name={icon} size={12} color={color} />
      <ThemedText
        numberOfLines={1}
        style={[styles.quotaStatusBadgeText, { color }]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

function QuotaFilterButton({
  active,
  label,
  value,
  icon,
  color,
  backgroundColor,
  borderColor,
  onPress,
}: {
  active: boolean;
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  borderColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quotaFilterButton,
        {
          backgroundColor: active ? `${color}18` : backgroundColor,
          borderColor: active ? color : borderColor,
          opacity: pressed ? 0.76 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={active ? color : color} />
      <ThemedText
        style={[
          styles.quotaFilterButtonText,
          { color: active ? color : color },
        ]}
      >
        {label}
      </ThemedText>
      <View
        style={[
          styles.quotaFilterCount,
          { backgroundColor: active ? color : `${color}18` },
        ]}
      >
        <ThemedText
          style={[
            styles.quotaFilterCountText,
            { color: active ? "#FFFFFF" : color },
          ]}
        >
          {value}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function ActionButton({
  label,
  icon,
  color,
  onPress,
  disabled = false,
  isDark,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  isDark: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: isDark ? `${color}22` : `${color}14`,
          borderColor: `${color}55`,
          opacity: disabled ? 0.52 : pressed ? 0.76 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={color} />
      <ThemedText style={[styles.actionText, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}

function MobileCard({
  estudiante,
  visual,
  strongText,
  mutedText,
  isDark,
  puedeGestionar,
  onInscribir,
  onVerPdf,
}: {
  estudiante: Estudiante;
  visual: EstadoVisual;
  strongText: string;
  mutedText: string;
  isDark: boolean;
  puedeGestionar: boolean;
  onInscribir: () => void;
  onVerPdf: () => void;
}) {
  return (
    <View
      style={[
        styles.mobileCard,
        { backgroundColor: visual.background, borderColor: visual.border },
      ]}
    >
      <StudentIdentity
        estudiante={estudiante}
        visual={visual}
        strongText={strongText}
        mutedText={mutedText}
      />

      <View style={styles.mobileDetails}>
        <MobileDetail label="CI" value={estudiante.ci || "—"} strongText={strongText} mutedText={mutedText} />
        <MobileDetail label="Matrícula" value={estudiante.matricula || "Sin matrícula"} strongText={strongText} mutedText={mutedText} />
        <MobileDetail label="Turno" value={obtenerTurnoEstudiante(estudiante) ?? "Sin turno"} strongText={strongText} mutedText={mutedText} />
        <MobileDetail label="Fecha" value={formatearFecha(estudiante.fechaInscripcion)} strongText={strongText} mutedText={mutedText} />
      </View>

      <StatusBadge visual={visual} />
      <ThemedText style={[styles.mobileDescription, { color: mutedText }]}>
        {visual.description}
      </ThemedText>

      <View style={styles.mobileActions}>
        <ActionButton
          label={
            tienePlanCuotasGestion(estudiante)
              ? "Editar materias"
              : "Crear cuotas"
          }
          icon={
            tienePlanCuotasGestion(estudiante)
              ? "create-outline"
              : "wallet-outline"
          }
          color={
            tienePlanCuotasGestion(estudiante) ? visual.color : "#DC2626"
          }
          disabled={false}
          onPress={onInscribir}
          isDark={isDark}
        />
        <ActionButton
          label="Ver PDF"
          icon="document-text-outline"
          color="#16A34A"
          onPress={onVerPdf}
          isDark={isDark}
        />
      </View>
    </View>
  );
}

function MobileDetail({
  label,
  value,
  strongText,
  mutedText,
}: {
  label: string;
  value: string;
  strongText: string;
  mutedText: string;
}) {
  return (
    <View style={styles.mobileDetail}>
      <ThemedText style={[styles.mobileDetailLabel, { color: mutedText }]}>
        {label}
      </ThemedText>
      <ThemedText
        numberOfLines={1}
        style={[styles.mobileDetailValue, { color: strongText }]}
      >
        {value}
      </ThemedText>
    </View>
  );
}

function SummaryChip({
  icon,
  label,
  value,
  color,
  backgroundColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  backgroundColor: string;
}) {
  return (
    <View style={[styles.summaryChip, { backgroundColor }]}>
      <Ionicons name={icon} size={16} color={color} />
      <ThemedText style={[styles.summaryValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.summaryLabel, { color }]}>{label}</ThemedText>
    </View>
  );
}

function PaginationButton({
  icon,
  disabled,
  onPress,
  backgroundColor,
  borderColor,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  disabled: boolean;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
  color: string;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.paginationButton,
        {
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.42 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={19} color={color} />
    </Pressable>
  );
}

function SelectorModal({
  visible,
  title,
  subtitle,
  onClose,
  backgroundColor,
  borderColor,
  strongText,
  mutedText,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  backgroundColor: string;
  borderColor: string;
  strongText: string;
  mutedText: string;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalDismiss} onPress={onClose} />
        <View
          style={[
            styles.modalCard,
            { backgroundColor, borderColor },
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <View style={styles.modalHeaderText}>
              <ThemedText style={[styles.modalTitle, { color: strongText }]}>
                {title}
              </ThemedText>
              <ThemedText
                style={[styles.modalSubtitle, { color: mutedText }]}
              >
                {subtitle}
              </ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={23} color={mutedText} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SelectorOption({
  title,
  subtitle,
  selected,
  loading = false,
  icon,
  primary,
  strongText,
  mutedText,
  backgroundColor,
  selectedBackground,
  borderColor,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  loading?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  primary: string;
  strongText: string;
  mutedText: string;
  backgroundColor: string;
  selectedBackground: string;
  borderColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectorOption,
        {
          backgroundColor: selected ? selectedBackground : backgroundColor,
          borderColor: selected ? primary : borderColor,
          opacity: loading || pressed ? 0.76 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.selectorIcon,
          { backgroundColor: selected ? primary : `${primary}18` },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={selected ? "#FFFFFF" : primary} />
        ) : (
          <Ionicons
            name={selected ? "checkmark-circle" : icon}
            size={21}
            color={selected ? "#FFFFFF" : primary}
          />
        )}
      </View>
      <View style={styles.selectorText}>
        <ThemedText
          numberOfLines={2}
          style={[styles.selectorTitle, { color: strongText }]}
        >
          {title}
        </ThemedText>
        <ThemedText
          numberOfLines={2}
          style={[styles.selectorSubtitle, { color: mutedText }]}
        >
          {subtitle}
        </ThemedText>
      </View>
      <Ionicons
        name={selected ? "checkmark" : "chevron-forward"}
        size={21}
        color={selected ? primary : mutedText}
      />
    </Pressable>
  );
}

function EmptyState({
  icon,
  title,
  text,
  color,
  backgroundColor,
  borderColor,
  strongText,
  mutedText,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  strongText: string;
  mutedText: string;
}) {
  return (
    <View
      style={[
        styles.emptyState,
        { backgroundColor, borderColor },
      ]}
    >
      <Ionicons name={icon} size={44} color={color} />
      <ThemedText style={[styles.emptyTitle, { color: strongText }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.emptyText, { color: mutedText }]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 14,
  },
  toolbarTitleBox: {
    flex: 1,
    minWidth: 280,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toolbarIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarTitleText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  filterActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  filterButton: {
    width: 270,
    minHeight: 54,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  filterTextBox: {
    flex: 1,
    minWidth: 0,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  filterValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "900",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  summaryChip: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "900",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "900",
  },
  quotaFilterSection: {
    gap: 8,
  },
  quotaFilterHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  quotaFilterTitle: {
    fontSize: 12.5,
    fontWeight: "900",
  },
  quotaFilterScroll: {
    gap: 8,
    paddingRight: 8,
  },
  quotaFilterButton: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quotaFilterButtonText: {
    fontSize: 11,
    fontWeight: "900",
  },
  quotaFilterCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  quotaFilterCountText: {
    fontSize: 10.5,
    fontWeight: "900",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBox: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "700",
  },
  countBadge: {
    minWidth: 100,
    minHeight: 50,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "900",
  },
  countLabel: {
    fontSize: 10,
    fontWeight: "800",
  },
  loadingBox: {
    minHeight: 290,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingTitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "900",
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyState: {
    minHeight: 270,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    maxWidth: 520,
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center",
  },
  tableShell: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  tableHeader: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  th: {
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  thCi: { width: "10%" },
  thMatricula: { width: "14%" },
  thStudent: { width: "25%" },
  thStatus: { width: "23%" },
  thDate: { width: "11%" },
  thActions: { width: "17%", textAlign: "right" },
  thStudentCompact: { width: "35%" },
  thDataCompact: { width: "38%" },
  thActionsCompact: { width: "27%", textAlign: "right" },
  rowsBox: {
    padding: 10,
    gap: 9,
  },
  bodyRow: {
    minHeight: 94,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
  },
  ciCell: { width: "10%", paddingHorizontal: 8 },
  matriculaCell: { width: "14%", paddingHorizontal: 8 },
  studentCell: { width: "25%", paddingHorizontal: 8 },
  statusCell: { width: "23%", paddingHorizontal: 8, gap: 5 },
  dateCell: { width: "11%", paddingHorizontal: 8 },
  actionsCell: {
    width: "17%",
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 6,
  },
  studentCompactCell: { width: "35%", paddingHorizontal: 8 },
  dataCompactCell: { width: "38%", paddingHorizontal: 8, gap: 4 },
  actionsCompactCell: {
    width: "27%",
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 6,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "900",
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "900",
  },
  cellStrong: {
    fontSize: 13,
    fontWeight: "900",
  },
  cellSmall: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
  },
  compactPrimary: {
    fontSize: 13,
    fontWeight: "900",
  },
  compactText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusBadge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusBadgeText: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: "900",
  },
  quotaStatusBadge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    minHeight: 24,
    marginTop: 5,
    paddingHorizontal: 7,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  quotaStatusBadgeText: {
    flexShrink: 1,
    fontSize: 9.5,
    fontWeight: "900",
  },
  actionButton: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  actionText: {
    fontSize: 10,
    fontWeight: "900",
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  mobileDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mobileDetail: {
    minWidth: "30%",
    flex: 1,
  },
  mobileDetailLabel: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  mobileDetailValue: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "900",
  },
  mobileDescription: {
    fontSize: 11,
    fontWeight: "700",
  },
  mobileActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  paginationText: {
    fontSize: 12,
    fontWeight: "800",
  },
  paginationActions: {
    flexDirection: "row",
    gap: 8,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    padding: 18,
    backgroundColor: "rgba(2,6,23,0.78)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: "100%",
    maxWidth: 720,
    maxHeight: "82%",
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 18,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  modalHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "900",
  },
  modalSubtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  modalClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalContent: {
    padding: 14,
    gap: 9,
  },
  modalLoading: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalLoadingText: {
    fontSize: 13,
    fontWeight: "800",
  },
  selectorOption: {
    minHeight: 78,
    padding: 13,
    borderWidth: 1,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  selectorIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorText: {
    flex: 1,
    minWidth: 0,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  selectorSubtitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
  },
});