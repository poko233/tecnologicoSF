import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Rol } from "../types/rol.types";
import RolCard from "./RolCard";

type Props = {
  roles: Rol[];
  loading: boolean;
  deletingId: number | null;
  onEdit: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
  isMobile: boolean;
};

export default function RolTable({
  roles,
  loading,
  deletingId,
  onEdit,
  onDelete,
  isMobile,
}: Props) {
  if (loading) {
    return (
      <View className="py-16 items-center justify-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <ThemedText className="mt-3 text-gray-500">
          Cargando roles...
        </ThemedText>
      </View>
    );
  }

  if (roles.length === 0) {
    return (
      <View className="py-16 items-center justify-center">
        <Ionicons name="shield-outline" size={42} color="#9CA3AF" />
        <ThemedText className="mt-3 text-gray-500 font-bold">
          No hay roles registrados
        </ThemedText>
      </View>
    );
  }

  if (isMobile) {
    return (
      <View className="p-4">
        {roles.map((item, index) => (
          <RolCard
            key={item.id}
            rol={item}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            deleting={deletingId === item.id}
          />
        ))}
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="min-w-[900px]">
        <View className="flex-row bg-red-50 border-b border-red-100 py-4">
          <View className="w-[80px] px-5">
            <ThemedText className="text-[11px] font-black text-red-900 uppercase">
              #
            </ThemedText>
          </View>

          <View className="w-[220px] px-5">
            <ThemedText className="text-[11px] font-black text-red-900 uppercase">
              Rol
            </ThemedText>
          </View>

          <View className="flex-1 px-5">
            <ThemedText className="text-[11px] font-black text-red-900 uppercase">
              Descripción
            </ThemedText>
          </View>

          <View className="w-[150px] px-5 items-center">
            <ThemedText className="text-[11px] font-black text-red-900 uppercase">
              Acciones
            </ThemedText>
          </View>
        </View>

        {roles.map((item, index) => {
          const numero = String(index + 1).padStart(2, "0");

          return (
            <View
              key={item.id}
              className="flex-row items-center bg-white border-b border-red-100 py-5"
            >
              <View className="w-[80px] px-5">
                <ThemedText className="text-sm font-bold text-gray-700">
                  {numero}
                </ThemedText>
              </View>

              <View className="w-[220px] px-5">
                <ThemedText className="text-sm font-black text-gray-950">
                  {item.rol}
                </ThemedText>
              </View>

              <View className="flex-1 px-5">
                <ThemedText
                  className="text-sm text-gray-600"
                  numberOfLines={1}
                >
                  {item.descripcion || "Sin descripción"}
                </ThemedText>
              </View>

              <View className="w-[150px] px-5 flex-row justify-center gap-3">
                <Pressable
                  onPress={() => onEdit(item)}
                  className="w-10 h-10 rounded-xl border border-red-200 items-center justify-center bg-white active:bg-red-50"
                >
                  <Ionicons name="pencil-outline" size={18} color="#DC2626" />
                </Pressable>

                <Pressable
                  onPress={() => onDelete(item)}
                  disabled={deletingId === item.id}
                  className="w-10 h-10 rounded-xl border border-red-200 items-center justify-center bg-white active:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#E11D48" />
                  )}
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}