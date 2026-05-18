import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { Estudiante } from "../types/cuota.types";
import { StudentSearchBar } from "./StudentSearchBar";
import { StudentTableRow } from "./StudentTableRow";

interface CuotaDesktopLayoutProps {
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

export const CuotaDesktopLayout: React.FC<CuotaDesktopLayoutProps> = ({
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

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
      contentContainerStyle={{ padding: 24 }}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View style={{ maxWidth: 1200, alignSelf: "center", width: "100%" }}>
        <View style={{ marginBottom: 24 }}>
          <StudentSearchBar
            onSearch={(term) => onSearch(term)}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <View
            style={{
              flexDirection: "row",
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: theme.colors.backgroundSecondary,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Text
              style={{ flex: 2, fontWeight: "600", color: theme.colors.text }}
            >
              Nombre completo
            </Text>
            <Text
              style={{ flex: 1, fontWeight: "600", color: theme.colors.text }}
            >
              CI
            </Text>
            <Text
              style={{ flex: 1.5, fontWeight: "600", color: theme.colors.text }}
            >
              Matrícula
            </Text>
            <View style={{ flex: 0.5 }} />
          </View>

          {students.map((student, idx) => (
            <StudentTableRow
              key={student.id}
              student={student}
              onPress={onSelectStudent}
              isEven={idx % 2 === 1}
            />
          ))}

          {students.length === 0 && !loading && !refreshing && (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: theme.colors.textMuted }}>
                No se encontraron estudiantes
              </Text>
            </View>
          )}

          {loading && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          )}

          {hasMore && !loading && students.length > 0 && (
            <View style={{ padding: 16, alignItems: "center" }}>
              <Text
                onPress={onLoadMore}
                style={{
                  color: theme.colors.primary,
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Cargar más
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};
