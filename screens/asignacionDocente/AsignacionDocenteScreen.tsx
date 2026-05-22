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

  const puedeGuardar =
    !!materiaSeleccionada &&
    !!idDocenteSeleccionado &&
    gruposSeleccionados.length > 0 &&
    !saving;

  const asignacionesDeMateriaSeleccionada = useMemo(() => {
    if (!materiaSeleccionada) return [];

    return asignaciones.filter(
      (item) => item.idMateria === materiaSeleccionada.idMateria
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

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={[styles.loadingText, { color: theme.colors.text }]}>
          Cargando datos...
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
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.title, { color: theme.colors.text }]}>
              Asignación docente
            </ThemedText>

            <ThemedText
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Selecciona carrera, materia, docente y grupos.
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.statsRow,
            { flexDirection: isMobile ? "column" : "row" },
          ]}
        >
          <StatCard label="Carreras" value={carrerasFiltradas.length} />
          <StatCard label="Grupos" value={grupos.length} />
          <StatCard label="Docentes activos" value={docentes.length} />
        </View>

        <View
          style={[
            styles.topLayout,
            { flexDirection: isMobile ? "column" : "row" },
          ]}
        >
          <View style={{ flex: 1 }}>
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

          <View style={{ flex: 1 }}>
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

        <GruposPanel
          grupos={grupos}
          gruposSeleccionados={gruposSeleccionados}
          onToggleGrupo={toggleGrupo}
        />

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
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.footerTitle, { color: theme.colors.text }]}>
              Resumen
            </ThemedText>

            <ThemedText
              style={[styles.footerText, { color: theme.colors.textSecondary }]}
            >
              {carreraSeleccionada ? "Carrera seleccionada" : "Falta carrera"} ·{" "}
              {materiaSeleccionada ? "Materia seleccionada" : "Falta materia"} ·{" "}
              {idDocenteSeleccionado ? "Docente seleccionado" : "Falta docente"} ·{" "}
              {gruposSeleccionados.length} grupo(s)
            </ThemedText>
          </View>

          <Pressable
            onPress={guardarAsignacion}
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

function StatCard({ label, value }: { label: string; value: number }) {
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
      <ThemedText style={[styles.statNumber, { color: theme.colors.text }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </ThemedText>
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
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    maxWidth: 760,
  },
  statsRow: {
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  statNumber: {
    fontSize: 25,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "600",
  },
  topLayout: {
    gap: 16,
    alignItems: "stretch",
  },
  footer: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  footerText: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: "600",
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