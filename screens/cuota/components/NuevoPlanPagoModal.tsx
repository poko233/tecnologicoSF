import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { DatePickerField } from "../../auth/components/DatePickerField";

interface NuevoPlanPagoModalProps {
  visible: boolean;
  onClose: () => void;
  estudianteId: number;
  matriculaActual?: string | null; // nueva prop
  onSubmit: (data: any) => Promise<void>;
}

export const NuevoPlanPagoModal: React.FC<NuevoPlanPagoModalProps> = ({
  visible,
  onClose,
  estudianteId,
  matriculaActual,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const [gestion, setGestion] = useState(new Date().getFullYear().toString());
  const [numeroCuotas, setNumeroCuotas] = useState("11");
  const [montoCuota, setMontoCuota] = useState("");
  const [montoPromocion, setMontoPromocion] = useState(""); // nuevo
  const [matriculaNumero, setMatriculaNumero] = useState(matriculaActual || ""); // nuevo, prellenado
  const [conMatriculaEspecial, setConMatriculaEspecial] = useState(false);
  const [montoMatriculaEspecial, setMontoMatriculaEspecial] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const numCuotas = parseInt(numeroCuotas, 10);
    if (isNaN(numCuotas) || numCuotas < 1) {
      // Toast error
      return;
    }
    const monto = parseFloat(montoCuota);
    if (isNaN(monto) || monto <= 0) {
      return;
    }
    const montoProm = montoPromocion ? parseFloat(montoPromocion) : monto;
    const data: any = {
      usuario_id: estudianteId,
      gestion: parseInt(gestion, 10),
      numero_cuotas: numCuotas,
      monto_cuota: monto,
      monto_cuota_promocion: montoProm,
      matricula_numero: matriculaNumero.trim() !== "" ? matriculaNumero : null,
      con_matricula_especial: conMatriculaEspecial,
    };
    if (conMatriculaEspecial && montoMatriculaEspecial) {
      data.monto_matricula_especial = parseFloat(montoMatriculaEspecial);
    }
    if (fechaInicio.trim() !== "") {
      data.fecha_inicio = fechaInicio;
    }
    setLoading(true);
    await onSubmit(data);
    setLoading(false);
    onClose();
    // El modal se cierra desde el padre (onSubmit cierra el modal al éxito)
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 500,
            backgroundColor: theme.colors.card,
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              Nuevo Plan de Pago
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView style={{ padding: 20, maxHeight: 500 }}>
            {/* Gestión */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: theme.colors.textSecondary,
                }}
              >
                Gestión (año)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: 12,
                  padding: 12,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={gestion}
                onChangeText={setGestion}
              />
            </View>
            {/* Número de cuotas */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: theme.colors.textSecondary,
                }}
              >
                Número de cuotas mensuales
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: 12,
                  padding: 12,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={numeroCuotas}
                onChangeText={setNumeroCuotas}
                placeholder="Ej: 11"
              />
            </View>
            {/* Monto por cuota normal */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: theme.colors.textSecondary,
                }}
              >
                Monto por cuota normal (Bs)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: 12,
                  padding: 12,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={montoCuota}
                onChangeText={setMontoCuota}
                placeholder="0.00"
              />
            </View>
            {/* Monto de primera cuota (promoción) */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: theme.colors.textSecondary,
                }}
              >
                Monto de primera cuota (promoción, opcional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: 12,
                  padding: 12,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={montoPromocion}
                onChangeText={setMontoPromocion}
                placeholder="Dejar vacío para usar el mismo monto"
              />
            </View>
            {/* Número de matrícula */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: theme.colors.textSecondary,
                }}
              >
                Número de matrícula
              </Text>
              <View
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text
                  style={{
                    color: matriculaActual
                      ? theme.colors.text
                      : theme.colors.textMuted,
                  }}
                >
                  {matriculaActual || "Sin matrícula asignada"}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.textMuted,
                  marginTop: 4,
                }}
              >
                La matrícula se asigna automáticamente al estudiante y no se
                puede modificar aquí.
              </Text>
            </View>
            {/* Matrícula especial adicional */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: theme.colors.text }}>
                ¿Requiere matrícula especial adicional?
              </Text>
              <Switch
                value={conMatriculaEspecial}
                onValueChange={setConMatriculaEspecial}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
              />
            </View>
            {conMatriculaEspecial && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    marginBottom: 4,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Monto matrícula especial (Bs)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderRadius: 12,
                    padding: 12,
                    color: theme.colors.text,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={montoMatriculaEspecial}
                  onChangeText={setMontoMatriculaEspecial}
                  placeholder="0.00"
                />
              </View>
            )}
            {/* Fecha de inicio */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: theme.colors.textSecondary,
                }}
              >
                Fecha de inicio (opcional)
              </Text>
              <DatePickerField
                value={fechaInicio ? new Date(fechaInicio) : null}
                onChange={(isoDate) => setFechaInicio(isoDate)}
                label="Seleccionar fecha"
              />
            </View>
          </ScrollView>
          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 8,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: theme.colors.textSecondary }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => ({
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 8,
                opacity: pressed || loading ? 0.7 : 1,
              })}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white", fontWeight: "600" }}>Crear</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
