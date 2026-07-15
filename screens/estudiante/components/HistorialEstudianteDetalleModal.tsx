import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { createHistorialEstudianteStyles } from "../styles/historialEstudiante.styles";
import {
    EstudianteUsuario,
    MateriaHistorialEstudiante,
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

function getEstadoColor(estado: string, colors: any) {
  if (estado === "APROBADO") return colors.success || "#16A34A";
  if (estado === "REPROBADO") return colors.destructive || "#DC2626";
  if (estado === "INSCRITO") return colors.primary || "#2563EB";

  return colors.mutedForeground || "#64748B";
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <View style={{ gap: 3 }}>
      <ThemedText style={{ fontSize: 11, opacity: 0.65 }}>{label}</ThemedText>

      <ThemedText style={{ fontSize: 13, fontWeight: "800" }}>
        {value || "No registrado"}
      </ThemedText>
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
  const styles = createHistorialEstudianteStyles(colors);

  const estadoColor = getEstadoColor(
    materia?.estadoMateria || "PENDIENTE",
    colors,
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.detailOverlay}>
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.detailKicker}>
                Detalle del historial
              </ThemedText>

              <ThemedText style={styles.detailTitle}>
                {materia?.nombreMateria || "Materia"}
              </ThemedText>
            </View>

            <Pressable onPress={onClose} style={styles.iconClose}>
              <Ionicons name="close" size={21} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.bigNotaBox,
                {
                  borderColor: estadoColor,
                  backgroundColor: `${estadoColor}18`,
                },
              ]}
            >
              <ThemedText style={styles.bigNotaLabel}>Nota final</ThemedText>

              <ThemedText style={[styles.bigNotaValue, { color: estadoColor }]}>
                {formatearNotaFinal(materia?.notaFinal)}
              </ThemedText>

              <View
                style={[
                  styles.estadoBadge,
                  {
                    backgroundColor: estadoColor,
                  },
                ]}
              >
                <ThemedText style={styles.estadoBadgeText}>
                  {obtenerEstadoMateriaLabel(materia?.estadoMateria)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailSection}>
              <ThemedText style={styles.sectionTitle}>Estudiante</ThemedText>

              <View style={styles.detailGrid}>
                <InfoRow
                  label="Nombre completo"
                  value={nombreCompleto(estudiante)}
                />

                <InfoRow label="CI" value={estudiante?.ci} />

                <InfoRow
                  label="Matrícula"
                  value={obtenerMatricula(estudiante)}
                />

                <InfoRow
                  label="Fecha de inscripción"
                  value={formatearFecha(
                    estudiante?.fechaInscripcion || estudiante?.created_at,
                  )}
                />
              </View>
            </View>

            <View style={styles.detailSection}>
              <ThemedText style={styles.sectionTitle}>Materia</ThemedText>

              <View style={styles.detailGrid}>
                <InfoRow label="Código" value={materia?.codigoMateria} />
                <InfoRow label="Carrera" value={materia?.nombreCarrera} />
                <InfoRow label="Gestión" value={materia?.gestion} />
                <InfoRow label="Grupo" value={materia?.nombreGrupo} />
                <InfoRow label="Código de grupo" value={materia?.codigoGrupo} />
                <InfoRow label="Paralelo" value={materia?.paralelo} />
                <InfoRow label="Turno" value={materia?.turno} />

                <InfoRow
                  label="Inscripción materia"
                  value={formatearFecha(materia?.fechaInscripcionMateria)}
                />
              </View>
            </View>

            {!!materia?.observacion && (
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>Observación</ThemedText>

                <ThemedText style={styles.observacionText}>
                  {materia.observacion}
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}