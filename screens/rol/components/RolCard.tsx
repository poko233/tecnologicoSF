import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Rol } from "../types/rol.types";

type Props = {
  rol: Rol;
  index: number;
  onEdit: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
  deleting?: boolean;
};

export default function RolCard({
  rol,
  index,
  onEdit,
  onDelete,
  deleting = false,
}: Props) {
  const numero = String(index + 1).padStart(2, "0");

  return (
    <View className="bg-white border border-red-100 rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start gap-3">
        <View className="flex-1">
          <ThemedText className="text-xs font-bold text-gray-400 mb-1">
            #{numero}
          </ThemedText>

          <ThemedText className="text-base font-black text-gray-950">
            {rol.rol}
          </ThemedText>

          <ThemedText
            className="text-sm text-gray-600 mt-2"
            numberOfLines={2}
          >
            {rol.descripcion || "Sin descripción"}
          </ThemedText>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => onEdit(rol)}
            className="w-10 h-10 rounded-xl border border-red-200 items-center justify-center bg-white active:bg-red-50"
          >
            <Ionicons name="pencil-outline" size={18} color="#DC2626" />
          </Pressable>

          <Pressable
            onPress={() => onDelete(rol)}
            disabled={deleting}
            className="w-10 h-10 rounded-xl border border-red-200 items-center justify-center bg-white active:bg-red-50 disabled:opacity-50"
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Ionicons name="trash-outline" size={18} color="#E11D48" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}