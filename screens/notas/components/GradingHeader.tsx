import { useTheme } from "@/theme/useTheme";
import { ArrowLeft, Save } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  grupo: string;
  gestion: string;
  materia: string;
  onBack: () => void;
  onExportCSV: () => void;
  onSave: () => void; // <-- NUEVO PROP
  saving: boolean; // <-- NUEVO PROP
}

export function GradingHeader({
  grupo,
  gestion,
  materia,
  onBack,
  onExportCSV,
  onSave,
  saving,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.container, { borderBottomColor: c.border }]}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={22} color={c.primary} />
        </TouchableOpacity>

        <View style={styles.info}>
          <View style={styles.breadcrumb}>
            <Text style={[styles.breadcrumbText, { color: c.textSecondary }]}>
              {grupo}
            </Text>
            <Text style={[styles.separator, { color: c.textSecondary }]}>
              ›
            </Text>
            <Text style={[styles.breadcrumbText, { color: c.textSecondary }]}>
              {gestion}
            </Text>
          </View>
          <Text style={[styles.title, { color: c.text }]}>{materia}</Text>
        </View>
      </View>

      {/* Contenedor de Botones de Acción */}
      <View style={styles.actionsSection}>
        <MotiPressable
          onPress={onExportCSV}
          style={[styles.exportBtn, { borderColor: c.border }]}
          animate={({ pressed }) => ({ scale: pressed ? 0.96 : 1 })}
        >
          <Text
            style={{ color: c.textSecondary, fontSize: 13, fontWeight: "600" }}
          >
            Exportar CSV
          </Text>
        </MotiPressable>

        <MotiPressable
          onPress={onSave}
          disabled={saving}
          style={[
            styles.saveButton,
            { backgroundColor: saving ? c.disabled : c.primary },
          ]}
          animate={({ pressed }) => ({ scale: pressed ? 0.96 : 1 })}
        >
          {saving ? (
            <ActivityIndicator size="small" color={c.primaryForeground} />
          ) : (
            <Save size={16} color={c.primaryForeground} />
          )}
          <Text style={[styles.saveText, { color: c.primaryForeground }]}>
            {saving ? "Guardando..." : "Guardar Notas"}
          </Text>
        </MotiPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 10, // Asegura que el header esté sobre la tabla
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  backBtn: { padding: 4 },
  info: { flex: 1 },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  separator: { fontSize: 12, marginHorizontal: 2 },
  title: { fontSize: 22, fontWeight: "700" },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exportBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveText: { fontSize: 13, fontWeight: "700" },
});
