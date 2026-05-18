import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import { Estudiante } from "../types/cuota.types";
import { StudentCard } from "./StudentCard";
import { StudentTableRow } from "./StudentTableRow";

interface StudentListViewProps {
  students: Estudiante[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  onSelectStudent: (student: Estudiante) => void;
  isDropdown?: boolean;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  students,
  loading,
  refreshing,
  onRefresh,
  onLoadMore,
  hasMore,
  onSelectStudent,
  isDropdown = false,
}) => {
  const { isMobile } = useResponsive();
  const { theme } = useTheme();

  if (isDropdown) {
    // Versión compacta sin headers, solo tarjetas (para móvil y desktop)
    return (
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <StudentCard
            student={item}
            onPress={onSelectStudent}
            index={index}
            compact
          />
        )}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: theme.colors.textMuted }}>
                No se encontraron estudiantes
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              style={{ padding: 10 }}
              color={theme.colors.primary}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={hasMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ paddingVertical: 8 }}
        style={{ maxHeight: 400 }}
      />
    );
  }

  if (isMobile) {
    return (
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <StudentCard student={item} onPress={onSelectStudent} index={index} />
        )}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={{ alignItems: "center", padding: 40 }}>
              <Text style={{ color: theme.colors.textMuted }}>
                No se encontraron estudiantes
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              style={{ padding: 20 }}
              color={theme.colors.primary}
            />
          ) : null
        }
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
      />
    );
  }

  // Desktop: tabla
  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: "hidden",
      }}
    >
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
        <Text style={{ flex: 2, fontWeight: "600", color: theme.colors.text }}>
          Nombre completo
        </Text>
        <Text style={{ flex: 1, fontWeight: "600", color: theme.colors.text }}>
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
        <ActivityIndicator
          style={{ padding: 20 }}
          color={theme.colors.primary}
        />
      )}
      {hasMore && !loading && students.length > 0 && (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text
            onPress={onLoadMore}
            style={{ color: theme.colors.primary, fontWeight: "500" }}
          >
            Cargar más
          </Text>
        </View>
      )}
    </View>
  );
};
