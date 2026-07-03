import { Ionicons } from "@expo/vector-icons";
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
import { Estudiante } from "../types/asignaciones.types";

type CarreraFiltro = {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string | null;
};

type EstudianteTabla = Estudiante & {
  matricula?: string | null;
  fechaInscripcion?: string | null;
  yaInscrito?: boolean | number | string | null;
};

type Props = {
  estudiantes: EstudianteTabla[];
  carreras: CarreraFiltro[];
  carreraSeleccionadaId: number | null;
  loading: boolean;
  loadingCarreras: boolean;
  onSeleccionarCarrera: (idCarrera: number) => Promise<void> | void;
  onInscribir: (estudiante: EstudianteTabla) => void;
  onVerPdf: (estudiante: EstudianteTabla) => void;
};

const ITEMS_PER_PAGE = 10;

function estaInscrito(valor: EstudianteTabla["yaInscrito"]) {
  return valor === true || valor === 1 || valor === "1";
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) {
    return "Sin fecha";
  }

  const limpia = String(fecha).split("T")[0];

  if (!limpia.includes("-")) {
    return limpia;
  }

  const [year, month, day] = limpia.split("-");

  if (!year || !month || !day) {
    return limpia;
  }

  return `${day}/${month}/${year}`;
}

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
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [seleccionandoCarreraId, setSeleccionandoCarreraId] = useState<
    number | null
  >(null);

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
    if (!carreraSeleccionadaId) {
      return null;
    }

    return (
      carreras.find(
        (carrera) =>
          Number(carrera.idCarrera) === Number(carreraSeleccionadaId),
      ) ?? null
    );
  }, [carreras, carreraSeleccionadaId]);

  useEffect(() => {
    setSearch("");
    setPage(1);
  }, [carreraSeleccionadaId]);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) {
      return estudiantes;
    }

    return estudiantes.filter((estudiante) => {
      const nombreCompleto = `${estudiante.nombres ?? ""} ${
        estudiante.apellidoPaterno ?? ""
      } ${estudiante.apellidoMaterno ?? ""}`
        .replace(/\s+/g, " ")
        .trim();

      return (
        nombreCompleto.toLowerCase().includes(q) ||
        String(estudiante.ci ?? "").toLowerCase().includes(q) ||
        String(estudiante.matricula ?? "").toLowerCase().includes(q) ||
        String(estudiante.fechaInscripcion ?? "").toLowerCase().includes(q) ||
        String(estudiante.email ?? "").toLowerCase().includes(q) ||
        String(estudiante.celular ?? "").toLowerCase().includes(q)
      );
    });
  }, [estudiantes, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtrados.length / ITEMS_PER_PAGE),
  );

  const currentPage = Math.min(page, totalPages);

  const estudiantesPagina = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filtrados.slice(start, start + ITEMS_PER_PAGE);
  }, [filtrados, currentPage]);

  const seleccionarCarrera = async (idCarrera: number) => {
    try {
      setSeleccionandoCarreraId(idCarrera);

      await onSeleccionarCarrera(idCarrera);

      setSelectorVisible(false);
    } finally {
      setSeleccionandoCarreraId(null);
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
      visible={selectorVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectorVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.modalDismissArea}
          onPress={() => setSelectorVisible(false)}
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

              <ThemedText
                style={[styles.modalSubtitle, { color: mutedText }]}
              >
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
              onPress={() => setSelectorVisible(false)}
            >
              <Ionicons name="close" size={20} color={mutedText} />
            </Pressable>
          </View>

          {loadingCarreras ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator color={theme.colors.primary} />

              <ThemedText
                style={[styles.modalLoadingText, { color: mutedText }]}
              >
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

              <ThemedText
                style={[styles.modalLoadingText, { color: mutedText }]}
              >
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
                  Number(carrera.idCarrera) ===
                  Number(carreraSeleccionadaId);

                const cargando =
                  seleccionandoCarreraId === Number(carrera.idCarrera);

                return (
                  <Pressable
                    key={carrera.idCarrera}
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
              onPress={() => setSelectorVisible(true)}
              style={({ pressed }) => [
                styles.selectCareerButton,
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

              <ThemedText style={styles.selectCareerButtonText}>
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
                {carreraSeleccionada.nombreCarrera}
              </ThemedText>
            </View>
          </View>

          <Pressable
            onPress={() => setSelectorVisible(true)}
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
              Cambiar carrera
            </ThemedText>
          </Pressable>
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
            Carrera seleccionada: {carreraSeleccionada.nombreCarrera}
            {carreraSeleccionada.codigo
              ? ` (${carreraSeleccionada.codigo})`
              : ""}
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
              Cargando estudiantes de la carrera seleccionada...
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
              No hay estudiantes para esta carrera
            </ThemedText>

            <ThemedText style={[styles.emptySubtitle, { color: mutedText }]}>
              {search.trim()
                ? "No existen coincidencias con la búsqueda realizada."
                : "Todavía no existen estudiantes asociados a esta carrera."}
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
                        Datos de registro
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
                          styles.thContact,
                          { color: mutedText },
                        ]}
                      >
                        Contacto
                      </ThemedText>

                      <ThemedText
                        style={[
                          styles.th,
                          styles.thDate,
                          { color: mutedText },
                        ]}
                      >
                        Fecha
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
                  const nombreCompleto = `${item.nombres ?? ""} ${
                    item.apellidoPaterno ?? ""
                  } ${item.apellidoMaterno ?? ""}`
                    .replace(/\s+/g, " ")
                    .trim();

                  const inscrito = estaInscrito(item.yaInscrito);

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
                        nombreCompleto={nombreCompleto}
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
                        styles.bodyRow,
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
                              nombreCompleto={nombreCompleto}
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
                              Celular: {item.celular || "Sin celular"} ·{" "}
                              {formatearFecha(item.fechaInscripcion)}
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
                                inscrito
                                  ? "#16A34A"
                                  : theme.colors.primary
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
                              nombreCompleto={nombreCompleto}
                              primary={theme.colors.primary}
                              isDark={isDark}
                              strongText={strongText}
                              mutedText={mutedText}
                              inscrito={inscrito}
                              greenText={greenText}
                            />
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
                              {item.email || "Sin email"}
                            </ThemedText>
                          </View>

                          <View style={styles.dateCell}>
                            <ThemedText
                              numberOfLines={1}
                              style={[styles.normalText, { color: strongText }]}
                            >
                              {formatearFecha(item.fechaInscripcion)}
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
                                inscrito
                                  ? "#16A34A"
                                  : theme.colors.primary
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

            <View style={[styles.pagination, isMobile && styles.paginationMobile]}>
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
                        color:
                          currentPage === 1 ? mutedText : "#FFFFFF",
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
                          currentPage === totalPages
                            ? mutedText
                            : "#FFFFFF",
                      },
                    ]}
                  >
                    Siguiente
                  </ThemedText>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={
                      currentPage === totalPages ? mutedText : "#FFFFFF"
                    }
                  />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>

      {modalCarreras}
    </>
  );
}

function StudentIdentity({
  nombreCompleto,
  email,
  primary,
  isDark,
  strongText,
  mutedText,
  inscrito,
  greenText,
}: {
  nombreCompleto: string;
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
          {nombreCompleto.charAt(0).toUpperCase() || "E"}
        </ThemedText>
      </View>

      <View style={styles.studentIdentityText}>
        <ThemedText
          numberOfLines={1}
          style={[styles.nameText, { color: strongText }]}
        >
          {nombreCompleto || "Sin nombre"}
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
  nombreCompleto,
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
  nombreCompleto: string;
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
        nombreCompleto={nombreCompleto}
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
        compact ? styles.actionBtnIconOnly : styles.actionBtn,
        {
          backgroundColor: isDark ? `${color}26` : `${color}14`,
          borderColor: isDark ? `${color}66` : `${color}38`,
          opacity: disabled ? 0.64 : pressed ? 0.78 : 1,
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
      ]}
    >
      <View style={[styles.actionIconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={14} color="#FFFFFF" />
      </View>

      {!compact && (
        <ThemedText numberOfLines={1} style={[styles.actionText, { color }]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  requiredCareerBox: {
    minHeight: 310,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 34,
  },
  requiredCareerIcon: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  requiredCareerTitle: {
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  requiredCareerSubtitle: {
    maxWidth: 560,
    marginTop: 9,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  selectCareerButton: {
    marginTop: 24,
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selectCareerButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
  },
  headerMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  titleBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  titleContent: {
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12.5,
    fontWeight: "600",
  },
  changeCareerButton: {
    minHeight: 39,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    alignSelf: "flex-start",
  },
  changeCareerText: {
    fontSize: 12,
    fontWeight: "900",
  },
  selectedCareerPill: {
    borderWidth: 1,
    minHeight: 39,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  selectedCareerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },

  searchBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 13,
  },

  loadingBox: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyBox: {
    padding: 50,
    alignItems: "center",
  },
  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  tableShell: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 8,
  },
  tableHeader: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  th: {
    fontSize: 10.5,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.45,
    paddingHorizontal: 7,
  },
  thCi: {
    flex: 0.85,
  },
  thMatricula: {
    flex: 0.95,
  },
  thStudent: {
    flex: 2.15,
  },
  thContact: {
    flex: 1.85,
  },
  thDate: {
    flex: 1.05,
  },
  thActions: {
    flex: 1.45,
  },
  thStudentCompact: {
    flex: 2.2,
  },
  thDataCompact: {
    flex: 2.15,
  },
  thActionsCompact: {
    flex: 1.1,
  },
  rowsBox: {
    gap: 8,
  },
  bodyRow: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  ciCell: {
    flex: 0.85,
    paddingHorizontal: 7,
    justifyContent: "center",
  },
  matriculaCell: {
    flex: 0.95,
    paddingHorizontal: 7,
    justifyContent: "center",
  },
  studentCell: {
    flex: 2.15,
    paddingHorizontal: 7,
    justifyContent: "center",
  },
  contactCell: {
    flex: 1.85,
    paddingHorizontal: 7,
    justifyContent: "center",
  },
  dateCell: {
    flex: 1.05,
    paddingHorizontal: 7,
    justifyContent: "center",
  },
  actionsCell: {
    flex: 1.45,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  studentCompactCell: {
    flex: 2.2,
    paddingHorizontal: 7,
    justifyContent: "center",
  },
  dataCompactCell: {
    flex: 2.15,
    paddingHorizontal: 7,
    justifyContent: "center",
  },
  actionsCompactCell: {
    flex: 1.1,
    paddingHorizontal: 7,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
  },

  ciText: {
    fontSize: 13,
    fontWeight: "900",
  },
  matriculaText: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  normalText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  smallText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  compactDataPrimary: {
    fontSize: 12.5,
    fontWeight: "900",
  },
  compactDataText: {
    marginTop: 2,
    fontSize: 11.25,
    fontWeight: "600",
  },

  studentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minWidth: 0,
  },
  studentIdentityText: {
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "900",
    fontSize: 15,
  },
  nameText: {
    fontSize: 13,
    fontWeight: "900",
  },
  enrolledBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  enrolledBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },

  actionBtn: {
    minHeight: 32,
    flex: 1,
    minWidth: 0,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  actionBtnIconOnly: {
    width: 32,
    height: 32,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconBox: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontWeight: "900",
    fontSize: 10.5,
  },

  mobileCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    gap: 12,
  },
  mobileDivider: {
    height: 1,
    width: "100%",
  },
  mobileInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mobileInfoItem: {
    width: "47%",
  },
  mobileInfoLabel: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  mobileInfoValue: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "800",
  },
  mobileActions: {
    flexDirection: "row",
    gap: 8,
  },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  paginationMobile: {
    alignItems: "stretch",
  },
  pageText: {
    fontSize: 13.5,
    fontWeight: "900",
  },
  pageSubText: {
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: "700",
  },
  pageActions: {
    flexDirection: "row",
    gap: 8,
  },
  pageBtn: {
    minHeight: 38,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.62)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "80%",
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "900",
  },
  modalSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 18,
  },
  closeModalButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalLoading: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  modalLoadingText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
  },
  carrerasScroll: {
    maxHeight: 440,
  },
  carrerasContent: {
    gap: 9,
    paddingBottom: 2,
  },
  carreraOption: {
    minHeight: 66,
    borderRadius: 15,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  carreraOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  carreraOptionTitle: {
    fontSize: 13.5,
    fontWeight: "900",
  },
  carreraOptionCode: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "600",
  },
});