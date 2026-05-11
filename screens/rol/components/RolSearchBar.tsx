import { Ionicons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function RolSearchBar({ value, onChangeText }: Props) {
  return (
    <View className="bg-gray-50 border-b border-red-100 px-5 py-4">
      <View className="max-w-[520px] bg-white border border-red-200 rounded-lg px-3 py-2 flex-row items-center">
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Buscar por nombre o descripción..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-2 text-sm text-gray-900 outline-none"
        />
      </View>
    </View>
  );
}