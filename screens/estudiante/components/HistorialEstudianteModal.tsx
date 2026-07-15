import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
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

function getEstadoColors(estado: string, colors: any) {
  const text = colors.text || "#0F172A";
  const muted = colors.mutedForeground || "#64748B";

  if (estado === "APROBADO") {
    return {
      bg: `${colors.success || "#16A34A"}22`,
      border: colors.success || "#16A34A",
      text: colors.success || "#16A34A",
    };
  }

  if (estado === "REPROBADO") {
    return {
      bg: `${colors.destructive || "#DC2626"}22`,
      border: colors.destructive || "#DC2626",
      text: colors.destructive || "#DC2626",
    };
  }

  if (estado === "INSCRITO") {
    return {
      bg: `${colors.primary || "#2563EB"}22`,
      border: colors.primary || "#2563EB",
      text: colors.primary || "#2563EB",
    };
  }

  return {
    bg: `${muted}18`,
    border: colors.border || "#CBD5E1",
    text,
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
  const styles = createHistorialEstudianteStyles(colors);

  const [materiaSeleccionada, setMateriaSeleccionada] =
    useState<MateriaHistorialEstudiante | null>(null);

  const estudianteInfo = historial?.estudiante || estudiante;

  const carrerasAgrupadas = useMemo(
    () =>
      agruparHistorialEstudiantePorCarreraNivel(historial?.materias ?? []),
    [historial?.materias],
  );

  useEffect(() => {
    if (!visible) {
      setMateriaSeleccionada(null);
    }
  }, [visible]);

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {nombreCompleto(estudianteInfo).charAt(0).toUpperCase()}
                </ThemedText>
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={styles.kicker}>
                  Historial estudiante
                </ThemedText>

                <ThemedText style={styles.title}>
                  {nombreCompleto(estudianteInfo)}
                </ThemedText>

                <ThemedText style={styles.subtitle}>
                  CI: {estudianteInfo?.ci || "Sin CI"} · Matrícula:{" "}
                  {obtenerMatricula(estudianteInfo)}
                </ThemedText>
              </View>

              <Pressable onPress={onClose} style={styles.iconClose}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={colors.primary} />

                <ThemedText style={styles.loadingText}>
                  Cargando historial del estudiante...
                </ThemedText>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryCard}>
                    <ThemedText style={styles.summaryValue}>
                      {historial?.resumen.totalMaterias ?? 0}
                    </ThemedText>

                    <ThemedText style={styles.summaryLabel}>
                      Materias
                    </ThemedText>
                  </View>

                  <View style={styles.summaryCard}>
                    <ThemedText style={styles.summaryValue}>
                      {historial?.resumen.aprobadas ?? 0}
                    </ThemedText>

                    <ThemedText style={styles.summaryLabel}>
                      Aprobadas
                    </ThemedText>
                  </View>

                  <View style={styles.summaryCard}>
                    <ThemedText style={styles.summaryValue}>
                      {historial?.resumen.reprobadas ?? 0}
                    </ThemedText>

                    <ThemedText style={styles.summaryLabel}>
                      Reprobadas
                    </ThemedText>
                  </View>

                  <View style={styles.summaryCard}>
                    <ThemedText style={styles.summaryValue}>
                      {formatearNotaFinal(historial?.resumen.promedioGeneral)}
                    </ThemedText>

                    <ThemedText style={styles.summaryLabel}>
                      Promedio
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: colors.success || "#16A34A" },
                      ]}
                    />

                    <ThemedText style={styles.legendText}>Aprobado</ThemedText>
                  </View>

                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: colors.destructive || "#DC2626" },
                      ]}
                    />

                    <ThemedText style={styles.legendText}>Reprobado</ThemedText>
                  </View>

                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: colors.primary || "#2563EB" },
                      ]}
                    />

                    <ThemedText style={styles.legendText}>Inscrito</ThemedText>
                  </View>

                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            colors.mutedForeground || "#64748B",
                        },
                      ]}
                    />

                    <ThemedText style={styles.legendText}>Pendiente</ThemedText>
                  </View>
                </View>

                {carrerasAgrupadas.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons
                      name="file-tray-outline"
                      size={34}
                      color={colors.mutedForeground}
                    />

                    <ThemedText style={styles.emptyTitle}>
                      Sin historial del estudiante
                    </ThemedText>

                    <ThemedText style={styles.emptyText}>
                      No se encontraron materias asociadas a este estudiante.
                    </ThemedText>
                  </View>
                ) : (
                  carrerasAgrupadas.map((carrera) => (
                    <View key={carrera.idCarrera} style={styles.carreraBlock}>
                      <View style={styles.carreraHeader}>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={styles.carreraTitle}>
                            {carrera.nombreCarrera}
                          </ThemedText>

                          <ThemedText style={styles.carreraMeta}>
                            {carrera.regimen || "Sin régimen"} ·{" "}
                            {carrera.tipoCarrera || "Sin tipo"}
                          </ThemedText>
                        </View>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
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
                              const estadoStyle = getEstadoColors(
                                materia.estadoMateria,
                                colors,
                              );

                              return (
                                <Pressable
                                  key={`${materia.idCarrera}-${materia.idMateria}`}
                                  onPress={() => setMateriaSeleccionada(materia)}
                                  style={({ pressed }) => [
                                    styles.materiaCard,
                                    {
                                      backgroundColor: estadoStyle.bg,
                                      borderColor: estadoStyle.border,
                                      opacity: pressed ? 0.75 : 1,
                                    },
                                  ]}
                                >
                                  <ThemedText
                                    style={[
                                      styles.materiaTitle,
                                      { color: estadoStyle.text },
                                    ]}
                                    numberOfLines={2}
                                  >
                                    {materia.nombreMateria}
                                  </ThemedText>

                                  <ThemedText style={styles.materiaCode}>
                                    {materia.codigoMateria || "Sin código"}
                                  </ThemedText>

                                  <View style={styles.materiaFooter}>
                                    <ThemedText
                                      style={[
                                        styles.materiaEstado,
                                        { color: estadoStyle.text },
                                      ]}
                                    >
                                      {obtenerEstadoMateriaLabel(
                                        materia.estadoMateria,
                                      )}
                                    </ThemedText>

                                    <ThemedText style={styles.materiaNota}>
                                      {formatearNotaFinal(materia.notaFinal)}
                                    </ThemedText>
                                  </View>
                                </Pressable>
                              );
                            })}
                          </View>
                        ))}
                      </ScrollView>
                    </View>
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