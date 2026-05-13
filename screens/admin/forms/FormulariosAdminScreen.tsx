import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { adminService } from "../services/admin.service";
import { AdminFormulario } from "../types/admin.types";

export function FormulariosAdminScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<AdminFormulario[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getFormularios();
        setForms(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}> 
      <FlatList
        data={forms}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: c.textSecondary }}>No hay formularios disponibles.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
            <View style={styles.row}>
              <Ionicons name={(item.icon as any) || "document-text-outline"} size={20} color={c.primary} />
              <Text style={[styles.title, { color: c.text }]}>{item.name}</Text>
            </View>
            <Text style={[styles.meta, { color: c.textSecondary }]}>Módulo: {item.moduleName}</Text>
            <Text style={[styles.meta, { color: c.textSecondary }]}>Ruta: {item.route}</Text>
            <Text style={[styles.meta, { color: c.textSecondary }]}>Componente: {item.componentKey}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  meta: {
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
});
