// screens/arqueo/components/TiposTransaccionTab.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { Pencil, Plus, Trash2 } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import { Skeleton } from "moti/skeleton";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { tipoTransaccionService } from "../services/tipoTransaccion.service";
import { TipoTransaccion } from "../types/transaccion.types";
import { TipoTransaccionFormModal } from "./TipoTransaccionFormModal";

export function TiposTransaccionTab() {
  const { theme } = useTheme();
  const [tipos, setTipos] = useState<TipoTransaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [tipoEdit, setTipoEdit] = useState<TipoTransaccion | null>(null);

  // Nuevo estado para controlar qué fila se está eliminando
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTipos = async () => {
    setLoading(true);
    try {
      const response = await tipoTransaccionService.getAll();
      setTipos(response.data || []);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Error al cargar tipos",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTipos();
  }, []);

  const handleDelete = async (id: number) => {
    // Evitar doble clic mientras se está eliminando esta fila
    if (deletingId === id) return;

    setDeletingId(id); //  Activamos el spinner para este ID
    try {
      await tipoTransaccionService.delete(id);
      Toast.show({ type: "success", text1: "Éxito", text2: "Tipo eliminado" });
      loadTipos();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Error al eliminar",
      });
    } finally {
      setDeletingId(null); //  Desactivamos el spinner
    }
  };

  const renderItem = ({ item }: { item: TipoTransaccion }) => (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <View style={{ flex: 1 }}>
        <ThemedText style={{ color: theme.colors.text }}>
          {item.codigo}
        </ThemedText>
      </View>
      <View style={{ flex: 2 }}>
        <ThemedText style={{ color: theme.colors.text }}>
          {item.transaccion}
        </ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={{ color: theme.colors.textSecondary }}>
          {item.tipo}
        </ThemedText>
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        {/* Botón de Editar */}
        <MotiPressable
          onPress={() => {
            setTipoEdit(item);
            setFormVisible(true);
          }}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
        >
          <Pencil size={18} color={theme.colors.primary} />
        </MotiPressable>

        {/*  Botón de Eliminar - Se convierte en Spinner mientras carga */}
        {deletingId === item.id ? (
          <ActivityIndicator size="small" color={theme.colors.destructive} />
        ) : (
          <MotiPressable
            onPress={() => handleDelete(item.id)}
            animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
          >
            <Trash2 size={18} color={theme.colors.destructive} />
          </MotiPressable>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={[styles.row, { borderBottomColor: theme.colors.border }]}
          >
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="20%"
              height={16}
              radius={4}
            />
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="40%"
              height={16}
              radius={4}
            />
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="20%"
              height={16}
              radius={4}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Encabezado con botón */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 4,
        }}
      >
        <ThemedText
          style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}
        >
          Tipos de Transacción
        </ThemedText>
        <MotiPressable
          onPress={() => {
            setTipoEdit(null);
            setFormVisible(true);
          }}
          animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
          style={[styles.newButton, { backgroundColor: theme.colors.primary }]}
        >
          <Plus size={16} color="#fff" />
          <ThemedText
            style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
          >
            Nuevo Tipo
          </ThemedText>
        </MotiPressable>
      </View>

      {/* Tabla de Tipos */}
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.headerRow,
            {
              borderBottomColor: theme.colors.border,
              backgroundColor: theme.colors.backgroundSecondary,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <ThemedText
              style={{
                ...styles.headerText,
                color: theme.colors.textSecondary,
              }}
            >
              Código
            </ThemedText>
          </View>
          <View style={{ flex: 2 }}>
            <ThemedText
              style={{
                ...styles.headerText,
                color: theme.colors.textSecondary,
              }}
            >
              Transacción
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText
              style={{
                ...styles.headerText,
                color: theme.colors.textSecondary,
              }}
            >
              Tipo
            </ThemedText>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <ThemedText
              style={{
                ...styles.headerText,
                color: theme.colors.textSecondary,
              }}
            >
              Acciones
            </ThemedText>
          </View>
        </View>
        <FlatList
          data={tipos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: "center" }}>
              <ThemedText style={{ color: theme.colors.textSecondary }}>
                No hay tipos de transacción registrados
              </ThemedText>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 8 }}
        />
      </View>

      <TipoTransaccionFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSuccess={loadTipos}
        tipoEdit={tipoEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
