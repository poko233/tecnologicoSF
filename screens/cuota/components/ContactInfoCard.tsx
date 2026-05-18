import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";

interface ContactInfoCardProps {
  student: any;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  student,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: 1,
          color: theme.colors.textSecondary,
          marginBottom: 16,
        }}
      >
        Información de Contacto
      </Text>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: theme.colors.backgroundSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
          <View>
            <Text
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                color: theme.colors.textSecondary,
              }}
            >
              Email
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.text }}>
              {student.email || "No registrado"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: theme.colors.backgroundSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="call-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
          <View>
            <Text
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                color: theme.colors.textSecondary,
              }}
            >
              Celular
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.text }}>
              {student.celular || "No registrado"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: theme.colors.backgroundSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
          <View>
            <Text
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                color: theme.colors.textSecondary,
              }}
            >
              Dirección
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.text }}>
              {student.direccion || "No registrada"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
