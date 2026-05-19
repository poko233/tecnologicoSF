import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export default function FormSelect({
  label,
  value,
  options,
  onChange,
}: Props) {
  const { theme } = useTheme();

  const [open, setOpen] = useState(false);

  const isPrimaryWhite =
    theme.colors.primary === "#fff" ||
    theme.colors.primary === "#FFF" ||
    theme.colors.primary === "#ffffff" ||
    theme.colors.primary === "#FFFFFF" ||
    theme.colors.primary === "white";

  const activeTextColor = isPrimaryWhite
    ? "#111827"
    : "#FFFFFF";

  return (
    <View style={{ flex: 1 }}>
      <ThemedText
        style={{
          fontSize: 12,
          marginBottom: 8,
          fontWeight: "800",
          color: theme.colors.text,
        }}
      >
        {label}
      </ThemedText>

      <Pressable
        onPress={() => setOpen(true)}
        style={{
          height: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor:
            theme.colors.background,
          paddingHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ThemedText
          style={{
            color: theme.colors.text,
            fontSize: 15,
          }}
        >
          {value}
        </ThemedText>

        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.text}
        />
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="fade"
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor:
              "rgba(0,0,0,0.55)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: 360,
              backgroundColor:
                theme.colors.card,
              borderRadius: 22,
              borderWidth: 1,
              borderColor:
                theme.colors.border,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View
              style={{
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor:
                  theme.colors.border,
                flexDirection: "row",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                Seleccionar{" "}
                {label.toLowerCase()}
              </ThemedText>

              <Pressable
                onPress={() => setOpen(false)}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator
              style={{
                maxHeight: 300,
              }}
              contentContainerStyle={{
                paddingBottom: 10,
              }}
            >
              {options.map((option) => {
                const active =
                  option === value;

                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 15,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        theme.colors.border,
                      backgroundColor:
                        active
                          ? theme.colors.primary
                          : theme.colors.card,
                      flexDirection: "row",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <ThemedText
                      style={{
                        color: active
                          ? activeTextColor
                          : theme.colors.text,
                        fontWeight: active
                          ? "900"
                          : "700",
                        fontSize: 15,
                      }}
                    >
                      {option}
                    </ThemedText>

                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={
                          activeTextColor
                        }
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}