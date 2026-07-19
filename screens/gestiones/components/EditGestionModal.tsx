// screens/gestiones/components/EditGestionModal.tsx
import DatePickerModal, {
  DatePickerResult,
} from "@/components/DatePickerModal";
import { ThemedText } from "@/components/ThemedText";
import { Tooltip } from "@/components/Tooltip";
import { useTheme } from "@/theme/useTheme";
import { BlurView } from "expo-blur";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useState } from "react";
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
import { Gestion, GestionUpdateData, Periodo } from "../types/gestiones.types";

interface EditGestionModalProps {
  gestion: Gestion | null;
  onClose: () => void;
  onSubmit: (data: GestionUpdateData) => Promise<void>;
}

const PERIODOS: Periodo[] = [
  "Anual",
  "Semestral",
  "Trimestral",
  "Mensual",
  "Otro",
];

export function EditGestionModal({
  gestion,
  onClose,
  onSubmit,
}: EditGestionModalProps) {
  const { theme } = useTheme();
  const [nombre, setNombre] = useState("");
  const [anio, setAnio] = useState(0);
  const [periodo, setPeriodo] = useState<Periodo>("Anual");
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (gestion) {
      setNombre(gestion.nombre);
      setAnio(gestion.anio);
      setPeriodo(gestion.periodo as Periodo);
      setFechaInicio(new Date(gestion.fecha_inicio + "T12:00:00"));
      setFechaFin(new Date(gestion.fecha_fin + "T12:00:00"));
    }
  }, [gestion]);

  const handleSubmit = async () => {
    if (!nombre.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        anio,
        periodo,
        fecha_inicio: fechaInicio.toISOString().split("T")[0],
        fecha_fin: fechaFin.toISOString().split("T")[0],
      });
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleStartDateApply = (result: DatePickerResult) => {
    if (result.type === "single") {
      setFechaInicio(new Date(result.date + "T12:00:00"));
    }
    setShowStartPicker(false);
  };

  const handleEndDateApply = (result: DatePickerResult) => {
    if (result.type === "single") {
      setFechaFin(new Date(result.date + "T12:00:00"));
    }
    setShowEndPicker(false);
  };

  if (!gestion) return null;

  return (
    <AnimatePresence>
      {gestion && (
        <RNModal transparent visible onRequestClose={onClose}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.centeredView}
            >
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
                <KeyboardAwareScrollView>
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
                      Editar Gestión
                    </ThemedText>
                    <Pressable onPress={onClose}>
                      <X size={20} color={theme.colors.textSecondary} />
                    </Pressable>
                  </View>

                  <View style={styles.form}>
                    {/*  1. Etiqueta con texto secundario reactivo */}
                    <ThemedText
                      style={[
                        styles.label,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Nombre
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderColor: theme.colors.borderHover,
                          color: theme.colors.text,
                          backgroundColor: theme.colors.cardHover,
                        },
                      ]}
                      value={nombre}
                      onChangeText={setNombre}
                    />

                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        {/*  1. Etiqueta con texto secundario reactivo */}
                        <ThemedText
                          style={[
                            styles.label,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Año
                        </ThemedText>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              borderColor: theme.colors.borderHover,
                              color: theme.colors.text,
                              backgroundColor: theme.colors.cardHover,
                            },
                          ]}
                          keyboardType="number-pad"
                          value={anio.toString()}
                          onChangeText={(t) => setAnio(Number(t) || 0)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.labelRow}>
                          {/*  1. Etiqueta con texto secundario reactivo */}
                          <ThemedText
                            style={[
                              styles.label,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            Período
                          </ThemedText>
                          <Tooltip
                            message="No se puede editar el período de una gestión ya creada."
                            position="top"
                          />
                        </View>
                        {/* Selector deshabilitado */}
                        <View
                          style={[
                            styles.pickerWrap,
                            {
                              borderColor: theme.colors.borderHover,
                              backgroundColor: theme.colors.backgroundSecondary,
                            },
                          ]}
                        >
                          {PERIODOS.map((p) => (
                            <View
                              key={p}
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
                                      : theme.colors.textTertiary, // 2. textTertiary para mejor contraste
                                  fontSize: 12,
                                }}
                              >
                                {p}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        {/*  1. Etiqueta con texto secundario reactivo */}
                        <ThemedText
                          style={[
                            styles.label,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Fecha Inicio
                        </ThemedText>
                        <Pressable
                          onPress={() => setShowStartPicker(true)}
                          style={[
                            styles.dateButton,
                            {
                              borderColor: theme.colors.borderHover,
                              backgroundColor: theme.colors.cardHover,
                            },
                          ]}
                        >
                          <ThemedText style={{ color: theme.colors.text }}>
                            {formatDisplayDate(fechaInicio)}
                          </ThemedText>
                        </Pressable>
                      </View>
                      <View style={{ flex: 1 }}>
                        {/*  1. Etiqueta con texto secundario reactivo */}
                        <ThemedText
                          style={[
                            styles.label,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Fecha Fin
                        </ThemedText>
                        <Pressable
                          onPress={() => setShowEndPicker(true)}
                          style={[
                            styles.dateButton,
                            {
                              borderColor: theme.colors.borderHover,
                              backgroundColor: theme.colors.cardHover,
                            },
                          ]}
                        >
                          <ThemedText style={{ color: theme.colors.text }}>
                            {formatDisplayDate(fechaFin)}
                          </ThemedText>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </KeyboardAwareScrollView>

                <View
                  style={[
                    styles.footer,
                    { borderTopColor: theme.colors.border },
                  ]}
                >
                  <Pressable onPress={onClose} style={styles.cancelBtn}>
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
                    disabled={submitting}
                    style={[
                      styles.submitBtn,
                      {
                        backgroundColor: theme.colors.primary,
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
                      Guardar
                    </ThemedText>
                  </Pressable>
                </View>
              </MotiView>
            </KeyboardAvoidingView>
          </BlurView>

          <DatePickerModal
            visible={showStartPicker}
            mode="single"
            onClose={() => setShowStartPicker(false)}
            onApply={handleStartDateApply}
            initialDate={fechaInicio.toISOString().split("T")[0]}
            maxDate={fechaFin.toISOString().split("T")[0]}
          />

          <DatePickerModal
            visible={showEndPicker}
            mode="single"
            onClose={() => setShowEndPicker(false)}
            onApply={handleEndDateApply}
            initialDate={fechaFin.toISOString().split("T")[0]}
            minDate={fechaInicio.toISOString().split("T")[0]}
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
