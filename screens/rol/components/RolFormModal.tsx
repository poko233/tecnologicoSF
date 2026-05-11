import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    TextInput,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { Rol, RolPayload } from "../types/rol.types";

type Props = {
  visible: boolean;
  rol?: Rol | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: RolPayload) => Promise<boolean>;
};

export default function RolFormModal({
  visible,
  rol,
  saving,
  onClose,
  onSave,
}: Props) {
  const [nombreRol, setNombreRol] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const isEditing = !!rol;

  useEffect(() => {
    if (visible) {
      setNombreRol(rol?.rol ?? "");
      setDescripcion(rol?.descripcion ?? "");
    }
  }, [visible, rol]);

  const handleSave = async () => {
    if (!nombreRol.trim()) {
      Toast.show({
        type: "error",
        text1: "Campo requerido",
        text2: "El nombre del rol es obligatorio",
      });
      return;
    }

    const ok = await onSave({
      rol: nombreRol.trim(),
      descripcion: descripcion.trim() || null,
    });

    if (ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center px-4">
        <View className="bg-white w-full max-w-[520px] rounded-3xl overflow-hidden">
          <View className="px-6 py-5 border-b border-red-100 flex-row items-center justify-between">
            <View>
              <ThemedText className="text-xl font-black text-gray-950">
                {isEditing ? "Editar Rol" : "Nuevo Rol"}
              </ThemedText>
              <ThemedText className="text-sm text-gray-500 mt-1">
                Completa los datos del rol.
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              disabled={saving}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#111827" />
            </Pressable>
          </View>

          <View className="px-6 py-5">
            <ThemedText className="text-sm font-bold text-gray-700 mb-2">
              Nombre del rol
            </ThemedText>

            <TextInput
              value={nombreRol}
              onChangeText={setNombreRol}
              placeholder="Ej: Administrador"
              placeholderTextColor="#9CA3AF"
              className="border border-red-200 rounded-xl px-4 py-3 text-gray-900 mb-4 outline-none"
            />

            <ThemedText className="text-sm font-bold text-gray-700 mb-2">
              Descripción
            </ThemedText>

            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Ej: Acceso completo al sistema"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="border border-red-200 rounded-xl px-4 py-3 text-gray-900 min-h-[110px] outline-none"
            />
          </View>

          <View className="px-6 py-5 border-t border-red-100 flex-row justify-end gap-3">
            <Pressable
              onPress={onClose}
              disabled={saving}
              className="px-5 py-3 rounded-xl border border-gray-200 bg-white disabled:opacity-50"
            >
              <ThemedText className="font-bold text-gray-700">
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-red-600 flex-row items-center gap-2 disabled:opacity-50"
            >
              {saving && <ActivityIndicator size="small" color="white" />}

              <ThemedText className="font-black text-white">
                {isEditing ? "Guardar cambios" : "Crear rol"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}