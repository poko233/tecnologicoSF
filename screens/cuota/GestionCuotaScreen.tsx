import React, { useState } from "react";
import {
  Keyboard,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme/useTheme";
import { StudentDetailView } from "./components/StudentDetailView";
import { StudentListView } from "./components/StudentListView";
import { StudentSearchBar } from "./components/StudentSearchBar";
import { useStudentSearch } from "./hooks/useStudentSearch";
import { cuotaService } from "./services/cuota.service";
import { Estudiante } from "./types/cuota.types";

export default function GestionCuotaScreen() {
  const { isMobile } = useResponsive();
  const { theme } = useTheme();
  const {
    students,
    loading,
    refreshing,
    searchTerm,
    setSearchTerm,
    loadMore,
    refresh,
    hasMore,
    selectedStudent,
    selectStudent,
    searchImmediately,
    resetSearch,
  } = useStudentSearch();

  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (term: string) => {
    searchImmediately(term);
    setShowDropdown(true); // abrir dropdown para mostrar resultados
  };

  // Dentro del componente, localiza la función handleSelectStudent
  const handleSelectStudent = async (student: Estudiante) => {
    setShowDropdown(false);
    resetSearch(); // ✅ Limpia resultados de búsqueda
    setLoadingDetail(true);
    setStudentDetail(null); // ✅ Limpia detalle anterior (evita mostrar datos viejos)
    try {
      const detail = await cuotaService.getStudentDetail(student.id);
      setStudentDetail(detail);
      selectStudent(student);
      Keyboard.dismiss();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "No se pudo cargar el detalle del estudiante",
      });
      // Opcional: si falla, limpia la selección
      selectStudent(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const clearSelection = () => {
    selectStudent(null);
    setStudentDetail(null);
    resetSearch(); // limpia resultados y término
    setShowDropdown(false);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  const openDropdownIfResults = () => {
    if (students.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.background,
            zIndex: 10,
          }}
        >
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              gap: 16,
              maxWidth: 1400,
              alignSelf: "center",
              width: "100%",
              position: "relative",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: isMobile ? 24 : 28,
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                Instituto Tecnológico del Sur
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginTop: 4,
                }}
              >
                Gestión de Matrículas y Cuotas
              </Text>
            </View>
            <View
              style={{
                width: isMobile ? "100%" : 320,
                position: "relative",
                zIndex: 20,
              }}
            >
              <StudentSearchBar
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSearch={handleSearch}
                onFocus={openDropdownIfResults}
                isLoading={loading}
                placeholder="Buscar por CI, nombre o matrícula..."
              />
              {showDropdown && (students.length > 0 || loading) && (
                <View
                  style={{
                    position: "absolute",
                    top: 50,
                    left: 0,
                    right: 0,
                    backgroundColor: theme.colors.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    maxHeight: 400,
                    zIndex: 30,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                    overflow: "hidden",
                  }}
                >
                  <StudentListView
                    students={students}
                    loading={loading}
                    refreshing={refreshing}
                    onRefresh={() => {
                      refresh();
                      setShowDropdown(true);
                    }}
                    onLoadMore={loadMore}
                    hasMore={hasMore}
                    onSelectStudent={handleSelectStudent}
                    isDropdown={true}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Contenido principal */}
        <View style={{ flex: 1 }}>
          {selectedStudent && studentDetail ? (
            <StudentDetailView
              student={selectedStudent}
              detail={studentDetail}
            />
          ) : loadingDetail ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.textSecondary }}>
                Cargando detalle...
              </Text>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                }}
              >
                🔍 Busca un estudiante por CI, nombre o matrícula
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.textMuted,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Los resultados aparecerán aquí debajo del buscador.
              </Text>
            </View>
          )}
        </View>

        {/* Botón flotante para limpiar selección y volver a buscar */}
        {selectedStudent && (
          <Pressable
            onPress={clearSelection}
            style={{
              position: "absolute",
              bottom: 24,
              right: 24,
              backgroundColor: theme.colors.primary,
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
              ✕
            </Text>
          </Pressable>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
