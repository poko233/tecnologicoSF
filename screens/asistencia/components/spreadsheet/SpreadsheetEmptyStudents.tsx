// screens/asistencia/components/spreadsheet/SpreadsheetEmptyStudents.tsx
import { useTheme } from "@/theme/useTheme";
import { ArrowLeft } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { GrupoData } from "../../types/asistencia.types";
import { EmptyStudentsIllustration } from "./EmptyStudentsIllustration";

interface Props {
  data: GrupoData;
  onBack: () => void;
}

export function SpreadsheetEmptyStudents({ data, onBack }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { width } = useWindowDimensions();
  const gmd = data.grupo_materia_docente;
  const isMobile = width < 768;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header Minimalista */}
      <View style={styles.header}>
        <MotiPressable
          onPress={onBack}
          animate={({ pressed }) => ({ scale: pressed ? 0.94 : 1 })}
        >
          <View
            style={[
              styles.backBtn,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <ArrowLeft size={20} color={c.text} />
            <Text style={[styles.backText, { color: c.text }]}>
              Volver a grupos
            </Text>
          </View>
        </MotiPressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          style={styles.mainWrapper}
        >
          {/* MENSAJE PRINCIPAL ARRIBA */}
          <View style={styles.messageWrapper}>
            <Text style={[styles.messageTitle, { color: c.text }]}>
              No hay estudiantes inscritos en este grupo para la gestión actual.
            </Text>
            <Text style={[styles.messageSubtitle, { color: c.textSecondary }]}>
              Por favor, verifica con administración.
            </Text>
          </View>

          {/* LAYOUT: SVG + TARJETA */}
          <View
            style={[
              styles.contentWrapper,
              { flexDirection: isMobile ? "column" : "row" },
            ]}
          >
            {/* SVG Animado */}
            <MotiView
              from={{ translateY: 0 }}
              animate={{ translateY: -10 }}
              transition={{
                type: "timing",
                duration: 2500,
                loop: true,
                repeatReverse: true,
              }}
              style={styles.svgWrapper}
            >
              <EmptyStudentsIllustration maxWidth={isMobile ? 280 : 420} />
            </MotiView>

            {/* Tarjeta de Información */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: c.card,
                  borderColor: c.border,
                  shadowColor: c.shadow,
                },
              ]}
            >
              <View style={styles.contextSide}>
                <Text style={[styles.contextTitle, { color: c.textMuted }]}>
                  DETALLES DEL GRUPO
                </Text>

                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: c.textSecondary }]}
                  >
                    Grupo:
                  </Text>
                  <Text style={[styles.detailValue, { color: c.text }]}>
                    {gmd.grupo}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: c.textSecondary }]}
                  >
                    Materia:
                  </Text>
                  <Text style={[styles.detailValue, { color: c.text }]}>
                    {gmd.materia}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: c.textSecondary }]}
                  >
                    Carrera:
                  </Text>
                  <Text style={[styles.detailValue, { color: c.text }]}>
                    {gmd.carrera || "—"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: c.textSecondary }]}
                  >
                    Turno:
                  </Text>
                  <Text style={[styles.detailValue, { color: c.text }]}>
                    {gmd.turno}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: c.textSecondary }]}
                  >
                    Gestión:
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: c.success + "20" },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: c.success }]}>
                      {data.gestion?.nombre} ({data.gestion?.estado})
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  backText: { fontSize: 14, fontWeight: "700" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  mainWrapper: {
    width: "100%",
    maxWidth: 1000,
    alignItems: "center",
  },
  messageWrapper: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 32,
  },
  messageSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  svgWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    borderRadius: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  contextSide: {
    padding: 32,
    justifyContent: "center",
  },
  contextTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150,150,150,0.1)",
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
