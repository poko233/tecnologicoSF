import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../theme/useTheme";

import GruposCarreraModal from "./components/GruposCarreraModal";
import { useInscripcionGestion } from "./hooks/useInscripcionGestion";
import { styles } from "./styles/inscripcionGestion.styles";
import {
  estadoCarreraGestionIG,
  estadoColorKeyIG,
  textoEstadoCarreraGestionIG,
  textoGestionIG,
} from "./utils/inscripcionGestion.utils";

export default function InscripcionGestionScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 900;

  const {
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

    carrerasSeleccionadas,
    gestionSeleccionada,
    carrerasElegidas,
    carrerasParaAsignar,
    resultado,
    totalGruposParaAsignar,

    gruposModalVisible,
    carreraDetalle,
    detalleGruposCarrera,

    cargarDatos,
    seleccionarGestion,
    toggleCarrera,
    abrirGruposCarrera,
    cerrarGruposCarrera,
    seleccionarTodasCarreras,
    limpiarCarreras,
    asignarCarreras,
  } = useInscripcionGestion();

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const gestionesActivas = useMemo(() => {
    return gestiones.filter(
      (gestion) => String(gestion.estado).toLowerCase() === "activo",
    );
  }, [gestiones]);

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)";
  const soft = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.035)";
  const heroBg = isDark ? "rgba(15,23,42,0.72)" : "rgba(248,250,252,0.9)";
  const primarySoft = isDark ? "rgba(59,130,246,0.18)" : "#DBEAFE";

  const green = isDark ? "#86EFAC" : "#15803D";
  const greenSoft = isDark ? "rgba(34,197,94,0.15)" : "#DCFCE7";

  const red = isDark ? "#FCA5A5" : "#DC2626";
  const redSoft = isDark ? "rgba(239,68,68,0.14)" : "#FEE2E2";

  const yellow = isDark ? "#FDE68A" : "#A16207";
  const yellowSoft = isDark ? "rgba(234,179,8,0.14)" : "#FEF9C3";

  const gray = isDark ? "#CBD5E1" : "#475569";
  const graySoft = isDark ? "rgba(148,163,184,0.12)" : "#F1F5F9";

  const getEstadoGestionColors = (estado?: string | null) => {
    const key = estadoColorKeyIG(estado);

    if (key === "green") {
      return { color: green, bg: greenSoft, border: green };
    }

    if (key === "red") {
      return { color: red, bg: redSoft, border: red };
    }

    return { color: yellow, bg: yellowSoft, border: yellow };
  };

  const puedeGuardar =
    !guardando &&
    !cargandoGestion &&
    Boolean(gestionSeleccionada) &&
    carrerasParaAsignar.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isMobile && styles.contentMobile,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loadingDatos}
            onRefresh={() => {
              void cargarDatos(gestionSeleccionada?.id ?? null);
            }}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View
          style={[
            styles.hero,
            {
              backgroundColor: heroBg,
              borderColor: border,
            },
          ]}
        >
          <View style={[styles.heroTop, isMobile && styles.heroTopMobile]}>
            <View style={styles.titleBox}>
              <View style={[styles.iconBox, { backgroundColor: primarySoft }]}>
                <Ionicons
                  name="git-branch-outline"
                  size={28}
                  color={theme.colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.title, { color: strongText }]}>
                  Carreras por gestión
                </ThemedText>

                <ThemedText style={[styles.subtitle, { color: mutedText }]}>
                  Selecciona una gestión activa y define qué carreras deben
                  trabajar con sus grupos durante esa gestión.
                </ThemedText>
              </View>
            </View>

            <View style={styles.heroCounters}>
              <View
                style={[
                  styles.counterPill,
                  {
                    backgroundColor: greenSoft,
                    borderColor: green,
                  },
                ]}
              >
                <Ionicons name="checkmark-circle" size={18} color={green} />
                <ThemedText style={[styles.counterText, { color: green }]}>
                  {carrerasAsignadas.length} asignadas
                </ThemedText>
              </View>

              <View
                style={[
                  styles.counterPill,
                  {
                    backgroundColor: primarySoft,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <ThemedText
                  style={[styles.counterText, { color: theme.colors.primary }]}
                >
                  {totalGruposParaAsignar} grupos por mover
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.selectionGrid,
            isMobile && styles.selectionGridMobile,
          ]}
        >
          <View
            style={[
              styles.selectionColumnGestion,
              isMobile && styles.selectionColumnGestionMobile,
            ]}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={[styles.sectionTitle, { color: strongText }]}
                  >
                    1. Gestión activa
                  </ThemedText>

                  <ThemedText
                    style={[styles.sectionSubtitle, { color: mutedText }]}
                  >
                    Las gestiones cerradas no pueden recibir carreras.
                  </ThemedText>
                </View>

                {(loadingDatos || cargandoGestion) && (
                  <ActivityIndicator color={theme.colors.primary} />
                )}
              </View>

              {gestionesActivas.length === 0 ? (
                <View style={styles.emptyPanel}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={38}
                    color={yellow}
                  />

                  <ThemedText style={[styles.emptyTitle, { color: strongText }]}>
                    No hay gestiones activas
                  </ThemedText>

                  <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                    Crea o activa una gestión antes de asignar carreras.
                  </ThemedText>
                </View>
              ) : (
                <ScrollView
                  nestedScrollEnabled
                  style={styles.gestionScroll}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator
                >
                  {gestionesActivas.map((gestion) => {
                    const selected = gestionSeleccionada?.id === gestion.id;
                    const colors = getEstadoGestionColors(gestion.estado);

                    return (
                      <Pressable
                        key={gestion.id}
                        onPress={() => void seleccionarGestion(gestion)}
                        style={({ pressed }) => [
                          styles.listRow,
                          {
                            backgroundColor: selected ? colors.bg : soft,
                            borderColor: selected ? colors.border : border,
                            opacity: pressed ? 0.76 : 1,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.listIcon,
                            {
                              backgroundColor: selected
                                ? colors.bg
                                : primarySoft,
                            },
                          ]}
                        >
                          <Ionicons
                            name={
                              selected
                                ? "checkmark-circle"
                                : "calendar-outline"
                            }
                            size={22}
                            color={
                              selected ? colors.color : theme.colors.primary
                            }
                          />
                        </View>

                        <View style={styles.listInfo}>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.listTitle, { color: strongText }]}
                          >
                            {textoGestionIG(gestion)}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={[styles.listMeta, { color: mutedText }]}
                          >
                            Carreras actuales: {gestion.totalCarrerasAsignadas ?? 0}
                          </ThemedText>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: colors.bg },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.statusText,
                              { color: colors.color },
                            ]}
                          >
                            Activa
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>

          <View style={styles.selectionColumnCarreras}>
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
                <View style={{ flex: 1, minWidth: 230 }}>
                  <ThemedText
                    style={[styles.sectionTitle, { color: strongText }]}
                  >
                    2. Carreras compatibles
                  </ThemedText>

                  <ThemedText
                    style={[styles.sectionSubtitle, { color: mutedText }]}
                  >
                    Asignadas: {carrerasAsignadas.length} · Disponibles:{" "}
                    {carrerasDisponibles.length} · Bloqueadas:{" "}
                    {carrerasNoDisponibles.length}
                  </ThemedText>
                </View>

                <View style={styles.toolbarActions}>
                  <Pressable
                    onPress={seleccionarTodasCarreras}
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor: soft,
                        borderColor: border,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkbox-outline"
                      size={17}
                      color={mutedText}
                    />
                    <ThemedText
                      style={[styles.buttonText, { color: mutedText }]}
                    >
                      Seleccionar libres
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    onPress={limpiarCarreras}
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor: soft,
                        borderColor: border,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="close-outline"
                      size={18}
                      color={mutedText}
                    />
                    <ThemedText
                      style={[styles.buttonText, { color: mutedText }]}
                    >
                      Limpiar nuevas
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              <View style={styles.summaryStrip}>
                <View
                  style={[
                    styles.summaryBox,
                    { backgroundColor: greenSoft, borderColor: green },
                  ]}
                >
                  <ThemedText style={[styles.summaryNumber, { color: green }]}>
                    {resumen.totalGruposEnGestion}
                  </ThemedText>
                  <ThemedText style={[styles.summaryLabel, { color: green }]}>
                    Grupos en esta gestión
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.summaryBox,
                    {
                      backgroundColor: primarySoft,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.summaryNumber,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {totalGruposParaAsignar}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.summaryLabel,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Grupos que se moverán
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.summaryBox,
                    { backgroundColor: redSoft, borderColor: red },
                  ]}
                >
                  <ThemedText style={[styles.summaryNumber, { color: red }]}>
                    {carrerasNoDisponibles.length}
                  </ThemedText>
                  <ThemedText style={[styles.summaryLabel, { color: red }]}>
                    Carreras bloqueadas
                  </ThemedText>
                </View>
              </View>

              {cargandoGestion || loadingDatos ? (
                <View style={styles.loadingPanel}>
                  <ActivityIndicator color={theme.colors.primary} size="large" />
                  <ThemedText
                    style={[styles.loadingTitle, { color: strongText }]}
                  >
                    Revisando carreras
                  </ThemedText>
                  <ThemedText
                    style={[styles.loadingText, { color: mutedText }]}
                  >
                    Verificando régimen, grupos y la gestión actual de cada
                    carrera.
                  </ThemedText>
                </View>
              ) : carreras.length === 0 ? (
                <View style={styles.emptyPanel}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={38}
                    color={yellow}
                  />
                  <ThemedText style={[styles.emptyTitle, { color: strongText }]}>
                    No hay carreras compatibles
                  </ThemedText>
                  <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                    No existen carreras activas cuyo régimen corresponda al
                    período de la gestión seleccionada.
                  </ThemedText>
                </View>
              ) : (
                <ScrollView
                  nestedScrollEnabled
                  style={styles.carrerasScroll}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator
                >
                  {carreras.map((carrera) => {
                    const selected = carrerasSeleccionadas.includes(
                      Number(carrera.idCarrera),
                    );
                    const estado = estadoCarreraGestionIG(carrera, selected);

                    const estadoColors = (() => {
                      if (estado === "asignada") {
                        return { color: green, bg: greenSoft, border: green };
                      }
                      if (estado === "parcial") {
                        return {
                          color: yellow,
                          bg: yellowSoft,
                          border: yellow,
                        };
                      }
                      if (estado === "seleccionada") {
                        return {
                          color: theme.colors.primary,
                          bg: primarySoft,
                          border: theme.colors.primary,
                        };
                      }
                      if (estado === "disponible") {
                        return {
                          color: theme.colors.primary,
                          bg: soft,
                          border,
                        };
                      }
                      if (estado === "bloqueada") {
                        return { color: red, bg: redSoft, border: red };
                      }

                      return { color: gray, bg: graySoft, border: gray };
                    })();

                    const totalGrupos = Math.max(
                      Number(carrera.gruposActivos ?? 0),
                      1,
                    );
                    const porcentaje = Math.min(
                      100,
                      Math.round(
                        (Number(carrera.gruposEnGestionSeleccionada ?? 0) /
                          totalGrupos) *
                          100,
                      ),
                    );

                    return (
                      <Pressable
                        key={carrera.idCarrera}
                        onPress={() => toggleCarrera(carrera)}
                        style={({ pressed }) => [
                          styles.listRow,
                          styles.carreraRow,
                          {
                            backgroundColor: estadoColors.bg,
                            borderColor: estadoColors.border,
                            opacity: pressed ? 0.76 : 1,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.listIcon,
                            { backgroundColor: estadoColors.bg },
                          ]}
                        >
                          <Ionicons
                            name={
                              estado === "asignada"
                                ? "checkmark-done-outline"
                                : estado === "bloqueada"
                                  ? "lock-closed-outline"
                                  : "school-outline"
                            }
                            size={22}
                            color={estadoColors.color}
                          />
                        </View>

                        <View style={styles.listInfo}>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.listTitle, { color: strongText }]}
                          >
                            {carrera.nombreCarrera}
                            {carrera.codigo ? ` · ${carrera.codigo}` : ""}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={2}
                            style={[styles.listMeta, { color: mutedText }]}
                          >
                            Régimen: {carrera.regimen || "Sin régimen"} ·
                            Materias activas: {carrera.materiasActivas} · Grupos:{" "}
                            {carrera.gruposEnGestionSeleccionada}/
                            {carrera.gruposActivos} en esta gestión
                          </ThemedText>

                          <View
                            style={[
                              styles.progressTrack,
                              { backgroundColor: border },
                            ]}
                          >
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${porcentaje}%`,
                                  backgroundColor: estadoColors.color,
                                },
                              ]}
                            />
                          </View>

                          <ThemedText
                            numberOfLines={2}
                            style={[
                              styles.listMetaStrong,
                              { color: estadoColors.color },
                            ]}
                          >
                            {carrera.motivoNoDisponible}
                            {carrera.gestionAsignadaTexto &&
                            carrera.asignadaAOtraGestion
                              ? ` · ${carrera.gestionAsignadaTexto}`
                              : ""}
                          </ThemedText>
                        </View>

                        <View style={styles.carreraActionColumn}>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: estadoColors.bg },
                            ]}
                          >
                            <ThemedText
                              style={[
                                styles.statusText,
                                { color: estadoColors.color },
                              ]}
                            >
                              {textoEstadoCarreraGestionIG(estado)}
                            </ThemedText>
                          </View>

                          <Pressable
                            onPress={(event) => {
                              event.stopPropagation();
                              void abrirGruposCarrera(carrera);
                            }}
                            style={({ pressed }) => [
                              styles.viewGroupsButton,
                              {
                                backgroundColor: soft,
                                borderColor: estadoColors.color,
                                opacity: pressed ? 0.72 : 1,
                              },
                            ]}
                          >
                            <Ionicons
                              name="eye-outline"
                              size={15}
                              color={estadoColors.color}
                            />
                            <ThemedText
                              style={[
                                styles.viewGroupsButtonText,
                                { color: estadoColors.color },
                              ]}
                            >
                              Ver grupos
                            </ThemedText>
                          </Pressable>

                          <View
                            style={[
                              styles.checkbox,
                              {
                                backgroundColor: selected
                                  ? estadoColors.color
                                  : "transparent",
                                borderColor: estadoColors.color,
                              },
                            ]}
                          >
                            {selected && (
                              <Ionicons
                                name="checkmark"
                                size={19}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        </View>

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
            <View style={{ flex: 1, minWidth: 250 }}>
              <ThemedText style={[styles.sectionTitle, { color: strongText }]}>
                3. Guardar asignación
              </ThemedText>

              <ThemedText style={[styles.sectionSubtitle, { color: mutedText }]}>
                Nuevas o parciales: {carrerasParaAsignar.length} · Grupos que
                cambiarán de gestión: {totalGruposParaAsignar}
              </ThemedText>
            </View>

            <Pressable
              disabled={!puedeGuardar}
              onPress={() => void asignarCarreras()}
              style={({ pressed }) => [
                styles.buttonPrimary,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                  opacity: !puedeGuardar ? 0.48 : pressed ? 0.76 : 1,
                },
              ]}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              )}

              <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}>
                {carrerasParaAsignar.length > 0
                  ? "Asignar carreras"
                  : "Sin cambios pendientes"}
              </ThemedText>
            </Pressable>
          </View>

          <View
            style={[
              styles.noteBox,
              {
                backgroundColor: yellowSoft,
                borderColor: yellow,
              },
            ]}
          >
            <Ionicons name="information-circle-outline" size={21} color={yellow} />
            <ThemedText style={[styles.noteText, { color: yellow }]}>
              Esta vista no inscribe estudiantes. Mueve a la gestión activa los
              grupos de las carreras elegidas. Los grupos que pertenezcan a otra
              gestión activa quedan bloqueados; los de una gestión cerrada sí
              pueden pasar a la nueva gestión.
            </ThemedText>
          </View>

          {carrerasElegidas.length > 0 && (
            <View style={styles.selectedList}>
              {carrerasElegidas.map((carrera) => (
                <View
                  key={carrera.idCarrera}
                  style={[
                    styles.selectedItem,
                    {
                      backgroundColor: carrera.asignadaAEstaGestion
                        ? greenSoft
                        : primarySoft,
                      borderColor: carrera.asignadaAEstaGestion
                        ? green
                        : theme.colors.primary,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={
                      carrera.asignadaAEstaGestion
                        ? green
                        : theme.colors.primary
                    }
                  />

                  <ThemedText
                    numberOfLines={1}
                    style={[
                      styles.selectedItemText,
                      {
                        color: carrera.asignadaAEstaGestion
                          ? green
                          : theme.colors.primary,
                      },
                    ]}
                  >
                    {carrera.nombreCarrera}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {resultado && (
            <View style={styles.resultGrid}>
              <View
                style={[
                  styles.resultBox,
                  { backgroundColor: greenSoft, borderColor: green },
                ]}
              >
                <ThemedText style={[styles.resultNumber, { color: green }]}>
                  {resultado.totalGruposActualizados}
                </ThemedText>
                <ThemedText style={[styles.resultLabel, { color: green }]}>
                  Grupos actualizados
                </ThemedText>
              </View>

              <View
                style={[
                  styles.resultBox,
                  { backgroundColor: yellowSoft, borderColor: yellow },
                ]}
              >
                <ThemedText style={[styles.resultNumber, { color: yellow }]}>
                  {resultado.omitidos.length}
                </ThemedText>
                <ThemedText style={[styles.resultLabel, { color: yellow }]}>
                  Grupos que ya pertenecían
                </ThemedText>
              </View>

              <View
                style={[
                  styles.resultBox,
                  { backgroundColor: redSoft, borderColor: red },
                ]}
              >
                <ThemedText style={[styles.resultNumber, { color: red }]}>
                  {resultado.bloqueados.length}
                </ThemedText>
                <ThemedText style={[styles.resultLabel, { color: red }]}>
                  Grupos bloqueados
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <GruposCarreraModal
        visible={gruposModalVisible}
        loading={loadingGruposCarrera}
        carreraFallback={carreraDetalle}
        detalle={detalleGruposCarrera}
        onClose={cerrarGruposCarrera}
      />
    </View>
  );
}
