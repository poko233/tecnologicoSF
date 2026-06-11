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
import { reportesService } from "../services/reportes.service";

interface Props {
  visible: boolean;
  reportType: string | null;
  onClose: () => void;
}

export function ReportModal({ visible, reportType, onClose }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [format, setFormat] = useState<"pdf" | "excel">("excel");

  // ── Centralizador ──────────────────────────────────────
  const [filtrosCal, setFiltrosCal] = useState<any>(null);
  const [idCarrera, setIdCarrera] = useState<number | null>(null);
  const [gestion, setGestion] = useState("");
  const [turno, setTurno] = useState("");

  // ── Inscritos por Carrera ──────────────────────────────
  const [carreras, setCarreras] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // ── Lista por Grupo ────────────────────────────────────
  const [grupos, setGrupos] = useState<any[]>([]);
  const [idGrupo, setIdGrupo] = useState<number | null>(null);

  const isCentralizador = reportType === "centralizador";
  const isInscritos = reportType === "carrera";
  const isListaGrupo = reportType === "lista-grupo";

  // Cargar datos según tipo
  useEffect(() => {
    if (!visible) return;
    setLoading(true);

    if (isCentralizador) {
      reportesService.obtenerFiltros().then(setFiltrosCal).finally(() => setLoading(false));
    } else if (isInscritos) {
      reportesService.obtenerCarreras().then(setCarreras).finally(() => setLoading(false));
    } else if (isListaGrupo) {
      reportesService.obtenerGrupos().then(setGrupos).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [visible, reportType]);

  const handleDownload = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isCentralizador) {
      if (format === "excel") reportesService.descargarXlsx(idCarrera ?? undefined, gestion || undefined, turno || undefined);
      else reportesService.descargarPdf(idCarrera ?? undefined, gestion || undefined, turno || undefined);
    } else if (isInscritos) {
      if (format === "excel") reportesService.descargarInscritos("xlsx", idCarrera ?? undefined, fechaInicio || undefined, fechaFin || undefined);
      else reportesService.descargarInscritos("pdf", idCarrera ?? undefined, fechaInicio || undefined, fechaFin || undefined);
    } else if (isListaGrupo) {
      if (format === "excel") reportesService.descargarListaGrupo("xlsx", idGrupo ?? undefined);
      else reportesService.descargarListaGrupo("pdf", idGrupo ?? undefined);
    }

    onClose();
  };

  const title = isCentralizador ? "Centralizador de Calificaciones"
    : isInscritos ? "Inscritos por Carrera"
    : isListaGrupo ? "Lista Oficial por Grupo"
    : "Parámetros del Reporte";

  // ── Chip Select ────────────────────────────────────────
  const renderChipSelect = (
    label: string,
    opciones: { label: string; value: string | number | null }[],
    selected: string | number | null,
    onChange: (val: any) => void
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}> */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {opciones.map((opt) => {
            const isSelected = String(opt.value) === String(selected);
            return (
              <TouchableOpacity
                key={String(opt.value)}
                onPress={() => { Haptics.selectionAsync(); onChange(opt.value); }}
                style={[styles.chip, {
                  borderColor: isSelected ? c.primary : c.border,
                  backgroundColor: isSelected ? c.primary + "1A" : "transparent",
                }]}
              >
                <Text style={[styles.chipText, { color: isSelected ? c.primary : c.text }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      {/* </ScrollView> */}
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
            style={[styles.modalContainer, { backgroundColor: c.card }]}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={[styles.header, { borderBottomColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: c.text }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                  Seleccione los filtros para generar el reporte.
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={22} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
              {loading ? (
                <ActivityIndicator color={c.primary} style={{ marginVertical: 30 }} />
              ) : (
                <>
                  {/* ── CENTRALIZADOR ────────────────────────── */}
                  {isCentralizador && filtrosCal && (
                    <>
                      {renderChipSelect("Carrera", [
                        { label: "Todas", value: null },
                        ...filtrosCal.carreras.map((car: any) => ({ label: car.nombreCarrera, value: car.idCarrera })),
                      ], idCarrera, setIdCarrera)}
                      {renderChipSelect("Gestión", [
                        { label: "Todas", value: "" },
                        ...filtrosCal.gestiones.map((g: string) => ({ label: g, value: g })),
                      ], gestion, setGestion)}
                      {renderChipSelect("Turno", [
                        { label: "Todos", value: "" },
                        ...filtrosCal.turnos.map((t: string) => ({ label: t, value: t })),
                      ], turno, setTurno)}
                    </>
                  )}

                  {/* ── INSCRITOS POR CARRERA ────────────────── */}
                  {isInscritos && (
                    <>
                      {renderChipSelect("Carrera", [
                        { label: "Todas", value: null },
                        ...carreras.map((car: any) => ({ label: car.nombreCarrera, value: car.idCarrera })),
                      ], idCarrera, setIdCarrera)}
                      <View style={styles.field}>
                        <Text style={[styles.label, { color: c.textSecondary }]}>Fecha Inicio</Text>
                        <TextInput style={[styles.input, { borderColor: c.border, color: c.text }]} placeholder="AAAA-MM-DD" value={fechaInicio} onChangeText={setFechaInicio} />
                      </View>
                      <View style={styles.field}>
                        <Text style={[styles.label, { color: c.textSecondary }]}>Fecha Fin</Text>
                        <TextInput style={[styles.input, { borderColor: c.border, color: c.text }]} placeholder="AAAA-MM-DD" value={fechaFin} onChangeText={setFechaFin} />
                      </View>
                    </>
                  )}

                  {/* ── LISTA POR GRUPO ──────────────────────── */}
                  {isListaGrupo && (
                    <>
                      {renderChipSelect("Grupo / Materia / Docente", [
                        { label: "Todos", value: null },
                        ...grupos.map((g: any) => ({
                          label: `${g.grupo} - ${g.materia}`,
                          value: g.idGrupoMateriaDocente,
                        })),
                      ], idGrupo, setIdGrupo)}
                    </>
                  )}
                </>
              )}

              {/* Formato */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Formato</Text>
                <View style={styles.formatRow}>
                  <TouchableOpacity
                    style={[styles.formatOption, { borderColor: format === "pdf" ? c.primary : c.border, backgroundColor: format === "pdf" ? c.primarySubtle : "transparent" }]}
                    onPress={() => setFormat("pdf")}
                  >
                    <Text style={{ color: c.destructive, fontWeight: "700", marginRight: 6 }}>PDF</Text>
                    <Text style={{ color: c.textSecondary }}>Documento</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formatOption, { borderColor: format === "excel" ? c.primary : c.border, backgroundColor: format === "excel" ? c.primarySubtle : "transparent" }]}
                    onPress={() => setFormat("excel")}
                  >
                    <Text style={{ color: c.success, fontWeight: "700", marginRight: 6 }}>Excel</Text>
                    <Text style={{ color: c.textSecondary }}>Hoja de cálculo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: c.border }]}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: c.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDownload} style={[styles.downloadBtn, { backgroundColor: c.primary }]}>
                <Text style={[styles.downloadText, { color: c.primaryForeground }]}>Descargar Reporte</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20, zIndex: 100 },
  modalContainer: { width: "100%", maxWidth: 500, borderRadius: 18, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "flex-start", padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13 },
  closeBtn: { padding: 6, marginLeft: 8 },
  body: { maxHeight: 400 },
  bodyContent: { padding: 20, gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: "600" },
  formatRow: { flexDirection: "row", gap: 10 },
  formatOption: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderWidth: 1.5, borderRadius: 10 },
  footer: { flexDirection: "row", justifyContent: "flex-end", padding: 20, borderTopWidth: 1, gap: 10 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 18 },
  cancelText: { fontSize: 14, fontWeight: "600" },
  downloadBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  downloadText: { fontSize: 14, fontWeight: "700" },
});