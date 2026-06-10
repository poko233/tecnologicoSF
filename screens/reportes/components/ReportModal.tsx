import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  reportType: string | null;
  onClose: () => void;
}

export function ReportModal({ visible, reportType, onClose }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [carrera, setCarrera] = useState("Todas las carreras");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");

  const handleDownload = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: implementar lógica real de descarga
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  const reportTitles: Record<string, string> = {
    "rango-tiempo": "Reporte de Inscritos por Tiempo",
    carrera: "Inscritos Desglosados por Carrera",
    "lista-grupo": "Nómina Oficial de Estudiantes",
    expedicion: "Estudiantes por Lugar de Expedición",
    ingresos: "Reporte Financiero de Ingresos",
    historial: "Historial Detallado de Accesos",
    coordinacion: "Derivaciones a Coordinación",
    contabilidad: "Reporte Contable",
  };

  const title = reportType
    ? (reportTitles[reportType] ?? "Parámetros del Reporte")
    : "Parámetros del Reporte";

  return (
    <AnimatePresence>
      {visible && (
        <View style={styles.backdrop} onTouchEnd={handleBackdropPress}>
          <MotiView
            from={{ opacity: 0, scale: 0.92, translateY: 30 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.95, translateY: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            style={[
              styles.modalContainer,
              {
                backgroundColor: c.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 10,
              },
            ]}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={[styles.header, { borderBottomColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: c.text }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                  Complete los filtros para generar el documento.
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={22} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
            >
              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={[styles.label, { color: c.textSecondary }]}>
                    Fecha Inicio
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: c.border,
                        color: c.text,
                        backgroundColor: c.input,
                      },
                    ]}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={c.textMuted}
                    value={fechaInicio}
                    onChangeText={setFechaInicio}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={[styles.label, { color: c.textSecondary }]}>
                    Fecha Fin
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: c.border,
                        color: c.text,
                        backgroundColor: c.input,
                      },
                    ]}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={c.textMuted}
                    value={fechaFin}
                    onChangeText={setFechaFin}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: c.textSecondary }]}>
                  Carrera / Programa
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: c.border,
                      color: c.text,
                      backgroundColor: c.input,
                    },
                  ]}
                  placeholder="Todas las carreras"
                  placeholderTextColor={c.textMuted}
                  value={carrera}
                  onChangeText={setCarrera}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: c.textSecondary }]}>
                  Formato de Salida
                </Text>
                <View style={styles.formatRow}>
                  <TouchableOpacity
                    style={[
                      styles.formatOption,
                      {
                        borderColor: format === "pdf" ? c.primary : c.border,
                        backgroundColor:
                          format === "pdf" ? c.primarySubtle : "transparent",
                      },
                    ]}
                    onPress={() => setFormat("pdf")}
                  >
                    <Text
                      style={{
                        color: c.destructive,
                        fontWeight: "700",
                        marginRight: 6,
                      }}
                    >
                      PDF
                    </Text>
                    <Text style={{ color: c.textSecondary }}>Documento</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.formatOption,
                      {
                        borderColor: format === "excel" ? c.primary : c.border,
                        backgroundColor:
                          format === "excel" ? c.primarySubtle : "transparent",
                      },
                    ]}
                    onPress={() => setFormat("excel")}
                  >
                    <Text
                      style={{
                        color: c.success,
                        fontWeight: "700",
                        marginRight: 6,
                      }}
                    >
                      Excel
                    </Text>
                    <Text style={{ color: c.textSecondary }}>
                      Hoja de cálculo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: c.border }]}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: c.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDownload}
                style={[styles.downloadBtn, { backgroundColor: c.primary }]}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.downloadText, { color: c.primaryForeground }]}
                >
                  Descargar Reporte
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 100,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 18,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
  body: {
    maxHeight: 400,
  },
  bodyContent: {
    padding: 20,
    gap: 18,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  fieldHalf: {
    flex: 1,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  formatRow: {
    flexDirection: "row",
    gap: 10,
  },
  formatOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1.5,
    borderRadius: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  downloadBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
