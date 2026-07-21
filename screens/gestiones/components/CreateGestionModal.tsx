// screens/gestiones/components/CreateGestionModal.tsx
import DatePickerModal, {
  DatePickerResult,
} from "@/components/DatePickerModal";
import { ThemedText } from "@/components/ThemedText";
import { Tooltip } from "@/components/Tooltip";
import { useTheme } from "@/theme/useTheme";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal as RNModal,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { springConfig } from "../animations/gestiones.animations";
import { GestionFormData, Periodo } from "../types/gestiones.types";

interface CreateGestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: GestionFormData) => Promise<void>;
}

const PERIODOS: Periodo[] = [
  "Anual",
  "Semestral",
  "Trimestral",
  "Mensual",
  "Otro",
];

export function CreateGestionModal({
  visible,
  onClose,
  onSubmit,
}: CreateGestionModalProps) {
  const { theme } = useTheme();
  const [nombre, setNombre] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [periodo, setPeriodo] = useState<Periodo>("Anual");

  // Ambas fechas inician nulas – ninguna fecha por defecto
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);

  const [isStartSelected, setIsStartSelected] = useState(false);
  const [isEndSelected, setIsEndSelected] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    if (!nombre.trim()) return false;
    if (anio < 2000 || anio > 2100) return false;
    if (!isStartSelected || !isEndSelected) return false;
    // fechas seguras gracias a los flags
    const inicioStr = fechaInicio!.toISOString().split("T")[0];
    const finStr = fechaFin!.toISOString().split("T")[0];
    if (finStr < inicioStr) return false;
    return true;
  }, [nombre, anio, isStartSelected, isEndSelected, fechaInicio, fechaFin]);

  const resetForm = () => {
    setNombre("");
    setAnio(new Date().getFullYear());
    setPeriodo("Anual");
    setFechaInicio(null);
    setFechaFin(null);
    setIsStartSelected(false);
    setIsEndSelected(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);

    const formData: GestionFormData = {
      nombre: nombre.trim(),
      anio,
      periodo,
      fecha_inicio: fechaInicio!.toISOString().split("T")[0],
      fecha_fin: fechaFin!.toISOString().split("T")[0],
    };

    await onSubmit(formData).finally(() => {
      resetForm();
      setSubmitting(false);
    });

    onClose();
  };

  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleStartDateApply = (result: DatePickerResult) => {
    if (result.type === "single") {
      const newDate = new Date(result.date + "T12:00:00");
      setFechaInicio(newDate);
      setIsStartSelected(true);

      // Si ya había una fecha fin seleccionada y es anterior a la nueva inicio, la borramos
      if (isEndSelected && fechaFin && fechaFin < newDate) {
        setFechaFin(null);
        setIsEndSelected(false);
      }
    }
    setShowStartPicker(false);
  };

  const handleEndDateApply = (result: DatePickerResult) => {
    if (result.type === "single") {
      setFechaFin(new Date(result.date + "T12:00:00"));
      setIsEndSelected(true);
    }
    setShowEndPicker(false);
  };

  // Texto para el botón de fecha fin según el estado
  const getEndDateDisplay = () => {
    if (!isStartSelected) {
      return "Seleccione inicio primero";
    }
    if (isEndSelected && fechaFin) {
      return formatDisplayDate(fechaFin);
    }
    return "Seleccione fecha fin";
  };

  const endDateColor = !isStartSelected
    ? theme.colors.textMuted
    : isEndSelected
      ? theme.colors.text
      : theme.colors.textMuted;

  return (
    <AnimatePresence>
      {visible && (
        <RNModal transparent visible={visible} onRequestClose={handleClose}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.centeredView}
          >
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 200 }}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.4)" },
              ]}
            />
            <MotiView
              from={{ opacity: 0, scale: 0.92, translateY: 30 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, translateY: -10 }}
              transition={{ type: "spring", ...springConfig }}
              style={[
                styles.modal,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={[
                    styles.header,
                    { borderBottomColor: theme.colors.border },
                  ]}
                >
                  <ThemedText
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: theme.colors.text,
                    }}
                  >
                    Nueva Gestión
                  </ThemedText>
                  <Pressable onPress={handleClose}>
                    <X size={20} color={theme.colors.textSecondary} />
                  </Pressable>
                </View>

                <View style={styles.form}>
                  <ThemedText
                    style={[styles.label, { color: theme.colors.text }]}
                  >
                    Nombre de la Gestión
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                        backgroundColor: theme.colors.input,
                      },
                    ]}
                    placeholder="Ej. Gestión Académica I/2024"
                    placeholderTextColor={theme.colors.textMuted}
                    value={nombre}
                    onChangeText={setNombre}
                  />

                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={[styles.label, { color: theme.colors.text }]}
                      >
                        Año
                      </ThemedText>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            borderColor: theme.colors.border,
                            color: theme.colors.text,
                            backgroundColor: theme.colors.input,
                          },
                        ]}
                        keyboardType="number-pad"
                        value={anio.toString()}
                        onChangeText={(t) =>
                          setAnio(Number(t) || new Date().getFullYear())
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.labelRow}>
                        <ThemedText
                          style={[styles.label, { color: theme.colors.text }]}
                        >
                          Período
                        </ThemedText>
                        <Tooltip
                          message="Una vez creada la gestión, el período no se puede modificar."
                          position="top"
                        />
                      </View>
                      <View
                        style={[
                          styles.pickerWrap,
                          {
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.input,
                          },
                        ]}
                      >
                        {PERIODOS.map((p) => (
                          <Pressable
                            key={p}
                            onPress={() => setPeriodo(p)}
                            style={[
                              styles.periodOption,
                              p === periodo && {
                                backgroundColor: theme.colors.primary,
                              },
                            ]}
                          >
                            <ThemedText
                              style={{
                                color:
                                  p === periodo
                                    ? theme.colors.primaryForeground
                                    : theme.colors.text,
                                fontSize: 12,
                              }}
                            >
                              {p}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={styles.row}>
                    {/* Fecha Inicio – sin valor por defecto */}
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={[styles.label, { color: theme.colors.text }]}
                      >
                        Fecha Inicio
                      </ThemedText>
                      <Pressable
                        onPress={() => setShowStartPicker(true)}
                        style={[
                          styles.dateButton,
                          {
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.input,
                          },
                        ]}
                      >
                        {isStartSelected && fechaInicio ? (
                          <ThemedText style={{ color: theme.colors.text }}>
                            {formatDisplayDate(fechaInicio)}
                          </ThemedText>
                        ) : (
                          <ThemedText
                            style={{
                              color: theme.colors.textMuted,
                              fontSize: 12,
                            }}
                          >
                            Seleccione la fecha de inicio
                          </ThemedText>
                        )}
                      </Pressable>
                    </View>

                    {/* Fecha Fin – solo habilitada tras elegir inicio */}
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={[styles.label, { color: theme.colors.text }]}
                      >
                        Fecha Fin
                      </ThemedText>
                      <Pressable
                        onPress={() => setShowEndPicker(true)}
                        disabled={!isStartSelected}
                        style={[
                          styles.dateButton,
                          {
                            borderColor: theme.colors.border,
                            backgroundColor: isStartSelected
                              ? theme.colors.input
                              : theme.colors.disabled,
                            opacity: isStartSelected ? 1 : 0.6,
                          },
                        ]}
                      >
                        <ThemedText
                          style={{
                            color: endDateColor,
                            fontSize: isEndSelected ? 14 : 12,
                          }}
                        >
                          {getEndDateDisplay()}
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </KeyboardAwareScrollView>

              <View
                style={[styles.footer, { borderTopColor: theme.colors.border }]}
              >
                <Pressable onPress={handleClose} style={styles.cancelBtn}>
                  <ThemedText
                    style={{
                      color: theme.colors.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    Cancelar
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={submitting || !isFormValid}
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor: isFormValid
                        ? theme.colors.primary
                        : theme.colors.disabled,
                      opacity: submitting ? 0.6 : 1,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: theme.colors.primaryForeground,
                      fontWeight: "600",
                    }}
                  >
                    Crear Gestión
                  </ThemedText>
                </Pressable>
              </View>
            </MotiView>
          </KeyboardAvoidingView>

          <DatePickerModal
            visible={showStartPicker}
            mode="single"
            onClose={() => setShowStartPicker(false)}
            onApply={handleStartDateApply}
            initialDate={
              fechaInicio ? fechaInicio.toISOString().split("T")[0] : undefined
            }
            maxDate={
              isEndSelected && fechaFin
                ? fechaFin.toISOString().split("T")[0]
                : undefined
            }
          />

          <DatePickerModal
            visible={showEndPicker}
            mode="single"
            onClose={() => setShowEndPicker(false)}
            onApply={handleEndDateApply}
            initialDate={
              fechaFin ? fechaFin.toISOString().split("T")[0] : undefined
            }
            minDate={
              fechaInicio ? fechaInicio.toISOString().split("T")[0] : undefined
            }
          />
        </RNModal>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  pickerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  periodOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
