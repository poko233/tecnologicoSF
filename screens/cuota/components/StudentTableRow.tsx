import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { Estudiante } from "../types/cuota.types";

interface StudentTableRowProps {
  student: Estudiante;
  onPress: (student: Estudiante) => void;
  isEven: boolean;
}

export const StudentTableRow: React.FC<StudentTableRowProps> = ({
  student,
  onPress,
  isEven,
}) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => onPress(student)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: isEven
          ? theme.colors.backgroundSecondary
          : theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flex: 2 }}>
        <Text style={{ fontWeight: "500", color: theme.colors.text }}>
          {student.nombreCompleto}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.textSecondary }}>{student.ci}</Text>
      </View>
      <View style={{ flex: 1.5 }}>
        <Text style={{ color: theme.colors.textSecondary }}>
          {student.matricula || "—"}
        </Text>
      </View>
      <View style={{ flex: 0.5, alignItems: "flex-end" }}>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.primary}
        />
      </View>
    </Pressable>
  );
};
