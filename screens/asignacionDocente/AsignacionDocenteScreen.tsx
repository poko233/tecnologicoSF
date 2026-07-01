import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../contexts/ThemeContext";

import AsignacionPanel from "./components/AsignacionPanel";
import AsignacionesMateriaModal from "./components/AsignacionesMateriaModal";
import CarrerasMateriasPanel from "./components/CarrerasMateriasPanel";
import DocenteSelectorModal from "./components/DocenteSelectorModal";
import GruposPanel from "./components/GruposPanel";
import { useAsignacionDocente } from "./hooks/useAsignacionDocente";
import { Materia } from "./types/asignacionDocente.types";

export default function AsignacionDocenteScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 980;

  const [asignacionesModalVisible, setAsignacionesModalVisible] =
    useState(false);

  const {
    loading,
    saving,

    carrerasFiltradas,
    materiasPorSemestre,
    grupos,
    docentes,
    asignaciones,
    asignacionesMateria,

    searchCarrera,
    setSearchCarrera,
    searchMateria,
    setSearchMateria,

    carreraSeleccionada,
    seleccionarCarrera,

    materiaSeleccionada,
    seleccionarMateria,

    idDocenteSeleccionado,
    setIdDocenteSeleccionado,

    gruposSeleccionados,
    toggleGrupo,

    docenteModalVisible,
    setDocenteModalVisible,

    guardarAsignacion,
    limpiarAsignacion,

    eliminarAsignacion,
  } = useAsignacionDocente();

  const docenteSeleccionado = useMemo(() => {
    if (!idDocenteSeleccionado) return null;

    return (
      docentes.find(
        (docente) => docente.idDocente === idDocenteSeleccionado,
      ) ?? null
    );
  }, [docentes, idDocenteSeleccionado]);

  const nombreDocenteSeleccionado = useMemo(() => {
    if (!docenteSeleccionado) return "";

    const usuario = docenteSeleccionado.usuario;

    const nombre = [
      usuario?.nombres ?? "",
      usuario?.apellidoPaterno ?? "",
      usuario?.apellidoMaterno ?? "",
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return nombre || `Docente ${docenteSeleccionado.idDocente}`;
  }, [docenteSeleccionado]);

  const puedeGuardar =
    !!carreraSeleccionada &&
    !!materiaSeleccionada &&
    !!idDocenteSeleccionado &&
    gruposSeleccionados.length > 0 &&
    !saving;

  const progresoActual = [
    carreraSeleccionada,
    materiaSeleccionada,
    idDocenteSeleccionado,
    gruposSeleccionados.length > 0,
  ].filter(Boolean).length;

  const asignacionesDeMateriaSeleccionada = useMemo(() => {
    if (!materiaSeleccionada) return [];

    return asignaciones.filter(
      (item) => item.idMateria === materiaSeleccionada.idMateria,
    );
  }, [asignaciones, materiaSeleccionada]);

  const verAsignacionesMateria = (materia: Materia) => {
    seleccionarMateria(materia);
    setAsignacionesModalVisible(true);
  };

  const asignarDocenteMateria = (materia: Materia) => {
    seleccionarMateria(materia);
    setDocenteModalVisible(true);
  };

  const confirmarGuardar = () => {
    if (!puedeGuardar) return;

    guardarAsignacion();
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />

        <ThemedText
          style={[styles.loadingText, { color: theme.colors.text }]}
        >
          Cargando carreras, materias, docentes y grupos...
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
      >
        <View
          style={[
            styles.header,
            {
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
            },
          ]}
        >
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.headerIcon,
                  { backgroundColor: theme.colors.primarySubtle },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.headerTitleContainer}>
                <ThemedText
                  style={[styles.title, { color: theme.colors.text }]}
                >
                  Asignación docente
                </ThemedText>

                <ThemedText
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Relaciona una materia con un docente y los grupos que dictará.
                </ThemedText>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.progressBadge,
              {
                backgroundColor: theme.colors.primarySubtle,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.progressNumber,
                { color: theme.colors.primary },
              ]}
            >
              {progresoActual}/4
            </ThemedText>

            <ThemedText
              style={[
                styles.progressLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              pasos completados
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.statsRow,
            { flexDirection: isMobile ? "column" : "row" },
          ]}
        >
          <StatCard
            label="Carreras y programas"
            value={carrerasFiltradas.length}
            icon="school-outline"
          />

          <StatCard
            label="Grupos disponibles"
            value={grupos.length}
            icon="albums-outline"
          />

          <StatCard
            label="Docentes activos"
            value={docentes.length}
            icon="people-outline"
          />
        </View>

        <View
          style={[
            styles.topLayout,
            { flexDirection: isMobile ? "column" : "row" },
          ]}
        >
          <View style={styles.layoutColumn}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionNumber,
                  {
                    backgroundColor: carreraSeleccionada
                      ? theme.colors.primary
                      : theme.colors.primarySubtle,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.sectionNumberText,
                    {
                      color: carreraSeleccionada
                        ? theme.colors.primaryForeground
                        : theme.colors.primary,
                    },
                  ]}
                >
                  1
                </ThemedText>
              </View>

              <View style={styles.sectionHeaderInfo}>
                <ThemedText
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  Carrera y materia
                </ThemedText>

                <ThemedText
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Primero busca una carrera; luego selecciona la materia que se
                  asignará.
                </ThemedText>
              </View>
            </View>

            <CarrerasMateriasPanel
              carreras={carrerasFiltradas}
              materiasPorSemestre={materiasPorSemestre}
              asignaciones={asignaciones}
              carreraSeleccionada={carreraSeleccionada}
              materiaSeleccionada={materiaSeleccionada}
              searchCarrera={searchCarrera}
              searchMateria={searchMateria}
              onSearchCarreraChange={setSearchCarrera}
              onSearchMateriaChange={setSearchMateria}
              onSelectCarrera={seleccionarCarrera}
              onSelectMateria={seleccionarMateria}
              onVerAsignaciones={verAsignacionesMateria}
              onAsignarDocente={asignarDocenteMateria}
            />
          </View>

          <View style={styles.layoutColumn}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionNumber,
                  {
                    backgroundColor: idDocenteSeleccionado
                      ? theme.colors.primary
                      : theme.colors.primarySubtle,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.sectionNumberText,
                    {
                      color: idDocenteSeleccionado
                        ? theme.colors.primaryForeground
                        : theme.colors.primary,
                    },
                  ]}
                >
                  2
                </ThemedText>
              </View>

              <View style={styles.sectionHeaderInfo}>
                <ThemedText
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  Docente responsable
                </ThemedText>

                <ThemedText
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Selecciona un docente después de elegir la materia.
                </ThemedText>
              </View>
            </View>

            <AsignacionPanel
              materia={materiaSeleccionada}
              docentes={docentes}
              asignacionesMateria={asignacionesMateria}
              idDocenteSeleccionado={idDocenteSeleccionado}
              saving={saving}
              onOpenDocenteModal={() => {
                if (!materiaSeleccionada) return;

                setDocenteModalVisible(true);
              }}
              onLimpiar={limpiarAsignacion}
            />
          </View>
        </View>

        <View style={styles.gruposSection}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionNumber,
                {
                  backgroundColor:
                    gruposSeleccionados.length > 0
                      ? theme.colors.primary
                      : theme.colors.primarySubtle,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.sectionNumberText,
                  {
                    color:
                      gruposSeleccionados.length > 0
                        ? theme.colors.primaryForeground
                        : theme.colors.primary,
                  },
                ]}
              >
                3
              </ThemedText>
            </View>

            <View style={styles.sectionHeaderInfo}>
              <ThemedText
                style={[styles.sectionTitle, { color: theme.colors.text }]}
              >
                Grupos que dictará el docente
              </ThemedText>

              <ThemedText
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Marca uno o varios grupos. Los horarios visibles debajo de cada
                grupo ayudan a verificar la asignación.
              </ThemedText>
            </View>
          </View>

          <GruposPanel
            grupos={grupos}
            gruposSeleccionados={gruposSeleccionados}
            onToggleGrupo={toggleGrupo}
          />
        </View>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
            },
          ]}
        >
          <View style={styles.footerSummary}>
            <View style={styles.footerTitleRow}>
              <Ionicons
                name={
                  puedeGuardar
                    ? "checkmark-circle-outline"
                    : "information-circle-outline"
                }
                size={21}
                color={
                  puedeGuardar
                    ? theme.colors.success
                    : theme.colors.primary
                }
              />

              <ThemedText
                style={[styles.footerTitle, { color: theme.colors.text }]}
              >
                Resumen de la asignación
              </ThemedText>
            </View>

            <View style={styles.summaryList}>
              <ResumenEstado
                completado={!!carreraSeleccionada}
                texto={
                  carreraSeleccionada
                    ? `Carrera: ${
                        carreraSeleccionada.nombreCarrera ??
                        carreraSeleccionada.nombre ??
                        "Seleccionada"
                      }`
                    : "Falta seleccionar una carrera"
                }
              />

              <ResumenEstado
                completado={!!materiaSeleccionada}
                texto={
                  materiaSeleccionada
                    ? `Materia: ${
                        materiaSeleccionada.nombreMateria ??
                        materiaSeleccionada.nombre ??
                        "Seleccionada"
                      }`
                    : "Falta seleccionar una materia"
                }
              />

              <ResumenEstado
                completado={!!idDocenteSeleccionado}
                texto={
                  idDocenteSeleccionado
                    ? `Docente: ${nombreDocenteSeleccionado}`
                    : "Falta seleccionar un docente"
                }
              />

              <ResumenEstado
                completado={gruposSeleccionados.length > 0}
                texto={
                  gruposSeleccionados.length > 0
                    ? `${gruposSeleccionados.length} grupo(s) seleccionado(s)`
                    : "Falta seleccionar al menos un grupo"
                }
              />
            </View>
          </View>

          <View style={styles.footerActions}>
            {!puedeGuardar && (
              <ThemedText
                style={[
                  styles.saveHelpText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Completa los pasos pendientes para habilitar el guardado.
              </ThemedText>
            )}

            <Pressable
              onPress={confirmarGuardar}
              disabled={!puedeGuardar}
              style={[
                styles.saveButton,
                {
                  backgroundColor: puedeGuardar
                    ? theme.colors.primary
                    : theme.colors.disabled,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator color={theme.colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color={theme.colors.primaryForeground}
                  />

                  <ThemedText
                    style={[
                      styles.saveText,
                      { color: theme.colors.primaryForeground },
                    ]}
                  >
                    Guardar asignación
                  </ThemedText>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <DocenteSelectorModal
        visible={docenteModalVisible}
        docentes={docentes}
        idDocenteSeleccionado={idDocenteSeleccionado}
        onClose={() => setDocenteModalVisible(false)}
        onSelect={(docente) => {
          setIdDocenteSeleccionado(docente.idDocente);
          setDocenteModalVisible(false);
        }}
      />

      <AsignacionesMateriaModal
        visible={asignacionesModalVisible}
        materia={materiaSeleccionada}
        asignaciones={asignacionesDeMateriaSeleccionada}
        onClose={() => setAsignacionesModalVisible(false)}
        onEliminar={eliminarAsignacion}
      />
    </>
  );
}

function ResumenEstado({
  completado,
  texto,
}: {
  completado: boolean;
  texto: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.summaryItem}>
      <Ionicons
        name={completado ? "checkmark-circle" : "ellipse-outline"}
        size={17}
        color={
          completado ? theme.colors.success : theme.colors.textTertiary
        }
      />

      <ThemedText
        numberOfLines={1}
        style={[
          styles.summaryItemText,
          {
            color: completado
              ? theme.colors.text
              : theme.colors.textSecondary,
          },
        ]}
      >
        {texto}
      </ThemedText>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          { backgroundColor: theme.colors.primarySubtle },
        ]}
      >
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>

      <View style={styles.statContent}>
        <ThemedText
          style={[styles.statNumber, { color: theme.colors.text }]}
        >
          {value}
        </ThemedText>

        <ThemedText
          style={[
            styles.statLabel,
            { color: theme.colors.textSecondary },
          ]}
        >
          {label}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    padding: 18,
    gap: 16,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 15,
    fontWeight: "800",
  },

  header: {
    justifyContent: "space-between",
    gap: 14,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },

  progressBadge: {
    minWidth: 142,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  progressNumber: {
    fontSize: 18,
    fontWeight: "900",
  },

  progressLabel: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  statsRow: {
    gap: 12,
  },

  statCard: {
    flex: 1,
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  statContent: {
    flex: 1,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "900",
  },

  statLabel: {
    fontSize: 12,
    marginTop: 1,
    fontWeight: "700",
  },

  topLayout: {
    gap: 16,
    alignItems: "stretch",
  },

  layoutColumn: {
    flex: 1,
    minWidth: 0,
    gap: 10,
  },

  gruposSection: {
    gap: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionNumber: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionNumberText: {
    fontSize: 15,
    fontWeight: "900",
  },

  sectionHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  footer: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },

  footerSummary: {
    flex: 1,
    minWidth: 0,
  },

  footerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  footerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  summaryList: {
    marginTop: 10,
    gap: 6,
  },

  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  summaryItemText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "700",
  },

  footerActions: {
    minWidth: 230,
    gap: 7,
  },

  saveHelpText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    fontWeight: "700",
  },

  saveButton: {
    minHeight: 52,
    borderRadius: 17,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  saveText: {
    fontSize: 14,
    fontWeight: "900",
  },
});