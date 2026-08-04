import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { createInventarioStyles } from "../styles/inventario.styles";
import {
    CategoriaForm,
    CategoriaPayload,
    InventarioCategoria,
} from "../types/inventario.types";
import {
    CATEGORIA_FORM_INICIAL,
    categoriaFormAPayload,
} from "../utils/inventario.utils";

type Props = {
  visible: boolean;
  categoria: InventarioCategoria | null;
  guardando: boolean;
  onClose: () => void;
  onSave: (
    payload: CategoriaPayload,
    categoria?: InventarioCategoria | null,
  ) => Promise<InventarioCategoria | null>;
};

export default function CategoriaFormModal({
  visible,
  categoria,
  guardando,
  onClose,
  onSave,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(
    () => createInventarioStyles(theme.colors, width < 720, width < 1100),
    [theme.colors, width],
  );
  const [form, setForm] = useState<CategoriaForm>(CATEGORIA_FORM_INICIAL);

  useEffect(() => {
    if (!visible) return;
    setForm(
      categoria
        ? {
            nombre: categoria.nombre,
            descripcion: categoria.descripcion ?? "",
            estado: categoria.estado,
          }
        : { ...CATEGORIA_FORM_INICIAL },
    );
  }, [visible, categoria]);

  const guardar = async () => {
    if (!form.nombre.trim()) {
      Toast.show({
        type: "error",
        text1: "Nombre obligatorio",
        text2: "Ingresa el nombre de la categoría.",
      });
      return;
    }

    const resultado = await onSave(categoriaFormAPayload(form), categoria);
    if (resultado) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, styles.modalSmall]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderIcon}>
              <Ionicons name="pricetags-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.modalHeaderText}>
              <ThemedText style={styles.modalTitle}>
                {categoria ? "Editar categoría" : "Nueva categoría"}
              </ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Organiza los productos para encontrarlos y filtrarlos fácilmente.
              </ThemedText>
            </View>
            <Pressable
              disabled={guardando}
              onPress={onClose}
              style={[styles.closeButton, guardando && styles.disabled]}
            >
              <Ionicons name="close" size={23} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.formSection}>
              <View style={[styles.field, styles.fieldFull]}>
                <ThemedText style={styles.label}>Nombre *</ThemedText>
                <TextInput
                  value={form.nombre}
                  onChangeText={(nombre) => setForm((prev) => ({ ...prev, nombre }))}
                  placeholder="Ej.: Material de escritorio"
                  placeholderTextColor={
                    theme.colors.textMuted || theme.colors.textSecondary
                  }
                  style={styles.input}
                />
              </View>
              <View style={[styles.field, styles.fieldFull]}>
                <ThemedText style={styles.label}>Descripción</ThemedText>
                <TextInput
                  value={form.descripcion}
                  onChangeText={(descripcion) =>
                    setForm((prev) => ({ ...prev, descripcion }))
                  }
                  placeholder="Descripción opcional"
                  placeholderTextColor={
                    theme.colors.textMuted || theme.colors.textSecondary
                  }
                  multiline
                  style={[styles.input, styles.textArea]}
                />
              </View>
              <ThemedText style={styles.label}>Estado</ThemedText>
              <View style={styles.chips}>
                {(["ACTIVO", "INACTIVO"] as const).map((estado) => {
                  const activo = form.estado === estado;
                  return (
                    <Pressable
                      key={estado}
                      onPress={() => setForm((prev) => ({ ...prev, estado }))}
                      style={[styles.chip, activo && styles.chipActive]}
                    >
                      <ThemedText
                        style={[styles.chipText, activo && styles.chipTextActive]}
                      >
                        {estado === "ACTIVO" ? "Activada" : "Desactivada"}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Pressable
              disabled={guardando}
              onPress={onClose}
              style={[styles.cancelButton, guardando && styles.disabled]}
            >
              <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
            </Pressable>
            <Pressable
              disabled={guardando}
              onPress={() => void guardar()}
              style={[styles.saveButton, guardando && styles.disabled]}
            >
              {guardando ? (
                <ActivityIndicator color={theme.colors.primaryForeground} />
              ) : (
                <Ionicons
                  name="save-outline"
                  size={18}
                  color={theme.colors.primaryForeground}
                />
              )}
              <ThemedText style={styles.saveButtonText}>
                {guardando ? "Guardando..." : "Guardar categoría"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
