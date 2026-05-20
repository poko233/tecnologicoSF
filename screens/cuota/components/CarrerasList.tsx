import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { CarreraInscrita } from "../types/cuota.types";

interface Props {
  carreras: CarreraInscrita[];
  selectedCarrera: CarreraInscrita | null;
  onSelectCarrera: (carrera: CarreraInscrita) => void;
  loading: boolean;
}

export const CarrerasList: React.FC<Props> = ({
  carreras,
  selectedCarrera,
  onSelectCarrera,
  loading,
}) => {
  const { theme } = useTheme();

  if (loading) return <ActivityIndicator color={theme.colors.primary} />;
  if (carreras.length === 0)
    return (
      <Text
        style={{
          color: theme.colors.textSecondary,
          textAlign: "center",
          marginTop: 20,
        }}
      >
        Este estudiante no está inscrito en ninguna carrera.
      </Text>
    );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
    >
      <View style={{ flexDirection: "row", gap: 16 }}>
        {carreras.map((carr) => {
          const isSelected = selectedCarrera?.idCarrera === carr.idCarrera;
          return (
            <Pressable
              key={carr.idCarrera}
              onPress={() => onSelectCarrera(carr)}
              style={{
                minWidth: 280,
                backgroundColor: isSelected
                  ? theme.colors.primarySubtle
                  : theme.colors.card,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.border,
                borderRadius: 12,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: isSelected
                      ? theme.colors.primary
                      : theme.colors.text,
                  }}
                >
                  {carr.nombreCarrera}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={theme.colors.primary}
                  />
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginBottom: 12,
                }}
              >
                Plan 2024 • {carr.duracion}{" "}
                {carr.duracion === 1 ? "Año" : "Años"}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <View>
                  <Text
                    style={{ fontSize: 10, color: theme.colors.textSecondary }}
                  >
                    Mensualidad Base
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.colors.text,
                    }}
                  >
                    {carr.cuota_mensual.toFixed(2)} Bs.
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: theme.colors.backgroundTertiary,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "bold",
                      color: theme.colors.text,
                    }}
                  >
                    {carr.regimen.toUpperCase()}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};
