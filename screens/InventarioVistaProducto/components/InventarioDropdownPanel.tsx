import { Ionicons } from "@expo/vector-icons";
import {
    Pressable,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";

import { InventarioVistaProductoStyles } from "../styles/inventarioVistaProducto.styles";

export type InventarioDropdownOption = {
  label: string;
  value: string;
};

type Props = {
  title: string;

  empty: string;

  options: InventarioDropdownOption[];

  selectedValue: string;

  colors: any;

  styles: InventarioVistaProductoStyles;

  onClose: () => void;

  onSelect: (
    value: string,
  ) => void;
};

export default function InventarioDropdownPanel({
  title,
  empty,
  options,
  selectedValue,
  colors,
  styles,
  onClose,
  onSelect,
}: Props) {
  const primaryForeground =
    colors.primaryForeground ||
    "#FFFFFF";

  return (
    <View
      style={styles.dropdownPanel}
    >
      <View
        style={styles.dropdownHeader}
      >
        <ThemedText
          style={styles.dropdownTitle}
        >
          {title}
        </ThemedText>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.dropdownClose,

            {
              opacity: pressed
                ? 0.75
                : 1,
            },
          ]}
        >
          <Ionicons
            name="close-outline"
            size={19}
            color={colors.text}
          />
        </Pressable>
      </View>

      {options.length === 0 ? (
        <ThemedText
          style={styles.dropdownEmpty}
        >
          {empty}
        </ThemedText>
      ) : (
        <View
          style={
            styles.dropdownOptions
          }
        >
          {options.map((option) => {
            const active =
              String(
                selectedValue,
              ) ===
              String(option.value);

            return (
              <Pressable
                key={`${option.value}-${option.label}`}
                onPress={() =>
                  onSelect(option.value)
                }
                style={({ pressed }) => [
                  styles.dropdownOption,

                  active &&
                    styles.dropdownOptionActive,

                  {
                    opacity: pressed
                      ? 0.78
                      : 1,
                  },
                ]}
              >
                {active && (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color={
                      primaryForeground
                    }
                  />
                )}

                <ThemedText
                  style={[
                    styles.dropdownOptionText,

                    active &&
                      styles.dropdownOptionTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}