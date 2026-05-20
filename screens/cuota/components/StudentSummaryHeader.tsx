import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { Estudiante } from "../types/cuota.types";

interface Props {
  student: Estudiante;
}

export const StudentSummaryHeader: React.FC<Props> = ({ student }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 16,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 20,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: theme.colors.primarySubtle,
        }}
      >
        {student.foto ? (
          <Image
            source={{ uri: student.foto }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.primarySubtle,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person" size={40} color={theme.colors.primary} />
          </View>
        )}
      </View>

      {/* Información */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: theme.colors.text,
            }}
          >
            {student.nombreCompleto}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: theme.colors.primarySubtle,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: theme.colors.primary,
              }}
            >
              {student.estado === "ACTIVO" ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 4,
          }}
        >
          <View>
            <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>
              Matrícula
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: theme.colors.text,
              }}
            >
              {student.matricula || "—"}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>
              CI
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: theme.colors.text,
              }}
            >
              {student.ci}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>
              Email
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: theme.colors.text,
              }}
            >
              {student.email || "—"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
