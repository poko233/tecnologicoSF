import { ThemeSelector } from "@/components/ThemeSelector";
import React, { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme/useTheme";
import { CarrerasList } from "./components/CarrerasList";
import { CuotasTable } from "./components/CuotasTable";
import { StudentListView } from "./components/StudentListView";
import { StudentSearchBar } from "./components/StudentSearchBar";
import { StudentSummaryHeader } from "./components/StudentSummaryHeader";
import { useCarreraCuotas } from "./hooks/useCarreraCuotas";
import { useStudentCarreras } from "./hooks/useStudentCarreras";
import { useStudentSearch } from "./hooks/useStudentSearch";
import { Estudiante } from "./types/cuota.types";

export default function GestionCuotaScreen() {
  const { isMobile } = useResponsive();
  const { theme } = useTheme();
  const {
    students,
    loading: searchLoading,
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

  const [showDropdown, setShowDropdown] = useState(false);
  const {
    carreras,
    loading: carrerasLoading,
    selectedCarrera,
    setSelectedCarrera,
  } = useStudentCarreras(selectedStudent?.id || null);
  const {
    cuotas,
    loading: cuotasLoading,
    loadCuotas,
  } = useCarreraCuotas(
    selectedStudent?.id || null,
    selectedCarrera?.idCarrera || null,
  );

  const handleSelectStudent = (student: Estudiante) => {
    selectStudent(student);
    setShowDropdown(false);
    resetSearch();
  };

  const handleRefresh = () => {
    if (selectedStudent) loadCuotas();
    else refresh();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Cabecera con buscador (siempre visible) */}
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
          }}
        >
          <ThemeSelector />
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
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
              Gestión de Pagos por Carrera
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
              onSearch={() => searchImmediately(searchTerm)}
              onFocus={() => setShowDropdown(true)}
              isLoading={searchLoading}
            />
            {showDropdown && (students.length > 0 || searchLoading) && (
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
                  zIndex: 1000,
                  overflow: "hidden",
                  shadowColor: theme.colors.text,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <StudentListView
                  students={students}
                  loading={searchLoading}
                  refreshing={refreshing}
                  onRefresh={() => {
                    refresh();
                    setShowDropdown(true);
                  }}
                  onLoadMore={loadMore}
                  hasMore={hasMore}
                  onSelectStudent={handleSelectStudent}
                  isDropdown
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Contenido principal (scrollable) */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing || carrerasLoading || cuotasLoading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 24 }}
      >
        {!selectedStudent ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: theme.colors.backgroundSecondary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 48 }}>🔍</Text>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.colors.text,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Buscar Estudiante
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                textAlign: "center",
              }}
            >
              Utilice la barra de búsqueda superior para encontrar un estudiante
              por nombre, CI o matrícula y gestionar sus pagos.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 24 }}>
            {/* Student Header */}
            <StudentSummaryHeader student={selectedStudent} />

            {/* Carreras Inscritas (horizontal scroll) */}
            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: theme.colors.textSecondary,
                  marginBottom: 12,
                }}
              >
                Carreras Inscritas
              </Text>
              <CarrerasList
                carreras={carreras}
                selectedCarrera={selectedCarrera}
                onSelectCarrera={setSelectedCarrera}
                loading={carrerasLoading}
              />
            </View>

            {/* Filtros y tabla de cuotas */}
            <CuotasTable
              cuotas={cuotas}
              loading={cuotasLoading}
              carrera={selectedCarrera}
              onRefresh={loadCuotas}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
