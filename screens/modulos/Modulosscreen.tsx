import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@theme";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ModuloCard } from "./components/ModuloCard";
import { ModuloModal } from "./components/Modulomodal";
import { ModuloSkeleton } from "./components/ModuloSkeleton";
import { useModulos } from "./hooks/useModulos";
import { Modulo } from "./types/modulo.types";

export function ModulosScreen() {
  const { theme } = useTheme();
  const c = theme.colors;

  const {
    modulos,
    loading,
    refreshing,
    onRefresh,
    createModulo,
    updateModulo,
    deleteModulo,
    reorderModulos,
  } = useModulos();

  // ── Estado del modal ───────────────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [moduloEditing, setModuloEditing] = useState<Modulo | null>(null);

  // ── Búsqueda local ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const filtered = modulos.filter((m) =>
    m.modulo.toLowerCase().includes(search.toLowerCase())
  );

  // ── Estado local para drag & drop ──────────────────────────────────────────
  const [localModulos, setLocalModulos] = useState<Modulo[]>(modulos);

  // ── Abrir modal crear ──────────────────────────────────────────────────────
  const openCreate = () => {
    setModuloEditing(null);
    setModalVisible(true);
  };

  // ── Abrir modal editar ─────────────────────────────────────────────────────
  const openEdit = (m: Modulo) => {
    setModuloEditing(m);
    setModalVisible(true);
  };

  // ── Submit unificado (crear o editar) ──────────────────────────────────────
  const handleSubmit = async (payload: any): Promise<boolean> => {
    if (moduloEditing) {
      return await updateModulo(moduloEditing.id, payload);
    }
    return await createModulo(payload);
  };

  // ── Sincronizar módulos del hook con estado local ──────────────────────────
  React.useEffect(() => {
    if (search === "") {
      setLocalModulos(modulos);
    } else {
      setLocalModulos(filtered);
    }
  }, [modulos, search]);

  // ── Manejar reorden drag & drop ────────────────────────────────────────────
  const handleDragEnd = async (data: Modulo[]) => {
    setLocalModulos(data);

    // Preparar payload para el backend
    const reorderPayload = data.map((modulo, index) => ({
      id: modulo.id,
      posicion: index + 1,
    }));

    // Llamar al servicio de reorden
    await reorderModulos(reorderPayload);
  };

  // ── Renderizar item draggable ──────────────────────────────────────────────
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Modulo>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive || search !== ""}
          style={{
            opacity: isActive ? 0.8 : 1,
          }}
        >
          <ModuloCard
            modulo={item}
            onEdit={openEdit}
            onDelete={deleteModulo}
            isDragging={isActive}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: c.background }]}>
        {/* ── Header ── */}
        <View style={[styles.topBar, { borderBottomColor: c.border }]}>
          <View>
            <Text style={[styles.pageTitle, { color: c.text }]}>Módulos</Text>
            <Text style={[styles.pageSub, { color: c.textSecondary }]}>
              {modulos.length} módulo{modulos.length !== 1 ? "s" : ""} registrados
              {search === "" && " • Mantén presionado para reordenar"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={openCreate}
            style={[styles.btnNuevo, { backgroundColor: c.primary }]}
          >
            <Ionicons name="add" size={18} color={c.primaryForeground} />
            <Text style={[styles.btnNuevoText, { color: c.primaryForeground }]}>
              Nuevo
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Buscador ── */}
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: c.backgroundSecondary },
          ]}
        >
          <View
            style={[
              styles.searchBar,
              { backgroundColor: c.input, borderColor: c.border },
            ]}
          >
            <Ionicons name="search-outline" size={16} color={c.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar módulo..."
              placeholderTextColor={c.muted}
              style={[styles.searchInput, { color: c.text }]}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={16} color={c.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Lista ── */}
        {loading && modulos.length === 0 ? (
          <ModuloSkeleton />
        ) : (
          <DraggableFlatList
            data={localModulos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            onDragEnd={({ data }) => handleDragEnd(data)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="cube-outline" size={48} color={c.muted} />
                <Text style={[styles.emptyText, { color: c.muted }]}>
                  {search ? "Sin resultados" : "No hay módulos aún"}
                </Text>
              </View>
            }
          />
        )}

        {/* ── Modal crear / editar ── */}
        <ModuloModal
          visible={modalVisible}
          modulo={moduloEditing}
          modulos={modulos}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmit}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  pageTitle: { fontSize: 20, fontWeight: "700" },
  pageSub:   { fontSize: 12, marginTop: 2 },
  btnNuevo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  btnNuevoText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  list:  { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { fontSize: 14, marginTop: 12 },
});