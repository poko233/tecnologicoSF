import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

type Props = {
  onCreate: () => void;
};

export default function RolHeader({ onCreate }: Props) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-4">
        <Ionicons name="home-outline" size={14} color="#991B1B" />
        <ThemedText className="text-xs text-gray-500">Inicio</ThemedText>
        <Ionicons name="chevron-forward" size={12} color="#9CA3AF" />
        <ThemedText className="text-xs text-gray-500">Perfil Empresa</ThemedText>
        <Ionicons name="chevron-forward" size={12} color="#9CA3AF" />
        <ThemedText className="text-xs font-bold text-red-600">
          Roles y Módulos
        </ThemedText>
      </View>

      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <ThemedText className="text-3xl font-black text-gray-950">
            Gestión de Roles y Permisos
          </ThemedText>

          <ThemedText className="mt-2 text-sm text-red-900/70">
            Niveles de acceso para el personal institucional.
          </ThemedText>
        </View>

        <Pressable
          onPress={onCreate}
          className="bg-red-600 px-5 py-3 rounded-xl flex-row items-center gap-2 shadow-sm active:opacity-80"
        >
          <Ionicons name="add-circle-outline" size={19} color="white" />
          <ThemedText className="text-white font-black">Nuevo Rol</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}