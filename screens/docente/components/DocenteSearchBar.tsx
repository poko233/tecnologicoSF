import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  isMobile: boolean;
};

export default function DocenteSearchBar({
  search,
  onSearchChange,
  onAdd,
  isMobile,
}: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { flexDirection: isMobile ? "column" : "row" },
      ]}
    >
      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.title, { color: theme.colors.text }]}>
          Registro de Docentes
        </ThemedText>

        <ThemedText
          style={[styles.subtitle, { color: theme.colors.textSecondary }]}
        >
          Gestión administrativa del personal académico.
        </ThemedText>
      </View>

      <View style={[styles.actions, { width: isMobile ? "100%" : "auto" }]}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.colors.input,
              borderColor: theme.colors.inputBorder,
              width: isMobile ? "100%" : 360,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={theme.colors.text} />

          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Buscar docente..."
            placeholderTextColor={theme.colors.textTertiary}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>

        <Pressable
          onPress={onAdd}
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons
            name="add"
            size={21}
            color={theme.colors.primaryForeground}
          />
          <ThemedText
            style={[styles.addText, { color: theme.colors.primaryForeground }]}
          >
            Nuevo
          </ThemedText>
        </Pressable>

        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  searchBox: {
    height: 60,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    outlineStyle: "none" as any,
  },
  addButton: {
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addText: {
    fontSize: 14,
    fontWeight: "900",
  },
});