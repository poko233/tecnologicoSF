import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { BASE_URL } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";
import { createHistorialEstudianteStyles } from "../styles/historialEstudiante.styles";
import {
  EstudianteUsuario,
  HistorialEstudianteResponse,
  MateriaHistorialEstudiante,
} from "../types/estudiante.types";
import {
  agruparHistorialEstudiantePorCarreraNivel,
  formatearNotaFinal,
  nombreCompleto,
  obtenerEstadoMateriaLabel,
  obtenerMatricula,
} from "../utils/estudiante.helpers";
import HistorialEstudianteDetalleModal from "./HistorialEstudianteDetalleModal";

type Props = {
  visible: boolean;
  estudiante: EstudianteUsuario | null;
  historial: HistorialEstudianteResponse | null;
  loading: boolean;
  onClose: () => void;
};

type EstadoAcademicoFiltro =
  | "TODOS"
  | "APROBADO"
  | "REPROBADO"
  | "INSCRITO"
  | "PENDIENTE";

type EstadoCatalogoFiltro = "ACTIVAS" | "TODAS";
type TipoHistorialFiltro = "HISTORICO" | "GESTION_ACTUAL";

type MateriaHistorialUI = MateriaHistorialEstudiante & {
  estadoRegistro?: string | null;
  notaAprobacion?: number | null;
  estadoCarrera?: string | null;
};

const FILTROS_ACADEMICOS: Array<{
  key: EstadoAcademicoFiltro;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: "TODOS", label: "Todos los estados", icon: "layers-outline" },
  { key: "INSCRITO", label: "Inscritas", icon: "bookmark-outline" },
  { key: "APROBADO", label: "Aprobadas", icon: "checkmark-circle-outline" },
  { key: "REPROBADO", label: "Reprobadas", icon: "close-circle-outline" },
  { key: "PENDIENTE", label: "Pendientes", icon: "time-outline" },
];

function normalizarTexto(value?: string | number | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function valorTextoValido(value?: string | null): boolean {
  const texto = String(value ?? "").trim().toLowerCase();

  return !["", "0", "null", "undefined"].includes(texto);
}

/**
 * Combina el estudiante del listado/detalle con el resumen que devuelve el
 * historial. El resumen no debe borrar fotoUrl ni foto cuando esos campos no
 * vienen o vienen vacíos.
 */
function fusionarEstudianteHistorial(
  estudiante: EstudianteUsuario | null,
  resumen: EstudianteUsuario | null | undefined,
): EstudianteUsuario | null {
  if (!estudiante && !resumen) return null;
  if (!estudiante) return resumen ?? null;
  if (!resumen) return estudiante;

  return {
    ...estudiante,
    ...resumen,
    foto: valorTextoValido(resumen.foto)
      ? resumen.foto
      : estudiante.foto,
    fotoUrl: valorTextoValido(resumen.fotoUrl)
      ? resumen.fotoUrl
      : estudiante.fotoUrl,
    codigo_qr: valorTextoValido(resumen.codigo_qr)
      ? resumen.codigo_qr
      : estudiante.codigo_qr,
    qrUrl: valorTextoValido(resumen.qrUrl)
      ? resumen.qrUrl
      : estudiante.qrUrl,
    documentos: resumen.documentos ?? estudiante.documentos,
    carreras: resumen.carreras ?? estudiante.carreras,
    roles: resumen.roles ?? estudiante.roles,
    promociones: resumen.promociones ?? estudiante.promociones,
    numeroReferencias:
      resumen.numeroReferencias ?? estudiante.numeroReferencias,
    numero_referencias:
      resumen.numero_referencias ?? estudiante.numero_referencias,
  };
}

function formatearPromedioEntero(
  promedio?: number | string | null,
): string {
  if (
    promedio === null ||
    promedio === undefined ||
    promedio === ""
  ) {
    return "Sin nota";
  }

  const numero = Number(promedio);

  if (!Number.isFinite(numero)) {
    return String(promedio);
  }

  return String(Math.round(numero));
}

function resolverUrlPublica(ruta?: string | null): string | null {
  const value = String(ruta ?? "").trim();

  if (
    !value ||
    value === "0" ||
    value.toLowerCase() === "null" ||
    value.toLowerCase() === "undefined"
  ) {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:image")
  ) {
    return encodeURI(value);
  }

  /*
   * Las fotos se guardan dentro de public/fotos-usuarios. La base de datos
   * debe guardar una ruta relativa como fotos-usuarios/archivo.jpg.
   * También se toleran rutas antiguas que empiezan con public/.
   */
  const rutaRelativa = value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^public\//i, "");

  return encodeURI(
    `${String(BASE_URL).replace(/\/+$/, "")}/${rutaRelativa}`,
  );
}

function materiaActiva(materia: MateriaHistorialUI) {
  const estado = normalizarTexto(materia.estadoRegistro);

  return estado === "activo" || estado === "activa" || estado === "1";
}

function getEstadoColors(estado: string, colors: any) {
  const text = colors.text || "#0F172A";
  const muted = colors.mutedForeground || colors.textMuted || "#64748B";

  if (estado === "APROBADO") {
    return {
      bg: `${colors.success || "#16A34A"}1C`,
      border: colors.success || "#16A34A",
      text: colors.success || "#16A34A",
    };
  }

  if (estado === "REPROBADO") {
    return {
      bg: `${colors.destructive || "#DC2626"}1C`,
      border: colors.destructive || "#DC2626",
      text: colors.destructive || "#DC2626",
    };
  }

  if (estado === "INSCRITO") {
    return {
      bg: `${colors.primary || "#2563EB"}1C`,
      border: colors.primary || "#2563EB",
      text: colors.primary || "#2563EB",
    };
  }

  return {
    bg: `${muted}12`,
    border: colors.border || "#CBD5E1",
    text,
  };
}

function calcularResumenVisible(materias: MateriaHistorialUI[]) {
  const notas = materias
    .map((materia) => materia.notaActual ?? materia.notaFinal)
    .filter((nota): nota is number => nota !== null && nota !== undefined)
    .map(Number)
    .filter(Number.isFinite);

  return {
    total: materias.length,
    aprobadas: materias.filter(
      (materia) => materia.estadoMateria === "APROBADO",
    ).length,
    reprobadas: materias.filter(
      (materia) => materia.estadoMateria === "REPROBADO",
    ).length,
    inscritas: materias.filter(
      (materia) => materia.estadoMateria === "INSCRITO",
    ).length,
    pendientes: materias.filter(
      (materia) => materia.estadoMateria === "PENDIENTE",
    ).length,
    conNota: notas.length,
    sinNota: Math.max(0, materias.length - notas.length),
    promedio:
      notas.length > 0
        ? notas.reduce((total, nota) => total + nota, 0) / notas.length
        : null,
  };
}

export default function HistorialEstudianteModal({
  visible,
  estudiante,
  historial,
  loading,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors as any;
  const styles = useMemo(
    () => createHistorialEstudianteStyles(colors),
    [colors],
  );

  const [materiaSeleccionada, setMateriaSeleccionada] =
    useState<MateriaHistorialUI | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoAcademico, setEstadoAcademico] =
    useState<EstadoAcademicoFiltro>("TODOS");
  const [estadoCatalogo, setEstadoCatalogo] =
    useState<EstadoCatalogoFiltro>("ACTIVAS");
  const [tipoHistorial, setTipoHistorial] =
    useState<TipoHistorialFiltro>("HISTORICO");
  const [fotoError, setFotoError] = useState(false);

  const estudianteInfo = useMemo(
    () => fusionarEstudianteHistorial(estudiante, historial?.estudiante),
    [estudiante, historial?.estudiante],
  );

  const fotoUrl = useMemo(
    () => resolverUrlPublica(estudianteInfo?.fotoUrl || estudianteInfo?.foto),
    [estudianteInfo?.id, estudianteInfo?.fotoUrl, estudianteInfo?.foto],
  );

  const materiasHistoricas = useMemo<MateriaHistorialUI[]>(
    () =>
      (historial?.materiasHistoricas ??
        historial?.materias ??
        []) as MateriaHistorialUI[],
    [historial?.materiasHistoricas, historial?.materias],
  );

  const materiasGestionActual = useMemo<MateriaHistorialUI[]>(
    () =>
      (historial?.materiasGestionActual ?? []) as MateriaHistorialUI[],
    [historial?.materiasGestionActual],
  );

  const materiasBase = useMemo<MateriaHistorialUI[]>(
    () =>
      tipoHistorial === "GESTION_ACTUAL"
        ? materiasGestionActual
        : materiasHistoricas,
    [tipoHistorial, materiasGestionActual, materiasHistoricas],
  );

  const materiasFiltradas = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return materiasBase.filter((materia) => {
      if (
        tipoHistorial === "HISTORICO" &&
        estadoCatalogo === "ACTIVAS" &&
        !materiaActiva(materia)
      ) {
        return false;
      }

      if (
        estadoAcademico !== "TODOS" &&
        materia.estadoMateria !== estadoAcademico
      ) {
        return false;
      }

      if (!texto) {
        return true;
      }

      const contenido = normalizarTexto(
        [
          materia.nombreMateria,
          materia.codigoMateria,
          materia.nombreCarrera,
          materia.gestion,
          materia.nombreGrupo,
          materia.turno,
          materia.nivel,
          materia.estadoMateria,
          materia.notaActual,
          materia.notaFinal,
        ].join(" "),
      );

      return contenido.includes(texto);
    });
  }, [
    busqueda,
    estadoAcademico,
    estadoCatalogo,
    materiasBase,
    tipoHistorial,
  ]);

  const carrerasAgrupadas = useMemo(
    () => agruparHistorialEstudiantePorCarreraNivel(materiasFiltradas),
    [materiasFiltradas],
  );

  const resumenVisible = useMemo(
    () => calcularResumenVisible(materiasFiltradas),
    [materiasFiltradas],
  );

  const totalActivas = useMemo(
    () => materiasBase.filter(materiaActiva).length,
    [materiasBase],
  );

  const filtrosAcademicosVisibles = useMemo(
    () =>
      tipoHistorial === "GESTION_ACTUAL"
        ? FILTROS_ACADEMICOS.filter(
            (filtro) =>
              filtro.key === "TODOS" || filtro.key === "INSCRITO",
          )
        : FILTROS_ACADEMICOS,
    [tipoHistorial],
  );

  useEffect(() => {
    setFotoError(false);
  }, [fotoUrl, visible]);

  useEffect(() => {
    if (!visible) {
      setMateriaSeleccionada(null);
      setBusqueda("");
      setEstadoAcademico("TODOS");
      setEstadoCatalogo("ACTIVAS");
      setTipoHistorial("HISTORICO");
    }
  }, [visible]);

  const cerrarModal = () => {
    setMateriaSeleccionada(null);
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                {fotoUrl && !fotoError ? (
                  <Image
                    key={fotoUrl}
                    source={{ uri: fotoUrl }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    onError={(event) => {
                      console.warn(
                        "No se pudo cargar la foto del historial:",
                        fotoUrl,
                        event.nativeEvent,
                      );
                      setFotoError(true);
                    }}
                  />
                ) : (
                  <ThemedText style={styles.avatarText}>
                    {nombreCompleto(estudianteInfo).charAt(0).toUpperCase() || "E"}
                  </ThemedText>
                )}
              </View>

              <View style={styles.headerInfo}>
                <ThemedText style={styles.kicker}>
                  Historial académico
                </ThemedText>

                <ThemedText style={styles.title} numberOfLines={2}>
                  {nombreCompleto(estudianteInfo) || "Estudiante"}
                </ThemedText>

                <ThemedText style={styles.subtitle}>
                  CI: {estudianteInfo?.ci || "Sin CI"} · Matrícula:{" "}
                  {obtenerMatricula(estudianteInfo)} ·{" "}
                  {loading
                    ? "Cargando materias..."
                    : tipoHistorial === "GESTION_ACTUAL"
                      ? `Materias de gestión activa: ${materiasGestionActual.length}`
                      : `Materias históricas activas: ${totalActivas}`}
                </ThemedText>
              </View>

              <Pressable onPress={cerrarModal} style={styles.iconClose}>
                <Ionicons name="close" size={25} color={colors.text} />
              </Pressable>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <View style={styles.loadingIconBox}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>

                <ThemedText style={styles.loadingTitle}>
                  Cargando historial académico
                </ThemedText>

                <ThemedText style={styles.loadingText}>
                  Puedes cerrar esta ventana en cualquier momento. La respuesta
                  pendiente será descartada y no volverá a abrir el modal.
                </ThemedText>

                <Pressable
                  onPress={cerrarModal}
                  style={styles.loadingCancelButton}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={19}
                    color={colors.primaryForeground}
                  />
                  <ThemedText style={styles.loadingCancelButtonText}>
                    Cancelar carga y cerrar
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                style={styles.mainScroll}
                contentContainerStyle={styles.mainScrollContent}
                showsVerticalScrollIndicator
                persistentScrollbar
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.summaryGrid}>
                  <View
                    style={[styles.summaryCard, styles.summaryCardPrimary]}
                  >
                    <ThemedText style={styles.summaryValue}>
                      {resumenVisible.total}
                    </ThemedText>
                    <ThemedText style={styles.summaryLabel}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? "Materias de esta gestión"
                        : "Materias históricas"}
                    </ThemedText>
                  </View>

                  <View style={styles.summaryCard}>
                    <ThemedText style={styles.summaryValue}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? resumenVisible.conNota
                        : resumenVisible.inscritas}
                    </ThemedText>
                    <ThemedText style={styles.summaryLabel}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? "Con nota actual"
                        : "Inscritas"}
                    </ThemedText>
                  </View>

                  <View style={styles.summaryCard}>
                    <ThemedText style={styles.summaryValue}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? resumenVisible.sinNota
                        : resumenVisible.aprobadas}
                    </ThemedText>
                    <ThemedText style={styles.summaryLabel}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? "Todavía sin nota"
                        : "Aprobadas"}
                    </ThemedText>
                  </View>

                  <View style={styles.summaryCard}>
                    <ThemedText style={styles.summaryValue}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? resumenVisible.inscritas
                        : resumenVisible.reprobadas}
                    </ThemedText>
                    <ThemedText style={styles.summaryLabel}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? "Inscritas activas"
                        : "Reprobadas"}
                    </ThemedText>
                  </View>

                  <View style={styles.summaryCard}>
                    <ThemedText style={styles.summaryValue}>
                      {formatearPromedioEntero(
                        resumenVisible.promedio,
                      )}
                    </ThemedText>
                    <ThemedText style={styles.summaryLabel}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? "Promedio actual"
                        : "Promedio histórico"}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.controlsPanel}>
                  <View style={styles.controlsTop}>
                    <View style={styles.controlsTitleBox}>
                      <ThemedText style={styles.controlsTitle}>
                        {tipoHistorial === "GESTION_ACTUAL"
                          ? "Notas de esta gestión"
                          : "Historial académico histórico"}
                      </ThemedText>

                      <ThemedText style={styles.controlsSubtitle}>
                        {tipoHistorial === "GESTION_ACTUAL"
                          ? "Muestra las notas que el estudiante tiene ahora en las materias inscritas de una gestión activa. No usa notas cerradas de gestiones anteriores."
                          : "Muestra las notas finales guardadas al cerrar gestiones anteriores. Mantiene el comportamiento histórico de esta vista."}
                      </ThemedText>
                    </View>

                    <View style={styles.resultBadge}>
                      <ThemedText style={styles.resultBadgeText}>
                        {materiasFiltradas.length} resultado(s)
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.filtersBlock}>
                    <ThemedText style={styles.filtersLabel}>
                      Tipo de historial
                    </ThemedText>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.chipsScroll}
                      contentContainerStyle={styles.chipsContent}
                    >
                      <Pressable
                        onPress={() => {
                          setTipoHistorial("HISTORICO");
                          setMateriaSeleccionada(null);
                          setBusqueda("");
                          setEstadoAcademico("TODOS");
                        }}
                        style={[
                          styles.filterChip,
                          tipoHistorial === "HISTORICO" &&
                            styles.filterChipActive,
                        ]}
                      >
                        <Ionicons
                          name="archive-outline"
                          size={17}
                          color={
                            tipoHistorial === "HISTORICO"
                              ? colors.primaryForeground
                              : colors.textSecondary
                          }
                        />
                        <ThemedText
                          style={[
                            styles.filterChipText,
                            tipoHistorial === "HISTORICO" &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          Historial histórico
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setTipoHistorial("GESTION_ACTUAL");
                          setMateriaSeleccionada(null);
                          setBusqueda("");
                          setEstadoAcademico("TODOS");
                          setEstadoCatalogo("ACTIVAS");
                        }}
                        style={[
                          styles.filterChip,
                          tipoHistorial === "GESTION_ACTUAL" &&
                            styles.filterChipActive,
                        ]}
                      >
                        <Ionicons
                          name="pulse-outline"
                          size={17}
                          color={
                            tipoHistorial === "GESTION_ACTUAL"
                              ? colors.primaryForeground
                              : colors.textSecondary
                          }
                        />
                        <ThemedText
                          style={[
                            styles.filterChipText,
                            tipoHistorial === "GESTION_ACTUAL" &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          Historial de esta gestión
                        </ThemedText>
                      </Pressable>
                    </ScrollView>
                  </View>

                  <View style={styles.searchBox}>
                    <Ionicons
                      name="search-outline"
                      size={20}
                      color={colors.textSecondary || colors.mutedForeground}
                    />

                    <TextInput
                      value={busqueda}
                      onChangeText={setBusqueda}
                      placeholder={
                        tipoHistorial === "GESTION_ACTUAL"
                          ? "Buscar en las materias de la gestión actual..."
                          : "Buscar por materia, código, carrera, gestión o grupo..."
                      }
                      placeholderTextColor={
                        colors.textMuted || colors.mutedForeground
                      }
                      style={styles.searchInput}
                    />

                    {!!busqueda && (
                      <Pressable onPress={() => setBusqueda("")}>
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </Pressable>
                    )}
                  </View>

                  {tipoHistorial === "HISTORICO" && (
                    <View style={styles.filtersBlock}>
                    <ThemedText style={styles.filtersLabel}>
                      Estado del catálogo
                    </ThemedText>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator
                      persistentScrollbar
                      style={styles.chipsScroll}
                      contentContainerStyle={styles.chipsContent}
                    >
                      <Pressable
                        onPress={() => setEstadoCatalogo("ACTIVAS")}
                        style={[
                          styles.filterChip,
                          estadoCatalogo === "ACTIVAS" &&
                            styles.filterChipActive,
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={17}
                          color={
                            estadoCatalogo === "ACTIVAS"
                              ? colors.primaryForeground
                              : colors.textSecondary
                          }
                        />
                        <ThemedText
                          style={[
                            styles.filterChipText,
                            estadoCatalogo === "ACTIVAS" &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          Solo materias activas
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        onPress={() => setEstadoCatalogo("TODAS")}
                        style={[
                          styles.filterChip,
                          estadoCatalogo === "TODAS" &&
                            styles.filterChipActive,
                        ]}
                      >
                        <Ionicons
                          name="albums-outline"
                          size={17}
                          color={
                            estadoCatalogo === "TODAS"
                              ? colors.primaryForeground
                              : colors.textSecondary
                          }
                        />
                        <ThemedText
                          style={[
                            styles.filterChipText,
                            estadoCatalogo === "TODAS" &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          Todas, incluidas inactivas
                        </ThemedText>
                      </Pressable>
                    </ScrollView>
                    </View>
                  )}

                  <View style={styles.filtersBlock}>
                    <ThemedText style={styles.filtersLabel}>
                      Estado académico
                    </ThemedText>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator
                      persistentScrollbar
                      style={styles.chipsScroll}
                      contentContainerStyle={styles.chipsContent}
                    >
                      {filtrosAcademicosVisibles.map((filtro) => {
                        const active = estadoAcademico === filtro.key;

                        return (
                          <Pressable
                            key={filtro.key}
                            onPress={() => setEstadoAcademico(filtro.key)}
                            style={[
                              styles.filterChip,
                              active && styles.filterChipActive,
                            ]}
                          >
                            <Ionicons
                              name={filtro.icon}
                              size={17}
                              color={
                                active
                                  ? colors.primaryForeground
                                  : colors.textSecondary
                              }
                            />

                            <ThemedText
                              style={[
                                styles.filterChipText,
                                active && styles.filterChipTextActive,
                              ]}
                            >
                              {filtro.label}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.legend}>
                  {tipoHistorial === "GESTION_ACTUAL" ? (
                    <>
                      <LegendItem
                        label="Materia inscrita en la gestión activa"
                        color={colors.primary || "#2563EB"}
                        styles={styles}
                      />
                      <ThemedText style={styles.legendText}>
                        La nota mostrada es provisional y puede cambiar hasta
                        que la gestión sea cerrada.
                      </ThemedText>
                    </>
                  ) : (
                    <>
                      <LegendItem
                        label="Aprobada"
                        color={colors.success || "#16A34A"}
                        styles={styles}
                      />
                      <LegendItem
                        label="Reprobada"
                        color={colors.destructive || "#DC2626"}
                        styles={styles}
                      />
                      <LegendItem
                        label="Inscrita"
                        color={colors.primary || "#2563EB"}
                        styles={styles}
                      />
                      <LegendItem
                        label="Pendiente"
                        color={colors.mutedForeground || "#64748B"}
                        styles={styles}
                      />
                    </>
                  )}
                </View>

                {carrerasAgrupadas.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons
                      name="search-outline"
                      size={38}
                      color={colors.mutedForeground || colors.textMuted}
                    />

                    <ThemedText style={styles.emptyTitle}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? "No hay materias en una gestión activa"
                        : "No hay materias para mostrar"}
                    </ThemedText>

                    <ThemedText style={styles.emptyText}>
                      {tipoHistorial === "GESTION_ACTUAL"
                        ? "El estudiante no tiene materias inscritas en una gestión activa o todavía no se registraron sus inscripciones por materia."
                        : "Cambia los filtros o limpia la búsqueda. Esta vista usa las notas finales guardadas al cerrar cada gestión."}
                    </ThemedText>
                  </View>
                ) : (
                  carrerasAgrupadas.map((carrera) => (
                    <CarreraHistorialBlock
                      key={carrera.idCarrera}
                      carrera={carrera}
                      colors={colors}
                      styles={styles}
                      onSelectMateria={setMateriaSeleccionada}
                    />
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <HistorialEstudianteDetalleModal
        visible={!!materiaSeleccionada}
        estudiante={estudianteInfo}
        materia={materiaSeleccionada}
        onClose={() => setMateriaSeleccionada(null)}
      />
    </>
  );
}


type CarreraAgrupada = ReturnType<
  typeof agruparHistorialEstudiantePorCarreraNivel
>[number];

function CarreraHistorialBlock({
  carrera,
  colors,
  styles,
  onSelectMateria,
}: {
  carrera: CarreraAgrupada;
  colors: any;
  styles: ReturnType<typeof createHistorialEstudianteStyles>;
  onSelectMateria: (materia: MateriaHistorialUI) => void;
}) {
  const topScrollRef = useRef<ScrollView | null>(null);
  const bottomScrollRef = useRef<ScrollView | null>(null);
  const syncingRef = useRef<"TOP" | "BOTTOM" | null>(null);
  const [contentWidth, setContentWidth] = useState(1);

  const totalCarrera = carrera.niveles.reduce(
    (total, nivel) => total + nivel.materias.length,
    0,
  );

  const liberarSincronizacion = (source: "TOP" | "BOTTOM") => {
    requestAnimationFrame(() => {
      if (syncingRef.current === source) {
        syncingRef.current = null;
      }
    });
  };

  const syncFromTop = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (syncingRef.current === "BOTTOM") return;

    syncingRef.current = "TOP";
    bottomScrollRef.current?.scrollTo({
      x: event.nativeEvent.contentOffset.x,
      animated: false,
    });
    liberarSincronizacion("TOP");
  };

  const syncFromBottom = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (syncingRef.current === "TOP") return;

    syncingRef.current = "BOTTOM";
    topScrollRef.current?.scrollTo({
      x: event.nativeEvent.contentOffset.x,
      animated: false,
    });
    liberarSincronizacion("BOTTOM");
  };

  return (
    <View style={styles.carreraBlock}>
      <View style={styles.carreraHeader}>
        <View style={styles.carreraIcon}>
          <Ionicons
            name="school-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <ThemedText style={styles.carreraTitle} numberOfLines={2}>
            {carrera.nombreCarrera}
          </ThemedText>

          <ThemedText style={styles.carreraMeta}>
            {carrera.regimen || "Sin régimen"} ·{" "}
            {carrera.tipoCarrera || "Sin tipo"} · Desliza horizontalmente
            para ver todos los niveles
          </ThemedText>
        </View>

        <View style={styles.carreraCount}>
          <ThemedText style={styles.carreraCountText}>
            {totalCarrera}
          </ThemedText>
        </View>
      </View>

      <View style={styles.scrollHint}>
        <Ionicons
          name="swap-horizontal-outline"
          size={17}
          color={colors.mutedForeground}
        />
        <ThemedText style={styles.scrollHintText}>
          Usa la barra superior, la inferior o desliza para explorar todos los
          niveles de esta carrera.
        </ThemedText>
      </View>

      <View style={styles.topScrollArea}>
        <View style={styles.topScrollHeader}>
          <Ionicons
            name="arrow-forward-outline"
            size={15}
            color={colors.primary}
          />
          <ThemedText style={styles.topScrollHeaderText}>
            Desplazamiento superior
          </ThemedText>
        </View>

        <ScrollView
          ref={topScrollRef}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          persistentScrollbar
          scrollEventThrottle={16}
          onScroll={syncFromTop}
          style={styles.topMallaScroll}
          contentContainerStyle={styles.topMallaScrollContent}
        >
          <View
            style={[
              styles.topScrollSpacer,
              { width: Math.max(contentWidth, 1) },
            ]}
          />
        </ScrollView>
      </View>

      <ScrollView
        ref={bottomScrollRef}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
        persistentScrollbar
        scrollEventThrottle={16}
        onScroll={syncFromBottom}
        onContentSizeChange={(width) => {
          setContentWidth(Math.max(width, 1));
        }}
        style={styles.mallaScroll}
        contentContainerStyle={styles.mallaContent}
      >
        {carrera.niveles.map((nivel) => (
          <View
            key={`${carrera.idCarrera}-${nivel.nivel}`}
            style={styles.nivelColumn}
          >
            <View style={styles.nivelHeader}>
              <ThemedText style={styles.nivelTitle}>
                {nivel.label}
              </ThemedText>
            </View>

            {nivel.materias.map((materia) => {
              const materiaUi = materia as MateriaHistorialUI;
              const estadoStyle = getEstadoColors(
                materiaUi.estadoMateria,
                colors,
              );

              return (
                <Pressable
                  key={`${materiaUi.idCarrera}-${materiaUi.idMateria}`}
                  onPress={() => onSelectMateria(materiaUi)}
                  style={({ pressed }) => [
                    styles.materiaCard,
                    {
                      backgroundColor: estadoStyle.bg,
                      borderColor: estadoStyle.border,
                      opacity: pressed ? 0.76 : 1,
                    },
                  ]}
                >
                  <View style={styles.materiaCardTop}>
                    <ThemedText
                      style={[
                        styles.materiaTitle,
                        { color: estadoStyle.text },
                      ]}
                      numberOfLines={3}
                    >
                      {materiaUi.nombreMateria}
                    </ThemedText>

                    <ThemedText style={styles.materiaCode}>
                      {materiaUi.codigoMateria || "Sin código"}
                    </ThemedText>

                    <View style={styles.materiaMetaRow}>
                      <View style={styles.activePill}>
                        <ThemedText style={styles.activePillText}>
                          {materiaUi.tipoHistorial === "GESTION_ACTUAL"
                            ? "Gestión actual"
                            : materiaActiva(materiaUi)
                              ? "Materia activa"
                              : "Materia inactiva"}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.materiaFooter}>
                    <ThemedText
                      style={[
                        styles.materiaEstado,
                        { color: estadoStyle.text },
                      ]}
                    >
                      {obtenerEstadoMateriaLabel(materiaUi.estadoMateria)}
                    </ThemedText>

                    <ThemedText style={styles.materiaNota}>
                      {formatearNotaFinal(
                        materiaUi.notaActual ?? materiaUi.notaFinal,
                      )}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function LegendItem({
  label,
  color,
  styles,
}: {
  label: string;
  color: string;
  styles: ReturnType<typeof createHistorialEstudianteStyles>;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText style={styles.legendText}>{label}</ThemedText>
    </View>
  );
}