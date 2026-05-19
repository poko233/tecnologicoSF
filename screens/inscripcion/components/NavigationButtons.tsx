import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  onNext: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  nextLabel?: string;
};

export default function NavigationButtons({
  onNext,
  onBack,
  onCancel,
  loading = false,
  nextLabel = "Siguiente",
}: Props) {
  const { theme } = useTheme();

  const isPrimaryWhite =
    theme.colors.primary === "#fff" ||
    theme.colors.primary === "#FFF" ||
    theme.colors.primary === "#ffffff" ||
    theme.colors.primary === "#FFFFFF" ||
    theme.colors.primary === "white";

  const buttonTextColor = isPrimaryWhite ? "#111827" : "#FFFFFF";

  return (
    <View
      style={{
        marginTop: 32,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {onBack && (
          <Pressable
            onPress={onBack}
            style={{
              height: 50,
              paddingHorizontal: 20,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.border,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 8,
              backgroundColor: theme.colors.card,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={theme.colors.text}
            />

            <ThemedText
              style={{
                color: theme.colors.text,
                fontWeight: "800",
                fontSize: 14,
              }}
            >
              Atrás
            </ThemedText>
          </Pressable>
        )}

        <Pressable
          onPress={onCancel}
          style={{
            height: 50,
            paddingHorizontal: 20,
            borderRadius: 14,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ThemedText
            style={{
              color: theme.colors.text,
              fontWeight: "800",
              fontSize: 14,
              opacity: 0.8,
            }}
          >
            Cancelar
          </ThemedText>
        </Pressable>
      </View>

      <Pressable
        disabled={loading}
        onPress={onNext}
        style={{
          height: 54,
          minWidth: 180,
          borderRadius: 14,
          backgroundColor: loading
            ? theme.colors.border
            : theme.colors.primary,
          borderWidth: 1,
          borderColor: theme.colors.border,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 20,
          opacity: loading ? 0.8 : 1,
        }}
      >
        {loading ? (
          <>
            <ActivityIndicator color={buttonTextColor} size="small" />

            <ThemedText
              style={{
                color: buttonTextColor,
                fontWeight: "900",
                fontSize: 14,
              }}
            >
              Procesando...
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText
              style={{
                color: buttonTextColor,
                fontWeight: "900",
                fontSize: 14,
              }}
            >
              {nextLabel}
            </ThemedText>

            <Ionicons
              name="arrow-forward"
              size={20}
              color={buttonTextColor}
            />
          </>
        )}
      </Pressable>
    </View>
  );
}