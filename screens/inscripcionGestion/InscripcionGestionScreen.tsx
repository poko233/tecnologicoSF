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

import { useInscripcionGestion } from "./hooks/useInscripcionGestion";
import { styles } from "./styles/inscripcionGestion.styles";
import {
    carreraDisponibleParaInscribirIG,
    estadoColorKeyIG,
    motivoBloqueoCarreraIG,
    textoGestionIG,
} from "./utils/inscripcionGestion.utils";

export default function InscripcionGestionScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 850;

  const {
    loadingDatos,
    cargandoGestion,
    inscribiendo,

    gestiones,
    carreras,
    carrerasNoDisponibles,

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

  const getEstadoColors = (estado?: string | null) => {
    const key = estadoColorKeyIG(estado);

    if (key === "green") {
      return { color: green, bg: greenSoft, border: green };
    }

    if (key === "red") {
      return { color: red, bg: redSoft, border: red };
    }

    return { color: yellow, bg: yellowSoft, border: yellow };
  };

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
                  name="layers-outline"
                  size={28}
                  color={theme.colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.title, { color: strongText }]}>
                  Inscripción por gestión
                </ThemedText>

                <ThemedText style={[styles.subtitle, { color: mutedText }]}>
                  Elige una gestión activa y luego selecciona las carreras
                  disponibles para inscribirlas.
                </ThemedText>
              </View>
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
                name="school-outline"
                size={18}
                color={theme.colors.primary}
              />

              <ThemedText
                style={[styles.counterText, { color: theme.colors.primary }]}
              >
                {carrerasSeleccionadas.length} seleccionadas
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.selectionGrid, isMobile && styles.selectionGridMobile]}>
          <View style={styles.selectionColumn}>
            <View
              style={[
                styles.card,
                styles.sameHeightCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <ThemedText
                    style={[styles.sectionTitle, { color: strongText }]}
                  >
                    1. Gestión activa
                  </ThemedText>

                  <ThemedText
                    style={[styles.sectionSubtitle, { color: mutedText }]}
                  >
                    Solo se muestran gestiones activas.
                  </ThemedText>
                </View>

                {(loadingDatos || cargandoGestion) && (
                  <ActivityIndicator color={theme.colors.primary} />
                )}
              </View>

              {gestionesActivas.length === 0 ? (
                <View style={styles.emptyPanelCompact}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={38}
                    color={yellow}
                  />

                  <ThemedText style={[styles.emptyTitle, { color: strongText }]}>
                    No hay gestiones activas
                  </ThemedText>

                  <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                    Debes abrir una gestión activa antes de inscribir carreras.
                  </ThemedText>
                </View>
              ) : (
                <ScrollView
                  nestedScrollEnabled
                  style={styles.gestionScroll}
                  contentContainerStyle={styles.carrerasScrollContent}
                  showsVerticalScrollIndicator
                >
                  {gestionesActivas.map((gestion) => {
                    const selected = gestionSeleccionada?.id === gestion.id;
                    const colors = getEstadoColors(gestion.estado);

                    return (
                      <Pressable
                        key={gestion.id}
                        onPress={() => void seleccionarGestion(gestion)}
                        style={({ pressed }) => [
                          styles.listRow,
                          {
                            backgroundColor: selected ? colors.bg : soft,
                            borderColor: selected ? colors.border : border,
                            opacity: pressed ? 0.75 : 1,
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
                            Estado: {gestion.estado} · ID: {gestion.id}
                          </ThemedText>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: colors.bg,
                            },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.statusText,
                              { color: colors.color },
                            ]}
                          >
                            {gestion.estado}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>

          <View style={styles.selectionColumn}>
            <View
              style={[
                styles.card,
                styles.sameHeightCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: border,
                },
              ]}
            >
              <View style={styles.toolbar}>
                <View>
                  <ThemedText
                    style={[styles.sectionTitle, { color: strongText }]}
                  >
                    2. Carreras disponibles
                  </ThemedText>

                  <ThemedText
                    style={[styles.sectionSubtitle, { color: mutedText }]}
                  >
                    Disponibles: {carreras.length} · No disponibles:{" "}
                    {carrerasNoDisponibles.length} · Seleccionadas:{" "}
                    {carrerasSeleccionadas.length}
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
                      Todas libres
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
                      Limpiar
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              {cargandoGestion || loadingDatos ? (
                <View style={styles.loadingPanelCompact}>
                  <ActivityIndicator color={theme.colors.primary} size="large" />

                  <ThemedText
                    style={[styles.loadingTitle, { color: strongText }]}
                  >
                    Actualizando carreras
                  </ThemedText>

                  <ThemedText
                    style={[styles.loadingText, { color: mutedText }]}
                  >
                    Buscando carreras libres para la gestión seleccionada.
                  </ThemedText>
                </View>
              ) : carreras.length === 0 ? (
                <View style={styles.emptyPanelCompact}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={38}
                    color={yellow}
                  />

                  <ThemedText style={[styles.emptyTitle, { color: strongText }]}>
                    No hay carreras disponibles
                  </ThemedText>

                  <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                    Las carreras compatibles pueden estar ya asignadas, sin
                    estudiantes, sin materias activas o sin grupos con cupos.
                  </ThemedText>
                </View>
              ) : (
                <ScrollView
                  nestedScrollEnabled
                  style={styles.carrerasScroll}
                  contentContainerStyle={styles.carrerasScrollContent}
                  showsVerticalScrollIndicator
                >
                  {carreras.map((carrera) => {
                    const selected = carrerasSeleccionadas.includes(
                      Number(carrera.idCarrera),
                    );

                    const disponible =
                      carreraDisponibleParaInscribirIG(carrera);

                    return (
                      <Pressable
                        key={carrera.idCarrera}
                        disabled={!disponible}
                        onPress={() => toggleCarrera(carrera)}
                        style={({ pressed }) => [
                          styles.listRow,
                          {
                            backgroundColor: selected ? primarySoft : soft,
                            borderColor: selected
                              ? theme.colors.primary
                              : border,
                            opacity: !disponible ? 0.72 : pressed ? 0.75 : 1,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.listIcon,
                            {
                              backgroundColor: selected
                                ? theme.colors.primary
                                : primarySoft,
                            },
                          ]}
                        >
                          <Ionicons
                            name={
                              selected ? "checkmark-circle" : "school-outline"
                            }
                            size={22}
                            color={
                              selected ? "#FFFFFF" : theme.colors.primary
                            }
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
                            numberOfLines={1}
                            style={[styles.listMeta, { color: mutedText }]}
                          >
                            Régimen: {carrera.regimen || "Sin régimen"} ·
                            Estudiantes: {carrera.totalEstudiantes} · Materias:{" "}
                            {carrera.materiasDisponiblesGestion} · Grupos:{" "}
                            {carrera.gruposDisponiblesGestion}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={[
                              styles.listMetaStrong,
                              { color: theme.colors.primary },
                            ]}
                          >
                            Disponible para esta gestión
                          </ThemedText>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: selected
                                ? primarySoft
                                : greenSoft,
                            },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.statusText,
                              {
                                color: selected
                                  ? theme.colors.primary
                                  : green,
                              },
                            ]}
                          >
                            {selected ? "Elegida" : "Libre"}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        </View>

        {carrerasNoDisponibles.length > 0 &&
          !cargandoGestion &&
          !loadingDatos && (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: border,
                },
              ]}
            >
              <ThemedText style={[styles.sectionTitle, { color: strongText }]}>
                Carreras no disponibles
              </ThemedText>

              <ThemedText
                style={[styles.sectionSubtitle, { color: mutedText }]}
              >
                Solo informativo. No se pueden seleccionar.
              </ThemedText>

              <ScrollView
                nestedScrollEnabled
                style={styles.carrerasScroll}
                contentContainerStyle={styles.carrerasScrollContent}
                showsVerticalScrollIndicator
              >
                {carrerasNoDisponibles.map((carrera) => {
                  const motivo = motivoBloqueoCarreraIG(carrera);
                  const ocupado = carrera.estaAsignada;

                  return (
                    <View
                      key={carrera.idCarrera}
                      style={[
                        styles.listRow,
                        {
                          backgroundColor: ocupado ? redSoft : yellowSoft,
                          borderColor: ocupado ? red : yellow,
                          opacity: 0.82,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.listIcon,
                          {
                            backgroundColor: ocupado ? redSoft : yellowSoft,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            ocupado ? "lock-closed-outline" : "warning-outline"
                          }
                          size={22}
                          color={ocupado ? red : yellow}
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
                          numberOfLines={1}
                          style={[styles.listMeta, { color: mutedText }]}
                        >
                          Régimen: {carrera.regimen || "Sin régimen"} ·
                          Estudiantes: {carrera.totalEstudiantes} · Materias:{" "}
                          {carrera.materiasDisponiblesGestion} · Grupos:{" "}
                          {carrera.gruposDisponiblesGestion}
                        </ThemedText>

                        <ThemedText
                          numberOfLines={1}
                          style={[
                            styles.listMetaStrong,
                            { color: ocupado ? red : yellow },
                          ]}
                        >
                          {motivo}
                          {carrera.gestionAsignadaTexto
                            ? ` · ${carrera.gestionAsignadaTexto}`
                            : ""}
                        </ThemedText>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: ocupado ? redSoft : yellowSoft,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.statusText,
                            { color: ocupado ? red : yellow },
                          ]}
                        >
                          {ocupado ? "Asignada" : "No disponible"}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

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
            <View>
              <ThemedText style={[styles.sectionTitle, { color: strongText }]}>
                3. Confirmar inscripción
              </ThemedText>

              <ThemedText style={[styles.sectionSubtitle, { color: mutedText }]}>
                Carreras: {carrerasSeleccionadas.length} · Estudiantes
                estimados: {totalEstudiantesSeleccionados} · Materias:{" "}
                {totalMateriasSeleccionadas}
              </ThemedText>
            </View>

            <Pressable
              disabled={
                inscribiendo ||
                cargandoGestion ||
                !gestionSeleccionada ||
                carrerasSeleccionadas.length === 0
              }
              onPress={() => void inscribirCarreras()}
              style={({ pressed }) => [
                styles.buttonPrimary,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                  opacity:
                    inscribiendo ||
                    cargandoGestion ||
                    !gestionSeleccionada ||
                    carrerasSeleccionadas.length === 0
                      ? 0.5
                      : pressed
                        ? 0.75
                        : 1,
                },
              ]}
            >
              {inscribiendo ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              )}

              <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}>
                Inscribir carreras
              </ThemedText>
            </Pressable>
          </View>

          {carrerasElegidas.length > 0 && (
            <View style={styles.selectedList}>
              {carrerasElegidas.map((carrera) => (
                <View
                  key={carrera.idCarrera}
                  style={[
                    styles.selectedItem,
                    {
                      backgroundColor: primarySoft,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.colors.primary}
                  />

                  <ThemedText
                    numberOfLines={1}
                    style={[
                      styles.selectedItemText,
                      { color: theme.colors.primary },
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
                  {
                    backgroundColor: greenSoft,
                    borderColor: green,
                  },
                ]}
              >
                <ThemedText style={[styles.resultNumber, { color: green }]}>
                  {resultado.totalInscripcionesCreadas}
                </ThemedText>

                <ThemedText style={[styles.resultLabel, { color: green }]}>
                  Inscripciones creadas
                </ThemedText>
              </View>

              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: primarySoft,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.resultNumber,
                    { color: theme.colors.primary },
                  ]}
                >
                  {resultado.cuposDescontados}
                </ThemedText>

                <ThemedText
                  style={[styles.resultLabel, { color: theme.colors.primary }]}
                >
                  Cupos descontados
                </ThemedText>
              </View>

              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: redSoft,
                    borderColor: red,
                  },
                ]}
              >
                <ThemedText style={[styles.resultNumber, { color: red }]}>
                  {resultado.sinCupos.length}
                </ThemedText>

                <ThemedText style={[styles.resultLabel, { color: red }]}>
                  Sin cupos
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}