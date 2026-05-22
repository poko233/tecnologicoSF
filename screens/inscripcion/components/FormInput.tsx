import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardTypeOptions,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  label: string;

  placeholder?: string;

  value: string;

  onChangeText: (text: string) => void;

  keyboardType?: KeyboardTypeOptions;

  required?: boolean;

  maxLength?: number;

  onlyNumbers?: boolean;

  error?: string;

  success?: string;

loading?: boolean;

  touched?: boolean;

  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";

  editable?: boolean;
};

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  required = false,
  maxLength,
  onlyNumbers = false,
  error,
  touched = false,
  autoCapitalize = "sentences",
  editable = true,
  success,
loading = false,
}: Props) {
  const { theme } = useTheme();

  const hasError = Boolean(error);

  const handleChange = (text: string) => {
    let cleanText = text;

    if (onlyNumbers) {
      cleanText = text.replace(/[^0-9]/g, "");
    }

    onChangeText(cleanText);
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          marginBottom: 8,

          flexDirection: "row",

          justifyContent: "space-between",

          alignItems: "center",

          gap: 10,
        }}
      >
        <ThemedText
          style={{
            fontSize: 12,

            fontWeight: "900",

            color: hasError
              ? "#EF4444"
              : theme.colors.text,
          }}
        >
          {label}
          {required ? " *" : ""}
        </ThemedText>

        {maxLength ? (
          <ThemedText
            style={{
              fontSize: 11,

              color: theme.colors.muted,

              fontWeight: "700",
            }}
          >
            {value.length}/{maxLength}
          </ThemedText>
        ) : null}
      </View>

      <View
        style={{
          minHeight: 52,

          borderRadius: 14,

          borderWidth: 1,

          borderColor: hasError
            ? "#EF4444"
            : theme.colors.border,

          backgroundColor: editable
            ? theme.colors.background
            : theme.colors.card,

          flexDirection: "row",

          alignItems: "center",

          paddingHorizontal: 14,
        }}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={
            theme.colors.muted
          }
          value={value}
          editable={editable}
          onChangeText={handleChange}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={{
            flex: 1,

            minHeight: 52,

            color: editable
              ? theme.colors.text
              : theme.colors.muted,

            fontSize: 15,

            fontWeight: "600",

            outlineStyle: "none" as any,
          }}
        />

        {value.length > 0 && editable && (
          <Pressable
            onPress={() => onChangeText("")}
            style={{
              width: 30,

              height: 30,

              borderRadius: 999,

              justifyContent: "center",

              alignItems: "center",
            }}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.muted}
            />
          </Pressable>
        )}
      </View>

      {hasError && (
        <ThemedText
          style={{
            marginTop: 6,

            fontSize: 11,

            color: "#EF4444",

            fontWeight: "800",

            paddingHorizontal: 2,
          }}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
}