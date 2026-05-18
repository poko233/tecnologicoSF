import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme } from "../../../theme/useTheme";
import { Estudiante } from "../types/cuota.types";

interface StudentCardProps {
  student: Estudiante;
  onPress: (student: Estudiante) => void;
  index: number;
  compact?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onPress,
  index,
  compact = false,
}) => {
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeInUp.delay(index * 30).duration(300)}>
      <Pressable
        onPress={() => onPress(student)}
        style={({ pressed }) => ({
          backgroundColor: theme.colors.card,
          borderRadius: compact ? 8 : 16,
          padding: compact ? 12 : 16,
          marginHorizontal: compact ? 8 : 0,
          marginBottom: compact ? 4 : 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: compact ? 36 : 48,
              height: compact ? 36 : 48,
              borderRadius: compact ? 18 : 24,
              backgroundColor: theme.colors.primarySubtle,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="person-outline"
              size={compact ? 18 : 24}
              color={theme.colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: compact ? 14 : 16,
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              {student.nombreCompleto}
            </Text>
            <Text
              style={{
                fontSize: compact ? 11 : 12,
                color: theme.colors.textSecondary,
                marginTop: 2,
              }}
            >
              CI: {student.ci}{" "}
              {student.matricula ? ` · Mat: ${student.matricula}` : ""}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={compact ? 16 : 20}
            color={theme.colors.textMuted}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};
