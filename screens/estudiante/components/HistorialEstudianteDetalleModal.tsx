import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { createHistorialEstudianteStyles } from "../styles/historialEstudiante.styles";
import {
  EstudianteUsuario,
  MateriaHistorialEstudiante,
  OrigenNotaHistorialEstudiante,
} from "../types/estudiante.types";
import {
  formatearFecha,
  formatearNotaFinal,
  nombreCompleto,
  obtenerEstadoMateriaLabel,
  obtenerMatricula,
} from "../utils/estudiante.helpers";

type Props = {
  visible: boolean;
  estudiante: EstudianteUsuario | null;
  materia: MateriaHistorialEstudiante | null;
  onClose: () => void;
};

type MateriaHistorialUI = MateriaHistorialEstudiante & {
  estadoRegistro?: string | null;
  notaAprobacion?: number | null;
  estadoCarrera?: string | null;
};

function normalizarTexto(value?: string | number | null) {
  return String(value ?? "").trim().toLowerCase();
}

function getEstadoColor(estado: string, colors: any) {
  if (estado === "APROBADO") return colors.success || "#16A34A";
  if (estado === "REPROBADO") return colors.destructive || "#DC2626";
  if (estado === "INSCRITO") return colors.primary || "#2563EB";

  return colors.mutedForeground || colors.textMuted || "#64748B";
}

function getValor(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "No registrado";
  }

  return String(value);
}

function getOrigenNotaLabel(
  origen?: OrigenNotaHistorialEstudiante | null,
): string {
  switch (origen) {
    case "HISTORIAL_ACADEMICO":
      return "Nota final cerrada";
    case "SEGUNDA_INSTANCIA":
      return "Segunda instancia actual";
    case "NOTA_FINAL_ACTUAL":
      return "Nota consolidada actual";
    case "PROMEDIO_COMPETENCIAS":
      return "Promedio actual de competencias";
    case "SIN_NOTA":
    case null:
    case undefined:
      return "Todavía sin nota";
    default:
      return String(origen)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^./, (letra) => letra.toUpperCase());
  }
}

function InfoCard({
  label,
  value,
  styles,
}: {
  label: string;
  value?: string | number | null;
  styles: ReturnType<typeof createHistorialEstudianteStyles>;
}) {
  return (
    <View style={styles.infoCard}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{getValor(value)}</ThemedText>
    </View>
  );
}

export default function HistorialEstudianteDetalleModal({
  visible,
  estudiante,
  materia,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors as any;
  const styles = useMemo(
    () => createHistorialEstudianteStyles(colors),
    [colors],
  );

  const materiaUi = materia as MateriaHistorialUI | null;
  const esGestionActual = Boolean(
    materiaUi?.esGestionActual ||
      materiaUi?.tipoHistorial === "GESTION_ACTUAL",
  );

  const notaMostrada = esGestionActual
    ? materiaUi?.notaActual ?? materiaUi?.notaFinal
    : materiaUi?.notaFinal;

  const estadoColor = getEstadoColor(
    materiaUi?.estadoMateria || "PENDIENTE",
    colors,
  );

  const esMateriaActiva = ["activo", "activa", "1"].includes(
    normalizarTexto(materiaUi?.estadoRegistro),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.detailOverlay}>
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderInfo}>
              <ThemedText style={styles.detailKicker}>
                {esGestionActual
                  ? "Detalle de la gestión actual"
                  : "Detalle del historial histórico"}
              </ThemedText>

              <ThemedText style={styles.detailTitle} numberOfLines={3}>
                {materiaUi?.nombreMateria || "Materia"}
              </ThemedText>
            </View>

            <Pressable onPress={onClose} style={styles.iconClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.detailBody}
            contentContainerStyle={styles.detailScrollContent}
            showsVerticalScrollIndicator
            persistentScrollbar
            nestedScrollEnabled
          >
            <View
              style={[
                styles.bigNotaBox,
                {
                  borderColor: estadoColor,
                  backgroundColor: `${estadoColor}14`,
                },
              ]}
            >
              <ThemedText style={styles.bigNotaLabel}>
                {esGestionActual ? "Nota actual" : "Nota final histórica"}
              </ThemedText>

              <ThemedText
                style={[styles.bigNotaValue, { color: estadoColor }]}
              >
                {formatearNotaFinal(notaMostrada)}
              </ThemedText>

              <View
                style={[
                  styles.estadoBadge,
                  { backgroundColor: estadoColor },
                ]}
              >
                <ThemedText style={styles.estadoBadgeText}>
                  {esGestionActual
                    ? "GESTIÓN EN CURSO"
                    : obtenerEstadoMateriaLabel(materiaUi?.estadoMateria)}
                </ThemedText>
              </View>
            </View>

            {esGestionActual && (
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="pulse-outline"
                    size={19}
                    color={colors.primary}
                  />
                  <ThemedText style={styles.sectionTitle}>
                    Calificación actual
                  </ThemedText>
                </View>

                <View style={styles.detailGrid}>
                  <InfoCard
                    label="Nota actual"
                    value={formatearNotaFinal(notaMostrada)}
                    styles={styles}
                  />
                  <InfoCard
                    label="Nota académica"
                    value={formatearNotaFinal(materiaUi?.notaAcademica)}
                    styles={styles}
                  />
                  <InfoCard
                    label="Nota de asistencia"
                    value={formatearNotaFinal(materiaUi?.notaAsistencia)}
                    styles={styles}
                  />
                  <InfoCard
                    label="Segunda instancia"
                    value={formatearNotaFinal(
                      materiaUi?.segundaInstanciaNota,
                    )}
                    styles={styles}
                  />
                  <InfoCard
                    label="Origen de la nota"
                    value={getOrigenNotaLabel(materiaUi?.origenNota)}
                    styles={styles}
                  />
                  <InfoCard
                    label="Estado de gestión"
                    value={materiaUi?.estadoGestion || "ACTIVA"}
                    styles={styles}
                  />
                </View>
              </View>
            )}

            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={colors.primary}
                />
                <ThemedText style={styles.sectionTitle}>Estudiante</ThemedText>
              </View>

              <View style={styles.detailGrid}>
                <InfoCard
                  label="Nombre completo"
                  value={nombreCompleto(estudiante)}
                  styles={styles}
                />
                <InfoCard label="CI" value={estudiante?.ci} styles={styles} />
                <InfoCard
                  label="Matrícula"
                  value={obtenerMatricula(estudiante)}
                  styles={styles}
                />
                <InfoCard
                  label="Fecha de inscripción"
                  value={formatearFecha(
                    estudiante?.fechaInscripcion || estudiante?.created_at,
                  )}
                  styles={styles}
                />
              </View>
            </View>

            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="book-outline"
                  size={19}
                  color={colors.primary}
                />
                <ThemedText style={styles.sectionTitle}>Materia</ThemedText>
              </View>

              <View style={styles.detailGrid}>
                <InfoCard
                  label="Tipo de consulta"
                  value={
                    esGestionActual
                      ? "HISTORIAL DE ESTA GESTIÓN"
                      : "HISTORIAL HISTÓRICO"
                  }
                  styles={styles}
                />
                <InfoCard
                  label="Código"
                  value={materiaUi?.codigoMateria}
                  styles={styles}
                />
                <InfoCard
                  label="Nivel"
                  value={materiaUi?.nivel}
                  styles={styles}
                />
                <InfoCard
                  label="Estado del catálogo"
                  value={esMateriaActiva ? "ACTIVA" : "INACTIVA"}
                  styles={styles}
                />
                <InfoCard
                  label="Nota mínima"
                  value={materiaUi?.notaAprobacion}
                  styles={styles}
                />
                <InfoCard
                  label="Carrera"
                  value={materiaUi?.nombreCarrera}
                  styles={styles}
                />
                <InfoCard
                  label="Gestión"
                  value={materiaUi?.gestion}
                  styles={styles}
                />
                <InfoCard
                  label="Fecha de inscripción en materia"
                  value={formatearFecha(
                    materiaUi?.fechaInscripcionMateria,
                  )}
                  styles={styles}
                />
              </View>
            </View>

            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="people-outline"
                  size={19}
                  color={colors.primary}
                />
                <ThemedText style={styles.sectionTitle}>
                  Grupo y horario
                </ThemedText>
              </View>

              <View style={styles.detailGrid}>
                <InfoCard
                  label="Grupo"
                  value={materiaUi?.nombreGrupo}
                  styles={styles}
                />
                <InfoCard
                  label="Código de grupo"
                  value={materiaUi?.codigoGrupo}
                  styles={styles}
                />
                <InfoCard
                  label="Paralelo"
                  value={materiaUi?.paralelo}
                  styles={styles}
                />
                <InfoCard
                  label="Turno"
                  value={materiaUi?.turno}
                  styles={styles}
                />
              </View>
            </View>

            {!!materiaUi?.observacion && (
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={19}
                    color={colors.primary}
                  />
                  <ThemedText style={styles.sectionTitle}>
                    Observación
                  </ThemedText>
                </View>

                <ThemedText style={styles.observacionText}>
                  {materiaUi.observacion}
                </ThemedText>
              </View>
            )}
          </ScrollView>

          <View style={styles.detailFooter}>
            <Pressable onPress={onClose} style={styles.detailCloseButton}>
              <Ionicons
                name="close-circle-outline"
                size={19}
                color={colors.primaryForeground}
              />
              <ThemedText style={styles.detailCloseButtonText}>
                Cerrar detalle
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
