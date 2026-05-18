import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { Estudiante } from "../types/cuota.types";
import { StudentCard } from "./StudentCard";
import { StudentSearchBar } from "./StudentSearchBar";

interface CuotaMobileLayoutProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  students: Estudiante[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  onSelectStudent: (student: Estudiante) => void;
  onSearch: (term: string) => void;
}

export const CuotaMobileLayout: React.FC<CuotaMobileLayoutProps> = ({
  searchTerm,
  setSearchTerm,
  students,
  loading,
  refreshing,
  onRefresh,
  onLoadMore,
  hasMore,
  onSelectStudent,
  onSearch,
}) => {
  const { theme } = useTheme();

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <FlatList
      data={students}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <StudentCard student={item} onPress={onSelectStudent} index={index} />
      )}
      ListHeaderComponent={
        <View
          style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}
        >
          <StudentSearchBar
            onSearch={(term) => onSearch(term)}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      }
      ListEmptyComponent={
        !loading && !refreshing ? (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Text style={{ color: theme.colors.textMuted }}>
              No se encontraron estudiantes
            </Text>
          </View>
        ) : null
      }
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.3}
      contentContainerStyle={{ paddingBottom: 32 }}
      style={{ backgroundColor: theme.colors.background }}
    />
  );
};
