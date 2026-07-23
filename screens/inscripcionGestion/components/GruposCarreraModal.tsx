import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    View,
    useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { styles } from "../styles/inscripcionGestion.styles";
import {
    CarreraIG,
    DetalleGruposCarreraIGResponse,
    EstadoAsignacionGrupoIG,
    GrupoCarreraIG,
} from "../types/inscripcionGestion.types";
import { textoGestionIG } from "../utils/inscripcionGestion.utils";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type FiltroGrupo =
  | "todos"
  | "en_gestion"
  | "movible"
  | "bloqueado"
  | "inactivo";

type Props = {
  visible: boolean;
  loading: boolean;
  carreraFallback: CarreraIG | null;
  detalle: DetalleGruposCarreraIGResponse | null;
  onClose: () => void;
};

const FILTROS: Array<{
  value: FiltroGrupo;
  label: string;
  icon: IoniconName;
}> = [
  { value: "todos", label: "Todos", icon: "albums-outline" },
  { value: "bloqueado", label: "Conflictos", icon: "warning-outline" },
  { value: "movible", label: "Movibles", icon: "swap-horizontal-outline" },
  { value: "en_gestion", label: "En esta gestión", icon: "checkmark-done-outline" },
  { value: "inactivo", label: "Inactivos", icon: "ban-outline" },
];

export default function GruposCarreraModal({
  visible,
  loading,
  carreraFallback,
  detalle,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [filtro, setFiltro] = useState<FiltroGrupo>("todos");

  useEffect(() => {
    if (visible) {
      setFiltro("todos");
    }
  }, [visible, detalle?.carrera?.idCarrera]);

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const border = isDark ? "rgba(255,255,255,0.11)" : "rgba(15,23,42,0.12)";
  const soft = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.035)";
  const primarySoft = isDark ? "rgba(59,130,246,0.18)" : "#DBEAFE";

  const green = isDark ? "#86EFAC" : "#15803D";
  const greenSoft = isDark ? "rgba(34,197,94,0.15)" : "#DCFCE7";
  const red = isDark ? "#FCA5A5" : "#DC2626";
  const redSoft = isDark ? "rgba(239,68,68,0.14)" : "#FEE2E2";
  const yellow = isDark ? "#FDE68A" : "#A16207";
  const yellowSoft = isDark ? "rgba(234,179,8,0.14)" : "#FEF9C3";
  const gray = isDark ? "#CBD5E1" : "#475569";
  const graySoft = isDark ? "rgba(148,163,184,0.12)" : "#F1F5F9";

  const carreraNombre =
    detalle?.carrera?.nombreCarrera ??
    carreraFallback?.nombreCarrera ??
    "Carrera";

  const gruposFiltrados = useMemo(() => {
    const grupos = Array.isArray(detalle?.grupos) ? detalle!.grupos : [];

    if (filtro === "todos") return grupos;

    return grupos.filter((grupo) => grupo.estadoAsignacion === filtro);
  }, [detalle?.grupos, filtro]);

  const getStatus = (estado: EstadoAsignacionGrupoIG) => {
    switch (estado) {
      case "en_gestion":
        return {
          label: "En esta gestión",
          color: green,
          bg: greenSoft,
          icon: "checkmark-done-outline" as const,
        };
      case "movible":
        return {
          label: "Puede moverse",
          color: theme.colors.primary,
          bg: primarySoft,
          icon: "swap-horizontal-outline" as const,
        };
      case "bloqueado":
        return {
          label: "Conflicto activo",
          color: red,
          bg: redSoft,
          icon: "lock-closed-outline" as const,
        };
      case "inactivo":
        return {
          label: "Grupo inactivo",
          color: gray,
          bg: graySoft,
          icon: "ban-outline" as const,
        };
      default:
        return {
          label: "Sin clasificar",
          color: yellow,
          bg: yellowSoft,
          icon: "help-circle-outline" as const,
        };
    }
  };

  const renderGrupo = (grupo: GrupoCarreraIG) => {
    const status = getStatus(grupo.estadoAsignacion);
    const gestionActual = grupo.gestionActual?.texto ?? "Sin gestión registrada";

    return (
      <View
        key={grupo.idGrupo}
        style={[
          styles.groupDetailCard,
          {
            backgroundColor: soft,
            borderColor: status.color,
          },
        ]}
      >
        <View style={[styles.groupDetailHeader, isMobile && styles.groupDetailHeaderMobile]}>
          <View style={styles.groupDetailTitleBox}>
            <View
              style={[
                styles.groupDetailIcon,
                { backgroundColor: status.bg },
              ]}
            >
              <Ionicons name={status.icon} size={22} color={status.color} />
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <ThemedText
                numberOfLines={2}
                style={[styles.groupDetailTitle, { color: strongText }]}
              >
                {grupo.nombreGrupo}
              </ThemedText>

              <ThemedText
                numberOfLines={2}
                style={[styles.groupDetailMeta, { color: mutedText }]}
              >
                {grupo.codigoGrupo || "Sin código"} · Paralelo {grupo.paralelo || "—"} · {grupo.turno || "Sin turno"} · {grupo.cupos} cupos
              </ThemedText>
            </View>
          </View>

          <View style={[styles.groupStatusBadge, { backgroundColor: status.bg }]}> 
            <ThemedText style={[styles.groupStatusText, { color: status.color }]}> 
              {status.label}
            </ThemedText>
          </View>
        </View>

        <View style={styles.groupManagementGrid}>
          <View
            style={[
              styles.groupManagementBox,
              { backgroundColor: graySoft, borderColor: border },
            ]}
          >
            <ThemedText style={[styles.groupManagementLabel, { color: mutedText }]}> 
              Gestión actual
            </ThemedText>
            <ThemedText style={[styles.groupManagementValue, { color: strongText }]}> 
              {gestionActual}
            </ThemedText>
          </View>

          <View
            style={[
              styles.groupManagementBox,
              { backgroundColor: primarySoft, borderColor: theme.colors.primary },
            ]}
          >
            <ThemedText
              style={[styles.groupManagementLabel, { color: theme.colors.primary }]}
            >
              Gestión seleccionada
            </ThemedText>
            <ThemedText
              style={[styles.groupManagementValue, { color: theme.colors.primary }]}
            >
              {grupo.gestionDestinoTexto}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.groupReasonBox,
            {
              backgroundColor: grupo.conflicto ? redSoft : status.bg,
              borderColor: grupo.conflicto ? red : status.color,
            },
          ]}
        >
          <Ionicons
            name={grupo.conflicto ? "warning-outline" : "information-circle-outline"}
            size={19}
            color={grupo.conflicto ? red : status.color}
          />
          <ThemedText
            style={[
              styles.groupReasonText,
              { color: grupo.conflicto ? red : status.color },
            ]}
          >
            {grupo.motivo}
          </ThemedText>
        </View>

        <View style={styles.groupSection}>
          <ThemedText style={[styles.groupSectionTitle, { color: strongText }]}> 
            Materias de {carreraNombre} en este grupo ({grupo.totalMateriasCarrera})
          </ThemedText>

          <View style={styles.groupChipList}>
            {grupo.materiasCarrera.map((materia) => (
              <View
                key={`${grupo.idGrupo}-${materia.idGrupoMateriaDocente}`}
                style={[
                  styles.groupChip,
                  { backgroundColor: primarySoft, borderColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="book-outline" size={14} color={theme.colors.primary} />
                <ThemedText
                  numberOfLines={1}
                  style={[styles.groupChipText, { color: theme.colors.primary }]}
                >
                  {materia.nombreMateria}
                  {materia.semestre ? ` · Nivel ${materia.semestre}` : ""}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.groupSection}>
          <ThemedText style={[styles.groupSectionTitle, { color: strongText }]}> 
            Carreras relacionadas con el grupo ({grupo.carrerasRelacionadas.length})
          </ThemedText>

          <View style={styles.groupChipList}>
            {grupo.carrerasRelacionadas.map((carrera) => {
              const compatible = carrera.compatibleConGestionDestino;
              return (
                <View
                  key={`${grupo.idGrupo}-carrera-${carrera.idCarrera}`}
                  style={[
                    styles.groupChip,
                    {
                      backgroundColor: compatible ? greenSoft : redSoft,
                      borderColor: compatible ? green : red,
                    },
                  ]}
                >
                  <Ionicons
                    name={compatible ? "school-outline" : "warning-outline"}
                    size={14}
                    color={compatible ? green : red}
                  />
                  <ThemedText
                    numberOfLines={1}
                    style={[
                      styles.groupChipText,
                      { color: compatible ? green : red },
                    ]}
                  >
                    {carrera.nombreCarrera}
                    {carrera.codigo ? ` · ${carrera.codigo}` : ""}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        {grupo.grupoCompartido && (
          <View
            style={[
              styles.groupReasonBox,
              { backgroundColor: yellowSoft, borderColor: yellow },
            ]}
          >
            <Ionicons name="git-compare-outline" size={19} color={yellow} />
            <ThemedText style={[styles.groupReasonText, { color: yellow }]}> 
              {grupo.advertenciaCompartido} Otras carreras: {grupo.otrasCarrerasRelacionadas
                .map((item) => item.nombreCarrera)
                .join(", ")}.
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: border,
            },
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: border }]}> 
            <View style={styles.modalHeaderTitleBox}>
              <View style={[styles.modalHeaderIcon, { backgroundColor: primarySoft }]}> 
                <Ionicons name="albums-outline" size={25} color={theme.colors.primary} />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <ThemedText
                  numberOfLines={1}
                  style={[styles.modalTitle, { color: strongText }]}
                >
                  Grupos de {carreraNombre}
                </ThemedText>
                <ThemedText
                  numberOfLines={2}
                  style={[styles.modalSubtitle, { color: mutedText }]}
                >
                  {detalle?.gestionDestino
                    ? `Comparación con ${textoGestionIG(detalle.gestionDestino)}`
                    : "Revisando gestión actual, grupos compartidos y conflictos."}
                </ThemedText>
              </View>
            </View>

            <Pressable
              disabled={loading}
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalCloseButton,
                {
                  backgroundColor: graySoft,
                  borderColor: border,
                  opacity: loading ? 0.45 : pressed ? 0.72 : 1,
                },
              ]}
            >
              <Ionicons name="close" size={24} color={strongText} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.modalLoadingPanel}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <ThemedText style={[styles.loadingTitle, { color: strongText }]}> 
                Analizando grupos
              </ThemedText>
              <ThemedText style={[styles.loadingText, { color: mutedText }]}> 
                Identificando grupos en la gestión, grupos movibles, conflictos activos y carreras relacionadas.
              </ThemedText>
            </View>
          ) : !detalle ? (
            <View style={styles.modalLoadingPanel}>
              <Ionicons name="alert-circle-outline" size={42} color={red} />
              <ThemedText style={[styles.loadingTitle, { color: strongText }]}> 
                No se pudo cargar el detalle
              </ThemedText>
              <ThemedText style={[styles.loadingText, { color: mutedText }]}> 
                Cierra esta ventana y vuelve a intentar.
              </ThemedText>
            </View>
          ) : (
            <>
              <View style={[styles.modalSummary, { borderBottomColor: border }]}> 
                <View style={styles.modalSummaryGrid}>
                  <View style={[styles.modalSummaryBox, { backgroundColor: graySoft, borderColor: border }]}> 
                    <ThemedText style={[styles.modalSummaryNumber, { color: strongText }]}> 
                      {detalle.resumen.totalGrupos}
                    </ThemedText>
                    <ThemedText style={[styles.modalSummaryLabel, { color: mutedText }]}> 
                      Total grupos
                    </ThemedText>
                  </View>
                  <View style={[styles.modalSummaryBox, { backgroundColor: greenSoft, borderColor: green }]}> 
                    <ThemedText style={[styles.modalSummaryNumber, { color: green }]}> 
                      {detalle.resumen.gruposEnGestion}
                    </ThemedText>
                    <ThemedText style={[styles.modalSummaryLabel, { color: green }]}> 
                      En esta gestión
                    </ThemedText>
                  </View>
                  <View style={[styles.modalSummaryBox, { backgroundColor: primarySoft, borderColor: theme.colors.primary }]}> 
                    <ThemedText style={[styles.modalSummaryNumber, { color: theme.colors.primary }]}> 
                      {detalle.resumen.gruposMovibles}
                    </ThemedText>
                    <ThemedText style={[styles.modalSummaryLabel, { color: theme.colors.primary }]}> 
                      Se pueden mover
                    </ThemedText>
                  </View>
                  <View style={[styles.modalSummaryBox, { backgroundColor: redSoft, borderColor: red }]}> 
                    <ThemedText style={[styles.modalSummaryNumber, { color: red }]}> 
                      {detalle.resumen.gruposBloqueados}
                    </ThemedText>
                    <ThemedText style={[styles.modalSummaryLabel, { color: red }]}> 
                      Conflictos activos
                    </ThemedText>
                  </View>
                  <View style={[styles.modalSummaryBox, { backgroundColor: yellowSoft, borderColor: yellow }]}> 
                    <ThemedText style={[styles.modalSummaryNumber, { color: yellow }]}> 
                      {detalle.resumen.gruposCompartidos}
                    </ThemedText>
                    <ThemedText style={[styles.modalSummaryLabel, { color: yellow }]}> 
                      Grupos compartidos
                    </ThemedText>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalFilters}> 
                  {FILTROS.map((item) => {
                    const selected = filtro === item.value;
                    return (
                      <Pressable
                        key={item.value}
                        onPress={() => setFiltro(item.value)}
                        style={({ pressed }) => [
                          styles.modalFilterButton,
                          {
                            backgroundColor: selected ? primarySoft : soft,
                            borderColor: selected ? theme.colors.primary : border,
                            opacity: pressed ? 0.72 : 1,
                          },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={16}
                          color={selected ? theme.colors.primary : mutedText}
                        />
                        <ThemedText
                          style={[
                            styles.modalFilterText,
                            { color: selected ? theme.colors.primary : mutedText },
                          ]}
                        >
                          {item.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <ScrollView
                style={styles.modalBodyScroll}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator
              >
                {gruposFiltrados.length === 0 ? (
                  <View style={styles.modalEmptyPanel}>
                    <Ionicons name="file-tray-outline" size={42} color={mutedText} />
                    <ThemedText style={[styles.emptyTitle, { color: strongText }]}> 
                      No hay grupos en este filtro
                    </ThemedText>
                    <ThemedText style={[styles.emptyText, { color: mutedText }]}> 
                      Cambia el filtro para revisar los demás grupos de la carrera.
                    </ThemedText>
                  </View>
                ) : (
                  gruposFiltrados.map(renderGrupo)
                )}
              </ScrollView>
            </>
          )}

          <View style={[styles.modalFooter, { borderTopColor: border }]}> 
            <ThemedText style={[styles.modalFooterText, { color: mutedText }]}> 
              Los conflictos rojos pertenecen a otra gestión activa y no se moverán.
            </ThemedText>
            <Pressable
              disabled={loading}
              onPress={onClose}
              style={({ pressed }) => [
                styles.buttonPrimary,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                  opacity: loading ? 0.45 : pressed ? 0.74 : 1,
                },
              ]}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}> 
                Entendido
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
