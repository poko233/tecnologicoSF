import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../theme/useTheme";
import { useFormularios } from "./useFormularios";

export function FormulariosAdminScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { formularios, loading, saving, createFormulario } = useFormularios();

  const [modalVisible, setModalVisible] = useState(false);
  const [formulario, setFormulario] = useState("");
  const [ruta, setRuta] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formulario.trim()) next.formulario = "El nombre del formulario es obligatorio";
    if (!ruta.trim()) next.ruta = "La ruta es obligatoria";
    if (ruta.trim() && !ruta.trim().startsWith("/")) next.ruta = "La ruta debe iniciar con /";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openCreate = () => {
    setFormulario("");
    setRuta("");
    setDescripcion("");
    setErrors({});
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const created = await createFormulario({
        formulario: formulario.trim(),
        ruta: ruta.trim(),
        descripcion: descripcion.trim() || undefined,
      });

      Toast.show({
        type: "success",
        text1: "Formulario creado",
        text2: `Se registró correctamente con ID ${created.id}`,
      });
      setModalVisible(false);
    } catch {
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}> 
      <View style={[styles.topBar, { backgroundColor: c.card, borderBottomColor: c.border }]}> 
        <View>
          <Text style={[styles.title, { color: c.text }]}>Formularios</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {formularios.length} formulario{formularios.length === 1 ? "" : "s"} registrados
          </Text>
        </View>

        <TouchableOpacity onPress={openCreate} style={[styles.addButton, { backgroundColor: c.primary }]}> 
          <Ionicons name="add" size={18} color={c.primaryForeground} />
          <Text style={[styles.addButtonText, { color: c.primaryForeground }]}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
        <FlatList
          data={formularios}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={[styles.tableHeader, { borderColor: c.border, backgroundColor: c.backgroundSecondary }]}> 
              <Text style={[styles.colId, { color: c.textSecondary }]}>ID</Text>
              <Text style={[styles.colForm, { color: c.textSecondary }]}>Formulario</Text>
              <Text style={[styles.colRoute, { color: c.textSecondary }]}>Ruta</Text>
              <Text style={[styles.colDesc, { color: c.textSecondary }]}>Descripción</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-text-outline" size={42} color={c.muted} />
              <Text style={{ color: c.textSecondary, marginTop: 10 }}>No hay formularios disponibles.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}> 
              <Text style={[styles.colId, { color: c.text }]}>{item.id}</Text>
              <Text style={[styles.colForm, { color: c.text }]} numberOfLines={1}>{item.formulario}</Text>
              <Text style={[styles.colRoute, { color: c.textSecondary }]} numberOfLines={1}>{item.ruta}</Text>
              <Text style={[styles.colDesc, { color: c.textSecondary }]} numberOfLines={2}>{item.descripcion ?? "—"}</Text>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} />

        <View style={styles.modalWrap} pointerEvents="box-none">
          <View style={[styles.modalCard, { backgroundColor: c.card }]}> 
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}> 
              <View>
                <Text style={[styles.modalTitle, { color: c.text }]}>Nuevo formulario</Text>
                <Text style={[styles.modalSub, { color: c.textSecondary }]}>Registra el formulario y copia el ID de respuesta</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
              <View style={styles.field}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Formulario</Text>
                <TextInput
                  value={formulario}
                  onChangeText={setFormulario}
                  placeholder="Usuarios"
                  placeholderTextColor={c.muted}
                  style={[styles.input, { borderColor: errors.formulario ? "#F43F5E" : c.border, color: c.text, backgroundColor: c.input }]}
                />
                {errors.formulario ? <Text style={styles.error}>{errors.formulario}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Ruta</Text>
                <TextInput
                  value={ruta}
                  onChangeText={setRuta}
                  placeholder="/admin/usuarios"
                  placeholderTextColor={c.muted}
                  style={[styles.input, { borderColor: errors.ruta ? "#F43F5E" : c.border, color: c.text, backgroundColor: c.input }]}
                />
                {errors.ruta ? <Text style={styles.error}>{errors.ruta}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Descripción</Text>
                <TextInput
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Gestión de usuarios"
                  placeholderTextColor={c.muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={[styles.textarea, { borderColor: c.border, color: c.text, backgroundColor: c.input }]}
                />
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: c.border }]}> 
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.secondaryButton, { borderColor: c.border }]}> 
                <Text style={{ color: c.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSubmit} disabled={saving} style={[styles.primaryButton, { backgroundColor: saving ? c.muted : c.primary }]}> 
                <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>{saving ? "Guardando..." : "Crear formulario"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { marginTop: 4, fontSize: 13 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addButtonText: { fontWeight: "700" },
  list: {
    padding: 16,
    gap: 10,
    paddingBottom: 28,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  colId: { width: 48, fontWeight: "700" },
  colForm: { flex: 1, fontWeight: "700" },
  colRoute: { flex: 1.1 },
  colDesc: { flex: 1.4 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: "800" },
  modalSub: { fontSize: 12, marginTop: 4 },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  field: { gap: 8 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 96,
  },
  error: { color: "#F43F5E", fontSize: 12 },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
  },
  primaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 12,
  },
});
