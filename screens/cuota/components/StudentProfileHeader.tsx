import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";

interface StudentProfileHeaderProps {
  student: any;
  carrera?: string;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  student,
  carrera,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 20,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 20,
      }}
    >
      {/* Avatar */}
      <View style={{ position: "relative" }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            backgroundColor: theme.colors.primarySubtle,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: theme.colors.primary + "33",
          }}
        >
          {student.foto ? (
            <Image
              source={{ uri: student.foto }}
              style={{ width: 96, height: 96, borderRadius: 24 }}
            />
          ) : (
            <Ionicons name="person" size={48} color={theme.colors.primary} />
          )}
        </View>
        <View
          style={{
            position: "absolute",
            bottom: -8,
            right: -8,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: theme.colors.card,
          }}
        >
          <Ionicons name="checkmark" size={18} color="white" />
        </View>
      </View>

      {/* Info principal */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
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
              borderRadius: 30,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                textTransform: "uppercase",
                color: theme.colors.primary,
              }}
            >
              {student.estado === "ACTIVO" ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
          <View>
            <Text
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                fontWeight: "bold",
                color: theme.colors.textSecondary,
              }}
            >
              Matrícula
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: theme.colors.text,
              }}
            >
              {student.matricula || "Sin asignar"}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                fontWeight: "bold",
                color: theme.colors.textSecondary,
              }}
            >
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
          {carrera && (
            <View>
              <Text
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  color: theme.colors.textSecondary,
                }}
              >
                Carrera
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: theme.colors.text,
                }}
              >
                {carrera}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
