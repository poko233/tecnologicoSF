import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
 
type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

export default function EmptyState({
  icon = "file-tray-outline",
  title,
  subtitle,
}: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: theme.colors.primary + "18",
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={34} color={theme.colors.primary} />
      </View>

      <ThemedText style={styles.title}>{title}</ThemedText>

      {!!subtitle && (
        <ThemedText style={[styles.subtitle, { color: theme.colors.text }]}>
          {subtitle}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: "center",
    maxWidth: 320,
  },
});