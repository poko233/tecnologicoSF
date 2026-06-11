import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FiltroOpciones, reportesService } from "../services/reportes.service";

interface Props {
  visible: boolean;
  reportType: string | null;
  onClose: () => void;
}

export function ReportModal({ visible, reportType, onClose }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  // Estado para centralizador
  const [filtros, setFiltros] = useState<FiltroOpciones | null>(null);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [idCarrera, setIdCarrera] = useState<number | null>(null);
  const [gestion, setGestion] = useState<string>("");
  const [turno, setTurno] = useState<string>("");
  const [format, setFormat] = useState<"pdf" | "excel">("excel");
  const [downloading, setDownloading] = useState(false);

  const isCentralizador = reportType === "centralizador";

  // Cargar filtros al abrir
  useEffect(() => {
    if (visible && isCentralizador && !filtros) {
      setLoadingFiltros(true);
      reportesService
        .obtenerFiltros()
        .then((data) => {
          setFiltros(data);
          // Seleccionar primera opción por defecto
          if (data.carreras.length > 0) setIdCarrera(data.carreras[0].idCarrera);
          if (data.gestiones.length > 0) setGestion(data.gestiones[0]);
          if (data.turnos.length > 0) setTurno(data.turnos[0]);
        })
        .finally(() => setLoadingFiltros(false));
    }
  }, [visible, isCentralizador]);

  const handleDownload = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDownloading(true);

    try {
      if (format === "excel") {
        await reportesService.descargarXlsx(
          idCarrera ?? undefined,
          gestion || undefined,
          turno || undefined
        );
      } else {
        await reportesService.descargarPdf(
          idCarrera ?? undefined,
          gestion || undefined,
          turno || undefined
        );
      }
    } finally {
      setDownloading(false);
      onClose();
    }
  };

  const title = isCentralizador
    ? "Centralizador de Calificaciones"
    : "Parámetros del Reporte";

  // Renderizar un selector tipo "chip"
  const renderChipSelect = (
    label: string,
    opciones: { label: string; value: string | number | null }[],
    selected: string | number | null,
    onChange: (val: any) => void
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {opciones.map((opt) => {
            const isSelected = String(opt.value) === String(selected);
            return (
              <TouchableOpacity
                key={String(opt.value)}
                onPress={() => {
                  Haptics.selectionAsync();
                  onChange(opt.value);
                }}
                style={[
                  styles.chip,
                  {
                    borderColor: isSelected ? c.primary : c.border,
                    backgroundColor: isSelected ? c.primary + "1A" : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? c.primary : c.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <AnimatePresence>
      {visible && (
        <View style={styles.backdrop} onTouchEnd={onClose}>
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
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: c.text }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                  {isCentralizador
                    ? "Seleccione carrera, gestión y turno."
                    : "Complete los filtros para generar el documento."}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={22} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
              {isCentralizador ? (
                loadingFiltros ? (
                  <ActivityIndicator color={c.primary} style={{ marginVertical: 30 }} />
                ) : filtros ? (
                  <>
                    {/* Select Carrera */}
                    {renderChipSelect(
                      "Carrera / Programa",
                      [
                        { label: "Todas", value: null },
                        ...filtros.carreras.map((car) => ({
                          label: car.nombreCarrera,
                          value: car.idCarrera,
                        })),
                      ],
                      idCarrera,
                      setIdCarrera
                    )}

                    {/* Select Gestión - AHORA CON "Todas" y sin seleccionar nada por defecto */}
                    {renderChipSelect(
                      "Gestión (opcional)",
                      [
                        { label: "Todas", value: "" },
                        ...filtros.gestiones.map((g) => ({
                          label: g,
                          value: g,
                        })),
                      ],
                      gestion,
                      setGestion
                    )}

                    {/* Select Turno - AHORA CON "Todos" y sin seleccionar nada por defecto */}
                    {renderChipSelect(
                      "Turno (opcional)",
                      [
                        { label: "Todos", value: "" },
                        ...filtros.turnos.map((t) => ({
                          label: t,
                          value: t,
                        })),
                      ],
                      turno,
                      setTurno
                    )}
                  </>
                ) : null
              ) : (
                /* Campos genéricos para otros reportes */
                <View style={styles.field}>
                  <Text style={[styles.label, { color: c.textSecondary }]}>Fecha</Text>
                  <TextInput placeholder="AAAA-MM-DD" style={[styles.input]} />
                </View>
              )}

              {/* Formato */}
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
                        backgroundColor: format === "pdf" ? c.primarySubtle : "transparent",
                      },
                    ]}
                    onPress={() => setFormat("pdf")}
                  >
                    <Text style={{ color: c.destructive, fontWeight: "700", marginRight: 6 }}>PDF</Text>
                    <Text style={{ color: c.textSecondary }}>Documento</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.formatOption,
                      {
                        borderColor: format === "excel" ? c.primary : c.border,
                        backgroundColor: format === "excel" ? c.primarySubtle : "transparent",
                      },
                    ]}
                    onPress={() => setFormat("excel")}
                  >
                    <Text style={{ color: c.success, fontWeight: "700", marginRight: 6 }}>Excel</Text>
                    <Text style={{ color: c.textSecondary }}>Hoja de cálculo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: c.border }]}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: c.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDownload}
                style={[styles.downloadBtn, { backgroundColor: c.primary }]}
                activeOpacity={0.85}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color={c.primaryForeground} />
                ) : null}
                <Text style={[styles.downloadText, { color: c.primaryForeground }]}>
                  {downloading ? "Descargando..." : "Descargar Reporte"}
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
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
    padding: 20, zIndex: 100,
  },
  modalContainer: {
    width: "100%", maxWidth: 500,
    borderRadius: 18, overflow: "hidden",
  },
  header: {
    flexDirection: "row", alignItems: "flex-start",
    padding: 20, borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13 },
  closeBtn: { padding: 6, marginLeft: 8 },
  body: { maxHeight: 400 },
  bodyContent: { padding: 20, gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  formatRow: { flexDirection: "row", gap: 10 },
  formatOption: {
    flex: 1, flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    paddingVertical: 10, borderWidth: 1.5, borderRadius: 10,
  },
  footer: {
    flexDirection: "row", justifyContent: "flex-end",
    padding: 20, borderTopWidth: 1, gap: 10,
  },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 18 },
  cancelText: { fontSize: 14, fontWeight: "600" },
  downloadBtn: {
    paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6,
  },
  downloadText: { fontSize: 14, fontWeight: "700" },
});