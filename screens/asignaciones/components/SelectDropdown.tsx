import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

export type SelectOption<T extends string | number> = {
  label: string;
  value: T;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

type Props<T extends string | number> = {
  label: string;
  value: T | null;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onChange: (value: T) => void;
};

export default function SelectDropdown<T extends string | number>({
  label,
  value,
  options,
  placeholder = "Seleccione una opción",
  disabled = false,
  icon = "chevron-down-outline",
  onChange,
}: Props<T>) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false);

  const isMobile = width < 620;
  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const panel = isDark ? "#111827" : theme.colors.card;
  const field = isDark ? "rgba(255,255,255,0.055)" : "rgba(15,23,42,0.04)";
  const border = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(15,23,42,0.12)";

  const selected = useMemo(
    () => options.find((option) => String(option.value) === String(value)),
    [options, value],
  );

  const choose = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  return (
    <View style={styles.root}>
      <ThemedText style={[styles.label, { color: mutedText }]}>
        {label.toUpperCase()}
      </ThemedText>

      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: field,
            borderColor: open ? theme.colors.primary : border,
            opacity: disabled ? 0.55 : pressed ? 0.78 : 1,
          },
        ]}
      >
        <View style={styles.fieldLeft}>
          <View
            style={[
              styles.fieldIcon,
              {
                backgroundColor: isDark
                  ? "rgba(59,130,246,0.16)"
                  : "#DBEAFE",
              },
            ]}
          >
            <Ionicons
              name={selected?.icon ?? icon}
              size={18}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.fieldTextBox}>
            <ThemedText
              numberOfLines={1}
              style={[
                styles.fieldText,
                { color: selected ? strongText : mutedText },
              ]}
            >
              {selected?.label ?? placeholder}
            </ThemedText>

            {!!selected?.description && (
              <ThemedText
                numberOfLines={1}
                style={[styles.fieldDescription, { color: mutedText }]}
              >
                {selected.description}
              </ThemedText>
            )}
          </View>
        </View>

        <Ionicons
          name="chevron-down-outline"
          size={20}
          color={mutedText}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.modalCard,
              isMobile && styles.modalCardMobile,
              {
                maxHeight: Math.min(height * 0.72, 560),
                backgroundColor: panel,
                borderColor: border,
              },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: border }]}>
              <View style={styles.modalHeaderText}>
                <ThemedText style={[styles.modalTitle, { color: strongText }]}>
                  {label}
                </ThemedText>
                <ThemedText
                  style={[styles.modalSubtitle, { color: mutedText }]}
                >
                  Selecciona una opción para continuar.
                </ThemedText>
              </View>

              <Pressable
                onPress={() => setOpen(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    backgroundColor: field,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Ionicons name="close" size={22} color={strongText} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.optionsScroll}
              contentContainerStyle={styles.optionsContent}
              showsVerticalScrollIndicator
            >
              {options.map((option) => {
                const isSelected = String(option.value) === String(value);

                return (
                  <Pressable
                    key={String(option.value)}
                    disabled={option.disabled}
                    onPress={() => choose(option)}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? "rgba(59,130,246,0.20)"
                            : "#EFF6FF"
                          : field,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : border,
                        opacity: option.disabled
                          ? 0.45
                          : pressed
                            ? 0.76
                            : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : isDark
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(15,23,42,0.06)",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isSelected
                            ? "checkmark"
                            : (option.icon ?? "ellipse-outline")
                        }
                        size={18}
                        color={isSelected ? "#FFFFFF" : mutedText}
                      />
                    </View>

                    <View style={styles.optionTextBox}>
                      <ThemedText
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected
                              ? theme.colors.primary
                              : strongText,
                          },
                        ]}
                      >
                        {option.label}
                      </ThemedText>

                      {!!option.description && (
                        <ThemedText
                          style={[
                            styles.optionDescription,
                            { color: mutedText },
                          ]}
                        >
                          {option.description}
                        </ThemedText>
                      )}
                    </View>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minWidth: 210,
    gap: 7,
  },
  label: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.75,
  },
  field: {
    minHeight: 58,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  fieldLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fieldIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldTextBox: {
    flex: 1,
    minWidth: 0,
  },
  fieldText: {
    fontSize: 13,
    fontWeight: "900",
  },
  fieldDescription: {
    marginTop: 2,
    fontSize: 10.5,
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.78)",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "92%",
    maxWidth: 560,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  },
  modalCardMobile: {
    width: "100%",
    borderRadius: 18,
  },
  modalHeader: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  modalHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  modalSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsScroll: {
    flexGrow: 0,
  },
  optionsContent: {
    padding: 14,
    gap: 9,
  },
  option: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextBox: {
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "900",
  },
  optionDescription: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "600",
  },
});