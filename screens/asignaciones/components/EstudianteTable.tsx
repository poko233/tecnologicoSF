import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

import { createEstudiantesTableStyles } from "../styles/estudiantesTable.styles";
import {
  CarreraFiltro,
  EstudianteTabla,
  estaInscrito,
  formatearFecha,
  nombreCompleto,
  obtenerAnioInscripcion,
  obtenerIniciales,
  obtenerLabelNivelPorRegimen,
  obtenerNivelTexto,
  obtenerNivelesCarrera,
} from "../utils/estudiantesTable.utils";

type Props = {
  estudiantes: EstudianteTabla[];
  carreras: CarreraFiltro[];
  carreraSeleccionadaId: number | null;
  loading: boolean;
  loadingCarreras: boolean;
  onSeleccionarCarrera: (
    idCarrera: number,
    nivel?: number,
  ) => Promise<void> | void;
  onInscribir: (estudiante: EstudianteTabla) => void;
  onVerPdf: (estudiante: EstudianteTabla) => void;
};

const ITEMS_PER_PAGE = 10;
const styles = createEstudiantesTableStyles();

export default function EstudiantesTable({
  estudiantes,
  carreras,
  carreraSeleccionadaId,
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
  const compactActions = width < 970;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectorCarreraVisible, setSelectorCarreraVisible] = useState(false);
  const [selectorNivelVisible, setSelectorNivelVisible] = useState(false);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number | null>(
    null,
  );
  const [seleccionandoCarreraId, setSeleccionandoCarreraId] = useState<
    number | null
  >(null);
  const [seleccionandoNivel, setSeleccionandoNivel] = useState<number | null>(
    null,
  );

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const softCard = isDark
    ? "rgba(255,255,255,0.045)"
    : "rgba(15,23,42,0.035)";

  const softHeader = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(15,23,42,0.06)";

  const mutedBorder = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(15,23,42,0.10)";

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;

  const greenRowBackground = isDark
    ? "rgba(22,163,74,0.17)"
    : "#DCFCE7";

  const greenRowBorder = isDark
    ? "rgba(74,222,128,0.42)"
    : "#86EFAC";

  const greenText = isDark ? "#86EFAC" : "#15803D";

  const carreraSeleccionada = useMemo(() => {
    if (!carreraSeleccionadaId) return null;

    return (
      carreras.find(
        (carrera) =>
          Number(carrera.idCarrera) === Number(carreraSeleccionadaId),
      ) ?? null
    );
  }, [carreras, carreraSeleccionadaId]);

  const nivelesCarrera = useMemo(() => {
    return obtenerNivelesCarrera(carreraSeleccionada);
  }, [carreraSeleccionada]);

  const labelNivel = useMemo(() => {
    return obtenerLabelNivelPorRegimen(carreraSeleccionada?.regimen);
  }, [carreraSeleccionada?.regimen]);

  const nivelSeleccionadoTexto = useMemo(() => {
    if (!carreraSeleccionada || nivelSeleccionado === null) {
      return "";
    }

    return obtenerNivelTexto(carreraSeleccionada, nivelSeleccionado);
  }, [carreraSeleccionada, nivelSeleccionado]);

  useEffect(() => {
    setSearch("");
    setPage(1);
    setNivelSeleccionado(null);
  }, [carreraSeleccionadaId]);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return estudiantes;

    return estudiantes.filter((estudiante) => {
      const nombre = nombreCompleto(estudiante);

      return (
        nombre.toLowerCase().includes(q) ||
        String(estudiante.ci ?? "").toLowerCase().includes(q) ||
        String(estudiante.matricula ?? "").toLowerCase().includes(q) ||
        String(estudiante.fechaInscripcion ?? "").toLowerCase().includes(q) ||
        String(estudiante.email ?? "").toLowerCase().includes(q) ||
        String(estudiante.celular ?? "").toLowerCase().includes(q)
      );
    });
  }, [estudiantes, search]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const estudiantesPagina = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filtrados.slice(start, start + ITEMS_PER_PAGE);
  }, [filtrados, currentPage]);

  const seleccionarCarrera = async (idCarrera: number) => {
    try {
      setSeleccionandoCarreraId(idCarrera);
      setNivelSeleccionado(null);
      await onSeleccionarCarrera(idCarrera);
      setSelectorCarreraVisible(false);
      setSelectorNivelVisible(true);
    } finally {
      setSeleccionandoCarreraId(null);
    }
  };

  const seleccionarNivel = async (nivel: number) => {
    if (!carreraSeleccionada) return;

    try {
      setSeleccionandoNivel(nivel);
      setNivelSeleccionado(nivel);
      setSearch("");
      setPage(1);

      await onSeleccionarCarrera(Number(carreraSeleccionada.idCarrera), nivel);

      setSelectorNivelVisible(false);
    } finally {
      setSeleccionandoNivel(null);
    }
  };

  const limpiarBusqueda = () => {
    setSearch("");
    setPage(1);
  };

  const cambiarPaginaAnterior = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const cambiarPaginaSiguiente = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const modalCarreras = (
    <Modal
      visible={selectorCarreraVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectorCarreraVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.modalDismissArea}
          onPress={() => setSelectorCarreraVisible(false)}
        />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: mutedBorder,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.modalTitle, { color: strongText }]}>
                Seleccionar carrera
              </ThemedText>

              <ThemedText style={[styles.modalSubtitle, { color: mutedText }]}>
                Elige la carrera cuyos estudiantes deseas consultar.
              </ThemedText>
            </View>

            <Pressable
              style={[
                styles.closeModalButton,
                {
                  backgroundColor: softCard,
                  borderColor: mutedBorder,
                },
              ]}
              onPress={() => setSelectorCarreraVisible(false)}
            >
              <Ionicons name="close" size={20} color={mutedText} />
            </Pressable>
          </View>

          {loadingCarreras ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator color={theme.colors.primary} />

              <ThemedText style={[styles.modalLoadingText, { color: mutedText }]}>
                Cargando carreras...
              </ThemedText>
            </View>
          ) : carreras.length === 0 ? (
            <View style={styles.modalLoading}>
              <Ionicons
                name="alert-circle-outline"
                size={34}
                color={mutedText}
              />

              <ThemedText style={[styles.modalLoadingText, { color: mutedText }]}>
                No existen carreras activas para mostrar.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={styles.carrerasScroll}
              contentContainerStyle={styles.carrerasContent}
              showsVerticalScrollIndicator={false}
            >
              {carreras.map((carrera) => {
                const seleccionada =
                  Number(carrera.idCarrera) === Number(carreraSeleccionadaId);

                const cargando =
                  seleccionandoCarreraId === Number(carrera.idCarrera);

                return (
                  <Pressable
                    key={String(carrera.idCarrera)}
                    disabled={cargando}
                    onPress={() =>
                      void seleccionarCarrera(Number(carrera.idCarrera))
                    }
                    style={({ pressed }) => [
                      styles.carreraOption,
                      {
                        backgroundColor: seleccionada
                          ? isDark
                            ? "rgba(59,130,246,0.20)"
                            : "#EFF6FF"
                          : softCard,
                        borderColor: seleccionada
                          ? theme.colors.primary
                          : mutedBorder,
                        opacity: pressed || cargando ? 0.78 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.carreraOptionIcon,
                        {
                          backgroundColor: seleccionada
                            ? theme.colors.primary
                            : isDark
                              ? "rgba(255,255,255,0.08)"
                              : "#E2E8F0",
                        },
                      ]}
                    >
                      {cargando ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons
                          name={
                            seleccionada
                              ? "checkmark-circle"
                              : "school-outline"
                          }
                          size={19}
                          color={seleccionada ? "#FFFFFF" : mutedText}
                        />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={[
                          styles.carreraOptionTitle,
                          { color: strongText },
                        ]}
                      >
                        {carrera.nombreCarrera}
                      </ThemedText>

                      <ThemedText
                        style={[
                          styles.carreraOptionCode,
                          { color: mutedText },
                        ]}
                      >
                        {carrera.codigo
                          ? `Código: ${carrera.codigo}`
                          : "Carrera académica"}
                      </ThemedText>
                    </View>

                    {seleccionada && !cargando && (
                      <Ionicons
                        name="checkmark"
                        size={22}
                        color={theme.colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const modalNiveles = (
    <Modal
      visible={selectorNivelVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectorNivelVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.modalDismissArea}
          onPress={() => setSelectorNivelVisible(false)}
        />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: mutedBorder,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.modalTitle, { color: strongText }]}>
                Seleccionar {labelNivel.toLowerCase()}
              </ThemedText>

              <ThemedText style={[styles.modalSubtitle, { color: mutedText }]}>
                Las opciones salen de los niveles registrados en las materias de
                la carrera.
              </ThemedText>
            </View>

            <Pressable
              style={[
                styles.closeModalButton,
                {
                  backgroundColor: softCard,
                  borderColor: mutedBorder,
                },
              ]}
              onPress={() => setSelectorNivelVisible(false)}
            >
              <Ionicons name="close" size={20} color={mutedText} />
            </Pressable>
          </View>

          {!carreraSeleccionada ? (
            <View style={styles.modalLoading}>
              <Ionicons name="school-outline" size={34} color={mutedText} />

              <ThemedText style={[styles.modalLoadingText, { color: mutedText }]}>
                Primero selecciona una carrera.
              </ThemedText>
            </View>
          ) : nivelesCarrera.length === 0 ? (
            <View style={styles.modalLoading}>
              <Ionicons
                name="alert-circle-outline"
                size={34}
                color={mutedText}
              />

              <ThemedText style={[styles.modalLoadingText, { color: mutedText }]}>
                Esta carrera no tiene niveles registrados en sus materias.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={styles.carrerasScroll}
              contentContainerStyle={styles.carrerasContent}
              showsVerticalScrollIndicator={false}
            >
              {nivelesCarrera.map((nivel) => {
                const seleccionada = Number(nivel) === Number(nivelSeleccionado);
                const cargando = Number(nivel) === Number(seleccionandoNivel);

                return (
                  <Pressable
                    key={String(nivel)}
                    disabled={cargando}
                    onPress={() => void seleccionarNivel(Number(nivel))}
                    style={({ pressed }) => [
                      styles.carreraOption,
                      {
                        backgroundColor: seleccionada
                          ? isDark
                            ? "rgba(34,197,94,0.18)"
                            : "#DCFCE7"
                          : softCard,
                        borderColor: seleccionada ? greenText : mutedBorder,
                        opacity: pressed || cargando ? 0.78 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.carreraOptionIcon,
                        {
                          backgroundColor: seleccionada
                            ? greenText
                            : isDark
                              ? "rgba(255,255,255,0.08)"
                              : "#E2E8F0",
                        },
                      ]}
                    >
                      {cargando ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons
                          name={seleccionada ? "checkmark-circle" : "layers-outline"}
                          size={19}
                          color={seleccionada ? "#FFFFFF" : mutedText}
                        />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={[
                          styles.carreraOptionTitle,
                          { color: strongText },
                        ]}
                      >
                        {obtenerNivelTexto(carreraSeleccionada, nivel)}
                      </ThemedText>

                      <ThemedText
                        style={[
                          styles.carreraOptionCode,
                          { color: mutedText },
                        ]}
                      >
                        Nivel registrado en materias activas
                      </ThemedText>
                    </View>

                    {seleccionada && !cargando && (
                      <Ionicons name="checkmark" size={22} color={greenText} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  if (!carreraSeleccionada) {
    return (
      <>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: mutedBorder,
            },
          ]}
        >
          <View style={styles.requiredCareerBox}>
            <View
              style={[
                styles.requiredCareerIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(59,130,246,0.18)"
                    : "#DBEAFE",
                },
              ]}
            >
              <Ionicons
                name="school-outline"
                size={34}
                color={theme.colors.primary}
              />
            </View>

            <ThemedText
              style={[styles.requiredCareerTitle, { color: strongText }]}
            >
              Selecciona una carrera
            </ThemedText>

            <ThemedText
              style={[styles.requiredCareerSubtitle, { color: mutedText }]}
            >
              Primero debes elegir una carrera para cargar únicamente a sus
              estudiantes.
            </ThemedText>

            <Pressable
              disabled={loadingCarreras}
              onPress={() => setSelectorCarreraVisible(true)}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: pressed || loadingCarreras ? 0.75 : 1,
                },
              ]}
            >
              {loadingCarreras ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="school" size={18} color="#FFFFFF" />
              )}

              <ThemedText style={styles.primaryBtnText}>
                {loadingCarreras
                  ? "Cargando carreras..."
                  : "Elegir carrera para visualizar alumnos"}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {modalCarreras}
      </>
    );
  }

  if (nivelSeleccionado === null) {
    return (
      <>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: mutedBorder,
            },
          ]}
        >
          <View style={styles.requiredCareerBox}>
            <View
              style={[
                styles.requiredCareerIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(34,197,94,0.18)"
                    : "#DCFCE7",
                },
              ]}
            >
              <Ionicons name="layers-outline" size={34} color={greenText} />
            </View>

            <ThemedText
              style={[styles.requiredCareerTitle, { color: strongText }]}
            >
              Selecciona {labelNivel.toLowerCase()}
            </ThemedText>

            <ThemedText
              style={[styles.requiredCareerSubtitle, { color: mutedText }]}
            >
              Carrera seleccionada: {carreraSeleccionada.nombreCarrera}. Ahora
              elige el {labelNivel.toLowerCase()} que deseas consultar.
            </ThemedText>

            <View style={styles.requiredActions}>
              <Pressable
                onPress={() => setSelectorCarreraVisible(true)}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  {
                    borderColor: mutedBorder,
                    backgroundColor: softCard,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={18}
                  color={mutedText}
                />

                <ThemedText style={[styles.secondaryBtnText, { color: mutedText }]}>
                  Cambiar carrera
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setSelectorNivelVisible(true)}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Ionicons name="layers" size={18} color="#FFFFFF" />

                <ThemedText style={styles.primaryBtnText}>
                  Elegir {labelNivel.toLowerCase()}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {modalCarreras}
        {modalNiveles}
      </>
    );
  }

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: mutedBorder,
          },
        ]}
      >
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <View style={styles.titleBox}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isDark
                    ? "rgba(59,130,246,0.18)"
                    : "#DBEAFE",
                },
              ]}
            >
              <Ionicons name="people" size={22} color={theme.colors.primary} />
            </View>

            <View style={styles.titleContent}>
              <ThemedText style={[styles.title, { color: strongText }]}>
                Estudiantes
              </ThemedText>

              <ThemedText style={[styles.subtitle, { color: mutedText }]}>
                {filtrados.length} de {estudiantes.length} estudiantes en{" "}
                {carreraSeleccionada.nombreCarrera} · {nivelSeleccionadoTexto}
              </ThemedText>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setSelectorCarreraVisible(true)}
              style={({ pressed }) => [
                styles.changeCareerButton,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: isDark
                    ? "rgba(59,130,246,0.13)"
                    : "#EFF6FF",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={17}
                color={theme.colors.primary}
              />

              <ThemedText
                numberOfLines={1}
                style={[
                  styles.changeCareerText,
                  { color: theme.colors.primary },
                ]}
              >
                Carrera
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setSelectorNivelVisible(true)}
              style={({ pressed }) => [
                styles.changeCareerButton,
                {
                  borderColor: greenText,
                  backgroundColor: isDark
                    ? "rgba(34,197,94,0.13)"
                    : "#DCFCE7",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Ionicons name="layers-outline" size={17} color={greenText} />

              <ThemedText
                numberOfLines={1}
                style={[styles.changeCareerText, { color: greenText }]}
              >
                {labelNivel}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.selectedCareerPill,
            {
              backgroundColor: isDark
                ? "rgba(34,197,94,0.12)"
                : "#DCFCE7",
              borderColor: isDark
                ? "rgba(74,222,128,0.34)"
                : "#86EFAC",
            },
          ]}
        >
          <Ionicons name="school" size={16} color={greenText} />

          <ThemedText style={[styles.selectedCareerText, { color: greenText }]}>
            Carrera: {carreraSeleccionada.nombreCarrera}
            {carreraSeleccionada.codigo
              ? ` (${carreraSeleccionada.codigo})`
              : ""}{" "}
            · {nivelSeleccionadoTexto}
          </ThemedText>
        </View>

        <View
          style={[
            styles.searchBox,
            {
              borderColor: mutedBorder,
              backgroundColor: softCard,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={mutedText} />

          <TextInput
            placeholder="Buscar por nombre, CI, matrícula, correo o celular"
            placeholderTextColor={mutedText}
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setPage(1);
            }}
            style={[styles.searchInput, { color: strongText }]}
          />

          {search.length > 0 && (
            <Pressable onPress={limpiarBusqueda}>
              <Ionicons name="close-circle" size={20} color={mutedText} />
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />

            <ThemedText style={[styles.loadingText, { color: mutedText }]}>
              Cargando estudiantes...
            </ThemedText>
          </View>
        ) : filtrados.length === 0 ? (
          <View style={styles.emptyBox}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "#F1F5F9",
                },
              ]}
            >
              <Ionicons name="people-outline" size={42} color={mutedText} />
            </View>

            <ThemedText style={[styles.emptyTitle, { color: strongText }]}>
              No hay estudiantes para esta selección
            </ThemedText>

            <ThemedText style={[styles.emptyText, { color: mutedText }]}>
              {search.trim()
                ? "No existen coincidencias con la búsqueda realizada."
                : "No existen estudiantes disponibles para la carrera y nivel seleccionados."}
            </ThemedText>
          </View>
        ) : (
          <>
            <View
              style={[
                styles.tableShell,
                {
                  borderColor: mutedBorder,
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
                    {
                      backgroundColor: softHeader,
                      borderColor: mutedBorder,
                    },
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
                        Datos
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
                          styles.thNivel,
                          { color: mutedText },
                        ]}
                      >
                        {labelNivel}
                      </ThemedText>

                      <ThemedText
                        style={[
                          styles.th,
                          styles.thYear,
                          { color: mutedText },
                        ]}
                      >
                        Año
                      </ThemedText>

                      <ThemedText
                        style={[
                          styles.th,
                          styles.thContact,
                          { color: mutedText },
                        ]}
                      >
                        Contacto
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
                {estudiantesPagina.map((item) => {
                  const nombre = nombreCompleto(item);
                  const inscrito = estaInscrito(item.yaInscrito);
                  const anio = obtenerAnioInscripcion(item);

                  const backgroundColor = inscrito
                    ? greenRowBackground
                    : softCard;

                  const borderColor = inscrito
                    ? greenRowBorder
                    : mutedBorder;

                  if (isMobile) {
                    return (
                      <MobileStudentCard
                        key={item.id}
                        item={item}
                        nombre={nombre}
                        nivel={nivelSeleccionadoTexto}
                        anio={anio}
                        strongText={strongText}
                        mutedText={mutedText}
                        primary={theme.colors.primary}
                        isDark={isDark}
                        inscrito={inscrito}
                        greenText={greenText}
                        backgroundColor={backgroundColor}
                        borderColor={borderColor}
                        onInscribir={() => onInscribir(item)}
                        onVerPdf={() => onVerPdf(item)}
                      />
                    );
                  }

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.row,
                        {
                          backgroundColor,
                          borderColor,
                        },
                      ]}
                    >
                      {isCompact ? (
                        <>
                          <View style={styles.studentCompactCell}>
                            <StudentIdentity
                              nombre={nombre}
                              email={item.email}
                              primary={theme.colors.primary}
                              isDark={isDark}
                              strongText={strongText}
                              mutedText={mutedText}
                              inscrito={inscrito}
                              greenText={greenText}
                            />
                          </View>

                          <View style={styles.dataCompactCell}>
                            <ThemedText
                              numberOfLines={1}
                              style={[
                                styles.compactDataPrimary,
                                { color: strongText },
                              ]}
                            >
                              CI: {item.ci || "—"}{" "}
                              {item.expedido ? `· ${item.expedido}` : ""}
                            </ThemedText>

                            <ThemedText
                              numberOfLines={1}
                              style={[
                                styles.compactDataText,
                                { color: mutedText },
                              ]}
                            >
                              Matrícula: {item.matricula || "Sin matrícula"}
                            </ThemedText>

                            <ThemedText
                              numberOfLines={1}
                              style={[
                                styles.compactDataText,
                                { color: mutedText },
                              ]}
                            >
                              {nivelSeleccionadoTexto} · Año: {anio}
                            </ThemedText>

                            <ThemedText
                              numberOfLines={1}
                              style={[
                                styles.compactDataText,
                                { color: mutedText },
                              ]}
                            >
                              Celular: {item.celular || "Sin celular"}
                            </ThemedText>
                          </View>

                          <View style={styles.actionsCompactCell}>
                            <ActionButton
                              label={inscrito ? "Inscrito" : "Inscribir"}
                              icon={
                                inscrito
                                  ? "checkmark-circle"
                                  : "school-outline"
                              }
                              color={
                                inscrito ? "#16A34A" : theme.colors.primary
                              }
                              isDark={isDark}
                              compact={compactActions}
                              disabled={inscrito}
                              onPress={() => onInscribir(item)}
                            />

                            <ActionButton
                              label="PDF"
                              icon="document-text-outline"
                              color="#16A34A"
                              isDark={isDark}
                              compact={compactActions}
                              onPress={() => onVerPdf(item)}
                            />
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={styles.ciCell}>
                            <ThemedText
                              numberOfLines={1}
                              style={[styles.ciText, { color: strongText }]}
                            >
                              {item.ci || "—"}
                            </ThemedText>

                            {item.expedido && (
                              <ThemedText
                                numberOfLines={1}
                                style={[
                                  styles.smallText,
                                  { color: mutedText },
                                ]}
                              >
                                {item.expedido}
                              </ThemedText>
                            )}
                          </View>

                          <View style={styles.matriculaCell}>
                            <ThemedText
                              numberOfLines={1}
                              style={[
                                styles.matriculaText,
                                { color: strongText },
                              ]}
                            >
                              {item.matricula || "Sin matrícula"}
                            </ThemedText>
                          </View>

                          <View style={styles.studentCell}>
                            <StudentIdentity
                              nombre={nombre}
                              email={item.email}
                              primary={theme.colors.primary}
                              isDark={isDark}
                              strongText={strongText}
                              mutedText={mutedText}
                              inscrito={inscrito}
                              greenText={greenText}
                            />
                          </View>

                          <View style={styles.nivelCell}>
                            <ThemedText
                              numberOfLines={1}
                              style={[styles.normalText, { color: strongText }]}
                            >
                              {nivelSeleccionadoTexto}
                            </ThemedText>
                          </View>

                          <View style={styles.yearCell}>
                            <ThemedText
                              numberOfLines={1}
                              style={[styles.normalText, { color: strongText }]}
                            >
                              {anio}
                            </ThemedText>
                          </View>

                          <View style={styles.contactCell}>
                            <ThemedText
                              numberOfLines={1}
                              style={[styles.normalText, { color: strongText }]}
                            >
                              {item.celular || "Sin celular"}
                            </ThemedText>

                            <ThemedText
                              numberOfLines={1}
                              style={[
                                styles.smallText,
                                { color: mutedText },
                              ]}
                            >
                              {item.email || "Sin correo"}
                            </ThemedText>
                          </View>

                          <View style={styles.actionsCell}>
                            <ActionButton
                              label={inscrito ? "Inscrito" : "Inscribir"}
                              icon={
                                inscrito
                                  ? "checkmark-circle"
                                  : "school-outline"
                              }
                              color={
                                inscrito ? "#16A34A" : theme.colors.primary
                              }
                              isDark={isDark}
                              compact={false}
                              disabled={inscrito}
                              onPress={() => onInscribir(item)}
                            />

                            <ActionButton
                              label="PDF"
                              icon="document-text-outline"
                              color="#16A34A"
                              isDark={isDark}
                              compact={false}
                              onPress={() => onVerPdf(item)}
                            />
                          </View>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            <View
              style={[styles.pagination, isMobile && styles.paginationMobile]}
            >
              <View>
                <ThemedText style={[styles.pageText, { color: strongText }]}>
                  Página {currentPage} de {totalPages}
                </ThemedText>

                <ThemedText style={[styles.pageSubText, { color: mutedText }]}>
                  Mostrando {estudiantesPagina.length} de {filtrados.length}
                </ThemedText>
              </View>

              <View style={styles.pageActions}>
                <Pressable
                  disabled={currentPage === 1}
                  onPress={cambiarPaginaAnterior}
                  style={({ pressed }) => [
                    styles.pageBtn,
                    {
                      borderColor: mutedBorder,
                      backgroundColor:
                        currentPage === 1 ? softCard : theme.colors.primary,
                      opacity: pressed ? 0.78 : currentPage === 1 ? 0.55 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={currentPage === 1 ? mutedText : "#FFFFFF"}
                  />

                  <ThemedText
                    style={[
                      styles.pageBtnText,
                      {
                        color: currentPage === 1 ? mutedText : "#FFFFFF",
                      },
                    ]}
                  >
                    Anterior
                  </ThemedText>
                </Pressable>

                <Pressable
                  disabled={currentPage === totalPages}
                  onPress={cambiarPaginaSiguiente}
                  style={({ pressed }) => [
                    styles.pageBtn,
                    {
                      borderColor: mutedBorder,
                      backgroundColor:
                        currentPage === totalPages
                          ? softCard
                          : theme.colors.primary,
                      opacity:
                        pressed || currentPage === totalPages ? 0.65 : 1,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.pageBtnText,
                      {
                        color:
                          currentPage === totalPages ? mutedText : "#FFFFFF",
                      },
                    ]}
                  >
                    Siguiente
                  </ThemedText>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={currentPage === totalPages ? mutedText : "#FFFFFF"}
                  />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>

      {modalCarreras}
      {modalNiveles}
    </>
  );
}

function StudentIdentity({
  nombre,
  email,
  primary,
  isDark,
  strongText,
  mutedText,
  inscrito,
  greenText,
}: {
  nombre: string;
  email?: string | null;
  primary: string;
  isDark: boolean;
  strongText: string;
  mutedText: string;
  inscrito: boolean;
  greenText: string;
}) {
  return (
    <View style={styles.studentBox}>
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: inscrito
              ? isDark
                ? "rgba(74,222,128,0.22)"
                : "#BBF7D0"
              : isDark
                ? "rgba(59,130,246,0.18)"
                : "#DBEAFE",
          },
        ]}
      >
        <ThemedText
          style={[
            styles.avatarText,
            {
              color: inscrito ? greenText : primary,
            },
          ]}
        >
          {obtenerIniciales(nombre)}
        </ThemedText>
      </View>

      <View style={styles.studentIdentityText}>
        <ThemedText
          numberOfLines={1}
          style={[styles.nameText, { color: strongText }]}
        >
          {nombre || "Sin nombre"}
        </ThemedText>

        {inscrito ? (
          <View
            style={[
              styles.enrolledBadge,
              {
                backgroundColor: isDark
                  ? "rgba(74,222,128,0.18)"
                  : "#BBF7D0",
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={12} color={greenText} />

            <ThemedText
              style={[
                styles.enrolledBadgeText,
                {
                  color: greenText,
                },
              ]}
            >
              Ya inscrito
            </ThemedText>
          </View>
        ) : email ? (
          <ThemedText
            numberOfLines={1}
            style={[styles.smallText, { color: mutedText }]}
          >
            {email}
          </ThemedText>
        ) : (
          <ThemedText
            numberOfLines={1}
            style={[styles.smallText, { color: mutedText }]}
          >
            Pendiente de inscripción
          </ThemedText>
        )}
      </View>
    </View>
  );
}

function MobileStudentCard({
  item,
  nombre,
  nivel,
  anio,
  strongText,
  mutedText,
  primary,
  isDark,
  inscrito,
  greenText,
  backgroundColor,
  borderColor,
  onInscribir,
  onVerPdf,
}: {
  item: EstudianteTabla;
  nombre: string;
  nivel: string;
  anio: string;
  strongText: string;
  mutedText: string;
  primary: string;
  isDark: boolean;
  inscrito: boolean;
  greenText: string;
  backgroundColor: string;
  borderColor: string;
  onInscribir: () => void;
  onVerPdf: () => void;
}) {
  return (
    <View
      style={[
        styles.mobileCard,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <StudentIdentity
        nombre={nombre}
        email={item.email}
        primary={primary}
        isDark={isDark}
        strongText={strongText}
        mutedText={mutedText}
        inscrito={inscrito}
        greenText={greenText}
      />

      <View style={[styles.mobileDivider, { backgroundColor: borderColor }]} />

      <View style={styles.mobileInfoGrid}>
        <MobileInfo
          label="CI"
          value={`${item.ci || "—"}${
            item.expedido ? ` · ${item.expedido}` : ""
          }`}
          strongText={strongText}
          mutedText={mutedText}
        />

        <MobileInfo
          label="Matrícula"
          value={item.matricula || "Sin matrícula"}
          strongText={strongText}
          mutedText={mutedText}
        />

        <MobileInfo
          label="Nivel"
          value={nivel}
          strongText={strongText}
          mutedText={mutedText}
        />

        <MobileInfo
          label="Año"
          value={anio}
          strongText={strongText}
          mutedText={mutedText}
        />

        <MobileInfo
          label="Celular"
          value={item.celular || "Sin celular"}
          strongText={strongText}
          mutedText={mutedText}
        />

        <MobileInfo
          label="Fecha inscripción"
          value={formatearFecha(item.fechaInscripcion)}
          strongText={strongText}
          mutedText={mutedText}
        />
      </View>

      <View style={styles.mobileActions}>
        <ActionButton
          label={inscrito ? "Inscrito" : "Inscribir"}
          icon={inscrito ? "checkmark-circle" : "school-outline"}
          color={inscrito ? "#16A34A" : primary}
          isDark={isDark}
          compact={false}
          disabled={inscrito}
          onPress={onInscribir}
        />

        <ActionButton
          label="Ver PDF"
          icon="document-text-outline"
          color="#16A34A"
          isDark={isDark}
          compact={false}
          onPress={onVerPdf}
        />
      </View>
    </View>
  );
}

function MobileInfo({
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
    <View style={styles.mobileInfoItem}>
      <ThemedText style={[styles.mobileInfoLabel, { color: mutedText }]}>
        {label}
      </ThemedText>

      <ThemedText
        numberOfLines={1}
        style={[styles.mobileInfoValue, { color: strongText }]}
      >
        {value}
      </ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  color,
  isDark,
  compact,
  disabled = false,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isDark: boolean;
  compact: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        compact && styles.actionBtnCompact,
        {
          backgroundColor: isDark ? `${color}26` : `${color}14`,
          borderColor: isDark ? `${color}66` : `${color}38`,
          opacity: disabled ? 0.64 : pressed ? 0.78 : 1,
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={color} />

      {!compact && (
        <ThemedText numberOfLines={1} style={[styles.actionText, { color }]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}