import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { reportesService } from "../services/reportes.service";
import {
  EstudianteSearchResult,
  GrupoFiltro,
  PagosFiltersState,
} from "../types/reportes.types";
import { FilterCheckbox } from "./FilterCheckbox";
import { FilterChip } from "./FilterChip";
import { FilterSelectButton } from "./FilterSelectButton";
import { RemoteSearchSelectorModal } from "./RemoteSearchSelectorModal";
import { SelectorModal } from "./SelectorModal";

interface Props {
  filters: PagosFiltersState;
  onSetTipo: (tipo: "estudiante" | "grupo") => void;
  onSetEstudiante: (id: number | null, nombre: string | null) => void;
  onSetGrupo: (id: number | null, nombre: string | null) => void;
  onSetGestion: (id: number | null) => void;
  onToggleSoloUltimoPago: () => void;
  onToggleIncluirObservaciones: () => void;
}

export function PagosForm({
  filters,
  onSetTipo,
  onSetEstudiante,
  onSetGrupo,
  onSetGestion,
  onToggleSoloUltimoPago,
  onToggleIncluirObservaciones,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [gestiones, setGestiones] = useState<any[]>([]);
  const [estudianteModalVisible, setEstudianteModalVisible] = useState(false);
  const [grupoModalVisible, setGrupoModalVisible] = useState(false);
  const [gestionModalVisible, setGestionModalVisible] = useState(false);

  // Cargar gestiones al montar
  useEffect(() => {
    const loadGestiones = async () => {
      try {
        const data = await reportesService.obtenerFiltrosPagos("", 1);
        setGestiones(data.gestiones);
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error al cargar filtros",
          text2:
            error?.message ||
            "No se pudieron cargar las gestiones. Verifica tu conexión.",
          visibilityTime: 4000,
        });
      } finally {
        setLoadingFiltros(false);
      }
    };
    loadGestiones();
  }, []);

  if (loadingFiltros) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const gestionOptions = gestiones.map((g) => ({
    id: g.id,
    label: g.nombre,
    subtitle: `${g.periodo} • ${g.anio}`,
  }));

  const estudianteText = filters.estudianteNombre || "Seleccionar estudiante";
  const grupoText = filters.grupoNombre || "Seleccionar grupo";
  const gestionText =
    filters.gestionId === null
      ? "Todas las gestiones"
      : gestiones.find((g) => g.id === filters.gestionId)?.nombre ||
        "Seleccionar";

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: 300,
          easing: (t) => t * t * (3 - 2 * t),
        }}
      >
        {/* TIPO DE REPORTE (Estudiante / Grupo) */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textSecondary }]}>
            Tipo de reporte
          </Text>
          <View style={styles.tipoRow}>
            <FilterChip
              label="Por Estudiante"
              selected={filters.tipo === "estudiante"}
              onToggle={() => onSetTipo("estudiante")}
              multiSelect={false}
              color={c.info}
            />
            <FilterChip
              label="Por Grupo"
              selected={filters.tipo === "grupo"}
              onToggle={() => onSetTipo("grupo")}
              multiSelect={false}
              color={c.success}
            />
          </View>
        </View>

        {/* SELECTOR DE ESTUDIANTE */}
        {filters.tipo === "estudiante" && (
          <>
            <FilterSelectButton
              label="Estudiante"
              selectedText={estudianteText}
              onPress={() => setEstudianteModalVisible(true)}
              isActive={filters.estudianteId !== null}
            />
            <RemoteSearchSelectorModal<EstudianteSearchResult>
              visible={estudianteModalVisible}
              title="Buscar estudiante"
              fetchItems={async (search, page, signal) => {
                const res = await reportesService.buscarEstudiantes(
                  search,
                  page,
                  15,
                  signal,
                );
                return {
                  data: res.data,
                  meta: {
                    current_page: res.current_page,
                    last_page: res.last_page,
                    total: res.total,
                  },
                  next_page_url: res.next_page_url,
                };
              }}
              onSelect={(item) => onSetEstudiante(item.id, item.nombreCompleto)}
              onClose={() => setEstudianteModalVisible(false)}
              keyExtractor={(item) => String(item.id)}
              renderItem={(item) => (
                <View>
                  <Text
                    style={[styles.itemLabel, { color: theme.colors.text }]}
                  >
                    {item.nombreCompleto}
                  </Text>
                  <Text
                    style={[
                      styles.itemSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    CI: {item.ci} • Matrícula: {item.matricula || "N/A"}
                  </Text>
                </View>
              )}
              placeholder="Buscar por CI, nombre o matrícula..."
            />
          </>
        )}

        {/* SELECTOR DE GRUPO */}
        {filters.tipo === "grupo" && (
          <>
            <FilterSelectButton
              label="Grupo"
              selectedText={grupoText}
              onPress={() => setGrupoModalVisible(true)}
              isActive={filters.grupoId !== null}
            />
            <RemoteSearchSelectorModal<GrupoFiltro>
              visible={grupoModalVisible}
              title="Buscar grupo"
              fetchItems={async (search, page, signal) => {
                const res = await reportesService.obtenerFiltrosPagos(
                  search,
                  page,
                  signal,
                );
                // ✅ CORRECCIÓN: Construimos el meta manualmente, igual que en estudiantes
                return {
                  data: res.grupos.data,
                  meta: {
                    current_page: res.grupos.current_page,
                    last_page: res.grupos.last_page,
                    total: res.grupos.total,
                  },
                  next_page_url: res.grupos.next_page_url,
                };
              }}
              onSelect={(item) =>
                onSetGrupo(item.id, `${item.nombre} - ${item.codigo}`)
              }
              onClose={() => setGrupoModalVisible(false)}
              keyExtractor={(item) => String(item.id)}
              renderItem={(item) => (
                <View>
                  <Text
                    style={[styles.itemLabel, { color: theme.colors.text }]}
                  >
                    {item.nombre} ({item.codigo})
                  </Text>
                  <Text
                    style={[
                      styles.itemSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Paralelo: {item.paralelo} • Turno: {item.turno} •{" "}
                    {item.gestion || "Sin gestión"}
                  </Text>
                </View>
              )}
              placeholder="Buscar por nombre o código del grupo..."
            />
          </>
        )}

        {/* SELECTOR DE GESTIÓN */}
        <FilterSelectButton
          label="Gestión"
          selectedText={gestionText}
          onPress={() => setGestionModalVisible(true)}
          isActive={filters.gestionId !== null}
        />
        <SelectorModal
          visible={gestionModalVisible}
          title="Seleccionar gestión"
          options={gestionOptions}
          selectedIds={filters.gestionId !== null ? [filters.gestionId] : []}
          onToggle={(id) => onSetGestion(Number(id))}
          onSelectAll={() => {
            onSetGestion(null);
            setGestionModalVisible(false);
          }}
          isAllSelected={filters.gestionId === null}
          onApply={() => setGestionModalVisible(false)}
          onClose={() => setGestionModalVisible(false)}
          multiple={false}
        />

        {/* OPCIONES EXTRAS (Checkboxes) */}
        <View style={styles.optionsRow}>
          <FilterCheckbox
            label="Solo último pago"
            checked={filters.soloUltimoPago}
            onToggle={onToggleSoloUltimoPago}
          />
          <FilterCheckbox
            label="Incluir observaciones"
            checked={filters.incluirObservaciones}
            onToggle={onToggleIncluirObservaciones}
          />
        </View>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  tipoRow: {
    flexDirection: "row",
    gap: 8,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 16,
  },
});
