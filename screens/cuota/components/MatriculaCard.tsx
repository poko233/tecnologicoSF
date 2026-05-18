import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { useGenerarMatricula } from "../hooks/useGenerarMatricula";
import { MatriculaModal } from "./MatriculaModal";

interface MatriculaCardProps {
  student: any; // objeto estudiante (con id, nombreCompleto, matricula actual)
  onMatriculaGenerada: () => void; // callback para refrescar detalle
}

export const MatriculaCard: React.FC<MatriculaCardProps> = ({
  student,
  onMatriculaGenerada,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const { generarMatricula, isLoading } = useGenerarMatricula();

  const hasMatricula = !!student.matricula;

  const handleGenerar = async (
    requierePago: boolean,
    monto: number,
    observacion: string,
  ) => {
    await generarMatricula(student.id, requierePago, monto, observacion, () => {
      setModalVisible(false);
      onMatriculaGenerada();
    });
  };

  return (
    <>
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 1,
              color: theme.colors.textSecondary,
            }}
          >
            Matrícula
          </Text>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ padding: 20, alignItems: "center", gap: 16 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.primarySubtle,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="school-outline"
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              textAlign: "center",
              color: theme.colors.textSecondary,
            }}
          >
            {hasMatricula
              ? `Matrícula activa: ${student.matricula}`
              : "El estudiante aún no tiene matrícula para la gestión actual."}
          </Text>
          {!hasMatricula && (
            <>
              <Text
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  color: theme.colors.textMuted,
                }}
              >
                Sin matrícula asignada
              </Text>
            </>
          )}
          <Pressable
            style={({ pressed }) => ({
              width: "100%",
              backgroundColor: hasMatricula
                ? theme.colors.disabled
                : theme.colors.destructive,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
              opacity: pressed ? 0.9 : 1,
            })}
            onPress={() => setModalVisible(true)}
            disabled={hasMatricula}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={hasMatricula ? theme.colors.disabledForeground : "white"}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: hasMatricula
                    ? theme.colors.disabledForeground
                    : "white",
                }}
              >
                {hasMatricula ? "Matrícula ya generada" : "Generar Matrícula"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <MatriculaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleGenerar}
        isLoading={isLoading}
        estudianteNombre={student.nombreCompleto}
      />
    </>
  );
};
