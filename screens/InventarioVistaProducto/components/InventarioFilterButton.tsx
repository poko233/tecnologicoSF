import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";

import { InventarioVistaProductoStyles } from "../styles/inventarioVistaProducto.styles";

type Props = {
  label: string;

  value: string;

  selected?: boolean;

  open?: boolean;

  disabled?: boolean;

  colors: any;

  styles: InventarioVistaProductoStyles;

  onPress: () => void;
};

export default function InventarioFilterButton({
  label,
  value,
  selected = false,
  open = false,
  disabled = false,
  colors,
  styles,
  onPress,
}: Props) {
  const active =
    selected || open;

  const primaryForeground =
    colors.primaryForeground ||
    "#FFFFFF";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterBtn,

        active &&
          styles.filterBtnActive,

        disabled &&
          styles.filterBtnDisabled,

        pressed &&
          !disabled &&
          styles.filterBtnPressed,
      ]}
    >
      <View
        style={
          styles.filterBtnTextBox
        }
      >
        <ThemedText
          numberOfLines={1}
          style={[
            styles.filterLabel,

            active &&
              styles.filterLabelActive,
          ]}
        >
          {label}
        </ThemedText>

        <ThemedText
          numberOfLines={1}
          style={[
            styles.filterValue,

            active &&
              styles.filterValueActive,
          ]}
        >
          {value}
        </ThemedText>
      </View>

      <View
        style={[
          styles.filterIconBox,

          active &&
            styles.filterIconBoxActive,
        ]}
      >
        <Ionicons
          name={
            open
              ? "chevron-up-outline"
              : "chevron-down-outline"
          }
          size={18}
          color={
            active
              ? primaryForeground
              : colors.text
          }
        />
      </View>
    </Pressable>
  );
}