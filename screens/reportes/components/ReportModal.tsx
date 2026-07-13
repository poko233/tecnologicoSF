import { useTheme } from "@/theme/useTheme";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useInscritosFilters } from "../hooks/useInscritosFilters";
import { reportesService } from "../services/reportes.service";
import { InscritosFiltrosResponse } from "../types/reportes.types";
import { InscritosForm } from "./InscritosForm";

interface Props {
  visible: boolean;
  reportType: string | null;
  onClose: () => void;
}

export function ReportModal({ visible, reportType, onClose }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false); // ⭐ Estado para descarga
  const [format, setFormat] = useState<"xlsx" | "pdf">("xlsx"); // ✅ Corregido el tipo

  const [filtrosCal, setFiltrosCal] = useState<any>(null);
  const [idCarrera, setIdCarrera] = useState<number | null>(null);
  const [gestion, setGestion] = useState("");
  const [turno, setTurno] = useState("");
  const [carreras, setCarreras] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [grupos, setGrupos] = useState<any[]>([]);
  const [idGrupo, setIdGrupo] = useState<number | null>(null);

  const inscritosFilters = useInscritosFilters();
  const [inscritosData, setInscritosData] =
    useState<InscritosFiltrosResponse | null>(null);
  const [loadingInscritos, setLoadingInscritos] = useState(false);

  const isCentralizador = reportType === "centralizador";
  const isInscritos = reportType === "carrera";
  const isListaGrupo = reportType === "lista-grupo";

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setLoadingInscritos(false);
    setDownloading(false); // Resetear al abrir

    if (isCentralizador) {
      reportesService
        .obtenerFiltros()
        .then(setFiltrosCal)
        .finally(() => setLoading(false));
    } else if (isInscritos) {
      setLoadingInscritos(true);
      reportesService
        .obtenerFiltrosInscritos()
        .then((data) => {
          setInscritosData(data);
          inscritosFilters.resetFilters();
        })
        .finally(() => {
          setLoadingInscritos(false);
          setLoading(false);
        });
    } else if (isListaGrupo) {
      reportesService
        .obtenerGrupos()
        .then(setGrupos)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [visible, reportType]);

  const handleDownload = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setDownloading(true); // ⭐ Mostrar spinner

    try {
      if (isCentralizador) {
        if (format === "xlsx")
          await reportesService.descargarXlsx(
            idCarrera ?? undefined,
            gestion || undefined,
            turno || undefined,
          );
        else
          await reportesService.descargarPdf(
            idCarrera ?? undefined,
            gestion || undefined,
            turno || undefined,
          );
      } else if (isInscritos) {
        const { filters } = inscritosFilters;
        await reportesService.descargarInscritos({
          formato: format,
          idCarrera: filters.carreras.length > 0 ? filters.carreras : undefined,
          turno: filters.turno ?? undefined,
          idGestion: filters.idGestion ?? undefined,
          semestre:
            filters.periodoActivo === "semestre"
              ? (filters.semestre ?? undefined)
              : undefined,
          anio:
            filters.periodoActivo === "anio"
              ? (filters.anio ?? undefined)
              : undefined,
        });
      } else if (isListaGrupo) {
        if (format === "xlsx")
          await reportesService.descargarListaGrupo(
            "xlsx",
            idGrupo ?? undefined,
          );
        else
          await reportesService.descargarListaGrupo(
            "pdf",
            idGrupo ?? undefined,
          );
      }
    } catch (error) {
      // El error ya es manejado por el servicio (Toast)
    } finally {
      setDownloading(false);
      onClose(); // ⭐ Cerrar solo después de que termine la descarga
    }
  };

  const handleBackdropPress = () => {
    if (!downloading) {
      onClose();
    }
  };

  const title = isCentralizador
    ? "Centralizador de Calificaciones"
    : isInscritos
      ? "Inscritos por Carrera"
      : isListaGrupo
        ? "Lista Oficial por Grupo"
        : "Parámetros del Reporte";

  const renderChipSelect = (
    label: string,
    opciones: { label: string; value: string | number | null }[],
    selected: string | number | null,
    onChange: (val: any) => void,
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
                  backgroundColor: isSelected
                    ? c.primary + "1A"
                    : "transparent",
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
    </View>
  );

  return (
    <AnimatePresence>
      {visible && (
        <BlurView
          intensity={20}
          tint="dark"
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod="dimezisBlurView"
        >
          {/* ✅ TouchableWithoutFeedback exterior captura el fondo */}
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={styles.backdrop}>
              {/* ✅ TouchableWithoutFeedback interior captura el modal y detiene la propagación */}
              <TouchableWithoutFeedback onPress={() => {}}>
                <MotiView
                  from={{ opacity: 0, scale: 0.92, translateY: 20 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.95, translateY: 10 }}
                  transition={{
                    type: "timing",
                    duration: 350,
                    easing: (t) => t * t * (3 - 2 * t),
                  }}
                  exitTransition={{
                    type: "timing",
                    duration: 200,
                    easing: (t) => t * t,
                  }}
                  style={[styles.modalContainer, { backgroundColor: c.card }]}
                >
                  {/* HEADER */}
                  <View
                    style={[styles.header, { borderBottomColor: c.border }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.title, { color: c.text }]}>
                        {title}
                      </Text>
                      <Text
                        style={[styles.subtitle, { color: c.textSecondary }]}
                      >
                        Seleccione los filtros para generar el reporte.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleBackdropPress}
                      disabled={downloading}
                      style={styles.closeBtn}
                    >
                      <X size={22} color={c.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* BODY */}
                  {isInscritos ? (
                    <InscritosForm
                      filtrosData={inscritosData}
                      loading={loadingInscritos}
                      filters={inscritosFilters.filters}
                      onToggleCarrera={inscritosFilters.toggleCarrera}
                      onToggleAllCarreras={inscritosFilters.toggleAllCarreras} // ✅ AGREGA ESTO
                      onSetTurno={inscritosFilters.setTurno}
                      onSetGestion={inscritosFilters.setGestion}
                      onSetSemestre={inscritosFilters.setSemestre}
                      onSetAnio={inscritosFilters.setAnio}
                      onSetPeriodoActivo={inscritosFilters.setPeriodoActivo}
                    />
                  ) : (
                    <ScrollView
                      style={styles.body}
                      contentContainerStyle={styles.bodyContent}
                    >
                      {loading ? (
                        <ActivityIndicator
                          color={c.primary}
                          style={{ marginVertical: 30 }}
                        />
                      ) : (
                        <>
                          {isCentralizador && filtrosCal && (
                            <>
                              {renderChipSelect(
                                "Carrera",
                                [
                                  { label: "Todas", value: null },
                                  ...filtrosCal.carreras.map((car: any) => ({
                                    label: car.nombreCarrera,
                                    value: car.idCarrera,
                                  })),
                                ],
                                idCarrera,
                                setIdCarrera,
                              )}
                              {renderChipSelect(
                                "Gestión",
                                [
                                  { label: "Todas", value: "" },
                                  ...filtrosCal.gestiones.map((g: string) => ({
                                    label: g,
                                    value: g,
                                  })),
                                ],
                                gestion,
                                setGestion,
                              )}
                              {renderChipSelect(
                                "Turno",
                                [
                                  { label: "Todos", value: "" },
                                  ...filtrosCal.turnos.map((t: string) => ({
                                    label: t,
                                    value: t,
                                  })),
                                ],
                                turno,
                                setTurno,
                              )}
                            </>
                          )}

                          {isListaGrupo && (
                            <>
                              {renderChipSelect(
                                "Grupo / Materia / Docente",
                                [
                                  { label: "Todos", value: null },
                                  ...grupos.map((g: any) => ({
                                    label: `${g.grupo} - ${g.materia}`,
                                    value: g.idGrupoMateriaDocente,
                                  })),
                                ],
                                idGrupo,
                                setIdGrupo,
                              )}
                            </>
                          )}
                        </>
                      )}
                    </ScrollView>
                  )}

                  {/* FORMATO Y FOOTER */}
                  <View
                    style={[
                      styles.formatContainer,
                      { borderTopColor: c.border },
                    ]}
                  >
                    <Text style={[styles.label, { color: c.textSecondary }]}>
                      Formato de descarga
                    </Text>
                    <View style={styles.formatRow}>
                      <TouchableOpacity
                        disabled={downloading}
                        style={[
                          styles.formatOption,
                          {
                            borderColor:
                              format === "pdf" ? c.primary : c.border,
                            backgroundColor:
                              format === "pdf"
                                ? c.primarySubtle
                                : "transparent",
                            opacity: downloading ? 0.5 : 1,
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
                        <Text style={{ color: c.textSecondary }}>
                          Documento
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={downloading}
                        style={[
                          styles.formatOption,
                          {
                            borderColor:
                              format === "xlsx" ? c.primary : c.border,
                            backgroundColor:
                              format === "xlsx"
                                ? c.primarySubtle
                                : "transparent",
                            opacity: downloading ? 0.5 : 1,
                          },
                        ]}
                        onPress={() => setFormat("xlsx")}
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

                  <View style={[styles.footer, { borderTopColor: c.border }]}>
                    <TouchableOpacity
                      onPress={handleBackdropPress}
                      disabled={downloading}
                    >
                      <Text
                        style={[
                          styles.cancelText,
                          { color: downloading ? c.muted : c.textSecondary },
                        ]}
                      >
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDownload}
                      disabled={downloading}
                      style={[
                        styles.downloadBtn,
                        {
                          backgroundColor: c.primary,
                          opacity: downloading ? 0.7 : 1,
                        },
                      ]}
                    >
                      {downloading ? (
                        <>
                          <ActivityIndicator
                            size="small"
                            color={c.primaryForeground}
                          />
                          <Text
                            style={[
                              styles.downloadText,
                              { color: c.primaryForeground, marginLeft: 8 },
                            ]}
                          >
                            Descargando...
                          </Text>
                        </>
                      ) : (
                        <Text
                          style={[
                            styles.downloadText,
                            { color: c.primaryForeground },
                          ]}
                        >
                          Descargar Reporte
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </MotiView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </BlurView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
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
    maxHeight: 360,
  },
  bodyContent: {
    padding: 20,
    gap: 18,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  formatContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  formatRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
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
    gap: 16,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 120,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
